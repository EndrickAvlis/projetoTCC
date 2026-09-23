# Definições funcionais do sistema

Este arquivo é a referência funcional compartilhada do projeto. Deve ser consultado
antes de criar ou alterar funcionalidades, inclusive em outras conversas.

## Como usar este documento

- Decisões apresentadas como definitivas não devem ser alteradas sem autorização.
- Rotas, nomes de controllers e services listados como sugestão devem ser confirmados
  antes da implementação de cada funcionalidade.
- Funcionalidades administrativas devem usar o prefixo `/admin`.
- Não devem ser criadas novas tabelas sem uma decisão explícita. A modelagem existente
  no schema Prisma deve ser respeitada.
- Este documento registra requisitos; sua inclusão não autoriza implementar todas as
  funcionalidades de uma só vez.

## 1. Autenticação e usuários

- Fazer login e logout.
- Consultar o usuário autenticado.
- Manter sessão persistente com JWT.
- Validar permissão em cada requisição.
- Cadastrar, listar, pesquisar por nome e consultar voluntários.
- Editar nome, perfil e funcionalidades permitidas.
- Desativar e reativar voluntário.
- Administrador pode redefinir a senha de qualquer voluntário.
- Administrador pode cadastrar supervisores e atendentes.
- Supervisor pode cadastrar somente atendentes.
- Atendente acessa apenas o posto vinculado à sessão.
- O número do guichê é informado durante o login.

Decisão definitiva: o guichê não será uma tabela. Ele será um dado temporário da
sessão ou do voluntário autenticado e poderá mudar a cada login.

## 2. Cursos e ofertas

- Criar, listar, pesquisar e consultar cursos.
- Editar o nome do curso.
- Arquivar e restaurar curso.
- Adicionar, remover e editar período/oferta.
- Definir quantidade de vagas dos períodos.
- Ativar e encerrar matrículas de um período.
- Listar períodos de cada curso.
- Exibir quantidade de matrículas realizadas por curso no dia.
- Impedir períodos duplicados para o mesmo curso.
- Impedir alterações incompatíveis em cursos arquivados.

Decisão definitiva: curso utilizado pelo sistema não será apagado definitivamente;
ele será arquivado.

## 3. Alunos e matrículas

- Adicionar, listar e consultar alunos.
- Pesquisar aluno somente por nome.
- Editar o nome do aluno.
- Vincular aluno a um curso.
- Editar curso, período e ano da matrícula.
- Adicionar mais de um curso ao aluno, quando permitido.
- Remover vínculo do aluno com um curso.
- Arquivar e reativar aluno.
- Vincular o aluno à senha durante a Triagem.
- Exibir automaticamente na APM e em Docs: nome, classificação quando houver,
  direito à escolaridade pública, curso, ano, cidade e sexo. Esses dados virão
  do arquivo CSV enviado pelo administrador.
- Permitir que atendentes da APM e de Docs editem nome e curso.

Decisão definitiva: não haverá CPF nem pesquisa por CPF. O aluno possuirá um
identificador próprio, como `idAluno`.

## 4. Emissão de senhas

- Emitir senha pelo sistema.
- Registrar data e hora da emissão.
- Gerar um único código sequencial para todas as senhas.
- Reiniciar a sequência automaticamente ao final do dia.
- Permitir reinício manual pelo administrador.
- Imprimir a senha em impressora térmica.
- Consultar os detalhes da senha.

## 5. Fila e chamadas

- Listar senhas e quantidade de senhas aguardando por posto.
- Chamar automaticamente a próxima senha.
- Chamar manualmente uma senha selecionada.
- Respeitar a ordem de emissão na chamada automática.
- Permitir que o atendente selecione qualquer senha da fila.
- Rechamar a senha atual.
- Impedir que um guichê chame outra senha enquanto possui atendimento ativo.
- Impedir que dois atendentes chamem a mesma senha.
- Registrar posto, guichê, voluntário e horário da chamada em `HistoricoSenha`.
- Listar chamadas realizadas no dia.
- Atualizar o painel de TV.
- Alterar a prioridade depois que a senha for chamada.
- Remover a prioridade pressionando novamente o mesmo botão.
- A prioridade será uma identificação visual; quando acionada, a senha será
  chamada primeiro.
- Permitir colocar uma senha como pendente na Triagem quando faltarem documentos.

Documentos que podem ser obrigatórios:

- RG/CIN;
- CPF/CIN;
- foto;
- comprovação de escolaridade pública;
- histórico do Ensino Médio.

