import { Profile, Rank } from "../models/profile";

export interface ProfileProgress {
  xp: number;
  level: number;
  rank: Rank;
}

/**
 * Contrato do repositório de perfis. Implementação concreta (mysql2) vem na
 * fase de Repositories — os Services dependem desta interface (mock no TDD).
 */
export interface ProfileRepository {
  findById(id: number): Promise<Profile | null>;
  updateProgress(id: number, progress: ProfileProgress): Promise<void>;
}
