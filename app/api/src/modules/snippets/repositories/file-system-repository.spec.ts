import { promises as fs } from "node:fs";

import { LocalFileSystemRepository } from "./file-system-repository";

jest.mock("node:fs", () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    writeFile: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn(),
    unlink: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockedFs = fs as jest.Mocked<typeof fs>;

describe("LocalFileSystemRepository", () => {
  const storageDir = "/tmp/storage";
  let repository: LocalFileSystemRepository;

  beforeEach(() => {
    repository = new LocalFileSystemRepository(storageDir);
  });

  describe("save", () => {
    it("deve gravar storage/<id>.md e retornar o nome do arquivo", async () => {
      const fileName = await repository.save({
        id: 7,
        title: "Nginx Security Headers",
        type: "DevSecOps",
        tags: ["nginx", "security"],
        createdAt: "2026-05-30",
        content: "add_header X-Frame-Options ...",
      });

      expect(fileName).toBe("7.md");
      expect(mockedFs.mkdir).toHaveBeenCalledWith(storageDir, {
        recursive: true,
      });

      const [writtenPath, writtenContent] = mockedFs.writeFile.mock.calls[0];
      expect(writtenPath).toContain("7.md");
      // Frontmatter + corpo
      expect(writtenContent).toContain("id: 7");
      expect(writtenContent).toContain("title: Nginx Security Headers");
      expect(writtenContent).toContain("type: DevSecOps");
      expect(writtenContent).toContain("add_header X-Frame-Options");
    });

    it("deve anexar um bloco mermaid quando mermaidFlow for informado", async () => {
      await repository.save({
        id: 1,
        title: "Fluxo",
        type: "DevSecOps",
        tags: [],
        createdAt: "2026-05-30",
        content: "conteúdo",
        mermaidFlow: "graph TD\nClient --> Nginx",
      });

      const writtenContent = mockedFs.writeFile.mock.calls[0][1] as string;
      expect(writtenContent).toContain("```mermaid");
      expect(writtenContent).toContain("Client --> Nginx");
    });
  });

  describe("read", () => {
    it("deve parsear Frontmatter e corpo do arquivo", async () => {
      mockedFs.readFile.mockResolvedValueOnce(
        ['---', 'id: 7', 'title: Teste', '---', '', 'corpo do snippet'].join(
          "\n",
        ),
      );

      const result = await repository.read("7.md");

      expect(result.metadata).toMatchObject({ id: 7, title: "Teste" });
      expect(result.body.trim()).toBe("corpo do snippet");
    });
  });

  describe("delete", () => {
    it("deve remover o arquivo físico pelo nome", async () => {
      await repository.delete("7.md");

      const [removedPath] = mockedFs.unlink.mock.calls[0];
      expect(removedPath).toContain("7.md");
    });
  });
});
