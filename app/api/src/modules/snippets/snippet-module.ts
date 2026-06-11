import path from "node:path";

import { Router } from "express";

import { getDb } from "../../database/sqlite";
import { buildGamificationEvents } from "../gamification/gamification-module";
import { SqliteProjectTypeRepository } from "../types/repositories/project-type-repository";
import { SqliteTagRepository } from "../tags/repositories/tag-repository";
import { SnippetController } from "./controllers/snippet-controller";
import { LocalFileSystemRepository } from "./repositories/file-system-repository";
import { SqliteSnippetRepository } from "./repositories/snippet-repository";
import { snippetRoutes } from "./routes/snippet-routes";
import { CreateSnippetService } from "./services/create-snippet-service";
import { DeleteSnippetService } from "./services/delete-snippet-service";
import { GetSnippetService } from "./services/get-snippet-service";
import { ListSnippetsService } from "./services/list-snippets-service";
import { UpdateSnippetService } from "./services/update-snippet-service";

/**
 * Raiz de composição do módulo de snippets: SQLite + FS injetados nos
 * Services, controller e rotas montados por cima.
 */
export function buildSnippetRouter(): Router {
  const storageDir = path.resolve(process.env.STORAGE_PATH ?? "storage");

  const snippetRepository = new SqliteSnippetRepository(getDb);
  const fileSystemRepository = new LocalFileSystemRepository(storageDir);
  const projectTypeRepository = new SqliteProjectTypeRepository(getDb);
  const tagRepository = new SqliteTagRepository(getDb);

  const controller = new SnippetController(
    new CreateSnippetService(
      snippetRepository,
      fileSystemRepository,
      projectTypeRepository,
      tagRepository,
    ),
    new ListSnippetsService(snippetRepository),
    new GetSnippetService(snippetRepository, fileSystemRepository),
    new UpdateSnippetService(
      snippetRepository,
      fileSystemRepository,
      projectTypeRepository,
      tagRepository,
    ),
    new DeleteSnippetService(snippetRepository, fileSystemRepository),
    buildGamificationEvents(),
  );

  return snippetRoutes(controller);
}
