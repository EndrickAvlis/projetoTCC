# Tela administrativa de Postos

## 1. Finalidade deste documento

Este documento define o comportamento visual, funcional e técnico da tela
administrativa de Postos do SIGA Phila.

Ele deve orientar:

- o frontend React;
- os componentes reutilizáveis de fila;
- as rotas administrativas;
- as consultas e transações do backend;
- a alteração mínima do modelo de `Senha`;
- a integração futura com Triagem, APM, Documentos e autenticação;
- os testes de interface e de regras de domínio.

O protótipo navegável está em:

```text
testes/postos/
```

O protótipo é demonstrativo, utiliza dados locais e não altera o frontend ou o
backend principal.

## 2. Nome e responsabilidade da tela

O nome exibido no menu administrativo passa a ser **Postos**.

A tela é um monitor operacional do dia atual. Sua responsabilidade é responder:

- quantas senhas estão aguardando em cada posto;
- quais senhas estão em atendimento;
- quantas senhas são prioritárias;
- quantos atendentes estão ativos em cada posto;
- quais senhas estão pendentes de documentação;
- quantas senhas concluíram o fluxo hoje;
- quais cursos estão ativos para matrícula;
- quantos candidatos foram identificados por curso;
- quais senhas foram finalizadas ou canceladas hoje.

Ela não substitui:

- as telas operacionais dos atendentes;
- o painel público de chamadas;
- a tela financeira de Relatórios;
- a gestão individual de usuários;
- a gestão de cursos e ofertas.

## 3. Escopo definitivo

A página possui três abas:

1. **Filas**;
2. **Atendimento**;
3. **Histórico**.

A aba Filas apresenta:

- Triagem;
- APM;
- Documentos;
- aguardando e em atendimento por posto;
- senhas prioritárias;
- atendentes ativos por posto;
- pendências de documentação;
- filtro de prioritárias;
- atualização automática e manual;
- áreas recolhíveis;
- detalhe e ações administrativas.

A aba Atendimento apresenta:

- senhas finalizadas no dia;
- senhas canceladas no dia;
- quantidade de candidatos por curso;
- cursos ativos para matrícula;
- gráfico de finalizações por horário;
- candidatos por curso;
- filtros compactos por curso e período.

A aba Histórico apresenta:

- senhas encerradas no dia;
- somente `finalizada` e `cancelada`;
- pesquisa por número ou aluno;
- filtro por situação;
- paginação;
- acesso ao detalhe da senha.

## 4. Terminologia

### 4.1. Postos

Os postos válidos continuam sendo:

```text
triagem
apm
docs
```

Rótulos da interface:

| Valor interno | Rótulo |
|---|---|
| `triagem` | Triagem |
| `apm` | APM |
| `docs` | Documentos |

### 4.2. Situações da senha

As situações passam a ser:

```text
aguardando
em_atendimento
pendente
finalizada
cancelada
```

Significado:

| Situação | Significado |
|---|---|
| `aguardando` | Está disponível na fila de um posto. |
| `em_atendimento` | Foi reservada por um atendente e está sendo atendida. |
| `pendente` | A Triagem foi pausada porque faltam documentos. |
| `finalizada` | Concluiu Triagem, APM e Documentos. |
| `cancelada` | Foi encerrada pelo administrador sem concluir o fluxo. |

Não deve existir exclusão definitiva de senha.

### 4.3. Senha encerrada

Uma senha é considerada encerrada quando possui uma destas situações:

```text
finalizada
cancelada
```

Senhas aguardando, em atendimento ou pendentes ainda estão no fluxo e não
aparecem no Histórico.

## 5. Fluxo principal

O fluxo comum permanece:

```text
Emissão
  -> aguardando na Triagem
  -> em atendimento na Triagem
  -> aguardando na APM
  -> em atendimento na APM
  -> aguardando em Documentos
  -> em atendimento em Documentos
  -> finalizada
```

O fluxo de pendência é:

```text
em atendimento na Triagem
  -> pendente na Triagem
  -> retomada diretamente em atendimento na Triagem
  -> conclusão normal da Triagem
```

A pendência nunca entra na fila comum enquanto permanecer pendente.

## 6. Princípio da interface

A tela deve favorecer leitura rápida e acompanhamento operacional.

As três cores são:

| Posto | Cor de referência |
|---|---|
| Triagem | Verde |
| APM | Laranja |
| Documentos | Roxo |

As cores devem aparecer principalmente em:

- cabeçalhos;
- bordas;
- ícones;
- badges;
- cards em atendimento.

Não se deve preencher grandes áreas com cores saturadas. O fundo principal
continua claro para preservar legibilidade.

Cor nunca será a única identificação. O nome do posto e o estado textual devem
continuar visíveis.

## 7. Entrada na página

Ao abrir `/admin/postos`, a página deve:

1. validar a permissão administrativa;
2. carregar o resumo operacional;
3. abrir a aba Filas;
4. iniciar a atualização automática de 30 segundos;
5. exibir o horário da última sincronização bem-sucedida;
6. não bloquear os dados atuais durante uma atualização silenciosa.

A página administrativa atual está registrada como `/admin/filas`. Na
implementação desta especificação, o rótulo e a rota do frontend devem ser
alterados para `/admin/postos`.

As rotas operacionais `/filas` do backend não mudam de nome, pois continuam
representando a fila usada pelos postos.

## 8. Estrutura visual geral

Ordem da página:

1. shell administrativo existente;
2. apresentação da tela;
3. horário da última atualização;
4. botão `Atualizar agora`;
5. abas Filas, Atendimento e Histórico;
6. conteúdo da aba selecionada.

O conteúdo não deve usar uma tabela na aba Filas. As senhas serão mostradas em
cards, seguindo a linguagem visual já utilizada no `SidePostos`.

## 9. Aba Filas

### 9.1. Visão geral sem resumo duplicado

A aba Filas não possui uma segunda linha de cards de resumo acima dos postos.
Essa linha repetia os mesmos números e aumentava a poluição visual.

A visão geral é fornecida pelos três cabeçalhos dos postos e pelo cabeçalho de
Pendências. O administrador consegue comparar as quantidades sem abrir todas as
filas simultaneamente.

### 9.2. Visualizador de posto

