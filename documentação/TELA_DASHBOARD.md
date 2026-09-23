# Tela de Dashboard administrativo

## 1. Finalidade deste documento

Este documento é o guia de implementação da tela administrativa de Dashboard do
SIGA Phila. Ele define o escopo, o comportamento do período de matrícula ativo,
as regras financeiras, as alterações mínimas no banco de dados, o contrato da
API, os arquivos do frontend e do backend, os componentes, os estados da
interface e a ordem recomendada de construção.

Rota da tela:

```text
/admin/dashboard
```

Protótipo visual de referência:

```text
testes/dashboard/index.html
```

O protótipo usa dados fictícios apenas para demonstrar a composição da tela. A
implementação final deve obter todos os valores do backend e do PostgreSQL.

Este documento complementa `TELA_RELATORIOS.md`. O Dashboard é a visão rápida do
período ativo; Relatórios continua sendo a área de consulta histórica, filtros,
análises, vendas detalhadas e exportações.

## 2. Escopo definitivo

O Dashboard deve apresentar uma visão gerencial e financeira do período de
matrícula ativo. A tela é destinada à leitura rápida e não deve exigir que o
administrador configure filtros para entender a situação atual.

A primeira versão deve apresentar:

- identificação do período de matrícula ativo;
- data inicial, data final, situação e progresso do período;
- total arrecadado no período;
- quantidade de vendas realizadas;
- ticket médio das vendas;
- quantidade e valor dos uniformes vendidos;
- quantidade e valor dos armários vendidos;
- quantidade e valor das contribuições recebidas;
- evolução semanal da arrecadação;
- composição do total entre uniformes, armários e contribuições;
- resumo das formas de pagamento;
- alertas de estoque baixo;
- quantidade de itens vendidos e ainda não retirados;
- data e hora da última atualização;
- ação para ocultar ou exibir valores financeiros;
- ação para atualizar os dados manualmente.

Não pertencem à primeira versão:

- filtros por data, curso, ano ou atendente;
- seleção de períodos anteriores dentro do Dashboard;
- tabela de vendas individuais;
- exportação de dados;
- rankings detalhados;
- quantidade de pessoas nas filas;
- senhas aguardando em cada posto;
- tempo médio de espera ou atendimento;
- controles de chamada de senha;
- cadastro ou edição do período dentro do Dashboard;
- previsão financeira baseada em inteligência artificial;
- cancelamentos ou estornos sem uma regra geral já definida no sistema;
- armazenamento de totais pré-calculados em uma nova tabela.

Períodos anteriores, filtros e detalhamento financeiro pertencem à tela de
Relatórios. A gestão das filas pertence à tela de Filas. A criação, ativação e
encerramento de períodos deve pertencer futuramente à tela de Configurações.

## 3. Princípio da interface

O Dashboard deve responder rapidamente a três perguntas:

1. Qual período de matrícula está ativo?
2. Quanto foi arrecadado e qual foi a origem desse valor?
3. Existe alguma situação que exige atenção agora?

A tela não funciona como relatório. Portanto:

- não possui painel de filtros;
- não possui abas;
- não possui paginação;
- não apresenta tabelas grandes;
- não permite alterar dados financeiros;
- não tenta concentrar todos os módulos do sistema.

O conteúdo deve ser apresentado em ordem de importância:

```text
Período ativo
  -> Total arrecadado
  -> Quatro indicadores principais
  -> Evolução e composição
  -> Formas de pagamento e pontos de atenção
```

## 4. Período de matrícula

### 4.1. Regra principal

O Dashboard mostra sempre o período marcado como ativo no sistema. Não deve
enviar data inicial ou final na requisição e não deve permitir que o usuário
escolha outro período nessa tela.

```text
Dashboard -> período ativo
Relatórios -> qualquer intervalo ou período histórico
Configurações -> criação, ativação e encerramento de períodos
```

Somente um período pode estar ativo por vez.

### 4.2. Nome da entidade

O schema atual já possui o enum `Periodo`, utilizado para manhã, tarde, noite,
integral e on-line. Para evitar conflito de significado, a nova entidade deve se
chamar `CicloMatricula`.

Não renomear o enum existente dentro desta tarefa.

### 4.3. Vínculo mínimo

Para limitar a complexidade, a primeira versão relaciona `CicloMatricula` somente
com `Compra`.

```text
CicloMatricula
  └─ Compra
       ├─ ItemCompra -> Produto
       ├─ Pagamento
       └─ Contribuicao
```

`Pagamento`, `ItemCompra` e `Contribuicao` não precisam receber outro campo de
período, pois já pertencem a uma compra.

`Senha`, `HistoricoSenha`, `Aluno` e `CursoAluno` não devem ser alterados para
construir este Dashboard. Caso o sistema precise futuramente de estatísticas de
atendimento por ciclo, essa extensão deve ser tratada como uma funcionalidade
separada.

### 4.4. Período anterior

Quando houver comparação, o período anterior é o ciclo encerrado com a maior
`dataFim` anterior à `dataInicio` do ciclo atual.

Não usar simplesmente `idCiclo - 1`, porque IDs não representam necessariamente
a ordem cronológica.

Se não houver período anterior, a interface deve omitir a comparação. Não mostrar
`0%` como se existisse uma base válida.

## 5. Fluxo da tela

### 5.1. Entrada no Dashboard

Ao abrir `/admin/dashboard`:

1. o frontend solicita o resumo completo ao backend;
2. o backend localiza o ciclo ativo;
3. o backend consulta somente as compras relacionadas a esse ciclo;
4. o backend calcula todos os indicadores com uma única regra financeira;
5. o frontend apresenta o período, os indicadores, os gráficos e os alertas;
6. o horário de sincronização é atualizado após a resposta bem-sucedida.

