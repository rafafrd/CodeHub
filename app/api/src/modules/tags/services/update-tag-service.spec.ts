import { AppError } from "../../../shared/errors/app-error";
import { TagRepository } from "../repositories/tag-repository";
import { UpdateTagService } from "./update-tag-service";

describe("UpdateTagService", () => {
  let repository: {
    findById: jest.Mock;
    findByName: jest.Mock;
    update: jest.Mock;
  };
  let service: UpdateTagService;

  beforeEach(() => {
    repository = {
      findById: jest.fn().mockResolvedValue({ id: 1, name: "antiga" }),
      findByName: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue(undefined),
    };
    service = new UpdateTagService(repository as unknown as TagRepository);
  });

  it("deve atualizar o nome da tag", async () => {
    await service.execute(1, { name: "nginx" });

    expect(repository.update).toHaveBeenCalledWith(1, { name: "nginx" });
  });

  it("deve falhar com 404 quando a tag não existe", async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(service.execute(99, { name: "nginx" })).rejects.toBeInstanceOf(
      AppError,
    );
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("deve falhar com 409 se o nome já pertence a outra tag", async () => {
    repository.findByName.mockResolvedValueOnce({ id: 2, name: "nginx" });

    await expect(service.execute(1, { name: "nginx" })).rejects.toBeInstanceOf(
      AppError,
    );
    expect(repository.update).not.toHaveBeenCalled();
  });
});
