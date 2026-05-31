import { Router, Request, Response } from "express";

import { buildSnippetRouter } from "../../modules/snippets/snippet-module";

const router = Router();

/**
 * Healthcheck — usado por scans/CI e para validar que o scaffold sobe.
 */
router.get("/health", (_request: Request, response: Response) => {
  return response.status(200).json({ status: "ok", service: "codehub-api" });
});

router.use("/api/snippets", buildSnippetRouter());

// Próximos módulos (Fase 6):
// router.use("/api/types", buildTypeRouter());
// router.use("/api/tags", buildTagRouter());

export { router };
