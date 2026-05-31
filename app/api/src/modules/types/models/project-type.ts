/**
 * Entidade ProjectType — espelha a tabela `project_types`.
 *
 * Categoriza o snippet por tipo de projeto (ex.: "Node.js", "DevSecOps",
 * "Frontend"). É referenciada por `Snippet.typeId` (FK).
 */
export interface ProjectType {
  id: number;
  name: string;
}
