import { Achievement } from "../models/achievement";

export interface AchievementRepository {
  findByCode(code: string): Promise<Achievement | null>;
  findAll(): Promise<Achievement[]>;
}

export interface UserAchievementRepository {
  isUnlocked(profileId: number, achievementId: number): Promise<boolean>;
  unlock(profileId: number, achievementId: number): Promise<void>;
  listUnlockedIds(profileId: number): Promise<number[]>;
}
