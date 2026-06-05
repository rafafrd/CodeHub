import { Request, Response } from "express";

import { DEFAULT_PROFILE_ID } from "../../gamification/default-profile";
import { GamificationEvents } from "../../gamification/services/gamification-events";
import { CreateFolderService } from "../services/create-folder-service";
import { ListFoldersService } from "../services/list-folders-service";
import { createFolderSchema } from "../validators/folder-schemas";

export class FolderController {
  constructor(
    private readonly listFolders: ListFoldersService,
    private readonly createFolder: CreateFolderService,
    private readonly gamification: GamificationEvents,
  ) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json(await this.listFolders.execute());
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const input = createFolderSchema.parse(req.body);
    const folder = await this.createFolder.execute(input);
    const gamification = await this.gamification.onFolderCreated(
      DEFAULT_PROFILE_ID,
    );
    res.status(201).json({ ...folder, gamification });
  };
}
