import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { ProjectType } from "../models/project-type";

export interface ProjectTypeData {
  name: string;
}

/**
 * Repositório de tipos de projeto (CRUD completo — Fase 6).
 * `findById` já era usado pelos Services de snippet na Fase 4.
 */
export interface ProjectTypeRepository {
  create(data: ProjectTypeData): Promise<number>;
  findAll(): Promise<ProjectType[]>;
  findById(id: number): Promise<ProjectType | null>;
  findByName(name: string): Promise<ProjectType | null>;
  update(id: number, data: ProjectTypeData): Promise<void>;
  delete(id: number): Promise<void>;
}

interface ProjectTypeRow extends RowDataPacket {
  id: number;
  name: string;
}

export class MySqlProjectTypeRepository implements ProjectTypeRepository {
  constructor(private readonly pool: Pool) {}

  async create(data: ProjectTypeData): Promise<number> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      "INSERT INTO project_types (name) VALUES (?)",
      [data.name],
    );
    return result.insertId;
  }

  async findAll(): Promise<ProjectType[]> {
    const [rows] = await this.pool.execute<ProjectTypeRow[]>(
      "SELECT id, name FROM project_types ORDER BY name",
    );
    return rows.map((row) => ({ id: row.id, name: row.name }));
  }

  async findById(id: number): Promise<ProjectType | null> {
    const [rows] = await this.pool.execute<ProjectTypeRow[]>(
      "SELECT id, name FROM project_types WHERE id = ?",
      [id],
    );
    const row = rows[0];
    return row ? { id: row.id, name: row.name } : null;
  }

  async findByName(name: string): Promise<ProjectType | null> {
    const [rows] = await this.pool.execute<ProjectTypeRow[]>(
      "SELECT id, name FROM project_types WHERE name = ?",
      [name],
    );
    const row = rows[0];
    return row ? { id: row.id, name: row.name } : null;
  }

  async update(id: number, data: ProjectTypeData): Promise<void> {
    await this.pool.execute("UPDATE project_types SET name = ? WHERE id = ?", [
      data.name,
      id,
    ]);
  }

  async delete(id: number): Promise<void> {
    await this.pool.execute("DELETE FROM project_types WHERE id = ?", [id]);
  }
}
