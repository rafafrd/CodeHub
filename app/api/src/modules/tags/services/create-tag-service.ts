import { AppError } from "../../../shared/errors/app-error";
import { Tag } from "../models/tag";
import { TagRepository } from "../repositories/tag-repository";

export interface CreateTagInput {
  name: string;
}

export class CreateTagService {
  constructor(private readonly repository: TagRepository) {}

  async execute(input: CreateTagInput): Promise<Tag> {
    const name = input.name?.trim();
    if (!name) {
      throw new AppError("O nome da tag é obrigatório.", 400);
    }

    const existing = await this.repository.findByName(name);
    if (existing) {
      throw new AppError("Já existe uma tag com esse nome.", 409);
    }

    const id = await this.repository.create({ name });
    return { id, name };
  }
}
