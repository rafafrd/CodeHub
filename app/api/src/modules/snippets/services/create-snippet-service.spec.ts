import { AppError } from "../../../shared/errors/app-error";
import { FileSystemRepository } from "../repositories/file-system-repository";
import { SnippetRepository } from "../repositories/snippet-repository";
import { ProjectTypeRepository } from "../../types/repositories/project-type-repository";
import { TagRepository } from "../../tags/repositories/tag-repository";
import {
  CreateSnippetInput,
  CreateSnippetService,
} from "./create-snippet-service";

type MockedSnippetRepository = {
  create: jest.Mock;
  updateFilePath: jest.Mock;
  attachTags: jest.Mock;
  findById: jest.Mock;
  list: jest.Mock;
  delete: jest.Mock;
};
type MockedFileSystemRepository = {
  save: jest.Mock;
  read: jest.Mock;
  delete: jest.Mock;
};
type MockedProjectTypeRepository = { findById: jest.Mock };
type MockedTagRepository = { findByIds: jest.Mock };

describe("CreateSnippetService", () => {
  let snippetRepository: MockedSnippetRepository;
  let fileSystemRepository: MockedFileSystemRepository;
  let projectTypeRepository: MockedProjectTypeRepository;
  let tagRepository: MockedTagRepository;
  let service: CreateSnippetService;

  const validInput: CreateSnippetInput = {
    title: "Nginx Security Headers",
    description: "Headers recomendados pela OWASP",
    content: "add_header X-Frame-Options ...",
    typeId: 2,
    tagIds: [5, 8],
    mermaidFlow: "graph TD\nClient --> Nginx",
  };

  beforeEach(() => {
    snippetRepository = {
      create: jest.fn().mockResolvedValue(42),
      updateFilePath: jest.fn().mockResolvedValue(undefined),
      attachTags: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      list: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    fileSystemRepository = {
      save: jest.fn().mockResolvedValue("42.md"),
      read: jest.fn(),
      delete: jest.fn(),
    };
    projectTypeRepository = {
      findById: jest.fn().mockResolvedValue({ id: 2, name: "DevSecOps" }),
    };
    tagRepository = {
      findByIds: jest.fn().mockResolvedValue([
        { id: 5, name: "nginx" },
        { id: 8, name: "security" },
      ]),
    };

    service = new CreateSnippetService(
      snippetRepository as unknown as SnippetRepository,
      fileSystemRepository as unknown as FileSystemRepository,
      projectTypeRepository as unknown as ProjectTypeRepository,
      tagRepository as unknown as TagRepository,
    );
  });

  it("deve criar um snippet com sucesso (happy path)", async () => {
    const result = await service.execute(validInput);

    expect(result).toHaveProperty("id", 42);
    expect(result.filePath).toBe("42.md");
    expect(snippetRepository.create).toHaveBeenCalledTimes(1);
    expect(fileSystemRepository.save).toHaveBeenCalledTimes(1);
    expect(snippetRepository.updateFilePath).toHaveBeenCalledWith(42, "42.md");
    expect(snippetRepository.attachTags).toHaveBeenCalledWith(42, [5, 8]);
  });

  it("deve gravar NOMES de type e tags no arquivo (não ids)", async () => {
    await service.execute(validInput);

    const payload = fileSystemRepository.save.mock.calls[0][0];
    expect(payload.id).toBe(42);
    expect(payload.type).toBe("DevSecOps");
    expect(payload.tags).toEqual(["nginx", "security"]);
  });

  it("não deve permitir a criação de um snippet sem título", async () => {
    await expect(
      service.execute({ ...validInput, title: "   " }),
    ).rejects.toBeInstanceOf(AppError);
    expect(snippetRepository.create).not.toHaveBeenCalled();
  });

  it("deve falhar quando o tipo de projeto não existir", async () => {
    projectTypeRepository.findById.mockResolvedValueOnce(null);

    await expect(service.execute(validInput)).rejects.toThrow(
      "Tipo de projeto não encontrado.",
    );
    expect(snippetRepository.create).not.toHaveBeenCalled();
  });

  it("deve falhar quando alguma tag não existir", async () => {
    tagRepository.findByIds.mockResolvedValueOnce([{ id: 5, name: "nginx" }]);

    await expect(service.execute(validInput)).rejects.toBeInstanceOf(AppError);
    expect(snippetRepository.create).not.toHaveBeenCalled();
  });

  it("deve desfazer o registro (delete) se a gravação do arquivo falhar", async () => {
    fileSystemRepository.save.mockRejectedValueOnce(new Error("disco cheio"));

    await expect(service.execute(validInput)).rejects.toThrow("disco cheio");
    expect(snippetRepository.delete).toHaveBeenCalledWith(42);
  });
});
