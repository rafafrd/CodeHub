# PDD - CodeHub (Inventário de Artefatos de Código)

## 1. Visão Geral do Produto

O CodeHub é um sistema centralizado para armazenamento, categorização e recuperação rápida de snippets de código reutilizáveis, arquivos de configuração estruturais (Docker, Nginx, CI/CD), middlewares e scripts utilitários. O objetivo é evitar que o desenvolvedor perca tempo reescrevendo infraestrutura base e padrões de projetos recorrentes.

## 2. Escopo Técnico Inicial

- **Backend:** Node.js, TypeScript, Express.js.
- **Banco de Dados:** MySQL (para indexação, tags e categorias).
- **Armazenamento de Conteúdo:** Arquivos Markdown (.md) com Frontmatter para metadados e suporte a diagramas Mermaid.
- **Testes:** Automatizados via Jest (cobertura focada na camada de Service).

## 3. Principais Casos de Uso (Jornadas de Valor)

- **CU01: Cadastrar um Novo Snippet/Configuração**
  O usuário envia um arquivo de configuração (ex: `nginx.conf`) ou snippet, define o tipo de projeto (ex: `Node-Express`, `DevSecOps`, `Frontend-React`) e insere tags descritivas. O sistema gera um arquivo `.md` estruturado e salva o índice no banco de dados.
- **CU02: Buscar por Tipo de Projeto ou Tag**
  O usuário busca por "Docker Compose" ou filtra pelo tipo "DevSecOps" e recebe instantaneamente os arquivos correspondentes prontos para cópia.

- **CU03: Visualizar Documentação com Mermaid**
  Ao recuperar um arquivo `.md` que contenha arquitetura ou fluxo (como um middleware de autenticação), o sistema permite a renderização visual do fluxo via blocos Mermaid.

## 4. Critérios de Aceite e Qualidade

- Todo endpoint de mutação (POST/PUT) deve ser validado.
- Nenhuma funcionalidade de negócio (Services) pode subir sem testes unitários correspondentes (TDD).
