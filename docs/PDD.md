# PDD - CodeHub v2.0 (Inventário e Gestão de Conhecimento Gamificada)

## 1. Visão Geral do Produto

O CodeHub nasceu da premissa de que a gestão de conhecimento técnico e a reutilização de código não precisam ser tarefas tediosas. Ele foi arquitetado, desde sua concepção, para ser um sistema centralizado e inteligente que transforma a maneira como desenvolvedores armazenam, categorizam e recuperam artefatos de código.

Na versão 2.0, o CodeHub eleva a "Developer Experience" (DX) ao extremo. Ele integra um robusto sistema de Inventário em Pastas com mecânicas imersivas de Gamificação e introduz o **"Modo Jogo"**, uma interface opcional em formato de hub 2D interativo. O objetivo é eliminar o retrabalho na construção de infraestruturas, recompensar a organização do conhecimento e garantir uma experiência de uso imersiva — seja através de uma UI limpa e veloz ou explorando um quarto cibernético em _pixel art_.

Além disso, a arquitetura de dados foi desenhada para uso pessoal e portátil: o repositório atua como o seu próprio "Memory Card", permitindo que o estado do sistema (banco de dados) seja versionado via Git.

## 2. Escopo Técnico Base

- **Backend:** Node.js, TypeScript, Express.js (arquitetura limpa estruturada para suportar regras complexas de tipologia, XP e conquistas).
- **Banco de Dados:** **SQLite** (API nativa/driver leve). Decisão arquitetural voltada para portabilidade e "Save State": o arquivo `.sqlite` local será comitado no repositório Git, garantindo o backup absoluto do conhecimento e do progresso do jogador de forma transparente.
- **Armazenamento de Conteúdo:** Arquivos Markdown (`.md`) no File System, com Frontmatter para metadados nativos, renderização rica e suporte a diagramas Mermaid.
- **Frontend Core:** React, TypeScript, Tailwind CSS.
- **Frontend Gamificado (Modo Jogo):** React Three Fiber (câmera ortográfica 2D), GSAP e Framer Motion para renderização fluida, transições dinâmicas e controle de _sprites_ em 32-bits.
- **Testes:** Automatizados via Jest (TDD estrito na camada de Service para garantir a integridade das regras de negócio, cálculos de gamificação e concorrência no SQLite).

## 3. Pilares do Produto

### 3.1. Identidade Visual e UX (Cyberpunk & Hacker Culture)

- **Visual Múltiplo:** O design base é um _deep dark mode_ com tipografia monoespaçada. O usuário possui um seletor de temas imersivos (ex: _DedSec, Midnight, Light, Dracula, Monokai, Cyberpunk 2077_).
- **Interações:** Microinterações temáticas, Boot Intro 2.0 com animações de terminal fluidas, efeitos de glitch e popups de conquistas que remetem à PSN/Steam.
- **Fricção Zero:** O fluxo de salvar e acessar itens ocorre via modais deslizantes (_Drawers_) ou painéis laterais intuitivos, impedindo que o usuário perca o contexto da lista principal. A renderização de Markdown nativo atua diretamente nas descrições dos artefatos.

### 3.2. Motor de Gamificação Expandido

- **XP e Progressão:** Ações no sistema geram Pontos de Experiência (XP) que ditam o Nível e a Patente atual (Bronze ➔ Prata ➔ Ouro ➔ Platina ➔ Diamante).
- **Catálogo Massivo de Conquistas (50+):** Distintivos permanentes com gatilhos de complexidade variada. Categorias incluem:
- _Explorador:_ Constância de uso (ex: logou em 5 dias seguidos).
- _Arquivista:_ Volume e estruturação (ex: criou 100 artefatos).
- _Especialista:_ Nicho tecnológico (ex: "Mestre do Regex", "Salvou 10 Skills do Claude").
- _Coruja:_ Gatilhos de tempo (ex: "Criou um snippet entre 02:00 e 04:00 da manhã").

### 3.3. Tipologia Avançada de Artefatos (> 15 Tipos)

O sistema vai muito além de "snippets" genéricos. Cada artefato recebe uma classificação técnica que dita seu comportamento de renderização e utilidade. Os tipos suportados incluem:

