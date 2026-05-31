import { Request, Response } from "express";

import { CreateTagService } from "../services/create-tag-service";
import { DeleteTagService } from "../services/delete-tag-service";
import { ListTagsService } from "../services/list-tags-service";
import { UpdateTagService } from "../services/update-tag-service";
import { idParamSchema, tagBodySchema } from "../validators/tag-schemas";

export class TagController {
  constructor(
    private readonly createService: CreateTagService,
    private readonly listService: ListTagsService,
    private readonly updateService: UpdateTagService,
    private readonly deleteService: DeleteTagService,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const { name } = tagBodySchema.parse(req.body);
    const result = await this.createService.execute({ name });
    res.status(201).json(result);
  };

  list = async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json(await this.listService.execute());
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = idParamSchema.parse(req.params);
    const { name } = tagBodySchema.parse(req.body);
    await this.updateService.execute(id, { name });
    res.status(204).send();
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const { id } = idParamSchema.parse(req.params);
    await this.deleteService.execute(id);
    res.status(204).send();
  };
}
