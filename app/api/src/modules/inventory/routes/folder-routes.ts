import { Router } from "express";

import { asyncHandler } from "../../../shared/http/async-handler";
import { FolderController } from "../controllers/folder-controller";

export function folderRoutes(controller: FolderController): Router {
  const router = Router();

  router.get("/", asyncHandler(controller.list));
  router.post("/", asyncHandler(controller.create));

  return router;
}