1. Snippet (Padrão) | 2. Documentação Markdown | 3. Claude/AI Skill (Prompts) | 4. Dockerfile | 5. Docker Compose | 6. Config Server (Nginx/Apache) | 7. CI/CD Pipeline | 8. Script Shell (Bash/PS) | 9. Database Query | 10. Expressões Regulares (Regex) | 11. Git Hooks | 12. Middleware | 13. API Contract | 14. IaC (Terraform) | 15. Templates de Ambiente (`.env`) | 16. Estruturas de Chaves/Certificados.

### 3.4. O "Modo Jogo" (Metaverso Local)

Uma abordagem inovadora para a navegação de ferramentas utilitárias, habilitada via _Toggle_ nas configurações.

- **O Cenário:** A UI se transforma em um "quarto cibernético" em perspectiva 2D (_pixel art_ 32-bits), representando o refúgio _hacker_ do usuário.
- **O Avatar:** Um personagem com estética inspirada no Link clássico (Zelda), controlado via teclado (WASD ou Setas direcionais).
- **Interação Espacial:** Os menus se tornam objetos do cenário (ex: o computador abre os Snippets, a lousa abre as Tags, a estante abre as Configurações). Balões de fala (_speech bubbles_) animados flutuam sobre os pontos de interesse.
- **Estado AFK (Idle):** Inatividade superior a 30 segundos faz o avatar sentar/deitar e dormir, emitindo _sprites_ de "zzZZZZ", acordando instantaneamente no próximo input.

## 4. Principais Casos de Uso (Jornadas de Valor)

- **CU01: Estruturação e Navegação Híbrida do Inventário**
  O usuário modela sua árvore de conhecimento criando pastas infinitas. A exploração pode ocorrer via explorador tradicional (estilo VS Code) ou caminhando com o avatar até o "Arquivo" no Modo Jogo.
- **CU02: Registro de Artefato Especializado**
  O usuário aciona o painel lateral de criação rápida, cola o código, seleciona sua Tipologia (ex: "Claude/AI Skill") e o vincula ao inventário. O sistema grava o arquivo `.md`, injeta Frontmatter avançado e atualiza o banco SQLite simultaneamente.
- **CU03: Desbloqueio Assíncrono de Conquistas**
  Ao submeter um artefato de madrugada, o backend processa o _timestamp_, detecta a regra oculta da conquista "Coruja" e dispara um evento WebSocket/SSE. A UI (seja na tela padrão ou no Modo Jogo) exibe o _Achievement Unlocked_ fluidamente.
- **CU04: Leitura Rica e Renderização Automática**
  Ao acessar a visualização de um artefato, a descrição textual é automaticamente parseada como Markdown (tabelas, negritos, links). Se houver dados arquiteturais associados, diagramas Mermaid são gerados dinamicamente no contraste do tema escolhido.
- **CU05: Imersão e Controle no Modo Jogo**
  O usuário alterna o botão "Modo Jogo". O React Three Fiber assume a tela, o FPS é travado com fluidez (>30 FPS). O usuário caminha pelo quarto com WASD, lê os balões flutuantes, interage com a mesa de trabalho, fica AFK para ver a animação de sono e volta ao trabalho normalmente.

## 5. Critérios de Aceite e Qualidade

- **Portabilidade e Persistência SQLite:** A base de dados principal deve operar como um arquivo local único (ex: `database.sqlite`) estruturado na raiz ou pasta segura, validado para sofrer commits no repositório sem corromper (locking transacional em ambiente Node devidamente tratado).
- **Performance do Modo Jogo:** A integração do React Three Fiber e GSAP não deve gerar vazamento de memória (memory leaks) na transição de telas. A taxa de quadros (FPS) do cenário 2D deve ser estável e o input lag do teclado (WASD/Setas) deve ser imperceptível.
- **Regras de Negócio Blindadas (TDD):** Absolutamente todo o cálculo de experiência (XP), verificação das 50+ conquistas e movimentação de pastas deve ser validado via testes unitários (Services) antes de tocar na camada de controle.
- **Estabilidade Visual:** Efeitos como glitches, animações de boot e renderização de Markdown não podem bloquear a _main thread_. A aplicação deve continuar sendo uma ferramenta produtiva e veloz acima de tudo.
