# Tela de Relatórios financeiros

## 1. Finalidade deste documento

Este documento é o guia de implementação da tela administrativa de Relatórios do
SIGA Phila. Ele descreve o fluxo completo, as regras de negócio, as alterações
mínimas no banco, os contratos da API, os arquivos do frontend e do backend, os
hooks, os services, os componentes e a ordem recomendada de construção.

Rota da tela:

```text
/admin/relatorios
```

Protótipo visual de referência:

```text
testes/relatorios/index.html
```

Este arquivo substitui, para esta tela, a parte antiga da seção de Relatórios de
`DEFINICOES_FUNCIONAIS_DO_SISTEMA.md` que incluía filas e matrículas. A tela de
Relatórios definida aqui é exclusivamente financeira.

## 2. Escopo definitivo

A tela deve consultar e analisar somente dados relacionados às entradas financeiras
registradas pela APM:

- vendas de uniformes;
- vendas de armários;
- contribuições voluntárias;
- balanço geral;
- formas de pagamento;
- vendas por curso;
- vendas por ano escolar;
- vendas por atendente;
- produtos mais vendidos;
- lista das vendas individuais.

Não pertencem a esta tela:

- senhas aguardando;
- postos ou etapas de atendimento;
- chamadas do dia;
- tempo médio de espera ou atendimento;
- matrículas realizadas;
- estoque atual ou retiradas pendentes;
- indicadores resumidos que já pertencem ao Dashboard.

As métricas de filas devem ser implementadas na tela de Filas. Matrículas e dados
dos alunos devem ser implementados na tela de Alunos. O Dashboard permanece como a
visão rápida do sistema.

## 3. Princípio da interface

A tela de Relatórios funciona como uma área de consulta, não como outro Dashboard.
Ela não deve mostrar vários cards ou gráficos pequenos ao mesmo tempo.

Os filtros ficam no topo e o conteúdo é separado em três abas:

1. **Resumo**;
2. **Análises**;
3. **Vendas**.

Somente uma aba é exibida por vez. Na aba Análises, somente um relatório específico
é mostrado por vez. Essa separação é obrigatória para evitar poluição visual.

## 4. Fluxo do usuário

### 4.1. Entrada na tela

Ao abrir `/admin/relatorios`:

1. o período inicial é **Este mês**;
2. curso, ano e atendente iniciam como **Todos**;
3. a aba inicial é **Resumo**;
4. o frontend carrega as opções de filtro;
5. o frontend carrega o resumo financeiro e a evolução das vendas;
6. a aba Vendas só precisa carregar a listagem quando for aberta.

### 4.2. Aplicação dos filtros

Os filtros são globais. A mesma seleção deve afetar:

- composição do balanço;
- evolução das vendas;
- análise selecionada;
- tabela de vendas;
- todas as exportações.

Ao alterar qualquer filtro:

1. a página da tabela volta para 1;
2. os dados visíveis são recarregados;
3. o filtro não altera nem grava informações financeiras;
4. o backend continua sendo a fonte dos dados.

### 4.3. Consulta de uma venda

Cada linha da tabela representa uma `Compra`, não um aluno único. Um aluno pode
aparecer mais de uma vez se possuir mais de uma compra.

Ao selecionar **Detalhes**:

1. abre-se o componente reutilizável `Modal`;
2. são apresentados os dados completos já devolvidos na página da listagem;
3. nenhuma nova rota de detalhe é necessária;
4. fechar o modal não recarrega a tabela.

### 4.4. Atendimento sem venda

Um aluno que passa pela APM sem comprar item e sem contribuir não gera `Compra`.
Consequentemente, ele:

- não aparece na tabela de vendas;
- não entra nas quantidades;
- não entra nos gráficos;
- não entra no balanço;
- não aparece nas exportações financeiras.

## 5. Estrutura visual

### 5.1. Cabeçalho da página

O título e o ícone já são fornecidos por:

- `frontend/src/features/admin/layout/adminHeader.jsx`;
- `frontend/src/features/admin/constants/adminNavigation.js`.

O conteúdo da página não deve repetir o título principal do cabeçalho. Ele pode
apresentar apenas uma descrição curta, por exemplo:

```text
Consulte as entradas da APM, compare resultados e confira cada venda registrada.
```

O botão **Exportar** fica alinhado à direita dessa introdução.

### 5.2. Filtros

O painel pode ser recolhido e deve conter:

- período;
- curso;
- ano escolar;
- atendente;
- datas inicial e final, somente para período personalizado;
- botão **Limpar**.

Quando recolhido, o cabeçalho do painel deve informar a quantidade de vendas
encontradas. Não é necessário criar cards para isso.

### 5.3. Aba Resumo

Deve conter no máximo dois painéis:

1. **Composição do balanço**;
2. **Evolução das vendas**.

O painel de composição apresenta:

- valor e quantidade de uniformes vendidos;
- valor e quantidade de armários vendidos;
- valor e quantidade de contribuições;
- balanço geral;
- uma barra horizontal com a participação de cada entrada.

O painel de evolução apresenta um único gráfico com o valor arrecadado por dia.
O gráfico deve utilizar o componente **Chart do shadcn/ui**, baseado em Recharts,
para manter o mesmo padrão visual dos gráficos que serão usados no dashboard. A
configuração específica da evolução diária deve ficar encapsulada em
`GraficoEvolucaoReceita.jsx`; a página apenas entrega os dados já filtrados ao
componente.

### 5.4. Aba Análises

Deve apresentar:

- um `Select` para o tipo de relatório;
- um `Select` para a métrica;
- um gráfico de barras horizontal.

Somente uma análise aparece por vez. O resultado é apresentado apenas no gráfico;
esta aba não possui tabela auxiliar.

### 5.5. Aba Vendas

Deve apresentar:

- pesquisa pelo nome do aluno ou código da retirada;
- quantidade de vendas encontradas;
- `DataTable` com no máximo 10 vendas por página;
- paginação;
- estado vazio;
- modal de detalhes.

Colunas visíveis:

