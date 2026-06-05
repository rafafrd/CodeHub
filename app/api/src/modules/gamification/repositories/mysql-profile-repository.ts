import { Pool, RowDataPacket } from "mysql2/promise";

import { Profile, Rank } from "../models/profile";
import { ProfileProgress, ProfileRepository } from "./profile-repository";

interface ProfileRow extends RowDataPacket {
  id: number;
  username: string | null;
  xp: number;
  level: number;
  rank: string;
}

export class MySqlProfileRepository implements ProfileRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: number): Promise<Profile | null> {
    // `rank` é palavra reservada no MySQL 8 → crase obrigatória.
    const [rows] = await this.pool.execute<ProfileRow[]>(
      "SELECT id, username, xp, level, `rank` FROM profiles WHERE id = ?",
      [id],
    );
    const row = rows[0];
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
    await this.pool.execute(
      "UPDATE profiles SET xp = ?, level = ?, `rank` = ? WHERE id = ?",
      [progress.xp, progress.level, progress.rank, id],
    );
  }
}
