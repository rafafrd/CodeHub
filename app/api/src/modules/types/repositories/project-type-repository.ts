import { Pool, RowDataPacket } from "mysql2/promise";

import { ProjectType } from "../models/project-type";

/**
 * Contrato de leitura de tipos de projeto. Mínimo para a Fase 4
 * (o Service precisa resolver o NOME do tipo a partir do id para o
 * Frontmatter). A Fase 6 estende este módulo com o CRUD completo.
 */
export interface ProjectTypeRepository {
  findById(id: number): Promise<ProjectType | null>;
}

interface ProjectTypeRow extends RowDataPacket {
  id: number;
  name: string;
}

export class MySqlProjectTypeRepository implements ProjectTypeRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: number): Promise<ProjectType | null> {
    const [rows] = await this.pool.execute<ProjectTypeRow[]>(
      "SELECT id, name FROM project_types WHERE id = ?",
      [id],
    );

    const row = rows[0];
    return row ? { id: row.id, name: row.name } : null;
  }
}
