import { Request, Response } from "express";

import { CreateProjectTypeService } from "../services/create-project-type-service";
import { DeleteProjectTypeService } from "../services/delete-project-type-service";
import { ListProjectTypesService } from "../services/list-project-types-service";
import { UpdateProjectTypeService } from "../services/update-project-type-service";
import {
  idParamSchema,
  projectTypeBodySchema,
} from "../validators/project-type-schemas";

export class ProjectTypeController {
  constructor(
    private readonly createService: CreateProjectTypeService,
    private readonly listService: ListProjectTypesService,
    private readonly updateService: UpdateProjectTypeService,
    private readonly deleteService: DeleteProjectTypeService,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const { name } = projectTypeBodySchema.parse(req.body);
    const result = await this.createService.execute({ name });
    res.status(201).json(result);
  };

  list = async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json(await this.listService.execute());
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = idParamSchema.parse(req.params);
    const { name } = projectTypeBodySchema.parse(req.body);
    await this.updateService.execute(id, { name });
    res.status(204).send();
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const { id } = idParamSchema.parse(req.params);
    await this.deleteService.execute(id);
    res.status(204).send();
  };
}
