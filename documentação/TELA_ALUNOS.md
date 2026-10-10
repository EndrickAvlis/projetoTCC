# Especificação Técnica do Back-end — Gestão e Importação de Alunos (`TELA_ALUNOS`)

## 1. Visão Geral do Fluxo

O módulo administrativo de alunos atende a dois propósitos principais:
1. **Importação em Lote:** O frontend processa a lista CSV do Vestibulinho, associa os cursos pendentes e dispara `POST /admin/alunos/importar` para persistir os candidatos e atualizar os códigos dos cursos em transação atômica.
2. **Consulta e Filtros Paginados:** O frontend consome `GET /admin/alunos` enviando parâmetros de busca, curso, situação e paginação (10 itens por página).

---

## 2. Alterações no Banco de Dados (`schema.prisma`)

```prisma
enum StatusAluno {
  CANDIDATO
  ATIVO
  ARQUIVADO
}

enum StatusMatricula {
  PENDENTE
  ATIVA
}

enum Periodo {
  manha
  tarde
  noite
  integral
  online
}

model Aluno {
  idAluno             Int          @id @default(autoincrement())
  nomeAluno           String       @db.VarChar(100)
  escolaridadePublica Boolean      @default(false)
  cidadeAluno         String       @db.VarChar(100)
  sexoAluno           String       @db.VarChar(20)
  statusAluno         StatusAluno  @default(CANDIDATO)
  anoProcesso         Int
  semestreProcesso    Int

  compras     Compra[]
  cursosAluno CursoAluno[]
  senhas      Senha[]
}

model CursoAluno {
  codCurso        Int
  codAluno        Int
  classificacao   Int?
  statusMatricula StatusMatricula @default(PENDENTE)
  periodo         Periodo

  curso Curso @relation(fields: [codCurso], references: [idCurso])
  aluno Aluno @relation(fields: [codAluno], references: [idAluno])

  @@id([codCurso, codAluno])
}

model Curso {
  idCurso   Int     @id @default(autoincrement())
  nomeCurso String  @db.VarChar(100)
  codigoCsv String? @unique @db.VarChar(30)
  arquivado Boolean @default(false)

  periodos    PeriodoCurso[]
  cursosAluno CursoAluno[]
}
```

---

## 3. Listagem de Alunos (`GET /admin/alunos`)

* **Rota:** `GET /admin/alunos`
* **Autenticação:** Obrigatória (`admin`)

### Parâmetros de Query:
| Parâmetro | Tipo | Padrão | Descrição |
| :--- | :---: | :---: | :--- |
| `nome` | String | `""` | Busca textual parcial por nome do aluno |
| `cursoId` | Number | `""` | Filtra por ID do curso |
| `status` | String | `"ATIVO"` | Filtra por `ATIVO`, `CANDIDATO` ou `ARQUIVADO` |
| `pagina` | Number | `1` | Página atual |
| `limite` | Number | `10` | Quantidade de registros por página |

### Contrato de Resposta (HTTP 200):
```json
{
  "total": 45,
  "totalAtivos": 24,
  "pagina": 1,
  "limite": 10,
  "alunos": [
    {
      "idAluno": 1,
      "nomeAluno": "Ana Beatriz Silva",
      "cidadeAluno": "São José do Rio Preto",
      "statusAluno": "ATIVO",
      "cursoAluno": {
        "periodo": "noite",
        "classificacao": 1,
        "statusMatricula": "ATIVA",
        "curso": {
          "idCurso": 1,
          "nomeCurso": "Desenvolvimento de Sistemas"
        }
      }
    }
  ]
}
```

---

## 4. Importação de Lista de Classificação (`POST /admin/alunos/importar`)

* **Rota:** `POST /admin/alunos/importar`
* **Autenticação:** Obrigatória (`admin`)
* **Finalidade:** Atualizar o `codigoCsv` dos cursos associados, cadastrar candidatos com situação `CANDIDATO` e matrícula `PENDENTE` em transação atômica (`prisma.$transaction`).

### Contrato de Entrada (Payload enviado pelo Frontend):
```json
{
  "anoProcesso": 2026,
  "semestreProcesso": 2,
  "mapeamentoCursos": [
    { "codigoCsv": "4124", "idCurso": 1 }
  ],
  "candidatos": [
    {
      "nomeAluno": "Ana Beatriz Silva",
      "escolaridadePublica": true,
      "cidadeAluno": "São José do Rio Preto",
      "sexoAluno": "FEMININO",
      "codigoCursoCsv": "4124",
      "classificacao": 1,
      "periodo": "NOITE"
    }
  ]
}
```

---

## 5. Passo a Passo da Transação no Back-end (`prisma.$transaction`)

Ao receber `POST /admin/alunos/importar`, o `AlunoService` executa em transação única atômica:

```text
[ Recebe Payload ]
       │
       ▼
1. Validações Prévias
   ├── Validar anoProcesso (2000–2100) e semestreProcesso (1 ou 2)
   ├── Validar se todos os idCurso em mapeamentoCursos existem
   └── Validar se todo codigoCursoCsv dos candidatos está mapeado
       │
       ▼
2. Atualização dos Cursos (Model: Curso)
   └── Para cada item em mapeamentoCursos:
         └── Atualizar codigoCsv na tabela Curso
       │
       ▼
3. Consulta de Duplicidades no Banco (Model: Aluno)
   └── Buscar candidatos já existentes para o mesmo processo seletivo:
         WHERE anoProcesso = X AND semestreProcesso = Y AND nomeAluno IN (...)
       │
       ▼
4. Inserção de Alunos e Matrículas (Model: Aluno + CursoAluno)
   └── Para cada candidato no lote:
         ├── Se candidato já existe no banco ou se repete no arquivo:
         │     └── Incrementar duplicados e ignorar
         └── Se válida:
               ├── Inserir Aluno (statusAluno = 'CANDIDATO')
               ├── Inserir CursoAluno (statusMatricula = 'PENDENTE', periodo, classificacao)
               └── Incrementar importados
```

---

## 6. Contrato de Resposta (HTTP 201)

```json
{
  "importados": 45,
  "treineiros": 0,
  "duplicados": 2,
  "invalidos": 0
}
```

---

## 7. Demais Endpoints de Alunos

### 7.1. Consulta por ID (`GET /admin/alunos/:id`)
* **Resposta (HTTP 200):** Retorna o objeto completo do aluno e seu `cursoAluno`.

### 7.2. Alteração de Situação (`PATCH /admin/alunos/:id/status`)
* **Body:** `{ "statusAluno": "ATIVO", "statusMatricula": "ATIVA" }`
* **Resposta (HTTP 200):** Retorna o registro atualizado.

---

## 8. Matriz de Erros e Validações (`POST /admin/alunos/importar`)

| Cenário | Status HTTP | Mensagem de Retorno |
| :--- | :---: | :--- |
| Curso mapeado não existe no banco | `400 Bad Request` | `Curso ID {x} informado no mapeamento não existe.` |
| Código de curso do candidato sem mapeamento | `400 Bad Request` | `Código de curso {x} não possui mapeamento associado.` |
| Ano ou semestre inválidos | `400 Bad Request` | `Ano ou semestre do processo seletivo inválidos.` |
| Falha crítica de banco / transação | `500 Internal Server Error` | `Erro ao importar lista de classificação.` |
