import { Router } from "express";

import { asyncHandler } from "../../../shared/http/async-handler";
import { ProjectTypeController } from "../controllers/project-type-controller";

export function projectTypeRoutes(controller: ProjectTypeController): Router {
  const router = Router();

  router.post("/", asyncHandler(controller.create));
  router.get("/", asyncHandler(controller.list));
  router.put("/:id", asyncHandler(controller.update));
  router.delete("/:id", asyncHandler(controller.remove));

  return router;
}
