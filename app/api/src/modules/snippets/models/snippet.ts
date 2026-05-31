import { ProjectType } from "../../types/models/project-type";
import { Tag } from "../../tags/models/tag";

/**
 * Entidade Snippet — espelha a tabela `snippets` (metadados no MySQL).
 *
 * O conteúdo bruto (arquivo `.md` com Frontmatter + Mermaid) vive no File
 * System e é referenciado por `filePath`. A arquitetura é híbrida: o MySQL
 * indexa/relaciona, o FS guarda o conteúdo.
 */
export interface Snippet {
  id: number;
  title: string;
  description: string | null;
  /**
   * Caminho do arquivo `.md` físico em `storage/`.
   * Nulo na janela transitória entre o INSERT e a gravação do arquivo
   * (ver fluxo de criação no ROADMAP).
   */
  filePath: string | null;
  /** FK -> project_types.id */
  typeId: number;
  createdAt: Date;
}

/**
 * Visão enriquecida do snippet com os relacionamentos já resolvidos.
 * Usada em respostas de detalhe (ex.: GET /api/snippets/:id).
 */
export interface SnippetWithRelations extends Snippet {
  type: ProjectType;
  tags: Tag[];
}