A chamada automática e a selecionada usarão a mesma rota. Sem `senhaId`, o
backend chama a senha mais antiga:

```json
{}
```

Com `senhaId`, chama a senha escolhida:

```json
{
  "senhaId": 15
}
```

## 6. Cancelamento de senha

- Somente administrador pode cancelar senha.
- Registrar a data do cancelamento como data de finalização da senha.
- Manter a senha e seu histórico no banco.
- Impedir chamada ou atendimento de senha cancelada.

Decisão definitiva: não haverá exclusão definitiva de senha.

## 7. Atendimento e histórico

- Registrar um histórico para cada posto pelo qual a senha passar.
- Vincular o histórico à senha e ao voluntário.
- Registrar posto/etapa, guichê e horário da chamada.
- Iniciar atendimento e registrar seu horário de início.
- Finalizar atendimento e registrar seu horário de término.
- Avançar a senha da Triagem para APM.
- Avançar a senha da APM para Documentos.
- Finalizar a senha em Documentos.
- Consultar o histórico completo da senha.
- Avaliar o cálculo de tempo de espera, tempo de atendimento, TME e TMA por
  posto e geral.

Deve existir um histórico para cada passagem:

```text
Senha 15 — Triagem
Senha 15 — APM
Senha 15 — Documentos
```

Campos de horário atualmente considerados:

```text
dataHoraInicioHistorico DateTime?
dataHoraFimHistorico    DateTime
```

Ainda deve ser avaliada a dificuldade e a necessidade de um horário específico
de chamada. Como alternativa inicial, poderá ser calculado o tempo total entre
emissão e finalização da senha e o tempo de atendimento de cada posto.

## 8. Uniformes e estoque

- Cadastrar uniforme com tamanho, preço e quantidade inicial.
- Listar, pesquisar e editar uniformes.
- Arquivar e reativar uniforme.
- Adicionar, diminuir ou corrigir a quantidade em estoque.
- Consultar estoque.
- Bloquear venda com estoque insuficiente.
- Reduzir estoque somente para itens retirados.
- Consultar itens com retirada pendente.

Decisão definitiva: o nome de cada uniforme já é seu tamanho. Existem somente
camisetas, sem variações como moletom.

O status do uniforme representa sua situação administrativa e aceita somente
`ativo` ou `arquivado`. Uniformes arquivados não devem aparecer no catálogo de
venda da APM, mas continuam preservados no banco e podem ser reativados.

## 9. Armários

- Cadastrar quantidade disponível.
- Definir e alterar preço.
- Atualizar quantidade.
- Ativar e desativar venda de armários.
- Adicionar armário à compra.
- Bloquear venda sem quantidade suficiente.
- Reduzir a quantidade após a confirmação.

Poderão ser adicionadas novas características futuramente, como a escolha do bloco.

Decisão definitiva para o escopo atual: o armário permanece como o único registro
de `Produto` cujo `tipoProduto` é `armario`. Não haverá tabela nem conjunto de rotas
separado para armários. Seu status não representa arquivamento: aceita somente
`disponivel` ou `indisponivel` e determina se o armário aparece para venda na APM.
O backend deve impedir a existência de mais de um produto do tipo `armario`.

## 10. Compras e contribuições

- Criar compra durante o atendimento da APM.
- Criar compra avulsa pela Secretaria.
- Adicionar, alterar e remover uniformes e armários.
- Informar quantidade retirada.
- Registrar contribuição com valor livre.
- Remover ou alterar contribuição antes da confirmação.
- Calcular subtotais de uniformes e armários e o total da compra.
- Confirmar compra.
- Cancelar compra antes da confirmação.
- Finalizar atendimento sem venda.
- Consultar compras e compras de um aluno.

Não haverá valores sugeridos para contribuição. Uma passagem sem item e sem
contribuição deve finalizar o histórico como atendimento sem venda; não deve
criar compra financeira de valor zero. Quando um aluno pesquisado não possuir
compras, a interface exibirá “sem compras”.

## 11. Pagamentos

- Registrar dinheiro, Pix, crédito e débito.
- Permitir uma ou mais formas de pagamento.
- Informar o valor de cada forma.
- Mostrar quanto falta pagar.
- Validar se a soma corresponde exatamente ao total.
- Impedir confirmação com valor faltante ou excedente.
- Consultar pagamentos registrados.

O sistema não preencherá automaticamente outra forma de pagamento. Ele apenas
mostrará, por exemplo: `Falta pagar: R$ 25,00`.