Cada posto possui uma área própria com:

- nome;
- cor;
- contadores compactos no cabeçalho para aguardando, em atendimento e
  prioritárias;
- quantidade de atendentes ativos;
- cards em atendimento;
- cards aguardando.

Os três postos aparecem empilhados, cada um ocupando a largura disponível. Em
telas largas, o conteúdo interno de cada posto é distribuído entre senhas em
atendimento e senhas aguardando. Em telas menores, essas partes são empilhadas
dentro do próprio visualizador.

Os três contadores permanecem no cabeçalho, ao lado do nome do posto. Eles usam
números e rótulos compactos, sem caixas individuais. O total de atendentes ativos
permanece à direita.

### 9.3. Senhas em atendimento

As senhas em atendimento devem aparecer antes das aguardando.

Na área expandida, elas ocupam a coluna esquerda. As aguardando ocupam o espaço
principal à direita.

Elas terão:

- preenchimento com a cor do posto;
- texto `Em atendimento` ou identificação visual equivalente;
- número da senha;
- guichê, quando disponível;
- destaque adicional de prioridade.

Pode existir mais de uma senha em atendimento no mesmo posto, pois cada guichê
pode possuir seu atendimento ativo.

### 9.4. Senhas aguardando

As senhas aguardando usam uma grade semelhante ao `FilaGrid` atual.

Cada card deve mostrar pelo menos:

- código formatado;
- prioridade;
- ação para abrir detalhes.

Na Triagem, o aluno pode ainda não ter sido identificado. Nesse caso, o card não
deve inventar nome ou curso.

Em telas largas, a grade aguardando usa seis colunas. Ela cresce naturalmente
até quatro linhas, totalizando até 24 cards visíveis. Quando houver mais senhas,
a própria grade passa a ter rolagem vertical. O visualizador não deve crescer
indefinidamente e empurrar os outros postos para muito longe.

### 9.5. Ordenação

A ordenação padrão das aguardando deve considerar:

1. prioridade;
2. horário de emissão;

Quando a regra de prioridade estiver ativa, senhas prioritárias vêm antes das
normais. Dentro de cada grupo, permanece a ordem de emissão.

### 9.6. Filtro de prioridade

A aba possui somente o filtro:

```text
Mostrar somente prioritárias
```

O filtro afeta os cards apresentados, mas não altera os totais reais nos
cabeçalhos.

Não adicionar filtros de data, semana, mês ou intervalo nesta aba.

### 9.7. Recolhimento

Os visualizadores podem ser expandidos ou recolhidos de forma independente. A
Triagem inicia expandida, enquanto APM e Documentos iniciam recolhidos, mantendo
a primeira visualização mais limpa.

Acima dos postos existem as ações compactas `Expandir todos` e `Recolher todos`.
Assim, o administrador pode visualizar as três filas completas simultaneamente
quando precisar, sem tornar esse o estado inicial da página.

Quando recolhido, o cabeçalho continua mostrando:

- posto;
- aguardando;
- em atendimento;
- prioritárias;
- atendentes ativos.

Esses valores aparecem como contadores compactos e legíveis, não como uma frase
corrida nem como vários cards encaixados dentro do cabeçalho.

O recolhimento é estado visual local e não precisa ser persistido no backend.

## 10. Pendências de documentação

### 10.1. Definição

Uma pendência acontece somente na Triagem, depois que o atendimento foi
iniciado e o atendente identificou a falta de um ou mais documentos.

Documentos possíveis:

```text
RG ou CIN
CPF ou CIN
Foto 3x4
Comprovante de escolaridade pública
Histórico do Ensino Fundamental
```

O Histórico do Ensino Fundamental é a decisão definitiva e substitui a menção
anterior ao Histórico do Ensino Médio.

### 10.2. Regras

Uma senha `pendente`:

- mantém `etapaSenha = "triagem"`;
- não aparece entre as aguardando;
- não aparece entre as em atendimento;
- libera o guichê que estava atendendo;
- não pode ser transferida;
- pode ser cancelada pelo administrador;
- pode ter a prioridade alterada;
- deve ser retomada por um atendente da Triagem;
- volta diretamente para `em_atendimento` quando retomada;
- não volta para `aguardando`.

### 10.3. Ordenação

As pendências devem aparecer da mais antiga para a mais recente, usando o
horário registrado no JSON.

O volume diário é pequeno. Enquanto o horário estiver dentro do JSON, o service
pode ordenar a coleção já carregada no servidor. Não é necessário criar um novo
campo apenas para ordenar.

### 10.4. Card

Cada card apresenta:

- senha;
- quantidade de documentos faltantes;
- horário da pendência;
- prioridade.

Ao passar o mouse ou focar o card pelo teclado, um tooltip mostra os documentos
específicos.

O mesmo conteúdo também aparece no modal de detalhes, portanto a informação não
pode depender exclusivamente do hover.

## 11. Detalhes da senha

O mesmo modal é aberto a partir de:

- aguardando;
- em atendimento;
- pendente;
- linha do Histórico.

Informações iniciais:

- código;
- situação;
- prioridade;
- posto atual ou posto do cancelamento;
- horário de emissão;
- horário do estado atual ou encerramento;
- aluno, quando vinculado;
- curso e período, quando vinculados;
- guichê, quando em atendimento;
- documentos faltantes, quando pendente;
- tempo total, quando encerrada.

O horário de emissão deve aparecer uma única vez. Um segundo horário só é
mostrado quando representa outro evento: início do atendimento, registro da
pendência ou encerramento. Para uma senha apenas aguardando, não repetir a
emissão com outro rótulo.

O modal deve priorizar visualmente:

1. código, aluno, curso, situação e prioridade;
2. fatos operacionais compactos;
3. documentos ou bloqueios aplicáveis;
4. ações administrativas no rodapé.

Não mostrar inicialmente uma linha do tempo completa dos três postos. Essa
informação foi retirada do escopo visual para evitar poluição.

O histórico interno continua necessário no backend para regras e cálculos.

## 12. Alteração de prioridade

O administrador pode ativar ou remover prioridade no detalhe.

A ação usa a regra já existente de alternância do booleano `tipoSenha`.

Não permitir alteração em:

- finalizada;
- cancelada.

