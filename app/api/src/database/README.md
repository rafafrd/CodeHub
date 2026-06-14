---
title: "Banco de Dados - CodeHub API"
description: "SQLite como Memory Card: arquivo versionado no Git"
updated_at: "2026-06-11"
---

# Banco de Dados (SQLite — v2)

A v2 trocou o MySQL por **SQLite** (`better-sqlite3`). Decisão de produto:
o arquivo `.sqlite` é o **save state** do CodeHub e é **comitado no Git**
(jamais adicionar ao `.gitignore`).

## Como funciona

- O arquivo vive em `STORAGE_PATH` (padrão `app/api/storage/`), ao lado dos
  `.md` dos artefatos. O primeiro `*.sqlite` da pasta é a conta ativa.
- **Primeira execução:** sem arquivo, a API entra em modo setup
  (`GET/POST /api/setup`) e o frontend pergunta o nome do usuário; o arquivo
  nasce como `<slug-do-nome>.sqlite` com o perfil criado.
- `journal_mode = DELETE` (sem WAL) para não gerar arquivos laterais
  `-wal`/`-shm` que sujariam o repositório; `foreign_keys = ON`.

## Migrations

Embedadas em `src/database/migrations.ts` (strings SQL) e aplicadas pelo
runner em `src/database/sqlite.ts` — registradas em `schema_migrations`,
idempotentes e executadas automaticamente ao abrir o banco (contas antigas
recebem migrations novas no boot).

| Migration | Conteúdo |
| --- | --- |
| `001_schema` | Tabelas: `project_types` (c/ `behavior`), `tags`, `folders`, `snippets`, `snippet_tags`, `profiles`, `achievements` (gatilhos data-driven), `user_achievements`, `activity_log`. |
| `002_seed_types` | 16 tipos de artefato com comportamento (snippet, markdown, ai-skill, dockerfile, …). |
| `003_seed_folders` | Taxonomia padrão de pastas (Infra/Frontend/Backend/DevSecOps). |
| `004_seed_achievements` | Catálogo de 53 conquistas (arquivista, organizador, progressão, especialista, coruja, explorador). |

## Testes

Os repositórios são testados por **integração real** com `:memory:`
(migrations aplicadas) — sem mocks de banco e sem Docker.
