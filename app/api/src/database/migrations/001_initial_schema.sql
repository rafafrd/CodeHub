-- =============================================================================
-- Migration 001 — Esquema inicial do CodeHub
-- Banco: MySQL 8+ | Charset: utf8mb4 (suporta acentos/emojis nos metadados)
-- Decisão de arquitetura: IDs INT AUTO_INCREMENT (ver docs/ROADMAP.md)
-- =============================================================================

-- Tipos de projeto (taxonomia principal) -------------------------------------
CREATE TABLE IF NOT EXISTS project_types (
  id   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_project_types_name (name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Tags (taxonomia secundária, N:M com snippets) ------------------------------
CREATE TABLE IF NOT EXISTS tags (
  id   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tags_name (name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Snippets (metadados; o conteúdo .md vive no File System) --------------------
CREATE TABLE IF NOT EXISTS snippets (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title       VARCHAR(255) NOT NULL,
  description TEXT NULL,
  file_path   VARCHAR(512) NOT NULL,
  type_id     INT UNSIGNED NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_snippets_type_id (type_id),
  CONSTRAINT fk_snippets_type
    FOREIGN KEY (type_id) REFERENCES project_types (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Pivô N:M entre snippets e tags ---------------------------------------------
CREATE TABLE IF NOT EXISTS snippet_tags (
  snippet_id INT UNSIGNED NOT NULL,
  tag_id     INT UNSIGNED NOT NULL,
  PRIMARY KEY (snippet_id, tag_id),
  KEY idx_snippet_tags_tag_id (tag_id),
  CONSTRAINT fk_snippet_tags_snippet
    FOREIGN KEY (snippet_id) REFERENCES snippets (id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_snippet_tags_tag
    FOREIGN KEY (tag_id) REFERENCES tags (id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