Para aguardando, em atendimento ou pendente, a alteração pode ser realizada.

Depois do sucesso:

- atualizar o modal;
- atualizar o card;
- recalcular contagens;
- não esperar o ciclo automático de 30 segundos.

## 13. Transferência de posto

### 13.1. Regra principal

Somente uma senha com:

```text
statusSenha = "aguardando"
```

pode ser transferida.

Não permitir transferência de:

- `em_atendimento`;
- `pendente`;
- `finalizada`;
- `cancelada`.

### 13.2. Interface

A ação `Alterar posto` aparece dentro do detalhe somente quando a senha está
aguardando.

Ao abrir a ação:

- mostrar os outros dois postos;
- não mostrar o posto atual;
- pedir confirmação;
- informar que a senha continuará aguardando.

### 13.3. Resultado

Após confirmar:

```text
etapaSenha = posto escolhido
statusSenha = "aguardando"
```

A senha deve sair do visualizador de origem e entrar imediatamente no destino.

### 13.4. Concorrência

A validação precisa acontecer dentro da atualização do banco. Não basta confiar
no estado exibido no frontend.

Condição mínima:

```text
idSenha = id recebido
statusSenha = "aguardando"
etapaSenha = etapa de origem conhecida
```

Se a senha tiver sido chamada por um atendente antes da transferência, responder
`409` e não alterar o posto.

## 14. Cancelamento

O termo da interface deve ser `Cancelar senha`, nunca `Excluir senha`.

Somente administrador pode cancelar.

Ao cancelar:

```text
statusSenha = "cancelada"
dataHoraFimSenha = agora
```

A senha:

- sai das filas;
- sai de em atendimento ou pendências;
- permanece no banco;
- mantém o histórico;
- entra no Histórico do dia;
- não pode ser chamada novamente.

O cancelamento deve ser confirmado em modal.

O documento funcional anterior propõe o envio de um motivo. Se o motivo for
mantido na implementação, ele deve ser persistido; não deve existir somente na
resposta do frontend. Essa decisão não exige uma tabela nova, mas pode exigir um
campo opcional em `Senha`.

## 15. Aba Atendimento

### 15.1. Finalidade

A aba Atendimento apresenta leitura consolidada do dia atual. Ela não é uma
segunda tela de Relatórios.

Não incluir:

- intervalo personalizado;
- semana;
- mês;
- atendente individual;
- exportação.

### 15.2. Indicadores

Indicadores:

1. senhas finalizadas;
2. senhas canceladas;
3. senhas emitidas;
4. cursos ativos para matrícula.

### 15.3. Senhas finalizadas

Contar somente:

```text
statusSenha = "finalizada"
dataHoraFimSenha dentro do dia atual
```

Uma pessoa conta uma única vez, independentemente de ter passado por três
postos.

Não contar registros individuais de `HistoricoSenha` no gráfico.

### 15.4. Gráfico por horário

O gráfico agrupa as finalizadas pela hora de `dataHoraFimSenha`.

Exemplo:

```text
08h -> 4 finalizadas
09h -> 8 finalizadas
10h -> 13 finalizadas
```

O gráfico é somente informativo. Ele não precisa abrir ou filtrar o Histórico ao
ser clicado.

Deve possuir tooltip com horário e quantidade.

Na aplicação React será implementado com Chart do shadcn. O projeto atual ainda
não possui essa dependência ou seus componentes; eles devem ser adicionados na
etapa do frontend.

### 15.5. Cursos ativos

Mostrar cursos que possuem pelo menos uma oferta/período com matrícula ativa.

Para cada curso:

- nome;
- períodos ativos;
- quantidade de candidatos vinculados ao curso durante a Triagem hoje.

### 15.6. Candidatos por curso

Um candidato entra na contagem quando a Triagem identifica o aluno e o vincula à
senha.

Uma senha ainda aguardando identificação na Triagem não possui curso e não pode
ser distribuída antecipadamente.

### 15.7. Filtros compactos

Filtros permitidos:

- curso;
- período.

Eles afetam:

- indicadores da aba;
- gráfico;
- ranking;
- cursos apresentados.

Tudo continua limitado ao dia atual.

## 16. Aba Histórico

### 16.1. Conteúdo

A tabela é chamada `Senhas encerradas hoje`.

Consulta:

```text
statusSenha IN ("finalizada", "cancelada")
dataHoraFimSenha dentro do dia atual
```

Ordenação:

```text
dataHoraFimSenha DESC
```

### 16.2. Colunas

Colunas:

1. senha;
2. aluno;
3. curso;
4. emissão;
5. encerramento;
6. situação;
7. tempo total;
8. ações.

Tempo total:

```text
dataHoraFimSenha - dataHoraInicioSenha
```

Para canceladas, o tempo indica permanência no fluxo até o cancelamento, não
tempo de atendimento concluído.

### 16.3. Pesquisa

Pesquisar por:

- código da senha;
- nome do aluno.

A pesquisa deve aceitar:

```text
A025
25
Maria
Maria Silva
```

O backend deve normalizar o número e aplicar pesquisa textual sem diferenciar
maiúsculas, minúsculas ou acentos.

### 16.4. Filtro

Opções:

```text
Todas as situações
Finalizadas
Canceladas
```

Não replicar o painel completo de filtros de Relatórios.

### 16.5. Paginação

O Histórico é paginado no backend.

Valores sugeridos:

```text
pagina = 1
limite = 10
```

Limite máximo sugerido:

```text
100
```

## 17. Atualização dos dados

### 17.1. Automática

A atualização ocorre a cada:

```text
30 segundos
```

Ela deve ser silenciosa:

- preservar a aba;
- preservar qual posto está expandido;
- preservar filtros;
- preservar a página do Histórico quando ainda válida;
- manter os dados anteriores se houver falha;
- não exibir carregamento de página inteira.

### 17.2. Manual

O botão `Atualizar agora` executa a mesma carga imediatamente.

Durante a chamada:

- desabilitar o botão;
- mostrar indicação de atualização;
- não apagar os cards atuais.

### 17.3. Após mutações

Depois de prioridade, transferência ou cancelamento:

- atualizar localmente com a resposta do servidor;
- solicitar uma sincronização silenciosa;
- não esperar 30 segundos.

