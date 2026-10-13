# SIGA Phila — Sistema de Gestão de Filas e Matrículas Presenciais

O **SIGA Phila** é um sistema web desenvolvido sob medida para a **ETEC**, projetado para organizar, gerenciar e otimizar todo o fluxo presencial de matrículas dos candidatos aprovados no Vestibulinho, integrando emissão de senhas, chamada nos guichês, conferência documental e arrecadação da APM.

---

## 🛠️ Stack Tecnológica

- **Frontend:**
  - React 19 + Vite
  - Tailwind CSS v4
  - React Router DOM v7
  - React Icons
- **Backend:**
  - Node.js (ES Modules) + Express 5
  - Prisma ORM 7
  - PostgreSQL (Neon Database)
  - Zod (Validação de Schemas e Contratos)
  - JWT + Cookies HttpOnly (Autenticação e Sessão)

---

## 📁 Estrutura do Repositório

```text
projetoTCC/
├── backend/                  # API REST em Node.js / Express
│   ├── prisma/               # Schema do banco de dados e migrações
│   └── src/
│       ├── controllers/      # Controladores HTTP
│       ├── middlewares/      # Validação de token, papéis e erros
│       ├── routes/           # Rotas da aplicação
│       ├── schemas/          # Schemas Zod de entrada
│       └── services/         # Lógica de negócio e acesso ao Prisma
├── frontend/                 # Single Page Application (React / Vite)
│   └── src/
│       ├── components/       # Componentes visuais reutilizáveis (UI)
│       ├── context/          # Contextos globais (Auth, etc.)
│       ├── features/         # Módulos segregados (Admin e Postos)
│       └── pages/            # Páginas públicas e telas de entrada
├── documentação/             # Especificações técnicas e funcionais oficiais
└── regrasDeCodigo.md         # Diretrizes de arquitetura, KISS e DRY
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js** v20 ou superior
- **npm** v10 ou superior
- Instância ativa do **PostgreSQL** (ou conexão Neon)

---

### 1. Configurando o Backend

1. Acesse o diretório do backend:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie o arquivo `.env` com base no `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Configure sua string de conexão `DATABASE_URL` e os segredos JWT no arquivo `.env`.
5. Execute as migrações do banco de dados:
   ```bash
   npx prisma migrate dev
   ```
6. Inicie o servidor de desenvolvimento (porta padrão: `3000`):
   ```bash
   npm run dev
   ```

---

### 2. Configurando o Frontend

1. Em outro terminal, acesse o diretório do frontend:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie o arquivo `.env`:
   ```bash
   cp .env.example .env # ou defina VITE_API_URL=http://localhost:3000
   ```
4. Inicie o servidor de desenvolvimento do Vite:
   ```bash
   npm run dev
   ```
5. Acesse a aplicação no navegador em `http://localhost:5173`.

---

## 👥 Perfis de Acesso e Permissões

- **Administrador (`admin`)**: Acesso irrestrito a todas as áreas operacionais e ao painel `/admin` (cursos, alunos, estoque de produtos, armários, usuários, relatórios e configurações).
- **Supervisor (`supervisor`)**: Acompanhamento do fluxo diário das filas, apoio operacional nos postos e cadastro exclusivo de novos atendentes.
- **Atendente (`atendente`)**: Operação direta nos guichês presenciais:
  - **Triagem (`/triagem`)**: Conferência documental, verificação de cotas e gestão de pendências.
  - **APM (`/apm`)**: Venda facultativa de uniformes escolares, armários e contribuições voluntárias.
  - **Documentos (`/docs`)**: Conferência final física e encerramento da senha presencial.

---

## 📚 Índice de Documentação Oficial

