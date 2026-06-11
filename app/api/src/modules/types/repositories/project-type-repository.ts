import { GetDb } from "../../../database/sqlite";
import { Behavior, ProjectType } from "../models/project-type";

export interface ProjectTypeData {
  name: string;
  behavior: Behavior;
}

/** Repositório de tipos de artefato (CRUD + lookup por nome). */
export interface ProjectTypeRepository {
  create(data: ProjectTypeData): Promise<number>;
  findAll(): Promise<ProjectType[]>;
  findById(id: number): Promise<ProjectType | null>;
  findByName(name: string): Promise<ProjectType | null>;
  update(id: number, data: { name: string }): Promise<void>;
  delete(id: number): Promise<void>;
}

interface ProjectTypeRow {
  id: number;
  name: string;
  behavior: Behavior;
}

export class SqliteProjectTypeRepository implements ProjectTypeRepository {
  constructor(private readonly db: GetDb) {}

  async create(data: ProjectTypeData): Promise<number> {
    const info = this.db()
      .prepare("INSERT INTO project_types (name, behavior) VALUES (?, ?)")
      .run(data.name, data.behavior);
    return Number(info.lastInsertRowid);
  }

  async findAll(): Promise<ProjectType[]> {
    return this.db()
      .prepare("SELECT id, name, behavior FROM project_types ORDER BY name")
      .all() as ProjectTypeRow[];
  }

  async findById(id: number): Promise<ProjectType | null> {
    const row = this.db()
      .prepare("SELECT id, name, behavior FROM project_types WHERE id = ?")
      .get(id) as ProjectTypeRow | undefined;
    return row ?? null;
  }

  async findByName(name: string): Promise<ProjectType | null> {
    const row = this.db()
      .prepare("SELECT id, name, behavior FROM project_types WHERE name = ?")
      .get(name) as ProjectTypeRow | undefined;
    return row ?? null;
  }

  async update(id: number, data: { name: string }): Promise<void> {
    this.db()
      .prepare("UPDATE project_types SET name = ? WHERE id = ?")
      .run(data.name, id);
  }

  async delete(id: number): Promise<void> {
    this.db().prepare("DELETE FROM project_types WHERE id = ?").run(id);
  }
}
