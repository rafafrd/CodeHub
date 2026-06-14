/**
 * Migrations do CodeHub v2 (dialeto SQLite), embedadas como strings para que
 * o build (dist/) seja autossuficiente — sem copiar arquivos .sql.
 *
 * O runner (`database/sqlite.ts`) aplica cada entrada uma única vez, em
 * transação, registrando o nome em `schema_migrations`.
 */
export interface Migration {
  name: string;
  sql: string;
}

const SCHEMA = /* sql */ `
CREATE TABLE IF NOT EXISTS project_types (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  name      TEXT NOT NULL UNIQUE,
  behavior  TEXT NOT NULL DEFAULT 'snippet',
  -- 1 = veio das seeds; conquistas contam apenas criações do usuário (0).
  seeded    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tags (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS folders (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  parent_id  INTEGER NULL REFERENCES folders (id) ON UPDATE CASCADE ON DELETE CASCADE,
  seeded     INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (parent_id, name)
);
CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders (parent_id);

CREATE TABLE IF NOT EXISTS snippets (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  description TEXT NULL,
  file_path   TEXT NULL,
  type_id     INTEGER NOT NULL REFERENCES project_types (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  folder_id   INTEGER NULL REFERENCES folders (id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_snippets_type ON snippets (type_id);
CREATE INDEX IF NOT EXISTS idx_snippets_folder ON snippets (folder_id);

CREATE TABLE IF NOT EXISTS snippet_tags (
  snippet_id INTEGER NOT NULL REFERENCES snippets (id) ON DELETE CASCADE,
  tag_id     INTEGER NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
  PRIMARY KEY (snippet_id, tag_id)
);

CREATE TABLE IF NOT EXISTS profiles (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  username   TEXT NULL UNIQUE,
  xp         INTEGER NOT NULL DEFAULT 0,
  level      INTEGER NOT NULL DEFAULT 1,
  "rank"     TEXT NOT NULL DEFAULT 'Bronze',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS achievements (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  code          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  description   TEXT NULL,
  xp_reward     INTEGER NOT NULL DEFAULT 0,
  category      TEXT NOT NULL DEFAULT 'geral',
  trigger_kind  TEXT NOT NULL DEFAULT 'manual',
  trigger_param TEXT NULL,
  threshold     INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS user_achievements (
  profile_id     INTEGER NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES achievements (id) ON DELETE CASCADE,
  unlocked_at    TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (profile_id, achievement_id)
);

-- Dias com atividade (para conquistas de streak).
CREATE TABLE IF NOT EXISTS activity_log (
  day TEXT PRIMARY KEY
);
`;

const SEED_TYPES = /* sql */ `
INSERT INTO project_types (name, behavior, seeded) VALUES
  ('Snippet',                'snippet',        1),
  ('Documentação Markdown',  'markdown',       1),
  ('Claude/AI Skill',        'ai-skill',       1),
  ('Dockerfile',             'dockerfile',     1),
  ('Docker Compose',         'docker-compose', 1),
  ('Config de Servidor',     'server-config',  1),
  ('CI/CD Pipeline',         'cicd',           1),
  ('Script Shell',           'shell',          1),
  ('Database Query',         'query',          1),
  ('Regex',                  'regex',          1),
  ('Git Hook',               'git-hook',       1),
  ('Middleware',             'middleware',     1),
  ('API Contract',           'api-contract',   1),
  ('Infra as Code',          'iac',            1),
  ('Template .env',          'env',            1),
  ('Chaves/Certificados',    'keys',           1);
`;

const SEED_FOLDERS = /* sql */ `
INSERT INTO folders (id, name, parent_id, seeded) VALUES
  (1,  'Infraestrutura',           NULL, 1),
  (2,  'Docker',                   1,    1),
  (3,  'Kubernetes',               1,    1),
  (4,  'Nginx',                    1,    1),
  (5,  'Frontend',                 NULL, 1),
  (6,  'React',                    5,    1),
  (7,  'Tailwind',                 5,    1),
  (8,  'CSS Resets',               5,    1),
  (9,  'Backend',                  NULL, 1),
  (10, 'Node.js',                  9,    1),
  (11, 'Middlewares Express',      9,    1),
  (12, 'SQL Queries',              9,    1),
  (13, 'DevSecOps & Ferramentas',  NULL, 1),
  (14, 'SonarQube',                13,   1),
  (15, 'GitHub Actions',           13,   1),
  (16, 'Scripts CI/CD',            13,   1);
`;

/**
 * Catálogo de 53 conquistas data-driven.
 * trigger_kind: count_snippets_total | count_folders_total | count_tags_total |
 *               count_types_total | count_by_behavior | level_reached |
 *               time_window | streak_days
 */