O frontend não deve carregar separadamente vendas, produtos, contribuições e
pagamentos para depois combinar os dados no navegador.

### 5.2. Atualização manual

O botão **Atualizar dados** deve:

1. manter o conteúdo anterior visível;
2. indicar carregamento somente no próprio botão;
3. executar novamente a mesma requisição;
4. substituir os dados somente quando a resposta for válida;
5. atualizar o horário da sincronização;
6. impedir solicitações simultâneas pelo mesmo botão.

Não é necessário criar atualização automática a cada poucos segundos. Os dados do
Dashboard não possuem a urgência operacional das filas.

### 5.3. Ocultar valores

O botão **Ocultar valores** é uma preferência visual local. Ele deve esconder:

- total arrecadado;
- ticket médio;
- valor arrecadado com uniformes;
- valor arrecadado com armários;
- valor das contribuições;
- valores da composição;
- valores das formas de pagamento.

Quantidades podem permanecer visíveis.

Ocultar valores não altera a resposta da API e não oferece proteção de acesso. A
autorização continua sendo responsabilidade da sessão e do backend.

Na primeira versão, essa preferência pode permanecer somente no estado do
componente. Não é necessário salvá-la no banco.

### 5.4. Acesso aos detalhes

Links como **Ver relatório** ou uma ação em um alerta devem apenas navegar para a
tela responsável:

```text
Ver relatório financeiro -> /admin/relatorios
Estoque baixo             -> /admin/produtos
Itens aguardando retirada -> área de produtos/retiradas quando existir
```

O Dashboard não deve abrir tabelas completas em modais.

## 6. Estrutura visual

### 6.1. Cabeçalho da página

O título e o ícone já são fornecidos por:

- `frontend/src/features/admin/layout/adminHeader.jsx`;
- `frontend/src/features/admin/constants/adminNavigation.js`.

A página não deve repetir outro `<h1>Dashboard</h1>`. O conteúdo pode apresentar
uma introdução curta:

```text
Resumo do período de matrículas
Acompanhe os principais resultados da APM sem precisar configurar filtros.
```

À direita ficam, quando houver espaço:

- **Ocultar valores**;
- **Atualizar dados**.

### 6.2. Identificação do período ativo

O primeiro painel informa:

- nome do ciclo;
- situação **Em andamento**;
- data inicial e final;
- progresso percentual;
- dias restantes.

Exemplo:

```text
PERÍODO ATIVO · EM ANDAMENTO
Matrículas — 2º semestre de 2026
15 de julho a 30 de agosto de 2026
63% concluído · 9 dias restantes
```

O progresso é informativo. Ele não representa quantidade de matrículas nem meta
financeira.

### 6.3. Total arrecadado

O total arrecadado deve receber maior destaque do que os demais números.

Conteúdo:

- rótulo **Total arrecadado no período**;
- valor;
- texto secundário **Produtos e contribuições recebidos**;
- comparação com o ciclo anterior, somente quando disponível.

### 6.4. Quatro indicadores principais

| Indicador | Valor principal | Informação secundária |
|---|---|---|
| Vendas realizadas | quantidade de compras | ticket médio |
| Uniformes vendidos | unidades vendidas | valor arrecadado |
| Armários vendidos | unidades vendidas | valor arrecadado |
| Contribuições | valor contribuído | quantidade de contribuições |

Os cards devem possuir a mesma hierarquia visual, mas podem usar cores de apoio
diferentes. Cor não pode ser a única forma de identificar o conteúdo.

### 6.5. Evolução da arrecadação

O gráfico mostra o total arrecadado em cada semana do ciclo atual. Quando houver
ciclo anterior, ele pode aparecer como uma segunda série neutra.

O eixo horizontal usa a posição relativa dentro do ciclo:

```text
Semana 1, Semana 2, Semana 3...
```

Essa abordagem permite comparar ciclos que ocorreram em meses diferentes.

O gráfico deve reutilizar o componente **Chart do shadcn/ui**, baseado em
Recharts, previsto em `TELA_RELATORIOS.md`. Não criar uma segunda base de gráficos
exclusiva para o Dashboard.

### 6.6. Composição do total

O painel apresenta a participação de:

- uniformes;
- armários;
- contribuições.

Cada item deve exibir percentual e valor. A soma dos percentuais pode sofrer uma
diferença visual de arredondamento, mas os valores monetários devem corresponder ao
total calculado pelo backend.

Quando o total for zero, nenhum percentual deve resultar em `NaN`. Nesse caso, os
três percentuais são `0%`.

### 6.7. Formas de pagamento

O painel resume como o total foi recebido.

Na primeira versão, o backend devolve separadamente:

- Pix;
- dinheiro;
- débito;
- crédito.

O frontend pode agrupar débito e crédito sob o rótulo **Cartões** apenas na
apresentação resumida. A tela de Relatórios mantém o detalhamento individual.

### 6.8. Pontos de atenção

O painel não é um centro de notificações. Ele mostra somente contagens resumidas:

- produtos ativos com estoque menor ou igual ao limite configurado;
- unidades compradas e ainda não retiradas;
- quantidade atual de armários disponíveis.

Não calcular estimativa de dias de estoque na primeira versão. Essa previsão exige
uma regra adicional sobre ritmo de vendas e pode produzir uma precisão enganosa.

## 7. Regras financeiras

As regras desta seção devem ser iguais às definidas em
`TELA_RELATORIOS.md`. Dashboard e Relatórios não podem calcular o mesmo conceito
de maneiras diferentes.

### 7.1. Uniformes

