export type Rank = "Bronze" | "Prata" | "Ouro" | "Platina" | "Diamante";

/** Perfil de gamificação do usuário (tabela `profiles`). */
export interface Profile {
  id: number;
  username: string | null;
  xp: number;
  level: number;
  rank: Rank;
}
