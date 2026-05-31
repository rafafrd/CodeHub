import path from "node:path";

import { Router } from "express";

import { getPool } from "../../database/connection";
import { MySqlProjectTypeRepository } from "../types/repositories/project-type-repository";
import { MySqlTagRepository } from "../tags/repositories/tag-repository";
import { SnippetController } from "./controllers/snippet-controller";
import { LocalFileSystemRepository } from "./repositories/file-system-repository";
import { MySqlSnippetRepository } from "./repositories/snippet-repository";
import { snippetRoutes } from "./routes/snippet-routes";
import { CreateSnippetService } from "./services/create-snippet-service";
import { DeleteSnippetService } from "./services/delete-snippet-service";
import { GetSnippetService } from "./services/get-snippet-service";
import { ListSnippetsService } from "./services/list-snippets-service";
import { UpdateSnippetService } from "./services/update-snippet-service";

/**
 * Raiz de composição do módulo de snippets: instancia repositórios concretos
 * (MySQL + FS), injeta nos Services e monta o controller/rotas.
 */
export function buildSnippetRouter(): Router {
  const pool = getPool();
  const storageDir = path.resolve(process.env.STORAGE_PATH ?? "storage");

  const snippetRepository = new MySqlSnippetRepository(pool);
  const fileSystemRepository = new LocalFileSystemRepository(storageDir);
  const projectTypeRepository = new MySqlProjectTypeRepository(pool);
  const tagRepository = new MySqlTagRepository(pool);

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
  );

  return snippetRoutes(controller);
}
