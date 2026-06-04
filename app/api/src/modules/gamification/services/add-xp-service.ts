import { AppError } from "../../../shared/errors/app-error";
import { levelForXp, rankForLevel } from "../domain/leveling";
import { Profile, Rank } from "../models/profile";
import { ProfileRepository } from "../repositories/profile-repository";

export interface AddXpResult {
  profile: Profile;
  leveledUp: boolean;
  rankChanged: boolean;
  previousLevel: number;
  previousRank: Rank;
}

/**
 * Concede XP a um perfil, recalculando nível e patente. Retorna flags de
 * `leveledUp`/`rankChanged` para a UI disparar os toasts de gamificação.
 */
export class AddXpService {
  constructor(private readonly profiles: ProfileRepository) {}

  async execute(profileId: number, amount: number): Promise<AddXpResult> {
    if (amount <= 0) {
      throw new AppError("A quantidade de XP deve ser positiva.", 400);
    }

    const profile = await this.profiles.findById(profileId);
    if (!profile) {
      throw new AppError("Perfil não encontrado.", 404);
    }

    const previousLevel = profile.level;
    const previousRank = profile.rank;

    const xp = profile.xp + amount;
    const level = levelForXp(xp);
    const rank = rankForLevel(level);

    await this.profiles.updateProgress(profileId, { xp, level, rank });

    return {
      profile: { ...profile, xp, level, rank },
      leveledUp: level > previousLevel,
      rankChanged: rank !== previousRank,
      previousLevel,
      previousRank,
    };
  }
}
