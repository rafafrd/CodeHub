import { AppError } from "../../../shared/errors/app-error";
import { xpToNextLevel } from "../domain/leveling";
import { Achievement } from "../models/achievement";
import { Profile } from "../models/profile";
import {
  AchievementRepository,
  UserAchievementRepository,
} from "../repositories/achievement-repository";
import { ProfileRepository } from "../repositories/profile-repository";

export interface AchievementView extends Achievement {
  unlocked: boolean;
}

export interface ProfileView {
  profile: Profile;
  xpToNextLevel: number;
  achievements: AchievementView[];
}

/** Agrega os dados do dashboard de gamificação: perfil + progresso + conquistas. */
export class GetProfileService {
  constructor(
    private readonly profiles: ProfileRepository,
    private readonly achievements: AchievementRepository,
    private readonly userAchievements: UserAchievementRepository,
  ) {}

  async execute(profileId: number): Promise<ProfileView> {
    const profile = await this.profiles.findById(profileId);
    if (!profile) {
      throw new AppError("Perfil não encontrado.", 404);
    }

    const [catalog, unlockedIds] = await Promise.all([
      this.achievements.findAll(),
      this.userAchievements.listUnlockedIds(profileId),
    ]);
    const unlocked = new Set(unlockedIds);

    return {
      profile,
      xpToNextLevel: xpToNextLevel(profile.xp),
      achievements: catalog.map((a) => ({ ...a, unlocked: unlocked.has(a.id) })),
    };
  }
}
