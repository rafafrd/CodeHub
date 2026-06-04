/** Conquista do catálogo (tabela `achievements`). */
export interface Achievement {
  id: number;
  code: string;
  name: string;
  description: string | null;
  xpReward: number;
}
