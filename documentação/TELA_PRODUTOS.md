# Rotas da API de Produtos

Documentação técnica dos endpoints do módulo de produtos (uniformes e armários) do sistema SIGA Phila.

---

## 1. Autenticação e Permissões Globais

Todas as rotas exigem autenticação ativa:
- **Autenticação**: `accessValidator` (validação do token JWT via cookie `accessToken`).
- **Permissão de Consulta (`GET /produtos`)**: usuários autenticados (`admin`, `supervisor`, `atendente`).
- **Permissão de Gestão (`POST`, `PATCH`)**: `validarRole(["admin", "supervisor"])`.
- **Permissão de Exclusão (`DELETE`)**: `validarRole(["admin"])`.

---

## 2. Endpoints

### 2.1. Listar Produtos
Recupera a lista de produtos (uniformes escolares e armários) com suporte a busca textual e filtros de tipo e status.

- **Método**: `GET`
- **Rota**: `/produtos`
- **Query Parameters**:
  - `busca` (string, opcional): busca textual no nome do produto (*case-insensitive*).
  - `tipo` (string enum, opcional): `uniforme` ou `armario`.
  - `status` (boolean | string, opcional): `true`, `false`, `"ativo"` ou `"inativo"`. Se omitido, retorna todos.
- **Resposta de Sucesso (HTTP 200)**:
  ```json
  {
    "produtos": [
      {
        "id": 1,
        "nome": "CAMISETA P",
        "preco": 35,
        "quantidade": 15,
        "tipo": "uniforme",
        "status": true
      },
      {
        "id": 10,
        "nome": "Armário Individual",
        "preco": 50,
        "quantidade": 100,
        "tipo": "armario",
        "status": true
      }
    ],
    "total": 2
  }
  ```

---

### 2.2. Cadastrar Produto
Cadastra um novo tamanho de uniforme escolar ou inicializa a entidade única de armários.

- **Método**: `POST`
- **Rota**: `/produtos`
- **Request Body (Uniforme)**:
  ```json
  {
    "nome": "Camiseta G",
    "preco": 35,
    "quantidade": 10,
    "tipo": "uniforme",
    "status": true
  }
  ```
- **Request Body (Armário)**:
  ```json
  {
    "nome": "Armário",
    "preco": 50,
    "quantidade": 100,
    "tipo": "armario",
    "status": true
  }
  ```
- **Validações (Schema)**:
  - `nome` (string, obrigatório): 1 a 50 caracteres.
  - `preco` (number positivo, obrigatório): valor unitário maior que zero.
  - `quantidade` (integer não-negativo, obrigatório): quantidade inicial maior ou igual a zero.
  - `tipo` (string enum, obrigatório): `uniforme` ou `armario`.
  - `status` (boolean, opcional): padrão `true`.
- **Regras de Negócio**:
  - Para `uniforme`: o nome é normalizado em caixa alta. Impede cadastro duplicado com mesmo nome (erro `409 Este uniforme já está cadastrado`).
  - Para `armario`: o nome é fixado automaticamente como `"Armário Individual"`. Impede cadastro duplicado (erro `409 O armário já está configurado`).
- **Resposta de Sucesso (HTTP 201)**:
  ```json
  {
    "produto": {
      "id": 3,
      "nome": "CAMISETA G",
      "preco": 35,
      "quantidade": 10,
      "tipo": "uniforme",
      "status": true
    }
  }
  ```

---

### 2.3. Atualizar Produto
Atualiza informações cadastrais ou a situação (`status`) de um uniforme ou armário existente.

- **Método**: `PATCH`
- **Rota**: `/produtos/:produtoId`
- **Parâmetros da Rota**:
  - `produtoId` (integer, obrigatório): ID do produto a ser atualizado.
- **Request Body (Campos Parciais / Opcionais)**:
  ```json
  {
    "nome": "Camiseta GG",
    "preco": 40,
    "quantidade": 120,
    "status": false
  }
  ```
- **Validações e Regras de Negócio**:
  - O produto alvo é verificado no banco. Caso não exista, retorna erro `404 Produto não encontrado`.
  - Para `uniforme`:
    - O campo `quantidade` não pode ser alterado por esta rota (retorna erro `400 A quantidade do uniforme deve ser alterada pelo estoque`).
    - Se o `nome` for informado, valida contra duplicidade (erro `409 Este uniforme já está cadastrado`).
  - Para `armario`:
    - O campo `nome` não pode ser alterado (retorna erro `400 Não é possível alterar o nome do armário`).
    - Permite alterar `preco` e `quantidade` (capacidade total).
  - O campo `status` permite ativar (`true`) ou inativar/arquivar (`false`) o produto.
- **Resposta de Sucesso (HTTP 200)**:
  ```json
  {
    "produto": {
      "id": 3,
      "nome": "CAMISETA GG",
      "preco": 40,
      "quantidade": 10,
      "tipo": "uniforme",
      "status": false
    }
  }
  ```

---

### 2.4. Movimentar Estoque de Uniforme
Registra entradas, saídas manuais ou ajustes de inventário no saldo físico de um uniforme em transação atômica.

- **Método**: `PATCH`
- **Rota**: `/produtos/:produtoId/estoque`
- **Parâmetros da Rota**:
  - `produtoId` (integer, obrigatório): ID do uniforme.
- **Request Body**:
  ```json
  {
    "operacao": "adicionar",
    "quantidade": 15
  }
  ```
- **Validações (Schema)**:
  - `operacao` (string enum, obrigatório): `"adicionar"`, `"diminuir"` ou `"corrigir"`.
  - `quantidade` (integer não-negativo, obrigatório): quantidade a ser movimentada ou novo saldo absoluto.
- **Regras de Negócio**:
  - Operação exclusiva para produtos do tipo `uniforme`.
  - Tipos de operação:
    - `"adicionar"`: soma a quantidade informada ao estoque atual.
    - `"diminuir"`: subtrai a quantidade informada. Se o saldo resultante for negativo, a operação é abortada com erro `409 ESTOQUE_INSUFICIENTE`.
    - `"corrigir"`: sobrescreve o saldo com o valor informado (balanço físico).
  - Executado dentro de transação atômica no banco de dados (`prisma.$transaction`).
- **Resposta de Sucesso (HTTP 200)**:
  ```json
  {
    "produto": {
      "id": 3,
      "nome": "CAMISETA GG",
      "preco": 40,
      "quantidade": 25,
      "tipo": "uniforme",
      "status": true
    }
  }
  ```

---

### 2.5. Excluir Produto
Exclui permanentemente um produto desativado/arquivado e seus registros associados.

- **Método**: `DELETE`
- **Rota**: `/produtos/:produtoId`
- **Permissão Específica**: `validarRole(["admin"])`.
- **Parâmetros da Rota**:
  - `produtoId` (integer, obrigatório): ID do produto a ser excluído.
- **Validações e Regras de Negócio**:
  - O produto alvo é verificado no banco. Caso não exista, retorna erro `404 Produto não encontrado`.
  - Produtos ativos não podem ser excluídos (retorna erro `400 Apenas produtos desativados ou arquivados podem ser excluídos`).
  - Deleção em transação atômica de todos os itens de compra associados (`itemCompra`).
- **Resposta de Sucesso (HTTP 200)**:
  ```json
  {
    "produto": {
      "id": 3,
      "nome": "CAMISETA GG",
      "preco": 40,
      "quantidade": 25,
      "tipo": "uniforme",
      "status": false
    }
  }
  ```
