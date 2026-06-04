---
title: "Banco de Dados - CodeHub API"
description: "Migrations SQL (MySQL) e como aplicá-las"
updated_at: "2026-05-30"
---

# Banco de Dados

Migrations escritas à mão — decisão de arquitetura: **mysql2 / SQL puro** (sem ORM).
Ver `docs/ROADMAP.md` para o contexto das decisões.

## Migrations

| Arquivo | Descrição |
| --- | --- |
| `migrations/001_initial_schema.sql` | Esquema inicial: `project_types`, `tags`, `snippets`, `snippet_tags`. |
| `migrations/002_gamification_and_inventory.sql` | Gamificação (`profiles`, `achievements`, `user_achievements`) + inventário (`folders` + `snippets.folder_id`) + seeds (perfil, conquistas, taxonomia de pastas). |

## Como aplicar (manual, por enquanto)

```bash
mysql -u root -p codehub < src/database/migrations/001_initial_schema.sql
```

> Um runner de migrations programático (e a conexão via `mysql2`) entra na **Fase 3**,
> junto com os Repositories.
