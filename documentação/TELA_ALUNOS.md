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
* **Finalidade:** Cadastrar candidatos com situação `CANDIDATO` e matrícula `PENDENTE` em transação atômica (`prisma.$transaction`), vinculando-os diretamente ao `cursoId` resolvido no frontend.

### Contrato de Entrada (Payload enviado pelo Frontend):
```json
{
  "anoProcesso": 2026,
  "semestreProcesso": 2,
  "candidatos": [
    {
      "nome": "Ana Beatriz Silva",
      "escolaridadePublica": true,
      "cidade": "São José do Rio Preto",
      "sexo": "Feminino",
      "classificacao": 1,
      "periodo": "noite",
      "cursoId": 1
    }
  ]
}
```

---

## 5. Passo a Passo da Transação no Back-end (`prisma.$transaction`)

Ao receber `POST /admin/alunos/importar`, o `AlunoService` executa em transação atômica:

```text
[ Recebe Payload ]
       │
       ▼
1. Validações Prévias (Zod)
   ├── Validar anoProcesso (inteiro positivo) e semestreProcesso (1 ou 2)
   ├── Validar array candidatos não vazio
   └── Validar campos individuais (nome, período enum, cursoId positivo)
       │
       ▼
2. Consulta e Filtro de Duplicidades (Model: Aluno)
   ├── Buscar candidatos já existentes para o mesmo ano/semestre com nome correspondente
   ├── Normalizar nomes via formatarNome() e Set em letras maiúsculas
   └── Ignorar registros duplicados no arquivo ou já existentes no banco (incrementa duplicados)
       │
       ▼
3. Inserção em Lote de Alunos (tx.aluno.createManyAndReturn)
   └── Cadastra novos alunos com statusAluno = 'CANDIDATO' e retorna idAluno gerado
       │
       ▼
4. Inserção em Lote de Matrículas (tx.cursoAluno.createMany)
   └── Cria os vínculos em CursoAluno com statusMatricula = 'PENDENTE', periodo e classificacao
```

---

## 6. Contrato de Resposta (HTTP 201)

```json
{
  "importados": 45,
  "duplicados": 2
}
```

---

## 7. Demais Endpoints de Alunos

### 7.1. Listar Cidades Cadastradas (`GET /admin/alunos/cidades`)
* **Resposta (HTTP 200):** Retorna lista distinta de cidades para popular filtros rápidos.

### 7.2. Consulta por ID (`GET /admin/alunos/:id`)
* **Resposta (HTTP 200):** Retorna o objeto completo do aluno e seus vínculos com cursos (`cursosAluno`).

### 7.3. Edição de Aluno (`PATCH /admin/alunos/:id`)
* **Body:** `{ "nome": "Novo Nome", "status": "ATIVO" }` (ao menos um dos campos).
* **Resposta (HTTP 200):** Retorna o registro atualizado.

### 7.4. Vínculo de Matrícula (`POST /admin/alunos/:id/matriculas`)
* **Body:** `{ "cursoId": 2 }`
* **Resposta (HTTP 201):** Retorna os dados da matrícula criada.

---

## 8. Matriz de Erros e Validações (`POST /admin/alunos/importar`)

| Cenário | Status HTTP | Código / Mensagem |
| :--- | :---: | :--- |
| Lista de candidatos vazia | `400 Bad Request` | `A lista de candidatos não pode estar vazia.` |
| Semestre fora de 1 ou 2 | `400 Bad Request` | `O semestre deve ser 1 ou 2.` |
| Período inválido | `400 Bad Request` | `Informe um período válido.` |
| ID de curso inválido | `400 Bad Request` | `O ID deve ser maior que zero.` |
| Erro interno de transação | `500 Internal Server Error` | Erro centralizado tratado pelo middleware global. |
