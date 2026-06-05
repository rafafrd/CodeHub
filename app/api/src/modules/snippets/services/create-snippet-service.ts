import { AppError } from "../../../shared/errors/app-error";
import { ProjectTypeRepository } from "../../types/repositories/project-type-repository";
import { TagRepository } from "../../tags/repositories/tag-repository";
import { FileSystemRepository } from "../repositories/file-system-repository";
import { SnippetRepository } from "../repositories/snippet-repository";

export interface CreateSnippetInput {
  title: string;
  description?: string;
  content: string;
  typeId: number;
  tagIds: number[];
  mermaidFlow?: string;
  folderId?: number | null;
}

export interface CreateSnippetResult {
  id: number;
  filePath: string;
}

/**
 * Cria um snippet seguindo o fluxo da arquitetura híbrida (ver ROADMAP):
 *  1. valida a regra de negócio;
 *  2. resolve type/tags (ids -> nomes) para o Frontmatter legível;
 *  3. INSERT dos metadados (obtém o id auto-increment);
 *  4. grava `storage/<id>.md` e atualiza o `file_path`;
 *  5. vincula as tags (pivô N:M);
 *  6. compensa (apaga o registro) se a materialização do arquivo falhar.
 *
 * Recebe IDs (contrato do SDD §5); a tradução para nomes é interna.
 */
export class CreateSnippetService {
  constructor(
    private readonly snippetRepository: SnippetRepository,
    private readonly fileSystemRepository: FileSystemRepository,
    private readonly projectTypeRepository: ProjectTypeRepository,
    private readonly tagRepository: TagRepository,
  ) {}

  async execute(input: CreateSnippetInput): Promise<CreateSnippetResult> {
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

    const id = await this.snippetRepository.create({
      title,
      description,
      typeId: input.typeId,
      folderId: input.folderId ?? null,
    });

    try {
      const fileName = await this.fileSystemRepository.save({
        id,
        title,
        type: type.name,
        tags: tags.map((tag) => tag.name),
        createdAt: new Date().toISOString().slice(0, 10),
        description: description ?? undefined,
        content: input.content,
        mermaidFlow: input.mermaidFlow,
      });

      await this.snippetRepository.updateFilePath(id, fileName);
      await this.snippetRepository.attachTags(id, tagIds);

      return { id, filePath: fileName };
    } catch (error) {
      // Compensação: sem o arquivo, o registro de metadados não pode existir.
      await this.snippetRepository.delete(id);
      throw error;
    }
  }
}
