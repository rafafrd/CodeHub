import { Achievement } from "../models/achievement";
import {
  AchievementRepository,
  UserAchievementRepository,
} from "../repositories/achievement-repository";
import { StatsRepository } from "../repositories/stats-repository";
import {
  UnlockAchievementResult,
  UnlockAchievementService,
} from "./unlock-achievement-service";

export interface CheckContext {
  action: "snippet_created" | "folder_created";
  /** Nível do perfil após o XP base da ação. */
  level: number;
  /** Timestamp local da ação (para gatilhos de janela de horário). */
  date: Date;
}

function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** Janela "HH:MM-HH:MM"; suporta janelas que cruzam a meia-noite. */
function inTimeWindow(date: Date, window: string): boolean {
  const match = /^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/.exec(window);
  if (!match) {
    return false;
  }
  const start = Number(match[1]) * 60 + Number(match[2]);
  const end = Number(match[3]) * 60 + Number(match[4]);
  const now = minutesOfDay(date);

  return start <= end
    ? now >= start && now < end
    : now >= start || now < end;
}

/**
 * Motor data-driven de conquistas: avalia os gatilhos do catálogo contra os
 * contadores/contexto e desbloqueia (via UnlockAchievementService, que também
 * concede o XP de recompensa) tudo que foi satisfeito. Idempotente.
 */
export class CheckAchievementsService {
  constructor(
    private readonly achievements: AchievementRepository,
    private readonly userAchievements: UserAchievementRepository,
    private readonly stats: StatsRepository,
    private readonly unlock: UnlockAchievementService,
  ) {}

  async execute(
    profileId: number,
    ctx: CheckContext,
  ): Promise<UnlockAchievementResult[]> {
    const [catalog, unlockedIds] = await Promise.all([
      this.achievements.findAll(),
      this.userAchievements.listUnlockedIds(profileId),
    ]);
    const unlocked = new Set(unlockedIds);
    const locked = catalog.filter((a) => !unlocked.has(a.id));

    // Memoiza contadores para não repetir a mesma consulta por conquista.
    const memo = new Map<string, Promise<number>>();
    const counted = (key: string, fetch: () => Promise<number>): Promise<number> => {
      let value = memo.get(key);
      if (!value) {
        value = fetch();
        memo.set(key, value);
      }
      return value;
    };

    const results: UnlockAchievementResult[] = [];
    for (const achievement of locked) {
      if (await this.satisfied(achievement, ctx, counted)) {
        const result = await this.unlock.execute(profileId, achievement.code);
        if (result.unlocked) {
          results.push(result);
        }
      }
    }
    return results;
  }

  private async satisfied(
    achievement: Achievement,
    ctx: CheckContext,
    counted: (key: string, fetch: () => Promise<number>) => Promise<number>,
  ): Promise<boolean> {
    const { triggerKind, triggerParam, threshold } = achievement;

    switch (triggerKind) {
      case "count_snippets_total":
        return (
          (await counted("snippets", () => this.stats.countSnippetsTotal())) >=
          threshold
        );
      case "count_folders_total":
        return (
          (await counted("folders", () => this.stats.countFoldersTotal())) >=
          threshold
        );
      case "count_tags_total":
        return (
          (await counted("tags", () => this.stats.countTagsTotal())) >= threshold
        );
      case "count_types_total":
        return (
          (await counted("types", () => this.stats.countTypesTotal())) >=
          threshold
        );
      case "count_by_behavior":
        if (!triggerParam) {
          return false;
        }
        return (
          (await counted(`behavior:${triggerParam}`, () =>
            this.stats.countSnippetsByBehavior(triggerParam),
          )) >= threshold
        );
      case "level_reached":
        return ctx.level >= threshold;
      case "time_window":
        return (
          ctx.action === "snippet_created" &&
          triggerParam !== null &&
          inTimeWindow(ctx.date, triggerParam)
        );
      case "streak_days":
        return (
          (await counted("streak", () =>
            this.stats.getStreakDays(localDay(ctx.date)),
          )) >= threshold
        );
      case "manual":
      default:
        return false;
    }
  }
}

/** Dia local YYYY-MM-DD (streaks contam no fuso do usuário). */
export function localDay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