const SEED_ACHIEVEMENTS = /* sql */ `
INSERT INTO achievements (code, name, description, xp_reward, category, trigger_kind, trigger_param, threshold) VALUES
  -- Arquivista (volume total de artefatos)
  ('first_script',      'Primeiro Script',        'Criou seu primeiro artefato.',                 50,  'arquivista',  'count_snippets_total', NULL, 1),
  ('collector_5',       'Colecionador',           'Criou 5 artefatos.',                           75,  'arquivista',  'count_snippets_total', NULL, 5),
  ('archivist_10',      'Arquivista Júnior',      'Criou 10 artefatos.',                          100, 'arquivista',  'count_snippets_total', NULL, 10),
  ('archivist_25',      'Arquivista',             'Criou 25 artefatos.',                          150, 'arquivista',  'count_snippets_total', NULL, 25),
  ('archivist_50',      'Arquivista Sênior',      'Criou 50 artefatos.',                          200, 'arquivista',  'count_snippets_total', NULL, 50),
  ('archivist_100',     'Bibliotecário de Babel', 'Criou 100 artefatos.',                         300, 'arquivista',  'count_snippets_total', NULL, 100),
  ('archivist_250',     'O Grande Arquivo',       'Criou 250 artefatos.',                         500, 'arquivista',  'count_snippets_total', NULL, 250),
  -- Organizador (pastas)
  ('organizer',         'Organizador',            'Criou sua primeira pasta.',                    40,  'organizador', 'count_folders_total',  NULL, 1),
  ('curator_5',         'Curador',                'Criou 5 pastas.',                              75,  'organizador', 'count_folders_total',  NULL, 5),
  ('taxonomist_10',     'Taxonomista',            'Criou 10 pastas.',                             120, 'organizador', 'count_folders_total',  NULL, 10),
  ('librarian_25',      'Bibliotecário',          'Criou 25 pastas.',                             200, 'organizador', 'count_folders_total',  NULL, 25),
  ('warehouse_50',      'Armazém Infinito',       'Criou 50 pastas.',                             300, 'organizador', 'count_folders_total',  NULL, 50),
  -- Tags
  ('tagger_5',          'Etiquetador',            'Criou 5 tags.',                                60,  'organizador', 'count_tags_total',     NULL, 5),
  ('tagger_15',         'Indexador',              'Criou 15 tags.',                               120, 'organizador', 'count_tags_total',     NULL, 15),
  ('tagger_30',         'Mestre dos Rótulos',     'Criou 30 tags.',                               200, 'organizador', 'count_tags_total',     NULL, 30),
  -- Tipos
  ('typesmith_5',       'Tipógrafo',              'Criou 5 tipos personalizados.',                80,  'organizador', 'count_types_total',    NULL, 5),
  ('typesmith_10',      'Engenheiro de Taxonomia','Criou 10 tipos personalizados.',               150, 'organizador', 'count_types_total',    NULL, 10),
  -- Progressão (nível)
  ('level_2',           'Subindo de Nível',       'Alcançou o nível 2.',                          50,  'progressao',  'level_reached',        NULL, 2),
  ('level_5',           'Elo Prata',              'Alcançou o nível 5.',                          100, 'progressao',  'level_reached',        NULL, 5),
  ('level_10',          'Elo Ouro',               'Alcançou o nível 10.',                         200, 'progressao',  'level_reached',        NULL, 10),
  ('level_15',          'Elo Platina',            'Alcançou o nível 15.',                         300, 'progressao',  'level_reached',        NULL, 15),
  ('level_20',          'Elo Diamante',           'Alcançou o nível 20.',                         400, 'progressao',  'level_reached',        NULL, 20),
  ('level_30',          'Lenda Viva',             'Alcançou o nível 30.',                         500, 'progressao',  'level_reached',        NULL, 30),
  -- Especialista (5 artefatos por comportamento)
  ('spec_snippet',      'Mão na Massa',           'Salvou 5 snippets.',                           120, 'especialista','count_by_behavior',    'snippet',        5),
  ('spec_markdown',     'Documentarista',         'Salvou 5 documentações Markdown.',             120, 'especialista','count_by_behavior',    'markdown',       5),
  ('spec_ai_skill',     'Sussurrador de IAs',     'Salvou 5 Claude/AI Skills.',                   120, 'especialista','count_by_behavior',    'ai-skill',       5),
  ('spec_dockerfile',   'Capitão Container',      'Salvou 5 Dockerfiles.',                        120, 'especialista','count_by_behavior',    'dockerfile',     5),
  ('spec_compose',      'Maestro de Orquestra',   'Salvou 5 Docker Composes.',                    120, 'especialista','count_by_behavior',    'docker-compose', 5),
  ('spec_server',       'Guardião do Proxy',      'Salvou 5 configs de servidor.',                120, 'especialista','count_by_behavior',    'server-config',  5),
  ('spec_cicd',         'Engenheiro de Pipeline', 'Salvou 5 pipelines de CI/CD.',                 120, 'especialista','count_by_behavior',    'cicd',           5),
  ('spec_shell',        'Shell Master',           'Salvou 5 scripts shell.',                      120, 'especialista','count_by_behavior',    'shell',          5),
  ('spec_query',        'Cirurgião de Queries',   'Salvou 5 database queries.',                   120, 'especialista','count_by_behavior',    'query',          5),
  ('spec_regex',        'Mestre do Regex',        'Salvou 5 expressões regulares.',               120, 'especialista','count_by_behavior',    'regex',          5),
  ('spec_git_hook',     'Gancho de Esquerda',     'Salvou 5 git hooks.',                          120, 'especialista','count_by_behavior',    'git-hook',       5),
  ('spec_middleware',   'Interceptador',          'Salvou 5 middlewares.',                        120, 'especialista','count_by_behavior',    'middleware',     5),
  ('spec_api',          'Diplomata de APIs',      'Salvou 5 contratos de API.',                   120, 'especialista','count_by_behavior',    'api-contract',   5),
  ('infra_architect',   'Arquiteto de Infra',     'Salvou 5 artefatos de IaC.',                   120, 'especialista','count_by_behavior',    'iac',            5),
  ('spec_env',          'Ambientalista',          'Salvou 5 templates .env.',                     120, 'especialista','count_by_behavior',    'env',            5),
  ('spec_keys',         'Chaveiro',               'Salvou 5 estruturas de chaves/certificados.',  120, 'especialista','count_by_behavior',    'keys',           5),
  -- Expert (10 artefatos por comportamento, nos mais comuns)
  ('expert_snippet',    'Snippet Sensei',         'Salvou 10 snippets.',                          200, 'especialista','count_by_behavior',    'snippet',        10),
  ('expert_markdown',   'Escriba Digital',        'Salvou 10 documentações Markdown.',            200, 'especialista','count_by_behavior',    'markdown',       10),
  ('expert_ai_skill',   'Engenheiro de Prompts',  'Salvou 10 Claude/AI Skills.',                  200, 'especialista','count_by_behavior',    'ai-skill',       10),
  ('expert_dockerfile', 'Almirante Container',    'Salvou 10 Dockerfiles.',                       200, 'especialista','count_by_behavior',    'dockerfile',     10),
  ('expert_cicd',       'Senhor das Esteiras',    'Salvou 10 pipelines de CI/CD.',                200, 'especialista','count_by_behavior',    'cicd',           10),
  -- Coruja (janelas de horário; formato HH:MM-HH:MM, pode cruzar a meia-noite)
  ('night_owl',         'Coruja',                 'Criou um artefato entre 02:00 e 04:00.',       150, 'coruja',      'time_window',          '02:00-04:00',    1),
  ('early_bird',        'Madrugador',             'Criou um artefato entre 05:00 e 07:00.',       150, 'coruja',      'time_window',          '05:00-07:00',    1),
  ('midnight_hacker',   'Hacker da Meia-Noite',   'Criou um artefato entre 23:00 e 01:00.',       150, 'coruja',      'time_window',          '23:00-01:00',    1),
  -- Explorador (streak de dias com atividade)
  ('streak_2',          'Aquecendo',              'Usou o CodeHub por 2 dias seguidos.',          50,  'explorador',  'streak_days',          NULL, 2),
  ('streak_3',          'Pegando Ritmo',          'Usou o CodeHub por 3 dias seguidos.',          75,  'explorador',  'streak_days',          NULL, 3),
  ('streak_5',          'Constante',              'Usou o CodeHub por 5 dias seguidos.',          100, 'explorador',  'streak_days',          NULL, 5),
  ('streak_7',          'Semana Perfeita',        'Usou o CodeHub por 7 dias seguidos.',          150, 'explorador',  'streak_days',          NULL, 7),
  ('streak_14',         'Quinzena de Ferro',      'Usou o CodeHub por 14 dias seguidos.',         250, 'explorador',  'streak_days',          NULL, 14),
  ('streak_30',         'Imparável',              'Usou o CodeHub por 30 dias seguidos.',         400, 'explorador',  'streak_days',          NULL, 30);
`;

export const MIGRATIONS: Migration[] = [
  { name: "001_schema", sql: SCHEMA },
  { name: "002_seed_types", sql: SEED_TYPES },
  { name: "003_seed_folders", sql: SEED_FOLDERS },
  { name: "004_seed_achievements", sql: SEED_ACHIEVEMENTS },
];
