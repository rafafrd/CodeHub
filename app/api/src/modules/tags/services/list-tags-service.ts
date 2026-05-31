import { Tag } from "../models/tag";
import { TagRepository } from "../repositories/tag-repository";

export class ListTagsService {
  constructor(private readonly repository: TagRepository) {}

  async execute(): Promise<Tag[]> {
    return this.repository.findAll();
  }
}
