import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

import { AppError } from "../shared/errors/app-error";
import { MIGRATIONS } from "./migrations";

/**
 * Gerenciador do banco SQLite ("Memory Card" do CodeHub).
 *
 * - O arquivo `.sqlite` vive em `STORAGE_PATH` (padrão: ./storage) e é
 *   VERSIONADO no Git — por isso `journal_mode = DELETE` (WAL criaria
 *   arquivos laterais -wal/-shm que sujariam o repositório).
 * - Descoberta: o primeiro `*.sqlite` da pasta é a conta ativa. Se não houver
 *   nenhum, a API entra em "modo setup" e o frontend pergunta o nome do user.
 */

export type GetDb = () => Database.Database;

let db: Database.Database | null = null;

export function storageDir(): string {
  return path.resolve(process.env.STORAGE_PATH ?? "storage");
}

function findDatabaseFile(): string | null {
  const dir = storageDir();
  if (!fs.existsSync(dir)) {
    return null;
  }
  const file = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sqlite"))
    .sort()[0];
  return file ? path.join(dir, file) : null;
}

function applyPragmas(database: Database.Database): void {
  database.pragma("journal_mode = DELETE");
  database.pragma("foreign_keys = ON");
}

/** Aplica as migrations pendentes (idempotente, em transação por migration). */
export function runMigrations(database: Database.Database): void {
  database.exec(
    "CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now')))",
  );
  const applied = new Set(
    (
      database.prepare("SELECT name FROM schema_migrations").all() as {
        name: string;
      }[]
    ).map((row) => row.name),
  );

  for (const migration of MIGRATIONS) {
    if (applied.has(migration.name)) {
      continue;
    }
    const apply = database.transaction(() => {
      database.exec(migration.sql);
      database
        .prepare("INSERT INTO schema_migrations (name) VALUES (?)")
        .run(migration.name);
    });
    apply();
  }
}

/** Há uma conta criada (arquivo .sqlite presente)? */
export function isConfigured(): boolean {
  return db !== null || findDatabaseFile() !== null;
}

/**
 * Retorna a conexão ativa, abrindo o arquivo existente sob demanda.
 * Sem conta criada → 503 SETUP_REQUIRED (o frontend trata e mostra o setup).
 */
export function getDb(): Database.Database {
  if (db) {
    return db;
  }
  const file = findDatabaseFile();
  if (!file) {
    throw new AppError(
      "Nenhuma conta encontrada. Complete o setup inicial.",
      503,
    );
  }
  db = new Database(file);
  applyPragmas(db);
  runMigrations(db); // aplica migrations novas em contas antigas
  return db;
}

/** Slug seguro para nome de arquivo (anti path traversal). */
export function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/**
 * Cria a conta: arquivo `<slug>.sqlite`, schema/seeds e o perfil id=1 com o
 * username escolhido. Retorna o nome do arquivo criado.
 */
export function createAccount(username: string): string {
  if (isConfigured()) {
    throw new AppError("Uma conta já existe neste CodeHub.", 409);
  }
  const slug = slugify(username);
  if (!slug) {
    throw new AppError("Nome inválido para criar a conta.", 400);
  }

  const dir = storageDir();
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${slug}.sqlite`);

  const created = new Database(file);
  applyPragmas(created);
  runMigrations(created);
  created
    .prepare('INSERT INTO profiles (id, username, xp, level, "rank") VALUES (1, ?, 0, 1, ?)')
    .run(username.trim(), "Bronze");

  db = created;
  return path.basename(file);
}

/** Fecha a conexão (usado nos testes e em shutdown gracioso). */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/** Injeta um banco já aberto (testes com :memory:). */
export function setDb(database: Database.Database): void {
  db = database;
}
