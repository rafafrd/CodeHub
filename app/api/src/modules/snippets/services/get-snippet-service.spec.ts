import { AppError } from "../../../shared/errors/app-error";
import { Snippet } from "../models/snippet";
import { FileSystemRepository } from "../repositories/file-system-repository";
import { SnippetRepository } from "../repositories/snippet-repository";
import { GetSnippetService } from "./get-snippet-service";

describe("GetSnippetService", () => {
  const snippet: Snippet = {
    id: 7,
    title: "Nginx Security Headers",
    description: null,
    filePath: "7.md",
    typeId: 2,
    createdAt: new Date("2026-05-30T00:00:00Z"),
  };

  let findById: jest.Mock;
  let read: jest.Mock;
  let service: GetSnippetService;

  beforeEach(() => {
    findById = jest.fn().mockResolvedValue(snippet);
    read = jest.fn().mockResolvedValue({
      metadata: { id: 7, title: "Nginx Security Headers" },
      body: "add_header X-Frame-Options ...",
    });
    service = new GetSnippetService(
      { findById } as unknown as SnippetRepository,
      { read } as unknown as FileSystemRepository,
    );
  });

  it("deve retornar os metadados + conteúdo do arquivo", async () => {
    const result = await service.execute(7);

    expect(findById).toHaveBeenCalledWith(7);
    expect(read).toHaveBeenCalledWith("7.md");
    expect(result.snippet).toBe(snippet);
    expect(result.body).toContain("X-Frame-Options");
    expect(result.metadata).toMatchObject({ id: 7 });
  });

  it("deve falhar com 404 quando o snippet não existe", async () => {
    findById.mockResolvedValueOnce(null);

    await expect(service.execute(999)).rejects.toBeInstanceOf(AppError);
    expect(read).not.toHaveBeenCalled();
  });

  it("deve falhar quando o snippet ainda não tem arquivo (filePath nulo)", async () => {
    findById.mockResolvedValueOnce({ ...snippet, filePath: null });

    await expect(service.execute(7)).rejects.toBeInstanceOf(AppError);
    expect(read).not.toHaveBeenCalled();
  });
});
