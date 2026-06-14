import { StatsRepository } from "../repositories/stats-repository";
import { AddXpService } from "./add-xp-service";
import { CheckAchievementsService } from "./check-achievements-service";
import { GamificationEvents, XP_REWARDS } from "./gamification-events";

describe("GamificationEvents", () => {
  let addXp: { execute: jest.Mock };
  let check: { execute: jest.Mock };
  let stats: { touchActivity: jest.Mock };
  let events: GamificationEvents;

  const fixedNow = new Date("2026-06-10T15:00:00");

  beforeEach(() => {
    addXp = {
      execute: jest.fn().mockResolvedValue({
        profile: { id: 1, username: null, xp: 25, level: 1, rank: "Bronze" },
        leveledUp: false,
        rankChanged: false,
        previousLevel: 1,
        previousRank: "Bronze",
      }),
    };
    check = { execute: jest.fn().mockResolvedValue([]) };
    stats = { touchActivity: jest.fn().mockResolvedValue(undefined) };
    events = new GamificationEvents(
      addXp as unknown as AddXpService,
      check as unknown as CheckAchievementsService,
      stats as unknown as StatsRepository,
      () => fixedNow,
    );
  });

  it("registra atividade do dia, concede XP base e roda o motor de conquistas", async () => {
    const outcome = await events.onSnippetCreated(1);

    expect(stats.touchActivity).toHaveBeenCalledWith("2026-06-10");
    expect(addXp.execute).toHaveBeenCalledWith(1, XP_REWARDS.snippetCreated);
    expect(check.execute).toHaveBeenCalledWith(1, {
      action: "snippet_created",
      level: 1,
      date: fixedNow,
    });
    expect(outcome.xpGained).toBe(XP_REWARDS.snippetCreated);
    expect(outcome.unlocked).toHaveLength(0);
  });

  it("agrega XP e progresso das conquistas desbloqueadas", async () => {
    check.execute.mockResolvedValueOnce([
      {
        unlocked: true,
        achievement: {
          id: 1,
          code: "first_script",
          name: "Primeiro Script",
          description: null,
          xpReward: 50,
          category: "arquivista",
          triggerKind: "count_snippets_total",
          triggerParam: null,
          threshold: 1,
        },
        xpResult: {
          profile: { id: 1, username: null, xp: 110, level: 2, rank: "Bronze" },
          leveledUp: true,
          rankChanged: false,
          previousLevel: 1,
          previousRank: "Bronze",
        },
      },
    ]);

    const outcome = await events.onSnippetCreated(1);

    expect(outcome.unlocked.map((u) => u.code)).toEqual(["first_script"]);
    expect(outcome.xpGained).toBe(XP_REWARDS.snippetCreated + 50);
    expect(outcome.level).toBe(2);
    expect(outcome.leveledUp).toBe(true);
  });

  it("onFolderCreated usa o XP base de pasta e a ação correta", async () => {
    await events.onFolderCreated(1);

    expect(addXp.execute).toHaveBeenCalledWith(1, XP_REWARDS.folderCreated);
    expect(check.execute).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ action: "folder_created" }),
    );
  });
});
