import { Router } from "express";

import { asyncHandler } from "../../../shared/http/async-handler";
import { SnippetController } from "../controllers/snippet-controller";

/**
 * Mapeia os endpoints REST de snippets (SDD §5). Recebe o controller já
 * montado (injeção de dependência), o que permite testar as rotas com
 * Services mockados.
 */
export function snippetRoutes(controller: SnippetController): Router {
  const router = Router();

  router.post("/", asyncHandler(controller.create));
  router.get("/", asyncHandler(controller.list));
  router.get("/:id", asyncHandler(controller.show));
  router.put("/:id", asyncHandler(controller.update));
  router.delete("/:id", asyncHandler(controller.remove));

  return router;
}
