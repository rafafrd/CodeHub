import { FolderRepository } from "../repositories/folder-repository";
import { ListFoldersService } from "./list-folders-service";

describe("ListFoldersService", () => {
  it("retorna todas as pastas do repositório", async () => {
    const folders = [
      { id: 1, name: "Infraestrutura", parentId: null, createdAt: new Date() },
      { id: 2, name: "Docker", parentId: 1, createdAt: new Date() },
    ];
    const findAll = jest.fn().mockResolvedValue(folders);
    const service = new ListFoldersService({
      findAll,
    } as unknown as FolderRepository);

    expect(await service.execute()).toBe(folders);
    expect(findAll).toHaveBeenCalledTimes(1);
  });
});
