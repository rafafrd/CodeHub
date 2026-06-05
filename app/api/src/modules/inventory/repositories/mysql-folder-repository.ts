import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { Folder } from "../models/folder";
import { CreateFolderData, FolderRepository } from "./folder-repository";

interface FolderRow extends RowDataPacket {
  id: number;
  name: string;
  parent_id: number | null;
  created_at: Date;
}

function toDomain(row: FolderRow): Folder {
  return {
    id: row.id,
    name: row.name,
    parentId: row.parent_id,
    createdAt: row.created_at,
  };
}

export class MySqlFolderRepository implements FolderRepository {
  constructor(private readonly pool: Pool) {}

  async create(data: CreateFolderData): Promise<number> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      "INSERT INTO folders (name, parent_id) VALUES (?, ?)",
      [data.name, data.parentId],
    );
    return result.insertId;
  }

  async findById(id: number): Promise<Folder | null> {
    const [rows] = await this.pool.execute<FolderRow[]>(
      "SELECT id, name, parent_id, created_at FROM folders WHERE id = ?",
      [id],
    );
    const row = rows[0];
    return row ? toDomain(row) : null;
  }

  async existsByNameInParent(
    name: string,
    parentId: number | null,
  ): Promise<boolean> {
    const sql =
      parentId === null
        ? "SELECT 1 FROM folders WHERE name = ? AND parent_id IS NULL LIMIT 1"
        : "SELECT 1 FROM folders WHERE name = ? AND parent_id = ? LIMIT 1";
    const params: (string | number)[] =
      parentId === null ? [name] : [name, parentId];
    const [rows] = await this.pool.execute<RowDataPacket[]>(sql, params);
    return rows.length > 0;
  }

  async findAll(): Promise<Folder[]> {
    const [rows] = await this.pool.execute<FolderRow[]>(
      "SELECT id, name, parent_id, created_at FROM folders ORDER BY parent_id IS NOT NULL, parent_id, name",
    );
    return rows.map(toDomain);
  }
}
