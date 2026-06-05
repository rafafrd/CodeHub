import { AppError } from "../../../shared/errors/app-error";
import { Achievement } from "../models/achievement";
import {
  AchievementRepository,
  UserAchievementRepository,
} from "../repositories/achievement-repository";
import { AddXpResult, AddXpService } from "./add-xp-service";

export interface UnlockAchievementResult {
  unlocked: boolean;
  achievement: Achievement;
  xpResult: AddXpResult | null;
}

/**
 * Desbloqueia uma conquista por código (idempotente). Na primeira vez, registra
 * o desbloqueio e concede o XP de recompensa (delegando ao AddXpService).
 */
export class UnlockAchievementService {
  constructor(
    private readonly achievements: AchievementRepository,
    private readonly userAchievements: UserAchievementRepository,
    private readonly addXp: AddXpService,
  ) {}

  async execute(
    profileId: number,
    code: string,
  ): Promise<UnlockAchievementResult> {
    const achievement = await this.achievements.findByCode(code);
    if (!achievement) {
      throw new AppError("Conquista não encontrada.", 404);
    }

    const already = await this.userAchievements.isUnlocked(
      profileId,
      achievement.id,
    );
    if (already) {
      return { unlocked: false, achievement, xpResult: null };
    }

    await this.userAchievements.unlock(profileId, achievement.id);

    const xpResult =
      achievement.xpReward > 0
        ? await this.addXp.execute(profileId, achievement.xpReward)
        : null;

    return { unlocked: true, achievement, xpResult };
  }
}
