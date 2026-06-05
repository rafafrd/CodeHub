import { Snippet } from "../models/snippet";
import { SnippetRepository } from "../repositories/snippet-repository";
import { ListSnippetsService } from "./list-snippets-service";

describe("ListSnippetsService", () => {
  const sample: Snippet[] = [
    {
      id: 1,
      title: "Docker Compose Base",
      description: null,
      filePath: "1.md",
      typeId: 2,
      folderId: null,
      createdAt: new Date("2026-05-30T00:00:00Z"),
    },
  ];

  let list: jest.Mock;
  let service: ListSnippetsService;

  beforeEach(() => {
    list = jest.fn().mockResolvedValue(sample);
    service = new ListSnippetsService({ list } as unknown as SnippetRepository);
  });

  it("deve retornar os snippets repassando os filtros", async () => {
    const result = await service.execute({ typeId: 2, tagId: 5, search: "docker" });

    expect(result).toBe(sample);
    expect(list).toHaveBeenCalledWith({
      typeId: 2,
      tagId: 5,
      search: "docker",
    });
  });

  it("deve normalizar busca vazia/espaços para undefined", async () => {
    await service.execute({ search: "   " });

    expect(list).toHaveBeenCalledWith({
      typeId: undefined,
      tagId: undefined,
      search: undefined,
    });
  });

  it("deve funcionar sem nenhum filtro", async () => {
    await service.execute();

    expect(list).toHaveBeenCalledTimes(1);
  });
});