| Coluna | Conteúdo |
|---|---|
| Data e hora | `dataHoraCompra` formatada |
| Aluno | nome; curso e ano em texto secundário |
| Atendente | nome do voluntário que registrou a compra |
| Total | total confirmado da compra |
| Ações | botão **Detalhes** |

O modal apresenta:

- aluno;
- curso;
- ano escolar;
- data e hora;
- atendente;
- uniformes, quantidades, preço unitário e subtotal;
- armário, quando comprado;
- contribuição, quando registrada;
- total;
- formas de pagamento e valores;
- código da retirada.

### 5.6. Menu Exportar

O menu deve possuir exatamente estes itens:

```text
Exportar
├─ Resumo atual
├─ Análise selecionada
├─ Vendas detalhadas
└─ Relatório completo
```

Mapeamento dos arquivos:

| Item | Formato | Conteúdo |
|---|---|---|
| Resumo atual | CSV | composição e balanço atuais |
| Análise selecionada | CSV | análise e métrica atualmente selecionadas |
| Vendas detalhadas | CSV | todas as vendas correspondentes aos filtros |
| Relatório completo | XLSX | resumo, análise e vendas em planilhas separadas |

O menu fecha ao selecionar uma opção, clicar fora ou pressionar `Escape`.

## 6. Regras financeiras

### 6.1. Totais

O subtotal de uniformes é calculado com o preço registrado em `ItemCompra`, nunca
com o preço atual de `Produto`:

```text
subtotalUniformes = soma(ItemCompra.precoUnitario × ItemCompra.quantidadeItem)
                    onde Produto.tipoProduto = "uniforme"
```

O subtotal de armários segue a mesma regra:

```text
subtotalArmarios = soma(ItemCompra.precoUnitario × ItemCompra.quantidadeItem)
                   onde Produto.tipoProduto = "armario"
```

As contribuições são calculadas por:

```text
totalContribuicoes = soma(Contribuicao.valorContribuicao)
```

O balanço geral é:

```text
balancoGeral = subtotalUniformes
             + subtotalArmarios
             + totalContribuicoes
```

### 6.2. Uso de `Compra.valorCompra`

`Compra.valorCompra` deve guardar o total final da compra, incluindo uniformes,
armário e contribuição.

Ele pode ser utilizado para conferir o resultado calculado, mas não pode ser
somado novamente aos subtotais:

```text
ERRADO:
Compra.valorCompra + contribuicoes + itens

CORRETO:
itensUniformes + itensArmario + contribuicoes
```

ou, para o total geral já confirmado:

```text
soma(Compra.valorCompra)
```

As duas formas devem chegar ao mesmo valor. A implementação deve usar uma única
forma em cada cálculo para evitar duplicidade.

### 6.3. Formas de pagamento

As formas de pagamento explicam como o total foi recebido. Elas não são novas
entradas do balanço.

```text
soma(Pagamento.valorPagamento de uma compra) = Compra.valorCompra
```

Uma compra com Pix e dinheiro continua sendo uma única venda.

### 6.4. Quantidade vendida

Relatórios de venda usam `quantidadeItem`. Não devem usar
`quantidadeRetiradaItem`, pois retirada e venda são eventos diferentes.

### 6.5. Data utilizada

Todos os filtros financeiros usam `Compra.dataHoraCompra`.
`Contribuicao.dataHora` não deve criar outro período para a mesma compra.

### 6.6. Produtos arquivados e usuários inativos

Compras históricas permanecem no relatório mesmo que:

- o uniforme tenha sido arquivado;
- o armário esteja indisponível;
- o curso tenha sido arquivado;
- o voluntário esteja inativo.

Arquivamento não apaga o histórico financeiro.

### 6.7. Cancelamentos e estornos

O banco atual não possui uma situação de compra cancelada ou estornada. Essa regra
não será inventada dentro da tela de Relatórios.

Enquanto uma regra geral de cancelamento não for definida, toda `Compra` persistida
é considerada confirmada. Uma implementação futura poderá adicionar uma situação à
compra e excluir cancelamentos dos relatórios, mas isso está fora deste escopo.

## 7. Filtros

### 7.1. Filtros aceitos pela API

| Query | Tipo | Obrigatória | Regra |
|---|---|---:|---|
| `inicio` | `YYYY-MM-DD` | sim | primeiro dia incluído |
| `fim` | `YYYY-MM-DD` | sim | último dia incluído |
| `cursoId` | inteiro positivo | não | curso registrado na compra |
| `ano` | inteiro positivo | não | ano escolar registrado na compra |
| `voluntarioId` | inteiro positivo | não | atendente que registrou a compra |
| `busca` | texto | não | aluno ou código de retirada, somente na listagem |
| `pagina` | inteiro positivo | não | padrão 1 |
| `limite` | inteiro entre 1 e 100 | não | interface usa 10 |
| `analise` | enum | não | padrão `cursos` |

O frontend transforma os atalhos de período em `inicio` e `fim`:

- **Hoje:** data atual em `America/Sao_Paulo`;
- **Esta semana:** segunda-feira até domingo;
- **Este mês:** primeiro até último dia do mês;
- **Personalizado:** datas informadas pelo usuário.

O backend não precisa conhecer os nomes Hoje, Semana ou Mês. Ele recebe somente o
intervalo final, o que mantém uma única regra de consulta.

### 7.2. Intervalo de data no backend

O backend deve transformar as datas em:

```text
dataHoraCompra >= início às 00:00 em America/Sao_Paulo
dataHoraCompra <  dia posterior ao fim às 00:00 em America/Sao_Paulo
```

Usar fim exclusivo evita erros com milissegundos:

```js
where: {
  dataHoraCompra: {
    gte: inicioDoPrimeiroDia,
    lt: inicioDoDiaSeguinteAoFim,
  },
}
```

O helper de intervalo pode seguir a abordagem já presente em
`backend/src/services/SenhaService.js`. Não deve existir uma implementação de fuso
horário diferente para cada service.

### 7.3. Limpar filtros

O botão **Limpar** restaura:

```text
Período: Este mês
Curso: Todos
Ano escolar: Todos
Atendente: Todos
Página: 1
```

A aba e a análise selecionada podem permanecer como estão.

