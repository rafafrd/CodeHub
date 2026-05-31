import { AppError } from "../../../shared/errors/app-error";
import { Snippet } from "../models/snippet";
import { FileSystemRepository } from "../repositories/file-system-repository";
import { SnippetRepository } from "../repositories/snippet-repository";

export interface SnippetDetail {
  snippet: Snippet;
  metadata: Record<string, unknown>;
  body: string;
}

/**
 * Retorna os detalhes de um snippet (CU03): metadados do MySQL + conteúdo
 * do arquivo `.md` físico (Frontmatter + corpo) lido via FileSystemRepository.
 */
export class GetSnippetService {
  constructor(
    private readonly snippetRepository: SnippetRepository,
    private readonly fileSystemRepository: FileSystemRepository,
  ) {}

  async execute(id: number): Promise<SnippetDetail> {
    const snippet = await this.snippetRepository.findById(id);
    if (!snippet) {
      throw new AppError("Snippet não encontrado.", 404);
    }
    if (!snippet.filePath) {
      throw new AppError("Conteúdo do snippet ainda não disponível.", 404);
    }

    const file = await this.fileSystemRepository.read(snippet.filePath);

    return { snippet, metadata: file.metadata, body: file.body };
  }
}
