import { Router, Request, Response } from "express";

const router = Router();

/**
 * Healthcheck — usado por scans/CI e para validar que o scaffold sobe.
 */
router.get("/health", (_request: Request, response: Response) => {
  return response.status(200).json({ status: "ok", service: "codehub-api" });
});

// À medida que os módulos forem criados, plugue suas rotas aqui:
// router.use("/api/snippets", snippetRoutes);
// router.use("/api/types", typeRoutes);
// router.use("/api/tags", tagRoutes);

export { router };
