import { GetDb } from "../../../database/sqlite";
import { Folder } from "../models/folder";
import { CreateFolderData, FolderRepository } from "./folder-repository";

interface FolderRow {
  id: number;
  name: string;
  parent_id: number | null;
  created_at: string;
}

function toDomain(row: FolderRow): Folder {
  return {
    id: row.id,
    name: row.name,
    parentId: row.parent_id,
    createdAt: new Date(`${row.created_at.replace(" ", "T")}Z`),
  };
}

export class SqliteFolderRepository implements FolderRepository {
  constructor(private readonly db: GetDb) {}

  async create(data: CreateFolderData): Promise<number> {
    const info = this.db()
      .prepare("INSERT INTO folders (name, parent_id) VALUES (?, ?)")
      .run(data.name, data.parentId);
    return Number(info.lastInsertRowid);
  }

  async findById(id: number): Promise<Folder | null> {
    const row = this.db()
      .prepare("SELECT id, name, parent_id, created_at FROM folders WHERE id = ?")
      .get(id) as FolderRow | undefined;
    return row ? toDomain(row) : null;
  }

  async existsByNameInParent(
    name: string,
    parentId: number | null,
  ): Promise<boolean> {
    const row =
      parentId === null
        ? this.db()
            .prepare(
              "SELECT 1 FROM folders WHERE name = ? AND parent_id IS NULL LIMIT 1",
            )
            .get(name)
        : this.db()
            .prepare(
              "SELECT 1 FROM folders WHERE name = ? AND parent_id = ? LIMIT 1",
            )
            .get(name, parentId);
    return row !== undefined;
  }

  async findAll(): Promise<Folder[]> {
    const rows = this.db()
      .prepare(
        "SELECT id, name, parent_id, created_at FROM folders ORDER BY (parent_id IS NOT NULL), parent_id, name",
      )
      .all() as FolderRow[];
    return rows.map(toDomain);
  }
}
