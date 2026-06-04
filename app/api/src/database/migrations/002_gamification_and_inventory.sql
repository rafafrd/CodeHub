-- =============================================================================
-- Migration 002 — Gamificação + Inventário (pastas)
-- MySQL 8+ | utf8mb4 | IDs INT UNSIGNED AUTO_INCREMENT
-- Roda uma vez (initdb numa base nova; em base existente, aplique manualmente).
-- Obs.: `rank` é palavra reservada no MySQL 8 — sempre use crase: `rank`.
-- =============================================================================

-- ----------------------------------------------------------------------------
-- GAMIFICAÇÃO
-- ----------------------------------------------------------------------------

-- Perfil do usuário (XP / nível / patente). Sem auth ainda → 1 perfil padrão.
CREATE TABLE IF NOT EXISTS profiles (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username   VARCHAR(120) NULL,
  xp         INT UNSIGNED NOT NULL DEFAULT 0,
  level      INT UNSIGNED NOT NULL DEFAULT 1,
  `rank`     VARCHAR(20)  NOT NULL DEFAULT 'Bronze',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_profiles_username (username)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Catálogo de conquistas.
CREATE TABLE IF NOT EXISTS achievements (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code        VARCHAR(60)  NOT NULL,
  name        VARCHAR(120) NOT NULL,
  description VARCHAR(255) NULL,
  xp_reward   INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_achievements_code (code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Conquistas desbloqueadas por perfil (pivô N:M).
CREATE TABLE IF NOT EXISTS user_achievements (
  profile_id     INT UNSIGNED NOT NULL,
  achievement_id INT UNSIGNED NOT NULL,
  unlocked_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (profile_id, achievement_id),
  KEY idx_ua_achievement (achievement_id),
  CONSTRAINT fk_ua_profile
    FOREIGN KEY (profile_id) REFERENCES profiles (id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_ua_achievement
    FOREIGN KEY (achievement_id) REFERENCES achievements (id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- INVENTÁRIO (pastas hierárquicas)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS folders (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(120) NOT NULL,
  parent_id  INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_folders_parent (parent_id),
  -- Evita pastas com o mesmo nome dentro do mesmo pai.
  -- (No nível raiz, parent_id = NULL: a unicidade é reforçada no Service.)
  UNIQUE KEY uq_folders_parent_name (parent_id, name),
  CONSTRAINT fk_folders_parent
    FOREIGN KEY (parent_id) REFERENCES folders (id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Snippet passa a poder pertencer a uma pasta do inventário (além das tags).
-- ON DELETE SET NULL: apagar a pasta NÃO apaga o snippet (vira "solto").
ALTER TABLE snippets
  ADD COLUMN folder_id INT UNSIGNED NULL AFTER type_id,
  ADD KEY idx_snippets_folder (folder_id),
  ADD CONSTRAINT fk_snippets_folder
    FOREIGN KEY (folder_id) REFERENCES folders (id)
    ON UPDATE CASCADE ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- SEEDS
-- ----------------------------------------------------------------------------

-- Perfil padrão (id = 1) enquanto não há autenticação.
INSERT INTO profiles (id, username, xp, level, `rank`)
VALUES (1, 'dedsec', 0, 1, 'Bronze');

-- Catálogo inicial de conquistas.
INSERT INTO achievements (code, name, description, xp_reward) VALUES
  ('first_script',      'Primeiro Script',     'Criou seu primeiro snippet.',                 50),
  ('infra_architect',   'Arquiteto de Infra',  'Criou 5 snippets de Infraestrutura/DevOps.',  150),
  ('clean_code_master', 'Mestre do Clean Code','Categorizou 25 artefatos.',                   300),
  ('organizer',         'Organizador',         'Criou sua primeira pasta no inventário.',      40),
  ('taxonomist',        'Taxonomista',         'Criou 10 pastas.',                            120);

-- Taxonomia padrão de pastas (Fullstack + DevOps). @vars persistem na sessão do initdb.
INSERT INTO folders (name, parent_id) VALUES ('Infraestrutura', NULL);
SET @infra := LAST_INSERT_ID();
INSERT INTO folders (name, parent_id) VALUES
  ('Docker', @infra), ('Kubernetes', @infra), ('Nginx', @infra);

INSERT INTO folders (name, parent_id) VALUES ('Frontend', NULL);
SET @front := LAST_INSERT_ID();
INSERT INTO folders (name, parent_id) VALUES
  ('React', @front), ('Tailwind', @front), ('CSS Resets', @front);

INSERT INTO folders (name, parent_id) VALUES ('Backend', NULL);
SET @back := LAST_INSERT_ID();
INSERT INTO folders (name, parent_id) VALUES
  ('Node.js', @back), ('Middlewares Express', @back), ('SQL Queries', @back);

INSERT INTO folders (name, parent_id) VALUES ('DevSecOps & Ferramentas', NULL);
SET @devsec := LAST_INSERT_ID();
INSERT INTO folders (name, parent_id) VALUES
  ('SonarQube', @devsec), ('GitHub Actions', @devsec), ('Scripts CI/CD', @devsec);
