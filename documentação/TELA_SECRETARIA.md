# Tela da Secretaria

## 1. Finalidade

Este documento define o comportamento visual, funcional e técnico da tela da
Secretaria do SIGA Phila.

Rota proposta:

```text
/secretaria
```

Protótipo funcional:

```text
testes/secretaria/index.html
```

Resumo do protótipo:

```text
testes/secretaria/doc.md
```

O protótipo usa dados locais. A implementação final deve usar o backend e o
PostgreSQL como fontes de verdade.

As regras de aluno, produto, estoque, pagamento e autenticação já definidas no
restante do sistema devem ser reutilizadas. Esta tela não deve criar versões
paralelas dessas regras.

## 2. Responsabilidade da tela

A Secretaria possui duas operações principais:

1. retirar uniformes de compras anteriormente confirmadas na APM;
2. registrar uma venda avulsa de uniformes para um aluno.

As duas operações ficam em áreas diferentes da página.

A Secretaria não:

- emite senha;
- atende a fila da APM;
- movimenta a senha entre postos;
- cadastra aluno;
- vende armário no MVP;
- registra contribuição voluntária no MVP;
- executa troca, devolução ou cancelamento pós-venda.

## 3. Acesso isolado

O perfil autorizado é `supervisor`.

O supervisor entra especificamente na área da Secretaria. A tela não apresenta
atalhos nem menu lateral para Triagem, APM ou Documentos.

Para acessar outro posto, o usuário deve:

```text
sair da Secretaria
  -> voltar ao acesso do sistema
  -> entrar no posto desejado
```

O cabeçalho da Secretaria apresenta somente:

- identificação do sistema;
- área atual;
- identificação básica da sessão, conforme o padrão existente;
- botão **Sair**.

O botão **Sair** encerra a sessão atual. Ele não navega diretamente para outro
posto.

## 4. Ausência de responsável específico

Não existe, nesta especificação, um campo de responsável por receber ou retirar
os uniformes.

Também não faz parte da interface solicitar:

- nome de quem recebeu;
- documento de quem recebeu;
- assinatura;
- relação com o aluno;
- responsável específico pela retirada.

O comprovante e o histórico da Secretaria não precisam exibir um campo de
responsável.

A autenticação continua necessária para liberar a tela, mas eventual auditoria
global de sessão pertence à infraestrutura geral do sistema e não cria campos ou
controles adicionais nesta página.

## 5. Escopo do MVP

A primeira versão deve permitir:

- mostrar os totais atuais de pendências;
- listar somente compras com retirada pendente;
- pesquisar compra pelo aluno ou por código;
- filtrar as compras pendentes por curso, período e ano;
- abrir uma compra pendente;
- registrar retirada total;
- registrar retirada parcial;
- reduzir estoque somente pela quantidade entregue;
- retirar a compra da tabela quando não restar saldo;
- pesquisar um aluno em uma área separada para venda avulsa;
- selecionar um aluno para a venda;
- usar o catálogo de uniformes no padrão da APM;
- adicionar, alterar e remover uniformes;
- usar as formas de pagamento da APM;
- registrar compra e retirada avulsa juntas;
- reduzir o estoque da venda avulsa imediatamente;
- imprimir comprovante;
- consultar o histórico.

Não pertencem ao MVP:

- menu de acesso aos outros postos;
- tabela geral de alunos na área de retiradas;
- venda de armário;
- contribuição voluntária;
- identificação de quem recebeu;
- assinatura;
- troca;
- devolução;
- estorno;
- cancelamento depois da confirmação;
- edição de pagamento confirmado;
- exclusão definitiva de compra ou retirada.

## 6. Estrutura geral

A página possui três abas:

1. **Retiradas pendentes**;
2. **Venda avulsa**;
3. **Histórico**.

A aba inicial é **Retiradas pendentes**.

Ordem visual:

```text
Cabeçalho isolado da Secretaria
  -> apresentação da tela
  -> totais gerais de pendências
  -> abas
  -> conteúdo da aba atual
```

## 7. Totais gerais de pendências

Os indicadores superiores representam todas as pendências atuais. Eles não são
limitados ao dia, semana ou mês.

