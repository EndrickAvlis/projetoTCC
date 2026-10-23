# Tela de Dashboard administrativo

## 1. Finalidade deste documento

Este documento é o guia definitivo de implementação da tela administrativa de Dashboard do SIGA Phila. Ele define o escopo consolidado da APM, as regras financeiras, a arquitetura direta sem alterações no banco de dados, o contrato da API, a estrutura de arquivos no frontend e backend, e os critérios de conclusão.

Rota da tela:

```text
/admin/dashboard
```

Este documento complementa `TELA_RELATORIOS.md`. Enquanto Relatórios é a área de consulta analítica, com filtros avançados, históricos específicos e exportação (CSV/PDF), o **Dashboard** é o painel de bordo executivo: leitura imediata da situação financeira e operacional da APM sem necessidade de configurar filtros.

---

## 2. Escopo definitivo (Princípio KISS)

O Dashboard apresenta a **visão geral consolidada das movimentações da APM**. Para manter o sistema direto e evitar complexidades desnecessárias na reta final do TCC, **não há entidade de ciclo de matrícula** nem exigência de novas migrations no banco.

A tela apresenta:

- **Total arrecadado geral** pela APM;
- **Quantidade de vendas realizadas** e **ticket médio**;
- **Total arrecadado e unidades de uniformes vendidos**;
- **Total arrecadado e unidades de armários vendidos**;
- **Total arrecadado e quantidade de contribuições recebidas**;
- **Composição da receita** (% e R$ de uniformes, armários e contribuições);
- **Resumo por forma de pagamento** (Pix, Dinheiro, Débito e Crédito);
- **Alertas operacionais imediatos**:
  - produtos ativos com estoque baixo ($\le 5$ unidades);
  - unidades de itens comprados aguardando retirada pelo aluno;
  - quantidade de armários disponíveis para locação;
- **Data e hora da última atualização** dos dados;
- **Ação para ocultar ou exibir valores financeiros** (modo privacidade para balcões);
- **Ação para atualizar dados manualmente** sem recarregar a página inteira.

Não pertencem ao Dashboard:

- painel de filtros complexos ou seletores de período histórico (pertencem a Relatórios);
- tabelas de vendas individuais com paginação;
- exportação de arquivos;
- métricas de filas e chamadas de senhas em tempo real (pertencem a Postos e Filas);
- nova tabela ou entidade de ciclos de matrícula no banco de dados;
- tabelas de agregação pré-calculada ou cache persistente.

---

## 3. Princípio da interface

O Dashboard deve responder rapidamente a três perguntas centrais:

1. **Quanto a APM já arrecadou e qual foi a origem desses recursos?**
2. **Como esses valores foram recebidos (formas de pagamento)?**
3. **Quais situações exigem atenção operacional imediata no estoque e na entrega?**

Hierarquia visual do conteúdo:

```text
Cabeçalho (Título, "Ocultar valores", "Atualizar")
  └─ Card Hero (Total Arrecadado Geral)
       └─ Grid de 4 Indicadores (Vendas & Ticket Médio, Uniformes, Armários, Contribuições)
            └─ Painéis de Apoio (Composição de Receita + Formas de Pagamento)
                 └─ Alertas Operacionais (Estoque Baixo, Retiradas Pendentes, Armários Livres)
```

---

## 4. Banco de dados (Zero Migrations)

Seguindo estritamente o princípio KISS, **nenhuma alteração é necessária no schema do PostgreSQL**.

A tela utiliza exclusivamente as entidades já existentes em `schema.prisma`:

- `Compra`: `idCompra`, `valorCompra`, `dataHoraCompra`, etc.
- `ItemCompra`: `precoUnitario`, `quantidadeItem`, `quantidadeRetiradaItem`, `statusItem`.
- `Produto`: `idProduto`, `nomeProduto`, `precoProduto`, `quantidadeProduto`, `tipoProduto`, `statusItem`.
- `Contribuicao`: `idContribuicao`, `valorContribuicao`, `dataHora`.
- `Pagamento`: `idPagamento`, `valorPagamento`, `tipoPagamento`.

