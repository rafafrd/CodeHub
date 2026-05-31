import { Pool } from "mysql2/promise";

import { MySqlSnippetRepository } from "./snippet-repository";

function makePoolMock(): { pool: Pool; execute: jest.Mock } {
  const execute = jest.fn().mockResolvedValue([[], []]);
  const pool = { execute } as unknown as Pool;
  return { pool, execute };
}

describe("MySqlSnippetRepository", () => {
  describe("create", () => {
    it("deve inserir os metadados e retornar o insertId", async () => {
      const { pool, execute } = makePoolMock();
      execute.mockResolvedValueOnce([{ insertId: 42 }, []]);
      const repository = new MySqlSnippetRepository(pool);

      const id = await repository.create({
        title: "Docker Compose Base",
        description: null,
        typeId: 2,
      });

      expect(id).toBe(42);
      const [sql, params] = execute.mock.calls[0];
      expect(sql).toContain("INSERT INTO snippets");
      expect(params).toEqual(["Docker Compose Base", null, 2]);
    });
  });

  describe("attachTags", () => {
    it("não deve executar query quando não há tags", async () => {
      const { pool, execute } = makePoolMock();
      const repository = new MySqlSnippetRepository(pool);

      await repository.attachTags(1, []);

      expect(execute).not.toHaveBeenCalled();
    });

    it("deve montar um bulk insert com os pares (snippet_id, tag_id)", async () => {
      const { pool, execute } = makePoolMock();
      const repository = new MySqlSnippetRepository(pool);

      await repository.attachTags(10, [3, 5]);

      const [sql, params] = execute.mock.calls[0];
      expect(sql).toContain("INSERT INTO snippet_tags");
      expect(sql).toContain("(?, ?), (?, ?)");
      expect(params).toEqual([10, 3, 10, 5]);
    });
  });

  describe("list", () => {
    it("deve combinar filtros de tag, tipo e busca na cláusula WHERE", async () => {
      const { pool, execute } = makePoolMock();
      const repository = new MySqlSnippetRepository(pool);

      await repository.list({ typeId: 2, tagId: 5, search: "headers" });

      const [sql, params] = execute.mock.calls[0];
      expect(sql).toContain("INNER JOIN snippet_tags");
      expect(sql).toContain("st.tag_id = ?");
      expect(sql).toContain("s.type_id = ?");
      expect(sql).toContain("LIKE ?");
      expect(params).toEqual([5, 2, "%headers%", "%headers%"]);
    });

    it("deve mapear a linha do banco para o domínio (snake_case -> camelCase)", async () => {
      const { pool, execute } = makePoolMock();
      const createdAt = new Date("2026-05-30T00:00:00Z");
      execute.mockResolvedValueOnce([
        [
          {
            id: 1,
            title: "Snippet",
            description: null,
            file_path: "1.md",
            type_id: 2,
            created_at: createdAt,
          },
        ],
        [],
      ]);
      const repository = new MySqlSnippetRepository(pool);

      const [snippet] = await repository.list();

      expect(snippet).toEqual({
        id: 1,
        title: "Snippet",
        description: null,
        filePath: "1.md",
        typeId: 2,
        createdAt,
      });
    });
  });

  describe("findById", () => {
    it("deve retornar null quando não encontrar o snippet", async () => {
      const { pool } = makePoolMock();
      const repository = new MySqlSnippetRepository(pool);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });
});