## 12. Cupons e retiradas

- Gerar código UUID para o cupom após confirmar a compra.
- Exibir aluno, curso, itens retirados e itens pendentes.
- Imprimir cupom.
- Pesquisar cupom por código e pelo nome do aluno.
- Listar cupons pendentes e consultar seus detalhes.
- Marcar item individual ou todos os itens como retirados.
- Registrar data da retirada.
- Finalizar cupom.
- Impedir retirada duplicada.

Pendente de confirmação: necessidade de adicionar `dataHoraRetirada`.

## 13. Relatórios

- Exibir totais vendidos em uniformes e armários.
- Exibir total de contribuições e balanço geral.
- Filtrar por curso, ano, atendente, dia, semana, mês ou intervalo personalizado.
- Exibir quantidade de senhas aguardando por posto.
- Listar chamadas do dia.
- Exibir quantidade de matrículas por curso no dia.
- Exportar CSV e Excel.

## 14. Painel de TV

- Exibir senha chamada, posto e guichê.
- Exibir últimas chamadas e horário atual.
- Atualizar em tempo real.
- Emitir som de alerta.
- Reproduzir mensagem de voz opcional.

## Proposta inicial de rotas, controllers e services

Os nomes abaixo são uma proposta a ser adaptada ao código existente. Antes de
começar uma funcionalidade nova ou editar uma existente, confirmar se ela será
implementada desta forma. A regra definitiva do prefixo `/admin` prevalece para
operações administrativas.

### Autenticação — `/auth`

| Método e rota | Controller | Service | Função |
|---|---|---|---|
| `POST /auth/login` | `login` | `autenticarUsuario` | Autentica, valida perfil e registra posto/guichê da sessão |
| `GET /auth/me` | `consultarSessao` | `buscarUsuarioAutenticado` | Retorna usuário e permissões |
| `POST /auth/logout` | `logout` | `encerrarSessao` | Encerra a sessão |

Corpo proposto para login:

```json
{
  "usuario": "endrick",
  "senha": "senha-digitada",
  "posto": "triagem",
  "guiche": 2
}
```

### Voluntários — `/voluntarios`

| Método e rota | Controller | Service | Função |
|---|---|---|---|
| `POST /voluntarios` | `criarVoluntario` | `cadastrarVoluntario` | Cadastra supervisor ou atendente conforme a permissão |
| `GET /voluntarios` | `listarVoluntarios` | `buscarVoluntarios` | Lista e filtra por nome e status |
| `GET /voluntarios/:id` | `consultarVoluntario` | `buscarVoluntarioPorId` | Retorna dados do voluntário |
| `PATCH /voluntarios/:id` | `editarVoluntario` | `atualizarVoluntario` | Edita nome, perfil e funcionalidades |
| `PATCH /voluntarios/:id/status` | `alterarStatusVoluntario` | `definirStatusVoluntario` | Desativa ou reativa |
| `PATCH /voluntarios/:id/senha` | `redefinirSenha` | `redefinirSenhaVoluntario` | Administrador redefine a senha |

### Cursos — `/cursos`

| Método e rota | Controller | Service | Função |
|---|---|---|---|
| `POST /cursos` | `criarCurso` | `cadastrarCurso` | Cria curso |
| `GET /cursos` | `listarCursos` | `buscarCursos` | Lista por nome e arquivamento |
| `GET /cursos/:id` | `consultarCurso` | `buscarCursoPorId` | Retorna curso e ofertas |
| `PATCH /cursos/:id` | `editarCurso` | `atualizarCurso` | Altera nome |
| `PATCH /cursos/:id/arquivamento` | `alterarArquivamentoCurso` | `definirArquivamentoCurso` | Arquiva ou restaura |

### Ofertas/períodos — `/cursos/:cursoId/ofertas` e `/ofertas`

| Método e rota | Controller | Service | Função |
|---|---|---|---|
| `POST /cursos/:cursoId/ofertas` | `criarOferta` | `adicionarOfertaCurso` | Adiciona período, ano e vagas |
| `GET /cursos/:cursoId/ofertas` | `listarOfertas` | `buscarOfertasCurso` | Lista ofertas do curso |
| `PATCH /ofertas/:id` | `editarOferta` | `atualizarOferta` | Edita período, ano e vagas |
| `PATCH /ofertas/:id/matriculas` | `alterarMatriculaOferta` | `definirMatriculaAtiva` | Abre ou encerra matrículas |
| `DELETE /ofertas/:id` | `removerOferta` | `excluirOferta` | Remove somente se não houver vínculos |