---

## 5. Regras financeiras e de negócio

As fórmulas financeiras são unificadas e devem ser consistentes com `RelatorioService`:

### 5.1. Uniformes

```text
quantidadeUniformes = soma(ItemCompra.quantidadeItem)
                      onde Produto.tipoProduto = "uniforme"

valorUniformes = soma(ItemCompra.precoUnitario × ItemCompra.quantidadeItem)
                  onde Produto.tipoProduto = "uniforme"
```

*Sempre utilizar o preço histórico de `ItemCompra.precoUnitario` gravado no ato da venda.*

### 5.2. Armários

```text
quantidadeArmarios = soma(ItemCompra.quantidadeItem)
                     onde Produto.tipoProduto = "armario"

valorArmarios = soma(ItemCompra.precoUnitario × ItemCompra.quantidadeItem)
                 onde Produto.tipoProduto = "armario"
```

### 5.3. Contribuições

```text
quantidadeContribuicoes = contagem de registros de Contribuicao com valorContribuicao > 0
valorContribuicoes = soma(Contribuicao.valorContribuicao)
```

### 5.4. Total arrecadado

```text
totalArrecadado = valorUniformes + valorArmarios + valorContribuicoes
```

*Ou equivalentemente: `soma(Compra.valorCompra)`. Nunca somar pagamentos ao total nem somar `valorCompra` com os itens novamente.*

### 5.5. Vendas e ticket médio

```text
totalVendas = contagem de registros em Compra
ticketMedio = totalVendas > 0 ? (totalArrecadado / totalVendas) : 0
```

*Proteção obrigatória: se `totalVendas` for 0, `ticketMedio` deve retornar 0, nunca `NaN` ou `Infinity`.*

### 5.6. Composição percentual

```text
percentualUniformes = totalArrecadado > 0 ? (valorUniformes / totalArrecadado) × 100 : 0
percentualArmarios = totalArrecadado > 0 ? (valorArmarios / totalArrecadado) × 100 : 0
percentualContribuicoes = totalArrecadado > 0 ? (valorContribuicoes / totalArrecadado) × 100 : 0
```

### 5.7. Alertas operacionais

- **Estoque baixo de uniformes**:
  Produtos com `tipoProduto = "uniforme"`, `statusItem != "arquivado"` e `quantidadeProduto <= 5`.
- **Retiradas pendentes**:
  Soma de `(quantidadeItem - quantidadeRetiradaItem)` para todos os itens onde essa diferença for maior que zero.
- **Armários disponíveis**:
  `quantidadeProduto` do produto ativo com `tipoProduto = "armario"`. Devolver `null` se não houver armário cadastrado.

---

## 6. Contrato da API

Uma única rota pública no backend resolve toda a interface:

```text
GET /admin/dashboard
```

### Resposta `200 OK`:

```json
{
  "resumo": {
    "totalArrecadado": 18420.00,
    "totalVendas": 286,
    "ticketMedio": 64.41,
    "uniformes": {
      "quantidade": 214,
      "valor": 11920.00,
      "percentual": 64.71
    },
    "armarios": {
      "quantidade": 78,
      "valor": 4680.00,
      "percentual": 25.41
    },
    "contribuicoes": {
      "quantidade": 96,
      "valor": 1820.00,
      "percentual": 9.88
    }
  },
  "pagamentos": [
    { "forma": "pix", "quantidade": 168, "valor": 9420.00, "percentual": 51.14 },
    { "forma": "debito", "quantidade": 54, "valor": 3510.00, "percentual": 19.06 },
    { "forma": "credito", "quantidade": 37, "valor": 3220.00, "percentual": 17.48 },
    { "forma": "dinheiro", "quantidade": 34, "valor": 2270.00, "percentual": 12.32 }
  ],
  "alertas": {
    "produtosEstoqueBaixo": {
      "quantidade": 3,
      "itens": ["Camiseta P", "Moletom M", "Camiseta GG"]
    },
    "unidadesAguardandoRetirada": 12,
    "armariosDisponiveis": 22
  },
  "geradoEm": "2026-10-15T18:55:00.000Z"
}
```

