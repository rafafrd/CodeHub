import { AppError } from "../../../shared/errors/app-error";
import { TagRepository } from "../repositories/tag-repository";

export interface UpdateTagInput {
  name: string;
}

export class UpdateTagService {
  constructor(private readonly repository: TagRepository) {}

  async execute(id: number, input: UpdateTagInput): Promise<void> {
    const name = input.name?.trim();
    if (!name) {
      throw new AppError("O nome da tag é obrigatório.", 400);
    }

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new AppError("Tag não encontrada.", 404);
    }

    const byName = await this.repository.findByName(name);
    if (byName && byName.id !== id) {
      throw new AppError("Já existe uma tag com esse nome.", 409);
    }

    await this.repository.update(id, { name });
  }
}
