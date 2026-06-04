import { AppError } from "../../../shared/errors/app-error";
import { Profile } from "../models/profile";
import { ProfileRepository } from "../repositories/profile-repository";
import { AddXpService } from "./add-xp-service";

describe("AddXpService", () => {
  let profiles: { findById: jest.Mock; updateProgress: jest.Mock };
  let service: AddXpService;

  const base: Profile = {
    id: 1,
    username: "dedsec",
    xp: 80,
    level: 1,
    rank: "Bronze",
  };

  beforeEach(() => {
    profiles = {
      findById: jest.fn().mockResolvedValue({ ...base }),
      updateProgress: jest.fn().mockResolvedValue(undefined),
    };
    service = new AddXpService(profiles as unknown as ProfileRepository);
  });

  it("soma XP e persiste o progresso", async () => {
    const result = await service.execute(1, 10);

    expect(result.profile.xp).toBe(90);
    expect(result.leveledUp).toBe(false);
    expect(profiles.updateProgress).toHaveBeenCalledWith(1, {
      xp: 90,
      level: 1,
      rank: "Bronze",
    });
  });

  it("sobe de nível ao cruzar o limiar de 100 XP", async () => {
    const result = await service.execute(1, 30); // 80 -> 110 => nível 2

    expect(result.profile.level).toBe(2);
    expect(result.leveledUp).toBe(true);
    expect(result.previousLevel).toBe(1);
  });

  it("recalcula a patente quando muda de elo", async () => {
    // xp 480 (nível 4, Bronze) + 30 => 510 => nível 6 => Prata
    profiles.findById.mockResolvedValueOnce({
      ...base,
      xp: 480,
      level: 4,
      rank: "Bronze",
    });

    const result = await service.execute(1, 30);

    expect(result.profile.rank).toBe("Prata");
    expect(result.rankChanged).toBe(true);
  });

  it("rejeita XP não positivo", async () => {
    await expect(service.execute(1, 0)).rejects.toBeInstanceOf(AppError);
    expect(profiles.updateProgress).not.toHaveBeenCalled();
  });

  it("rejeita perfil inexistente (404)", async () => {
    profiles.findById.mockResolvedValueOnce(null);
    await expect(service.execute(99, 10)).rejects.toBeInstanceOf(AppError);
  });
});
