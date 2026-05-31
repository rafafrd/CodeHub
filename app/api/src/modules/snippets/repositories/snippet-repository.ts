import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { Snippet } from "../models/snippet";

/** Dados de criação (metadados; `file_path` é preenchido depois). */
export interface CreateSnippetRecord {
  title: string;
  description: string | null;
  typeId: number;
}

/** Dados de atualização de metadados. */
export interface UpdateSnippetRecord {
  title: string;
  description: string | null;
  typeId: number;
}

/** Filtros opcionais de listagem (CU02: por tipo, tag ou busca textual). */
export interface SnippetListFilters {
  typeId?: number;
  tagId?: number;
  search?: string;
}

/**
 * Contrato do repositório de metadados (MySQL), implementado por
 * `MySqlSnippetRepository`. Os Services dependem desta interface para que
 * possam ser testados com um mock (TDD da Fase 4).
 *
 * Observação sobre o fluxo de criação (ver ROADMAP): a orquestração
 * transacional `create -> grava .md -> updateFilePath -> attachTags` é
 * responsabilidade do Service, não do repositório.
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

interface SnippetRow extends RowDataPacket {
  id: number;
  title: string;
  description: string | null;
  file_path: string | null;
  type_id: number;
  created_at: Date;
}

export class MySqlSnippetRepository implements SnippetRepository {
  constructor(private readonly pool: Pool) {}

  async create(data: CreateSnippetRecord): Promise<number> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      "INSERT INTO snippets (title, description, type_id) VALUES (?, ?, ?)",
      [data.title, data.description, data.typeId],
    );

    return result.insertId;
  }

  async updateFilePath(id: number, filePath: string): Promise<void> {
    await this.pool.execute("UPDATE snippets SET file_path = ? WHERE id = ?", [
      filePath,
      id,
    ]);
  }

  async attachTags(snippetId: number, tagIds: number[]): Promise<void> {
    if (tagIds.length === 0) {
      return;
    }

    const placeholders = tagIds.map(() => "(?, ?)").join(", ");
    const params = tagIds.flatMap((tagId) => [snippetId, tagId]);

    await this.pool.execute(
      `INSERT INTO snippet_tags (snippet_id, tag_id) VALUES ${placeholders}`,
      params,
    );
  }

  async update(id: number, data: UpdateSnippetRecord): Promise<void> {
    await this.pool.execute(
      "UPDATE snippets SET title = ?, description = ?, type_id = ? WHERE id = ?",
      [data.title, data.description, data.typeId, id],
    );
  }

  async replaceTags(snippetId: number, tagIds: number[]): Promise<void> {
    await this.pool.execute("DELETE FROM snippet_tags WHERE snippet_id = ?", [
      snippetId,
    ]);
    await this.attachTags(snippetId, tagIds);
  }

  async findById(id: number): Promise<Snippet | null> {
    const [rows] = await this.pool.execute<SnippetRow[]>(
      "SELECT id, title, description, file_path, type_id, created_at FROM snippets WHERE id = ?",
      [id],
    );

    const row = rows[0];
    return row ? this.toDomain(row) : null;
  }

  async list(filters: SnippetListFilters = {}): Promise<Snippet[]> {
    const clauses: string[] = [];
    const params: (string | number)[] = [];

    let sql =
      "SELECT DISTINCT s.id, s.title, s.description, s.file_path, s.type_id, s.created_at FROM snippets s";

    if (filters.tagId !== undefined) {
      sql += " INNER JOIN snippet_tags st ON st.snippet_id = s.id";
      clauses.push("st.tag_id = ?");
      params.push(filters.tagId);
    }
    if (filters.typeId !== undefined) {
      clauses.push("s.type_id = ?");
      params.push(filters.typeId);
    }
    if (filters.search) {
      clauses.push("(s.title LIKE ? OR s.description LIKE ?)");
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (clauses.length > 0) {
      sql += ` WHERE ${clauses.join(" AND ")}`;
    }
    sql += " ORDER BY s.created_at DESC";

    const [rows] = await this.pool.execute<SnippetRow[]>(sql, params);
    return rows.map((row) => this.toDomain(row));
  }

  async delete(id: number): Promise<void> {
    await this.pool.execute("DELETE FROM snippets WHERE id = ?", [id]);
  }

  private toDomain(row: SnippetRow): Snippet {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      filePath: row.file_path,
      typeId: row.type_id,
      createdAt: row.created_at,
    };
  }
}
