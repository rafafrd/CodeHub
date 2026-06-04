import { Rank } from "../models/profile";

/** XP necessário por nível (curva linear simples e previsível). */
export const XP_PER_LEVEL = 100;

/** Nível a partir do XP acumulado (nível 1 = 0–99 XP, nível 2 = 100–199, …). */
export function levelForXp(xp: number): number {
  if (xp <= 0) {
    return 1;
  }
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

/** XP que falta para o próximo nível (útil para a barra de progresso na UI). */
export function xpToNextLevel(xp: number): number {
  const next = levelForXp(xp) * XP_PER_LEVEL;
  return Math.max(0, next - xp);
}

/** Patente/elo a partir do nível. */
export function rankForLevel(level: number): Rank {
  if (level >= 20) return "Diamante";
  if (level >= 15) return "Platina";
  if (level >= 10) return "Ouro";
  if (level >= 5) return "Prata";
  return "Bronze";
}
