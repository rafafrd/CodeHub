Boa! Vou te dar o passo a passo. Antes, um ponto importante sobre **qual branch** mostra o quê (porque o tema bonito e o backend novo estão em branches diferentes ainda). Deixa eu checar se sua stack já está de pé:

Sua **Docker Desktop está fechada** (por isso o erro do pipe). Então o passo 0 é abrir ela. E um aviso de branch:

> 🎨 O **tema cyberpunk/DedSec** (com boot animation, Config e Ajuda) está na branch **`feature/frontend-web`**.
> Você está na `feature/gamificacao-inventario`, cujo frontend ainda é o **básico** (Snippets/Tipos/Tags sem tema).
> A gamificação (XP/pastas) por enquanto é **só backend** (Fases 1–2) — ainda não tem tela. Então, pra "ver bonito" no navegador, recomendo rodar a branch do tema.

---

## ✅ Passo a passo

### 0. Pré-requisitos

- Abra o **Docker Desktop** e espere ficar "Engine running" (ícone verde).
- Tenha **Node 20+**.

### 1. Escolha a branch do frontend

Para ver com o **tema cyberpunk**:

```bash
git checkout feature/frontend-web
```

_(Ou fique na branch atual para o front básico — os comandos seguintes são os mesmos.)_

### 2. Suba o backend (API + MySQL + Nginx)

Na **raiz do projeto**:

```bash
docker compose up -d
```

- Sobe os 3 containers; a migration é aplicada sozinha na 1ª vez.
- MySQL publica na **3307** (evita conflito com seu MySQL local), API atrás do Nginx na **8080**.

Confirme que subiu:

```bash
docker compose ps
curl http://localhost:8080/health
```

Deve responder: `{"status":"ok","service":"codehub-api"}`

### 3. Suba o frontend

```bash
npm install
npm run dev -w @codehub/web
```

### 4. Abra no navegador

👉 **http://localhost:5173**

### 5. Primeiro uso (pra não ficar vazio)

Na interface:

1. Aba **Tipos** → crie `DevSecOps`
2. Aba **Tags** → crie `nginx`
3. Aba **Snippets** → preencha título/conteúdo, escolha o tipo `DevSecOps`, marque a tag → **Salvar**

Pronto — está funcionando ponta a ponta (gravando no MySQL + arquivo `.md`).

### 6. Para parar

```bash
# Ctrl+C no terminal do frontend; e para o backend:
docker compose down        # mantém os dados
docker compose down -v     # zera os dados (MySQL + storage)
```

---

## 🆘 Se algo der errado

| Erro                                     | Solução                                                                                                            |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `bind: ...3306... in use`                | Você tem MySQL local. Já usamos a 3307; se a 3307 também estiver ocupada: `DB_HOST_PORT=3399 docker compose up -d` |
| `lookup registry-1.docker.io` no build   | DNS do Docker. **Não use `--no-cache`**; reinicie o Docker Desktop; cheque VPN                                     |
| UI abre mas listas com erro / "Erro 500" | Backend fora do ar. Rode `docker compose up -d` e veja `Config → Status` (na branch do tema)                       |
| `npm run dev` não acha o workspace       | Rode da **raiz** do projeto (não de dentro de `app/web`)                                                           |

---

Resumindo o caminho rápido (tema cyberpunk):

```bash
git checkout feature/frontend-web
docker compose up -d
npm install
npm run dev -w @codehub/web
# abrir http://localhost:5173
```

Quando estiver vendo rodar, me avisa se quer que eu prossiga com a **Fase 3 (Repositories)** da gamificação, ou se prefere primeiro **mergear as branches** (front + gamificação) pra tudo conviver numa coisa só. 🚀
