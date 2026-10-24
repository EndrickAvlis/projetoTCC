# Rotas da API de Relatórios Financeiros (`TELA_RELATORIOS`)

Documentação técnica dos endpoints, contratos de entrada/saída e regras de negócio do módulo de relatórios financeiros da APM do sistema SIGA Phila.

---

## 1. Autenticação e Permissões Globais

Todas as rotas exigem autenticação ativa:
- **Autenticação**: `accessValidator` (validação de token JWT via cookie `accessToken`).
- **Permissão de Consulta e Exportação**: `validarRole(["admin", "supervisor"])`. Usuários com perfil `atendente` não possuem acesso a dados consolidados ou extrato financeiro.

---

## 2. Endpoints

### 2.1. Consultar Movimentação Financeira e Extrato de Vendas
Recupera os totais consolidados de receita no período e a lista paginada de vendas com base nos filtros selecionados.

- **Método**: `GET`
- **Rota**: `/relatorios/dados`
- **Query Parameters**:
  - `periodo` (string enum, opcional): `"HOJE"`, `"SEMANA"`, `"MES"` ou `"PERSONALIZADO"`. Padrão: `"HOJE"`.
  - `dataInicio` (string ISO 8601 / `YYYY-MM-DD`, opcional): obrigatório quando `periodo` for `"PERSONALIZADO"`.
  - `dataFim` (string ISO 8601 / `YYYY-MM-DD`, opcional): obrigatório quando `periodo` for `"PERSONALIZADO"`.
  - `cursoId` (integer, opcional): filtra vendas realizadas para alunos de um curso específico.
  - `formaPagamento` (string enum, opcional): `"dinheiro"`, `"pix"`, `"debito"` ou `"credito"`.
  - `tipoReceita` (string enum, opcional): `"uniforme"`, `"armario"` ou `"contribuicao"`.
  - `atendenteId` (integer, opcional): filtra pelo voluntário/usuário que operou a venda.
  - `pagina` (integer, opcional): página atual para paginação server-side (padrão: `1`).
  - `limite` (integer, opcional): quantidade de vendas por página (padrão: `10`).

- **Resposta de Sucesso (HTTP 200)**:
  ```json
  {
    "resumoReceita": {
      "totais": {
        "totalArrecadado": 3450.00,
        "totalVendas": 28,
        "ticketMedio": 123.21
      },
      "porCategoria": {
        "uniformes": {
          "valor": 2100.00,
          "quantidade": 42
        },
        "armarios": {
          "valor": 950.00,
          "quantidade": 19
        },
        "contribuicao": {
          "valor": 400.00,
          "quantidade": 8
        }
      },
      "porPagamento": {
        "dinheiro": 850.00,
        "pix": 1400.00,
        "debito": 600.00,
        "credito": 600.00
      }
    },
    "vendas": [
      {
        "id": 1,
        "dataHora": "2026-10-22T14:35:00.000Z",
        "aluno": "Gabriel Mori Feltran",
        "quantidadeItens": 4,
        "precoTotal": 195.00
      },
      {
        "id": 2,
        "dataHora": "2026-10-22T11:20:00.000Z",
        "aluno": "Filipe Schimidt Leite",
        "quantidadeItens": 1,
        "precoTotal": 80.00
      }
    ],
    "totalVendas": 28,
    "pagina": 1,
    "totalPaginas": 3
  }
  ```

- **Regras de Negócio e Agregações**:
  - **Filtro de Data**: O intervalo de tempo é aplicado sobre o campo `dataHoraCompra` da tabela `Compra`.
    - `"HOJE"`: das `00:00:00` às `23:59:59` da data corrente.
    - `"SEMANA"`: do início da semana corrente (segunda-feira) até o final do domingo corrente.
    - `"MES"`: do primeiro ao último dia do mês corrente.
    - `"PERSONALIZADO"`: respeita `dataInicio` e `dataFim` fornecidos.
  - **Totais**:
    - `totalArrecadado`: soma de todos os `valorCompra` do período filtrado.
    - `totalVendas`: contagem total de compras realizadas no período.
    - `ticketMedio`: `totalVendas > 0 ? (totalArrecadado / totalVendas) : 0`.
  - **Origem das Entradas (`porCategoria`)**:
    - `uniformes`: soma dos itens de compra vinculados a produtos do tipo uniforme.
    - `armarios`: soma dos itens ou cobranças vinculadas ao aluguel de armários.
    - `contribuicao`: soma das contribuições voluntárias registradas no período.
  - **Conferência de Caixa (`porPagamento`)**:
    - Totalização dos valores por tipo de liquidação: `dinheiro`, `pix`, `debito` e `credito`.

---

### 2.2. Obter Detalhes da Venda (Recibo Digital)
Recupera sob demanda os dados completos de uma compra específica para visualização detalhada.

- **Método**: `GET`
- **Rota**: `/relatorios/detalhe/:id`
- **Parâmetros da Rota**:
  - `id` (integer, obrigatório): identificador da compra (`idCompra`).

- **Resposta de Sucesso (HTTP 200)**:
  ```json
  {
    "venda": {
      "id": 1,
      "codigoRetirada": "RET-2026-8941",
      "dataHora": "2026-10-22T14:35:00.000Z",
      "aluno": "Endrick Silva Souza",
      "curso": "Desenvolvimento de Sistemas",
      "periodo": "Tarde",
      "atendente": "Humberto Cecconi",
      "formaPagamento": "pix",
      "quantidadeItens": 4,
      "contribuicao": 20.00,
      "precoTotal": 195.00,
      "itens": [
        {
          "nome": "M",
          "quantidade": 2,
          "preco": 35.00
        },
        {
          "nome": "G",
          "quantidade": 1,
          "preco": 55.00
        },
        {
          "nome": "Armário",
          "quantidade": 1,
          "preco": 50.00
        }
      ]
    }
  }
  ```

- **Validações e Tratamento de Erros**:
  - Caso o `id` não exista, retorna erro `404 Venda não encontrada`.
  - Se a compra não possuir contribuição cadastrada, o campo `contribuicao` retorna `0`.

---

### 2.3. Exportar Extrato de Vendas (CSV)
Gera e transfere o extrato completo das vendas filtradas em formato CSV nativo compatível com Excel e Google Planilhas.

- **Método**: `GET`
- **Rota**: `/relatorios/exportar`
- **Query Parameters**: mesmos parâmetros aceitos por `GET /relatorios/dados` (sem paginação).
- **Cabeçalhos HTTP de Resposta**:
  - `Content-Type`: `text/csv; charset=utf-8`
  - `Content-Disposition`: `attachment; filename="extrato-vendas-[YYYY-MM-DD].csv"`
- **Lógica Direta no Back-end (Node.js Puro)**:
  1. Busca todas as compras correspondentes aos filtros (sem aplicar `take`/`skip` de paginação).
  2. Define a primeira linha com os cabeçalhos separados por ponto e vírgula (`;`).
  3. Mapeia cada venda em uma linha:
     `codigoRetirada;dataHora;aluno;curso;periodo;atendente;formaPagamento;quantidadeItens;contribuicao;precoTotal`
  4. Junta as linhas com quebra de linha (`\n`).
  5. Envia a resposta com prefixo BOM UTF-8 (`\uFEFF`) antes da string para garantir que acentos e cedilhas abram perfeitamente no Excel:
     ```javascript
     res.setHeader("Content-Type", "text/csv; charset=utf-8");
     res.setHeader("Content-Disposition", `attachment; filename="extrato-vendas-${dataAtual}.csv"`);
     return res.send(`\uFEFF${cabecalho}\n${linhas.join("\n")}`);
     ```