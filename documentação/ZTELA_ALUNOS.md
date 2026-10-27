# Rotas da API de Alunos

Documentação técnica dos endpoints do módulo de alunos e importação do sistema SIGA Phila.

---

## 1. Autenticação e Permissões Globais

Todas as rotas exigem autenticação ativa:
- **Autenticação**: `accessValidator` (validação do token JWT via cookie `accessToken`).
- **Permissão de Consulta (`GET /alunos`, `GET /alunos/cidades`)**: usuários autenticados (`admin`, `supervisor`, `atendente`).
- **Permissão de Gestão (`PATCH`, `POST /importar`)**: `validarRole(["admin", "supervisor"])`.

---

## 2. Endpoints

### 2.1. Listar Alunos
Recupera a lista paginada de alunos e candidatos com suporte a busca textual, filtros de curso, cidade e situação.

- **Método**: `GET`
- **Rota**: `/alunos`
- **Query Parameters**:
  - `nome` (string, opcional): busca textual no nome do aluno (*case-insensitive*).
  - `cursoId` (integer, opcional): filtra pelo ID do curso associado.
  - `cidade` (string, opcional): filtra pela cidade cadastrada.
  - `status` (string enum, opcional): `"ATIVO"`, `"CANDIDATO"` ou `"ARQUIVADO"`.
  - `pagina` (integer, opcional): número da página atual (padrão: `1`).
  - `limite` (integer, opcional): quantidade de registros por página (padrão: `10`).
- **Resposta de Sucesso (HTTP 200)**:
  ```json
  {
    "alunos": [
      {
        "id": 1,
        "nome": "Ana Beatriz Silva",
        "status": "ATIVO",
        "cidade": "São José do Rio Preto",
        "sexo": "Feminino",
        "escolaridadePublica": true,
        "cursoId": 1,
        "curso": "Desenvolvimento de Sistemas",
        "periodo": "noite",
        "classificacao": 1,
        "statusMatricula": "ATIVA"
      }
    ],
    "total": 1,
    "pagina": 1,
    "limite": 10
  }
  ```

---

### 2.2. Listar Cidades
Recupera a lista de cidades únicas cadastradas para os alunos, utilizada para alimentar os filtros da interface.

- **Método**: `GET`
- **Rota**: `/alunos/cidades`
- **Resposta de Sucesso (HTTP 200)**:
  ```json
  {
    "cidades": [
      "Mirassol",
      "São José do Rio Preto"
    ]
  }
  ```

---

### 2.3. Atualizar Aluno
Atualiza parcialmente os dados do aluno (nome ou situação cadastral).

- **Método**: `PATCH`
- **Rota**: `/alunos/:id`
- **Parâmetros da Rota**:
  - `id` (integer, obrigatório): ID do aluno a ser atualizado.
- **Request Body (Campos Parciais / Opcionais)**:
  ```json
  {
    "nome": "Ana Beatriz Silva Santos",
    "status": "ARQUIVADO"
  }
  ```
- **Validações e Regras de Negócio**:
  - O aluno alvo é verificado no banco. Caso não exista, retorna erro `404 Aluno não encontrado`.
  - `status`: valores aceitos: `"ATIVO"`, `"CANDIDATO"` ou `"ARQUIVADO"`.
  - Não há exclusão física de alunos para preservar o histórico financeiro e de atendimentos; alterações de acesso/matrícula utilizam arquivamento.
- **Resposta de Sucesso (HTTP 200)**:
  ```json
  {
    "aluno": {
      "id": 1,
      "nome": "Ana Beatriz Silva Santos",
      "status": "ARQUIVADO",
      "cidade": "São José do Rio Preto",
      "sexo": "Feminino",
      "escolaridadePublica": true,
      "cursoId": 1,
      "curso": "Desenvolvimento de Sistemas",
      "periodo": "noite",
      "classificacao": 1,
      "statusMatricula": "ATIVA"
    }
  }
  ```

---

### 2.4. Importar Alunos (Vestibulinho)
Cadastra em lote candidatos a partir de arquivo de classificação processado, associando-os aos seus respectivos cursos em transação atômica.

- **Método**: `POST`
- **Rota**: `/alunos/importar`
- **Request Body**:
  ```json
  {
    "anoProcesso": 2026,
    "semestreProcesso": 2,
    "candidatos": [
      {
        "nome": "Lucas Martins Costa",
        "escolaridadePublica": true,
        "cidade": "São José do Rio Preto",
        "sexo": "Masculino",
        "classificacao": 1,
        "periodo": "noite",
        "cursoId": 1
      }
    ]
  }
  ```
- **Validações (Schema)**:
  - `anoProcesso` (integer positivo, obrigatório).
  - `semestreProcesso` (integer `1` ou `2`, obrigatório).
  - `candidatos` (array, obrigatório, mínimo 1 item):
    - `nome` (string, 1 a 100 caracteres).
    - `escolaridadePublica` (boolean, opcional, padrão `false`).
    - `cidade` (string, opcional).
    - `sexo` (string, opcional).
    - `classificacao` (integer positivo, opcional).
    - `periodo` (enum, opcional): `"manha"`, `"tarde"`, `"noite"`, `"integral"` ou `"online"`.
    - `cursoId` (integer positivo, obrigatório).
- **Regras de Negócio**:
  - Executado dentro de transação atômica (`prisma.$transaction`).
  - Candidatos já cadastrados no mesmo ano/semestre com o mesmo nome são identificados como duplicados e ignorados.
  - Novos candidatos recebem automaticamente `statusAluno = 'CANDIDATO'` e vínculo `CursoAluno` com `statusMatricula = 'PENDENTE'`.
- **Resposta de Sucesso (HTTP 201)**:
  ```json
  {
    "importados": 45,
    "duplicados": 2
  }
  ```
