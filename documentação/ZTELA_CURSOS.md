# Rotas da API de Cursos

Documentação técnica dos endpoints do módulo de cursos e períodos do sistema SIGA Phila.

---

## 1. Autenticação e Permissões Globais

Todas as rotas exigem autenticação ativa:
- **Autenticação**: `accessValidator` (validação do token JWT via cookie `accessToken`).
- **Permissão de Consulta (`GET /cursos`)**: usuários autenticados (`admin`, `supervisor`, `atendente`).
- **Permissão de Gestão (`POST`, `PATCH`)**: `validarRole(["admin", "supervisor"])`.
- **Permissão de Exclusão (`DELETE`)**: `validarRole(["admin"])`.

---

## 2. Endpoints

### 2.1. Listar Cursos
Recupera a lista de cursos e seus períodos com suporte a busca textual e filtro de situação.

- **Método**: `GET`
- **Rota**: `/cursos`
- **Query Parameters**:
  - `busca` (string, opcional): busca textual no nome do curso (*case-insensitive*).
  - `arquivado` (boolean | string, opcional): `true` ou `false`. Se omitido, retorna `false` (apenas cursos ativos).
- **Resposta de Sucesso (HTTP 200)**:
  ```json
  {
    "cursos": [
      {
        "id": 1,
        "nome": "Técnico em Desenvolvimento de Sistemas",
        "arquivado": false,
        "periodos": [
          {
            "id": 1,
            "periodo": "manha",
            "vagasTotais": 40,
            "matriculaAtiva": true
          },
          {
            "id": 2,
            "periodo": "noite",
            "vagasTotais": 35,
            "matriculaAtiva": true
          }
        ]
      }
    ],
    "total": 1
  }
  ```

---

### 2.2. Criar Curso
Cadastra um novo curso exigindo obrigatoriamente nome e ao menos um período configurado.

- **Método**: `POST`
- **Rota**: `/cursos`
- **Request Body**:
  ```json
  {
    "nome": "Técnico em Administração",
    "periodos": [
      {
        "periodo": "manha",
        "vagasTotais": 40,
        "matriculaAtiva": true
      }
    ]
  }
  ```
- **Validações (Schema)**:
  - `nome` (string, obrigatório): 1 a 100 caracteres.
  - `periodos` (array, obrigatório): mínimo de 1 período. Cada período deve conter:
    - `periodo` (enum, obrigatório): `"manha"`, `"tarde"`, `"noite"`, `"integral"` ou `"online"`.
    - `vagasTotais` (integer não-negativo, obrigatório): quantidade de vagas maior ou igual a zero.
    - `matriculaAtiva` (boolean, obrigatório): situação inicial da matrícula.
- **Regras de Negócio**:
  - O nome do curso passa por transformação automática que capitaliza substantivos e mantém preposições em minúsculas (ex: "Técnico em Administração").
  - Impede períodos duplicados no mesmo cadastro de curso.
- **Resposta de Sucesso (HTTP 201)**:
  ```json
  {
    "curso": {
      "id": 2,
      "nome": "Técnico em Administração",
      "arquivado": false,
      "periodos": [
        {
          "id": 3,
          "periodo": "manha",
          "vagasTotais": 40,
          "matriculaAtiva": true
        }
      ]
    }
  }
  ```

---

### 2.3. Atualizar Curso
Atualiza parcialmente os dados cadastrais (nome) ou a situação de arquivamento de um curso existente.

- **Método**: `PATCH`
- **Rota**: `/cursos/:cursoId`
- **Parâmetros da Rota**:
  - `cursoId` (integer, obrigatório): ID do curso a ser atualizado.
- **Request Body (Campos Parciais / Opcionais)**:
  ```json
  {
    "nome": "Técnico em Logística Integrada",
    "arquivado": false
  }
  ```
- **Validações e Regras de Negócio**:
  - O curso alvo é verificado no banco. Caso não exista, retorna erro `404 Curso não encontrado`.
  - Exige ao menos um campo informado (`nome` ou `arquivado`).
  - Se `arquivado: true`, o sistema pausa automaticamente as matrículas de todos os períodos associados a esse curso (`matriculaAtiva = false`) em transação atômica.
- **Resposta de Sucesso (HTTP 200)**:
  ```json
  {
    "curso": {
      "id": 2,
      "nome": "Técnico em Logística Integrada",
      "arquivado": false,
      "periodos": [
        {
          "id": 3,
          "periodo": "manha",
          "vagasTotais": 40,
          "matriculaAtiva": true
        }
      ]
    }
  }
  ```

---

### 2.4. Adicionar Período ao Curso
Adiciona um novo turno/período de oferta a um curso existente.

- **Método**: `POST`
- **Rota**: `/cursos/:cursoId/periodos`
- **Parâmetros da Rota**:
  - `cursoId` (integer, obrigatório): ID do curso.
- **Request Body**:
  ```json
  {
    "periodo": "tarde",
    "vagasTotais": 35,
    "matriculaAtiva": true
  }
  ```
- **Validações e Regras de Negócio**:
  - Não é permitido adicionar períodos a cursos arquivados (retorna erro `409 CURSO_ARQUIVADO`).
  - Impede período duplicado para o mesmo curso (retorna erro `409 PERIODO_DUPLICADO`).
- **Resposta de Sucesso (HTTP 201)**:
  ```json
  {
    "periodo": {
      "id": 4,
      "periodo": "tarde",
      "vagasTotais": 35,
      "matriculaAtiva": true
    }
  }
  ```

---

### 2.5. Atualizar Período do Curso
Atualiza as vagas ou a situação de matrícula de um período específico do curso.

- **Método**: `PATCH`
- **Rota**: `/cursos/:cursoId/periodos/:periodoId`
- **Parâmetros da Rota**:
  - `cursoId` (integer, obrigatório): ID do curso.
  - `periodoId` (integer, obrigatório): ID do período.
- **Request Body**:
  ```json
  {
    "periodo": "tarde",
    "vagasTotais": 45,
    "matriculaAtiva": false
  }
  ```
- **Validações e Regras de Negócio**:
  - Não é permitido alterar períodos de cursos arquivados (retorna erro `409 CURSO_ARQUIVADO`).
  - Caso o período não pertença ao curso informado, retorna erro `404 PERIODO_NAO_ENCONTRADO`.
- **Resposta de Sucesso (HTTP 200)**:
  ```json
  {
    "periodo": {
      "id": 4,
      "periodo": "tarde",
      "vagasTotais": 45,
      "matriculaAtiva": false
    }
  }
  ```

---

### 2.6. Excluir Curso
Exclui permanentemente um curso arquivado e todos os seus registros associados em transação atômica.

- **Método**: `DELETE`
- **Rota**: `/cursos/:cursoId`
- **Permissão Específica**: `validarRole(["admin"])`.
- **Parâmetros da Rota**:
  - `cursoId` (integer, obrigatório): ID do curso a ser excluído.
- **Validações e Regras de Negócio**:
  - O curso alvo é verificado no banco. Caso não exista, retorna erro `404 Curso não encontrado`.
  - Cursos ativos não podem ser excluídos (retorna erro `400 Apenas cursos arquivados podem ser excluídos`).
  - Deleção em cascata atômica via Prisma (`tx.cursoAluno`, `tx.periodoCurso` e `tx.curso`).
- **Resposta de Sucesso (HTTP 200)**:
  ```json
  {
    "curso": {
      "id": 2,
      "nome": "Técnico em Logística Integrada",
      "arquivado": true,
      "periodos": []
    }
  }
  ```
