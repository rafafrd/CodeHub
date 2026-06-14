import { GetDb } from "../../../database/sqlite";
import { Tag } from "../models/tag";

export interface TagData {
  name: string;
}

/** Repositório de tags (CRUD + lookups). */
export interface TagRepository {
  create(data: TagData): Promise<number>;
  findAll(): Promise<Tag[]>;
  findById(id: number): Promise<Tag | null>;
  findByName(name: string): Promise<Tag | null>;
  findByIds(ids: number[]): Promise<Tag[]>;
  update(id: number, data: TagData): Promise<void>;
  delete(id: number): Promise<void>;
}

interface TagRow {
  id: number;
  name: string;
}

export class SqliteTagRepository implements TagRepository {
  constructor(private readonly db: GetDb) {}

  async create(data: TagData): Promise<number> {
    const info = this.db()
      .prepare("INSERT INTO tags (name) VALUES (?)")
      .run(data.name);
    return Number(info.lastInsertRowid);
  }

  async findAll(): Promise<Tag[]> {
    return this.db()
      .prepare("SELECT id, name FROM tags ORDER BY name")
      .all() as TagRow[];
  }

  async findById(id: number): Promise<Tag | null> {
    const row = this.db()
      .prepare("SELECT id, name FROM tags WHERE id = ?")
      .get(id) as TagRow | undefined;
    return row ?? null;
  }

  async findByName(name: string): Promise<Tag | null> {
    const row = this.db()
      .prepare("SELECT id, name FROM tags WHERE name = ?")
      .get(name) as TagRow | undefined;
    return row ?? null;
  }

  async findByIds(ids: number[]): Promise<Tag[]> {
    if (ids.length === 0) {
      return [];
    }
    const placeholders = ids.map(() => "?").join(", ");
    return this.db()
      .prepare(`SELECT id, name FROM tags WHERE id IN (${placeholders})`)
      .all(...ids) as TagRow[];
  }

  async update(id: number, data: TagData): Promise<void> {
    this.db()
      .prepare("UPDATE tags SET name = ? WHERE id = ?")
      .run(data.name, id);
  }

  async delete(id: number): Promise<void> {
    this.db().prepare("DELETE FROM tags WHERE id = ?").run(id);
  }
}
