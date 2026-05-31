import { AppError } from "../../../shared/errors/app-error";
import { ProjectTypeRepository } from "../repositories/project-type-repository";

export class DeleteProjectTypeService {
  constructor(private readonly repository: ProjectTypeRepository) {}

  async execute(id: number): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new AppError("Tipo de projeto não encontrado.", 404);
    }

    await this.repository.delete(id);
  }
}
