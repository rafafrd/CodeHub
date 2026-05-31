import { AppError } from "../../../shared/errors/app-error";
import { ProjectTypeRepository } from "../repositories/project-type-repository";
import { UpdateProjectTypeService } from "./update-project-type-service";

describe("UpdateProjectTypeService", () => {
  let repository: {
    findById: jest.Mock;
    findByName: jest.Mock;
    update: jest.Mock;
  };
  let service: UpdateProjectTypeService;

  beforeEach(() => {
    repository = {
      findById: jest.fn().mockResolvedValue({ id: 1, name: "Antigo" }),
      findByName: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue(undefined),
    };
    service = new UpdateProjectTypeService(
      repository as unknown as ProjectTypeRepository,
    );
  });

  it("deve atualizar o nome do tipo", async () => {
    await service.execute(1, { name: "DevSecOps" });

    expect(repository.update).toHaveBeenCalledWith(1, { name: "DevSecOps" });
  });

  it("deve falhar com 404 quando o tipo não existe", async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(
      service.execute(99, { name: "DevSecOps" }),
    ).rejects.toBeInstanceOf(AppError);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("deve falhar com 409 se o nome já pertence a outro tipo", async () => {
    repository.findByName.mockResolvedValueOnce({ id: 2, name: "DevSecOps" });

    await expect(
      service.execute(1, { name: "DevSecOps" }),
    ).rejects.toBeInstanceOf(AppError);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("deve permitir manter o mesmo nome do próprio registro", async () => {
    repository.findByName.mockResolvedValueOnce({ id: 1, name: "DevSecOps" });

    await service.execute(1, { name: "DevSecOps" });

    expect(repository.update).toHaveBeenCalledTimes(1);
  });
});
