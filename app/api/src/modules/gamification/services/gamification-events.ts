import { Rank } from "../models/profile";
import { AddXpService } from "./add-xp-service";
import { UnlockAchievementService } from "./unlock-achievement-service";

/** XP base concedido por ação do usuário. */
export const XP_REWARDS = {
  snippetCreated: 25,
  folderCreated: 15,
} as const;

export interface UnlockedView {
  code: string;
  name: string;
  xpReward: number;
}

/** Resultado agregado de uma ação — consumido pela UI para os toasts. */
export interface GamificationOutcome {
  xpGained: number;
  level: number;
  rank: Rank;
  leveledUp: boolean;
  rankChanged: boolean;
  unlocked: UnlockedView[];
}

/**
 * Orquestra a gamificação das ações: concede XP base e tenta desbloquear as
 * conquistas relacionadas (idempotente). Retorna um resumo para os toasts.
 */
export class GamificationEvents {
  constructor(
    private readonly addXp: AddXpService,
    private readonly unlock: UnlockAchievementService,
  ) {}

  onSnippetCreated(profileId: number): Promise<GamificationOutcome> {
    return this.award(profileId, XP_REWARDS.snippetCreated, ["first_script"]);
  }

  onFolderCreated(profileId: number): Promise<GamificationOutcome> {
    return this.award(profileId, XP_REWARDS.folderCreated, ["organizer"]);
  }

  private async award(
    profileId: number,
    baseXp: number,
    codes: string[],
  ): Promise<GamificationOutcome> {
    const xpResult = await this.addXp.execute(profileId, baseXp);

    let { level, rank } = xpResult.profile;
    let leveledUp = xpResult.leveledUp;
    let rankChanged = xpResult.rankChanged;
    let xpGained = baseXp;
    const unlocked: UnlockedView[] = [];

    for (const code of codes) {
      const result = await this.unlock.execute(profileId, code);
      if (!result.unlocked) {
        continue;
      }
      unlocked.push({
        code: result.achievement.code,
        name: result.achievement.name,
        xpReward: result.achievement.xpReward,
      });
      xpGained += result.achievement.xpReward;
      if (result.xpResult) {
        level = result.xpResult.profile.level;
        rank = result.xpResult.profile.rank;
        leveledUp = leveledUp || result.xpResult.leveledUp;
        rankChanged = rankChanged || result.xpResult.rankChanged;
      }
    }

    return { xpGained, level, rank, leveledUp, rankChanged, unlocked };
  }
}
