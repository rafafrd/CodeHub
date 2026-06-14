import { z } from "zod";

import { BEHAVIORS } from "../models/project-type";

export const projectTypeBodySchema = z.object({
  name: z.string().trim().min(1, "O nome é obrigatório."),
  behavior: z.enum(BEHAVIORS).optional(),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
