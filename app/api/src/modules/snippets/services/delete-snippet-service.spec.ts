import { AppError } from "../../../shared/errors/app-error";
import { Snippet } from "../models/snippet";
import { FileSystemRepository } from "../repositories/file-system-repository";
import { SnippetRepository } from "../repositories/snippet-repository";
import { DeleteSnippetService } from "./delete-snippet-service";

describe("DeleteSnippetService", () => {
  const existing: Snippet = {
    id: 7,
    title: "Snippet",
    description: null,
    filePath: "7.md",
    typeId: 2,
    folderId: null,
    createdAt: new Date("2026-05-30T00:00:00Z"),
  };

  let snippetRepository: { findById: jest.Mock; delete: jest.Mock };
  let fileSystemRepository: { delete: jest.Mock };
  let service: DeleteSnippetService;

  beforeEach(() => {
    snippetRepository = {
      findById: jest.fn().mockResolvedValue(existing),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    fileSystemRepository = { delete: jest.fn().mockResolvedValue(undefined) };

    service = new DeleteSnippetService(
      snippetRepository as unknown as SnippetRepository,
      fileSystemRepository as unknown as FileSystemRepository,
    );
  });

  it("deve apagar o arquivo físico e o registro do banco", async () => {
    await service.execute(7);

    expect(fileSystemRepository.delete).toHaveBeenCalledWith("7.md");
    expect(snippetRepository.delete).toHaveBeenCalledWith(7);
  });

  it("deve falhar com 404 quando o snippet não existe", async () => {
    snippetRepository.findById.mockResolvedValueOnce(null);

    await expect(service.execute(999)).rejects.toBeInstanceOf(AppError);
    expect(fileSystemRepository.delete).not.toHaveBeenCalled();
    expect(snippetRepository.delete).not.toHaveBeenCalled();
  });

  it("deve apagar o registro mesmo se o snippet não tiver arquivo (filePath nulo)", async () => {
    snippetRepository.findById.mockResolvedValueOnce({
      ...existing,
      filePath: null,
    });

    await service.execute(7);

    expect(fileSystemRepository.delete).not.toHaveBeenCalled();
    expect(snippetRepository.delete).toHaveBeenCalledWith(7);
  });
});
