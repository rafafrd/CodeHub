import { AppError } from "../../../shared/errors/app-error";
import { Achievement } from "../models/achievement";
import {
  AchievementRepository,
  UserAchievementRepository,
} from "../repositories/achievement-repository";
import { AddXpService } from "./add-xp-service";
import { UnlockAchievementService } from "./unlock-achievement-service";

describe("UnlockAchievementService", () => {
  const achievement: Achievement = {
    id: 7,
    code: "first_script",
    name: "Primeiro Script",
    description: null,
    xpReward: 50,
  };

  let achievements: { findByCode: jest.Mock };
  let userAchievements: { isUnlocked: jest.Mock; unlock: jest.Mock };
  let addXp: { execute: jest.Mock };
  let service: UnlockAchievementService;

  beforeEach(() => {
    achievements = { findByCode: jest.fn().mockResolvedValue(achievement) };
    userAchievements = {
      isUnlocked: jest.fn().mockResolvedValue(false),
      unlock: jest.fn().mockResolvedValue(undefined),
    };
    addXp = {
      execute: jest.fn().mockResolvedValue({
        profile: { id: 1, username: null, xp: 50, level: 1, rank: "Bronze" },
        leveledUp: false,
        rankChanged: false,
        previousLevel: 1,
        previousRank: "Bronze",
      }),
    };
    service = new UnlockAchievementService(
      achievements as unknown as AchievementRepository,
      userAchievements as unknown as UserAchievementRepository,
      addXp as unknown as AddXpService,
    );
  });

  it("desbloqueia pela primeira vez e concede o XP de recompensa", async () => {
    const result = await service.execute(1, "first_script");

    expect(result.unlocked).toBe(true);
    expect(userAchievements.unlock).toHaveBeenCalledWith(1, 7);
    expect(addXp.execute).toHaveBeenCalledWith(1, 50);
    expect(result.xpResult).not.toBeNull();
  });

  it("é idempotente: não regrava nem concede XP se já desbloqueada", async () => {
    userAchievements.isUnlocked.mockResolvedValueOnce(true);

    const result = await service.execute(1, "first_script");

    expect(result.unlocked).toBe(false);
    expect(userAchievements.unlock).not.toHaveBeenCalled();
    expect(addXp.execute).not.toHaveBeenCalled();
  });

  it("falha com 404 para conquista inexistente", async () => {
    achievements.findByCode.mockResolvedValueOnce(null);
    await expect(service.execute(1, "nope")).rejects.toBeInstanceOf(AppError);
  });

  it("não concede XP quando a recompensa é 0", async () => {
    achievements.findByCode.mockResolvedValueOnce({ ...achievement, xpReward: 0 });

    const result = await service.execute(1, "first_script");

    expect(result.unlocked).toBe(true);
    expect(addXp.execute).not.toHaveBeenCalled();
    expect(result.xpResult).toBeNull();
  });
});
