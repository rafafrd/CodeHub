import { Router } from "express";

import { getPool } from "../../database/connection";
import { ProfileController } from "./controllers/profile-controller";
import { MySqlAchievementRepository } from "./repositories/mysql-achievement-repository";
import { MySqlUserAchievementRepository } from "./repositories/mysql-achievement-repository";
import { MySqlProfileRepository } from "./repositories/mysql-profile-repository";
import { profileRoutes } from "./routes/profile-routes";
import { AddXpService } from "./services/add-xp-service";
import { GamificationEvents } from "./services/gamification-events";
import { GetProfileService } from "./services/get-profile-service";
import { UnlockAchievementService } from "./services/unlock-achievement-service";

/**
 * Monta o orquestrador de gamificação (XP por ação). Reutilizado pelos módulos
 * de snippets e inventário para recompensar as ações do usuário.
 */
export function buildGamificationEvents(): GamificationEvents {
  const pool = getPool();
  const profiles = new MySqlProfileRepository(pool);
  const achievements = new MySqlAchievementRepository(pool);
  const userAchievements = new MySqlUserAchievementRepository(pool);

  const addXp = new AddXpService(profiles);
  const unlock = new UnlockAchievementService(
    achievements,
    userAchievements,
    addXp,
  );

  return new GamificationEvents(addXp, unlock);
}

/** Rotas do dashboard de gamificação (`/api/profile`). */
export function buildProfileRouter(): Router {
  const pool = getPool();
  const controller = new ProfileController(
    new GetProfileService(
      new MySqlProfileRepository(pool),
      new MySqlAchievementRepository(pool),
      new MySqlUserAchievementRepository(pool),
    ),
  );

  return profileRoutes(controller);
}
