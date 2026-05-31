import { AppError } from "../../../shared/errors/app-error";
import { ProjectTypeRepository } from "../repositories/project-type-repository";
import { CreateProjectTypeService } from "./create-project-type-service";

describe("CreateProjectTypeService", () => {
  let repository: { findByName: jest.Mock; create: jest.Mock };
  let service: CreateProjectTypeService;

  beforeEach(() => {
    repository = {
      findByName: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(3),
    };
    service = new CreateProjectTypeService(
      repository as unknown as ProjectTypeRepository,
    );
  });

  it("deve criar um tipo de projeto", async () => {
    const result = await service.execute({ name: "DevSecOps" });

    expect(result).toEqual({ id: 3, name: "DevSecOps" });
    expect(repository.create).toHaveBeenCalledWith({ name: "DevSecOps" });
  });

  it("não deve permitir nome vazio", async () => {
    await expect(service.execute({ name: "  " })).rejects.toBeInstanceOf(
      AppError,
    );
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("não deve permitir nome duplicado (409)", async () => {
    repository.findByName.mockResolvedValueOnce({ id: 1, name: "DevSecOps" });

    await expect(service.execute({ name: "DevSecOps" })).rejects.toBeInstanceOf(
      AppError,
    );
    expect(repository.create).not.toHaveBeenCalled();
  });
});
