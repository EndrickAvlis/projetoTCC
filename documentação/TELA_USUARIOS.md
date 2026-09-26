# Tela de Usuários

## 1. Objetivo

A tela administrativa de Usuários gerencia os voluntários do sistema SIGA Phila, permitindo cadastrar novos usuários, listar registros existentes, atualizar suas informações (nome, perfil e senha) e alternar sua situação entre ativo e inativo.

Rota da tela:
```text
/admin/usuarios
```

---

## 2. Acesso e Regras de Permissão

A tela é acessível exclusivamente por voluntários com perfil `admin` ou `supervisor`. O perfil `atendente` não possui acesso a esta rota (retorna 403 / Redirecionamento).

### Regra de visualização e ação por perfil:

1. **Administrador (`admin`)**:
   - Visualiza todos os usuários cadastrados (`admin`, `supervisor` e `atendente`).
   - Pode cadastrar novos usuários em qualquer um dos perfis.
   - Pode editar qualquer usuário (nome, perfil, senha).
   - Pode ativar ou desativar qualquer usuário (exceto a si próprio).

2. **Supervisor (`supervisor`)**:
   - Visualiza **apenas** usuários do perfil `atendente`.
   - Pode cadastrar **apenas** novos usuários do perfil `atendente`.
   - Pode editar e alterar a situação **apenas** de atendentes.
   - Não pode promover nenhum usuário para `supervisor` ou `admin`.
   - Tentativas de acessar, criar ou alterar administradores ou outros supervisores devem ser bloqueadas no backend com erro `403 Acesso Negado`.

> **Nota de Segurança**: A validação das permissões é processada obrigatoriamente no backend com base no cookie de sessão autenticado (`req.usuario.tipo`), nunca confiando em dados de papel ou permissão enviados pelo cliente.

---

## 3. Interface da Tela

A tela deve conter:

- **Cabeçalho**: título da página ("Usuários"), descrição e botão primário **+ Adicionar usuário**.
- **Barra de filtros e pesquisa**:
  - Campo de pesquisa por nome com *debounce* de 300ms.
  - Filtro por situação: **Todos**, **Ativos** e **Inativos** (botões em formato de alternância/toggle).
  - (Opcional para Admin) Filtro rápido por perfil (`admin`, `supervisor`, `atendente`).
- **Tabela de dados (`DataTable`)**:
  - Nome do usuário;
  - Perfil / Tipo (com badge estilizado);
  - Situação (com badge visual: verde para ativo, cinza/vermelho para inativo);
  - Ações (botões de Editar e Ativar/Desativar).
- **Feedback**:
  - Mensagem de carregamento (*loading state*);
  - Mensagem de lista vazia contextualizada ao filtro selecionado;
  - Alerta de erro caso a comunicação com a API falhe.

---

## 4. Modais e Formulários

### 4.1. Modal de Cadastro ("Adicionar Usuário")

Campos:
- **Nome**: texto obrigatório, mínimo 1 caractere, máximo 100 caracteres.
- **Perfil / Tipo**: seleção entre `admin`, `supervisor`, `atendente`.
  - Se o usuário autenticado for `supervisor`, o campo fica fixo em `atendente` sem opções de alteração.
- **Senha**: texto obrigatório, mínimo 8 caracteres, máximo 50 caracteres.
- **Confirmação de Senha**: validação no cliente para garantir igualdade.
- Situação inicial padrão: `ativo = true`.

### 4.2. Modal de Edição ("Editar Usuário")

Campos:
- **Nome**: texto obrigatório.
- **Perfil / Tipo**: seleção de perfil.
  - Se o usuário autenticado for `supervisor`, o perfil permanece fixo em `atendente`.
- **Nova Senha** (opcional): se informada, deve ter no mínimo 8 caracteres. Se deixada em branco, a senha anterior deve ser preservada inalterada.
- **Confirmação de Nova Senha** (opcional): obrigatória apenas caso uma nova senha tenha sido digitada.

### 4.3. Confirmação de Alternância de Situação (Ativar / Desativar)

- Ao clicar no botão de desativar, um modal de confirmação deve ser exibido alertando que o usuário desativado não conseguirá mais efetuar login no sistema.
- Ao clicar em ativar, o usuário volta a ter acesso ao sistema imediatamente.
- Regra de proteção: O usuário conectado na sessão atual **não pode desativar a sua própria conta**.

---

## 5. Padronização de Dados (Frontend e Backend)

Para manter a consistência e eliminar complexidade, as entidades trafegam com nomes limpos e padronizados:

```json
{
  "id": 1,
  "nome": "Carlos Oliveira",
  "tipo": "atendente",
  "ativo": true
}
```

### Mudança no Campo de Situação:
Em vez de strings (`"ATIVO"`, `"INATIVO"`), a situação é padronizada como **booleano**:
- `ativo: true` (usuário ativo)
- `ativo: false` (usuário inativo/desativado)

