import { Router } from "express";

import { asyncHandler } from "../../../shared/http/async-handler";
import { ProfileController } from "../controllers/profile-controller";

export function profileRoutes(controller: ProfileController): Router {
  const router = Router();

  router.get("/", asyncHandler(controller.show));

  return router;
}
