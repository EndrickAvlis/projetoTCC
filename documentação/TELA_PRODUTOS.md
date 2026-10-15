# Tela de Produtos (Gestão APM)

## 1. Objetivo e Escopo

A tela administrativa de Produtos centraliza a gestão dos itens comercializados e gerenciados pela Associação de Pais e Mestres (APM) no SIGA Phila. Nela, os administradores gerenciam o catálogo e estoque de camisetas de uniformes escolares e configuram a disponibilidade e os parâmetros de locação de armários individuais.

Rota da tela:
```text
/admin/produtos
```

---

## 2. Acesso e Regras de Permissão

- **Perfil Administrador (`admin`)**: Acesso total a todas as operações (cadastro de novos tamanhos, alteração de valores, ajustes de estoque, arquivamento e configuração de armários).
- **Perfil Supervisor (`supervisor`) / Atendente (`atendente`)**: Não possuem acesso a este painel administrativo (retorna `403 Acesso Negado`). Apenas operam as vendas e baixas no guichê presencial da APM (`/apm`).

---

## 3. Estrutura da Interface

A interface em [`ProdutosPage.jsx`](file:///c:/Users/endri/Desktop/TCC/frontend/src/features/admin/pages/ProdutosPage.jsx) é dividida em duas abas principais de navegação:

### 3.1. Aba Uniformes (`SecaoUniformes.jsx`)
- **Controles Superiores**:
  - Campo de busca por tamanho / descrição.
  - Alternador de filtro: **Ativos** vs. **Arquivados**.
  - Botão primário **+ Adicionar uniforme** (abre `UniformeModal.jsx`).
- **Tabela de Uniformes (`DataTable`)**:
  - **Tamanho / Descrição**: Identificação do tamanho (ex: "Camiseta P", "Camiseta M").
  - **Preço**: Preço unitário em Reais formatado (`R$ 35,00`).
  - **Estoque**: Quantidade física disponível em tempo real, com alerta visual caso o estoque esteja zerado ou baixo.
  - **Situação**: Badge visual (Ativo / Arquivado).
  - **Ações**:
    - *Movimentar Estoque*: Abre `MovimentarEstoqueModal.jsx`.
    - *Editar*: Permite alterar preço e identificação.
    - *Arquivar / Desarquivar*: Altera a disponibilidade do tamanho sem perda de histórico de vendas.

### 3.2. Aba Armários (`SecaoArmarios.jsx`)
- Card de visão geral do serviço de armários escolares:
  - **Preço Unitário da Locação**: Valor cobrado por semestre letivo.
  - **Armários Disponíveis / Totais**: Capacidade total cadastrada.
  - **Situação da Locação**: Indicador de disponibilidade geral para oferta no guichê da APM (`Disponível` / `Indisponível`).
  - **Botão de Configuração**: Abre `ArmarioModal.jsx` para editar preço e capacidade total.

---

## 4. Modais e Componentes

### 4.1. Modal de Uniforme (`UniformeModal.jsx`)
- Cadastro e edição de camisetas/uniformes.
- Campos: Nome/Tamanho (até 50 caracteres) e Preço unitário (positivo).

### 4.2. Modal de Movimentação de Estoque (`MovimentarEstoqueModal.jsx`)
- Registra alterações físicas no estoque com rastreabilidade da operação:
  - **Adicionar (Entrada)**: Soma unidades ao estoque existente (ex: chegada de novo lote do fornecedor).
  - **Diminuir (Saída Manual)**: Subtrai unidades do estoque (ex: descarte de peça com defeito).
  - **Corrigir (Inventário)**: Sobrescreve a quantidade física diretamente com a contagem real do armazém.

### 4.3. Modal de Armário (`ArmarioModal.jsx`)
- Configuração dos parâmetros globais do armário (tratado arquiteturalmente como um produto especial único do tipo `armario`).
- Campos: Preço semestral de locação e quantidade total autorizada.

---

## 5. Endpoints da API (Backend)

Todos os endpoints operam sob o prefixo `/produtos` e exigem perfil autenticado `admin`:

| Método | Endpoint | Finalidade |
| :--- | :--- | :--- |
| `GET` | `/produtos` | Lista uniformes filtrados por `busca`, `tipo=uniforme` e `arquivado`. |
| `POST` | `/produtos` | Cadastra novo uniforme ou inicializa a entidade de armário. |
| `GET` | `/produtos/armario` | Retorna as configurações vigentes do armário escolar. |
| `PATCH` | `/produtos/:produtoId` | Atualiza dados gerais do produto (nome, preço ou quantidade base). |
| `PATCH` | `/produtos/:produtoId/status` | Altera status (`ativo`/`arquivado` para uniformes; `disponivel`/`indisponivel` para armários). |
| `PATCH` | `/produtos/:produtoId/alterarEstoque` | Executa movimentação de estoque (`adicionar`, `diminuir` ou `corrigir`). |

---

## 6. Regras de Negócio e Diretrizes

1. **Modelo de Armário Único (Sem Cadastro de Portas):**
   - Não existe cadastro individual de cada porta física ou segredo de armário. O armário é gerenciado no banco como um produto especial de controle de saldo e valor.
2. **Proteção de Integridade de Vendas:**
   - Uniformes nunca são deletados via `DELETE` para não quebrar o relacionamento com `ItemCompra` de recibos anteriores. Tamanhos esgotados ou descontinuados recebem status `arquivado`.
3. **Bloqueio de Saldo Negativo:**
   - A operação de diminuir estoque impede que a quantidade resulte em valor inferior a zero.
