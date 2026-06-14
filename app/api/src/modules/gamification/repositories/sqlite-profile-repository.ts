import { GetDb } from "../../../database/sqlite";
import { Profile, Rank } from "../models/profile";
import { ProfileProgress, ProfileRepository } from "./profile-repository";

interface ProfileRow {
  id: number;
  username: string | null;
  xp: number;
  level: number;
  rank: string;
}

export class SqliteProfileRepository implements ProfileRepository {
  constructor(private readonly db: GetDb) {}

  async findById(id: number): Promise<Profile | null> {
    const row = this.db()
      .prepare('SELECT id, username, xp, level, "rank" FROM profiles WHERE id = ?')
      .get(id) as ProfileRow | undefined;
    return row
      ? {
          id: row.id,
          username: row.username,
          xp: row.xp,
          level: row.level,
          rank: row.rank as Rank,
        }
      : null;
  }

  async updateProgress(id: number, progress: ProfileProgress): Promise<void> {
    this.db()
      .prepare('UPDATE profiles SET xp = ?, level = ?, "rank" = ? WHERE id = ?')
      .run(progress.xp, progress.level, progress.rank, id);
  }
}
