# Rotas da API de Usuários

Documentação técnica dos endpoints do módulo de usuários do sistema SIGA Phila.

---

## 1. Autenticação e Permissões Globais

Todas as rotas exigem autenticação ativa e controle de acesso por papel:
- **Autenticação**: `accessValidator` (validação do token JWT via cookie `accessToken`).
- **Permissão**: `validarRole(["admin", "supervisor"])`.

---

## 2. Endpoints

### 2.1. Listar Usuários
Recupera a lista de usuários com suporte a filtros de busca, cargo e situação.

- **Método**: `GET`
- **Rota**: `/usuarios`
- **Query Parameters**:
  - `busca` (string, opcional): busca textual no nome do usuário (*case-insensitive*).
  - `tipo` (string enum, opcional): `admin`, `supervisor`, `atendente`.
  - `status` (boolean | string, opcional): `true`, `false`, `"ativo"` ou `"inativo"`. Se omitido, retorna todos.
  - `id` (integer, opcional): busca direta pelo ID do usuário.
- **Resposta de Sucesso (HTTP 200)**:
  ```json
  {
    "usuarios": [
      {
        "id": 1,
        "nome": "Carlos Silva",
        "tipo": "admin",
        "status": true
      },
      {
        "id": 2,
        "nome": "Amanda Souza",
        "tipo": "atendente",
        "status": true
      }
    ],
    "total": 2
  }
  ```

---

### 2.2. Criar Usuário
Cadastra um novo usuário no sistema.

- **Método**: `POST`
- **Rota**: `/usuarios`
- **Request Body**:
  ```json
  {
    "nome": "Lucas Martins",
    "tipo": "atendente",
    "senha": "senhaSegura123",
    "status": true
  }
  ```
- **Validações (Schema)**:
  - `nome` (string, obrigatório): 1 a 100 caracteres.
  - `tipo` (string enum, opcional): `admin`, `supervisor` ou `atendente` (padrão: `atendente`).
  - `senha` (string, opcional): mínimo 8 caracteres, máximo 50 caracteres.
  - `status` (boolean, opcional): padrão `true`.
- **Regras de Negócio**:
  - A senha é criptografada com `bcrypt` (fator de custo 12) antes da persistência.
- **Resposta de Sucesso (HTTP 201)**:
  ```json
  {
    "usuario": {
      "id": 3,
      "nome": "Lucas Martins",
      "tipo": "atendente",
      "status": true
    }
  }
  ```

---

### 2.3. Atualizar Usuário
Atualiza parcialmente os dados cadastrais ou a situação de um usuário existente.

- **Método**: `PATCH`
- **Rota**: `/usuarios/:id`
- **Parâmetros da Rota**:
  - `id` (integer, obrigatório): ID do usuário a ser atualizado.
- **Request Body (Campos Parciais / Opcionais)**:
  ```json
  {
    "nome": "Lucas M. Santos",
    "tipo": "supervisor",
    "senha": "novaSenhaSegura123",
    "status": false
  }
  ```
- **Validações e Regras de Negócio**:
  - O usuário alvo é verificado no banco. Caso não exista, retorna erro `404 Usuário não encontrado`.
  - `senha`: se informada, deve ter no mínimo 8 caracteres e será recriptografada com `bcrypt`. Se omitida, a senha existente é preservada.
  - `status`: permite ativar (`true`) ou desativar (`false`) o acesso do usuário.
- **Resposta de Sucesso (HTTP 200)**:
  ```json
  {
    "usuario": {
      "id": 3,
      "nome": "Lucas M. Santos",
      "tipo": "supervisor",
      "status": false
    }
  }
  ```

---

### 2.4. Excluir Usuário
Exclui permanentemente um usuário desativado e todos os seus registros associados (em cascata).

- **Método**: `DELETE`
- **Rota**: `/usuarios/:id`
- **Permissão Específica**: `validarRole(["admin"])` (exclusivo para administradores).
- **Parâmetros da Rota**:
  - `id` (integer, obrigatório): ID do usuário a ser excluído.
- **Validações e Regras de Negócio**:
  - O usuário alvo é verificado no banco. Caso não exista, retorna erro `404 Usuário não encontrado`.
  - Usuários ativos não podem ser excluídos (retorna erro `400 Apenas usuários desativados podem ser excluídos`).
  - Deleção em transação atômica de todos os dados associados (`compras`, `itensCompra`, `pagamentos`, `contribuicoes` e `historicos`).
- **Resposta de Sucesso (HTTP 200)**:
  ```json
  {
    "usuario": {
      "id": 3,
      "nome": "Lucas M. Santos",
      "tipo": "supervisor",
      "status": false
    }
  }
  ```

