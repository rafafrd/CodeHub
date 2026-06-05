import { AddXpService } from "./add-xp-service";
import { GamificationEvents, XP_REWARDS } from "./gamification-events";
import { UnlockAchievementService } from "./unlock-achievement-service";

describe("GamificationEvents", () => {
  let addXp: { execute: jest.Mock };
  let unlock: { execute: jest.Mock };
  let events: GamificationEvents;

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
    unlock = {
      execute: jest.fn().mockResolvedValue({
        unlocked: false,
        achievement: { id: 1, code: "first_script", name: "Primeiro Script", description: null, xpReward: 50 },
        xpResult: null,
      }),
    };
    events = new GamificationEvents(
      addXp as unknown as AddXpService,
      unlock as unknown as UnlockAchievementService,
    );
  });

  it("ao criar snippet concede XP base e tenta a conquista first_script", async () => {
    const outcome = await events.onSnippetCreated(1);

    expect(addXp.execute).toHaveBeenCalledWith(1, XP_REWARDS.snippetCreated);
    expect(unlock.execute).toHaveBeenCalledWith(1, "first_script");
    expect(outcome.xpGained).toBe(XP_REWARDS.snippetCreated);
    expect(outcome.unlocked).toHaveLength(0); // já tinha a conquista
  });

  it("soma o XP da conquista e a inclui quando desbloqueada agora", async () => {
    unlock.execute.mockResolvedValueOnce({
      unlocked: true,
      achievement: { id: 1, code: "first_script", name: "Primeiro Script", description: null, xpReward: 50 },
      xpResult: {
        profile: { id: 1, username: null, xp: 75, level: 1, rank: "Bronze" },
        leveledUp: false,
        rankChanged: false,
        previousLevel: 1,
        previousRank: "Bronze",
      },
    });

    const outcome = await events.onSnippetCreated(1);

    expect(outcome.unlocked).toHaveLength(1);
    expect(outcome.unlocked[0].code).toBe("first_script");
    expect(outcome.xpGained).toBe(XP_REWARDS.snippetCreated + 50);
  });
});