### Alunos — `/alunos`

| Método e rota | Controller | Service | Função |
|---|---|---|---|
| `POST /alunos` | `criarAluno` | `cadastrarAluno` | Cadastra aluno |
| `GET /alunos` | `listarAlunos` | `buscarAlunos` | Lista e pesquisa somente por nome |
| `GET /alunos/:id` | `consultarAluno` | `buscarAlunoPorId` | Retorna aluno e matrículas |
| `PATCH /alunos/:id` | `editarAluno` | `atualizarAluno` | Edita nome |
| `PATCH /alunos/:id/status` | `alterarStatusAluno` | `definirStatusAluno` | Arquiva ou reativa |
| `POST /alunos/:id/matriculas` | `adicionarMatricula` | `vincularAlunoOferta` | Vincula uma oferta |
| `PATCH /matriculas/:id` | `editarMatricula` | `atualizarMatricula` | Altera curso, período ou ano |
| `DELETE /matriculas/:id` | `removerMatricula` | `desvincularAlunoOferta` | Remove vínculo com oferta |

Pesquisa por nome: `GET /alunos?nome=maria`.

### Senhas — `/senhas`

| Método e rota | Controller | Service | Função |
|---|---|---|---|
| `POST /senhas` | `emitirSenha` | `criarSenha` | Emite senha comum com a próxima sequência |
| `GET /senhas/:id` | `consultarSenha` | `buscarSenhaPorId` | Retorna detalhes e históricos |
| `PATCH /senhas/:id/prioridade` | `alterarPrioridadeSenha` | `atualizarPrioridadeSenha` | Ativa ou remove prioridade |
| `PATCH /senhas/:id/cancelamento` | `cancelarSenha` | `cancelarSenhaPorId` | Administrador cancela a senha |
| `POST /senhas/sequencia/reinicio` | `reiniciarSequencia` | `reiniciarSequenciaSenhas` | Administrador reinicia a numeração |

Corpo proposto para prioridade:

```json
{
  "tipoSenha": true
}
```

Corpo proposto para cancelamento:

```json
{
  "motivo": "Senha emitida incorretamente"
}
```

### Fila e chamadas — `/filas`

| Método e rota | Controller | Service | Função |
|---|---|---|---|
| `GET /filas` | `listarFila` | `buscarFilaPorEtapa` | Lista aguardando por etapa |
| `POST /filas/chamadas` | `chamarSenha` | `realizarChamada` | Chama a próxima ou uma selecionada |
| `POST /filas/chamadas/:senhaId/rechamadas` | `rechamarSenha` | `registrarRechamada` | Reenvia a chamada ao painel |
| `GET /filas/historico` | `listarChamadasHoje` | `buscarChamadasDoDia` | Lista chamadas do posto no dia |

Exemplos:

```text
GET /filas?etapa=triagem
```

```json
{
  "etapa": "triagem"
}
```

```json
{
  "etapa": "triagem",
  "senhaId": 15
}
```

`realizarChamada` deve:

- verificar se o voluntário já possui senha ativa;
- usar `senhaId` quando enviado;
- buscar a senha aguardando mais antiga quando não enviado;
- validar se a senha pertence à etapa;
- bloquear a senha atomicamente;
- alterar o status para `em_atendimento`;
- criar o histórico da etapa;
- registrar voluntário, posto, guichê e horário da chamada;
- enviar a chamada ao painel.

### Atendimento — `/atendimentos`

| Método e rota | Controller | Service | Função |
|---|---|---|---|
| `POST /atendimentos` | `iniciarAtendimento` | `registrarInicioAtendimento` | Registra início no histórico atual |
| `POST /atendimentos/:id/finalizacoes` | `finalizarAtendimento` | `concluirAtendimento` | Fecha histórico e avança/finaliza senha |
| `GET /atendimentos/:id` | `consultarAtendimento` | `buscarAtendimentoPorId` | Retorna atendimento e senha |
| `PUT /senhas/:senhaId/aluno` | `vincularAlunoSenha` | `salvarAlunoNaTriagem` | Vincula aluno e matrícula à senha |

Corpo para iniciar:

```json
{
  "senhaId": 15
}
```

Ao finalizar: Triagem → APM; APM → Documentos; Documentos → finalizada.

### Produtos, uniformes e armário — `/admin/produtos`

#### Decisão de modelagem e responsabilidade

