import { TagRepository } from "../repositories/tag-repository";
import { ListTagsService } from "./list-tags-service";

describe("ListTagsService", () => {
  it("deve retornar todas as tags do repositório", async () => {
    const tags = [
      { id: 1, name: "docker" },
      { id: 2, name: "nginx" },
    ];
    const findAll = jest.fn().mockResolvedValue(tags);
    const service = new ListTagsService({
      findAll,
    } as unknown as TagRepository);

    const result = await service.execute();

    expect(result).toBe(tags);
    expect(findAll).toHaveBeenCalledTimes(1);
  });
});
