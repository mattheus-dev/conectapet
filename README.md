# 🐾 ConectaPet

Sistema completo de adoção de animais com **API REST em Go** e **frontend em React**.

![Go](https://img.shields.io/badge/Go-1.25-00ADD8?style=flat-square&logo=go)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-GORM-4169E1?style=flat-square&logo=postgresql)
![SQLite](https://img.shields.io/badge/SQLite-local-003B57?style=flat-square&logo=sqlite)

---

## Visão Geral

O **ConectaPet** conecta pets disponíveis para adoção com potenciais adotantes. O sistema permite cadastrar animais, visualizá-los em uma interface responsiva e registrar solicitações de adoção.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Go + Gin Framework |
| ORM | GORM |
| Banco de Dados | SQLite (arquivo local) |
| Frontend | React 19 + Vite 7 |
| Estilização | Tailwind CSS v4 |

---

## Estrutura do Projeto

```
conectapet/
├── cmd/
│   └── api/
│       └── main.go              # Entrypoint — servidor HTTP e rotas
├── internal/
│   ├── database/
│   │   └── db.go                # Conexão GORM e AutoMigrate
│   ├── handlers/
│   │   ├── errors.go            # Helpers de resposta de erro (400/404/500)
│   │   ├── ping.go              # Health check
│   │   ├── pet_handler.go       # CRUD de pets
│   │   └── adoption_handler.go  # Fluxo de adoção
│   ├── middleware/
│   │   ├── cors.go              # CORS para o frontend
│   │   └── logger.go            # Log de requisições
│   └── models/
│       ├── pet.go               # Model Pet + DTOs
│       └── adoption.go          # Model Adoption + DTOs
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PetCard.jsx          # Card individual de pet
│   │   │   └── PetCardSkeleton.jsx  # Skeleton de loading
│   │   ├── App.jsx              # Página principal com fetch e filtros
│   │   ├── main.jsx
│   │   └── index.css            # @import "tailwindcss"
│   ├── index.html
│   └── vite.config.js
├── go.mod
├── go.sum
└── .gitignore
```

---

## Endpoints da API

Base URL: `http://localhost:8080`

### Pets

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/ping` | Health check |
| `GET` | `/api/pets` | Lista pets com status **Disponível** |
| `POST` | `/api/pets` | Cadastra um novo pet |
| `GET` | `/api/pets/:id` | Detalha um pet pelo ID |
| `PATCH` | `/api/pets/:id/status` | Atualiza o status do pet |

### Adoções

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/adopt` | Abre uma solicitação de adoção |
| `GET` | `/api/adoptions` | Lista todas as solicitações |
| `GET` | `/api/adoptions/:id` | Detalha uma solicitação |
| `PATCH` | `/api/adoptions/:id/status` | Aprova ou rejeita uma adoção |

> Ao **Aprovar** uma adoção, o status do pet é automaticamente atualizado para **Adotado** dentro de uma transação de banco de dados.

### Exemplos de payload

**Cadastrar pet** (`POST /api/pets`):
```json
{
  "nome": "Rex",
  "especie": "Cachorro",
  "idade": 3,
  "descricao": "Brincalhão e dócil.",
  "url_imagem": "https://exemplo.com/rex.jpg"
}
```

**Abrir adoção** (`POST /api/adopt`):
```json
{
  "pet_id": 1,
  "nome_adotante": "Maria Silva",
  "email": "maria@email.com",
  "telefone": "11999990000",
  "motivo_adocao": "Muito amor para dar!"
}
```

### Valores aceitos

| Campo | Opções |
|-------|--------|
| `especie` | `Cachorro` · `Gato` · `Outro` |
| `status` (pet) | `Disponível` · `Adotado` |
| `status` (adoção) | `Pendente` · `Aprovado` · `Rejeitado` |

---

## Como Rodar

### Pré-requisitos

- [Go 1.21+](https://go.dev/dl/)
- [Node.js 18+](https://nodejs.org/)

### 1. Clone o repositório

```bash
git clone https://github.com/mattheus-dev/conectapet.git
cd conectapet
```

### 2. Inicie o backend

```bash
go run ./cmd/api/main.go
```

O servidor sobe na porta **8080**. O banco de dados `conectapet.db` é criado automaticamente na primeira execução.

### 3. Inicie o frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend fica disponível em **http://localhost:5173**.

---

## Frontend

- **Design Mobile First** — grid que se adapta de 1 a 4 colunas
- **Filtros por espécie** — Todos / Cachorro / Gato / Outro
- **Estados de UI** — loading (skeleton), erro e lista vazia
- **Imagem com fallback** — exibe foto do Unsplash se `url_imagem` não for informada

---

## Tratamento de Erros

A API retorna erros estruturados com detalhamento por campo:

```json
{
  "error": "dados inválidos na requisição",
  "campos": [
    { "campo": "email", "mensagem": "e-mail inválido" },
    { "campo": "nome_adotante", "mensagem": "campo obrigatório" }
  ]
}
```

| Código | Situação |
|--------|----------|
| `400` | Campos obrigatórios ausentes ou inválidos |
| `404` | Pet ou adoção não encontrado |
| `409` | Pet não está disponível para adoção |
| `500` | Erro interno no servidor |

---

## Deploy Gratuito

### Stack de produção recomendada

| Parte | Plataforma | Plano gratuito |
|-------|-----------|----------------|
| Frontend | [Vercel](https://vercel.com) | Sites ilimitados, CDN global |
| Backend | [Render](https://render.com) | 750h/mês, HTTPS automático |
| Banco de dados | [Neon](https://neon.tech) | PostgreSQL serverless, 512MB |

O projeto detecta automaticamente o ambiente:
- **`DATABASE_URL` vazia** → usa SQLite local (`conectapet.db`)
- **`DATABASE_URL=postgres://...`** → usa PostgreSQL (produção)

### 1. Banco de dados — Neon

1. Crie conta em [neon.tech](https://neon.tech) → **New Project**
2. Copie a **Connection String** (formato `postgres://user:pass@host/db?sslmode=require`)
3. Guarde para usar nas variáveis do Render

### 2. Backend — Render

1. Crie conta em [render.com](https://render.com) → **New Web Service**
2. Conecte o repositório `mattheus-dev/conectapet`
3. Configure:
   - **Root Directory:** *(deixe vazio — raiz do repo)*
   - **Build Command:** `go build -o api ./cmd/api/main.go`
   - **Start Command:** `./api`
4. Adicione as variáveis de ambiente:

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | Connection string do Neon |
| `JWT_SECRET` | String longa e aleatória |
| `ADMIN_USERNAME` | Seu usuário admin |
| `ADMIN_PASSWORD` | Sua senha admin |
| `FRONTEND_URL` | `https://seu-projeto.vercel.app` |
| `GIN_MODE` | `release` |

### 3. Frontend — Vercel

1. Crie conta em [vercel.com](https://vercel.com) → **Add New Project**
2. Importe o repositório `mattheus-dev/conectapet`
3. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite *(detectado automaticamente)*
4. Adicione a variável de ambiente:

| Variável | Valor |
|----------|-------|
| `VITE_API_URL` | `https://conectapet-api.onrender.com/api` |

### Variáveis de ambiente locais

Copie `.env.example` para `.env` e preencha os valores:

```bash
cp .env.example .env
```

> **⚠️ Nunca commite o arquivo `.env`** — ele está no `.gitignore`.
