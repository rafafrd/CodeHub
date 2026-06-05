/**
 * Entidade Tag — espelha a tabela `tags`.
 *
 * Relaciona-se com Snippet em N:M através da tabela pivô `snippet_tags`.
 */
export interface Tag {
  id: number;
  name: string;
}
