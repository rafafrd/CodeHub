import { Pool, RowDataPacket } from "mysql2/promise";

import { Achievement } from "../models/achievement";
import {
  AchievementRepository,
  UserAchievementRepository,
} from "./achievement-repository";

interface AchievementRow extends RowDataPacket {
  id: number;
  code: string;
  name: string;
  description: string | null;
  xp_reward: number;
}

function toDomain(row: AchievementRow): Achievement {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    xpReward: row.xp_reward,
  };
}

export class MySqlAchievementRepository implements AchievementRepository {
  constructor(private readonly pool: Pool) {}

  async findByCode(code: string): Promise<Achievement | null> {
    const [rows] = await this.pool.execute<AchievementRow[]>(
      "SELECT id, code, name, description, xp_reward FROM achievements WHERE code = ?",
      [code],
    );
    const row = rows[0];
    return row ? toDomain(row) : null;
  }

  async findAll(): Promise<Achievement[]> {
    const [rows] = await this.pool.execute<AchievementRow[]>(
      "SELECT id, code, name, description, xp_reward FROM achievements ORDER BY id",
    );
    return rows.map(toDomain);
  }
}

interface AchievementIdRow extends RowDataPacket {
  achievement_id: number;
}

export class MySqlUserAchievementRepository
  implements UserAchievementRepository
{
  constructor(private readonly pool: Pool) {}

  async isUnlocked(profileId: number, achievementId: number): Promise<boolean> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      "SELECT 1 FROM user_achievements WHERE profile_id = ? AND achievement_id = ? LIMIT 1",
      [profileId, achievementId],
    );
    return rows.length > 0;
  }

  async unlock(profileId: number, achievementId: number): Promise<void> {
    await this.pool.execute(
      "INSERT IGNORE INTO user_achievements (profile_id, achievement_id) VALUES (?, ?)",
      [profileId, achievementId],
    );
  }

  async listUnlockedIds(profileId: number): Promise<number[]> {
    const [rows] = await this.pool.execute<AchievementIdRow[]>(
      "SELECT achievement_id FROM user_achievements WHERE profile_id = ?",
      [profileId],
    );
    return rows.map((row) => row.achievement_id);
  }
}