### 17.4. Horário exibido

Mostrar o horário da última resposta bem-sucedida:

```text
Atualizado às 14:42:05
```

Usar o fuso:

```text
America/Sao_Paulo
```

## 18. Atendentes ativos

### 18.1. Definição

Um atendente é considerado ativo quando possui uma sessão de login ativa
associada a um posto.

O login já recebe:

- usuário;
- tela/posto;
- guichê.

### 18.2. Exibição nesta tela

Mostrar somente a quantidade por posto.

Exemplo:

```text
Triagem: 3 ativos
APM: 2 ativos
Documentos: 4 ativos
```

Não mostrar nesta tela:

- nome do atendente;
- lista de sessões;
- guichê individual por usuário;
- horário individual de login.

Essas informações pertencem à tela de Usuários.

### 18.3. Fonte dos dados

A tela de Postos não deve criar uma segunda regra de presença. Ela deve consumir
o total produzido pelo módulo de autenticação.

O módulo de autenticação deve marcar a sessão como ativa no login e encerrá-la
no logout ou na expiração.

Se o navegador for fechado sem logout, a sessão pode permanecer ativa até
expirar. Um heartbeat poderá ser avaliado futuramente, mas não é requisito desta
tela.

## 19. Alteração mínima no banco

### 19.1. Novo estado

Atualizar validators e regras para aceitar:

```text
pendente
```

O schema atual usa `String` em `statusSenha`, portanto não é obrigatório criar
enum Prisma nesta tarefa. Mesmo assim, os valores devem ser validados no
backend.

### 19.2. Campo JSON

Adicionar em `Senha`:

```prisma
documentosPendentes Json?
```

Estrutura versão 1:

```json
{
  "versao": 1,
  "registradaEm": "2026-08-22T15:10:00.000Z",
  "resolvidaEm": null,
  "documentos": [
    "rg_cin",
    "foto_3x4",
    "historico_ensino_fundamental"
  ]
}
```

Identificadores válidos:

```text
rg_cin
cpf_cin
foto_3x4
comprovante_escolaridade_publica
historico_ensino_fundamental
```

Não armazenar rótulos traduzidos no JSON.

### 19.3. Registro resolvido

Ao retomar:

- manter os documentos que faltavam;
- preencher `resolvidaEm`;
- mudar a senha para `em_atendimento`.

Preservar o objeto permite saber que houve pendência, sem criar uma nova tabela.

### 19.4. Múltiplas pendências

A primeira versão considera uma pendência ativa por senha. Caso no futuro seja
necessário registrar várias ocorrências independentes, o JSON poderá evoluir
para uma lista versionada.

Não implementar múltiplas ocorrências antes de existir requisito real.

## 20. Histórico e pausa da Triagem

Ao marcar pendência, o guichê precisa ficar livre e o tempo sem documentos não
deve ser interpretado como trabalho ativo do atendente.

Implementação recomendada:

1. encerrar o segmento atual de `HistoricoSenha` com horário de pausa;
2. manter `etapaSenha = "triagem"`;
3. definir `statusSenha = "pendente"`;
4. armazenar a pendência no JSON;
5. ao retomar, criar novo segmento de `HistoricoSenha` para Triagem;
6. definir `statusSenha = "em_atendimento"`.

Isso não significa concluir a Triagem. Significa apenas encerrar um intervalo de
trabalho antes da pausa.

O schema já permite vários históricos associados à mesma senha e não possui
restrição única por etapa.

## 21. Estado atual do projeto

Já existem:

- rota do frontend `/admin/filas`;
- placeholder `filasPage.jsx`;
- `AdminLayout`;
- `AdminHeader`;
- `AdminSideBar`;
- `FilaGrid`;
- `SenhaAtualCard`;
- `SidePostos`;
- `useFila`;
- `filaService.js`;
- `GET /filas?etapa=`;
- `POST /filas/chamadas`;
- `PATCH /senhas/:id/prioridade`;
- criação de senha;
- reserva atômica de uma senha selecionada.

Ainda faltam:

- página administrativa real;
- listagem consolidada dos três postos;
- listagem das em atendimento;
- pendências;
- detalhe administrativo;
- histórico do dia;
- métricas de atendimento;
- transferência;
- cancelamento;
- contagem de sessões ativas;
- histórico criado durante a chamada;
- retomada de pendência;
- proteção administrativa completa;
- Chart do shadcn.

## 22. Componentes existentes que devem ser reutilizados

### `AdminLayout`

Manter o shell com sidebar, header e `Outlet`.

### `AdminHeader`

Deve exibir `Postos` a partir da navegação administrativa.

### `FilaGrid`

Deve ser reutilizado para as senhas aguardando.

O componente já possui:

- mapeamento de senhas;
- cards clicáveis;
- formatação;
- prioridade;
- estado vazio;
- grade.

Generalizações necessárias:

- variante visual por posto;
- texto acessível da ação;
- mensagem vazia opcional;
- possibilidade de uso administrativo sem semântica de chamada.

Exemplo de props:

```jsx
<FilaGrid
  senhas={senhas}
  onSelecionarSenha={abrirDetalhes}
  variante="triagem"
  descricaoAcao="Ver detalhes da senha"
  mensagemVazia="Nenhuma senha aguardando na Triagem."
/>
```

No `SidePostos`, a descrição continua `Chamar senha`.

Não montar classes Tailwind com interpolação arbitrária. Usar mapa estático de
classes por variante.

### `Modal`

Reutilizar para:

- detalhes;
- confirmação de transferência;
- confirmação de cancelamento.

### `DataTable`

Reutilizar no Histórico. A paginação fica fora do componente, seguindo o padrão
das telas administrativas.

### `Alert`

Reutilizar para erros iniciais ou de ação.

### `Button`, `Select` e formatters

Reutilizar componentes e tokens existentes. Adicionar formatadores de data,
hora e duração em `utils/formatters.js` quando necessário.

### `apiClient`

Todas as chamadas devem passar por `requisitarApi`.

## 23. Componentes que não devem ser reutilizados inteiros

### `SidePostos`

Não reutilizar o componente inteiro na administração porque ele possui:

- largura fixa;
- altura de viewport;
- alternância operacional de histórico;
- senha atual do atendente;
- regras de chamada;
- dependência do atendimento ativo.

