import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { Tag } from "../models/tag";

export interface TagData {
  name: string;
}

/**
 * Repositório de tags (CRUD completo — Fase 6).
 * `findByIds` já era usado pelos Services de snippet na Fase 4.
 */
export interface TagRepository {
  create(data: TagData): Promise<number>;
  findAll(): Promise<Tag[]>;
  findById(id: number): Promise<Tag | null>;
  findByName(name: string): Promise<Tag | null>;
  findByIds(ids: number[]): Promise<Tag[]>;
  update(id: number, data: TagData): Promise<void>;
  delete(id: number): Promise<void>;
}

interface TagRow extends RowDataPacket {
  id: number;
  name: string;
}

export class MySqlTagRepository implements TagRepository {
  constructor(private readonly pool: Pool) {}

  async create(data: TagData): Promise<number> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      "INSERT INTO tags (name) VALUES (?)",
      [data.name],
    );
    return result.insertId;
  }

  async findAll(): Promise<Tag[]> {
    const [rows] = await this.pool.execute<TagRow[]>(
      "SELECT id, name FROM tags ORDER BY name",
    );
    return rows.map((row) => ({ id: row.id, name: row.name }));
  }

  async findById(id: number): Promise<Tag | null> {
    const [rows] = await this.pool.execute<TagRow[]>(
      "SELECT id, name FROM tags WHERE id = ?",
      [id],
    );
    const row = rows[0];
    return row ? { id: row.id, name: row.name } : null;
  }

  async findByName(name: string): Promise<Tag | null> {
    const [rows] = await this.pool.execute<TagRow[]>(
      "SELECT id, name FROM tags WHERE name = ?",
      [name],
    );
    const row = rows[0];
    return row ? { id: row.id, name: row.name } : null;
  }

  async findByIds(ids: number[]): Promise<Tag[]> {
    if (ids.length === 0) {
      return [];
    }

    const placeholders = ids.map(() => "?").join(", ");
    const [rows] = await this.pool.execute<TagRow[]>(
      `SELECT id, name FROM tags WHERE id IN (${placeholders})`,
      ids,
    );
    return rows.map((row) => ({ id: row.id, name: row.name }));
  }

  async update(id: number, data: TagData): Promise<void> {
    await this.pool.execute("UPDATE tags SET name = ? WHERE id = ?", [
      data.name,
      id,
    ]);
  }

  async delete(id: number): Promise<void> {
    await this.pool.execute("DELETE FROM tags WHERE id = ?", [id]);
  }
}