```text
quantidadeUniformes = soma(ItemCompra.quantidadeItem)
                      onde Produto.tipoProduto = "uniforme"

valorUniformes = soma(ItemCompra.precoUnitario × ItemCompra.quantidadeItem)
                  onde Produto.tipoProduto = "uniforme"
```

Usar o preço histórico de `ItemCompra`, não o preço atual de `Produto`.

### 7.2. Armários

```text
quantidadeArmarios = soma(ItemCompra.quantidadeItem)
                    onde Produto.tipoProduto = "armario"

valorArmarios = soma(ItemCompra.precoUnitario × ItemCompra.quantidadeItem)
                onde Produto.tipoProduto = "armario"
```

### 7.3. Contribuições

```text
quantidadeContribuicoes = quantidade de registros de Contribuicao
                          com valorContribuicao > 0

valorContribuicoes = soma(Contribuicao.valorContribuicao)
```

### 7.4. Total arrecadado

```text
totalArrecadado = valorUniformes
                + valorArmarios
                + valorContribuicoes
```

`Compra.valorCompra` deve representar o mesmo total e pode ser usado como fonte do
total geral, desde que não seja somado novamente aos itens e contribuições.

```text
ERRADO:
Compra.valorCompra + itens + contribuicoes + pagamentos

CORRETO:
itens + contribuicoes

OU:
soma(Compra.valorCompra)
```

### 7.5. Vendas e ticket médio

```text
totalVendas = quantidade de Compra no ciclo ativo

ticketMedio = totalArrecadado / totalVendas
```

Quando `totalVendas` for zero, `ticketMedio` deve ser `0`, nunca `NaN` ou
`Infinity`.

Uma compra que utiliza mais de uma forma de pagamento continua sendo uma única
venda.

### 7.6. Formas de pagamento

```text
valorPorForma = soma(Pagamento.valorPagamento agrupado por tipoPagamento)
```

As formas de pagamento explicam o total. Elas não são adicionadas ao total
arrecadado.

O backend deve verificar durante testes:

```text
soma dos pagamentos do ciclo = soma de Compra.valorCompra do ciclo
```

### 7.7. Quantidade vendida e retirada

Indicadores de vendas usam `quantidadeItem`.

Pendência de retirada usa:

```text
itensPendentes = soma(
  ItemCompra.quantidadeItem - ItemCompra.quantidadeRetiradaItem
)
```

Considerar somente diferenças maiores que zero.

### 7.8. Compras históricas

Uma compra continua pertencendo ao seu ciclo mesmo que posteriormente:

- o produto seja arquivado;
- o armário fique indisponível;
- o aluno seja arquivado;
- o curso seja arquivado;
- o voluntário fique inativo;
- outro ciclo seja ativado.

Ativar um novo ciclo não pode mover compras antigas.

### 7.9. Cancelamentos e estornos

O schema atual não possui situação de compra cancelada ou estornada. Enquanto uma
regra geral não for criada, toda compra persistida é considerada confirmada.

Não criar uma regra de cancelamento exclusivamente no Dashboard.

## 8. Cálculo do progresso do período

O backend devolve as datas do ciclo. O frontend pode calcular a apresentação, mas
deve usar a data local em `America/Sao_Paulo`.

```text
duracaoTotal = dataFim - dataInicio
tempoDecorrido = hoje - dataInicio
progresso = tempoDecorrido / duracaoTotal × 100
```

Regras:

- limitar o resultado entre `0` e `100`;
- considerar as datas completas, sem depender do horário UTC do navegador;
- se início e fim forem o mesmo dia, apresentar `100%` durante esse dia;
- depois da data final, um ciclo ainda marcado como ativo apresenta `100%` e um
  alerta administrativo pode ser registrado no futuro;
- dias restantes nunca podem ser negativos.

## 9. Comparação com o ciclo anterior

### 9.1. Variação do total

```text
variacaoPercentual =
  ((totalAtual - totalAnterior) / totalAnterior) × 100
```

Regras:

- valor positivo usa texto **acima do período anterior**;
- valor negativo usa texto **abaixo do período anterior**;
- zero usa texto **mesmo resultado do período anterior**;
- se o total anterior for zero ou não existir, `variacaoPercentual` é `null` e a
  comparação não aparece.

### 9.2. Comparação semanal

Semanas devem ser comparadas pela ordem relativa dentro de cada ciclo, não pela
data do calendário:

```text
Semana 1 atual    <-> Semana 1 anterior
Semana 2 atual    <-> Semana 2 anterior
```

Se o ciclo atual ainda estiver em andamento, não comparar semanas futuras.

## 10. Alertas

### 10.1. Estoque baixo

Para a primeira versão, criar uma constante no backend:

```js
const LIMITE_ESTOQUE_BAIXO = 5;
```

Um produto entra no alerta quando:

```text
tipoProduto = "uniforme"
statusItem != "arquivado"
quantidadeProduto <= LIMITE_ESTOQUE_BAIXO
```

O limite não deve ficar duplicado no frontend. Se no futuro cada produto possuir
um limite próprio, essa regra poderá virar um campo de `Produto`.

### 10.2. Retiradas pendentes

Uma unidade está pendente quando foi vendida, mas ainda não foi retirada:

```text
quantidadeItem > quantidadeRetiradaItem
```

O alerta do Dashboard mostra a soma das unidades, não a quantidade de compras.

### 10.3. Armários disponíveis

Usar o produto ativo cujo `tipoProduto` é `armario`. O valor apresentado é
`quantidadeProduto`.

Se a configuração de armário não existir, devolver `null` para diferenciar
**não configurado** de estoque igual a zero.

## 11. Alterações mínimas no banco de dados

### 11.1. Nova entidade

