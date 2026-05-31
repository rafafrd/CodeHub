import { AppError } from "../../../shared/errors/app-error";
import { ProjectTypeRepository } from "../repositories/project-type-repository";
import { DeleteProjectTypeService } from "./delete-project-type-service";

describe("DeleteProjectTypeService", () => {
  let repository: { findById: jest.Mock; delete: jest.Mock };
  let service: DeleteProjectTypeService;

  beforeEach(() => {
    repository = {
      findById: jest.fn().mockResolvedValue({ id: 1, name: "DevSecOps" }),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    service = new DeleteProjectTypeService(
      repository as unknown as ProjectTypeRepository,
    );
  });

  it("deve apagar o tipo existente", async () => {
    await service.execute(1);

    expect(repository.delete).toHaveBeenCalledWith(1);
  });

  it("deve falhar com 404 quando o tipo não existe", async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(service.execute(99)).rejects.toBeInstanceOf(AppError);
    expect(repository.delete).not.toHaveBeenCalled();
  });
});
