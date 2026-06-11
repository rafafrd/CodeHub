import Database from "better-sqlite3";

import { runMigrations } from "../../../database/sqlite";
import { SqliteSnippetRepository } from "./snippet-repository";

/**
 * Teste de INTEGRAÇÃO real: SQLite em memória com as migrations aplicadas
 * (schema + seeds de tipos/pastas/conquistas). Sem mocks de banco.
 */
describe("SqliteSnippetRepository (integração :memory:)", () => {
  let db: Database.Database;
  let repository: SqliteSnippetRepository;

  beforeEach(() => {
    db = new Database(":memory:");
    db.pragma("foreign_keys = ON");
    runMigrations(db);
    repository = new SqliteSnippetRepository(() => db);
  });

  afterEach(() => db.close());

  async function createSample(title = "Nginx Headers"): Promise<number> {
    return repository.create({
      title,
      description: "Headers OWASP",
      typeId: 6, // Config de Servidor (seed)
      folderId: 4, // Infraestrutura > Nginx (seed)
    });
  }

  it("cria e lê um snippet (insert + mapeamento snake_case -> camelCase)", async () => {
    const id = await createSample();

    const found = await repository.findById(id);

    expect(found).not.toBeNull();
    expect(found?.title).toBe("Nginx Headers");
    expect(found?.typeId).toBe(6);
    expect(found?.folderId).toBe(4);
    expect(found?.filePath).toBeNull();
    expect(found?.createdAt).toBeInstanceOf(Date);
  });

  it("atualiza o file_path após a materialização do .md", async () => {
    const id = await createSample();

    await repository.updateFilePath(id, `${id}.md`);

    expect((await repository.findById(id))?.filePath).toBe(`${id}.md`);
  });

  it("vincula, substitui tags e filtra por tag", async () => {
    const tagA = Number(
      db.prepare("INSERT INTO tags (name) VALUES ('nginx')").run()
        .lastInsertRowid,
    );
    const tagB = Number(
      db.prepare("INSERT INTO tags (name) VALUES ('security')").run()
        .lastInsertRowid,
    );
    const id = await createSample();

    await repository.attachTags(id, [tagA]);
    expect(await repository.list({ tagId: tagA })).toHaveLength(1);

    await repository.replaceTags(id, [tagB]);
    expect(await repository.list({ tagId: tagA })).toHaveLength(0);
    expect(await repository.list({ tagId: tagB })).toHaveLength(1);
  });

  it("filtra por pasta, tipo e busca textual combinados", async () => {
    await createSample("Compose base"); // typeId 6, folder 4
    const other = await repository.create({
      title: "Regex de e-mail",
      description: null,
      typeId: 10, // Regex (seed)
      folderId: null,
    });

    const byFolder = await repository.list({ folderId: 4 });
    expect(byFolder.map((s) => s.title)).toEqual(["Compose base"]);

    const bySearch = await repository.list({ search: "regex" });
    expect(bySearch.map((s) => s.id)).toEqual([other]);

    const byTypeAndSearch = await repository.list({ typeId: 6, search: "compose" });
    expect(byTypeAndSearch).toHaveLength(1);
  });

  it("delete remove o registro e o pivô em cascata", async () => {
    const tag = Number(
      db.prepare("INSERT INTO tags (name) VALUES ('x')").run().lastInsertRowid,
    );
    const id = await createSample();
    await repository.attachTags(id, [tag]);

    await repository.delete(id);

    expect(await repository.findById(id)).toBeNull();
    const pivot = db
      .prepare("SELECT COUNT(*) AS n FROM snippet_tags WHERE snippet_id = ?")
      .get(id) as { n: number };
    expect(pivot.n).toBe(0);
  });
});
