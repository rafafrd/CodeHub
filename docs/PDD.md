PDD - CodeHub (Inventário e Gestão de Conhecimento Gamificada)

1. Visão Geral do Produto

O CodeHub nasceu da premissa de que a gestão de conhecimento técnico e a reutilização de código não precisam ser tarefas tediosas. Ele foi arquitetado, desde sua concepção, para ser um sistema centralizado e inteligente que transforma a maneira como desenvolvedores armazenam, categorizam e recuperam artefatos de código.

Focado intensamente na "Developer Experience" (DX), o CodeHub integra de forma nativa um robusto sistema de Inventário em Pastas com mecânicas imersivas de Gamificação. O objetivo é eliminar o retrabalho na construção de infraestruturas base e, ao mesmo tempo, recompensar o usuário por organizar e alimentar essa base de conhecimento. Tudo isso é envolvido em uma interface de inspiração Cyberpunk/Hacker, garantindo uma experiência de uso imersiva e visualmente instigante.

2. Escopo Técnico Base

Backend: Node.js, TypeScript, Express.js (arquitetura limpa estruturada para suportar regras complexas de XP e Conquistas).

Frontend: React, TypeScript, Tailwind CSS, suportado por bibliotecas de animação para efeitos de glitch e transições dinâmicas.

Banco de Dados: MySQL (projetado para indexação, taxonomia hierárquica do inventário e persistência do progresso do jogador/usuário).

Armazenamento de Conteúdo: Arquivos Markdown (.md) no File System, com Frontmatter para metadados nativos e suporte a diagramas Mermaid.

Testes: Automatizados via Jest (TDD estrito na camada de Service para garantir a integridade das regras de negócio e cálculos de gamificação).

3. Pilares do Produto

3.1. Identidade Visual (Cyberpunk & Hacker Culture)

Visual: O design do produto é fundamentado em um deep dark mode, com uso estratégico de tons neon (verde terminal, roxo cibernético e azul elétrico) e tipografia monoespaçada.

Interações: A interface conta com microinterações temáticas, como efeitos de glitch em textos de destaque, animações estilo typewriter (terminal) e popups de conquistas que remetem a plataformas de jogos (Steam/PSN), com brilhos e transições suaves.

3.2. Motor de Gamificação Integrado

XP e Progressão: Ações que enriquecem o sistema (ex: estruturar bem um diretório, documentar snippets complexos, utilizar tags assertivas) geram Pontos de Experiência (XP). O acúmulo de XP dita o Nível atual do usuário.

Sistema de Patentes/Elos: O ranqueamento do desenvolvedor é visualmente representado por insígnias: Bronze ➔ Prata ➔ Ouro ➔ Platina ➔ Diamante.

Conquistas (Achievements): Distintivos permanentes desbloqueáveis por marcos técnicos (ex: "Primeiro Script", "Mestre do Clean Code", "Arquiteto de Infra").

3.3. Inventário e Taxonomia Hierárquica

Navegação de Sistema de Arquivos: O núcleo da organização é uma interface análoga a um explorador de arquivos profissional (ex: VS Code Explorer ou Finder), garantindo familiaridade imediata.

Estrutura Profunda: Organização baseada em pastas e subpastas infinitas, com suporte a taxonomias complexas focadas em ecossistemas de desenvolvimento (ex: 📁 Infraestrutura/Docker, 📁 Backend/Middlewares Express, 📁 DevSecOps/SonarQube).

4. Principais Casos de Uso (Jornadas de Valor)

CU01: Estruturação e Navegação do Inventário
O usuário modela sua própria árvore de conhecimento criando, renomeando e aninhando pastas. A interface reflete essas mudanças em tempo real, permitindo isolar visualmente artefatos de Frontend, Backend e Infraestrutura.

CU02: Registro de Artefato Recompensado
O usuário seleciona uma pasta no seu inventário, envia o artefato (ex: um script de CI/CD em .yaml), define o contexto tecnológico e as tags. O sistema processa o arquivo .md, indexa o conteúdo no banco atrelado à pasta e concede +XP instantâneo ao perfil do usuário.

CU03: Desbloqueio de Conquista e Subida de Elo
Ao atingir um gatilho específico de pontuação (ex: cadastrar o 50º snippet de segurança), o sistema renderiza um toast assíncrono e animado (estilo "Achievement Unlocked") sobrepondo a interface sem interromper o fluxo de trabalho.

CU04: Busca Híbrida e Inteligente
O usuário pode "escavar" (drill-down) visualmente pelas pastas do inventário ou utilizar a search bar global para cruzar tags, tipos e termos livres, com os resultados sendo exibidos com syntax highlighting temático.

CU05: Renderização de Arquitetura Oculta
Ao acessar um artefato estrutural, o CodeHub lê a estrutura .md e renderiza automaticamente diagramas de fluxo (Mermaid) mapeados, perfeitamente integrados ao contraste neon da aplicação.

5. Critérios de Aceite e Qualidade

Regras de Negócio (TDD): Absolutamente todo o cálculo de experiência (XP), verificação de destravamento de conquistas e movimentação de pastas deve ser validado via testes unitários (Services) antes de tocar na camada de controle.

Integridade do Inventário: O banco de dados deve garantir a consistência das relações pai/filho na árvore de pastas, suportando a exclusão em cascata segura.

Performance Visual: Os efeitos visuais (glitches, animações de XP) devem ser leves e assíncronos. A gamificação é um incentivo visual e não pode gerar gargalos ou atrasos nas operações principais de CRUD (Create, Read, Update, Delete) de código.
