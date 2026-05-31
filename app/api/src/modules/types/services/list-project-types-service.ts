import { ProjectType } from "../models/project-type";
import { ProjectTypeRepository } from "../repositories/project-type-repository";

export class ListProjectTypesService {
  constructor(private readonly repository: ProjectTypeRepository) {}

  async execute(): Promise<ProjectType[]> {
    return this.repository.findAll();
  }
}