## 8. Análises disponíveis

| Análise | Agrupamento | Métricas permitidas |
|---|---|---|
| Ranking de cursos | curso da compra | valor, quantidade de vendas, ticket médio |
| Produtos mais vendidos | uniforme/tamanho | valor, quantidade de unidades |
| Formas de pagamento | tipo do pagamento | valor recebido |
| Vendas por ano escolar | ano registrado na compra | valor, quantidade de vendas, ticket médio |
| Vendas por atendente | voluntário da compra | valor, quantidade de vendas, ticket médio |
| Contribuições por curso | curso da compra | valor, quantidade de contribuições, média |

Definições:

```text
ticketMedio = valorTotalDoGrupo / quantidadeDeVendasDoGrupo

contribuicaoMedia = valorTotalContribuido / quantidadeDeContribuicoes
```

Em Produtos mais vendidos, o agrupamento considera somente produtos cujo
`tipoProduto` é `uniforme`. O armário já possui representação separada no resumo e,
por ser um único produto, não acrescenta informação útil ao ranking de uniformes.

O backend devolve para cada item de análise:

```json
{
  "chave": "2",
  "rotulo": "Desenvolvimento de Sistemas",
  "valor": 835,
  "quantidade": 6,
  "media": 139.17
}
```

O frontend escolhe qual propriedade desenhar conforme a métrica. Trocar somente a
métrica não exige uma nova consulta quando os três valores já foram recebidos.

## 9. Alterações mínimas no banco de dados

### 9.1. Por que a compra precisa guardar curso e ano

Atualmente `Compra` referencia o aluno, mas o aluno pode possuir mais de um curso e
seu ano escolar pode ser alterado. Se o relatório buscar curso e ano apenas nos
dados atuais do aluno, uma venda antiga poderá mudar de grupo no futuro.

Para preservar o contexto histórico da venda, `Compra` deve guardar uma fotografia
mínima do curso e do ano usados no momento da confirmação.

### 9.2. Campos necessários

Não será criada tabela nova. Acrescentar somente:

```prisma
model Compra {
  idCompra       Int      @id @default(autoincrement())
  codVoluntario  Int
  codAluno       Int
  codCurso       Int
  anoAluno       Int
  valorCompra    Decimal  @db.Decimal(6, 2)
  dataHoraCompra DateTime
  codigoRetirada String   @db.VarChar(100)

  aluno         Aluno          @relation(fields: [codAluno], references: [idAluno])
  curso         Curso          @relation(fields: [codCurso], references: [idCurso])
  voluntario    Voluntario     @relation(fields: [codVoluntario], references: [idVoluntario])
  itensCompra   ItemCompra[]
  pagamentos    Pagamento[]
  contribuicoes Contribuicao[]

  @@index([dataHoraCompra])
  @@index([codCurso, dataHoraCompra])
  @@index([codVoluntario, dataHoraCompra])
  @@index([anoAluno, dataHoraCompra])
}

model Curso {
  // campos atuais
  compras Compra[]
}
```

Os índices atendem exatamente aos filtros do relatório. Eles não alteram as regras
de negócio e não exigem novas entidades.

### 9.3. Preenchimento na criação da compra

O service que confirma a venda deve preencher `codCurso` e `anoAluno` usando o
atendimento e a matrícula selecionada no servidor.

O frontend não deve poder associar arbitrariamente uma venda da APM a qualquer
curso. O backend deve validar que o curso pertence ao aluno atendido.

Para compra avulsa, o backend deve receber o curso selecionado e validar o vínculo
antes de criar a compra.

### 9.4. Migração de dados existentes

Se já houver compras no banco:

1. criar `codCurso` e `anoAluno` temporariamente como opcionais;
2. preencher `anoAluno` com o ano atual registrado no aluno;
3. preencher `codCurso` quando o aluno possuir um único vínculo de curso;
4. revisar manualmente alunos com mais de um curso;
5. tornar os dois campos obrigatórios;
6. criar os índices.

Não escolher silenciosamente o primeiro curso de um aluno com vários vínculos.

### 9.5. O que não deve ser alterado por esta funcionalidade

- não criar tabela `Relatorio`;
- não salvar totais calculados em nova tabela;
- não salvar gráficos;
- não duplicar pagamentos;
- não adicionar posto à compra;
- não vincular a compra à senha somente para montar esta tela;
- não alterar estoque ao consultar relatórios;
- não alterar a modelagem de matrícula dentro desta tarefa.

## 10. Estrutura de arquivos

### 10.0. O que já existe e o que ainda será criado

| Item | Estado atual | Ação durante a implementação |
|---|---|---|
| rota React `/admin/relatorios` | existe em `App.jsx` | manter e adicionar `RotaProtegida` |
| item Relatórios na sidebar | existe em `adminNavigation.js` | nenhuma alteração |
| título e ícone no header | derivados da navegação | nenhuma alteração |
| `relatoriosPage.jsx` | existe somente com um `<h1>` | substituir pelo orquestrador |
| componentes UI globais | já existem | reutilizar, sem copiar |
| base compartilhada de gráficos | não existe | adicionar uma vez o Chart do shadcn/ui e a dependência Recharts |
| cliente HTTP | já existe | acrescentar somente suporte a arquivo |
| models financeiros Prisma | já existem | acrescentar snapshot de curso e ano em `Compra` |
| services básicos de compra, item, pagamento e contribuição | existem como CRUD | manter; agregações ficam em `RelatorioService` |
| routes/controller/service de relatórios | não existem | criar conforme este documento |
| model JavaScript `Relatorio` | não existe | não criar |
| tabela de relatórios | não existe | não criar |

Essa distinção impede recriar navegação, layout ou componentes que o projeto já
possui.

### 10.1. Frontend