Indicadores:

1. compras pendentes;
2. itens aguardando retirada;
3. alunos distintos com pendência.

### 7.1. Compras pendentes

```text
quantidade de compras com pelo menos um item onde
quantidadeItem > quantidadeRetiradaItem
```

### 7.2. Itens aguardando retirada

```text
soma de (
  quantidadeItem - quantidadeRetiradaItem
)
em todas as compras pendentes
```

### 7.3. Alunos com pendência

```text
quantidade distinta de codAluno
nas compras pendentes
```

Os três indicadores devem usar a mesma fonte da tabela. Depois de confirmar uma
retirada, os totais são atualizados.

## 8. Aba Retiradas pendentes

### 8.1. Conteúdo da tabela

A tabela não lista todos os alunos. Cada linha representa uma **compra** que
possui saldo pendente.

Uma compra aparece quando:

```text
existe ItemCompra onde
quantidadeItem > quantidadeRetiradaItem
```

Uma compra totalmente retirada não aparece nesta tabela.

### 8.2. Colunas

| Coluna | Conteúdo |
|---|---|
| Compra | Código da compra ou do cupom da APM. |
| Aluno | Nome e código do aluno. |
| Curso | Curso atual do aluno. |
| Período / ano | Período e ano escolar. |
| Data da compra | Data e hora da confirmação na APM. |
| Itens pendentes | Soma do saldo dos itens da compra. |
| Situação | Aguardando ou retirada parcial. |
| Ação | `Registrar retirada`. |

Se um aluno possuir duas compras pendentes, ele aparece em duas linhas.

### 8.3. Pesquisa

A pesquisa considera:

- nome do aluno;
- código do aluno;
- código da compra ou cupom.

Não é uma pesquisa para iniciar venda avulsa. A venda possui sua própria busca de
aluno.

### 8.4. Filtros

Filtros:

- curso;
- período;
- ano.

Todos funcionam em conjunto com a pesquisa.

Ao alterar pesquisa ou filtro:

1. voltar para a página 1;
2. solicitar novamente os dados;
3. atualizar a quantidade de resultados;
4. manter os outros filtros selecionados.

### 8.5. Ordenação

Ordenação inicial:

```text
dataHoraCompra crescente
```

Assim, as compras mais antigas aparecem primeiro.

### 8.6. Estado vazio

Quando os filtros não encontrarem resultado:

```text
Nenhuma compra pendente
Tente ajustar os filtros ou aguarde uma nova compra da APM.
```

## 9. Modal de retirada

O modal é aberto a partir de uma compra específica.

O cabeçalho mostra:

- código da compra;
- nome e código do aluno;
- curso;
- período e ano;
- total pendente da compra.

Para cada uniforme, mostrar:

- nome/tamanho;
- quantidade comprada;
- quantidade já retirada;
- saldo pendente;
- estoque atual;
- quantidade entregue agora.

Quantidade máxima selecionável:

```text
min(
  quantidadeItem - quantidadeRetiradaItem,
  quantidadeProduto
)
```

### 9.1. Retirar tudo disponível

O botão **Retirar tudo disponível** seleciona, para cada item, o menor valor
entre saldo pendente e estoque atual.

O texto contém “disponível” porque o sistema não pode selecionar unidades que
não estejam no estoque.

### 9.2. Retirada parcial

Se restar ao menos uma unidade pendente depois da confirmação:

```text
situacaoRetirada = parcial
```

A compra continua na tabela com o novo saldo.

### 9.3. Retirada total

Se todos os itens atingirem:

```text
quantidadeRetiradaItem = quantidadeItem
```

a compra deixa de aparecer na tabela de pendências.

### 9.4. Confirmação

Ao confirmar, o backend deve:

1. validar a sessão e o acesso à Secretaria;
2. validar a compra;
3. validar que os itens pertencem à compra;
4. conferir o saldo atual de cada item;
5. conferir o estoque atual;
6. incrementar `quantidadeRetiradaItem`;
7. reduzir `quantidadeProduto` pela mesma quantidade;
8. registrar o evento de retirada;
9. calcular a situação resultante;
10. confirmar tudo em uma única transação;
11. devolver o comprovante.

