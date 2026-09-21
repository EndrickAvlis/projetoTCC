# Tela do Posto de Triagem — Guia de Implementação e Contratos

Este documento é a especificação técnica e funcional da tela do posto de Triagem do SIGA Phila (`/triagem`). Ele define a arquitetura do frontend, os modelos do banco de dados, os contratos da API e as regras de negócio para a implementação do backend.

---

## 1. Visão Geral e Fluxo da Senha

A Triagem é o primeiro posto de atendimento presencial da matrícula. Nela, o atendente chama a senha, identifica/cadastra o aluno, confere os dados do curso e registra pendências documentais se houver.

### Fluxo de Estados da Senha:

```text
[aguardando] (na fila da Triagem)
    │
    ▼ (POST /filas/chamadas)
[em_atendimento] (reservada pelo guichê; abre HistoricoSenha)
    │
    ▼ (POST /atendimentos - Iniciar Atendimento manual)
    │ Atendente busca/cadastra aluno e confere dados
    │
    ├──▶ SEM PENDÊNCIA:
    │      POST /atendimentos/:id/finalizar
    │      └── Senha muda para: status = 'aguardando', etapa = 'apm'
    │          HistoricoSenha atual é fechado com dataHoraFimHistorico
    │
    └──▶ COM PENDÊNCIA DOCUMENTAL:
           POST /atendimentos/:id/pendencias (ao menos 1 documento marcado)
           └── Senha muda para: status = 'pendente', etapa = 'triagem'
               Grava pendenciaTriagem = { documentos: [...], registradaEm }
               HistoricoSenha atual é fechado
               │
               ▼ (POST /filas/pendencias/:senhaId/retomadas)
               Retomada direta: volta para status = 'em_atendimento'
               Abre NOVO HistoricoSenha (não retorna para a fila geral de aguardando)
```

---

## 2. Arquitetura do Frontend (`features/postos`)

O código do frontend está estruturado sob `frontend/src/features/postos/`:

```text
frontend/src/features/postos/
├── components/
│   └── triagem/
│       ├── BuscarAlunos.jsx          # Busca operacional por nome com autocomplete e novo cadastro
│       ├── DadosAlunoForm.jsx        # Formulário dos dados do aluno e curso/ano/período
│       ├── DetalhePendencia.jsx      # Painel lateral com dados da pendência e botão Retomar
│       ├── DocumentosPendentes.jsx   # Accordion colapsável com checkboxes e botão Salvar Pendência
│       ├── PendenciasGrid.jsx        # Grade de senhas pendentes da Triagem
│       └── TriagemMain.jsx           # Orquestrador com abas "Atendimento atual" e "Senhas pendentes"
├── constants/
│   └── triagem.js                    # Constantes de documentos, fases de atendimento e opções
├── hooks/
│   ├── useBuscaAlunos.js             # Busca por nome com debounce e controle por useRef
│   ├── usePendencias.js              # Listagem, polling de 5s, seleção e retomada de pendências
│   └── useTriagem.js                 # Ciclo de vida do posto, início, salvar dados, finalizar e pendência
├── layout/
│   ├── AtendimentoActions.jsx        # Faixa superior de identificação e ações (Rechamar, Iniciar, Finalizar)
│   ├── PostoLayout.jsx               # Estrutura compartilhada entre os postos (SidePostos + Header + miolo)
│   └── SidePostos.jsx                # Barra lateral de fila/histórico e senha atual
├── pages/
│   └── triagemPage.jsx               # Rota /triagem (PostoLayout envolvendo TriagemMain)
└── services/
    └── TriagemService.js             # Funções de chamada HTTP baseadas em apiClient
```

---

## 3. Alterações Necessárias no Banco de Dados (`schema.prisma`)

### 3.1. Modelo `Senha`

Adicionar campo JSON opcional para armazenar pendências documentais:

```prisma
model Senha {
  // campos existentes...
  pendenciaTriagem Json?   // Formato: { "documentos": ["RG_CIN", "FOTO"], "registradaEm": DateTime }
}
```

### 3.2. Modelo `HistoricoSenha`

Distinguir o momento da chamada do início manual e controlar rechamadas:

```prisma
model HistoricoSenha {
  idHistorico             Int       @id @default(autoincrement())
  codSenha                Int
  codVoluntario           Int
  etapaHistorico          String?   @db.VarChar(15)
  guicheHistorico         String?   @db.VarChar(20)
  dataHoraChamada         DateTime  // Preenchido no POST /filas/chamadas
  dataHoraInicioHistorico DateTime? // Preenchido no POST /atendimentos (início manual)
  dataHoraFimHistorico    DateTime? // Preenchido na finalização ou ao salvar pendência
  ultimaRechamadaEm       DateTime?
  quantidadeRechamadas    Int       @default(0)

  senha      Senha      @relation(fields: [codSenha], references: [idSenha])
  voluntario Voluntario @relation(fields: [codVoluntario], references: [idVoluntario])
}
```