```text
frontend/src/features/admin/
├─ pages/
│  └─ relatoriosPage.jsx                 existente; substituir conteúdo
├─ components/
│  └─ relatorios/
│     ├─ FiltrosRelatorios.jsx
│     ├─ ResumoFinanceiro.jsx
│     ├─ GraficoEvolucaoReceita.jsx
│     ├─ AnalisesFinanceiras.jsx
│     ├─ VendasRelatorio.jsx
│     ├─ DetalhesVendaModal.jsx
│     └─ ExportarRelatorioMenu.jsx
├─ hooks/
│  ├─ useOpcoesRelatorios.js
│  ├─ useRelatorioFinanceiro.js
│  └─ useVendasRelatorio.js
├─ services/
│  └─ RelatoriosService.js
└─ constants/
   └─ relatorios.js
```

Não criar novos componentes globais de botão, input, select, tabela, alerta ou
modal. A única adição global prevista é `components/ui/chart.jsx`, fornecido pelo
shadcn/ui e compartilhado pelos relatórios e pelo dashboard.

### 10.2. Backend

```text
backend/src/
├─ routes/
│  └─ relatoriosRoutes.js
├─ controllers/
│  └─ RelatoriosController.js
├─ services/
│  └─ RelatorioService.js
└─ validators/
   └─ ValidatorRelatorios.js
```

`RelatorioService` não deve estender `BaseService`, porque consulta e agrega vários
models ao mesmo tempo. Ele deve usar o cliente Prisma já existente em
`backend/src/config/prisma.js`.

## 11. Componentes existentes que devem ser reutilizados

| Componente/função | Arquivo atual | Uso em Relatórios |
|---|---|---|
| `Button` | `components/ui/button.jsx` | limpar, paginar, exportar, detalhes |
| `Input` | `components/ui/input.jsx` | datas e pesquisa |
| `Select` | `components/ui/Select.jsx` | período, curso, ano, atendente, análise e métrica |
| `DataTable` | `components/ui/DataTable.jsx` | vendas detalhadas |
| `Modal` | `components/ui/Modal.jsx` | detalhes da venda |
| `Alert` | `components/ui/Alert.jsx` | erro de carregamento ou exportação |
| `formatarMoeda` | `utils/formatters.js` | todos os valores monetários |
| `requisitarApi` | `services/apiClient.js` | respostas JSON |
| `ApiError` | `services/apiClient.js` | erros padronizados |
| `AdminLayout` | `features/admin/layout/adminLayout.jsx` | layout da rota |
| `AdminHeader` | `features/admin/layout/adminHeader.jsx` | título e ícone |
| `AuthContext` | `context/authContext.jsx` | sessão e permissão |
| `RotaProtegida` | `components/routing/RotaProtegida.jsx` | acesso à tela |

Os sete componentes dentro de `components/relatorios` são componentes de domínio.
Eles organizam a tela utilizando os componentes globais existentes; não substituem
nem duplicam o design system.

### 11.1. Extensão permitida em `formatters.js`

Adicionar funções de data ao utilitário existente, pois serão úteis em outras
telas:

```js
export const formatarDataHora = (valor) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(valor));

export const formatarDataCurta = (valor) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(valor));
```

Não duplicar essas funções dentro de vários componentes.

## 12. Responsabilidade dos componentes novos

### `FiltrosRelatorios.jsx`

Responsável somente por renderizar os campos e emitir alterações.

Props esperadas:

```js
{
  filtros,
  opcoes,
  totalVendas,
  aberto,
  onAlternar,
  onAlterar,
  onLimpar,
}
```

Ele não chama a API e não calcula relatórios.

### `ResumoFinanceiro.jsx`

Recebe `resumo` e `evolucao`. Renderiza a composição e entrega os dados da evolução
ao `GraficoEvolucaoReceita`. Não consulta o backend e não recalcula dados brutos.

### `GraficoEvolucaoReceita.jsx`

Recebe somente os valores arrecadados por dia e monta o gráfico de linha com o
Chart do shadcn/ui. Deve cuidar da apresentação, do tooltip, dos eixos e do estado
sem dados, mas não aplica filtros, não chama a API e não calcula o relatório.

### `AnalisesFinanceiras.jsx`

Recebe a análise atual, as opções e callbacks. Escolhe `valor`, `quantidade` ou
`media` para desenhar as barras. Não renderiza tabela auxiliar; os valores exatos
permanecem visíveis no próprio gráfico.

### `VendasRelatorio.jsx`

Recebe listagem, paginação, pesquisa e callbacks. A tabela deve usar `DataTable`.
Os controles de paginação usam `Button`.

### `DetalhesVendaModal.jsx`

Encapsula o `Modal` existente. Recebe somente:

```js
{
  venda,
  onFechar,
}
```

Quando `venda` for `null`, o modal permanece fechado.

### `ExportarRelatorioMenu.jsx`

Encapsula o botão e o menu de quatro opções. Recebe:

```js
{
  exportando,
  onExportar,
}
```

Não monta CSV ou Excel. Apenas chama `onExportar(escopo)`.

## 13. Constants do frontend

`frontend/src/features/admin/constants/relatorios.js` deve concentrar valores que
não vêm do banco:

```js
export const ABAS_RELATORIOS = [
  { value: "resumo", label: "Resumo" },
  { value: "analises", label: "Análises" },
  { value: "vendas", label: "Vendas" },
];

export const PERIODOS_RELATORIO = [
  { value: "hoje", label: "Hoje" },
  { value: "semana", label: "Esta semana" },
  { value: "mes", label: "Este mês" },
  { value: "personalizado", label: "Período personalizado" },
];

export const ANALISES_RELATORIO = {
  cursos: {
    label: "Ranking de cursos",
    metricas: ["valor", "quantidade", "media"],
  },
  produtos: {
    label: "Produtos mais vendidos",
    metricas: ["valor", "quantidade"],
  },
  pagamentos: {
    label: "Formas de pagamento",
    metricas: ["valor"],
  },
  anos: {
    label: "Vendas por ano escolar",
    metricas: ["valor", "quantidade", "media"],
  },
  atendentes: {
    label: "Vendas por atendente",
    metricas: ["valor", "quantidade", "media"],
  },
  contribuicoes: {
    label: "Contribuições por curso",
    metricas: ["valor", "quantidade", "media"],
  },
};
```

Curso, ano e atendente não devem ser hardcoded. Eles vêm de
`GET /admin/relatorios/filtros`.

