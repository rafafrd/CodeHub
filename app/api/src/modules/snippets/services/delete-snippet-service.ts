import { AppError } from "../../../shared/errors/app-error";
import { FileSystemRepository } from "../repositories/file-system-repository";
import { SnippetRepository } from "../repositories/snippet-repository";

/**
 * Remove um snippet (SDD §5 DELETE): apaga o arquivo físico e o registro no
 * MySQL. As tags do pivô são removidas em cascata pela FK (ON DELETE CASCADE).
 */
export class DeleteSnippetService {
  constructor(
    private readonly snippetRepository: SnippetRepository,
    private readonly fileSystemRepository: FileSystemRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const existing = await this.snippetRepository.findById(id);
    if (!existing) {
      throw new AppError("Snippet não encontrado.", 404);
    }

    if (existing.filePath) {
      await this.fileSystemRepository.delete(existing.filePath);
    }

    await this.snippetRepository.delete(id);
  }
}
