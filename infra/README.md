---
title: "Infraestrutura - CodeHub"
description: "Como subir a stack (API + MySQL + Nginx) com Docker Compose"
updated_at: "2026-05-30"
---

# Infraestrutura

Stack local turn-key: **API (Node) + MySQL + Nginx** (proxy reverso com headers de segurança).

```mermaid
graph LR
    Client -->|:8080| Nginx
    Nginx -->|:3333| API
    API -->|:3306| MySQL
```

## Subir tudo

A partir da pasta `infra/`:

```bash
docker compose up --build
```

- A migration `001_initial_schema.sql` é aplicada **automaticamente** na primeira
  subida do MySQL (montada em `/docker-entrypoint-initdb.d`).
- A API fica acessível via Nginx em **http://localhost:8080**.

### Endpoints

| Método | Rota | |
| --- | --- | --- |
| GET | `/health` | healthcheck |
| `*` | `/api/snippets` | CRUD de snippets |
| `*` | `/api/types` | CRUD de tipos de projeto |
| `*` | `/api/tags` | CRUD de tags |

## Variáveis (opcionais — têm default)

| Var | Default |
| --- | --- |
| `DB_PASSWORD` | `root` |
| `DB_NAME` | `codehub` |

## Derrubar

```bash
docker compose down          # mantém os volumes (dados)
docker compose down -v       # apaga volumes (MySQL + storage dos .md)
```
