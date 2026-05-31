import { promises as fs } from "node:fs";
import path from "node:path";

import matter from "gray-matter";

/**
 * Conteúdo necessário para materializar um snippet em disco.
 * `type` e `tags` ficam por NOME no arquivo (legível/portável); a normalização
 * por id vive no MySQL.
 */
export interface SnippetFilePayload {
  id: number;
  title: string;
  type: string;
  tags: string[];
  createdAt: string;
  description?: string;
  content: string;
  mermaidFlow?: string;
}

/** Resultado da leitura de um `.md`: Frontmatter parseado + corpo. */
export interface ParsedSnippetFile {
  metadata: Record<string, unknown>;
  body: string;
}

/**
 * Contrato do repositório de File System (implementado por
 * `LocalFileSystemRepository`). Permite que os Services o substituam por um
 * mock nos testes unitários.
 */
export interface FileSystemRepository {
  /** Grava `<storageDir>/<id>.md` e retorna o nome do arquivo salvo. */
  save(payload: SnippetFilePayload): Promise<string>;
  /** Lê e parseia um `.md` (Frontmatter + corpo). */
  read(fileName: string): Promise<ParsedSnippetFile>;
  /** Remove o arquivo físico. */
  delete(fileName: string): Promise<void>;
}

export class LocalFileSystemRepository implements FileSystemRepository {
  constructor(private readonly storageDir: string) {}

  async save(payload: SnippetFilePayload): Promise<string> {
    const fileName = `${payload.id}.md`;
    const fullPath = path.join(this.storageDir, fileName);

    const frontmatter: Record<string, unknown> = {
      id: payload.id,
      title: payload.title,
      type: payload.type,
      tags: payload.tags,
      created_at: payload.createdAt,
    };
    if (payload.description) {
      frontmatter.description = payload.description;
    }

    let body = payload.content.trim();
    if (payload.mermaidFlow) {
      body += `\n\n\`\`\`mermaid\n${payload.mermaidFlow}\n\`\`\``;
    }

    const fileContent = matter.stringify(`${body}\n`, frontmatter);

    await fs.mkdir(this.storageDir, { recursive: true });
    await fs.writeFile(fullPath, fileContent, "utf-8");

    return fileName;
  }

  async read(fileName: string): Promise<ParsedSnippetFile> {
    const raw = await fs.readFile(path.join(this.storageDir, fileName), "utf-8");
    const parsed = matter(raw);

    return { metadata: parsed.data, body: parsed.content };
  }

  async delete(fileName: string): Promise<void> {
    await fs.unlink(path.join(this.storageDir, fileName));
  }
}
