import { Request, Response } from "express";

import { DEFAULT_PROFILE_ID } from "../../gamification/default-profile";
import { GamificationEvents } from "../../gamification/services/gamification-events";
import { CreateSnippetService } from "../services/create-snippet-service";
import { DeleteSnippetService } from "../services/delete-snippet-service";
import { GetSnippetService } from "../services/get-snippet-service";
import { ListSnippetsService } from "../services/list-snippets-service";
import { UpdateSnippetService } from "../services/update-snippet-service";
import {
  createSnippetSchema,
  idParamSchema,
  listSnippetsQuerySchema,
  updateSnippetSchema,
} from "../validators/snippet-schemas";

/**
 * Fronteira HTTP do módulo de snippets: valida a entrada (Zod) e delega aos
 * Services. NÃO contém regra de negócio nem acesso a FS/DB (arquitetura limpa).
 * Erros lançados sobem para o middleware central via `asyncHandler`.
 */
export class SnippetController {
  constructor(
    private readonly createSnippetService: CreateSnippetService,
    private readonly listSnippetsService: ListSnippetsService,
    private readonly getSnippetService: GetSnippetService,
    private readonly updateSnippetService: UpdateSnippetService,
    private readonly deleteSnippetService: DeleteSnippetService,
    private readonly gamification?: GamificationEvents,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const input = createSnippetSchema.parse(req.body);
    const result = await this.createSnippetService.execute(input);

    // Recompensa a ação (XP + conquista) quando a gamificação está plugada.
    if (this.gamification) {
      const gamification = await this.gamification.onSnippetCreated(
        DEFAULT_PROFILE_ID,
      );
      res.status(201).json({ ...result, gamification });
      return;
    }

    res.status(201).json(result);
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const filters = listSnippetsQuerySchema.parse(req.query);
    const snippets = await this.listSnippetsService.execute(filters);
    res.status(200).json(snippets);
  };

  show = async (req: Request, res: Response): Promise<void> => {
    const { id } = idParamSchema.parse(req.params);
    const detail = await this.getSnippetService.execute(id);
    res.status(200).json(detail);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateSnippetSchema.parse(req.body);
    await this.updateSnippetService.execute(id, input);
    res.status(204).send();
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const { id } = idParamSchema.parse(req.params);
    await this.deleteSnippetService.execute(id);
    res.status(204).send();
  };
}
