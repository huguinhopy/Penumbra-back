# Penumbra — Sistema de Reservas

API RESTful para gerenciamento de reservas de mesas do restaurante Penumbra. Construída com Node.js, Express, Sequelize e PostgreSQL.

---

## Índice

- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Como instalar](#como-instalar)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Como rodar localmente](#como-rodar-localmente)
- [Autenticação](#autenticação)
- [Endpoints da API](#endpoints-da-api)
- [Códigos de resposta](#códigos-de-resposta)
- [Modelos de dados](#modelos-de-dados)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Melhorias futuras](#melhorias-futuras)

---

## Tecnologias

| Pacote | Uso |
|---|---|
| Node.js | Ambiente de execução |
| Express.js | Framework HTTP |
| Sequelize ORM | Abstração do banco de dados |
| PostgreSQL | Banco de dados relacional |
| bcryptjs | Hash de senhas |
| jsonwebtoken | Autenticação via JWT |
| dotenvx | Gerenciamento de variáveis de ambiente |

---

## Pré-requisitos

- Node.js 18 ou superior
- PostgreSQL 12 ou superior
- npm

---

## Como instalar

**1. Clone o repositório**
```bash
git clone https://github.com/huguinhopy/Penumbra-back.git
cd Penumbra-back
```

**2. Instale as dependências**
```bash
npm install
```

**3. Crie o banco de dados no PostgreSQL**
```sql
CREATE DATABASE penumbra_db;
```

**4. Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto com base na seção abaixo.

---

## Variáveis de ambiente

Crie o arquivo `.env` na raiz:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=penumbra_db

JWT_SECRET=sua_chave_secreta_longa_e_aleatoria
```

> **Importante:** nunca suba o `.env` para o repositório. Ele já está no `.gitignore`.

---

## Como rodar localmente

**Modo desenvolvimento** (com hot reload via nodemon)
```bash
npm run dev
```

**Modo produção**
```bash
npm start
```

O servidor sobe em `http://localhost:3000` por padrão.

Na inicialização o Sequelize sincroniza os models com o banco automaticamente — as tabelas são criadas se ainda não existirem.

**Verificar se a API está no ar:**
```bash
curl http://localhost:3000/health
```
```json
{ "status": "ok", "timestamp": "2026-06-07T10:00:00.000Z" }
```

---

## Autenticação

A maioria das rotas exige autenticação via JWT. O token é obtido no login e deve ser enviado no header de todas as requisições protegidas:

```
Authorization: Bearer <token>
```

O token expira em **8 horas**.

**Rotas públicas (sem token):**

| Método | Endpoint |
|---|---|
| POST | `/api/administradores/login` |
| POST | `/api/reservas` |
| DELETE | `/api/reservas/:id` |
| GET | `/api/mesas` |
| GET | `/api/mesas/disponibilidade` |
| GET | `/api/mesas/:id` |

---

## Endpoints da API

### Health

| Método | Endpoint | Auth | Descrição |
|---|---|---|---|
| GET | `/health` | — | Status do servidor |

---

### Administradores

| Método | Endpoint | Auth | Descrição |
|---|---|---|---|
| POST | `/api/administradores/login` | — | Login |
| GET | `/api/administradores` | 🔒 | Listar admins |
| GET | `/api/administradores/:id` | 🔒 | Buscar por ID |
| POST | `/api/administradores` | 🔒 | Criar admin |
| PUT | `/api/administradores/:id` | 🔒 | Atualizar admin |
| DELETE | `/api/administradores/:id` | 🔒 | Remover admin |

**Login**
```json
POST /api/administradores/login
{
  "email": "admin@penumbra.com",
  "senha": "senha123"
}
```
Resposta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "admin": {
    "id_admin": 1,
    "nome": "Marco Admin",
    "email": "admin@penumbra.com",
    "nivel_acesso": "dono"
  }
}
```

> Após 5 tentativas de login incorretas, a conta é bloqueada por 15 minutos.

**Criar admin**
```json
POST /api/administradores
{
  "nome": "Giulia Ferrari",
  "email": "giulia@penumbra.com",
  "senha": "senha123",
  "nivel_acesso": "gerente"
}
```

**Níveis de acesso:** `atendente` · `gerente` · `administrador` · `dono`

> O nível `dono` não pode ser removido. Um admin não pode remover a si mesmo.

---

### Mesas

| Método | Endpoint | Auth | Descrição |
|---|---|---|---|
| GET | `/api/mesas` | — | Listar mesas |
| GET | `/api/mesas/disponibilidade` | — | Verificar disponibilidade |
| GET | `/api/mesas/:id` | — | Buscar por ID |
| POST | `/api/mesas` | 🔒 | Criar mesa |
| PUT | `/api/mesas/:id` | 🔒 | Atualizar mesa |
| DELETE | `/api/mesas/:id` | 🔒 | Remover mesa |

**Listar apenas mesas ativas**
```
GET /api/mesas?ativa=true
```

**Verificar disponibilidade**
```
GET /api/mesas/disponibilidade?data_hora=2026-06-14T20:00:00&num_pessoas=2
```

Retorna lista de mesas com capacidade suficiente e campo `disponivel: true/false` para o horário informado. A janela de conflito é de ±2 horas.

**Criar mesa**
```json
POST /api/mesas
{
  "numero": 5,
  "capacidade": 4,
  "ativa": true
}
```

---

### Reservas

| Método | Endpoint | Auth | Descrição |
|---|---|---|---|
| POST | `/api/reservas` | — | Criar reserva (cliente) |
| DELETE | `/api/reservas/:id` | — | Cancelar reserva (cliente) |
| GET | `/api/reservas` | 🔒 | Listar reservas |
| GET | `/api/reservas/:id` | 🔒 | Buscar por ID |
| PATCH | `/api/reservas/:id/status` | 🔒 | Atualizar status (admin) |

**Criar reserva — feita pelo cliente, sem mesa vinculada**
```json
POST /api/reservas
{
  "nome": "Marco Rossi",
  "email": "marco@email.com",
  "telefone": "(84) 99999-0000",
  "data_hora": "2026-06-14T20:00:00",
  "num_pessoas": 2,
  "observacoes": "Aniversário da Maria"
}
```

> A reserva entra com status `pendente`. A mesa é vinculada pelo admin na confirmação.

**Listar com filtros**
```
GET /api/reservas?status=pendente
GET /api/reservas?email=marco@email.com
GET /api/reservas?telefone=(84) 99999-0000
GET /api/reservas?data=2026-06-14
```

**Atualizar status — admin vincula mesa ao confirmar**
```json
PATCH /api/reservas/1/status
{
  "status": "confirmada",
  "id_mesa": 3,
  "descricao": "Mesa do canto reservada"
}
```

> `id_mesa` é obrigatório quando o status for `confirmada`. Para os demais status é ignorado.

**Cancelar reserva — feita pelo cliente**
```
DELETE /api/reservas/:id
```

> Não apaga do banco — apenas muda o status para `cancelada`.

**Status válidos:** `pendente` · `confirmada` · `cancelada` · `concluida`

---

### Logs

| Método | Endpoint | Auth | Descrição |
|---|---|---|---|
| GET | `/api/logs` | 🔒 | Listar logs |
| GET | `/api/logs/:id` | 🔒 | Buscar log por ID |

**Filtros disponíveis**
```
GET /api/logs?id_admin=1
GET /api/logs?id_reserva=5
```

> Os logs são somente leitura — não há endpoint de criação ou deleção. Todo registro é gerado automaticamente pelas ações do sistema.

**Entidades registradas:** `reserva` · `mesa` · `admin` · `auth`

---

## Códigos de resposta

| Código | Significado |
|---|---|
| 200 | OK |
| 201 | Criado |
| 204 | Sem conteúdo (sucesso sem retorno) |
| 400 | Dados inválidos |
| 401 | Não autenticado |
| 403 | Acesso negado |
| 404 | Não encontrado |
| 409 | Conflito (ex: mesa já reservada no horário) |
| 500 | Erro interno |
| 503 | Banco de dados indisponível |

---

## Modelos de dados

### Administrador

| Campo | Tipo | Detalhe |
|---|---|---|
| id_admin | integer | PK, auto-incremento |
| nome | string(100) | Obrigatório |
| email | string(150) | Único, obrigatório |
| senha_hash | string(255) | Hash bcrypt, nunca retornado |
| nivel_acesso | enum | atendente, gerente, administrador, dono |
| tentativas_login | integer | Padrão 0, zerado após login bem-sucedido |
| bloqueado_ate | date | Preenchido após 5 tentativas falhas |
| ultimo_acesso | date | Atualizado a cada login |

### Mesa

| Campo | Tipo | Detalhe |
|---|---|---|
| id_mesa | integer | PK, auto-incremento |
| numero | integer | Obrigatório, mínimo 1 |
| capacidade | integer | 1 a 50 pessoas |
| ativa | boolean | Padrão true |

### Reserva

| Campo | Tipo | Detalhe |
|---|---|---|
| id_reserva | integer | PK, auto-incremento |
| nome | string(100) | Obrigatório |
| email | string(150) | Obrigatório |
| telefone | string(20) | Obrigatório |
| id_mesa | integer | FK para Mesa, nullable até confirmação |
| data_hora | date | Obrigatório, deve ser data futura |
| num_pessoas | integer | Mínimo 1 |
| status | enum | pendente, confirmada, cancelada, concluida |
| observacoes | text | Opcional |
| criado_em | date | Automático |
| atualizado_em | date | Atualizado automaticamente |

### LogAcaoAdmin

| Campo | Tipo | Detalhe |
|---|---|---|
| id_log | integer | PK, auto-incremento |
| id_admin | integer | FK para Administrador |
| acao | string(100) | Ex: status_atualizado, mesa_criada |
| entidade | enum | reserva, mesa, admin, auth |
| entidade_id | integer | ID do registro afetado |
| descricao | text | Detalhes da ação, opcional |
| realizado_em | date | Automático |

---

## Estrutura do projeto

```
Penumbra-back/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── config.json
│   │   └── database.js
│   ├── controllers/
│   │   ├── administradorController.js
│   │   ├── logController.js
│   │   ├── mesaController.js
│   │   └── reservaController.js
│   ├── middlewares/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── index.js
│   │   ├── Administrador.js
│   │   ├── LogAcaoAdmin.js
│   │   ├── Mesa.js
│   │   └── Reserva.js
│   └── routes/
│       ├── administradores.js
│       ├── logs.js
│       ├── mesas.js
│       └── reservas.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

## Melhorias futuras

Funcionalidades planejadas mas não implementadas nesta versão:

- `cancelado_por` na reserva — diferenciar cancelamento feito pelo cliente ou pelo admin
- `motivo_cancelamento` — campo obrigatório ao cancelar pelo admin
- Status `no_show` — marcar quando o cliente não compareceu sem avisar
- Reserva manual pelo admin — criar reservas diretamente pelo painel sem passar pelo fluxo do cliente
- Remoção automática de reservas concluídas após 24h via job agendado
- Envio de e-mails transacionais (confirmação, lembrete 24h antes, cancelamento)
- Sistema de convite por token para novos admins

---

*Desenvolvido para o sistema de reservas Penumbra.*