import { AppError } from "../../../shared/errors/app-error";
import { TagRepository } from "../repositories/tag-repository";

export class DeleteTagService {
  constructor(private readonly repository: TagRepository) {}

  async execute(id: number): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new AppError("Tag não encontrada.", 404);
    }

    await this.repository.delete(id);
  }
}