*Nota: Todos os valores `Decimal` do Prisma são convertidos para `number` no backend antes do envio.*

---

## 7. Estrutura de arquivos

### 7.1. Backend

```text
backend/src/
├── routes/
│   └── dashboardRoutes.js        # GET / -> dashboardController.obterDashboard
├── controllers/
│   └── dashboardController.js   # Chama o service e devolve o json
└── services/
    └── dashboardService.js      # Agrega Compras, Itens, Pagamentos e Alertas no Prisma
```

Montagem em `backend/src/app.js`:

```js
import dashboardRoutes from "./routes/dashboardRoutes.js";

app.use("/admin/dashboard", dashboardRoutes);
```

### 7.2. Frontend

```text
frontend/src/features/admin/
├── pages/
│   └── DashboardPage.jsx                 # Orquestrador com estado local valoresOcultos
├── hooks/
│   └── useDashboard.js                   # Hook local para fetch, reload e estados de loading/erro
├── services/
│   └── dashboardService.js               # Chamada requisitarApi("/admin/dashboard")
└── components/dashboard/
    ├── TotalArrecadadoCard.jsx           # Card principal em destaque
    ├── IndicadoresDashboard.jsx          # 4 cards (Vendas, Uniformes, Armários, Contribuições)
    ├── ComposicaoArrecadacao.jsx         # Barras de composição percentual e financeira
    ├── FormasPagamentoResumo.jsx         # Resumo por Pix, Cartões e Dinheiro
    └── AlertasDashboard.jsx              # Indicadores de estoque baixo e pendências com atalhos
```

---

## 8. Gerenciamento de estado (KISS)

- **Não criar `DashboardContext`**: Apenas a página `/admin/dashboard` consome esses dados.
- **Estado local na página (`useState`)**:
  - `valoresOcultos` (boolean): alterna entre os valores reais formatados via `formatarMoeda` e a máscara `••••••`.
- **Estado no hook `useDashboard`**:
  - `dados`: objeto com o payload retornado da API.
  - `carregando`: boolean de carregamento inicial.
  - `atualizando`: boolean de recarregamento sem apagar a tela.
  - `erro`: mensagem de falha, se houver.
  - `recarregar()`: função disparada pelo botão "Atualizar".

---

## 9. Ordem recomendada de construção

### Etapa 1 – Backend do Dashboard
1. Criar `backend/src/services/dashboardService.js` com a agregação no Prisma.
2. Criar `backend/src/controllers/dashboardController.js`.
3. Criar `backend/src/routes/dashboardRoutes.js`.
4. Registrar `/admin/dashboard` em `backend/src/app.js`.

### Etapa 2 – Frontend do Dashboard
1. Criar `frontend/src/features/admin/services/dashboardService.js`.
2. Criar `frontend/src/features/admin/hooks/useDashboard.js`.
3. Criar os componentes modulares em `frontend/src/features/admin/components/dashboard/`.
4. Atualizar `frontend/src/features/admin/pages/DashboardPage.jsx` substituindo o placeholder.
5. Validar a responsividade no mobile/desktop e o recurso "Ocultar valores".

---

## 10. Critérios de conclusão

A implementação é considerada concluída quando:

- A rota `GET /admin/dashboard` retorna os dados agregados corretos em uma única requisição;
- O backend trata adequadamente o banco vazio (sem compras) sem gerar `NaN` ou erros 500;
- Nenhum dado novo ou entidade foi adicionado ao `schema.prisma`;
- O botão "Ocultar valores" mascara corretamente todas as cifras na tela;
- O botão "Atualizar" busca dados novos mantendo a interface estável;
- Alertas mostram produtos com $\le 5$ unidades e itens não retirados com links para suas respectivas telas.
