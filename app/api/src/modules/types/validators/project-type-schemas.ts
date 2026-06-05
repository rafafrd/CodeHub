import { z } from "zod";

export const projectTypeBodySchema = z.object({
  name: z.string().trim().min(1, "O nome é obrigatório."),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
