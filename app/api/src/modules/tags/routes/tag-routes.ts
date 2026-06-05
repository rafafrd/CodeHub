import { Router } from "express";

import { asyncHandler } from "../../../shared/http/async-handler";
import { TagController } from "../controllers/tag-controller";

export function tagRoutes(controller: TagController): Router {
  const router = Router();

  router.post("/", asyncHandler(controller.create));
  router.get("/", asyncHandler(controller.list));
  router.put("/:id", asyncHandler(controller.update));
  router.delete("/:id", asyncHandler(controller.remove));

  return router;
}