Adicionar:

```prisma
model CicloMatricula {
  idCiclo       Int      @id @default(autoincrement())
  nomeCiclo     String   @db.VarChar(100)
  dataInicio    DateTime @db.Date
  dataFim       DateTime @db.Date
  ativo         Boolean  @default(false)
  criadoEm      DateTime @default(now())
  atualizadoEm  DateTime @updatedAt

  compras Compra[]

  @@index([ativo])
  @@index([dataFim])
}
```

Validações de domínio:

- `nomeCiclo` não pode ficar vazio;
- `dataInicio` não pode ser posterior a `dataFim`;
- somente um ciclo pode estar ativo;
- um ciclo com compras não pode ser excluído definitivamente;
- encerrar um ciclo não remove nem altera suas compras.

### 11.2. Alteração de `Compra`

Adicionar o vínculo:

```prisma
model Compra {
  idCompra       Int      @id @default(autoincrement())
  codCiclo       Int
  codVoluntario  Int
  codAluno       Int
  valorCompra    Decimal  @db.Decimal(6, 2)
  dataHoraCompra DateTime
  codigoRetirada String   @db.VarChar(100)

  cicloMatricula CicloMatricula @relation(
    fields: [codCiclo],
    references: [idCiclo]
  )

  // relações atuais

  @@index([codCiclo, dataHoraCompra])
}
```

O índice atende a consulta principal do Dashboard e também poderá ser reutilizado
pelos relatórios históricos por ciclo.

### 11.3. Um único ciclo ativo

O service que ativa um ciclo deve executar uma transação:

```js
await prisma.$transaction(async (tx) => {
  await tx.cicloMatricula.updateMany({
    where: { ativo: true },
    data: { ativo: false },
  });

  await tx.cicloMatricula.update({
    where: { idCiclo: cicloId },
    data: { ativo: true },
  });
});
```

Para proteção adicional contra ativações simultâneas, a migration PostgreSQL pode
criar um índice único parcial:

```sql
CREATE UNIQUE INDEX "CicloMatricula_um_ativo"
ON "CicloMatricula" ("ativo")
WHERE "ativo" = true;
```

Esse índice parcial precisa ser mantido manualmente na migration porque não é
representado diretamente pelo schema Prisma atual.

### 11.4. Criação de uma compra

Ao confirmar uma venda, o backend deve localizar o ciclo ativo dentro da mesma
operação de negócio:

```js
const cicloAtivo = await tx.cicloMatricula.findFirst({
  where: { ativo: true },
  select: { idCiclo: true },
});
```

Se não existir ciclo ativo, a compra não deve ser criada:

```json
{
  "message": "Não existe um período de matrícula ativo.",
  "code": "CICLO_MATRICULA_INATIVO"
}
```

O frontend não envia `codCiclo`. O servidor escolhe o ciclo ativo para impedir
associação arbitrária ou acidental.

### 11.5. Migração de dados existentes

Se já houver compras:

1. criar `CicloMatricula`;
2. criar um ciclo chamado **Período anterior à implantação**;
3. usar a menor e a maior `dataHoraCompra` como datas desse ciclo;
4. adicionar `codCiclo` temporariamente como opcional;
5. relacionar todas as compras existentes ao ciclo criado;
6. tornar `codCiclo` obrigatório;
7. criar o índice composto;
8. criar e ativar o ciclo atual somente após revisar as datas.

Não associar silenciosamente compras antigas ao ciclo atual.

### 11.6. O que não deve ser alterado

- não adicionar ciclo a `Pagamento`;
- não adicionar ciclo a `ItemCompra`;
- não adicionar ciclo a `Contribuicao`;
- não adicionar ciclo a `Senha` nesta tarefa;
- não criar tabela `Dashboard`;
- não salvar cards ou gráficos no banco;
- não salvar totais financeiros duplicados;
- não alterar o enum `Periodo` usado pelos turnos dos cursos;
- não mover compras ao ativar outro ciclo.

## 12. Gestão dos ciclos

A tela de Dashboard apenas lê o ciclo ativo. A manutenção completa deve ser
implementada em Configurações, em uma tarefa própria.

Operações necessárias futuramente:

```text
GET   /admin/ciclos-matricula
POST  /admin/ciclos-matricula
PATCH /admin/ciclos-matricula/:cicloId
PATCH /admin/ciclos-matricula/:cicloId/ativacao
```

Até a tela de Configurações existir, o primeiro ciclo pode ser criado pela
migration ou por um seed controlado. Não criar dados de período fixos no frontend.

## 13. Estrutura de arquivos

### 13.1. Estado atual

| Item | Estado atual | Ação durante a implementação |
|---|---|---|
| rota React `/admin/dashboard` | existe em `App.jsx` | manter e proteger |
| item Dashboard na sidebar | existe em `adminNavigation.js` | nenhuma alteração |
| título e ícone no header | derivados da navegação | nenhuma alteração |
| `dashboardPage.jsx` | possui somente `<h1>Dashboard</h1>` | substituir pelo orquestrador |
| componentes UI globais | existem | reutilizar |
| base compartilhada de gráficos | prevista em Relatórios | reutilizar ou adicionar uma única vez |
| models financeiros Prisma | existem | adicionar ciclo somente em `Compra` |
| tabela de ciclos | não existe | criar `CicloMatricula` |
| backend do Dashboard | não existe | criar route, controller e service |
| tabela Dashboard | não existe | não criar |

### 13.2. Frontend

