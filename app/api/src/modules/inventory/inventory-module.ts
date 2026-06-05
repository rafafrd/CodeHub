import { Router } from "express";

import { getPool } from "../../database/connection";
import { buildGamificationEvents } from "../gamification/gamification-module";
import { FolderController } from "./controllers/folder-controller";
import { MySqlFolderRepository } from "./repositories/mysql-folder-repository";
import { folderRoutes } from "./routes/folder-routes";
import { CreateFolderService } from "./services/create-folder-service";
import { ListFoldersService } from "./services/list-folders-service";

/** Rotas do inventário de pastas (`/api/folders`). */
export function buildFolderRouter(): Router {
  const folders = new MySqlFolderRepository(getPool());

  const controller = new FolderController(
    new ListFoldersService(folders),
    new CreateFolderService(folders),
    buildGamificationEvents(),
  );

  return folderRoutes(controller);
}