## 14. Contextos

### 14.1. Não criar `RelatoriosContext`

O estado pertence somente à página de Relatórios. Criar uma Context adicionaria
uma camada sem consumidor externo e deixaria o fluxo mais difícil de acompanhar.

Manter em `relatoriosPage.jsx`:

```text
abaAtual
filtros
analiseAtual
metricaAtual
buscaVenda
paginaVenda
vendaSelecionada
menuExportacaoAberto
```

### 14.2. Contextos existentes

- `AuthContext` continua sendo usado pela proteção da rota e pelo cliente HTTP;
- `AtendimentoContext` não deve ser usado por Relatórios;
- nenhum dado financeiro deve ser salvo em Context global.

### 14.3. Local storage

O backend é a única fonte das vendas. Nunca salvar vendas, totais ou respostas da
API no `localStorage`.

A primeira versão também não precisa persistir filtros. Se futuramente for desejado,
somente preferências visuais, como aba e análise selecionada, poderão ser salvas.

## 15. Rotas da API

Todas as rotas são administrativas e usam o prefixo `/admin`.

```text
GET /admin/relatorios/filtros
GET /admin/relatorios/financeiro
GET /admin/relatorios/vendas
GET /admin/relatorios/exportacao
```

Não criar endpoints separados para cada gráfico. O tipo de análise é uma query da
rota financeira.

## 16. Contrato: opções de filtro

### `GET /admin/relatorios/filtros`

Não recebe filtros. Deve devolver opções que possuem histórico de compra, inclusive
cursos arquivados e voluntários inativos.

Resposta `200 OK`:

```json
{
  "cursos": [
    { "value": 2, "label": "Desenvolvimento de Sistemas" }
  ],
  "anos": [1, 2, 3],
  "atendentes": [
    { "value": 5, "label": "Carlos Lima" }
  ]
}
```

Ordenação:

- cursos por nome;
- anos em ordem crescente;
- atendentes por nome.

## 17. Contrato: resumo e análise

### `GET /admin/relatorios/financeiro`

Exemplo:

```text
GET /admin/relatorios/financeiro?inicio=2026-08-01&fim=2026-08-31&cursoId=2&ano=3&voluntarioId=5&analise=cursos
```

Resposta `200 OK`:

```json
{
  "filtros": {
    "inicio": "2026-08-01",
    "fim": "2026-08-31",
    "cursoId": 2,
    "ano": 3,
    "voluntarioId": 5
  },
  "totalVendas": 14,
  "resumo": {
    "uniformes": { "quantidade": 22, "valor": 1230 },
    "armarios": { "quantidade": 9, "valor": 450 },
    "contribuicoes": { "quantidade": 11, "valor": 260 },
    "balancoGeral": 1940
  },
  "evolucao": [
    { "data": "2026-08-01", "valor": 200 },
    { "data": "2026-08-02", "valor": 300 }
  ],
  "analise": {
    "tipo": "cursos",
    "itens": [
      {
        "chave": "2",
        "rotulo": "Desenvolvimento de Sistemas",
        "valor": 835,
        "quantidade": 6,
        "media": 139.17
      }
    ]
  }
}
```

Valores `Decimal` do Prisma devem ser convertidos para `number` antes da resposta.

## 18. Contrato: vendas detalhadas

### `GET /admin/relatorios/vendas`

Exemplo:

```text
GET /admin/relatorios/vendas?inicio=2026-08-01&fim=2026-08-31&busca=ana&pagina=1&limite=10
```

Resposta `200 OK`:

```json
{
  "vendas": [
    {
      "id": 101,
      "dataHora": "2026-08-21T17:32:00.000Z",
      "aluno": {
        "id": 30,
        "nome": "Ana Souza"
      },
      "curso": {
        "id": 2,
        "nome": "Desenvolvimento de Sistemas"
      },
      "ano": 3,
      "atendente": {
        "id": 5,
        "nome": "Carlos Lima"
      },
      "uniformes": [
        {
          "produtoId": 8,
          "nome": "M",
          "quantidade": 2,
          "precoUnitario": 45,
          "subtotal": 90
        }
      ],
      "armario": {
        "produtoId": 20,
        "nome": "Armário",
        "quantidade": 1,
        "precoUnitario": 50,
        "subtotal": 50
      },
      "contribuicao": 20,
      "pagamentos": [
        { "forma": "pix", "valor": 160 }
      ],
      "total": 160,
      "codigoRetirada": "uuid-da-retirada"
    }
  ],
  "pagina": 1,
  "limite": 10,
  "total": 14,
  "totalPaginas": 2
}
```

Quando não houver armário:

```json
"armario": null
```

Quando não houver contribuição:

```json
"contribuicao": 0
```

Os itens, pagamentos e contribuição vêm na própria página. Isso evita criar e
manter uma quinta rota apenas para abrir o modal.

## 19. Contrato: exportação

### `GET /admin/relatorios/exportacao`

Queries adicionais:

| Query | Valores |
|---|---|
| `escopo` | `resumo`, `analise`, `vendas`, `completo` |
| `formato` | `csv`, `xlsx` |
| `analise` | obrigatório quando escopo for `analise` ou `completo` |
| `metrica` | `valor`, `quantidade`, `media` |

Mapeamento chamado pelo frontend:

```text
resumo   -> escopo=resumo&formato=csv
analise  -> escopo=analise&formato=csv
vendas   -> escopo=vendas&formato=csv
completo -> escopo=completo&formato=xlsx
```

Headers da resposta:

```text
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="resumo-financeiro.csv"
```

ou:

```text
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="relatorio-completo.xlsx"
```

O XLSX completo deve possuir três planilhas:

1. `Resumo`;
2. `Analise`;
3. `Vendas`.

Para gerar um arquivo XLSX real, adicionar uma única biblioteca no backend, por
exemplo `exceljs`. Não montar um arquivo com extensão `.xlsx` contendo HTML.

Na geração de CSV, proteger células que começam com `=`, `+`, `-` ou `@`, evitando
que nomes importados sejam interpretados como fórmulas ao abrir a planilha.

## 20. Validator do backend