Uniformes e armário continuam sendo registros da entidade `Produto`. O campo
`tipoProduto` diferencia `uniforme` e `armario`. Não será criada uma tabela
`Armario` nem uma rota `/admin/armarios` no escopo atual.

Existe somente um produto do tipo `armario`. Essa unicidade é uma regra do service
do backend, pois o schema atual não possui uma restrição de unicidade para
`tipoProduto`. A tela administrativa pode criar a configuração inicial; o service
deve impedir a criação de qualquer segundo armário, inclusive em chamadas
concorrentes.

O frontend usa exclusivamente o prefixo `/admin/produtos`. O backend deverá montar
as rotas com:

```js
app.use("/admin/produtos", produtosRoutes);
```

A rota fixa `/armario` deve ser declarada antes de `/:produtoId`, para que o Express
não interprete a palavra `armario` como um identificador de produto.

Todas as rotas deste capítulo são administrativas. O backend deve exigir usuário
autenticado com permissão administrativa antes de chamar controller ou service. Em
ausência de autenticação deve responder `401`; sem a permissão necessária, `403`.

#### Mapeamento entre API e Prisma

O backend não deve expor os nomes internos do Prisma. Controllers devem converter
os campos conforme esta tabela:

| API | Prisma | Tipo esperado |
|---|---|---|
| `id` | `idProduto` | inteiro positivo |
| `nome` | `nomeProduto` | texto de até 50 caracteres |
| `preco` | `precoProduto` | número decimal positivo |
| `quantidade` | `quantidadeProduto` | inteiro maior ou igual a zero |
| `tipo` | `tipoProduto` | `uniforme` ou `armario` |
| `status` | `statusItem` | depende do tipo do produto |

Formato padrão de um produto enviado pelo backend:

```json
{
  "id": 5,
  "nome": "GG",
  "preco": 45,
  "quantidade": 18,
  "tipo": "uniforme",
  "status": "ativo"
}
```

`preco` deve ser enviado como número JSON, mesmo que no Prisma seja `Decimal`.

#### Resumo das rotas confirmadas

| Método e rota | Função do frontend | Responsabilidade do backend |
|---|---|---|
| `GET /admin/produtos` | `listarUniformesAdmin` | Lista uniformes usando os filtros da query |
| `POST /admin/produtos` | `criarUniforme` ou `criarConfiguracaoArmario` | Cadastra um uniforme ativo ou a única configuração de armário indisponível |
| `PATCH /admin/produtos/:produtoId` | `atualizarUniforme` ou `atualizarConfiguracaoArmario` | Atualiza os dados permitidos conforme o tipo |
| `PATCH /admin/produtos/:produtoId/status` | função interna `alterarStatusProduto` | Altera arquivamento do uniforme ou disponibilidade do armário |
| `PATCH /admin/produtos/:produtoId/alterarEstoque` | `alterarEstoqueUniforme` | Adiciona, diminui ou corrige o estoque do uniforme |
| `GET /admin/produtos/armario` | `buscarConfiguracaoArmario` | Retorna o único produto do tipo armário |

#### `GET /admin/produtos` — listar uniformes

Parâmetros de query usados pelo frontend:

| Parâmetro | Obrigatório | Valores | Comportamento |
|---|---|---|---|
| `tipo` | sim nesta tela | `uniforme` | Restringe a consulta aos uniformes |
| `arquivado` | não | `true` ou `false` | `false` retorna status `ativo`; `true` retorna status `arquivado` |
| `busca` | não | texto | Pesquisa sem diferenciar maiúsculas e minúsculas no nome/tamanho |

Exemplo de requisição:

```http
GET /admin/produtos?tipo=uniforme&arquivado=false&busca=GG
```

Resposta `200 OK`:

```json
{
  "produtos": [
    {
      "id": 5,
      "nome": "GG",
      "preco": 45,
      "quantidade": 18,
      "tipo": "uniforme",
      "status": "ativo"
    }
  ],
  "total": 1
}
```

Quando não houver resultados, o backend deve responder `200 OK` com:

```json
{
  "produtos": [],
  "total": 0
}
```

O backend deve validar `tipo` e `arquivado`, remover espaços da busca e ordenar os
uniformes de maneira estável pelo nome/tamanho.

#### `POST /admin/produtos` — cadastrar produto

Corpo enviado pelo frontend:

```json
{
  "nome": "GG",
  "preco": 45,
  "quantidade": 20,
  "tipo": "uniforme"
}
```

Regras do backend:

