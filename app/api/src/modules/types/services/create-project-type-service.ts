import { AppError } from "../../../shared/errors/app-error";
import { ProjectType } from "../models/project-type";
import { ProjectTypeRepository } from "../repositories/project-type-repository";

export interface CreateProjectTypeInput {
  name: string;
}

export class CreateProjectTypeService {
  constructor(private readonly repository: ProjectTypeRepository) {}

  async execute(input: CreateProjectTypeInput): Promise<ProjectType> {
    const name = input.name?.trim();
    if (!name) {
      throw new AppError("O nome do tipo é obrigatório.", 400);
    }

    const existing = await this.repository.findByName(name);
    if (existing) {
      throw new AppError("Já existe um tipo com esse nome.", 409);
    }

    const id = await this.repository.create({ name });
    return { id, name };
  }
}
