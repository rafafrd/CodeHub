import { Request, Response, Router } from "express";
import { z } from "zod";

import {
  createAccount,
  isConfigured,
} from "../../database/sqlite";
import { asyncHandler } from "../../shared/http/async-handler";
import { SetupService } from "./services/setup-service";

const setupBodySchema = z.object({
  name: z.string().trim().min(1, "O nome é obrigatório.").max(40),
});

/** Rotas de setup inicial (`/api/setup`) — criam a conta/arquivo .sqlite. */
export function buildSetupRouter(): Router {
  const service = new SetupService({ isConfigured, createAccount });
  const router = Router();

  router.get("/", (_req: Request, res: Response) => {
    res.status(200).json(service.status());
  });

  router.post(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      const { name } = setupBodySchema.parse(req.body);
      const result = await service.execute(name);
      res.status(201).json(result);
    }),
  );

  return router;
}