Reutilizar seus conceitos e componentes menores, principalmente o `FilaGrid`.

### `AtendimentoContext`

Não usar na página administrativa.

O contexto representa o atendimento atual do usuário do posto. A administração
observa vários postos e não possui uma senha operacional atual.

## 24. Estrutura de arquivos sugerida

### 24.1. Frontend

```text
frontend/src/features/admin/
  pages/
    postosPage.jsx
  components/postos/
    PostoCard.jsx
    SenhasEmAtendimentoGrid.jsx
    PendenciasDocumentos.jsx
    DetalhesSenhaModal.jsx
    TransferirSenhaModal.jsx
    CancelarSenhaModal.jsx
    AtendimentoPostos.jsx
    GraficoFinalizadasHora.jsx
    CursosAtivosPostos.jsx
    HistoricoSenhas.jsx
  hooks/
    usePostos.js
    useAtendimentoPostos.js
    useHistoricoPostos.js
  services/
    PostosService.js
  constants/
    postos.js
```

Arquivos compartilhados que podem ser ajustados:

```text
frontend/src/App.jsx
frontend/src/features/admin/constants/adminNavigation.js
frontend/src/components/Fila/FilaGrid.jsx
frontend/src/utils/formatters.js
frontend/src/globals.css
frontend/package.json
```

### 24.2. Backend

```text
backend/src/
  routes/
    postosAdminRoutes.js
  controllers/
    PostosAdminController.js
  services/
    PostosAdminService.js
  validators/
    ValidatorPostosAdmin.js
```

Arquivos existentes reutilizados ou ajustados:

```text
backend/src/services/FilaService.js
backend/src/services/SenhaService.js
backend/src/services/HistoricoSenhaService.js
backend/src/routes/filaRoutes.js
backend/src/routes/senhaRoutes.js
backend/src/app.js
backend/prisma/schema.prisma
```

## 25. Constantes do frontend

Centralizar metadados:

```js
export const POSTOS = {
  triagem: {
    id: "triagem",
    label: "Triagem",
    variante: "triagem",
  },
  apm: {
    id: "apm",
    label: "APM",
    variante: "apm",
  },
  docs: {
    id: "docs",
    label: "Documentos",
    variante: "docs",
  },
};
```

Documentos:

```js
export const DOCUMENTOS_MATRICULA = {
  rg_cin: "RG ou CIN",
  cpf_cin: "CPF ou CIN",
  foto_3x4: "Foto 3x4",
  comprovante_escolaridade_publica:
    "Comprovante de escolaridade pública",
  historico_ensino_fundamental:
    "Histórico do Ensino Fundamental",
};
```

Situações:

```js
export const STATUS_SENHA = {
  AGUARDANDO: "aguardando",
  EM_ATENDIMENTO: "em_atendimento",
  PENDENTE: "pendente",
  FINALIZADA: "finalizada",
  CANCELADA: "cancelada",
};
```

## 26. Estado e hooks

Não criar `PostosContext` global.

Estado local da página:

- aba ativa;
- postos expandidos;
- pendências recolhidas;
- filtro de prioridade;
- curso e período da aba Atendimento;
- pesquisa e situação do Histórico;
- página do Histórico;
- modal aberto;
- senha selecionada.

Dados do servidor devem ficar nos hooks especializados.

### `usePostos`

Responsável por:

- resumo;
- três postos;
- pendências;
- atualização automática;
- atualização manual;
- prioridade;
- transferência;
- cancelamento.

### `useAtendimentoPostos`

Responsável por:

- indicadores;
- gráfico;
- cursos;
- filtros por curso e período.

### `useHistoricoPostos`

Responsável por:

- pesquisa;
- situação;
- paginação;
- carregamento da tabela.

## 27. Rotas administrativas

Montar no backend:

```js
app.use("/admin/postos", postosAdminRoutes);
```

Rotas:

| Método e rota | Função |
|---|---|
| `GET /admin/postos` | Resumo, filas, em atendimento, pendências e atendentes ativos. |
| `GET /admin/postos/atendimento` | Indicadores, gráfico e cursos do dia. |
| `GET /admin/postos/historico` | Histórico paginado de finalizadas e canceladas. |
| `GET /admin/postos/senhas/:senhaId` | Detalhe administrativo. |
| `PATCH /admin/postos/senhas/:senhaId/posto` | Transfere uma aguardando. |
| `PATCH /admin/postos/senhas/:senhaId/cancelamento` | Cancela a senha. |

Prioridade pode continuar usando:

```text
PATCH /senhas/:id/prioridade
```

desde que a rota passe a validar autenticação e permissão adequadamente.

## 28. Contrato do resumo

### `GET /admin/postos`

Resposta sugerida:

```json
{
  "atualizadoEm": "2026-08-22T17:42:05.000Z",
  "resumo": {
    "totalAguardando": 15,
    "totalEmAtendimento": 5,
    "totalPendentes": 4,
    "totalAtendentesAtivos": 9
  },
  "postos": [
    {
      "id": "triagem",
      "nome": "Triagem",
      "atendentesAtivos": 3,
      "totais": {
        "aguardando": 6,
        "emAtendimento": 2,
        "prioritarias": 2
      },
      "emAtendimento": [
        {
          "id": 38,
          "codigo": 38,
          "prioritaria": true,
          "guiche": 1,
          "aluno": {
            "id": 12,
            "nome": "Gabriel Moraes"
          }
        }
      ],
      "aguardando": [
        {
          "id": 42,
          "codigo": 42,
          "emitidaEm": "2026-08-22T17:02:00.000Z",
          "prioritaria": false,
          "aluno": null
        }
      ]
    }
  ],
  "pendencias": [
    {
      "id": 12,
      "codigo": 12,
      "prioritaria": false,
      "aluno": {
        "id": 4,
        "nome": "Alice Mendes"
      },
      "curso": {
        "id": 3,
        "nome": "Enfermagem",
        "periodo": "integral"
      },
      "registradaEm": "2026-08-22T15:08:00.000Z",
      "documentos": [
        "foto_3x4",
        "historico_ensino_fundamental"
      ]
    }
  ]
}
```

O controller converte nomes do Prisma para o contrato da API.