```text
frontend/src/features/admin/
├─ pages/
│  └─ dashboardPage.jsx                 existente; substituir conteúdo
├─ components/
│  └─ dashboard/
│     ├─ PeriodoAtivoCard.jsx
│     ├─ TotalArrecadadoCard.jsx
│     ├─ IndicadoresDashboard.jsx
│     ├─ GraficoArrecadacaoPeriodo.jsx
│     ├─ ComposicaoArrecadacao.jsx
│     ├─ FormasPagamentoResumo.jsx
│     └─ AlertasDashboard.jsx
├─ hooks/
│  └─ useDashboard.js
└─ services/
   └─ DashboardService.js
```

Não criar um componente separado para cada card pequeno. `IndicadoresDashboard`
pode receber uma lista de indicadores e desenhar os quatro itens.

### 13.3. Backend

```text
backend/src/
├─ routes/
│  └─ dashboardRoutes.js
├─ controllers/
│  └─ DashboardController.js
└─ services/
   └─ DashboardService.js
```

Não é necessário criar `ValidatorDashboard.js` enquanto a rota não possuir params,
query ou body.

`DashboardService` consulta e agrega diferentes models. Ele não deve estender
`BaseService`.

## 14. Componentes existentes que devem ser reutilizados

| Componente/função | Arquivo atual | Uso no Dashboard |
|---|---|---|
| `Button` | `components/ui/button.jsx` | atualizar e atalhos |
| `Alert` | `components/ui/Alert.jsx` | erro de carregamento |
| `formatarMoeda` | `utils/formatters.js` | valores monetários |
| `requisitarApi` | `services/apiClient.js` | consulta do resumo |
| `ApiError` | `services/apiClient.js` | erros padronizados |
| `AdminLayout` | `features/admin/layout/adminLayout.jsx` | estrutura da rota |
| `AdminHeader` | `features/admin/layout/adminHeader.jsx` | título e perfil |
| `AuthContext` | `context/authContext.jsx` | sessão e nome do usuário |
| `RotaProtegida` | `components/routing/RotaProtegida.jsx` | controle de acesso |
| `Chart` | `components/ui/chart.jsx` quando criado | gráficos do Dashboard |

Ícones devem vir de `react-icons`, já instalado. Não adicionar outra biblioteca
apenas para os ícones desta página.

## 15. Responsabilidade dos componentes novos

### `PeriodoAtivoCard.jsx`

Recebe:

```js
{
  periodo,
  progresso,
  diasRestantes,
}
```

Não busca dados e não ativa períodos.

### `TotalArrecadadoCard.jsx`

Recebe:

```js
{
  total,
  comparacao,
  valoresOcultos,
}
```

Não recalcula o total a partir dos cards.

### `IndicadoresDashboard.jsx`

Recebe o resumo já normalizado e apresenta exatamente quatro indicadores. Não
executa chamadas HTTP.

### `GraficoArrecadacaoPeriodo.jsx`

Recebe as séries atual e anterior. Converte os pontos apenas para a estrutura do
Chart; não consulta compras nem agrupa datas.

### `ComposicaoArrecadacao.jsx`

Recebe valores e percentuais calculados pelo backend. Deve possuir uma descrição
textual acessível além do gráfico.

### `FormasPagamentoResumo.jsx`

Apresenta valor, percentual e quantidade por forma. Pode agrupar cartões apenas na
camada visual.

### `AlertasDashboard.jsx`

Apresenta contagens e links para as telas responsáveis. Não altera estoque e não
conclui retiradas.

## 16. Contextos e estado

### 16.1. Não criar `DashboardContext`

Os dados são usados por uma única página e podem ser carregados por um hook local.
Criar Context aumentaria o acoplamento sem fornecer reutilização real.

### 16.2. Estado local da página

Estados previstos:

```text
valoresOcultos
atualizando
```

Os dados, carregamento inicial e erro pertencem a `useDashboard`.

### 16.3. Local storage

Nunca salvar respostas financeiras ou totais no `localStorage`.

Se futuramente for desejado, somente a preferência `valoresOcultos` poderá ser
persistida. Isso não faz parte da primeira versão.

## 17. Rota da API

A primeira versão precisa de uma única rota:

```text
GET /admin/dashboard
```

Não criar um endpoint separado para cada card ou gráfico. Todos os dados pertencem
ao mesmo ciclo e à mesma visualização.

A rota não recebe filtros nem identificador de ciclo.

## 18. Contrato do Dashboard

### `GET /admin/dashboard`

Resposta `200 OK`:

```json
{
  "periodo": {
    "id": 2,
    "nome": "Matrículas — 2º semestre de 2026",
    "dataInicio": "2026-07-15",
    "dataFim": "2026-08-30",
    "ativo": true
  },
  "resumo": {
    "totalArrecadado": 18420,
    "totalVendas": 286,
    "ticketMedio": 64.41,
    "uniformes": {
      "quantidade": 214,
      "valor": 11920,
      "percentual": 64.71
    },
    "armarios": {
      "quantidade": 78,
      "valor": 4680,
      "percentual": 25.41
    },
    "contribuicoes": {
      "quantidade": 96,
      "valor": 1820,
      "percentual": 9.88
    }
  },
  "comparacao": {
    "periodoAnterior": {
      "id": 1,
      "nome": "Matrículas — 1º semestre de 2026"
    },
    "totalAnterior": 16388,
    "variacaoPercentual": 12.4
  },
  "evolucao": {
    "atual": [
      { "semana": 1, "inicio": "2026-07-15", "fim": "2026-07-21", "valor": 2650 },
      { "semana": 2, "inicio": "2026-07-22", "fim": "2026-07-28", "valor": 4380 }
    ],
    "anterior": [
      { "semana": 1, "valor": 2300 },
      { "semana": 2, "valor": 3920 }
    ]
  },
  "pagamentos": [
    { "forma": "pix", "quantidade": 168, "valor": 9420, "percentual": 51.14 },
    { "forma": "debito", "quantidade": 54, "valor": 3510, "percentual": 19.06 },
    { "forma": "credito", "quantidade": 37, "valor": 3220, "percentual": 17.48 },
    { "forma": "dinheiro", "quantidade": 34, "valor": 2270, "percentual": 12.32 }
  ],
  "alertas": {
    "produtosEstoqueBaixo": {
      "quantidade": 3,
      "itens": ["Camiseta P", "Moletom M", "Camiseta GG"]
    },
    "unidadesAguardandoRetirada": 12,
    "armariosDisponiveis": 22
  },
  "geradoEm": "2026-08-22T19:42:00.000Z"
}
```

