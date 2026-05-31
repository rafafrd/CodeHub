import { AppError } from "../../../shared/errors/app-error";
import { ProjectTypeRepository } from "../repositories/project-type-repository";

export interface UpdateProjectTypeInput {
  name: string;
}

export class UpdateProjectTypeService {
  constructor(private readonly repository: ProjectTypeRepository) {}

  async execute(id: number, input: UpdateProjectTypeInput): Promise<void> {
    const name = input.name?.trim();
    if (!name) {
      throw new AppError("O nome do tipo é obrigatório.", 400);
    }

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new AppError("Tipo de projeto não encontrado.", 404);
    }

    const byName = await this.repository.findByName(name);
    if (byName && byName.id !== id) {
      throw new AppError("Já existe um tipo com esse nome.", 409);
    }

    await this.repository.update(id, { name });
  }
}
