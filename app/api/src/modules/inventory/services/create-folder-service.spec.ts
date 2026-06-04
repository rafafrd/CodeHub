import { AppError } from "../../../shared/errors/app-error";
import { FolderRepository } from "../repositories/folder-repository";
import { CreateFolderService } from "./create-folder-service";

describe("CreateFolderService", () => {
  let folders: {
    create: jest.Mock;
    findById: jest.Mock;
    existsByNameInParent: jest.Mock;
  };
  let service: CreateFolderService;

  beforeEach(() => {
    folders = {
      create: jest.fn().mockResolvedValue(10),
      findById: jest.fn().mockResolvedValue({
        id: 1,
        name: "Infraestrutura",
        parentId: null,
        createdAt: new Date(),
      }),
      existsByNameInParent: jest.fn().mockResolvedValue(false),
    };
    service = new CreateFolderService(folders as unknown as FolderRepository);
  });

  it("cria uma pasta raiz", async () => {
    const folder = await service.execute({ name: "Frontend" });

    expect(folder.id).toBe(10);
    expect(folder.parentId).toBeNull();
    expect(folders.create).toHaveBeenCalledWith({
      name: "Frontend",
      parentId: null,
    });
  });

  it("cria uma subpasta validando a existência do pai", async () => {
    await service.execute({ name: "Docker", parentId: 1 });

    expect(folders.findById).toHaveBeenCalledWith(1);
    expect(folders.create).toHaveBeenCalledWith({
      name: "Docker",
      parentId: 1,
    });
  });

  it("rejeita nome vazio (400)", async () => {
    await expect(service.execute({ name: "   " })).rejects.toBeInstanceOf(
      AppError,
    );
    expect(folders.create).not.toHaveBeenCalled();
  });

  it("rejeita pasta pai inexistente (404)", async () => {
    folders.findById.mockResolvedValueOnce(null);

    await expect(
      service.execute({ name: "Docker", parentId: 999 }),
    ).rejects.toBeInstanceOf(AppError);
    expect(folders.create).not.toHaveBeenCalled();
  });

  it("rejeita nome duplicado no mesmo pai (409)", async () => {
    folders.existsByNameInParent.mockResolvedValueOnce(true);

    await expect(
      service.execute({ name: "Docker", parentId: 1 }),
    ).rejects.toBeInstanceOf(AppError);
    expect(folders.create).not.toHaveBeenCalled();
  });
});