Valores `Decimal` do Prisma devem ser convertidos para `number` antes da resposta.

### 18.1. Sem ciclo ativo

A ausência de ciclo ativo é um estado possível da interface, não uma falha de
conexão. Resposta `200 OK`:

```json
{
  "periodo": null,
  "resumo": null,
  "comparacao": null,
  "evolucao": null,
  "pagamentos": [],
  "alertas": null,
  "geradoEm": "2026-08-22T19:42:00.000Z"
}
```

Mensagem da tela:

```text
Nenhum período de matrícula está ativo.
Ative um período nas configurações para visualizar o Dashboard.
```

### 18.2. Primeiro ciclo

Quando existir ciclo ativo, mas não existir ciclo anterior:

```json
"comparacao": null
```

O restante do Dashboard continua funcionando.

## 19. Service do backend

Criar `DashboardService.js` com uma única operação pública:

```js
class DashboardService {
  async obterResumo() {}
}
```

Responsabilidades internas:

```text
buscarCicloAtivo()
buscarCicloAnterior(cicloAtual)
buscarComprasDoCiclo(cicloId)
calcularResumo(compras)
calcularEvolucao(compras, ciclo)
calcularPagamentos(compras)
buscarAlertas()
montarComparacao(atual, anterior)
```

Para o volume esperado no TCC, a implementação mais simples é:

1. buscar as compras do ciclo com `select` apenas dos campos necessários;
2. converter `Decimal` para `number`;
3. realizar agregações em funções JavaScript puras;
4. consultar os alertas de estoque separadamente;
5. devolver um objeto simples.

Não usar SQL bruto na primeira versão.

Campos financeiros necessários:

```text
Compra.idCompra
Compra.valorCompra
Compra.dataHoraCompra
ItemCompra.quantidadeItem
ItemCompra.quantidadeRetiradaItem
ItemCompra.precoUnitario
Produto.nomeProduto
Produto.tipoProduto
Contribuicao.valorContribuicao
Pagamento.tipoPagamento
Pagamento.valorPagamento
```

As funções de cálculo financeiro devem ser compartilhadas com
`RelatorioService` ou extraídas para um utilitário de domínio comum quando a tela
de Relatórios for implementada. Não copiar fórmulas e deixá-las divergir.

## 20. Controller do backend

`DashboardController.js` deve apenas:

1. chamar `dashboardService.obterResumo()`;
2. responder com JSON;
3. não conter consultas Prisma;
4. não calcular totais, percentuais ou semanas.

```js
export const obterDashboard = async (_req, res) => {
  const dados = await dashboardService.obterResumo();
  return res.json(dados);
};
```

## 21. Routes do backend

`backend/src/routes/dashboardRoutes.js`:

```js
import { Router } from "express";
import * as dashboardController from "../controllers/DashboardController.js";

const router = Router();

router.get("/", dashboardController.obterDashboard);

export default router;
```

Montagem em `backend/src/app.js`:

```js
import dashboardRoutes from "./routes/dashboardRoutes.js";

app.use("/admin/dashboard", dashboardRoutes);
```

## 22. Autorização

O Dashboard deve ser acessível somente a usuários cuja sessão inclua a permissão
`dashboard` ou a permissão administrativa geral definida pelo sistema.

Frontend:

```jsx
<ReactRouter.Route
  path="dashboard"
  element={
    <RotaProtegida tela="dashboard">
      <DashboardPage />
    </RotaProtegida>
  }
/>
```

O backend também deve aplicar autenticação e autorização quando os middlewares
administrativos globais estiverem disponíveis. Não confiar somente na proteção do
React.

## 23. Service do frontend

Criar `frontend/src/features/admin/services/DashboardService.js`:

```js
import { requisitarApi } from "../../../services/apiClient";

export const buscarDashboard = () =>
  requisitarApi("/admin/dashboard");
```

O service não recebe filtros e não calcula períodos.

## 24. Hook do frontend

Criar `useDashboard.js` seguindo o padrão de `useCursos`, `useUniformes` e
`useArmario`.

Saída:

```text
dados
carregando
atualizando
erro
recarregar
```

Comportamento:

- carregamento inicial usa `carregando`;
- atualização manual preserva `dados` e usa `atualizando`;
- erro inicial apresenta um painel de falha;
- erro durante atualização manual preserva os dados anteriores e apresenta um
  `Alert`;
- `recarregar` não permite duas requisições manuais simultâneas;
- desmontar a página impede atualização de estado após a resposta.

Não implementar intervalo de atualização automática na primeira versão.

## 25. Página principal

`dashboardPage.jsx` deve ser o componente orquestrador.

Responsabilidades:

- chamar `useDashboard`;
- manter `valoresOcultos`;
- calcular apenas progresso visual e dias restantes;
- distribuir os dados aos componentes;
- coordenar atualização manual;
- oferecer navegação para Relatórios e Produtos;
- escolher estados de carregamento, erro e ausência de ciclo.