## 29. Contrato da aba Atendimento

### `GET /admin/postos/atendimento`

Query:

```text
cursoId opcional
periodo opcional
```

Exemplo:

```text
GET /admin/postos/atendimento?cursoId=3&periodo=integral
```

Resposta:

```json
{
  "data": "2026-08-22",
  "filtros": {
    "cursoId": 3,
    "periodo": "integral"
  },
  "indicadores": {
    "senhasFinalizadas": 85,
    "senhasCanceladas": 5,
    "senhasEmitidas": 112,
    "cursosAtivos": 1
  },
  "finalizadasPorHora": [
    { "hora": 8, "quantidade": 4 },
    { "hora": 9, "quantidade": 8 },
    { "hora": 10, "quantidade": 13 }
  ],
  "candidatosPorCurso": [
    {
      "cursoId": 3,
      "curso": "Enfermagem",
      "quantidade": 21
    }
  ],
  "cursosAtivos": [
    {
      "id": 3,
      "nome": "Enfermagem",
      "periodos": ["integral"],
      "candidatosHoje": 21
    }
  ]
}
```

Horas sem finalização podem vir com quantidade zero para estabilizar o eixo do
gráfico.

## 30. Contrato do Histórico

### `GET /admin/postos/historico`

Query:

```text
busca opcional
status opcional: finalizada | cancelada
pagina padrão: 1
limite padrão: 10
```

Exemplo:

```text
GET /admin/postos/historico?busca=maria&status=finalizada&pagina=1&limite=10
```

Resposta:

```json
{
  "itens": [
    {
      "id": 39,
      "codigo": 39,
      "aluno": {
        "id": 17,
        "nome": "Lívia Fernandes"
      },
      "curso": {
        "id": 1,
        "nome": "Administração",
        "periodo": "manha"
      },
      "emitidaEm": "2026-08-22T16:12:00.000Z",
      "encerradaEm": "2026-08-22T17:24:00.000Z",
      "status": "finalizada",
      "duracaoSegundos": 4320
    }
  ],
  "paginacao": {
    "pagina": 1,
    "limite": 10,
    "totalItens": 15,
    "totalPaginas": 2
  }
}
```

## 31. Contrato do detalhe

### `GET /admin/postos/senhas/:senhaId`

Resposta:

```json
{
  "senha": {
    "id": 18,
    "codigo": 18,
    "status": "pendente",
    "posto": "triagem",
    "prioritaria": true,
    "emitidaEm": "2026-08-22T15:16:00.000Z",
    "aluno": {
      "id": 9,
      "nome": "Diego Santos"
    },
    "curso": {
      "id": 4,
      "nome": "Logística",
      "periodo": "noite"
    },
    "pendencia": {
      "registradaEm": "2026-08-22T15:43:00.000Z",
      "resolvidaEm": null,
      "documentos": [
        "rg_cin",
        "cpf_cin",
        "comprovante_escolaridade_publica"
      ]
    },
    "acoes": {
      "podeAlterarPrioridade": true,
      "podeTransferir": false,
      "podeCancelar": true
    }
  }
}
```

O campo `acoes` não substitui a autorização do backend. Ele apenas ajuda o
frontend a ocultar ações incompatíveis.

## 32. Contrato da transferência

### `PATCH /admin/postos/senhas/:senhaId/posto`

Corpo:

```json
{
  "posto": "apm"
}
```

Resposta:

```json
{
  "message": "Senha transferida para APM.",
  "senha": {
    "id": 42,
    "codigo": 42,
    "posto": "apm",
    "status": "aguardando"
  }
}
```

Erros:

| Código | HTTP | Situação |
|---|---:|---|
| `SENHA_NAO_ENCONTRADA` | 404 | ID inexistente. |
| `SENHA_NAO_AGUARDANDO` | 409 | Não está aguardando. |
| `POSTO_IGUAL` | 409 | Destino é o posto atual. |
| `POSTO_INVALIDO` | 400 | Destino fora de triagem, apm e docs. |
| `ACESSO_NEGADO` | 403 | Usuário não é administrador. |

## 33. Contrato do cancelamento

### `PATCH /admin/postos/senhas/:senhaId/cancelamento`

Corpo proposto:

```json
{
  "motivo": "Cancelamento solicitado pelo aluno"
}
```

Resposta:

```json
{
  "message": "Senha cancelada com sucesso.",
  "senha": {
    "id": 42,
    "codigo": 42,
    "status": "cancelada",
    "encerradaEm": "2026-08-22T17:48:00.000Z"
  }
}
```

O service deve fechar qualquer histórico ativo antes de concluir a transação.

## 34. Integração operacional da pendência

A criação e a retomada da pendência pertencem à Triagem, não à administração.

Rotas sugeridas:

| Método e rota | Função |
|---|---|
| `POST /atendimentos/:atendimentoId/pendencias` | Pausa a Triagem e registra documentos. |
| `POST /filas/pendencias/:senhaId/retomadas` | Reserva a pendência para um atendente da Triagem. |

Corpo da pendência:

```json
{
  "documentos": [
    "foto_3x4",
    "historico_ensino_fundamental"
  ]
}
```

Retomada:

```text
status atual deve ser pendente
posto deve ser triagem
atendente não pode possuir atendimento ativo
```

A retomada precisa usar transação e bloqueio equivalente ao da chamada normal.

## 35. Validator

O validator administrativo deve aceitar:

```js
const postoSchema = z.enum(["triagem", "apm", "docs"]);

const statusHistoricoSchema = z.enum([
  "finalizada",
  "cancelada",
]);
```

Transferência:

```js
export const transferirSenhaSchema = z.object({
  params: z.object({
    senhaId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    posto: postoSchema,
  }),
});
```

Histórico:

```js
export const historicoPostosSchema = z.object({
  query: z.object({
    busca: z.string().trim().max(100).optional(),
    status: statusHistoricoSchema.optional(),
    pagina: z.coerce.number().int().positive().default(1),
    limite: z.coerce.number().int().min(1).max(100).default(10),
  }),
});
```

Documentos devem usar enum com os cinco identificadores definidos.

## 36. Service do backend

### 36.1. Resumo

O service deve executar consultas independentes em paralelo quando possível:

