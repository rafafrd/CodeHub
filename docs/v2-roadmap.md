# 🚀 Roadmap CodeHub v2.0: Expansão de UX, Gamificação e "Modo Jogo"

> ✅ **Entregue (branch `feature/v2`)** — implementado em 5 fases:
> 1. **SQLite "Memory Card"** (better-sqlite3, `.sqlite` versionado no Git, setup de 1ª execução).
> 2. **Tipologia (16 tipos c/ `behavior`) + 53 conquistas** data-driven (TDD).
> 3. **UX:** Markdown nativo, Drawer de detalhe, 3 temas novos (Dracula/Monokai/Cyberpunk 2077), Boot Intro 2.0.
> 4. **Modo Jogo:** quarto cyberpunk 2D (R3F + GSAP), avatar pixel art estilo Link (WASD/setas), balões flutuantes, idle "zzZ".
> 5. **Consolidação:** SSE (`/api/events`), versão 2.0.0, docs.
>
> Validado ao vivo (setup → dashboard 0/53 → modo jogo) e por 111 testes no backend.

## 📌 Visão Geral

Esta especificação define o escopo da versão 2.0 do CodeHub. O objetivo é transformar a aplicação em uma ferramenta ainda mais robusta para desenvolvedores, introduzindo renderização avançada, dezenas de novas tipologias de conteúdo, gamificação expandida e uma interface interativa opcional gamificada (Modo Jogo).

## 🛠️ 1. Tipologia de Artefatos Avançada

A classificação atual de tipos será expandida. Cada "Tipo de Projeto/Artefato" agora possuirá uma categoria intrínseca (formato de renderização ou comportamento). O sistema deve suportar mais de 15 formatos úteis para o ecossistema de desenvolvimento:

1. **Snippet (Padrão):** Trechos curtos de código.
2. **Markdown:** Documentação rica.
3. **Claude/AI Skill:** Prompts estruturados ou system instructions.
4. **Dockerfile:** Configurações de containerização.
5. **Docker Compose:** Orquestração de containers.
6. **Configuração de Servidor:** Nginx, Apache, HAProxy.
7. **CI/CD Pipeline:** GitHub Actions, GitLab CI, Jenkinsfile.
8. **Script Shell:** Bash, PowerShell.
9. **Database Query:** SQL, MongoDB aggregates.
10. **Regex:** Expressões regulares com exemplos de match.
11. **Git Hook:** Scripts de pre-commit, pre-push.
12. **Middleware:** Interceptadores de requisição (Express, Fastify).
13. **API Contract:** Swagger/OpenAPI, GraphQL Schema.
14. **Infra as Code (IaC):** Terraform, Ansible, CloudFormation.
15. **Ambiente/Env:** Templates de `.env` comentados.
16. **Certificados/Chaves:** Estruturas seguras para chaves públicas/configs.

## 🎨 2. UX e Renderização Rica

- **Renderização de Markdown:** As descrições dos itens (na aba Snippets e Detalhes) devem renderizar Markdown nativamente (negrito, listas, code inline).
- **Salvar/Acessar Intuitivo:** O fluxo de criação (formulário) e leitura deve ser redesenhado para ter menos atrito, possivelmente utilizando modais (Drawers) ou painéis laterais deslizantes para evitar perda de contexto da lista.
- **Boot Intro 2.0:** A animação inicial deve ser refinada, com transições mais complexas e fluidas, utilizando `framer-motion`.
- **Novos Temas:** Adição de pelo menos 3 novos temas na aba de Configurações (ex: _Dracula_, _Monokai_, _Cyberpunk 2077_).

## 🏆 3. Expansão da Gamificação

- O catálogo da tabela `achievements` deve ser populado com **mais de 50 conquistas exclusivas**.
- _Exemplos de categorias:_
  - _Explorador:_ "Logou em 5 dias consecutivos."
  - _Arquivista:_ "Criou 100 artefatos no total."
  - _Especialista:_ "Salvou 10 Claude Skills", "Mestre do Regex".
  - _Coruja:_ "Criou um snippet entre 02:00 e 04:00 da manhã."

## 🎮 4. O "Modo Jogo" (Interface Interativa Opcional)

Um novo toggle será adicionado na aba _Configurações_: **"Habilitar Modo Jogo"**.

**Comportamento:**

- Ao ativar, a navegação padrão de menu desaparece. A tela principal se torna um ambiente 2D interativo renderizado a 60/30 FPS utilizando `React Three Fiber` (com câmera ortográfica 2D), `GSAP` e `Framer Motion`.
- **Cenário:** Um quarto cibernético, com estética _pixel art_ 32-bits, ambiente "caseiro" de um hacker/desenvolvedor.
- **O Avatar:** O usuário controlará um avatar em pixel art, cujo design, paleta e proporções devem ser similares ao Link clássico da franquia Zelda, utilizando o arquivo de referência **image_cd9b9e.png**.
- **Navegação (Interação espacial):** Os menus da aplicação (Snippets, Tags, Configurações, Inventário) estarão espalhados pelo quarto como objetos interativos (ex: um computador para "Snippets", um quadro de avisos para "Tags").
- **Waypoints:** Balões de fala flutuantes (animados flutuando suavemente) ficarão acima desses objetos indicando a rota.
- **Idle Animation (AFK):** Se o usuário não mover o avatar (sem input do teclado/mouse) por 30 segundos, o boneco senta/deita no chão, fecha os olhos, e uma animação contínua de "zzZZZZ" flutua acima de sua cabeça até receber um novo input.
