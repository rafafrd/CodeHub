import { Request, Response } from "express";

import { DEFAULT_PROFILE_ID } from "../default-profile";
import { GetProfileService } from "../services/get-profile-service";

export class ProfileController {
  constructor(private readonly getProfile: GetProfileService) {}

  show = async (_req: Request, res: Response): Promise<void> => {
    const view = await this.getProfile.execute(DEFAULT_PROFILE_ID);
    res.status(200).json(view);
  };
}