- aguardando;
- em atendimento;
- pendentes;
- sessões ativas;
- alunos e cursos necessários.

Não fazer uma consulta por card.

### 36.2. Transferência

Usar atualização condicional e transação:

```text
UPDATE Senha
WHERE idSenha = :id
  AND statusSenha = 'aguardando'
  AND etapaSenha = :origem
SET etapaSenha = :destino
```

Se nenhuma linha for atualizada, consultar a senha para diferenciar inexistência
de conflito.

### 36.3. Cancelamento

Dentro de uma transação:

1. localizar a senha;
2. rejeitar finalizada ou cancelada;
3. fechar histórico ativo, se existir;
4. definir status cancelada;
5. definir `dataHoraFimSenha`;
6. persistir motivo, quando o modelo o suportar;
7. retornar o estado atualizado.

### 36.4. Finalizadas por hora

Agrupar por hora de `dataHoraFimSenha` no fuso de São Paulo.

Não usar hora de emissão.

### 36.5. Histórico

A mesma função deve produzir:

- `where` da contagem;
- `where` da página;
- intervalo do dia;
- busca por código ou nome;
- situação finalizada/cancelada.

Executar `count` e `findMany` com os mesmos filtros.

## 37. Controller

Responsabilidades:

- ler `req.validado`;
- chamar o service;
- converter Prisma para API;
- devolver status HTTP adequado;
- não calcular totais no controller;
- não consultar Prisma diretamente.

## 38. Routes e autorização

Todas as rotas `/admin/postos` exigem:

- autenticação;
- usuário ativo;
- perfil administrador.

Respostas:

```text
401 sem sessão válida
403 sem permissão administrativa
```

Supervisor e atendente não podem:

- transferir;
- cancelar pela rota administrativa;
- abrir a página administrativa.

## 39. Service do frontend

Exemplo:

```js
import { requisitarApi } from "../../../services/apiClient";

export const obterPostos = () =>
  requisitarApi("/admin/postos");

export const obterAtendimentoPostos = ({ cursoId, periodo }) => {
  const params = new URLSearchParams();
  if (cursoId) params.set("cursoId", cursoId);
  if (periodo) params.set("periodo", periodo);
  return requisitarApi(`/admin/postos/atendimento?${params}`);
};

export const obterHistoricoPostos = (filtros) => {
  const params = new URLSearchParams(filtros);
  return requisitarApi(`/admin/postos/historico?${params}`);
};

export const transferirSenha = (senhaId, posto) =>
  requisitarApi(`/admin/postos/senhas/${senhaId}/posto`, {
    method: "PATCH",
    body: JSON.stringify({ posto }),
  });
```

Não reutilizar `filaService.js` para operações administrativas que não pertencem
ao atendente. O `FilaGrid` é compartilhado; o contrato administrativo pode ficar
em service próprio.

## 40. Página principal

A página coordena:

- abas;
- estado visual;
- hooks;
- modais;
- atualização automática;
- sincronização após ações.

Ela não deve conter:

- queries HTTP literais espalhadas;
- cálculos de domínio;
- mapeamento de campos Prisma;
- regras de autorização;
- lógica do gráfico misturada ao modal.

## 41. Estados da interface

### 41.1. Carregamento inicial

Mostrar esqueletos ou indicador dentro do conteúdo, preservando o shell.

### 41.2. Atualização silenciosa

Manter conteúdo anterior e animar apenas o botão/horário.

### 41.3. Erro inicial

Mostrar `Alert` com mensagem e ação para tentar novamente.

### 41.4. Erro durante atualização

Manter dados anteriores e mostrar alerta não bloqueante.

### 41.5. Posto vazio

Mostrar mensagens separadas:

```text
Nenhuma senha em atendimento.
Nenhuma senha aguardando.
```

### 41.6. Sem pendências

Mostrar:

```text
Nenhuma pendência de documentação no momento.
```

### 41.7. Histórico vazio

Mostrar:

```text
Nenhuma senha encerrada hoje.
```

Quando a pesquisa não retornar dados:

```text
Nenhuma senha encontrada. Tente ajustar a pesquisa ou a situação.
```

### 41.8. Conflito de transferência

Quando receber `409`:

- fechar confirmação;
- informar que a senha não está mais aguardando;
- atualizar as filas imediatamente.

## 42. Acessibilidade

- Abas devem usar `role="tablist"`, `role="tab"` e `role="tabpanel"`.
- Botões de recolhimento devem usar `aria-expanded`.
- Cards clicáveis devem ser botões.
- O texto acessível na administração deve dizer `Ver detalhes`, não `Chamar`.
- Tooltip de documentos deve funcionar com foco.
- Modal deve possuir título associado e fechamento por `Escape`.
- Foco deve retornar ao elemento que abriu o modal.
- Prioridade deve possuir ícone/texto além da cor.
- Situação deve possuir rótulo textual.
- Gráfico deve possuir descrição e alternativa textual.
- Contraste deve seguir os tokens globais.

## 43. Responsividade

### Desktop largo

- três postos empilhados em largura total;
- resumo, em atendimento e aguardando distribuídos horizontalmente dentro de
  cada posto, com em atendimento à esquerda e aguardando à direita;
- gráfico e ranking lado a lado;
- tabela com largura completa.

### Desktop médio/tablet

- postos empilhados ou em duas colunas;
- conteúdos internos podem ficar lado a lado;
- filtros compactos quebram linha.

### Celular

- sidebar pode ser substituída pelo comportamento administrativo responsivo;
- postos em uma coluna;
- cards em duas colunas;
- tabela com rolagem horizontal;
- modal ocupa quase toda a viewport;
- ações do modal ficam empilhadas.

## 44. Desempenho

- Usar uma chamada consolidada para a aba Filas.
- Não chamar um endpoint por posto a cada 30 segundos.
- Não recarregar detalhe de todas as senhas antecipadamente.
- Carregar detalhe somente ao abrir o modal.
- Suspender ou espaçar atualização quando a página não estiver visível pode ser
  avaliado como otimização posterior.
- Cancelar requisições antigas quando uma nova carga substituir a anterior.
- Não iniciar vários intervalos ao trocar de aba ou renderizar novamente.
- Limpar `setInterval` ao desmontar a página.

## 45. Ordem recomendada de implementação