Não registrar novo pagamento. O pagamento pertence à compra já realizada na
APM.

## 10. Regras de estoque da retirada

Compra realizada na APM sem entrega:

```text
estoque não reduz
quantidadeRetiradaItem = 0
compra fica pendente
```

Retirada na Secretaria:

```text
quantidadeRetiradaItem += quantidadeEntregueAgora
quantidadeProduto -= quantidadeEntregueAgora
```

O backend deve bloquear:

- quantidade zero ou negativa;
- quantidade acima do saldo pendente;
- quantidade acima do estoque;
- item que não pertence à compra;
- compra já totalmente retirada;
- repetição da mesma confirmação.

O estoque exibido no navegador é apenas informativo. Ele deve ser conferido
novamente dentro da transação.

## 11. Aba Venda avulsa

A venda avulsa não começa na tabela de pendências.

Fluxo:

```text
abrir Venda avulsa
  -> pesquisar aluno
  -> selecionar aluno
  -> montar compra
  -> informar pagamento
  -> confirmar compra e retirada
  -> imprimir comprovante
```

### 11.1. Pesquisa de aluno

A área possui um campo próprio para pesquisar por:

- nome do aluno;
- código do aluno.

O resultado mostra:

- nome;
- código;
- curso;
- período;
- ano.

Selecionar um aluno libera o formulário da compra. O botão **Trocar aluno** limpa
o formulário ainda não confirmado e retorna à pesquisa.

Não listar todos os alunos em uma tabela permanente nessa aba.

### 11.2. Estrutura igual à APM

A compra avulsa deve ser idêntica ou quase idêntica ao formulário de venda já
existente na APM.

Reutilizar principalmente:

```text
frontend/src/components/Vendas/SelectUniformes.jsx
frontend/src/components/Vendas/ListaUniformes.jsx
frontend/src/components/Vendas/FormasPagamento.jsx
```

Estrutura:

1. seletor de uniforme;
2. botão **Adicionar**;
3. tabela de uniformes selecionados;
4. formas de pagamento;
5. resumo da compra;
6. botão **Finalizar compra**.

O seletor mostra:

```text
Nome/tamanho — preço (estoque: quantidade)
```

### 11.3. Diferenças em relação à APM

No MVP da Secretaria:

- não existe armário;
- não existe contribuição voluntária;
- não existe senha atual;
- o aluno vem da pesquisa própria;
- todos os uniformes comprados são retirados imediatamente.

Para cada item da venda avulsa:

```text
quantidadeRetiradaItem = quantidadeItem
```

### 11.4. Uniformes

Exibir somente:

```text
tipoProduto = uniforme
statusItem = ativo
```

Regras:

- quantidade mínima igual a 1;
- quantidade máxima igual ao estoque;
- subtotal igual a preço × quantidade;
- item pode ser removido antes da confirmação;
- produto sem estoque não pode ser adicionado.

### 11.5. Pagamentos

Formas disponíveis, iguais à APM:

```text
pix
dinheiro
debito
credito
```

É permitido usar uma ou mais formas.

Validação:

```text
somaPagamentos = totalCompra
```

Se faltar:

```text
Falta pagar R$ X,XX.
```

Se exceder:

```text
Pagamento excede em R$ X,XX.
```

O botão final permanece desabilitado enquanto a soma não corresponder ao total.

### 11.6. Estoque da venda avulsa

Compra e retirada acontecem juntas:

```text
quantidadeRetiradaItem = quantidadeItem
quantidadeProduto -= quantidadeItem
```

Se o estoque não for suficiente no momento da confirmação, nenhuma parte da
compra deve ser gravada.

### 11.7. Confirmação da venda

O backend deve:

1. validar sessão e acesso;
2. validar aluno;
3. validar uniformes ativos;
4. conferir estoque;
5. recalcular preços e total;
6. validar pagamentos;
7. criar a compra avulsa;
8. criar os itens como totalmente retirados;
9. criar os pagamentos;
10. reduzir estoque;
11. registrar a entrega;
12. gerar o código do comprovante;
13. confirmar tudo na mesma transação.

## 12. Histórico

O histórico reúne:

