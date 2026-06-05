import { Folder } from "../models/folder";
import { FolderRepository } from "../repositories/folder-repository";

/** Lista todas as pastas (flat). O frontend monta a árvore via `parentId`. */
export class ListFoldersService {
  constructor(private readonly folders: FolderRepository) {}

  async execute(): Promise<Folder[]> {
    return this.folders.findAll();
  }
}
