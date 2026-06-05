import { ProjectTypeRepository } from "../repositories/project-type-repository";
import { ListProjectTypesService } from "./list-project-types-service";

describe("ListProjectTypesService", () => {
  it("deve retornar todos os tipos do repositório", async () => {
    const types = [
      { id: 1, name: "DevSecOps" },
      { id: 2, name: "Node.js" },
    ];
    const findAll = jest.fn().mockResolvedValue(types);
    const service = new ListProjectTypesService({
      findAll,
    } as unknown as ProjectTypeRepository);

    const result = await service.execute();

    expect(result).toBe(types);
    expect(findAll).toHaveBeenCalledTimes(1);
  });
});
