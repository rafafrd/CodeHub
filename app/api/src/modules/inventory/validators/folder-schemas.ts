import { z } from "zod";

/** Body de criação de pasta. `parent_id` nulo/ausente = pasta raiz. */
export const createFolderSchema = z
  .object({
    name: z.string().trim().min(1, "O nome é obrigatório."),
    parent_id: z.number().int().positive().nullable().optional(),
  })
  .transform((body) => ({
    name: body.name,
    parentId: body.parent_id ?? null,
  }));