Não deve:

- executar `fetch` diretamente;
- consultar várias APIs para formar o resumo;
- somar itens, pagamentos ou contribuições;
- conhecer nomes de colunas Prisma;
- permitir selecionar período;
- guardar dados financeiros em Context;
- copiar HTML e CSS do protótipo literalmente.

Estrutura aproximada:

```jsx
const DashboardPage = () => {
  const { dados, carregando, atualizando, erro, recarregar } = useDashboard();
  const [valoresOcultos, setValoresOcultos] = React.useState(false);

  if (carregando) return <DashboardSkeleton />;
  if (erro && !dados) return <ErroDashboard />;
  if (!dados?.periodo) return <SemPeriodoAtivo />;

  return (
    <section className="space-y-6">
      <IntroducaoDashboard />
      <PeriodoAtivoCard />
      <TotalArrecadadoCard />
      <IndicadoresDashboard />

      <div className="grid gap-6 xl:grid-cols-2">
        <GraficoArrecadacaoPeriodo />
        <ComposicaoArrecadacao />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <FormasPagamentoResumo />
        <AlertasDashboard />
      </div>
    </section>
  );
};
```

`DashboardSkeleton`, `ErroDashboard`, `SemPeriodoAtivo` e
`IntroducaoDashboard` podem ser marcações pequenas dentro da página. Não precisam
virar arquivos próprios.

## 26. Estados da interface

### 26.1. Carregamento inicial

Exibir uma estrutura neutra com as mesmas regiões principais. Não mostrar valores
fictícios enquanto a API carrega.

Texto acessível:

```text
Carregando resumo do período...
```

### 26.2. Atualização manual

Manter os dados visíveis, colocar o botão em loading e informar:

```text
Atualizando dados...
```

### 26.3. Erro inicial

Usar `Alert type="error"` e oferecer **Tentar novamente**.

```text
Não foi possível carregar o Dashboard.
```

### 26.4. Erro de atualização

Preservar a última resposta válida e mostrar:

```text
Não foi possível atualizar os dados. As informações anteriores continuam visíveis.
```

### 26.5. Sem ciclo ativo

Não mostrar cards zerados como se existisse um período válido. Exibir estado vazio
com link futuro para Configurações.

### 26.6. Ciclo sem vendas

Quando o ciclo existe, mas não possui compras:

- total arrecadado: `R$ 0,00`;
- vendas: `0`;
- ticket médio: `R$ 0,00`;
- quantidades: `0`;
- percentuais: `0%`;
- gráfico: estado vazio;
- formas de pagamento: estado vazio;
- alertas continuam sendo exibidos, pois dependem do estoque atual.

Mensagem do gráfico:

```text
Ainda não existem vendas neste período.
```

## 27. Acessibilidade e responsividade

- usar headings em ordem lógica;
- usar `aria-live="polite"` para informar atualização concluída;
- o botão de ocultar valores deve usar `aria-pressed`;
- valores ocultos não devem permanecer disponíveis apenas visualmente;
- gráficos devem possuir `role="img"` e descrição textual;
- cor não pode ser o único identificador das categorias;
- tooltips de gráficos devem ser acessíveis por teclado quando a biblioteca
  permitir;
- manter foco visível com os tokens globais;
- em telas médias, usar dois indicadores por linha;
- em telas pequenas, empilhar período, total, indicadores e painéis;
- não criar rolagem horizontal na página;
- a sidebar móvel segue a responsabilidade de `AdminLayout`;
- respeitar `prefers-reduced-motion` definido em `globals.css`;
- valores monetários devem usar `formatarMoeda`;
- datas devem usar `Intl.DateTimeFormat("pt-BR")`.

## 28. Desempenho

A rota retorna uma única resposta. Para o volume esperado no TCC, não é necessário
cache persistente nem tabela de agregados.

Boas práticas:

- selecionar apenas os campos necessários;
- filtrar compras por `codCiclo` no banco;
- usar o índice `[codCiclo, dataHoraCompra]`;
- evitar consultas por compra dentro de loops;
- carregar relações financeiras com um único `findMany` adequado;
- consultar alertas em paralelo quando não dependerem das compras;
- não recalcular o Dashboard no frontend.

Se o volume crescer no futuro, medir a rota antes de introduzir cache.

## 29. Ordem recomendada de implementação

### Etapa 1 — ciclo de matrícula

1. adicionar `CicloMatricula` ao schema;
2. criar a migration;
3. adicionar `codCiclo` temporariamente opcional a `Compra`;
4. criar o ciclo para dados anteriores;
5. migrar compras existentes;
6. tornar o vínculo obrigatório;
7. criar os índices;
8. criar ou ativar o ciclo atual de forma controlada.

### Etapa 2 — criação da compra

1. localizar o ciclo ativo no backend;
2. impedir compra sem ciclo ativo;
3. preencher `codCiclo` no servidor;
4. manter a criação da compra e seus relacionamentos na mesma transação;
5. testar troca de ciclo sem alteração de compras antigas.

### Etapa 3 — backend do Dashboard

1. criar `DashboardService`;
2. implementar resumo financeiro;
3. implementar evolução semanal;
4. implementar comparação com o ciclo anterior;
5. implementar formas de pagamento;
6. implementar alertas;
7. criar controller;
8. criar routes;
9. montar `/admin/dashboard` em `app.js`;
10. proteger a rota.

### Etapa 4 — frontend

1. criar `DashboardService`;
2. criar `useDashboard`;
3. criar os componentes de domínio;
4. reutilizar a base de Chart compartilhada;
5. substituir o placeholder de `dashboardPage.jsx`;
6. implementar ocultação de valores;
7. implementar atualização manual;
8. implementar estados de carregamento, erro e ausência de ciclo;
9. validar responsividade e acessibilidade.

