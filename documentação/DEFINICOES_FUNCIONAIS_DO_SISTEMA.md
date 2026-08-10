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

## 9. Armários

- Cadastrar quantidade disponível.
- Definir e alterar preço.
- Atualizar quantidade.
- Ativar e desativar venda de armários.
- Adicionar armário à compra.
- Bloquear venda sem quantidade suficiente.
- Reduzir a quantidade após a confirmação.

Poderão ser adicionadas novas características futuramente, como a escolha do bloco.

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

### Produtos e uniformes — `/produtos`

| Método e rota | Controller | Service | Função |
|---|---|---|---|
| `POST /produtos` | `criarProduto` | `cadastrarUniforme` | Cadastra uniforme |
| `GET /produtos` | `listarProdutos` | `buscarProdutos` | Lista produtos |
| `GET /produtos/:id` | `consultarProduto` | `buscarProdutoPorId` | Retorna detalhes e estoque |
| `PATCH /produtos/:id` | `editarProduto` | `atualizarProduto` | Edita tamanho, preço e dados |
| `PATCH /produtos/:id/status` | `alterarStatusProduto` | `definirStatusProduto` | Arquiva ou reativa |
| `POST /produtos/:id/movimentacoes` | `registrarMovimentacao` | `movimentarEstoque` | Adiciona ou corrige estoque |

### Armários — `/armarios`

| Método e rota | Controller | Service | Função |
|---|---|---|---|
| `GET /armarios` | `consultarArmarios` | `buscarConfiguracaoArmarios` | Retorna preço, quantidade e disponibilidade |
| `PATCH /armarios` | `editarArmarios` | `atualizarConfiguracaoArmarios` | Altera preço, quantidade e venda ativa |

Como existe apenas um tipo de armário, não é obrigatório criar várias rotas CRUD.

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
