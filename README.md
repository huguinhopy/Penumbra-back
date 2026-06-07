# Penumbra - Sistema de Reservas

API RESTful desenvolvida em Node.js para gerenciamento de reservas de mesas, administradores e logs de ações. Construída com Express, Sequelize e PostgreSQL.

## Índice

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pre-requisitos)
- [Como Instalar](#como-instalar)
- [Configuracao](#configuracao)
- [Como Rodar Localmente](#como-rodar-localmente)
- [Variaveis de Ambiente](#variaveis-de-ambiente)
- [Endpoints da API](#endpoints-da-api)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Modelos de Dados](#modelos-de-dados)
- [Scripts Disponiveis](#scripts-disponiveis)
- [Licenca](#licenca)

---

## Funcionalidades

- **Gestao de Administradores**: Cadastro, autenticacao e gerenciamento de administradores com diferentes niveis de acesso
- **Gestao de Mesas**: Cadastro e controle de mesas com capacidade e status (ativa/inativa)
- **Sistema de Reservas**: Criacao, edicao, cancelamento e consulta de reservas com verificacao de disponibilidade
- **Logs de Auditoria**: Registro detalhado de todas as acoes administrativas no sistema
- **Validacao de Dados**: Validacoes embutidas para garantir integridade dos dados
- **Conflitos de Reserva**: Deteccao automatica de conflitos de horario com janela de 2 horas

## Tecnologias

- **Node.js** - Ambiente de execucao
- **Express.js** - Framework web
- **Sequelize ORM** - ORM para interacao com banco de dados
- **PostgreSQL** - Banco de dados relacional
- **bcryptjs** - Hash de senhas
- **dotenv** - Gerenciamento de variaveis de ambiente
- **pg & pg-hstore** - Driver PostgreSQL para Node.js

## Pré-requisitos

- **Node.js** (versao 16 ou superior)
- **npm** ou **yarn**
- **PostgreSQL** (versao 12 ou superior)
- **Git**

---

## Como Instalar

1. **Clone o repositorio**
    ```bash
    git clone https://github.com/huguinhopy/Penumbra-back.git
    cd Penumbra-back
    ```

2. **Instale as dependencias**
    ```bash
    npm install
    ```

3. **Configure o banco de dados**
    - Crie um banco de dados PostgreSQL (ex: `penumbra_db`)
    - Edite o arquivo `src/config/config.json` com suas credenciais

---

## Configuracao

Edite o arquivo `src/config/config.json` com as configuracoes do seu banco de dados PostgreSQL:

```json
{
  "development": {
    "username": "seu_usuario",
    "password": "sua_senha",
    "database": "penumbra_development",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "test": {
    "username": "seu_usuario",
    "password": "sua_senha",
    "database": "penumbra_test",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "production": {
    "username": "seu_usuario",
    "password": "sua_senha",
    "database": "penumbra_production",
    "host": "seu_host",
    "dialect": "postgres"
  }
}
```

---

## Como Rodar Localmente

### Desenvolvimento
```bash
npm run dev
```
O servidor iniciara em `http://localhost:3000` por padrao.

### Producao
```bash
npm start
```

### Verificacao de Saude
```bash
curl http://localhost:3000/health
```
Resposta:
```json
{"status": "ok", "timestamp": "2026-06-07T08:37:30.584Z"}
```

---

## Variaveis de Ambiente

O projeto utiliza o arquivo `src/config/config.json` para configuracoes do banco de dados. A porta do servidor pode ser configurada via variavel de ambiente:

| Variavel | Descricao | Valor Padrao |
|----------|-----------|--------------|
| PORT | Porta do servidor HTTP | 3000 |
| NODE_ENV | Ambiente de execucao | development |

---

## Endpoints da API

### Health Check

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/health` | Verifica status do servidor |

---

### Administradores

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/api/administradores/login` | Autenticar administrador |
| GET | `/api/administradores` | Listar todos os administradores |
| GET | `/api/administradores/:id` | Buscar administrador por ID |
| POST | `/api/administradores` | Criar novo administrador |
| PUT | `/api/administradores/:id` | Atualizar administrador |
| DELETE | `/api/administradores/:id` | Remover administrador |

**Exemplos:**

Login:
```bash
POST /api/administradores/login
{"email": "admin@penumbra.com", "senha": "senha123"}
```

Criar administrador:
```bash
POST /api/administradores
{"nome": "Joao Silva", "email": "joao@penumbra.com", "senha": "senha123", "nivel_acesso": "admin"}
```

**Niveis de acesso:** `super_admin`, `admin`

---

### Mesas

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/mesas` | Listar mesas (filtro: `?ativa=true/false`) |
| GET | `/api/mesas/disponibilidade` | Verificar disponibilidade |
| GET | `/api/mesas/:id` | Buscar mesa por ID |
| POST | `/api/mesas` | Criar nova mesa |
| PUT | `/api/mesas/:id` | Atualizar mesa |
| DELETE | `/api/mesas/:id` | Remover mesa |

**Exemplos:**

Listar mesas ativas:
```bash
GET /api/mesas?ativa=true
```

Verificar disponibilidade:
```bash
GET /api/mesas/disponibilidade?data_hora=2026-06-10T19:00:00&num_pessoas=4
```

Criar mesa:
```bash
POST /api/mesas
{"numero": 5, "capacidade": 6, "ativa": true}
```

---

### Reservas

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/reservas` | Listar reservas (filtros: `status`, `data`, `email`) |
| GET | `/api/reservas/:id` | Buscar reserva por ID |
| POST | `/api/reservas` | Criar nova reserva |
| PUT | `/api/reservas/:id` | Atualizar reserva |
| PATCH | `/api/reservas/:id/status` | Atualizar status |
| DELETE | `/api/reservas/:id` | Remover reserva |

**Exemplos:**

Criar reserva:
```bash
POST /api/reservas
{
  "nome": "Maria Oliveira",
  "email": "maria@email.com",
  "telefone": "(11) 99999-9999",
  "id_mesa": 1,
  "data_hora": "2026-06-10T19:00:00",
  "num_pessoas": 4,
  "observacoes": "Aniversario"
}
```

Atualizar status:
```bash
PATCH /api/reservas/1/status
{"status": "confirmada", "id_admin": 1, "descricao": "Reserva confirmada"}
```

**Status validos:** `pendente`, `confirmada`, `cancelada`, `concluida`

---

### Logs

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/logs` | Listar logs (filtros: `id_admin`, `id_reserva`) |
| GET | `/api/logs/:id` | Buscar log por ID |

---

### Codigos de Status HTTP

| Codigo | Descricao |
|--------|-----------|
| 200 | OK - Sucesso |
| 201 | Created - Recurso criado |
| 204 | No Content - Sucesso sem conteudo |
| 400 | Bad Request - Dados invalidos |
| 401 | Unauthorized - Credenciais invalidas |
| 403 | Forbidden - Acesso negado |
| 404 | Not Found - Recurso nao encontrado |
| 409 | Conflict - Conflito (duplicidade) |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

---

## Estrutura do Projeto

```
Penumbra-back/
├── src/
│   ├── app.js                    # Configuracao Express
│   ├── server.js                 # Ponto de entrada
│   ├── config/
│   │   ├── config.json           # Configuracoes Sequelize
│   │   └── database.js           # Conexao banco
│   ├── controllers/
│   │   ├── administradorController.js
│   │   ├── logController.js
│   │   ├── mesaController.js
│   │   └── reservaController.js
│   ├── models/
│   │   ├── index.js
│   │   ├── Administrador.js
│   │   ├── LogAcaoAdmin.js
│   │   ├── Mesa.js
│   │   └── Reserva.js
│   ├── routes/
│   │   ├── administradores.js
│   │   ├── logs.js
│   │   ├── mesas.js
│   │   └── reservas.js
│   └── middlewares/
│       └── errorHandler.js
├── .gitignore
├── package.json
└── README.md
```

---

## Modelos de Dados

### Administrador

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id_admin | integer | PK, auto-incremento |
| nome | string(100) | Obrigatorio |
| email | string(150) | Unico, obrigatoria |
| senha_hash | string(255) | Hash bcrypt |
| nivel_acesso | enum | super_admin, admin |

### Mesa

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id_mesa | integer | PK, auto-incremento |
| numero | integer | Obrigatorio (min: 1) |
| capacidade | integer | 1-50 pessoas |
| ativa | boolean | Padrao: true |

### Reserva

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id_reserva | integer | PK, auto-incremento |
| nome | string(100) | Nome do cliente |
| email | string(150) | Email do cliente |
| telefone | string(20) | Telefone do cliente |
| id_mesa | integer | FK para Mesa |
| data_hora | date | Data futura obrigatoria |
| num_pessoas | integer | Minimo 1 |
| status | enum | pendente, confirmada, cancelada, concluida |
| observacoes | text | Opcional |
| criado_em | date | Automatico |
| atualizado_em | date | Automatico |

### LogAcaoAdmin

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id_log | integer | PK, auto-incremento |
| id_admin | integer | FK para Administrador |
| id_reserva | integer | FK para Reserva |
| acao | string(50) | Tipo de acao |
| descricao | text | Detalhes |
| realizado_em | date | Automatico |

---

## Scripts Disponiveis

| Script | Comando | Descricao |
|--------|---------|-----------|
| dev | `npm run dev` | Modo desenvolvimento com nodemon |
| start | `npm start` | Modo producao |
| test | `npm test` | Testes (nao configurado) |

---

## Seguranca

- Senhas hasheadas com bcryptjs (salt rounds: 10)
- Senhas nunca sao retornadas nas respostas da API
- Validacoes de dados nos modelos e controllers
- Niveis de acesso diferenciados para administradores

---

## Licenca

Este projeto esta licenciado sob a licenca ISC.

---

**Desenvolvido para o sistema de reservas Penumbra**