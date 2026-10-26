# Rotas da API de Dashboard (`TELA_DASHBOARD`)

Documentação técnica do endpoint consolidado do módulo de dashboard administrativo do sistema SIGA Phila.

---

## 1. Autenticação e Permissões Globais

Todas as requisições exigem autenticação ativa:
- **Autenticação**: `accessValidator` (validação de token JWT via cookie `accessToken`).
- **Permissão de Consulta**: `validarRole(["admin", "supervisor"])`. Usuários com perfil `atendente` não possuem acesso aos dados executivos.

---

## 2. Endpoints

### 2.1. Obter Indicadores Consolidados do Dashboard
Recupera os totais de receita, detalhamento por categoria, ranking de produtos mais vendidos e volume de vendas por curso no período selecionado.

- **Método**: `GET`
- **Rota**: `/dashboard`
- **Query Parameters**:
  - `periodo` (string enum, opcional): `"todo"`, `"hoje"`, `"semana"`, `"mes"` ou `"personalizado"`. Padrão: `"todo"`.
  - `dataInicio` (string `YYYY-MM-DD`, opcional): obrigatório quando `periodo` for `"personalizado"`.
  - `dataFim` (string `YYYY-MM-DD`, opcional): obrigatório quando `periodo` for `"personalizado"`.

- **Resposta de Sucesso (HTTP 200)**:
  ```json
  {
    "totais": {
      "arrecadado": 4850.00,
      "vendas": 42
    },
    "categorias": {
      "uniformes": {
        "valor": 2850.00,
        "quantidade": 76
      },
      "armarios": {
        "valor": 1400.00,
        "quantidade": 28
      },
      "contribuicao": {
        "valor": 600.00,
        "quantidade": 25
      }
    },
    "produtos": [
      {
        "id": 1,
        "nome": "Camiseta Tradicional - M",
        "quantidade": 32,
        "total": 1280.00
      },
      {
        "id": 2,
        "nome": "Bermuda Helanca - G",
        "quantidade": 21,
        "total": 945.00
      }
    ],
    "cursos": [
      {
        "id": 1,
        "nome": "Desenvolvimento de Sistemas",
        "quantidade": 45,
        "total": 2150.00
      },
      {
        "id": 2,
        "nome": "Administração",
        "quantidade": 28,
        "total": 1350.00
      }
    ]
  }
  ```

- **Regras de Negócio e Agregações**:
  - **Filtro de Período**: O intervalo temporal é aplicado sobre o campo `dataHoraCompra` das vendas da APM:
    - `"todo"`: todo o histórico de compras registrado.
    - `"hoje"`: das `00:00:00` às `23:59:59` da data corrente.
    - `"semana"`: da segunda-feira corrente até o domingo.
    - `"mes"`: do primeiro ao último dia do mês corrente.
    - `"personalizado"`: respeita `dataInicio` e `dataFim` fornecidos.
  - **Totais (`totais`)**:
    - `arrecadado`: soma de todos os valores de compras efetuadas no período.
    - `vendas`: contagem total de compras realizadas no período.
  - **Categorias (`categorias`)**:
    - `uniformes`: valor total e quantidade de peças vendidas de uniforme.
    - `armarios`: valor total e quantidade de locações de armários realizadas.
    - `contribuicao`: valor total e quantidade de doações/contribuições recebidas.
  - **Produtos Mais Vendidos (`produtos`)**:
    - Ranking ordenado decrescente pela quantidade de itens de uniforme vendidos (`quantidade`), contendo o nome do item e o valor financeiro total arrecadado (`total`).
  - **Vendas por Curso (`cursos`)**:
    - Agrupamento das compras pelo curso em que o aluno estava matriculado no ato do atendimento, totalizando a quantidade de itens e o valor financeiro total por curso.
