import { AppError } from "../../../shared/errors/app-error";
import {
  AchievementRepository,
  UserAchievementRepository,
} from "../repositories/achievement-repository";
import { ProfileRepository } from "../repositories/profile-repository";
import { GetProfileService } from "./get-profile-service";

describe("GetProfileService", () => {
  let profiles: { findById: jest.Mock };
  let achievements: { findAll: jest.Mock };
  let userAchievements: { listUnlockedIds: jest.Mock };
  let service: GetProfileService;

  beforeEach(() => {
    profiles = {
      findById: jest.fn().mockResolvedValue({
        id: 1,
        username: "dedsec",
        xp: 120,
        level: 2,
        rank: "Bronze",
      }),
    };
    achievements = {
      findAll: jest.fn().mockResolvedValue([
        { id: 1, code: "first_script", name: "Primeiro Script", description: null, xpReward: 50 },
        { id: 2, code: "organizer", name: "Organizador", description: null, xpReward: 40 },
      ]),
    };
    userAchievements = { listUnlockedIds: jest.fn().mockResolvedValue([1]) };
    service = new GetProfileService(
      profiles as unknown as ProfileRepository,
      achievements as unknown as AchievementRepository,
      userAchievements as unknown as UserAchievementRepository,
    );
  });

  it("retorna perfil, XP restante e conquistas com flag de desbloqueio", async () => {
    const view = await service.execute(1);

    expect(view.profile.level).toBe(2);
    expect(view.xpToNextLevel).toBe(80); // 120 -> próximo nível em 200
    expect(view.achievements).toHaveLength(2);
    expect(view.achievements.find((a) => a.id === 1)?.unlocked).toBe(true);
    expect(view.achievements.find((a) => a.id === 2)?.unlocked).toBe(false);
  });

  it("falha com 404 para perfil inexistente", async () => {
    profiles.findById.mockResolvedValueOnce(null);
    await expect(service.execute(99)).rejects.toBeInstanceOf(AppError);
  });
});