- validar nome obrigatório com até 50 caracteres;
- validar preço decimal maior que zero;
- validar quantidade inicial inteira e maior ou igual a zero;
- aceitar `tipo` igual a `uniforme` neste fluxo;
- normalizar espaços do nome;
- impedir dois uniformes com o mesmo tamanho/nome;
- criar o produto com `statusItem` igual a `ativo`.

Para criar a configuração inicial do armário, o frontend envia:

```json
{
  "nome": "Armário",
  "preco": 120,
  "quantidade": 18,
  "tipo": "armario"
}
```

Para `tipo` igual a `armario`, o backend deve:

- validar preço decimal maior que zero e quantidade inteira maior ou igual a zero;
- fixar ou validar o nome como `Armário`;
- criar o produto com `statusItem` igual a `indisponivel`;
- impedir a criação de um segundo produto do tipo `armario`;
- responder `409` com o código `ARMARIO_JA_CONFIGURADO` se a configuração já existir.

Resposta `201 Created`:

```json
{
  "produto": {
    "id": 5,
    "nome": "GG",
    "preco": 45,
    "quantidade": 20,
    "tipo": "uniforme",
    "status": "ativo"
  }
}
```

Quando o produto criado for o armário, a resposta deve seguir o mesmo formato:

```json
{
  "produto": {
    "id": 20,
    "nome": "Armário",
    "preco": 120,
    "quantidade": 18,
    "tipo": "armario",
    "status": "indisponivel"
  }
}
```

#### `PATCH /admin/produtos/:produtoId` — atualizar produto

O corpo é parcial: o backend deve atualizar somente os campos recebidos e não deve
exigir novamente todos os campos do produto.

Para um uniforme, o frontend envia nome e/ou preço. A quantidade deve ser alterada
pela rota específica de estoque e o tipo não pode ser trocado:

```json
{
  "nome": "XG",
  "preco": 48
}
```

Para o armário, o frontend pode enviar preço e quantidade da configuração única:

```json
{
  "preco": 120,
  "quantidade": 18
}
```

Regras do backend:

- localizar o produto pelo `produtoId` inteiro e positivo;
- retornar `404` quando o produto não existir;
- não permitir alteração de `tipoProduto`;
- para uniforme, não aceitar alteração direta de quantidade;
- para armário, aceitar somente preço e quantidade;
- manter quantidade sempre inteira e maior ou igual a zero;
- devolver o produto atualizado no formato público da API.

Resposta `200 OK`:

```json
{
  "produto": {
    "id": 5,
    "nome": "XG",
    "preco": 48,
    "quantidade": 20,
    "tipo": "uniforme",
    "status": "ativo"
  }
}
```

#### `PATCH /admin/produtos/:produtoId/status` — alterar status

Corpo enviado pelo frontend:

```json
{
  "status": "arquivado"
}
```

Exemplos válidos para armário:

```json
{
  "status": "disponivel"
}
```

```json
{
  "status": "indisponivel"
}
```

Valores permitidos de acordo com o tipo encontrado no banco:

| Tipo do produto | Status permitidos | Significado |
|---|---|---|
| `uniforme` | `ativo`, `arquivado` | Controla a situação administrativa do uniforme |
| `armario` | `disponivel`, `indisponivel` | Controla sua exibição e venda na tela da APM |

O backend deve consultar o tipo antes de validar o status. Um armário nunca é
arquivado e um uniforme nunca recebe status de disponibilidade. Produtos arquivados
ou indisponíveis não devem aparecer no catálogo de venda da APM.

Resposta `200 OK`:

```json
{
  "produto": {
    "id": 5,
    "nome": "GG",
    "preco": 45,
    "quantidade": 18,
    "tipo": "uniforme",
    "status": "arquivado"
  }
}
```

#### `PATCH /admin/produtos/:produtoId/alterarEstoque` — alterar estoque

Corpos aceitos:

```json
{
  "operacao": "adicionar",
  "quantidade": 10
}
```

```json
{
  "operacao": "diminuir",
  "quantidade": 3
}
```

```json
{
  "operacao": "corrigir",
  "quantidade": 25
}
```

Regras do backend:

- localizar o produto e exigir que seu tipo seja `uniforme`; para armário, responder
  `422` com `OPERACAO_ESTOQUE_NAO_PERMITIDA`;
- aceitar somente `adicionar`, `diminuir` ou `corrigir`;
- em `adicionar` e `diminuir`, exigir quantidade inteira maior que zero;
- em `corrigir`, interpretar quantidade como o novo estoque total e aceitar zero;
- impedir que `diminuir` produza estoque negativo;
- executar leitura e atualização de forma atômica para evitar concorrência;
- não exigir uma nova tabela de movimentações no escopo atual;
- devolver o produto já com a quantidade atualizada.

