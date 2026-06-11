import { eventBus, GAMIFICATION_EVENT } from "../../../shared/events/event-bus";
import { Rank } from "../models/profile";
import { StatsRepository } from "../repositories/stats-repository";
import { AddXpService } from "./add-xp-service";
import {
  CheckAchievementsService,
  localDay,
} from "./check-achievements-service";

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
 * Orquestra a gamificação: registra atividade (streak), concede o XP base e
 * roda o motor de conquistas data-driven. Publica o resultado no event bus
 * (SSE) e o retorna para a resposta HTTP.
 */
export class GamificationEvents {
  constructor(
    private readonly addXp: AddXpService,
    private readonly checkAchievements: CheckAchievementsService,
    private readonly stats: StatsRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  onSnippetCreated(profileId: number): Promise<GamificationOutcome> {
    return this.award(profileId, XP_REWARDS.snippetCreated, "snippet_created");
  }

  onFolderCreated(profileId: number): Promise<GamificationOutcome> {
    return this.award(profileId, XP_REWARDS.folderCreated, "folder_created");
  }

  private async award(
    profileId: number,
    baseXp: number,
    action: "snippet_created" | "folder_created",
  ): Promise<GamificationOutcome> {
    const date = this.now();
    await this.stats.touchActivity(localDay(date));

    const xpResult = await this.addXp.execute(profileId, baseXp);

    let { level, rank } = xpResult.profile;
    let leveledUp = xpResult.leveledUp;
    let rankChanged = xpResult.rankChanged;
    let xpGained = baseXp;
    const unlocked: UnlockedView[] = [];

    const results = await this.checkAchievements.execute(profileId, {
      action,
      level,
      date,
    });

    for (const result of results) {
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

    const outcome: GamificationOutcome = {
      xpGained,
      level,
      rank,
      leveledUp,
      rankChanged,
      unlocked,
    };

    eventBus.emit(GAMIFICATION_EVENT, outcome);
    return outcome;
  }
}