Todas as especificações técnicas, regras de negócio e contratos de endpoints estão consolidados na pasta [`documentação/`](file:///c:/Users/endri/Desktop/TCC/documenta%C3%A7%C3%A3o):

| Documento | Assunto / Módulo |
| :--- | :--- |
| [`DEFINICOES_FUNCIONAIS_DO_SISTEMA.md`](file:///c:/Users/endri/Desktop/TCC/documenta%C3%A7%C3%A3o/DEFINICOES_FUNCIONAIS_DO_SISTEMA.md) | Visão geral, jornada do candidato e regras de negócio do TCC. |
| [`REFERENCIA_MODELO_LOGICO.md`](file:///c:/Users/endri/Desktop/TCC/documenta%C3%A7%C3%A3o/REFERENCIA_MODELO_LOGICO.md) | Diagrama ER e dicionário de dados de todas as entidades do banco. |
| [`ATENDIMENTO.md`](file:///c:/Users/endri/Desktop/TCC/documenta%C3%A7%C3%A3o/ATENDIMENTO.md) | Ciclo de vida da senha, chamadas no painel e fluxo de guichês. |
| [`IMPRESSORA.md`](file:///c:/Users/endri/Desktop/TCC/documenta%C3%A7%C3%A3o/IMPRESSORA.md) | Integração WebUSB / ESC/POS para impressão térmica no totem. |
| [`TELA_POSTOS.md`](file:///c:/Users/endri/Desktop/TCC/documenta%C3%A7%C3%A3o/TELA_POSTOS.md) | Centro de comando operacional e monitoramento de filas (`/admin/postos`). |
| [`TELA_ALUNOS.md`](file:///c:/Users/endri/Desktop/TCC/documenta%C3%A7%C3%A3o/TELA_ALUNOS.md) | Gestão de candidatos, matrículas e importação de CSV (`/admin/alunos`). |
| [`TELA_CURSOS.md`](file:///c:/Users/endri/Desktop/TCC/documenta%C3%A7%C3%A3o/TELA_CURSOS.md) | Catálogo de cursos técnicos, períodos, vagas e arquivamento (`/admin/cursos`). |
| [`TELA_PRODUTOS.md`](file:///c:/Users/endri/Desktop/TCC/documenta%C3%A7%C3%A3o/TELA_PRODUTOS.md) | Catálogo de uniformes, estoque físico e locação de armários (`/admin/produtos`). |
| [`TELA_USUARIOS.md`](file:///c:/Users/endri/Desktop/TCC/documenta%C3%A7%C3%A3o/TELA_USUARIOS.md) | Gerenciamento de voluntários, permissões e status de conta (`/admin/usuarios`). |
| [`TELA_CONFIGURACOES.md`](file:///c:/Users/endri/Desktop/TCC/documenta%C3%A7%C3%A3o/TELA_CONFIGURACOES.md) | Liberação de armários na APM e reinício de numeração diária (`/admin/configuracoes`). |
| [`TELA_DASHBOARD.md`](file:///c:/Users/endri/Desktop/TCC/documenta%C3%A7%C3%A3o/TELA_DASHBOARD.md) | Indicadores gerenciais em tempo real, TME e TMA (`/admin/dashboard`). |
| [`TELA_RELATORIOS.md`](file:///c:/Users/endri/Desktop/TCC/documenta%C3%A7%C3%A3o/TELA_RELATORIOS.md) | Prestação de contas financeiras da APM e relatórios consolidados (`/admin/relatorios`). |
| [`TELA_TRIAGEM.md`](file:///c:/Users/endri/Desktop/TCC/documenta%C3%A7%C3%A3o/TELA_TRIAGEM.md) | Posto operacional presencial de Triagem (`/triagem`). |
| [`TELA_APM.md`](file:///c:/Users/endri/Desktop/TCC/documenta%C3%A7%C3%A3o/TELA_APM.md) | Posto operacional presencial da APM (`/apm`). |
| [`TELA_SECRETARIA.md`](file:///c:/Users/endri/Desktop/TCC/documenta%C3%A7%C3%A3o/TELA_SECRETARIA.md) | Especificação das operações de retirada e vendas avulsas da Secretaria. |
