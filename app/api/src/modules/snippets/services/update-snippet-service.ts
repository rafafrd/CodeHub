import { AppError } from "../../../shared/errors/app-error";
import { ProjectTypeRepository } from "../../types/repositories/project-type-repository";
import { TagRepository } from "../../tags/repositories/tag-repository";
import { FileSystemRepository } from "../repositories/file-system-repository";
import { SnippetRepository } from "../repositories/snippet-repository";

export interface UpdateSnippetInput {
  title: string;
  description?: string;
  content: string;
  typeId: number;
  tagIds: number[];
  mermaidFlow?: string;
}

/**
 * Atualiza um snippet (SDD §5 PUT): reescreve os metadados no MySQL e
 * regrava o arquivo `.md`, preservando a data de criação original.
 * Recebe IDs e resolve os nomes de type/tags para o Frontmatter.
 */
export class UpdateSnippetService {
  constructor(
    private readonly snippetRepository: SnippetRepository,
    private readonly fileSystemRepository: FileSystemRepository,
    private readonly projectTypeRepository: ProjectTypeRepository,
    private readonly tagRepository: TagRepository,
  ) {}

  async execute(id: number, input: UpdateSnippetInput): Promise<void> {
    const existing = await this.snippetRepository.findById(id);
    if (!existing) {
      throw new AppError("Snippet não encontrado.", 404);
    }

    const title = input.title?.trim();
    if (!title) {
      throw new AppError("O título do snippet é obrigatório.", 400);
    }
    if (!input.content?.trim()) {
      throw new AppError("O conteúdo do snippet é obrigatório.", 400);
    }

    const type = await this.projectTypeRepository.findById(input.typeId);
    if (!type) {
      throw new AppError("Tipo de projeto não encontrado.", 404);
    }

    const tagIds = input.tagIds ?? [];
    const tags = await this.tagRepository.findByIds(tagIds);
    if (tags.length !== tagIds.length) {
      throw new AppError("Uma ou mais tags não foram encontradas.", 404);
    }

    const description = input.description?.trim() || null;

    await this.snippetRepository.update(id, {
      title,
      description,
      typeId: input.typeId,
    });

    await this.fileSystemRepository.save({
      id,
      title,
      type: type.name,
      tags: tags.map((tag) => tag.name),
      createdAt: existing.createdAt.toISOString().slice(0, 10),
      description: description ?? undefined,
      content: input.content,
      mermaidFlow: input.mermaidFlow,
    });

    await this.snippetRepository.replaceTags(id, tagIds);
  }
}