Resposta `200 OK`:

```json
{
  "produto": {
    "id": 5,
    "nome": "GG",
    "preco": 45,
    "quantidade": 28,
    "tipo": "uniforme",
    "status": "ativo"
  }
}
```

Essa rota é para ajustes administrativos. A redução causada por uma venda continua
obedecendo à regra funcional: uniformes só diminuem do estoque quando forem
efetivamente retirados.

#### `GET /admin/produtos/armario` — consultar configuração do armário

Não recebe corpo nem parâmetros. O backend deve buscar o único registro cujo
`tipoProduto` seja `armario`.

Resposta `200 OK`:

```json
{
  "produto": {
    "id": 20,
    "nome": "Armário",
    "preco": 120,
    "quantidade": 18,
    "tipo": "armario",
    "status": "disponivel"
  }
}
```

Se não existir configuração, o backend deve responder `404` com o código
`ARMARIO_NAO_CONFIGURADO`. O backend deve impedir o cadastro de um segundo produto
do tipo `armario`.

A edição de preço e quantidade usa `PATCH /admin/produtos/:produtoId`. A alteração
de visibilidade na APM usa `PATCH /admin/produtos/:produtoId/status` com
`disponivel` ou `indisponivel`.

#### Formato de erros

Todas as rotas devem seguir o formato já utilizado pelo `errorHandler`:

```json
{
  "message": "Não foi possível alterar o estoque.",
  "code": "ESTOQUE_INSUFICIENTE",
  "details": {
    "quantidadeDisponivel": 2,
    "quantidadeSolicitada": 3
  }
}
```

Erros previstos:

| HTTP | Código | Situação |
|---|---|---|
| `400` | `DADOS_INVALIDOS` | Query, parâmetro ou corpo inválido |
| `404` | `PRODUTO_NAO_ENCONTRADO` | `produtoId` inexistente |
| `404` | `ARMARIO_NAO_CONFIGURADO` | Não existe produto do tipo armário |
| `409` | `UNIFORME_JA_CADASTRADO` | Já existe uniforme com o mesmo nome/tamanho |
| `409` | `ARMARIO_JA_CONFIGURADO` | Tentativa de criar um segundo armário |
| `409` | `ESTOQUE_INSUFICIENTE` | A diminuição deixaria o estoque negativo |
| `422` | `OPERACAO_ESTOQUE_NAO_PERMITIDA` | Tentativa de movimentar estoque de um produto que não é uniforme |
| `422` | `STATUS_PRODUTO_INVALIDO` | Status incompatível com o tipo do produto |

#### Implementação obrigatória do backend

1. Montar `produtosRoutes` em `/admin/produtos`.
2. Declarar `GET /armario` antes das rotas com `/:produtoId`.
3. Criar validadores separados para query, criação, edição parcial, status e estoque.
4. Manter regras de negócio no `ProdutoService`, não no controller.
5. Mapear campos do Prisma para o formato público antes de responder.
6. Garantir que exista no máximo um produto do tipo `armario`.
7. Garantir operações de estoque atômicas e impedir quantidades negativas.
8. Não criar novas tabelas para cumprir este contrato.
9. Manter os formatos de sucesso e erro documentados nesta seção.

#### Estrutura recomendada de rotas, controller e service

As rotas devem ser registradas nesta ordem, mantendo `/armario` antes de qualquer
rota dinâmica com `:produtoId`:

```js
router.get("/", autenticarAdmin, ProdutosController.listar);
router.post("/", autenticarAdmin, ProdutosController.criar);
router.get("/armario", autenticarAdmin, ProdutosController.buscarArmario);
router.patch("/:produtoId", autenticarAdmin, ProdutosController.atualizar);
router.patch("/:produtoId/status", autenticarAdmin, ProdutosController.alterarStatus);
router.patch("/:produtoId/alterarEstoque", autenticarAdmin, ProdutosController.alterarEstoque);
```

O controller deve somente ler `params`, `query` e `body`, executar o validador,
chamar o service e devolver JSON. Regras como status permitido, unicidade do
armário, comparação de estoque e atualização atômica pertencem ao `ProdutoService`.

