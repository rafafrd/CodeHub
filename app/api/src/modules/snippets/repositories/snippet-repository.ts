import { GetDb } from "../../../database/sqlite";
import { Snippet } from "../models/snippet";

/** Dados de criação (metadados; `file_path` é preenchido depois). */
export interface CreateSnippetRecord {
  title: string;
  description: string | null;
  typeId: number;
  folderId: number | null;
}

/** Dados de atualização de metadados. */
export interface UpdateSnippetRecord {
  title: string;
  description: string | null;
  typeId: number;
}

/** Filtros opcionais de listagem (CU02: por tipo, tag, pasta ou busca). */
export interface SnippetListFilters {
  typeId?: number;
  tagId?: number;
  folderId?: number;
  search?: string;
}

/**
 * Contrato do repositório de metadados (SQLite), implementado por
 * `SqliteSnippetRepository`. Os Services dependem desta interface (mock no TDD).
 * A orquestração `create -> grava .md -> updateFilePath -> attachTags` é
 * responsabilidade do Service.
 */
export interface SnippetRepository {
  create(data: CreateSnippetRecord): Promise<number>;
  updateFilePath(id: number, filePath: string): Promise<void>;
  attachTags(snippetId: number, tagIds: number[]): Promise<void>;
  update(id: number, data: UpdateSnippetRecord): Promise<void>;
  replaceTags(snippetId: number, tagIds: number[]): Promise<void>;
  findById(id: number): Promise<Snippet | null>;
  list(filters?: SnippetListFilters): Promise<Snippet[]>;
  delete(id: number): Promise<void>;
}

interface SnippetRow {
  id: number;
  title: string;
  description: string | null;
  file_path: string | null;
  type_id: number;
  folder_id: number | null;
  created_at: string;
}

/** Converte "YYYY-MM-DD HH:MM:SS" (UTC, padrão do SQLite) em Date. */
function toDate(value: string): Date {
  return new Date(`${value.replace(" ", "T")}Z`);
}

function toDomain(row: SnippetRow): Snippet {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    filePath: row.file_path,
    typeId: row.type_id,
    folderId: row.folder_id,
    createdAt: toDate(row.created_at),
  };
}

export class SqliteSnippetRepository implements SnippetRepository {
  constructor(private readonly db: GetDb) {}

  async create(data: CreateSnippetRecord): Promise<number> {
    const info = this.db()
      .prepare(
        "INSERT INTO snippets (title, description, type_id, folder_id) VALUES (?, ?, ?, ?)",
      )
      .run(data.title, data.description, data.typeId, data.folderId);
    return Number(info.lastInsertRowid);
  }

  async updateFilePath(id: number, filePath: string): Promise<void> {
    this.db()
      .prepare("UPDATE snippets SET file_path = ? WHERE id = ?")
      .run(filePath, id);
  }

  async attachTags(snippetId: number, tagIds: number[]): Promise<void> {
    if (tagIds.length === 0) {
      return;
    }
    const insert = this.db().prepare(
      "INSERT INTO snippet_tags (snippet_id, tag_id) VALUES (?, ?)",
    );
    const all = this.db().transaction((ids: number[]) => {
      for (const tagId of ids) {
        insert.run(snippetId, tagId);
      }
    });
    all(tagIds);
  }

  async update(id: number, data: UpdateSnippetRecord): Promise<void> {
    this.db()
      .prepare(
        "UPDATE snippets SET title = ?, description = ?, type_id = ? WHERE id = ?",
      )
      .run(data.title, data.description, data.typeId, id);
  }

  async replaceTags(snippetId: number, tagIds: number[]): Promise<void> {
    this.db()
      .prepare("DELETE FROM snippet_tags WHERE snippet_id = ?")
      .run(snippetId);
    await this.attachTags(snippetId, tagIds);
  }

  async findById(id: number): Promise<Snippet | null> {
    const row = this.db()
      .prepare(
        "SELECT id, title, description, file_path, type_id, folder_id, created_at FROM snippets WHERE id = ?",
      )
      .get(id) as SnippetRow | undefined;
    return row ? toDomain(row) : null;
  }

  async list(filters: SnippetListFilters = {}): Promise<Snippet[]> {
    const clauses: string[] = [];
    const params: (string | number)[] = [];

    let sql =
      "SELECT DISTINCT s.id, s.title, s.description, s.file_path, s.type_id, s.folder_id, s.created_at FROM snippets s";

    if (filters.tagId !== undefined) {
      sql += " INNER JOIN snippet_tags st ON st.snippet_id = s.id";
      clauses.push("st.tag_id = ?");
      params.push(filters.tagId);
    }
    if (filters.typeId !== undefined) {
      clauses.push("s.type_id = ?");
      params.push(filters.typeId);
    }
    if (filters.folderId !== undefined) {
      clauses.push("s.folder_id = ?");
      params.push(filters.folderId);
    }
    if (filters.search) {
      clauses.push("(s.title LIKE ? OR s.description LIKE ?)");
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (clauses.length > 0) {
      sql += ` WHERE ${clauses.join(" AND ")}`;
    }
    sql += " ORDER BY s.created_at DESC, s.id DESC";

    const rows = this.db().prepare(sql).all(...params) as SnippetRow[];
    return rows.map(toDomain);
  }

  async delete(id: number): Promise<void> {
    this.db().prepare("DELETE FROM snippets WHERE id = ?").run(id);
  }
}
