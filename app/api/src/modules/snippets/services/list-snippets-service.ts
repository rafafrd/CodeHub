import { Snippet } from "../models/snippet";
import { SnippetRepository } from "../repositories/snippet-repository";

export interface ListSnippetsInput {
  typeId?: number;
  tagId?: number;
  search?: string;
}

/**
 * Lista snippets com filtros opcionais (CU02). Normaliza a busca textual
 * (espaços/vazio viram `undefined`) e delega ao repositório.
 */
export class ListSnippetsService {
  constructor(private readonly snippetRepository: SnippetRepository) {}

  async execute(input: ListSnippetsInput = {}): Promise<Snippet[]> {
    const search = input.search?.trim();

    return this.snippetRepository.list({
      typeId: input.typeId,
      tagId: input.tagId,
      search: search || undefined,
    });
  }
}