### 3.3. Modelo `Aluno`

Remover CPF da Triagem e suportar candidatos importados e cadastro manual:

```prisma
enum StatusAluno {
  CANDIDATO
  ATIVO
  ARQUIVADO
}

model Aluno {
  idAluno             Int          @id @default(autoincrement())
  numeroInscricao     String?      @db.VarChar(30)
  nomeAluno           String       @db.VarChar(100)
  escolaridadePublica Boolean?
  cidadeAluno         String?      @db.VarChar(100)
  sexoAluno           String?      @db.VarChar(20)
  statusAluno         StatusAluno  @default(CANDIDATO)
  anoProcesso         Int?
  semestreProcesso    Int?

  cursosAluno CursoAluno[]
  senhas      Senha[]

  @@index([nomeAluno])
  @@index([statusAluno, nomeAluno])
}
```

### 3.4. Modelo `CursoAluno`

Adicionar ano escolar e status da matrícula:

```prisma
enum StatusMatricula {
  PENDENTE
  ATIVA
}

model CursoAluno {
  codCurso        Int
  codAluno        Int
  classificacao   Int?
  statusMatricula StatusMatricula @default(PENDENTE)
  periodo         Periodo
  anoEscolar      Int             // Valores válidos: 1, 2 ou 3

  curso Curso @relation(fields: [codCurso], references: [idCurso])
  aluno Aluno @relation(fields: [codAluno], references: [idAluno])

  @@id([codCurso, codAluno])
}
```

---

## 4. Constantes Oficiais e Enums

### Documentos da Triagem (`DOCUMENTOS_TRIAGEM`):

As únicas 5 chaves estáveis aceitas pelo sistema são:

- `RG_CIN`: RG/CIN
- `CPF_CIN`: CPF/CIN
- `FOTO`: Foto 3x4
- `ESCOLARIDADE_PUBLICA`: Comprovação de escolaridade pública
- `HISTORICO_ENSINO_FUNDAMENTAL`: Histórico do Ensino Fundamental

### Fases do Atendimento (`FASE_ATENDIMENTO`):

- `sem_senha`: Nenhuma senha reservada no posto.
- `chamada`: Senha reservada (`em_atendimento`), mas início manual ainda não clicado.
- `iniciada`: Atendimento iniciado, formulário liberado para edição e busca.

### Valores de Seleção:

- `anoEscolar`: `1`, `2`, `3`
- `escolaridadePublica`: `true` (Sim), `false` (Não), `null` (Não informado)
- `sexo`: `"M"` (Masculino), `"F"` (Feminino), `"OUTRO"` (Outro)

---

## 5. Contratos da API (Guia de Endpoints para o Backend)

Todas as rotas requerem autenticação (`Bearer <token>`). O backend obtém `idVoluntario` e `guiche` da sessão/token.

### 5.1. Fila e Chamadas

#### `GET /filas?etapa=triagem`

Lista senhas aguardando na Triagem.

- **Ordenação obrigatória:** 1º Prioritárias (`tipoSenha = true`), 2º `dataHoraEmissaoSenha` crescente, 3º `idSenha` crescente.
- **Resposta `200 OK`:**

```json
{
  "senhas": [
    {
      "id": 15,
      "codigo": 42,
      "etapaAtual": "triagem",
      "status": "aguardando",
      "tipoSenha": false,
      "emitidaEm": "2026-09-21T14:00:00Z"
    }
  ],
  "total": 1
}
```

#### `POST /filas/chamadas`

Chama a próxima senha da fila ou uma senha específica.

- **Corpo (opcional):** `{ "etapa": "triagem", "senhaId": 15 }` (se omitir `senhaId`, chama a próxima da fila automaticamente).
- **Regra:** Se o atendente já possui uma senha em atendimento, responder `409 ATENDIMENTO_ATIVO_EXISTENTE`. Se a senha já foi chamada por outro guichê, responder `409 SENHA_INDISPONIVEL`.
- **Resposta `200 OK`:**

```json
{
  "senha": {
    "id": 15,
    "codigo": 42,
    "etapaAtual": "triagem",
    "status": "em_atendimento",
    "tipoSenha": false
  },
  "historico": {
    "id": 95,
    "chamadaEm": "2026-09-21T14:05:00Z",
    "iniciadaEm": null
  }
}
```

#### `GET /filas/atual?etapa=triagem`

Recupera o atendimento atual do voluntário logado (para recuperação de tela em F5).