### Etapa 1 — domínio e banco

1. adicionar `pendente` aos validators;
2. adicionar `documentosPendentes Json?`;
3. criar migração;
4. padronizar identificadores de documentos;
5. ajustar detalhes de senha.

### Etapa 2 — histórico operacional

1. criar histórico ao chamar;
2. registrar posto e atendente;
3. implementar pausa por pendência;
4. implementar retomada;
5. garantir liberação do guichê.

### Etapa 3 — backend administrativo

1. resumo consolidado;
2. detalhe;
3. transferência transacional;
4. cancelamento;
5. Histórico paginado;
6. indicadores e gráfico;
7. integração com contagem de sessões.

### Etapa 4 — componentes compartilhados

1. generalizar `FilaGrid`;
2. adicionar variantes dos postos;
3. manter compatibilidade com `SidePostos`;
4. adicionar formatters.

### Etapa 5 — frontend administrativo

1. renomear rota/menu para Postos;
2. criar aba Filas;
3. criar pendências;
4. criar detalhe e ações;
5. criar aba Atendimento;
6. adicionar Chart do shadcn;
7. criar aba Histórico;
8. adicionar atualização de 30 segundos;
9. revisar responsividade e acessibilidade.

## 46. Casos de verificação

### 46.1. Filas

- Cada posto mostra somente suas senhas.
- Em atendimento aparece antes de aguardando.
- Total esperando não inclui pendentes.
- Prioritárias podem ser filtradas.
- Totais não mudam ao aplicar filtro visual.
- Áreas podem ser recolhidas.
- Atualização automática ocorre uma vez a cada 30 segundos.

### 46.2. Pendências

- Só existem na Triagem.
- Não aparecem em aguardando.
- São ordenadas por `registradaEm`.
- Tooltip mostra documentos corretos.
- Histórico do Ensino Fundamental usa o identificador correto.
- Não existe botão de transferência.
- Retomada vai direto para em atendimento.

### 46.3. Transferência

- Aguardando pode ser transferida.
- Posto atual não aparece como destino.
- Em atendimento não pode ser transferida.
- Pendente não pode ser transferida.
- Finalizada e cancelada não podem ser transferidas.
- Corrida entre chamada e transferência produz apenas um vencedor.
- Transferida permanece aguardando.

### 46.4. Cancelamento

- Apenas administrador cancela.
- Registro não é apagado.
- Data final é preenchida.
- Sai do fluxo.
- Entra no Histórico.
- Não pode voltar a ser chamada.

### 46.5. Atendimento

- Gráfico conta senhas, não históricos.
- Usa hora de finalização.
- Canceladas não entram nas barras de finalizadas.
- Filtros de curso e período permanecem no dia atual.
- Curso sem matrícula ativa não aparece.

### 46.6. Histórico

- Mostra somente finalizadas e canceladas.
- Usa data de encerramento para pertencer ao dia.
- Pesquisa aceita código formatado e número.
- Pesquisa encontra aluno sem diferenciar acento.
- Filtro de situação funciona.
- Paginação preserva filtros.
- Clique abre detalhe.

### 46.7. Presença

- Login em Triagem incrementa a contagem da Triagem.
- Logout decrementa.
- Expiração remove a sessão ativa.
- A tela mostra somente totais, não nomes.

## 47. Critérios de conclusão

A funcionalidade estará concluída quando:

- o menu exibir Postos;
- a rota administrativa estiver protegida;
- as três abas estiverem implementadas;
- os três postos mostrarem aguardando e em atendimento;
- `FilaGrid` for reutilizado sem quebrar `SidePostos`;
- pendências forem persistidas em JSON;
- pendências forem exclusivas da Triagem;
- pendências não puderem ser transferidas;
- transferência funcionar somente para aguardando;
- cancelamento preservar a senha;
- prioridade atualizar imediatamente;
- gráfico contar finalizadas por hora;
- cursos e candidatos forem apresentados;
- Histórico pesquisar e paginar;
- atualização automática ocorrer a cada 30 segundos;
- atualização manual estiver disponível;
- totais de sessões ativas vierem da autenticação;
- estados vazios, erros e carregamento estiverem tratados;
- interface funcionar com teclado e em telas menores;
- testes de concorrência da transferência passarem.

## 48. O que evitar

- Não transformar a aba Atendimento em cópia de Relatórios.
- Não adicionar filtro de semana, mês ou intervalo.
- Não excluir senha definitivamente.
- Não transferir pendente.
- Não transferir em atendimento.
- Não devolver pendência para aguardando.
- Não contar cada posto como uma finalização no gráfico.
- Não contar canceladas como finalizadas.
- Não mostrar linha do tempo extensa no detalhe inicial.
- Não reutilizar `SidePostos` inteiro.
- Não usar `AtendimentoContext` na administração.
- Não criar um endpoint por card.
- Não confiar somente no frontend para concorrência.
- Não armazenar rótulos em português dentro do JSON.
- Não usar Histórico do Ensino Médio.
- Não criar uma nova tabela de documentos para este checklist fixo.
- Não exibir nomes dos atendentes nesta tela.
- Não deixar vários timers de atualização ativos.

## 49. Resumo da arquitetura

```text
PostosPage
  -> usePostos
     -> GET /admin/postos
     -> prioridade
     -> transferência
     -> cancelamento
  -> Aba Filas
     -> PostoCard x 3
        -> SenhasEmAtendimentoGrid
        -> FilaGrid reutilizado
     -> PendenciasDocumentos
     -> DetalhesSenhaModal
  -> Aba Atendimento
     -> useAtendimentoPostos
     -> indicadores
     -> Chart shadcn
     -> candidatos por curso
     -> cursos ativos
  -> Aba Histórico
     -> useHistoricoPostos
     -> pesquisa e situação
     -> DataTable
     -> paginação

PostosAdminController
  -> PostosAdminService
     -> Senha
     -> HistoricoSenha
     -> Aluno/Curso/oferta
     -> fonte de sessões ativas

Triagem
  -> cria pendência
  -> libera guichê
  -> retoma diretamente em atendimento
```

A tela permanece operacional e focada no dia atual. Relatórios continua sendo a
área responsável por consultas históricas amplas, filtros avançados e
exportações.
