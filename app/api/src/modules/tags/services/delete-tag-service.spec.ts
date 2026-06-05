import { AppError } from "../../../shared/errors/app-error";
import { TagRepository } from "../repositories/tag-repository";
import { DeleteTagService } from "./delete-tag-service";

describe("DeleteTagService", () => {
  let repository: { findById: jest.Mock; delete: jest.Mock };
  let service: DeleteTagService;

  beforeEach(() => {
    repository = {
      findById: jest.fn().mockResolvedValue({ id: 1, name: "nginx" }),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    service = new DeleteTagService(repository as unknown as TagRepository);
  });

  it("deve apagar a tag existente", async () => {
    await service.execute(1);

    expect(repository.delete).toHaveBeenCalledWith(1);
  });

  it("deve falhar com 404 quando a tag não existe", async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(service.execute(99)).rejects.toBeInstanceOf(AppError);
    expect(repository.delete).not.toHaveBeenCalled();
  });
});
