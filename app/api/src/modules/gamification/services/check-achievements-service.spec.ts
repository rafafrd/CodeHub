import { Achievement } from "../models/achievement";
import {
  AchievementRepository,
  UserAchievementRepository,
} from "../repositories/achievement-repository";
import { StatsRepository } from "../repositories/stats-repository";
import { CheckAchievementsService } from "./check-achievements-service";
import { UnlockAchievementService } from "./unlock-achievement-service";

function ach(partial: Partial<Achievement> & { id: number; code: string }): Achievement {
  return {
    name: partial.code,
    description: null,
    xpReward: 50,
    category: "geral",
    triggerKind: "manual",
    triggerParam: null,
    threshold: 1,
    ...partial,
  };
}

const CATALOG: Achievement[] = [
  ach({ id: 1, code: "first_script", triggerKind: "count_snippets_total", threshold: 1 }),
  ach({ id: 2, code: "collector_5", triggerKind: "count_snippets_total", threshold: 5 }),
  ach({ id: 3, code: "organizer", triggerKind: "count_folders_total", threshold: 1 }),
  ach({ id: 4, code: "spec_regex", triggerKind: "count_by_behavior", triggerParam: "regex", threshold: 5 }),
  ach({ id: 5, code: "level_2", triggerKind: "level_reached", threshold: 2 }),
  ach({ id: 6, code: "night_owl", triggerKind: "time_window", triggerParam: "02:00-04:00" }),
  ach({ id: 7, code: "midnight_hacker", triggerKind: "time_window", triggerParam: "23:00-01:00" }),
  ach({ id: 8, code: "streak_3", triggerKind: "streak_days", threshold: 3 }),
];

describe("CheckAchievementsService", () => {
  let achievements: { findAll: jest.Mock; findByCode: jest.Mock };
  let userAchievements: { listUnlockedIds: jest.Mock };
  let stats: {
    countSnippetsTotal: jest.Mock;
    countSnippetsByBehavior: jest.Mock;
    countFoldersTotal: jest.Mock;
    countTagsTotal: jest.Mock;
    countTypesTotal: jest.Mock;
    touchActivity: jest.Mock;
    getStreakDays: jest.Mock;
  };
  let unlock: { execute: jest.Mock };
  let service: CheckAchievementsService;

  const baseCtx = {
    action: "snippet_created" as const,
    level: 1,
    date: new Date("2026-06-10T15:00:00"),
  };

  beforeEach(() => {
    achievements = {
      findAll: jest.fn().mockResolvedValue(CATALOG),
      findByCode: jest.fn(),
    };
    userAchievements = { listUnlockedIds: jest.fn().mockResolvedValue([]) };
    stats = {
      countSnippetsTotal: jest.fn().mockResolvedValue(0),
      countSnippetsByBehavior: jest.fn().mockResolvedValue(0),
      countFoldersTotal: jest.fn().mockResolvedValue(0),
      countTagsTotal: jest.fn().mockResolvedValue(0),
      countTypesTotal: jest.fn().mockResolvedValue(0),
      touchActivity: jest.fn(),
      getStreakDays: jest.fn().mockResolvedValue(1),
    };
    unlock = {
      execute: jest.fn().mockImplementation((_p: number, code: string) => {
        const achievement = CATALOG.find((a) => a.code === code);
        return Promise.resolve({ unlocked: true, achievement, xpResult: null });
      }),
    };
    service = new CheckAchievementsService(
      achievements as unknown as AchievementRepository,
      userAchievements as unknown as UserAchievementRepository,
      stats as unknown as StatsRepository,
      unlock as unknown as UnlockAchievementService,
    );
  });

  it("desbloqueia conquistas de contagem quando o limiar é atingido", async () => {
    stats.countSnippetsTotal.mockResolvedValue(5);

    const results = await service.execute(1, baseCtx);
    const codes = results.map((r) => r.achievement.code);

    expect(codes).toContain("first_script");
    expect(codes).toContain("collector_5");
    expect(codes).not.toContain("organizer");
  });

  it("ignora conquistas já desbloqueadas (não reavalia)", async () => {
    stats.countSnippetsTotal.mockResolvedValue(10);
    userAchievements.listUnlockedIds.mockResolvedValue([1, 2]);

    const results = await service.execute(1, baseCtx);

    expect(results).toHaveLength(0);
    expect(unlock.execute).not.toHaveBeenCalled();
  });

  it("avalia count_by_behavior usando o parâmetro do gatilho", async () => {
    stats.countSnippetsByBehavior.mockImplementation((b: string) =>
      Promise.resolve(b === "regex" ? 5 : 0),
    );

    const results = await service.execute(1, baseCtx);

    expect(results.map((r) => r.achievement.code)).toContain("spec_regex");
    expect(stats.countSnippetsByBehavior).toHaveBeenCalledWith("regex");
  });

  it("avalia level_reached pelo nível do contexto", async () => {
    const results = await service.execute(1, { ...baseCtx, level: 2 });

    expect(results.map((r) => r.achievement.code)).toContain("level_2");
  });

  it("desbloqueia time_window dentro da janela (e respeita janela cruzando a meia-noite)", async () => {
    const at3am = await service.execute(1, {
      ...baseCtx,
      date: new Date("2026-06-10T03:30:00"),
    });
    expect(at3am.map((r) => r.achievement.code)).toContain("night_owl");

    const at0030 = await service.execute(1, {
      ...baseCtx,
      date: new Date("2026-06-10T00:30:00"),
    });
    expect(at0030.map((r) => r.achievement.code)).toContain("midnight_hacker");

    const at15h = await service.execute(1, baseCtx);
    expect(at15h.map((r) => r.achievement.code)).not.toContain("night_owl");
  });

  it("não dispara time_window para ações que não são criação de artefato", async () => {
    const results = await service.execute(1, {
      action: "folder_created",
      level: 1,
      date: new Date("2026-06-10T03:00:00"),
    });

    expect(results.map((r) => r.achievement.code)).not.toContain("night_owl");
  });

  it("avalia streak_days pelo streak atual", async () => {
    stats.getStreakDays.mockResolvedValue(3);

    const results = await service.execute(1, baseCtx);

    expect(results.map((r) => r.achievement.code)).toContain("streak_3");
  });
});
