import { AppError } from "../../../shared/errors/app-error";
import { Snippet } from "../models/snippet";
import { FileSystemRepository } from "../repositories/file-system-repository";
import { SnippetRepository } from "../repositories/snippet-repository";
import { ProjectTypeRepository } from "../../types/repositories/project-type-repository";
import { TagRepository } from "../../tags/repositories/tag-repository";
import {
  UpdateSnippetInput,
  UpdateSnippetService,
} from "./update-snippet-service";

describe("UpdateSnippetService", () => {
  const existing: Snippet = {
    id: 7,
    title: "Título antigo",
    description: null,
    filePath: "7.md",
    typeId: 1,
    createdAt: new Date("2026-01-10T00:00:00Z"),
  };

  const validInput: UpdateSnippetInput = {
    title: "Nginx Security Headers",
    description: "Atualizado",
    content: "add_header ...",
    typeId: 2,
    tagIds: [5, 8],
  };

  let snippetRepository: {
    findById: jest.Mock;
    update: jest.Mock;
    replaceTags: jest.Mock;
  };
  let fileSystemRepository: { save: jest.Mock };
  let projectTypeRepository: { findById: jest.Mock };
  let tagRepository: { findByIds: jest.Mock };
  let service: UpdateSnippetService;

  beforeEach(() => {
    snippetRepository = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue(undefined),
      replaceTags: jest.fn().mockResolvedValue(undefined),
    };
    fileSystemRepository = { save: jest.fn().mockResolvedValue("7.md") };
    projectTypeRepository = {
      findById: jest.fn().mockResolvedValue({ id: 2, name: "DevSecOps" }),
    };
    tagRepository = {
      findByIds: jest.fn().mockResolvedValue([
        { id: 5, name: "nginx" },
        { id: 8, name: "security" },
      ]),
    };

    service = new UpdateSnippetService(
      snippetRepository as unknown as SnippetRepository,
      fileSystemRepository as unknown as FileSystemRepository,
      projectTypeRepository as unknown as ProjectTypeRepository,
      tagRepository as unknown as TagRepository,
    );
  });

  it("deve atualizar metadados, reescrever o arquivo e sincronizar tags", async () => {
    await service.execute(7, validInput);

    expect(snippetRepository.update).toHaveBeenCalledWith(7, {
      title: "Nginx Security Headers",
      description: "Atualizado",
      typeId: 2,
    });
    expect(fileSystemRepository.save).toHaveBeenCalledTimes(1);
    expect(snippetRepository.replaceTags).toHaveBeenCalledWith(7, [5, 8]);
  });

  it("deve preservar a data de criação original no Frontmatter reescrito", async () => {
    await service.execute(7, validInput);

    const payload = fileSystemRepository.save.mock.calls[0][0];
    expect(payload.createdAt).toBe("2026-01-10");
  });

  it("deve falhar com 404 quando o snippet não existe", async () => {
    snippetRepository.findById.mockResolvedValueOnce(null);

    await expect(service.execute(999, validInput)).rejects.toBeInstanceOf(
      AppError,
    );
    expect(snippetRepository.update).not.toHaveBeenCalled();
  });

  it("não deve permitir título vazio", async () => {
    await expect(
      service.execute(7, { ...validInput, title: "  " }),
    ).rejects.toBeInstanceOf(AppError);
    expect(snippetRepository.update).not.toHaveBeenCalled();
  });

  it("deve falhar quando o tipo não existe", async () => {
    projectTypeRepository.findById.mockResolvedValueOnce(null);

    await expect(service.execute(7, validInput)).rejects.toBeInstanceOf(
      AppError,
    );
    expect(snippetRepository.update).not.toHaveBeenCalled();
  });
});