- compras avulsas realizadas na Secretaria;
- retiradas totais;
- retiradas parciais.

Filtros:

- aluno ou código;
- data ou intervalo;
- situação;
- tipo de operação.

Colunas:

| Coluna | Conteúdo |
|---|---|
| Data e hora | Momento confirmado pelo servidor. |
| Operação | Compra avulsa ou retirada. |
| Aluno | Nome e código. |
| Itens | Quantidade movimentada. |
| Valor | Somente para compra avulsa. |
| Situação | Concluída ou parcial. |
| Ação | Abrir detalhes. |

O detalhe é somente leitura. Não existe campo obrigatório de responsável.

## 13. Comprovante

O comprovante contém:

- sistema e área;
- tipo da operação;
- código da movimentação;
- referência da compra;
- aluno;
- código do aluno;
- curso e ano;
- data e hora;
- itens e quantidades;
- pagamentos e total, somente na venda avulsa;
- situação da retirada.

Não incluir:

- assinatura;
- pessoa que recebeu;
- responsável específico pela retirada.

O registro acontece antes da impressão. Cancelar a impressão não desfaz a
operação.

## 14. Componentes do frontend

Estrutura sugerida:

```text
frontend/src/
├── pages/
│   └── SecretariaPage.jsx
├── components/
│   └── Secretaria/
│       ├── ResumoPendencias.jsx
│       ├── TabelaComprasPendentes.jsx
│       ├── FiltrosComprasPendentes.jsx
│       ├── RetiradaModal.jsx
│       ├── PesquisaAlunoVenda.jsx
│       ├── VendaAvulsa.jsx
│       ├── HistoricoSecretaria.jsx
│       └── ComprovanteSecretaria.jsx
├── hooks/
│   ├── useComprasPendentes.js
│   ├── useRetirada.js
│   ├── useVendaAvulsa.js
│   └── useHistoricoSecretaria.js
└── services/
    └── secretariaService.js
```

`VendaAvulsa.jsx` deve compor os componentes de venda da APM em vez de copiar
todo o formulário.

## 15. Contratos sugeridos da API

### 15.1. Resumo de pendências

```http
GET /secretaria/pendencias/resumo
```

Resposta:

```json
{
  "comprasPendentes": 4,
  "itensPendentes": 7,
  "alunosComPendencia": 3
}
```

Os valores não recebem filtro de data.

### 15.2. Listar compras pendentes

```http
GET /secretaria/pendencias?busca=ana&cursoId=2&periodo=noite&ano=1&page=1&limit=10
```

Resposta:

```json
{
  "compras": [
    {
      "id": 841,
      "codigo": "APM-2026-0841",
      "dataHoraCompra": "2026-08-18T13:34:00.000Z",
      "situacao": "aguardando",
      "quantidadePendente": 3,
      "aluno": {
        "id": 148,
        "codigo": "ALU-2026-0148",
        "nome": "Ana Carolina Souza",
        "curso": "Desenvolvimento de Sistemas",
        "periodo": "noite",
        "ano": 1
      }
    }
  ],
  "paginacao": {
    "pagina": 1,
    "limite": 10,
    "total": 1,
    "totalPaginas": 1
  }
}
```

### 15.3. Detalhar compra pendente

```http
GET /secretaria/pendencias/:compraId
```

Resposta:

```json
{
  "compra": {
    "id": 841,
    "codigo": "APM-2026-0841",
    "dataHoraCompra": "2026-08-18T13:34:00.000Z",
    "aluno": {
      "id": 148,
      "codigo": "ALU-2026-0148",
      "nome": "Ana Carolina Souza",
      "curso": "Desenvolvimento de Sistemas",
      "periodo": "noite",
      "ano": 1
    },
    "itens": [
      {
        "produtoId": 3,
        "nome": "Camiseta M",
        "quantidadeComprada": 2,
        "quantidadeRetirada": 0,
        "quantidadePendente": 2,
        "estoque": 9
      }
    ]
  }
}
```

### 15.4. Registrar retirada

```http
POST /secretaria/compras/:compraId/retiradas
Idempotency-Key: b8ec2235-...
```

Corpo:

```json
{
  "itens": [
    {
      "produtoId": 3,
      "quantidade": 1
    }
  ]
}
```

Resposta:

```json
{
  "retiradaId": 156,
  "codigo": "RET-2026-0156",
  "compraId": 841,
  "situacao": "parcial",
  "saldoPendente": 1,
  "dataHora": "2026-08-22T17:48:00.000Z",
  "itensEntregues": [
    {
      "produtoId": 3,
      "nome": "Camiseta M",
      "quantidade": 1
    }
  ]
}
```

### 15.5. Pesquisar aluno para venda

```http
GET /secretaria/alunos?busca=ana&limit=6
```

Retornar somente os dados necessários para identificar e selecionar o aluno.

### 15.6. Catálogo da venda

Reutilizar, quando adequado, o catálogo já usado pela APM:

```http
GET /apm/catalogo-venda
```

A Secretaria filtra somente os uniformes. Armário e contribuição não aparecem.

### 15.7. Criar venda avulsa

```http
POST /secretaria/compras-avulsas
Idempotency-Key: 7bf7d2d0-...
```

Corpo:

```json
{
  "alunoId": 148,
  "itens": [
    {
      "produtoId": 3,
      "quantidade": 2
    }
  ],
  "pagamentos": [
    {
      "tipo": "pix",
      "valorCentavos": 8400
    }
  ]
}
```

### 15.8. Histórico

```http
GET /secretaria/historico?busca=ana&dataInicio=2026-08-01&dataFim=2026-08-22&tipo=retirada&situacao=parcial&page=1&limit=10
```

Ordenar por data e hora decrescente.

## 16. Modelo de dados

### 16.1. Origem da compra

Para diferenciar venda da APM e venda avulsa:

```prisma
enum OrigemCompra {
  apm
  secretaria
}

model Compra {
  // campos existentes
  origemCompra OrigemCompra @default(apm)
}
```

### 16.2. Eventos de retirada

O acumulado em `ItemCompra.quantidadeRetiradaItem` não informa quando cada
retirada parcial aconteceu. Para suportar histórico e comprovante:

```prisma
model Retirada {
  idRetirada       Int      @id @default(autoincrement())
  codCompra        Int
  dataHoraRetirada DateTime @default(now())
  codigoRetirada   String   @unique @db.VarChar(100)

  compra Compra         @relation(fields: [codCompra], references: [idCompra])
  itens  ItemRetirada[]
}

model ItemRetirada {
  codRetirada Int
  codProduto  Int
  quantidade  Int

  retirada Retirada @relation(fields: [codRetirada], references: [idRetirada])
  produto  Produto  @relation(fields: [codProduto], references: [idProduto])

  @@id([codRetirada, codProduto])
}
```

Não adicionar campo obrigatório de pessoa responsável pela retirada.

### 16.3. Código do aluno

Como a pesquisa aceita código, o aluno precisa de identificador público estável:

```prisma
codigoAluno String @unique @db.VarChar(30)
```

Não usar CPF como código.

## 17. Transações e idempotência

Venda avulsa e retirada devem ser transacionais.

Cada confirmação aceita chave de idempotência para impedir que duplo clique,
reenvio ou falha de conexão cause:

- compra duplicada;
- retirada duplicada;
- pagamento duplicado;
- baixa duplicada de estoque.

Durante o envio:

- desabilitar o botão;
- manter os dados visíveis;
- mostrar processamento;
- fechar somente depois da resposta.

## 18. Estados de erro

### Estoque alterado

```text
O estoque mudou durante o atendimento. Confira as quantidades disponíveis antes
de tentar novamente.
```

Nenhuma parte da operação deve ser gravada.

### Compra atualizada em outro atendimento

```text
Esta compra já foi atualizada. A lista de pendências foi recarregada.
```

### Aluno não encontrado

```text
Nenhum aluno encontrado.
```

Não abrir cadastro manual a partir desta tela.

### Falha de impressão

Cancelar ou falhar a impressão não desfaz a operação. O comprovante pode ser
consultado novamente pelo histórico.

## 19. Acessibilidade

A implementação deve garantir:

- foco visível;
- navegação por teclado;
- linhas de compra acionáveis por `Enter` e espaço;
- rótulos nos filtros e campos;
- nome acessível nos botões de quantidade;
- situação descrita por texto;
- modal com `role="dialog"` e `aria-modal="true"`;
- foco inicial e devolução do foco;
- fechamento por `Esc` fora do processamento;
- região `aria-live` para mensagens;
- tabela com cabeçalhos semânticos;
- comprovante legível em impressão monocromática.

## 20. Responsividade

### Desktop

- indicadores em três colunas;
- tabela completa;
- venda em duas colunas;
- resumo fixo à direita.

### Tablet

- filtros em duas colunas;
- tabela com rolagem horizontal;
- resumo abaixo do formulário.

### Celular

- cabeçalho compacto;
- indicadores empilhados;
- filtros empilhados;
- modal de retirada em tela cheia;
- seletor e botão Adicionar empilhados;
- pagamentos em uma coluna.

## 21. Casos de teste

### Acesso

- supervisor entra na Secretaria;
- tela não mostra menu para outros postos;
- botão Sair encerra a sessão;
- usuário precisa iniciar outra sessão para entrar em um posto.

### Totais

- totais consideram todas as pendências;
- totais não mudam ao trocar a data do histórico;
- retirada parcial atualiza itens pendentes;
- retirada total atualiza compras e alunos pendentes.

### Tabela de pendências

- não listar aluno sem compra pendente;
- listar duas linhas para duas compras do mesmo aluno;
- pesquisar nome;
- pesquisar código do aluno;
- pesquisar código da compra;
- combinar curso, período e ano;
- ordenar compras antigas primeiro;
- remover compra totalmente retirada.

### Retirada

- respeitar saldo pendente;
- respeitar estoque;
- selecionar tudo disponível;
- registrar retirada parcial;
- registrar retirada total;
- impedir quantidade zero;
- impedir duplicidade;
- imprimir comprovante sem responsável.

### Venda avulsa

- pesquisar aluno em área separada;
- selecionar e trocar aluno;
- usar seletor de uniforme no padrão da APM;
- adicionar produto;
- alterar quantidade;
- mostrar quantidade retirada igual à comprada;
- dividir pagamento;
- bloquear pagamento faltante;
- bloquear pagamento excedente;
- reduzir estoque uma vez;
- imprimir comprovante.

### Histórico

- filtrar por aluno;
- filtrar por data;
- filtrar por situação;
- filtrar por operação;
- abrir detalhe sem campo de responsável.

## 22. Critérios de aceite

A tela estará pronta quando:

- não houver menu de navegação entre postos;
- o supervisor precisar sair para acessar outro posto;
- os indicadores mostrarem pendências totais;
- a tabela listar somente compras pendentes;
- cada linha representar uma compra;
- a venda avulsa possuir pesquisa de aluno própria;
- o formulário de venda reutilizar o padrão da APM;
- retirada parcial permanecer na tabela;
- retirada total desaparecer da tabela;
- o estoque reduzir somente no momento da entrega;
- a venda avulsa reduzir estoque imediatamente;
- pagamentos seguirem as mesmas regras da APM;
- comprovante e histórico não exigirem responsável;
- armário e contribuição não aparecerem no MVP;
- operações críticas forem transacionais e idempotentes.

## 23. Fluxos resumidos

### Retirada

```text
Supervisor entra na Secretaria
  -> vê os totais gerais
  -> pesquisa ou filtra compras pendentes
  -> seleciona uma compra
  -> informa itens entregues
  -> confirma retirada
  -> estoque reduz
  -> compra continua parcial ou sai da lista
  -> sistema mostra comprovante
```

### Venda avulsa

```text
Supervisor abre Venda avulsa
  -> pesquisa aluno por nome ou código
  -> seleciona aluno
  -> seleciona uniforme como na APM
  -> adiciona e ajusta quantidades
  -> informa pagamentos
  -> confirma compra
  -> compra e retirada são registradas juntas
  -> estoque reduz
  -> sistema mostra comprovante
```

### Troca de área

```text
Supervisor está na Secretaria
  -> clica em Sair
  -> sessão atual termina
  -> entra novamente no posto desejado
```
