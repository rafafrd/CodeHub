import Database from "better-sqlite3";

import {
  SqliteAchievementRepository,
  SqliteUserAchievementRepository,
} from "../modules/gamification/repositories/sqlite-achievement-repository";
import { SqliteProfileRepository } from "../modules/gamification/repositories/sqlite-profile-repository";
import { SqliteStatsRepository } from "../modules/gamification/repositories/stats-repository";
import { SqliteFolderRepository } from "../modules/inventory/repositories/sqlite-folder-repository";
import { SqliteProjectTypeRepository } from "../modules/types/repositories/project-type-repository";
import { runMigrations } from "./sqlite";

/** Integração real (:memory:) das migrations e dos repositórios SQLite. */
describe("SQLite migrations + repositórios (integração)", () => {
  let db: Database.Database;
  const getDb = (): Database.Database => db;

  beforeEach(() => {
    db = new Database(":memory:");
    db.pragma("foreign_keys = ON");
    runMigrations(db);
    db.prepare(
      'INSERT INTO profiles (id, username, xp, level, "rank") VALUES (1, ?, 0, 1, ?)',
    ).run("dedsec", "Bronze");
  });

  afterEach(() => db.close());

  it("aplica seeds: 16 tipos com behavior, 16 pastas e 53 conquistas", () => {
    const types = db.prepare("SELECT COUNT(*) AS n FROM project_types").get() as { n: number };
    const folders = db.prepare("SELECT COUNT(*) AS n FROM folders").get() as { n: number };
    const achievements = db.prepare("SELECT COUNT(*) AS n FROM achievements").get() as { n: number };

    expect(types.n).toBe(16);
    expect(folders.n).toBe(16);
    expect(achievements.n).toBe(53);
  });

  it("é idempotente (rodar de novo não duplica seeds)", () => {
    runMigrations(db);
    const types = db.prepare("SELECT COUNT(*) AS n FROM project_types").get() as { n: number };
    expect(types.n).toBe(16);
  });

  it("ProfileRepository lê e atualiza progresso", async () => {
    const repo = new SqliteProfileRepository(getDb);

    await repo.updateProgress(1, { xp: 120, level: 2, rank: "Bronze" });
    const profile = await repo.findById(1);

    expect(profile).toMatchObject({ username: "dedsec", xp: 120, level: 2 });
  });

  it("AchievementRepository expõe o catálogo com gatilhos tipados", async () => {
    const repo = new SqliteAchievementRepository(getDb);

    const owl = await repo.findByCode("night_owl");

    expect(owl?.triggerKind).toBe("time_window");
    expect(owl?.triggerParam).toBe("02:00-04:00");
    expect(owl?.category).toBe("coruja");
  });

  it("UserAchievementRepository desbloqueia de forma idempotente", async () => {
    const repo = new SqliteUserAchievementRepository(getDb);

    await repo.unlock(1, 1);
    await repo.unlock(1, 1); // INSERT OR IGNORE

    expect(await repo.isUnlocked(1, 1)).toBe(true);
    expect(await repo.listUnlockedIds(1)).toEqual([1]);
  });

  it("FolderRepository respeita unicidade por pai e lista a árvore", async () => {
    const repo = new SqliteFolderRepository(getDb);

    expect(await repo.existsByNameInParent("Docker", 1)).toBe(true);
    expect(await repo.existsByNameInParent("Docker", null)).toBe(false);

    const id = await repo.create({ name: "Terraform", parentId: 1 });
    expect((await repo.findById(id))?.parentId).toBe(1);
    expect((await repo.findAll()).length).toBe(17);
  });

  it("ProjectTypeRepository cria tipos com behavior", async () => {
    const repo = new SqliteProjectTypeRepository(getDb);

    const id = await repo.create({ name: "Meu Regex", behavior: "regex" });

    expect((await repo.findById(id))?.behavior).toBe("regex");
  });

  it("StatsRepository NÃO conta seeds como criações do usuário", async () => {
    const stats = new SqliteStatsRepository(getDb);

    // 16 pastas e 16 tipos vieram das seeds — devem contar 0.
    expect(await stats.countFoldersTotal()).toBe(0);
    expect(await stats.countTypesTotal()).toBe(0);

    const folders = new SqliteFolderRepository(getDb);
    await folders.create({ name: "Minha Pasta", parentId: null });
    expect(await stats.countFoldersTotal()).toBe(1);
  });

  it("StatsRepository conta por behavior e calcula streak", async () => {
    const stats = new SqliteStatsRepository(getDb);
    db.prepare(
      "INSERT INTO snippets (title, type_id) VALUES ('r1', 10), ('r2', 10), ('doc', 2)",
    ).run();

    expect(await stats.countSnippetsTotal()).toBe(3);
    expect(await stats.countSnippetsByBehavior("regex")).toBe(2);

    await stats.touchActivity("2026-06-09");
    await stats.touchActivity("2026-06-10");
    await stats.touchActivity("2026-06-10"); // idempotente
    expect(await stats.getStreakDays("2026-06-10")).toBe(2);
    expect(await stats.getStreakDays("2026-06-12")).toBe(0);
  });
});
