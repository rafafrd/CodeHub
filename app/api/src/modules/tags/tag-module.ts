import { Router } from "express";

import { getPool } from "../../database/connection";
import { TagController } from "./controllers/tag-controller";
import { MySqlTagRepository } from "./repositories/tag-repository";
import { tagRoutes } from "./routes/tag-routes";
import { CreateTagService } from "./services/create-tag-service";
import { DeleteTagService } from "./services/delete-tag-service";
import { ListTagsService } from "./services/list-tags-service";
import { UpdateTagService } from "./services/update-tag-service";

/** Raiz de composição do módulo de tags. */
export function buildTagRouter(): Router {
  const repository = new MySqlTagRepository(getPool());

  const controller = new TagController(
    new CreateTagService(repository),
    new ListTagsService(repository),
    new UpdateTagService(repository),
    new DeleteTagService(repository),
  );

  return tagRoutes(controller);
}
