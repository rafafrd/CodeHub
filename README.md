# 🚀 CodeHub

O **CodeHub** é um sistema centralizado e um inventário inteligente para armazenamento, categorização e recuperação rápida de artefatos de código. Ele foi projetado para evitar o retrabalho na construção de infraestrutura base, armazenando *snippets* reutilizáveis, arquivos de configuração (Docker, Nginx, CI/CD), middlewares e scripts utilitários.

## 🏗️ Arquitetura e Stack Tecnológica

O projeto foi construído sob uma arquitetura de **Monorepo** e utiliza uma abordagem de **Armazenamento Híbrido**:
- **Indexação e Taxonomia:** MySQL (gerenciamento de relacionamentos, categorias e tags).
- **Armazenamento de Conteúdo:** File System local, utilizando arquivos Markdown (`.md`) com Frontmatter para metadados e suporte nativo a diagramas Mermaid.

**Stack Principal:**
- **Backend:** Node.js, TypeScript, Express.js.
- **Testes:** Jest (Foco estrito em TDD na camada de Services).
- **Banco de Dados:** MySQL.
- **Infraestrutura:** Docker, Nginx, GitHub Actions (CI/CD).

## 📂 Estrutura do Monorepo (Workspaces)

O repositório está dividido em áreas de responsabilidade isoladas:

```text
codehub/
├── docs/               # Documentação base do projeto (PDD, SDD, TDD)
├── app/
│   ├── api/            # Backend (Node.js + Express)
│   └── web/            # Frontend (Interface do Usuário)
├── infra/              # Arquivos de infraestrutura (Docker, Nginx, Terraform)
├── .github/workflows/  # Pipelines de CI/CD
└── claude.md           # Diretrizes arquiteturais e regras de IA
```
📖 Documentação e Metodologia
O desenvolvimento do CodeHub é estritamente guiado por três pilares documentais localizados na pasta docs/:

PDD (Product Driven Development): Define as jornadas de valor, os casos de uso principais e o comportamento esperado do produto.

SDD (Spec Driven Development): Especifica a planta baixa técnica, os esquemas de banco de dados, os contratos da API (REST) e a estrutura exata do file system.

TDD (Test Driven Development): Documenta a estratégia de testes obrigatória (Red-Green-Refactor). Nenhuma regra de negócio é implementada sem um teste unitário prévio em Jest.

🤖 Nota para IAs e Assistentes de Código:
Antes de sugerir qualquer alteração estrutural ou implementar novos serviços, é obrigatório ler o arquivo claude.md na raiz do projeto. Ele contém as diretrizes inegociáveis de tipagem, estrutura de pastas e o fluxo de trabalho de testes.

🚀 Como Iniciar o Desenvolvimento
Como o projeto utiliza a estrutura de workspaces do npm/yarn, as dependências são gerenciadas de forma global e isolada por módulo.

1. Clone o repositório:

Bash
git clone [https://github.com/seu-usuario/codehub.git](https://github.com/seu-usuario/codehub.git)
cd codehub
2. Instale as dependências da raiz:

```Bash
npm install
```
3. Navegue até a API e inicie o ambiente de TDD:

```Bash
cd app/api
npm run test:watch
```
Desenvolvido com foco em padronização, segurança (DevSecOps) e arquitetura limpa.