Criar `ValidatorRelatorios.js` com schemas Zod reutilizando um objeto base de
filtros.

Estrutura recomendada:

```js
const id = z.coerce.number().int().positive();
const dataIso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const filtrosFinanceiros = z.object({
  inicio: dataIso,
  fim: dataIso,
  cursoId: id.optional(),
  ano: z.coerce.number().int().positive().optional(),
  voluntarioId: id.optional(),
});
```

Schemas exportados:

```text
opcoesFiltrosSchema
relatorioFinanceiroSchema
vendasRelatorioSchema
exportacaoRelatorioSchema
```

Validações obrigatórias:

- início e fim devem ser datas existentes;
- `inicio` não pode ser posterior a `fim`;
- página deve ser maior que zero;
- limite deve ficar entre 1 e 100;
- busca deve ter no máximo 100 caracteres;
- análise, métrica, escopo e formato devem pertencer aos enums permitidos;
- a métrica deve ser compatível com a análise;
- exportação completa deve usar XLSX;
- as demais opções do menu usam CSV.

Os erros seguem o middleware `validarRequisicao` já existente:

```json
{
  "message": "Dados da requisição inválidos.",
  "code": "DADOS_INVALIDOS",
  "details": []
}
```

## 21. Service do backend

Criar `RelatorioService.js` com estas operações públicas:

```js
class RelatorioService {
  async listarOpcoesFiltros() {}
  async calcularFinanceiro(filtros, analise) {}
  async listarVendas(filtros, paginacao, busca) {}
  async gerarExportacao(filtros, configuracao) {}
}
```

### 21.1. Helper único de filtros

Criar uma função interna e reutilizá-la em financeiro, vendas e exportação:

```js
const montarWhereCompras = ({
  inicio,
  fim,
  cursoId,
  ano,
  voluntarioId,
  busca,
}) => ({
  dataHoraCompra: {
    gte: obterInicioDia(inicio),
    lt: obterFimExclusivo(fim),
  },
  ...(cursoId && { codCurso: cursoId }),
  ...(ano && { anoAluno: ano }),
  ...(voluntarioId && { codVoluntario: voluntarioId }),
  ...(busca && {
    OR: [
      {
        aluno: {
          nomeAluno: { contains: busca, mode: "insensitive" },
        },
      },
      {
        codigoRetirada: { contains: busca, mode: "insensitive" },
      },
    ],
  }),
});
```

Não duplicar essa lógica em quatro métodos.

### 21.2. Consulta financeira

Para o volume esperado no TCC, a opção mais simples e clara é:

1. buscar as compras filtradas com `select` apenas dos campos necessários;
2. converter `Decimal` para `number`;
3. agregar os dados em funções JavaScript puras;
4. ordenar o resultado;
5. devolver objetos simples.

Não usar SQL bruto para esta primeira versão.

Campos necessários na consulta:

```text
idCompra
valorCompra
dataHoraCompra
anoAluno
curso.idCurso e nomeCurso
voluntario.idVoluntario e nomeVoluntario
itensCompra.quantidadeItem e precoUnitario
itensCompra.produto.idProduto, nomeProduto e tipoProduto
contribuicoes.valorContribuicao
pagamentos.tipoPagamento e valorPagamento
```

Separar funções puras internas:

```text
calcularResumo(compras)
calcularEvolucao(compras)
calcularAnaliseCursos(compras)
calcularAnaliseProdutos(compras)
calcularAnalisePagamentos(compras)
calcularAnaliseAnos(compras)
calcularAnaliseAtendentes(compras)
calcularAnaliseContribuicoes(compras)
```

`calcularFinanceiro` escolhe somente uma função de análise conforme a query.

### 21.3. Listagem paginada

Usar uma transação de leitura para total e página:

```js
const [total, compras] = await prisma.$transaction([
  prisma.compra.count({ where }),
  prisma.compra.findMany({
    where,
    skip: (pagina - 1) * limite,
    take: limite,
    orderBy: [
      { dataHoraCompra: "desc" },
      { idCompra: "desc" },
    ],
    select: compraDetalhadaSelect,
  }),
]);
```

A ordenação por ID desempata vendas realizadas no mesmo instante.

### 21.4. Exportação

A exportação deve chamar as mesmas funções usadas pelas respostas JSON. Não criar
uma segunda fórmula para balanço ou ticket médio.

Fluxo:

```text
filtros validados
  -> consulta do RelatorioService
  -> dados normalizados
  -> serializer CSV ou XLSX
  -> Buffer + nome + contentType
  -> controller envia o arquivo
```

## 22. Controller do backend

`RelatoriosController.js` deve apenas:

1. ler `req.validado.query`;
2. chamar o método do service;
3. responder JSON ou arquivo;
4. não conter regras de soma, filtro ou agrupamento.

Funções:

```text
listarOpcoesFiltros
obterRelatorioFinanceiro
listarVendasRelatorio
exportarRelatorio
```

Exemplo da exportação:

```js
export const exportarRelatorio = async (req, res) => {
  const arquivo = await relatorioService.gerarExportacao(req.validado.query);

  res.setHeader("Content-Type", arquivo.contentType);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${arquivo.nome}"`,
  );

  return res.send(arquivo.buffer);
};
```

## 23. Routes do backend

`backend/src/routes/relatoriosRoutes.js`:

```js
import { Router } from "express";
import * as controller from "../controllers/RelatoriosController.js";
import * as schemas from "../validators/ValidatorRelatorios.js";
import { validarRequisicao } from "../middlewares/validarRequisicao.js";

const router = Router();

router.get(
  "/filtros",
  validarRequisicao(schemas.opcoesFiltrosSchema),
  controller.listarOpcoesFiltros,
);

router.get(
  "/financeiro",
  validarRequisicao(schemas.relatorioFinanceiroSchema),
  controller.obterRelatorioFinanceiro,
);

router.get(
  "/vendas",
  validarRequisicao(schemas.vendasRelatorioSchema),
  controller.listarVendasRelatorio,
);

router.get(
  "/exportacao",
  validarRequisicao(schemas.exportacaoRelatorioSchema),
  controller.exportarRelatorio,
);

