import { GetDb } from "../../../database/sqlite";
import { Achievement, TriggerKind } from "../models/achievement";
import {
  AchievementRepository,
  UserAchievementRepository,
} from "./achievement-repository";

interface AchievementRow {
  id: number;
  code: string;
  name: string;
  description: string | null;
  xp_reward: number;
  category: string;
  trigger_kind: string;
  trigger_param: string | null;
  threshold: number;
}

const SELECT =
  "SELECT id, code, name, description, xp_reward, category, trigger_kind, trigger_param, threshold FROM achievements";

function toDomain(row: AchievementRow): Achievement {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    xpReward: row.xp_reward,
    category: row.category,
    triggerKind: row.trigger_kind as TriggerKind,
    triggerParam: row.trigger_param,
    threshold: row.threshold,
  };
}

export class SqliteAchievementRepository implements AchievementRepository {
  constructor(private readonly db: GetDb) {}

  async findByCode(code: string): Promise<Achievement | null> {
    const row = this.db()
      .prepare(`${SELECT} WHERE code = ?`)
      .get(code) as AchievementRow | undefined;
    return row ? toDomain(row) : null;
  }

  async findAll(): Promise<Achievement[]> {
    const rows = this.db()
      .prepare(`${SELECT} ORDER BY id`)
      .all() as AchievementRow[];
    return rows.map(toDomain);
  }
}

export class SqliteUserAchievementRepository
  implements UserAchievementRepository
{
  constructor(private readonly db: GetDb) {}

  async isUnlocked(profileId: number, achievementId: number): Promise<boolean> {
    const row = this.db()
      .prepare(
        "SELECT 1 FROM user_achievements WHERE profile_id = ? AND achievement_id = ? LIMIT 1",
      )
      .get(profileId, achievementId);
    return row !== undefined;
  }

  async unlock(profileId: number, achievementId: number): Promise<void> {
    this.db()
      .prepare(
        "INSERT OR IGNORE INTO user_achievements (profile_id, achievement_id) VALUES (?, ?)",
      )
      .run(profileId, achievementId);
  }

  async listUnlockedIds(profileId: number): Promise<number[]> {
    const rows = this.db()
      .prepare(
        "SELECT achievement_id FROM user_achievements WHERE profile_id = ?",
      )
      .all(profileId) as { achievement_id: number }[];
    return rows.map((row) => row.achievement_id);
  }
}
