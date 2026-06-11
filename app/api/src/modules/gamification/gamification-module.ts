import { Router } from "express";

import { getDb } from "../../database/sqlite";
import { ProfileController } from "./controllers/profile-controller";
import { profileRoutes } from "./routes/profile-routes";
import {
  SqliteAchievementRepository,
  SqliteUserAchievementRepository,
} from "./repositories/sqlite-achievement-repository";
import { SqliteProfileRepository } from "./repositories/sqlite-profile-repository";
import { SqliteStatsRepository } from "./repositories/stats-repository";
import { AddXpService } from "./services/add-xp-service";
import { CheckAchievementsService } from "./services/check-achievements-service";
import { GamificationEvents } from "./services/gamification-events";
import { GetProfileService } from "./services/get-profile-service";
import { UnlockAchievementService } from "./services/unlock-achievement-service";

/**
 * Monta o orquestrador de gamificação (XP por ação + motor de conquistas).
 * Reutilizado pelos módulos de snippets e inventário.
 */
export function buildGamificationEvents(): GamificationEvents {
  const profiles = new SqliteProfileRepository(getDb);
  const achievements = new SqliteAchievementRepository(getDb);
  const userAchievements = new SqliteUserAchievementRepository(getDb);
  const stats = new SqliteStatsRepository(getDb);

  const addXp = new AddXpService(profiles);
  const unlock = new UnlockAchievementService(
    achievements,
    userAchievements,
    addXp,
  );
  const check = new CheckAchievementsService(
    achievements,
    userAchievements,
    stats,
    unlock,
  );

  return new GamificationEvents(addXp, check, stats);
}

/** Rotas do dashboard de gamificação (`/api/profile`). */
export function buildProfileRouter(): Router {
  const controller = new ProfileController(
    new GetProfileService(
      new SqliteProfileRepository(getDb),
      new SqliteAchievementRepository(getDb),
      new SqliteUserAchievementRepository(getDb),
    ),
  );

  return profileRoutes(controller);
}
