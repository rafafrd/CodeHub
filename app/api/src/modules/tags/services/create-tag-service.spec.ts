import { AppError } from "../../../shared/errors/app-error";
import { TagRepository } from "../repositories/tag-repository";
import { CreateTagService } from "./create-tag-service";

describe("CreateTagService", () => {
  let repository: { findByName: jest.Mock; create: jest.Mock };
  let service: CreateTagService;

  beforeEach(() => {
    repository = {
      findByName: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(9),
    };
    service = new CreateTagService(repository as unknown as TagRepository);
  });

  it("deve criar uma tag", async () => {
    const result = await service.execute({ name: "nginx" });

    expect(result).toEqual({ id: 9, name: "nginx" });
    expect(repository.create).toHaveBeenCalledWith({ name: "nginx" });
  });

  it("não deve permitir nome vazio", async () => {
    await expect(service.execute({ name: " " })).rejects.toBeInstanceOf(
      AppError,
    );
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("não deve permitir nome duplicado (409)", async () => {
    repository.findByName.mockResolvedValueOnce({ id: 1, name: "nginx" });

    await expect(service.execute({ name: "nginx" })).rejects.toBeInstanceOf(
      AppError,
    );
    expect(repository.create).not.toHaveBeenCalled();
  });
});
