/** Pasta do inventário (tabela `folders`). Suporta hierarquia via `parentId`. */
export interface Folder {
  id: number;
  name: string;
  parentId: number | null;
  createdAt: Date;
}