---

## 6. Alterações no Banco de Dados (Prisma Schema)

No modelo `Voluntario`, o campo textual de status deve ser substituído por booleano com valor padrão `true`:

```prisma
enum TipoVoluntario {
  admin
  supervisor
  atendente
}

model Voluntario {
  idVoluntario     Int            @id @default(autoincrement())
  nomeVoluntario   String         @db.VarChar(100)
  senhaVoluntario  String         @db.VarChar(255)
  tipoVoluntario   TipoVoluntario @default(atendente)
  ativo            Boolean        @default(true)

  compras          Compra[]
  historicos       HistoricoSenha[]
}
```

---

## 7. Especificação Técnica dos Endpoints (Backend)

Todos os endpoints exigem autenticação prévia via middleware `accessValidator` e verificação de perfil `validarRole(["admin", "supervisor"])`.

### 7.1. Listar Usuários
- **Método**: `GET`
- **Rota**: `/voluntarios`
- **Query Parameters**:
  - `nome` (string, opcional): busca parcial sem distinção entre maiúsculas e minúsculas (*case-insensitive*).
  - `tipo` (string enum, opcional): `admin`, `supervisor`, `atendente`.
  - `ativo` (boolean, opcional): `true` ou `false`. Se omitido, retorna todos.
- **Regras do Controller/Service**:
  - Se `req.usuario.tipo === "supervisor"`: força `where.tipoVoluntario = "atendente"`.
  - Ordenar alfabeticamente por nome.
- **Resposta de Sucesso (HTTP 200)**:
  ```json
  {
    "usuarios": [
      {
        "id": 1,
        "nome": "Amanda Souza",
        "tipo": "atendente",
        "ativo": true
      }
    ]
  }
  ```

---

### 7.2. Cadastrar Usuário
- **Método**: `POST`
- **Rota**: `/voluntarios`
- **Request Body**:
  ```json
  {
    "nome": "Lucas Martins",
    "tipo": "atendente",
    "senha": "senhaSegura123",
    "ativo": true
  }
  ```
- **Validações**:
  - `nome`: obrigatório, 1 a 100 caracteres.
  - `tipo`: enum obrigatório. Se `req.usuario.tipo === "supervisor"` e `tipo !== "atendente"`, retornar `403 Acesso Negado`.
  - `senha`: obrigatória, mínimo 8 caracteres, máximo 50 caracteres.
  - `ativo`: booleano, padrão `true`.
- **Regras do Service**:
  - Gerar o hash da senha utilizando `bcrypt.hash(senha, 12)`.
  - Persistir no banco de dados.
- **Resposta de Sucesso (HTTP 201)**:
  ```json
  {
    "usuario": {
      "id": 2,
      "nome": "Lucas Martins",
      "tipo": "atendente",
      "ativo": true
    }
  }
  ```

---

### 7.3. Atualizar Dados do Usuário
- **Método**: `PATCH`
- **Rota**: `/voluntarios/:id`
- **Parâmetros da Rota**:
  - `id`: número inteiro positivo.
- **Request Body (Campos Parciais)**:
  ```json
  {
    "nome": "Lucas M. Santos",
    "tipo": "atendente",
    "senha": "novaSenhaOpcional123",
    "ativo": false
  }
  ```
- **Regras do Service**:
  - Buscar o usuário alvo pelo `id`. Se não encontrado, retornar `404 Usuário não encontrado`.
  - Se `req.usuario.tipo === "supervisor"`:
    - O usuário alvo **deve** ser do tipo `atendente`. Caso contrário, retornar `403`.
    - O campo `tipo` do body, se enviado, não pode ser alterado para valor diferente de `atendente`.
  - Se o campo `senha` for fornecido e não vazio, aplicar `bcrypt.hash(senha, 12)`. Caso o campo não seja fornecido, manter a senha existente.
  - Se o campo `ativo` for alterado para `false`, validar se o usuário não está tentando desativar o próprio ID logado (`req.usuario.id !== id`).
- **Resposta de Sucesso (HTTP 200)**:
  ```json
  {
    "usuario": {
      "id": 2,
      "nome": "Lucas M. Santos",
      "tipo": "atendente",
      "ativo": false
    }
  }
  ```

---

## 8. Critérios de Aceite e Conclusão

- Administradores conseguem listar todos os voluntários e filtrar por nome, tipo e situação.
- Supervisores visualizam exclusivamente voluntários do tipo atendente.
- Supervisores não conseguem criar, editar ou desativar administradores ou outros supervisores (nem pela interface, nem diretamente pela API).
- O campo de senha é criptografado com bcrypt antes de ser armazenado.
- Na edição, a senha só é alterada caso seja explicitamente preenchida.
- A situação é controlada via booleano `ativo`.
- O usuário não pode desativar a si mesmo.
- O campo de pesquisa na tabela responde com debounce suave sem disparar requisições a cada tecla.
