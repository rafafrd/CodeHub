import { Folder } from "../models/folder";

export interface CreateFolderData {
  name: string;
  parentId: number | null;
}

export interface FolderRepository {
  create(data: CreateFolderData): Promise<number>;
  findById(id: number): Promise<Folder | null>;
  existsByNameInParent(name: string, parentId: number | null): Promise<boolean>;
}
