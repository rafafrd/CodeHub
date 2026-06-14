/**
 * Comportamento intrínseco de um tipo de artefato — dita renderização e
 * utilidade no frontend (ex.: markdown renderiza rico, regex mostra exemplos).
 */
export const BEHAVIORS = [
  "snippet",
  "markdown",
  "ai-skill",
  "dockerfile",
  "docker-compose",
  "server-config",
  "cicd",
  "shell",
  "query",
  "regex",
  "git-hook",
  "middleware",
  "api-contract",
  "iac",
  "env",
  "keys",
] as const;

export type Behavior = (typeof BEHAVIORS)[number];

/** Entidade ProjectType — espelha a tabela `project_types`. */
export interface ProjectType {
  id: number;
  name: string;
  behavior: Behavior;
}