- **Resposta `200 OK`:** Mesmo formato do `POST /filas/chamadas` ou `{ "senha": null, "historico": null }`.

#### `GET /filas/historico?etapa=triagem`

Lista chamadas realizadas hoje na Triagem (somente leitura).

- **Resposta `200 OK`:**

```json
{
  "senhas": [
    {
      "id": 15,
      "codigo": 42,
      "tipoSenha": false,
      "chamadaEm": "2026-09-21T14:05:00Z"
    }
  ]
}
```

#### `POST /filas/chamadas/:senhaId/rechamadas`

Notifica o painel de chamadas (TV) para rechamar a senha atual.

- **Corpo:** `{ "etapa": "triagem" }`
- **Resposta `200 OK`:** `{ "message": "Senha chamada novamente.", "quantidadeRechamadas": 2 }`

#### `PATCH /senhas/:senhaId/prioridade`

Alterna a prioridade da senha em atendimento.

- **Corpo:** `{ "tipoSenha": true }` (ou `false`)
- **Resposta `200 OK`:** `{ "id": 15, "tipoSenha": true }`

---

### 5.2. Alunos e Formulário da Triagem

#### `GET /alunos?nome=...&limite=10`

Pesquisa operacional por nome (ignora maiúsculas/minúsculas e acentos). Exclui alunos com status `ARQUIVADO`.

- **Resposta `200 OK`:**

```json
{
  "alunos": [
    {
      "id": 9,
      "nome": "Mariane Trindade",
      "numeroInscricao": "001234",
      "situacao": "CANDIDATO",
      "escolaridadePublica": true,
      "cidade": "Orindiúva",
      "sexo": "F",
      "matriculas": [
        {
          "cursoId": 3,
          "curso": "Desenvolvimento de Sistemas",
          "classificacao": 1,
          "periodo": "manha",
          "anoEscolar": 1,
          "situacao": "PENDENTE"
        }
      ]
    }
  ]
}
```

#### `POST /alunos`

Cadastro manual rápido de aluno não encontrado na pesquisa.

- **Corpo:**

```json
{
  "nome": "João da Silva",
  "numeroInscricao": null,
  "escolaridadePublica": null,
  "cidade": "Orindiúva",
  "sexo": "M",
  "matricula": {
    "cursoId": 3,
    "classificacao": null,
    "periodo": "manha",
    "anoEscolar": 1
  }
}
```

- **Resposta `201 Created`:** Retorna o aluno criado no mesmo formato da busca.

#### `PUT /senhas/:senhaId/aluno`

Salva e vincula os dados confirmados do aluno à senha em atendimento.

- **Corpo:**

```json
{
  "alunoId": 9,
  "dadosAluno": {
    "nome": "Mariane Trindade",
    "escolaridadePublica": true,
    "cidade": "Orindiúva",
    "sexo": "F"
  },
  "matricula": {
    "cursoId": 3,
    "classificacao": 1,
    "periodo": "manha",
    "anoEscolar": 1
  }
}
```

- **Regra:** Atualiza `Aluno`, atualiza ou vincula `CursoAluno` e define `Senha.codAluno = alunoId` em transação.
- **Resposta `200 OK`:** `{ "message": "Dados vinculados à senha com sucesso." }`

#### `GET /cursos`

Retorna a lista de cursos ativos para os selects do formulário.

- **Resposta `200 OK`:** `[{ "id": 3, "nome": "Desenvolvimento de Sistemas" }]`

---

### 5.3. Atendimento, Pendências e Finalização

#### `POST /atendimentos`

Registra o início manual do atendimento.

- **Corpo:** `{ "senhaId": 15 }`
- **Regra:** Atualiza o `HistoricoSenha` aberto definindo `dataHoraInicioHistorico = agora`.
- **Resposta `200 OK`:**

```json
{
  "atendimento": {
    "id": 95,
    "senhaId": 15,
    "iniciadoEm": "2026-09-21T14:10:00Z"
  }
}
```

#### `POST /atendimentos/:atendimentoId/pendencias`

Registra pendência documental na Triagem.

- **Corpo:** `{ "documentos": ["RG_CIN", "FOTO"] }`
- **Regra Transacional:**
  1. Validar que ao menos 1 documento válido foi enviado.
  2. Atualizar `Senha`: `status = 'pendente'`, `pendenciaTriagem = { documentos, registradaEm: agora }`.
  3. Manter `Senha.etapa = 'triagem'`.
  4. Encerrar `HistoricoSenha` atual: `dataHoraFimHistorico = agora`.
- **Resposta `200 OK`:** `{ "message": "Pendência registrada na Triagem." }`

#### `POST /atendimentos/:atendimentoId/finalizar`

Conclui o atendimento da Triagem com sucesso (sem pendências).

