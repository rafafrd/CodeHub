import { AppError } from "../../../shared/errors/app-error";
import { Folder } from "../models/folder";
import { FolderRepository } from "../repositories/folder-repository";

export interface CreateFolderInput {
  name: string;
  parentId?: number | null;
}

/**
 * Cria uma pasta no inventário. Valida o nome, a existência do pai (quando há)
 * e a unicidade de nome dentro do mesmo pai (inclusive na raiz, parentId null).
 */
export class CreateFolderService {
  constructor(private readonly folders: FolderRepository) {}

  async execute(input: CreateFolderInput): Promise<Folder> {
    const name = input.name?.trim();
    if (!name) {
      throw new AppError("O nome da pasta é obrigatório.", 400);
    }

    const parentId = input.parentId ?? null;

    if (parentId !== null) {
      const parent = await this.folders.findById(parentId);
      if (!parent) {
        throw new AppError("Pasta pai não encontrada.", 404);
      }
    }

    const duplicate = await this.folders.existsByNameInParent(name, parentId);
    if (duplicate) {
      throw new AppError("Já existe uma pasta com esse nome aqui.", 409);
    }

    const id = await this.folders.create({ name, parentId });

    return { id, name, parentId, createdAt: new Date() };
  }
}