Todo produto retornado pelo service deve passar por um único mapper público antes da
resposta. Esse mapper converte `idProduto`, `nomeProduto`, `precoProduto`,
`quantidadeProduto`, `tipoProduto` e `statusItem` para o formato `id`, `nome`,
`preco`, `quantidade`, `tipo` e `status` descrito nesta seção. `Decimal` deve ser
convertido para `number`, nunca serializado como objeto ou string.

Para criação do armário, a verificação de inexistência e a inserção devem ocorrer
na mesma transação. Caso o banco permita concorrência entre duas requisições, o
service deve revalidar a unicidade dentro da transação e traduzir qualquer conflito
para `409 ARMARIO_JA_CONFIGURADO`.

Para `alterarEstoque`, a leitura da quantidade, a validação e a atualização devem
ocorrer na mesma transação. Uma redução nunca pode persistir quantidade negativa.
O retorno deve conter o produto já atualizado, e não a quantidade anterior.

Enquanto o frontend usar mock em `buscarConfiguracaoArmario`, ele poderá exibir a
interface sem backend. Na integração real, essa função deve voltar a requisitar
`GET /admin/produtos/armario`; o backend deve então devolver `404
ARMARIO_NAO_CONFIGURADO` quando a configuração ainda não existir, permitindo ao
frontend exibir o botão de criação inicial.

### Compras — `/compras`

| Método e rota | Controller | Service | Função |
|---|---|---|---|
| `POST /atendimentos/:id/compras` | `confirmarCompraAtendimento` | `registrarCompraAtendimento` | Confirma compra da APM |
| `POST /compras/avulsas` | `criarCompraAvulsa` | `registrarCompraAvulsa` | Secretaria registra compra sem senha |
| `GET /compras` | `listarCompras` | `buscarCompras` | Lista compras com filtros |
| `GET /compras/:id` | `consultarCompra` | `buscarCompraPorId` | Retorna itens, contribuição e pagamentos |
| `POST /atendimentos/:id/finalizacoes-sem-venda` | `finalizarSemVenda` | `concluirAtendimentoSemVenda` | Finaliza APM sem criar compra |

Itens, pagamentos e contribuição podem ser enviados juntos:

```json
{
  "itens": [
    {
      "produtoId": 5,
      "quantidade": 2,
      "quantidadeRetirada": 1
    }
  ],
  "armarios": 0,
  "contribuicao": 25,
  "pagamentos": [
    {
      "forma": "pix",
      "valor": 50
    },
    {
      "forma": "dinheiro",
      "valor": 20
    }
  ]
}
```

### Cupons e retiradas — `/cupons`

| Método e rota | Controller | Service | Função |
|---|---|---|---|
| `GET /cupons` | `listarCupons` | `buscarCupons` | Pesquisa por código, aluno e situação |
| `GET /cupons/:codigo` | `consultarCupom` | `buscarCupomPorCodigo` | Retorna compra e itens |
| `PATCH /cupons/:codigo/itens/:itemId/retirada` | `retirarItem` | `registrarRetiradaItem` | Marca quantidade como retirada |
| `PATCH /cupons/:codigo/finalizacao` | `finalizarCupom` | `concluirCupom` | Marca itens restantes como retirados |
| `GET /cupons/:codigo/impressao` | `gerarCupomImpressao` | `montarDadosCupom` | Retorna conteúdo para impressão |

### Relatórios — `/relatorios`

| Método e rota | Controller | Service | Função |
|---|---|---|---|
| `GET /relatorios/financeiro` | `relatorioFinanceiro` | `calcularRelatorioFinanceiro` | Vendas, armários, contribuições e balanço |
| `GET /relatorios/filas` | `relatorioFilas` | `calcularMetricasFilas` | Quantidades, chamadas, TME e TMA |
| `GET /relatorios/matriculas` | `relatorioMatriculas` | `calcularMatriculasPorCurso` | Matrículas por curso |
| `GET /relatorios/exportacoes` | `exportarRelatorio` | `gerarArquivoRelatorio` | Exporta CSV ou Excel |

Exemplo:

```text
GET /relatorios/financeiro?cursoId=2&ano=3&voluntarioId=5&inicio=2026-08-01&fim=2026-08-31
```

### Painel de TV — `/painel`

| Método e rota | Controller | Service | Função |
|---|---|---|---|
| `GET /painel/chamadas` | `listarChamadasPainel` | `buscarUltimasChamadas` | Retorna chamada atual e últimas chamadas |

Para atualização em menos de 500 ms, usar WebSocket ou Server-Sent Events. A API
HTTP pode carregar o estado inicial, mas não deve ser consultada a cada poucos
milissegundos.