export default router;
```

Montagem em `backend/src/app.js`:

```js
import relatoriosRoutes from "./routes/relatoriosRoutes.js";

app.use("/admin/relatorios", relatoriosRoutes);
```

## 24. Autorização

A tela deve ser acessível somente a usuários cuja sessão inclua a permissão
`relatorios`. Administradores e supervisores podem recebê-la; atendentes da APM não
devem ganhar acesso automaticamente.

Frontend:

```jsx
<ReactRouter.Route
  path="relatorios"
  element={
    <RotaProtegida tela="relatorios">
      <RelatoriosPage />
    </RotaProtegida>
  }
/>
```

O backend também deve aplicar o middleware global de autenticação e autorização
administrativa quando ele estiver disponível. Não criar autenticação exclusiva para
Relatórios e não confiar somente na proteção do frontend.

O repositório atual ainda não monta esse middleware nas rotas administrativas. Isso
é uma dependência geral do sistema, não uma responsabilidade que deve ser duplicada
dentro de `RelatorioService`.

## 25. Service do frontend

Criar `frontend/src/features/admin/services/RelatoriosService.js`.

Funções:

```js
export const buscarOpcoesRelatorios = () =>
  requisitarApi("/admin/relatorios/filtros");

export const buscarRelatorioFinanceiro = (filtros, analise) => {
  const params = montarParams(filtros);
  params.set("analise", analise);
  return requisitarApi(`/admin/relatorios/financeiro?${params}`);
};

