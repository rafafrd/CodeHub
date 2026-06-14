import { GetDb } from "../../../database/sqlite";

/**
 * Contadores agregados usados pelo motor de conquistas (CheckAchievements).
 * Interface separada para os Services serem testáveis com mock.
 */
export interface StatsRepository {
  countSnippetsTotal(): Promise<number>;
  countSnippetsByBehavior(behavior: string): Promise<number>;
  countFoldersTotal(): Promise<number>;
  countTagsTotal(): Promise<number>;
  countTypesTotal(): Promise<number>;
  /** Registra atividade no dia (YYYY-MM-DD). Idempotente. */
  touchActivity(day: string): Promise<void>;
  /** Streak de dias consecutivos com atividade, terminando em `today`. */
  getStreakDays(today: string): Promise<number>;
}

function count(db: ReturnType<GetDb>, sql: string, ...params: unknown[]): number {
  const row = db.prepare(sql).get(...params) as { n: number };
  return row.n;
}

export class SqliteStatsRepository implements StatsRepository {
  constructor(private readonly db: GetDb) {}

  async countSnippetsTotal(): Promise<number> {
    return count(this.db(), "SELECT COUNT(*) AS n FROM snippets");
  }

  async countSnippetsByBehavior(behavior: string): Promise<number> {
    return count(
      this.db(),
      "SELECT COUNT(*) AS n FROM snippets s INNER JOIN project_types t ON t.id = s.type_id WHERE t.behavior = ?",
      behavior,
    );
  }

  async countFoldersTotal(): Promise<number> {
    // Seeds não contam: conquistas medem o que o USUÁRIO criou.
    return count(this.db(), "SELECT COUNT(*) AS n FROM folders WHERE seeded = 0");
  }

  async countTagsTotal(): Promise<number> {
    return count(this.db(), "SELECT COUNT(*) AS n FROM tags");
  }

  async countTypesTotal(): Promise<number> {
    return count(
      this.db(),
      "SELECT COUNT(*) AS n FROM project_types WHERE seeded = 0",
    );
  }

  async touchActivity(day: string): Promise<void> {
    this.db()
      .prepare("INSERT OR IGNORE INTO activity_log (day) VALUES (?)")
      .run(day);
  }

  async getStreakDays(today: string): Promise<number> {
    const rows = this.db()
      .prepare("SELECT day FROM activity_log ORDER BY day DESC")
      .all() as { day: string }[];

    const days = new Set(rows.map((r) => r.day));
    let streak = 0;
    const cursor = new Date(`${today}T00:00:00Z`);
    while (days.has(cursor.toISOString().slice(0, 10))) {
      streak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    return streak;
  }
}