### Etapa 5 — gestão dos ciclos

Em tarefa separada:

1. documentar a área de períodos em Configurações;
2. criar validators e regras de ativação;
3. criar CRUD administrativo;
4. substituir o seed manual por gerenciamento na interface.

## 30. Casos de verificação

### 30.1. Ciclos

- Dashboard usa somente o ciclo ativo;
- primeiro ciclo funciona sem comparação;
- ativar novo ciclo não move compras antigas;
- compra nova recebe automaticamente o ciclo ativo;
- frontend não consegue escolher `codCiclo`;
- compra sem ciclo ativo é rejeitada;
- nenhum ciclo ativo apresenta estado vazio;
- não é possível manter dois ciclos ativos;
- período anterior é escolhido pela data final, não pelo ID.

### 30.2. Cálculos

- compra apenas com uniforme entra somente em Uniformes;
- compra apenas com armário entra somente em Armários;
- compra apenas com contribuição entra somente em Contribuições;
- compra mista divide corretamente os valores;
- total corresponde à soma das três origens;
- pagamento dividido não duplica a venda;
- ticket médio divide pelo número de compras;
- ciclo sem compras não produz `NaN`;
- preço histórico vem de `ItemCompra.precoUnitario`;
- quantidade vendida usa `quantidadeItem`;
- retirada pendente usa a diferença entre vendido e retirado;
- produto arquivado continua no histórico financeiro;
- soma das formas de pagamento corresponde ao total recebido.

### 30.3. Comparação e gráfico

- variação positiva aparece como acima;
- variação negativa aparece como abaixo;
- período anterior com total zero omite percentual;
- semanas são agrupadas a partir da data inicial do ciclo;
- semanas futuras não aparecem;
- séries com quantidades diferentes de semanas continuam válidas;
- ciclo sem vendas mostra estado vazio.

### 30.4. Alertas

- uniforme com cinco unidades entra no alerta;
- uniforme com seis unidades não entra;
- produto arquivado não entra;
- itens totalmente retirados não entram na pendência;
- diferença de várias unidades é somada corretamente;
- armário não configurado devolve `null`;
- estoque zero é diferente de armário não configurado.

### 30.5. Interface

- página não apresenta filtros;
- período ativo fica visível antes dos gráficos;
- total arrecadado possui maior destaque;
- existem exatamente quatro indicadores principais;
- ocultar valores esconde todos os valores monetários;
- quantidades continuam visíveis;
- atualizar preserva os dados anteriores;
- erro inicial permite nova tentativa;
- layout não gera rolagem horizontal;
- atalhos navegam para a tela responsável;
- nenhuma métrica de fila aparece.

## 31. Critérios de conclusão

A funcionalidade está concluída quando:

- existe uma entidade `CicloMatricula`;
- cada compra pertence obrigatoriamente a um ciclo;
- somente o backend escolhe o ciclo de uma nova compra;
- somente um ciclo fica ativo;
- a rota `/admin/dashboard` está protegida;
- o Dashboard não possui filtros;
- a API devolve todos os dados em uma única resposta;
- o total não duplica pagamentos nem contribuições;
- os quatro indicadores seguem este documento;
- evolução, composição e pagamentos usam dados reais;
- alertas não alteram estoque;
- ausência de ciclo e ausência de vendas possuem estados diferentes;
- a tela permite ocultar valores;
- a atualização manual funciona sem apagar o conteúdo anterior;
- nenhum dado financeiro fica salvo no frontend;
- não foi criada tabela de Dashboard;
- não foi criado `DashboardContext`;
- filas e senhas permaneceram fora desta implementação;
- componentes globais existentes foram reutilizados.

## 32. O que evitar

- não copiar o protótipo HTML/CSS diretamente para o React;
- não manter números fictícios na página final;
- não adicionar filtros ao Dashboard;
- não permitir selecionar período na tela;
- não consultar todo o histórico e filtrar no navegador;
- não criar uma requisição para cada card;
- não somar formas de pagamento ao total arrecadado;
- não somar `Compra.valorCompra` novamente aos itens;
- não usar o preço atual de `Produto` em vendas históricas;
- não usar `quantidadeRetiradaItem` como quantidade vendida;
- não vincular ciclo a todas as tabelas sem necessidade;
- não mover compras quando um novo ciclo for ativado;
- não criar tabela para armazenar gráficos ou totais;
- não duplicar as fórmulas de `RelatorioService`;
- não adicionar atualização automática agressiva;
- não transformar alertas em ações de alteração de estoque;
- não incluir métricas de fila apenas para preencher espaço;
- não exibir comparação quando não existir base válida;
- não mostrar `NaN`, `Infinity` ou percentuais inválidos;
- não duplicar componentes globais ou bibliotecas de gráfico.

## 33. Resumo da arquitetura

```text
DashboardPage
  ├─ estado local: valoresOcultos
  └─ useDashboard
       └─ DashboardService.buscarDashboard
            └─ GET /admin/dashboard

DashboardRoutes
  -> autenticação/autorização administrativa
  -> DashboardController
  -> DashboardService
       ├─ CicloMatricula ativo
       ├─ CicloMatricula anterior
       ├─ Compra
       │    ├─ ItemCompra -> Produto
       │    ├─ Contribuicao
       │    └─ Pagamento
       └─ Produto para alertas de estoque
```

O vínculo do ciclo permanece concentrado em `Compra`. Essa decisão entrega a
separação financeira por períodos de matrícula sem expandir a mudança para filas,
senhas, alunos ou históricos de atendimento antes de existir uma necessidade real.