export const buscarVendasRelatorio = ({
  filtros,
  busca,
  pagina,
  limite = 10,
}) => {
  const params = montarParams(filtros);
  if (busca.trim()) params.set("busca", busca.trim());
  params.set("pagina", String(pagina));
  params.set("limite", String(limite));
  return requisitarApi(`/admin/relatorios/vendas?${params}`);
};
```

Criar uma função interna `montarParams` para não repetir as queries.

### 25.1. Download de arquivos

`requisitarApi` atualmente lê respostas como JSON ou texto. Para arquivos, estender
`frontend/src/services/apiClient.js` com uma função reutilizável
`requisitarArquivo`, mantendo a mesma URL, token e tratamento de erro.

Ela deve devolver:

```js
{
  blob,
  nomeArquivo,
}
```

`RelatoriosService.exportarRelatorio`:

```js
export const exportarRelatorio = ({ filtros, escopo, analise, metrica }) => {
  const params = montarParams(filtros);
  params.set("escopo", escopo);
  params.set("formato", escopo === "completo" ? "xlsx" : "csv");

  if (["analise", "completo"].includes(escopo)) {
    params.set("analise", analise);
    params.set("metrica", metrica);
  }

  return requisitarArquivo(`/admin/relatorios/exportacao?${params}`);
};
```

Depois da resposta:

```js
const url = URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = url;
link.download = nomeArquivo;
link.click();
URL.revokeObjectURL(url);
```

O nome do arquivo deve vir do `Content-Disposition`, com um nome padrão caso o
header não esteja disponível.

## 26. Hooks do frontend

### `useOpcoesRelatorios`

Carrega uma vez:

```text
opcoes
carregando
erro
recarregar
```

### `useRelatorioFinanceiro`

Entrada:

```js
{
  filtros,
  analise,
  ativo,
}
```

Saída:

```text
dados
carregando
erro
recarregar
```

`ativo` é falso somente quando a aba atual é Vendas. Assim, a aba financeira não
precisa buscar novamente enquanto estiver oculta.

### `useVendasRelatorio`

Entrada:

```js
{
  filtros,
  busca,
  pagina,
  limite,
  ativo,
}
```

Saída:

```text
vendas
pagina
limite
total
totalPaginas
carregando
erro
recarregar
```

`ativo` é verdadeiro somente na aba Vendas.

### Padrão dos hooks

Seguir `useCursos`, `useUniformes` e `useArmario`:

- `useState` para dados, carregamento e erro;
- `useCallback` para carregar;
- `useEffect` para executar;
- limpar dados quando houver erro;
- expor `recarregar`;
- não exibir `Alert` dentro do hook.

## 27. Página principal

`relatoriosPage.jsx` deve ser o componente orquestrador.

Responsabilidades:

- manter o estado local;
- calcular `inicio` e `fim` dos atalhos de período;
- chamar os hooks;
- escolher qual aba renderizar;
- abrir e fechar o modal;
- coordenar exportação;
- montar as colunas da `DataTable` quando necessário.

Não deve:

- executar `fetch` diretamente;
- somar compras brutas;
- conhecer nomes de colunas Prisma;
- gerar CSV ou XLSX;
- duplicar componentes globais;
- criar Context.

Estrutura aproximada:

```jsx
const RelatoriosPage = () => {
  // estados locais
  // hooks
  // handlers

  return (
    <section className="space-y-6">
      <IntroducaoEExportacao />
      <FiltrosRelatorios />
      <Abas />

      {abaAtual === "resumo" && <ResumoFinanceiro />}
      {abaAtual === "analises" && <AnalisesFinanceiras />}
      {abaAtual === "vendas" && <VendasRelatorio />}

      <DetalhesVendaModal />
    </section>
  );
};
```

`IntroducaoEExportacao` e `Abas` podem permanecer como marcação pequena dentro da
página. Não precisam virar novos arquivos.

## 28. Estados da interface

### Carregamento

- filtros: desabilitar selects enquanto as opções carregam;
- resumo/análise: mostrar um único painel com “Carregando relatório...”;
- vendas: mostrar “Carregando vendas...” no lugar da tabela;
- exportação: usar `Button loading` e impedir duas exportações simultâneas.

### Erro

Usar `Alert type="error"` com `error.message`. Cada área deve poder ser recarregada
sem atualizar toda a página.

### Sem dados

Resumo:

```text
Não existem vendas no período selecionado.
```

Análise:

```text
Nenhum dado encontrado para esta análise.
```

Vendas:

```text
Nenhuma venda encontrada. Tente ajustar a pesquisa ou os filtros.
```

O valor vazio deve ser `R$ 0,00`, nunca `NaN`.

## 29. Acessibilidade e responsividade

- usar `role="tablist"`, `role="tab"` e `aria-selected` nas abas;
- ligar cada label ao seu campo;
- permitir fechar o menu de exportação com `Escape`;
- usar texto visível no botão Detalhes;
- o gráfico deve possuir `role="img"` e descrição acessível;
- cor não pode ser o único meio de identificar uniformes, armários e contribuições;
- manter foco visível usando os tokens globais;
- em telas estreitas, empilhar os painéis do Resumo;
- permitir rolagem horizontal somente dentro da tabela;
- não criar largura fixa para a página;
- respeitar `prefers-reduced-motion` já definido em `globals.css`.

## 30. Ordem recomendada de implementação

### Etapa 1 — banco e criação da compra

1. adicionar `codCurso` e `anoAluno` a `Compra`;
2. criar a relação reversa em `Curso`;
3. criar os índices;
4. migrar compras existentes;
5. alterar a confirmação da venda e compra avulsa para preencher os campos;
6. verificar a igualdade entre itens + contribuição, pagamentos e total.

### Etapa 2 — backend de relatórios

1. criar validator;
2. criar `RelatorioService` e helper de filtros;
3. implementar resumo;
4. implementar análises;
5. implementar vendas paginadas;
6. implementar opções de filtro;
7. implementar exportações reutilizando os mesmos cálculos;
8. criar controller;
9. criar routes;
10. montar `/admin/relatorios` em `app.js`.

### Etapa 3 — frontend de integração

1. adicionar o Chart do shadcn/ui e a dependência Recharts;
2. estender `apiClient` para arquivos;
3. criar constants;
4. criar `RelatoriosService`;
5. criar os três hooks;
6. criar os sete componentes de domínio;
7. substituir o conteúdo de `relatoriosPage.jsx`;
8. proteger a rota;
9. testar filtros, abas, modal, paginação e exportação.

## 31. Casos de verificação

### Cálculos

- compra somente com uniforme entra em Uniformes;
- compra somente com armário entra em Armários;
- compra somente com contribuição entra em Contribuições;
- compra mista divide corretamente os subtotais;
- pagamento dividido não duplica a venda;
- balanço geral corresponde à soma das três entradas;
- preço histórico usa `ItemCompra.precoUnitario`;
- produto arquivado continua no histórico;
- quantidade vendida usa `quantidadeItem`.

### Filtros

- hoje inclui todas as compras do dia em São Paulo;
- fim do intervalo inclui o dia inteiro;
- filtros de curso, ano e atendente funcionam juntos;
- curso arquivado continua disponível quando possui vendas;
- atendente inativo continua disponível quando possui vendas;
- limpar restaura o mês atual;
- busca encontra por aluno;
- busca encontra por código da retirada;
- paginação preserva os filtros.

### Interface

- somente uma aba aparece por vez;
- somente uma análise aparece por vez;
- a aba Análises não apresenta tabela auxiliar;
- modal apresenta os valores da linha correta;
- aluno sem compra não aparece;
- zero resultados mostra estado vazio;
- erro da API usa `Alert`;
- layout não gera rolagem horizontal na página.

### Exportação

- cada opção do menu respeita os filtros;
- análise exportada corresponde ao tipo e à métrica atuais;
- vendas detalhadas exportam todas as páginas, não somente a página visível;
- relatório completo possui três planilhas;
- valores monetários permanecem numéricos no XLSX;
- nomes potencialmente interpretados como fórmula são protegidos no CSV.

## 32. Critérios de conclusão

A funcionalidade está concluída quando:

- a rota `/admin/relatorios` está protegida;
- o período inicial é o mês atual;
- todos os filtros funcionam em conjunto;
- o Resumo apresenta composição e evolução;
- a aba Análises exibe um relatório por vez;
- a aba Vendas apresenta 10 compras por página;
- o modal apresenta itens, armário, contribuição e pagamentos;
- atendimentos sem venda não aparecem;
- o balanço não duplica contribuições nem pagamentos;
- os quatro escopos de exportação funcionam;
- nenhum dado financeiro é armazenado no frontend;
- não foi criada tabela de relatórios;
- não foi criada Context de relatórios;
- componentes globais existentes foram reutilizados;
- filas e matrículas permanecem fora da tela.

## 33. O que evitar

- não copiar o protótipo em HTML/CSS diretamente para o React;
- não manter dados fictícios na página final;
- não usar `localStorage` como banco de vendas;
- não calcular o mesmo total no frontend e no backend com regras diferentes;
- não criar endpoint para cada gráfico;
- não criar um service para cada análise;
- não criar uma tabela para armazenar relatórios;
- não incluir métricas de fila ou matrícula;
- não colocar todos os gráficos na mesma aba;
- não duplicar `Button`, `Input`, `Select`, `DataTable`, `Modal` ou `Alert`;
- não consultar preço atual do produto para reconstruir venda antiga;
- não usar `quantidadeRetiradaItem` como quantidade vendida;
- não somar pagamentos ao balanço;
- não somar contribuição duas vezes;
- não escolher silenciosamente um curso quando o aluno possui vários vínculos.

## 34. Resumo da arquitetura

```text
RelatoriosPage
  ├─ estado local de filtros, abas e seleção
  ├─ useOpcoesRelatorios
  │    └─ GET /admin/relatorios/filtros
  ├─ useRelatorioFinanceiro
  │    └─ GET /admin/relatorios/financeiro
  ├─ useVendasRelatorio
  │    └─ GET /admin/relatorios/vendas
  └─ RelatoriosService.exportarRelatorio
       └─ GET /admin/relatorios/exportacao

Routes
  -> ValidatorRelatorios
  -> RelatoriosController
  -> RelatorioService
  -> Prisma
       ├─ Compra
       ├─ ItemCompra -> Produto
       ├─ Contribuicao
       ├─ Pagamento
       ├─ Aluno
       ├─ Curso
       └─ Voluntario
```

Essa é toda a estrutura necessária para construir a tela. Qualquer camada adicional
deve ser evitada até existir uma necessidade real no restante do sistema.