- **Regra Transacional:**
  1. Validar que o atendimento possui aluno e matrícula vinculados.
  2. Atualizar `Senha`: `etapa = 'apm'`, `status = 'aguardando'`, `pendenciaTriagem = null`.
  3. Encerrar `HistoricoSenha` atual: `dataHoraFimHistorico = agora`.
- **Resposta `200 OK`:** `{ "message": "Triagem finalizada.", "proximaEtapa": "apm" }`

#### `GET /filas/pendencias?etapa=triagem`

Lista todas as senhas que estão no estado `pendente` na Triagem.

- **Resposta `200 OK`:**

```json
{
  "pendencias": [
    {
      "senha": { "id": 15, "codigo": 42, "tipoSenha": false },
      "aluno": { "id": 9, "nome": "Mariane Trindade" },
      "matricula": {
        "curso": "Desenvolvimento de Sistemas",
        "periodo": "manha",
        "anoEscolar": 1
      },
      "documentos": ["RG_CIN", "FOTO"],
      "registradaEm": "2026-09-21T14:15:00Z"
    }
  ],
  "total": 1
}
```

#### `POST /filas/pendencias/:senhaId/retomadas`

Retoma uma senha pendente para continuidade do atendimento.

- **Corpo:** `{ "etapa": "triagem" }`
- **Regra Transacional:**
  1. Validar que o voluntário não possui outra senha ativa (se possuir, responder `409 ATENDIMENTO_ATIVO_EXISTENTE`).
  2. Validar que a senha está `status: pendente` e `etapa: triagem`.
  3. Atualizar `Senha`: `status = 'em_atendimento'`.
  4. Criar NOVO `HistoricoSenha` vinculado ao voluntário e guichê com `dataHoraChamada = agora`.
- **Resposta `200 OK`:**

```json
{
  "senha": {
    "id": 15,
    "codigo": 42,
    "etapaAtual": "triagem",
    "status": "em_atendimento",
    "tipoSenha": false
  },
  "historico": {
    "id": 99,
    "chamadaEm": "2026-09-21T14:30:00Z",
    "iniciadaEm": null
  },
  "documentos": ["RG_CIN", "FOTO"]
}
```

---

## 6. Regras de Atomicidade e Transações Obrigatórias

As operações abaixo **devem** ser executadas dentro de `prisma.$transaction`:

1. **Chamada de Senha (`POST /filas/chamadas`):** Garantir que duas requisições concorrentes não reservem a mesma senha.
2. **Retomada de Pendência (`POST /filas/pendencias/:id/retomadas`):** Impedir que dois voluntários retomem a mesma pendência simultaneamente.
3. **Salvar Pendência (`POST /atendimentos/:id/pendencias`):** Atualizar status da senha para `pendente`, gravar JSON de pendência e fechar histórico simultaneamente.
4. **Finalizar Triagem (`POST /atendimentos/:id/finalizar`):** Encaminhar senha para `apm` em status `aguardando`, limpar JSON de pendência e fechar histórico simultaneamente.
5. **Vincular Aluno (`PUT /senhas/:id/aluno`):** Atualizar `Aluno`, `CursoAluno` e `Senha.codAluno` na mesma transação.

---

## 7. Códigos de Erro Padronizados

| HTTP | Código                        | Descrição                                                        |
| ---- | ----------------------------- | ---------------------------------------------------------------- |
| 400  | `DADOS_INVALIDOS`             | Corpo ou parâmetros da requisição ausentes ou mal formatados     |
| 401  | `NAO_AUTENTICADO`             | Token JWT ausente, inválido ou expirado                          |
| 403  | `ACESSO_NEGADO`               | Usuário sem permissão para operar no posto de Triagem            |
| 404  | `SENHA_NAO_ENCONTRADA`        | Identificador da senha não existe                                |
| 404  | `ALUNO_NAO_ENCONTRADO`        | Aluno não localizado pelo ID                                     |
| 404  | `ATENDIMENTO_NAO_ENCONTRADO`  | Histórico do atendimento não encontrado                          |
| 409  | `SENHA_INDISPONIVEL`          | Senha já chamada por outro guichê ou fora da fila                |
| 409  | `ATENDIMENTO_ATIVO_EXISTENTE` | Atendente já possui uma senha em atendimento                     |
| 409  | `PENDENCIA_INDISPONIVEL`      | Senha pendente já retomada por outro atendente                   |
| 409  | `DOCUMENTOS_PENDENTES`        | Tentativa de finalizar atendimento contendo documentos pendentes |
| 422  | `DOCUMENTO_INVALIDO`          | Chave de documento fora das 5 permitidas                         |
| 422  | `CURSO_PERIODO_INVALIDO`      | Combinação de curso e período inexistente                        |
