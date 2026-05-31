import { Pool, RowDataPacket } from "mysql2/promise";

import { Tag } from "../models/tag";

/**
 * Contrato de leitura de tags. Mínimo para a Fase 4 (o Service resolve os
 * NOMES das tags a partir dos ids para o Frontmatter e valida a existência
 * delas). A Fase 6 estende este módulo com o CRUD completo.
 */
export interface TagRepository {
  findByIds(ids: number[]): Promise<Tag[]>;
}

interface TagRow extends RowDataPacket {
  id: number;
  name: string;
}

export class MySqlTagRepository implements TagRepository {
  constructor(private readonly pool: Pool) {}

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
}
