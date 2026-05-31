import { Router } from "express";

import { getPool } from "../../database/connection";
import { ProjectTypeController } from "./controllers/project-type-controller";
import { MySqlProjectTypeRepository } from "./repositories/project-type-repository";
import { projectTypeRoutes } from "./routes/project-type-routes";
import { CreateProjectTypeService } from "./services/create-project-type-service";
import { DeleteProjectTypeService } from "./services/delete-project-type-service";
import { ListProjectTypesService } from "./services/list-project-types-service";
import { UpdateProjectTypeService } from "./services/update-project-type-service";

/** Raiz de composição do módulo de tipos de projeto. */
export function buildTypeRouter(): Router {
  const repository = new MySqlProjectTypeRepository(getPool());

  const controller = new ProjectTypeController(
    new CreateProjectTypeService(repository),
    new ListProjectTypesService(repository),
    new UpdateProjectTypeService(repository),
    new DeleteProjectTypeService(repository),
  );

  return projectTypeRoutes(controller);
}
