import { z } from "zod";

/**
 * Body de criação/atualização (SDD §5 usa snake_case: `type_id`, `mermaid_flow`).
 * O `.transform` converte para o contrato camelCase dos Services.
 */
const snippetBodySchema = z
  .object({
    title: z.string().trim().min(1, "O título é obrigatório."),
    description: z.string().trim().optional(),
    content: z.string().min(1, "O conteúdo é obrigatório."),
    type_id: z.number().int().positive(),
    tags: z.array(z.number().int().positive()).default([]),
    mermaid_flow: z.string().optional(),
    folder_id: z.number().int().positive().nullable().optional(),
  })
  .transform((body) => ({
    title: body.title,
    description: body.description,
    content: body.content,
    typeId: body.type_id,
    tagIds: body.tags,
    mermaidFlow: body.mermaid_flow,
    folderId: body.folder_id ?? null,
  }));

export const createSnippetSchema = snippetBodySchema;
export const updateSnippetSchema = snippetBodySchema;

/** Query de listagem (CU02) — filtros por id + busca textual. */
export const listSnippetsQuerySchema = z.object({
  typeId: z.coerce.number().int().positive().optional(),
  tagId: z.coerce.number().int().positive().optional(),
  folderId: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
});

/** Parâmetro de rota `:id`. */
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
