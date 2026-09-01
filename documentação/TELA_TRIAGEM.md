# Tela do Posto de Triagem

## 1. Finalidade deste documento

Este documento é o guia completo de planejamento e implementação da tela do
posto de Triagem do SIGA Phila. Ele define o escopo, a organização visual, os
estados da interface, o fluxo das senhas, a pesquisa e o cadastro de alunos, o
tratamento de documentos pendentes, as alterações necessárias no banco, os
contratos da API, a divisão de responsabilidades entre frontend e backend e os
casos de verificação.

Rota da tela:

```text
/triagem
```

Protótipo visual e funcional de referência:

```text
testes/triagem/index.html
```

Documentação resumida do protótipo:

```text
testes/triagem/doc.md
```

O protótipo usa dados locais apenas para demonstrar a experiência. A
implementação final deve usar o backend e o PostgreSQL como fontes de verdade.

Este arquivo deve ser consultado junto de:

- `documentação/DEFINICOES_FUNCIONAIS_DO_SISTEMA.md`;
- `documentação/TELA_ALUNOS.md`;
- `documentação/TELA_DASHBOARD.md`, quando o ciclo ativo for integrado.

Quando houver divergência sobre pesquisa de aluno, a decisão definitiva é: não
existirá CPF nem pesquisa por CPF. A Triagem pesquisará por nome e selecionará o
registro pelo identificador interno do aluno.

## 2. Escopo definitivo da primeira versão

A primeira versão da nova Triagem deve permitir:

- visualizar as senhas aguardando na etapa de Triagem;
- chamar automaticamente a próxima senha;
- selecionar manualmente uma senha da fila;
- reservar atomicamente a senha para o posto;
- manter um botão manual de **Iniciar atendimento** depois da chamada;
- rechamar somente a senha atual;
- ativar ou remover a prioridade da senha atual;
- pesquisar candidatos e alunos somente pelo nome;
- mostrar sugestões limitadas durante a digitação;
- diferenciar candidatos de alunos já cadastrados;
- selecionar o aluno pelo `idAluno`;
- preencher automaticamente os dados disponíveis;
- permitir a correção dos dados antes da conclusão;
- cadastrar manualmente um aluno não encontrado;
- vincular o aluno e a matrícula à senha;
- expandir opcionalmente a área de documentos;
- selecionar os documentos que estão faltando;
- salvar a senha como pendente na Triagem;
- listar as senhas pendentes em uma área própria;
- consultar os detalhes de uma pendência;
- retomar uma pendência diretamente na Triagem, sem devolvê-la à fila;
- finalizar manualmente o atendimento sem pendência;
- encaminhar a senha finalizada da Triagem para a fila da APM;
- consultar as chamadas do dia em modo somente leitura;
- apresentar estados de carregamento, erro e ausência de dados.

Não pertencem ao refinamento específico desta tela:

- redesenhar o sidepost compartilhado por todos os postos;
- alterar o cabeçalho compartilhado dos postos;
- criar a tela administrativa que define matrícula ou rematrícula;
- resolver a ativação definitiva da matrícula, que pertence à etapa Docs;
- armazenar arquivos, imagens ou números dos documentos;
- permitir que a Triagem cancele definitivamente uma senha;
- permitir rechamada a partir do histórico;
- permitir transferir uma senha pendente para outro posto;
- excluir definitivamente aluno, senha, matrícula ou histórico;
- implementar regras administrativas de importação do CSV;
- armazenar dados do protótipo no `localStorage`.

## 3. Princípios da interface

### 3.1. Uma ação principal por momento

A interface deve deixar clara a próxima ação possível:

```text
Sem senha
  -> chamar ou selecionar uma senha

Senha chamada
  -> rechamar, alterar prioridade ou iniciar atendimento

Atendimento iniciado
  -> localizar aluno, conferir dados e finalizar ou salvar pendência

Pendência selecionada
  -> consultar os documentos e retomar quando autorizado
```

O formulário não deve parecer disponível antes de o atendimento ser iniciado.

### 3.2. Evitar repetição da senha atual

O número, a situação e a prioridade da senha atual permanecem no sidepost. A
área principal não deve criar um segundo card persistente com as mesmas
informações.

A faixa superior do fluxo pode mencionar o código dentro de uma frase de estado,
por exemplo `Senha P002 chamada`, mas não deve duplicar o card completo.

### 3.3. Ações operacionais sempre no topo

Os botões **Rechamar**, **Iniciar atendimento** e **Finalizar atendimento** ficam
na faixa superior do fluxo, antes do formulário.

O atendente não deve precisar percorrer todo o conteúdo para iniciar ou encerrar
um atendimento.

### 3.4. Pendências separadas do formulário

Atendimento atual e senhas pendentes são áreas distintas, apresentadas por abas.
Isso evita exibir simultaneamente fila, formulário, documentos e detalhes de
pendência.

### 3.5. Documentos sob demanda

A área de documentos começa recolhida. Quem não possui pendência documental deve
conseguir concluir o atendimento sem abrir essa área.

## 4. Atores, acesso e sessão

### 4.1. Usuário autorizado

A rota `/triagem` deve exigir:

- sessão autenticada;
- usuário ativo;
- permissão para o posto de Triagem;
- identificação do guichê na sessão atual.

Um atendente vinculado apenas à APM ou Docs não pode acessar a Triagem alterando a
URL manualmente.

### 4.2. Guichê

O guichê não será uma tabela. Ele é um dado da sessão ou do usuário autenticado e
pode mudar a cada login.

O backend deve registrar o guichê no histórico da chamada sem confiar em um valor
enviado livremente pelo formulário.

### 4.3. Uma senha ativa por posto do usuário

O backend deve impedir que o mesmo usuário ou guichê reserve outra senha enquanto
possuir uma senha atual nos estados:

```text
em_atendimento
```

A verificação deve ocorrer no backend. Desabilitar os botões no frontend é apenas
uma proteção visual.

## 5. Conceitos e estados do domínio

### 5.1. Etapas da senha

```text
triagem
apm
docs
```

Este documento trata apenas da etapa `triagem` e da transição para `apm`.

### 5.2. Estados da senha relevantes para a Triagem

```text
aguardando
  -> disponível na fila da Triagem

em_atendimento
  -> chamada e reservada para um posto, mesmo antes do início manual

pendente
  -> permanece na Triagem aguardando os documentos indicados

finalizada
  -> estado usado somente quando todo o fluxo da senha for encerrado em Docs

cancelada
  -> cancelada administrativamente e indisponível para atendimento
```

Ao concluir a Triagem, a senha não se torna `finalizada`. Ela passa para:

```text
etapaSenha: apm
statusSenha: aguardando
```

### 5.3. Fase visual do atendimento

O frontend também precisa distinguir duas fases que compartilham o estado
`em_atendimento` da senha:

```text
CHAMADA
  -> senha reservada, atendimento manual ainda não iniciado

INICIADA
  -> histórico possui horário de início e formulário está liberado
```

Essa diferença não deve ser deduzida apenas do texto do botão. Ela vem do
histórico atual ou da resposta do endpoint de detalhe.

### 5.4. Situação do aluno

```text
CANDIDATO
  -> importado ou cadastrado durante a matrícula, ainda não confirmado em Docs

ATIVO
  -> matrícula confirmada em Docs

ARQUIVADO
  -> registro desativado administrativamente
```

Registros arquivados não aparecem na pesquisa operacional padrão da Triagem.

### 5.5. Situação da matrícula

```text
PENDENTE
  -> vínculo ainda não confirmado em Docs

ATIVA
  -> vínculo confirmado em Docs
```

Salvar uma pendência documental da senha não altera automaticamente
`StatusMatricula`. São conceitos distintos:

- pendência da senha: documento faltante na Triagem;
- matrícula pendente: vínculo ainda não confirmado pela etapa Docs.

## 6. Fluxo principal sem pendência

```text
Senha está aguardando na Triagem
  -> atendente chama a próxima ou seleciona uma senha
  -> backend reserva atomicamente a senha
  -> status da senha muda para em_atendimento
  -> painel de TV recebe a chamada
  -> senha atual aparece no sidepost
  -> atendente pode rechamar ou alterar prioridade
  -> atendente clica em Iniciar atendimento
  -> backend registra o horário de início
  -> pesquisa e formulário são liberados
  -> atendente pesquisa pelo nome
  -> seleciona candidato/aluno ou inicia cadastro manual
  -> dados são preenchidos e conferidos
  -> aluno e matrícula são vinculados à senha
  -> atendente clica em Finalizar atendimento
  -> backend fecha o histórico da Triagem
  -> senha muda para etapa apm e status aguardando
  -> contexto local da Triagem é limpo
  -> próxima senha pode ser chamada
```

## 7. Fluxo principal com pendência

```text
Atendimento foi iniciado
  -> aluno foi selecionado ou cadastrado
  -> dados obrigatórios foram conferidos
  -> atendente expande Documentos e pendências
  -> marca somente os documentos faltantes
  -> clica em Salvar pendência
  -> backend salva os dados do aluno e da matrícula
  -> backend registra documentos e horário da pendência
  -> status da senha muda para pendente
  -> etapa permanece triagem
  -> histórico atual da Triagem é encerrado
  -> senha sai do atendimento atual
  -> senha aparece na aba Senhas pendentes
```

A operação não pode encaminhar a senha para a APM.

## 8. Fluxo de retomada da pendência

Regra funcional já confirmada:

- a senha permanece na Triagem;
- não retorna para a fila de aguardando;
- não pode ser transferida para outro posto;
- ao ser retomada, volta diretamente para `em_atendimento`;
- o backend deve impedir que dois atendentes retomem a mesma pendência;
- o atendente ainda usa o início manual antes de editar o formulário.

Fluxo recomendado:

```text
Atendente abre a aba Senhas pendentes
  -> seleciona uma senha para consultar detalhes
  -> executa a ação explícita Retomar atendimento
  -> backend reserva a pendência atomicamente
  -> cria um novo histórico de passagem pela Triagem
  -> senha volta para em_atendimento
  -> documentos anteriormente faltantes aparecem marcados
  -> atendente clica em Iniciar atendimento
  -> desmarca documentos que foram entregues
  -> se ainda faltar algo, salva novamente como pendente
  -> se não faltar nada, finaliza para a APM
```

O clique simples no card pode apenas selecionar a pendência e mostrar seus
detalhes. A retomada deve ter uma ação explícita para reduzir reservas acidentais.
Essa decisão visual ainda deve ser confirmada antes da implementação final.

## 9. Entrada e recuperação da tela

Ao abrir `/triagem`, o frontend deve carregar em paralelo:

1. senhas aguardando da etapa `triagem`;
2. senha atualmente reservada pelo usuário, se existir;
3. histórico de chamadas do dia;
4. quantidade de pendências da Triagem;
5. detalhes do atendimento atual, quando houver;
6. catálogo de cursos e ofertas necessárias ao formulário.

Se o usuário atualizar o navegador durante um atendimento, a tela deve recuperar
o estado do servidor. Não pode depender apenas do `AtendimentoContext` em memória.

Exemplos de recuperação:

| Situação no servidor | Estado recuperado na interface |
|---|---|
| nenhuma senha atual | formulário bloqueado e chamada disponível |
| senha em atendimento sem horário de início | fase chamada e botão Iniciar disponível |
| histórico com horário de início aberto | formulário liberado e botão Finalizar disponível |
| senha vinculada a aluno | dados do aluno preenchidos |
| pendência retomada | documentos faltantes previamente marcados |

## 10. Estrutura visual da página

### 10.1. Layout geral

```text
┌───────────────────────┬────────────────────────────────────────────┐
│ Sidepost compartilhado│ Cabeçalho do posto                         │
│                       ├────────────────────────────────────────────┤
│ fila / histórico      │ Título Triagem                             │
│ senha atual           │ Abas: Atendimento atual | Senhas pendentes│
│ prioridade            │ Faixa de estado + ações                    │
│                       │ Conteúdo da aba ativa                      │
└───────────────────────┴────────────────────────────────────────────┘
```

### 10.2. Sidepost

O sidepost continua sendo o componente compartilhado entre Triagem, APM e Docs.
Seu refinamento visual geral será planejado separadamente.

Na Triagem, ele continua responsável por:

- quantidade de senhas aguardando;
- botão **Chamar próxima senha**;
- grade das senhas aguardando;
- seleção manual de uma senha;
- card da senha atual;
- alteração da prioridade da senha atual;
- alternância para as chamadas do dia.

Não adicionar a lista de pendências dentro do sidepost nesta versão. Ela possui
uma aba própria na área principal.

### 10.3. Título da página

Exibir:

```text
POSTO DE ATENDIMENTO
Triagem
Localize o aluno, confirme os dados e registre documentos pendentes.
```

Não apresentar um segundo card de senha atual ao lado do título.

### 10.4. Abas principais

```text
Atendimento atual
Senhas pendentes [quantidade]
```

O contador de pendências permanece visível mesmo quando a aba de atendimento
estiver selecionada.

### 10.5. Faixa superior do fluxo

A faixa mostra:

- estado atual em texto curto;
- orientação da próxima ação;
- botão **Rechamar senha**, quando houver senha atual;
- botão **Iniciar atendimento**, quando a senha apenas foi chamada;
- botão **Finalizar atendimento**, quando o atendimento foi iniciado.

Estados esperados:

| Estado | Mensagem | Ações |
|---|---|---|
| sem senha | aguardando uma senha | Iniciar desabilitado |
| chamada | senha chamada e reservada | Rechamar e Iniciar |
| iniciada | atendimento iniciado | Rechamar e Finalizar |

O botão Iniciar desaparece ou é substituído pelo botão Finalizar depois do início.

## 11. Fila, chamada e prioridade

### 11.1. Chamada automática

O botão **Chamar próxima senha** usa a mesma operação da seleção manual, mas sem
enviar `senhaId`.

Ordenação confirmada:

1. senhas prioritárias;
2. data e hora de emissão crescente;
3. identificador crescente para desempate.

### 11.2. Chamada selecionada

Ao clicar em uma senha da grade, o frontend envia seu identificador. O backend
deve reservar somente se ela ainda estiver:

```text
etapaSenha = triagem
statusSenha = aguardando
```

### 11.3. Reserva atômica

A atualização deve usar uma condição atômica. Duas requisições concorrentes não
podem receber sucesso para a mesma senha.

Quando a senha não estiver mais disponível, responder `409 SENHA_INDISPONIVEL` e
recarregar a fila silenciosamente.

### 11.4. Prioridade

A prioridade pode ser ativada ou removida pressionando o mesmo controle no card
da senha atual.

Ela não substitui a situação da senha e não cria outra fila. É uma identificação
persistida em `tipoSenha`.

### 11.5. Rechamada

Rechamar:

- existe somente para a senha atual;
- reenvia a chamada ao painel de TV;
- não altera etapa ou estado;
- não cria outro atendimento;
- não aparece no histórico como ação clicável;
- não pode ser executado para uma senha pendente ainda não retomada.

## 12. Histórico de chamadas do dia

O histórico lateral apresenta as senhas chamadas no dia para a etapa Triagem.

Regras:

- somente leitura;
- sem botão de rechamar;
- sem seleção para reservar atendimento;
- ordenado da chamada mais recente para a mais antiga;
- limitado a registros do dia na zona `America/Sao_Paulo`;
- pode conter mais de uma passagem da mesma senha quando uma pendência foi
  retomada;
- não deve incluir senhas apenas emitidas e nunca chamadas.

## 13. Início manual do atendimento

Chamar e iniciar são ações diferentes.

Ao chamar:

```text
statusSenha = em_atendimento
dataHoraChamada = agora
dataHoraInicioHistorico = null
```

Ao clicar em **Iniciar atendimento**:

```text
dataHoraInicioHistorico = agora
```

Somente depois do sucesso do backend:

- liberar a pesquisa;
- liberar o cadastro manual;
- liberar os campos;
- liberar os documentos;
- mostrar o botão Finalizar.

O endpoint deve ser idempotente para o mesmo histórico aberto: uma repetição não
pode criar atendimentos duplicados.

## 14. Pesquisa de candidatos e alunos

### 14.1. Regra principal

A pesquisa considera somente o nome. Não pesquisar por CPF.

O frontend envia a busca depois de uma pequena espera de digitação, recomendada
entre 250 e 400 ms. Não solicitar a API para cada tecla sem debounce.

### 14.2. Quantidade de resultados

Mostrar no máximo 10 sugestões. A pesquisa operacional não é uma listagem
administrativa paginada.

### 14.3. Informações da sugestão

Cada resultado deve mostrar o suficiente para diferenciar homônimos:

- nome;
- situação: candidato ou aluno;
- curso;
- período;
- cidade;
- classificação, quando houver;
- número de inscrição, quando houver.

Não mostrar CPF.

### 14.4. Seleção

O valor persistido é `idAluno`, nunca o texto do nome.

Se o aluno possuir mais de uma matrícula, a interface deve solicitar qual vínculo
será utilizado. Não escolher silenciosamente a primeira matrícula.

### 14.5. Ausência de resultados

Quando não houver resultados:

```text
Nenhum aluno encontrado.
```

Exibir a ação **Cadastrar novo aluno** sem transformar a ausência de resultados
em erro da página.

### 14.6. Registros arquivados

Alunos arquivados não aparecem por padrão. Caso seja necessário atender um
arquivado, sua reativação continua pertencendo à administração.

## 15. Preenchimento e edição dos dados

Ao selecionar um resultado, preencher:

| Campo | Origem principal |
|---|---|
| nome | `Aluno.nomeAluno` |
| classificação | `CursoAluno.classificacao` |
| escolaridade pública | `Aluno.escolaridadePublica` |
| curso | `CursoAluno.codCurso` |
| cidade | `Aluno.cidadeAluno` |
| sexo | `Aluno.sexoAluno` |
| ano escolar | `CursoAluno.anoEscolar` |
| período | `CursoAluno.periodo` |

Todos esses campos são editáveis na Triagem conforme a decisão do planejamento.

### 15.1. Campos obrigatórios para concluir

- nome;
- curso;
- ano escolar;
- período.

### 15.2. Campos opcionais

- classificação;
- escolaridade pública, quando a origem não possuir o dado;
- cidade;
- sexo;
- número de inscrição.

Um dado opcional vazio não deve ser substituído por informação inventada.

### 15.3. Classificação

Classificação é um número inteiro positivo ou `null`. Ela pertence ao vínculo do
aluno com o curso, não ao aluno isoladamente.

### 15.4. Escolaridade pública

Representar como:

```text
true  -> Sim
false -> Não
null  -> Não informado
```

Não converter ausência de informação em `false`.

### 15.5. Ano escolar

O ano escolar representa `1`, `2` ou `3`. Ele não é o ano do processo seletivo.

Para candidato importado:

```text
anoEscolar sugerido = 1
```

Para aluno existente:

- preencher o ano armazenado;
- solicitar conferência visual;
- permitir atualização;
- não incrementar automaticamente nesta primeira versão sem regra de ciclo
  confirmada.

### 15.6. Curso e período

O período escolhido deve existir entre as ofertas ativas do curso. O backend
deve rejeitar combinações inexistentes ou encerradas.

## 16. Cadastro manual durante a Triagem

O cadastro manual existe quando a pessoa não aparece na pesquisa.

### 16.1. Situação inicial

O aluno criado na Triagem começa como:

```text
Aluno.statusAluno = CANDIDATO
CursoAluno.statusMatricula = PENDENTE
CursoAluno.anoEscolar = valor informado, normalmente 1
```

A ativação ocorre somente ao concluir Docs.

### 16.2. Número de inscrição

Não inventar número de inscrição. Para permitir cadastro manual, o campo deve ser
opcional no banco.

Quando a pessoa possuir o número e o atendente informá-lo, o backend deve validar
a duplicidade do processo correspondente.

### 16.3. Prevenção de duplicidade

Antes de criar, o frontend deve orientar a pesquisa pelo nome. O backend também
deve procurar possíveis registros equivalentes e pode responder conflito quando
o mesmo número de inscrição já existir no processo.

Não bloquear automaticamente apenas por nomes iguais, pois homônimos são
possíveis.

### 16.4. Operação transacional

Criar `Aluno` e `CursoAluno` na mesma transação. Se o vínculo falhar, o aluno não
deve permanecer isolado por causa dessa tentativa.

## 17. Área de documentos

### 17.1. Comportamento visual

A área começa recolhida com o texto:

```text
Documentos e pendências
Opcional — abra somente se houver documento faltante.
```

Ao expandir, apresentar checkboxes. Marcar significa **documento faltante**.

### 17.2. Documentos previstos

Chaves estáveis da API:

```text
RG_CIN
CPF_CIN
FOTO
ESCOLARIDADE_PUBLICA
HISTORICO_ENSINO_FUNDAMENTAL
```

Rótulos:

| Chave | Rótulo |
|---|---|
| `RG_CIN` | RG/CIN |
| `CPF_CIN` | CPF/CIN |
| `FOTO` | Foto |
| `ESCOLARIDADE_PUBLICA` | Comprovação de escolaridade pública |
| `HISTORICO_ENSINO_FUNDAMENTAL` | Histórico do Ensino Fundamental |

### 17.3. Privacidade

O sistema armazena somente a identificação de que um documento está faltando.
Não armazenar:

- número do documento;
- imagem ou cópia;
- arquivo anexado;
- conteúdo do documento;
- observação com dado pessoal desnecessário.

### 17.4. Salvar pendência

O botão **Salvar pendência** exige:

- senha atual;
- atendimento iniciado;
- aluno vinculado;
- campos obrigatórios válidos;
- ao menos um documento selecionado.

Sem documento selecionado, apresentar aviso e permanecer no atendimento.

### 17.5. Finalização normal

Em um atendimento novo, se nenhum documento estiver marcado, a área pode
permanecer fechada e o atendimento pode ser finalizado.

Em uma pendência retomada, os documentos anteriores devem ser carregados
marcados. A finalização para a APM só é permitida depois que todos forem
desmarcados ou removidos da pendência.

## 18. Estrutura da pendência no banco

Usar um campo JSON opcional na senha, conforme a definição funcional
compartilhada.

Nome proposto:

```prisma
pendenciaTriagem Json?
```

Formato:

```json
{
  "documentos": [
    "RG_CIN",
    "FOTO"
  ],
  "registradaEm": "2026-08-22T14:35:00.000Z"
}
```

Regras:

- `documentos` não pode ficar vazio enquanto a senha estiver `pendente`;
- não aceitar chaves fora da lista conhecida;
- remover duplicidades;
- `registradaEm` é gerado pelo servidor;
- a senha deve continuar na etapa `triagem`;
- ao salvar novamente, substituir a lista pelos documentos ainda faltantes;
- ao concluir a Triagem, limpar `pendenciaTriagem`;
- não usar o JSON como substituto do histórico do atendimento.

O voluntário e o guichê são obtidos pelo `HistoricoSenha`, não precisam ser
duplicados dentro do JSON.

## 19. Aba Senhas pendentes

### 19.1. Estrutura

A aba contém:

- título e quantidade;
- grade de senhas baseada visualmente no `FilaGrid`;
- estado vazio;
- painel de detalhes da pendência selecionada.

### 19.2. Conteúdo do card

Cada card deve priorizar:

- código da senha;
- nome do aluno em texto secundário;
- identificação visual de prioridade, quando aplicável.

Os documentos completos aparecem no detalhe, evitando sobrecarregar a grade.

### 19.3. Detalhes

Ao selecionar uma pendência, mostrar:

- código da senha;
- nome do aluno;
- documentos faltantes;
- data e horário do registro;
- curso e período, quando ajudarem na conferência;
- ação explícita de retomada, após confirmação da decisão visual.

### 19.4. Estado vazio

```text
Nenhuma pendência registrada.
As senhas salvas como pendentes aparecerão aqui.
```

### 19.5. Atualização

O contador e a lista devem ser recarregados:

- ao abrir a tela;
- ao salvar uma nova pendência;
- ao retomar uma pendência;
- periodicamente ou por evento em tempo real;
- quando a aba recebe foco novamente.

## 20. Finalização da Triagem

O botão **Finalizar atendimento** fica na faixa superior e só é habilitado quando:

- o atendimento foi iniciado;
- existe aluno vinculado;
- os campos obrigatórios estão válidos;
- não existem documentos faltantes ativos.

Operação do backend:

```text
validar atendimento e usuário
  -> validar os dados de aluno e matrícula já persistidos pela Triagem
  -> limpar pendência anterior, se houver
  -> definir fim do histórico da Triagem
  -> etapaSenha = apm
  -> statusSenha = aguardando
```

Essas alterações devem ocorrer de forma transacional.

As edições do formulário são persistidas antes pela operação de vínculo. A
finalização não recebe um segundo formulário oculto nem repete os dados no corpo.

Depois do sucesso:

- limpar a senha atual;
- limpar o atendimento atual;
- limpar o formulário;
- recolher documentos;
- recarregar fila, histórico e pendências;
- manter a aba Atendimento atual pronta para a próxima senha.

## 21. Ciclo de matrícula e rematrícula

Foi levantada a necessidade de filtrar os resultados conforme o processo ativo:

```text
MATRÍCULA
  -> prioriza candidatos importados para o processo atual

REMATRÍCULA
  -> prioriza alunos ativos que precisam atualizar ano, curso ou período
```

Essa regra depende de uma configuração administrativa ainda não definida.

### Primeira versão sem filtro de processo

Enquanto a configuração não existir:

- pesquisar candidatos e alunos ativos;
- identificar claramente a situação no resultado;
- excluir arquivados;
- não incrementar ano automaticamente;
- exigir conferência do ano escolar.

### Evolução futura

O ciclo ativo poderá receber um tipo:

```text
MATRICULA
REMATRICULA
```

Antes de implementar esse filtro, definir:

- onde o tipo é configurado;
- como o candidato é vinculado ao ciclo;
- como identificar alunos elegíveis para rematrícula;
- se o ano é apenas sugerido ou atualizado automaticamente;
- o comportamento quando não houver ciclo ativo.

Não inferir o tipo pelo mês ou pela data do calendário.

## 22. Alterações necessárias no banco de dados

Esta seção complementa a modelagem proposta em `TELA_ALUNOS.md`.

### 22.1. `Aluno`

Para suportar candidatos importados e cadastro manual:

```prisma
model Aluno {
  idAluno             Int         @id @default(autoincrement())
  numeroInscricao     String?     @db.VarChar(30)
  nomeAluno           String      @db.VarChar(100)
  escolaridadePublica Boolean?
  cidadeAluno         String?     @db.VarChar(100)
  sexoAluno           String?     @db.VarChar(20)
  statusAluno         StatusAluno @default(CANDIDATO)
  anoProcesso         Int?
  semestreProcesso    Int?

  compras      Compra[]
  cursosAluno  CursoAluno[]
  senhas       Senha[]

  @@unique([numeroInscricao, anoProcesso, semestreProcesso])
  @@index([nomeAluno])
  @@index([statusAluno, nomeAluno])
}
```

Diferenças necessárias em relação à importação administrativa:

- `numeroInscricao` aceita `null` para o cadastro manual;
- dados que podem não ser conhecidos no balcão aceitam `null`;
- não inventar valores para cumprir `NOT NULL`;
- CPF continua removido.

### 22.2. `CursoAluno`

Adicionar o ano escolar ao vínculo:

```prisma
model CursoAluno {
  codCurso        Int
  codAluno        Int
  classificacao   Int?
  statusMatricula StatusMatricula @default(PENDENTE)
  periodo         Periodo
  anoEscolar      Int

  curso Curso @relation(fields: [codCurso], references: [idCurso])
  aluno Aluno @relation(fields: [codAluno], references: [idAluno])

  @@id([codCurso, codAluno])
  @@index([codAluno, statusMatricula])
}
```

Regra de domínio:

```text
anoEscolar ∈ {1, 2, 3}
```

`anoProcesso` e `anoEscolar` são dados diferentes.

### 22.3. `Senha`

Adicionar:

```prisma
model Senha {
  // campos existentes
  pendenciaTriagem Json?
}
```

Manter `codAluno` opcional até a seleção ou criação realizada na Triagem.

### 22.4. `HistoricoSenha`

O sistema distingue chamada de início manual. Portanto, o histórico precisa
representar os dois momentos:

```prisma
model HistoricoSenha {
  idHistorico             Int       @id @default(autoincrement())
  codSenha                Int
  codVoluntario           Int
  etapaHistorico          String?   @db.VarChar(15)
  guicheHistorico         String?   @db.VarChar(20)
  dataHoraChamada         DateTime
  dataHoraInicioHistorico DateTime?
  dataHoraFimHistorico    DateTime?
  ultimaRechamadaEm       DateTime?
  quantidadeRechamadas    Int       @default(0)

  senha      Senha      @relation(fields: [codSenha], references: [idSenha])
  voluntario Voluntario @relation(fields: [codVoluntario], references: [idVoluntario])

  @@index([codSenha, etapaHistorico])
  @@index([etapaHistorico, dataHoraChamada])
}
```

`dataHoraInicioHistorico` precisa aceitar `null`, porque uma senha pode ter sido
chamada e ainda não iniciada.

### 22.5. Não criar tabela de pendências

A primeira versão usa o JSON da senha. Não criar uma tabela nova apenas para os
documentos pendentes.

Se futuramente forem necessários histórico de cada documento, anexos, múltiplas
resoluções ou auditoria individual, a modelagem poderá ser reavaliada.

### 22.6. Migração

Se houver dados que precisam ser preservados:

1. adicionar novos campos inicialmente como opcionais;
2. preencher `dataHoraChamada` usando a melhor fonte válida disponível;
3. não copiar automaticamente ano do processo para `anoEscolar`;
4. preencher ano escolar somente quando houver fonte confiável;
5. tornar `anoEscolar` obrigatório depois da correção dos vínculos ativos;
6. remover `cpfAluno` somente depois de atualizar todo o código;
7. criar os índices;
8. regenerar o Prisma Client;
9. atualizar mappers e validadores;
10. testar recuperação de atendimentos abertos.

## 23. Estado atual e alterações necessárias

| Item | Estado atual | Ação necessária |
|---|---|---|
| rota `/triagem` | existe em `App.jsx` | proteger por autenticação e permissão |
| `triagemPage.jsx` | monta `PostoLayout` e `TriagemForm` | substituir pelo novo orquestrador |
| `TriagemForm.jsx` | pesquisa por CPF | remover CPF e implementar pesquisa por nome |
| `AtendimentoContext` | contém CPF, nome, curso, ano e período | adaptar ao novo modelo e à recuperação do servidor |
| `triagemService.js` | chama rotas de cursos, aluno por CPF e vínculo | substituir contratos operacionais |
| `useSelectsTriagem` | carrega cursos e opções fixas | carregar ofertas válidas e manter somente o necessário |
| `SidePostos` | exibe fila e histórico visual | preservar estrutura; integrar histórico real e chamada automática |
| `FilaGrid` | reutilizável para fila | manter e criar modo/componente de pendências sem copiar estilos |
| `HistoricoGrid` | somente leitura | manter sem ação de rechamada |
| `AtendimentoActions` | ações no rodapé | não usar na Triagem refinada; ações ficam no topo |
| `FilaService` backend | chama somente senha selecionada | aceitar chamada automática e validar usuário ativo |
| histórico da fila | frontend chama rota inexistente | implementar rota e service |
| rechamada | service frontend não existe | implementar rota e integração com painel |
| atendimento backend | rotas não montadas no `app.js` | criar e montar |
| aluno operacional | rota não existe | criar pesquisa e cadastro não administrativo |
| `Aluno` | ainda usa CPF e ano no schema atual | migrar conforme Alunos e este documento |
| `Senha` | não possui pendência JSON | adicionar |
| `HistoricoSenha` | não distingue chamada e início | adicionar campos necessários |
| lista de pendências | não existe | implementar frontend e backend |

## 24. Estrutura recomendada de arquivos

### 24.1. Frontend

```text
frontend/src/
├─ pages/
│  └─ triagemPage.jsx
├─ features/
│  └─ triagem/
│     ├─ components/
│     │  ├─ TriagemWorkspace.jsx
│     │  ├─ EstadoAtendimentoTriagem.jsx
│     │  ├─ BuscaAlunoCombobox.jsx
│     │  ├─ DadosAlunoTriagemForm.jsx
│     │  ├─ DocumentosPendencia.jsx
│     │  ├─ PendenciasTriagem.jsx
│     │  └─ DetalhePendenciaTriagem.jsx
│     ├─ hooks/
│     │  ├─ useTriagem.js
│     │  ├─ useBuscaAlunos.js
│     │  └─ usePendenciasTriagem.js
│     └─ constants/
│        └─ triagem.js
├─ services/
│  ├─ triagemService.js
│  ├─ filaService.js
│  └─ atendimentoService.js
└─ components/
   ├─ layout/
   │  ├─ PostoLayout.jsx
   │  └─ SidePostos.jsx
   └─ Fila/
      ├─ FilaGrid.jsx
      └─ HistoricoGrid.jsx
```

O domínio da Triagem pode migrar de `components/layout/TriagemForm.jsx` para
`features/triagem`. `layout` deve conter estrutura compartilhada, não regras
específicas de aluno e documentos.

### 24.2. Backend

```text
backend/src/
├─ routes/
│  ├─ filaRoutes.js
│  ├─ senhaRoutes.js
│  ├─ atendimentoRoutes.js
│  └─ alunoRoutes.js
├─ controllers/
│  ├─ FilaController.js
│  ├─ SenhaController.js
│  ├─ AtendimentoController.js
│  └─ AlunoController.js
├─ services/
│  ├─ FilaService.js
│  ├─ SenhaService.js
│  ├─ AtendimentoService.js
│  ├─ HistoricoSenhaService.js
│  └─ AlunoService.js
├─ validators/
│  ├─ ValidatorFila.js
│  ├─ ValidatorSenha.js
│  ├─ ValidatorAtendimento.js
│  └─ ValidatorAlunos.js
└─ models/
   └─ Aluno.js
```

Não criar repository adicional nesta etapa. As regras transacionais pertencem
aos services.

## 25. Componentes existentes que devem ser reutilizados

| Componente ou função | Uso na Triagem |
|---|---|
| `PostoLayout` | estrutura compartilhada do posto |
| `SidePostos` | fila, senha atual e histórico |
| `FilaGrid` | grade de aguardando e referência da grade pendente |
| `HistoricoGrid` | chamadas do dia somente leitura |
| `Header` | sessão e logout |
| `Button` | ações do fluxo |
| `Input` | campos editáveis e pesquisa, quando compatível com combobox |
| `Select` | curso, período, ano, sexo e escolaridade |
| `Alert` | erros e avisos globais |
| `Modal` | somente se a confirmação de retomada exigir modal |
| `requisitarApi` | todas as chamadas HTTP |
| `ApiError` | erros normalizados |
| `AuthContext` | usuário e sessão |
| `AtendimentoContext` | senha e atendimento atuais compartilhados com o layout |

Não copiar componentes globais para dentro da feature.

## 26. Responsabilidade dos componentes da Triagem

### `TriagemWorkspace.jsx`

Orquestra:

- abas;
- faixa de estado;
- formulário;
- pendências;
- ações de iniciar, finalizar e salvar pendência.

Não chama `fetch` diretamente.

### `EstadoAtendimentoTriagem.jsx`

Recebe o estado atual e apresenta as ações permitidas.

Props esperadas:

```js
{
  senhaAtual,
  fase,
  carregando,
  podeFinalizar,
  onRechamar,
  onIniciar,
  onFinalizar,
}
```

### `BuscaAlunoCombobox.jsx`

Responsável por:

- input de pesquisa;
- debounce;
- sugestões;
- navegação por teclado;
- estado vazio;
- seleção pelo identificador;
- ação de novo cadastro.

Não atualiza o banco diretamente.

### `DadosAlunoTriagemForm.jsx`

Renderiza os dados editáveis. Recebe valores, erros e callbacks. Não conhece a
fila nem finaliza atendimento.

### `DocumentosPendencia.jsx`

Controla somente a expansão e a seleção visual dos documentos. A persistência é
emitida por callback.

### `PendenciasTriagem.jsx`

Renderiza contador, grade, estado vazio e seleção atual. Não deve reutilizar
`FilaGrid` se isso exigir comportamentos de chamada inadequados; pode extrair uma
base visual compartilhada ou oferecer um modo explícito de pendência.

### `DetalhePendenciaTriagem.jsx`

Apresenta dados e documentos da pendência selecionada. A ação de retomada deve
ser explícita e desabilitada quando o usuário já possui senha atual.

## 27. Constants do frontend

Arquivo sugerido:

```text
frontend/src/features/triagem/constants/triagem.js
```

Conteúdo mínimo:

```js
export const ETAPA_TRIAGEM = "triagem";
export const LIMITE_BUSCA_ALUNOS = 10;
export const DEBOUNCE_BUSCA_ALUNOS_MS = 300;

export const DOCUMENTOS_TRIAGEM = [
  { value: "RG_CIN", label: "RG/CIN" },
  { value: "CPF_CIN", label: "CPF/CIN" },
  { value: "FOTO", label: "Foto" },
  {
    value: "ESCOLARIDADE_PUBLICA",
    label: "Comprovação de escolaridade pública",
  },
  {
    value: "HISTORICO_ENSINO_FUNDAMENTAL",
    label: "Histórico do Ensino Fundamental",
  },
];

export const FASE_ATENDIMENTO = {
  SEM_SENHA: "sem_senha",
  CHAMADA: "chamada",
  INICIADA: "iniciada",
};
```

Não duplicar rótulos de documentos em componentes e services.

## 28. Contexto e estado do frontend

### 28.1. `AtendimentoContext`

Continuará responsável por dados compartilhados entre layout e posto:

```js
{
  senhaAtual,
  atendimentoAtual,
  faseAtendimento,
  dadosAluno,
  matriculaSelecionada,
  documentosPendentes,
  carregando,
  erro,
}
```

Remover `cpf` do estado inicial.

### 28.2. Estado local

Permanecem locais à feature:

- termo de pesquisa;
- sugestões;
- abertura do combobox;
- aba selecionada;
- pendência selecionada;
- expansão dos documentos;
- erros por campo.

### 28.3. Não armazenar no navegador

Não salvar em `localStorage`:

- dados do aluno;
- documentos faltantes;
- senha atual;
- pendências;
- histórico;
- sugestões de pesquisa.

O servidor é a fonte de recuperação.

## 29. Hooks do frontend

### `useTriagem`

Responsável pelo fluxo do atendimento:

- recuperar estado atual;
- iniciar;
- salvar dados;
- finalizar;
- salvar pendência;
- limpar estado após sucesso.

### `useBuscaAlunos`

Responsável por:

- debounce;
- cancelamento de requisição anterior;
- limite de resultados;
- carregamento e erro da busca;
- seleção do resultado.

Uma resposta antiga não pode substituir uma pesquisa mais recente.

### `usePendenciasTriagem`

Responsável por:

- listar pendências;
- atualizar contador;
- selecionar detalhe;
- retomar pendência;
- sincronizar depois de salvar ou retomar.

### `useFila`

Continua responsável pelas senhas aguardando. Deve permitir atualização
silenciosa depois de chamadas concorrentes.

## 30. Resumo das rotas da API

| Método e rota | Responsabilidade |
|---|---|
| `GET /filas?etapa=triagem` | listar aguardando |
| `POST /filas/chamadas` | chamar próxima ou selecionada |
| `GET /filas/atual?etapa=triagem` | recuperar senha atual do usuário |
| `GET /filas/historico?etapa=triagem` | chamadas do dia |
| `POST /filas/chamadas/:senhaId/rechamadas` | rechamar atual |
| `GET /filas/pendencias?etapa=triagem` | listar pendências |
| `POST /filas/pendencias/:senhaId/retomadas` | retomar pendência |
| `PATCH /senhas/:senhaId/prioridade` | alterar prioridade |
| `GET /senhas/:senhaId/detalhe` | recuperar senha, aluno e histórico |
| `POST /atendimentos` | iniciar manualmente |
| `POST /atendimentos/:atendimentoId/pendencias` | salvar pendência |
| `POST /atendimentos/:atendimentoId/finalizacoes` | concluir Triagem |
| `GET /alunos?nome=...` | pesquisa operacional por nome |
| `POST /alunos` | cadastro manual operacional |
| `PUT /senhas/:senhaId/aluno` | salvar e vincular dados da Triagem |

As rotas de alunos desta tela não usam o prefixo `/admin`.

## 31. Contrato: fila e chamada

### 31.1. `GET /filas?etapa=triagem`

Resposta `200 OK`:

```json
{
  "senhas": [
    {
      "id": 15,
      "codigo": 42,
      "etapaAtual": "triagem",
      "status": "aguardando",
      "tipoSenha": false,
      "emitidaEm": "2026-08-22T13:20:00.000Z"
    }
  ],
  "total": 1
}
```

Ordenar conforme prioridade e emissão.

### 31.2. `POST /filas/chamadas`

Chamada automática:

```json
{
  "etapa": "triagem"
}
```

Chamada selecionada:

```json
{
  "etapa": "triagem",
  "senhaId": 15
}
```

`senhaId` é opcional. O validator atual deve ser alterado.

Resposta `200 OK`:

```json
{
  "senha": {
    "id": 15,
    "codigo": 42,
    "etapaAtual": "triagem",
    "status": "em_atendimento",
    "tipoSenha": false
  },
  "historico": {
    "id": 81,
    "chamadaEm": "2026-08-22T13:25:00.000Z",
    "iniciadaEm": null
  }
}
```

### 31.3. `GET /filas/atual?etapa=triagem`

Resposta com senha atual:

```json
{
  "senha": {
    "id": 15,
    "codigo": 42,
    "etapaAtual": "triagem",
    "status": "em_atendimento",
    "tipoSenha": false
  },
  "historico": {
    "id": 81,
    "chamadaEm": "2026-08-22T13:25:00.000Z",
    "iniciadaEm": null
  }
}
```

Sem senha atual:

```json
{
  "senha": null,
  "historico": null
}
```

## 32. Contrato: rechamada e prioridade

### 32.1. `POST /filas/chamadas/:senhaId/rechamadas`

Corpo:

```json
{
  "etapa": "triagem"
}
```

Resposta:

```json
{
  "message": "Senha chamada novamente.",
  "rechamadaEm": "2026-08-22T13:27:00.000Z",
  "quantidadeRechamadas": 1
}
```

Validar que a senha é a atual do usuário e está `em_atendimento`.

### 32.2. `PATCH /senhas/:senhaId/prioridade`

Corpo:

```json
{
  "tipoSenha": true
}
```

O mesmo endpoint recebe `false` para remover.

## 33. Contrato: histórico e pendências

### 33.1. `GET /filas/historico?etapa=triagem`

Resposta:

```json
{
  "senhas": [
    {
      "id": 15,
      "codigo": 42,
      "tipoSenha": false,
      "chamadaEm": "2026-08-22T13:25:00.000Z"
    }
  ]
}
```

Não devolver uma propriedade que induza ação de rechamada no histórico.

### 33.2. `GET /filas/pendencias?etapa=triagem`

Resposta:

```json
{
  "pendencias": [
    {
      "senha": {
        "id": 15,
        "codigo": 42,
        "tipoSenha": false
      },
      "aluno": {
        "id": 9,
        "nome": "Mariane Trindade Verro Cunha"
      },
      "matricula": {
        "curso": "Desenvolvimento de Sistemas",
        "periodo": "Manhã",
        "anoEscolar": 1
      },
      "documentos": ["RG_CIN", "FOTO"],
      "registradaEm": "2026-08-22T13:40:00.000Z"
    }
  ],
  "total": 1
}
```

Ordenação:

```text
registradaEm crescente
idSenha crescente para desempate
```

### 33.3. `POST /filas/pendencias/:senhaId/retomadas`

Corpo:

```json
{
  "etapa": "triagem"
}
```

Resposta:

```json
{
  "senha": {
    "id": 15,
    "codigo": 42,
    "etapaAtual": "triagem",
    "status": "em_atendimento",
    "tipoSenha": false
  },
  "historico": {
    "id": 95,
    "chamadaEm": "2026-08-22T15:10:00.000Z",
    "iniciadaEm": null
  },
  "documentos": ["RG_CIN", "FOTO"]
}
```

O backend deve validar atomicamente:

- senha está `pendente`;
- etapa é `triagem`;
- usuário não possui outra senha atual;
- pendência possui documentos;
- usuário tem permissão para a Triagem.

## 34. Contrato: início do atendimento

### `POST /atendimentos`

Corpo:

```json
{
  "senhaId": 15
}
```

Resposta:

```json
{
  "atendimento": {
    "id": 95,
    "senhaId": 15,
    "etapa": "triagem",
    "chamadoEm": "2026-08-22T15:10:00.000Z",
    "iniciadoEm": "2026-08-22T15:11:00.000Z",
    "finalizadoEm": null
  }
}
```

O identificador do atendimento pode ser o próprio `idHistorico`. Não criar outra
tabela de atendimento apenas para fornecer um ID diferente.

## 35. Contrato: pesquisa e cadastro do aluno

### 35.1. `GET /alunos?nome=mariane&limite=10`

Query:

| Campo | Tipo | Obrigatório | Regra |
|---|---|---:|---|
| `nome` | texto | sim | 2 a 100 caracteres |
| `limite` | inteiro | não | padrão 10, máximo 20 |

Resposta:

```json
{
  "alunos": [
    {
      "id": 9,
      "nome": "Mariane Trindade Verro Cunha",
      "numeroInscricao": "00012345",
      "situacao": "CANDIDATO",
      "escolaridadePublica": true,
      "cidade": "Orindiúva",
      "sexo": "Feminino",
      "matriculas": [
        {
          "cursoId": 3,
          "curso": "Desenvolvimento de Sistemas",
          "classificacao": 3,
          "periodo": "manha",
          "anoEscolar": 1,
          "situacao": "PENDENTE"
        }
      ]
    }
  ]
}
```

Pesquisar sem diferenciar maiúsculas, minúsculas e acentos, mantendo o valor
original no retorno.

### 35.2. `POST /alunos`

Corpo:

```json
{
  "nome": "Novo Aluno",
  "numeroInscricao": null,
  "escolaridadePublica": null,
  "cidade": "Orindiúva",
  "sexo": null,
  "matricula": {
    "cursoId": 3,
    "classificacao": null,
    "periodo": "manha",
    "anoEscolar": 1
  }
}
```

Resposta `201 Created` no mesmo formato público da pesquisa.

## 36. Contrato: vínculo e edição da Triagem

### `PUT /senhas/:senhaId/aluno`

Corpo para aluno existente:

```json
{
  "alunoId": 9,
  "dadosAluno": {
    "nome": "Mariane Trindade Verro Cunha",
    "escolaridadePublica": true,
    "cidade": "Orindiúva",
    "sexo": "Feminino"
  },
  "matricula": {
    "cursoIdOriginal": 3,
    "cursoId": 3,
    "classificacao": 3,
    "periodo": "manha",
    "anoEscolar": 1
  }
}
```

O endpoint deve:

- validar que a senha pertence ao atendimento atual do usuário;
- permitir somente etapa Triagem;
- atualizar campos permitidos;
- validar curso e oferta;
- vincular `Senha.codAluno`;
- atualizar o vínculo selecionado;
- executar alterações relacionadas em transação;
- devolver aluno, matrícula e senha atualizados.

Se o curso for alterado, o service deve tratar o vínculo composto de forma
transacional e impedir duplicidade com outro vínculo já existente.

## 37. Contrato: salvar pendência

### `POST /atendimentos/:atendimentoId/pendencias`

Corpo:

```json
{
  "documentos": ["RG_CIN", "FOTO"]
}
```

Resposta:

```json
{
  "message": "Pendência registrada na Triagem.",
  "senha": {
    "id": 15,
    "codigo": 42,
    "etapaAtual": "triagem",
    "status": "pendente"
  },
  "pendencia": {
    "documentos": ["RG_CIN", "FOTO"],
    "registradaEm": "2026-08-22T15:20:00.000Z"
  }
}
```

Transação:

1. validar histórico aberto e iniciado;
2. validar aluno vinculado;
3. validar documentos;
4. atualizar `Senha.pendenciaTriagem`;
5. definir `statusSenha = pendente`;
6. manter `etapaSenha = triagem`;
7. definir fim do histórico atual;
8. confirmar todas as alterações juntas.

## 38. Contrato: finalizar atendimento

### `POST /atendimentos/:atendimentoId/finalizacoes`

Não exige corpo quando os dados já foram salvos pelo endpoint de vínculo.

Resposta:

```json
{
  "message": "Triagem finalizada.",
  "senha": {
    "id": 15,
    "codigo": 42,
    "etapaAtual": "apm",
    "status": "aguardando"
  },
  "historico": {
    "id": 95,
    "finalizadoEm": "2026-08-22T15:25:00.000Z"
  }
}
```

O backend deve impedir a conclusão quando:

- não existe aluno vinculado;
- não existe matrícula válida;
- atendimento não foi iniciado;
- histórico já foi fechado;
- senha possui documentos pendentes;
- usuário não é dono do atendimento;
- senha não está na Triagem.

## 39. Validators do backend

### Fila

- `etapa` deve ser `triagem`, `apm` ou `docs`;
- `senhaId` é opcional na chamada e, quando enviado, é inteiro positivo;
- rechamada exige identificador inteiro positivo;
- retomada aceita somente senha pendente da Triagem.

### Pesquisa

- remover espaços externos;
- nome entre 2 e 100 caracteres;
- limite entre 1 e 20;
- rejeitar query administrativa não suportada.

### Aluno

- nome obrigatório, normalizado e até 100 caracteres;
- número de inscrição opcional e até 30 caracteres;
- classificação inteira positiva ou `null`;
- escolaridade pública booleana ou `null`;
- cidade até 100 caracteres ou `null`;
- sexo até 20 caracteres ou `null`;
- curso inteiro positivo;
- ano escolar entre 1 e 3;
- período pertencente ao enum.

### Documentos

- array obrigatório;
- ao menos um item para salvar pendência;
- somente chaves conhecidas;
- sem duplicidades;
- quantidade máxima igual à lista oficial.

## 40. Regras transacionais e concorrência

As seguintes operações devem ser atômicas:

- chamar uma senha;
- retomar uma pendência;
- criar aluno e matrícula;
- alterar curso de uma matrícula;
- vincular aluno à senha;
- salvar pendência;
- finalizar a Triagem.

Condições que o backend deve proteger:

- dois atendentes chamando a mesma senha;
- dois atendentes retomando a mesma pendência;
- um atendente chamando enquanto já possui senha atual;
- finalização simultânea repetida;
- pendência salva depois que outro fluxo finalizou a senha;
- alteração de aluno por usuário que não possui o atendimento.

O frontend não deve tentar resolver concorrência apenas removendo cards localmente.

## 41. Erros de domínio

Formato:

```json
{
  "message": "Não foi possível concluir a operação.",
  "code": "CODIGO_ESTAVEL",
  "details": {}
}
```

Erros previstos:

| HTTP | Código | Situação |
|---:|---|---|
| 400 | `DADOS_INVALIDOS` | corpo, query ou parâmetro inválido |
| 401 | `NAO_AUTENTICADO` | sessão ausente ou expirada |
| 403 | `ACESSO_TRIAGEM_NEGADO` | usuário sem permissão |
| 404 | `SENHA_NAO_ENCONTRADA` | senha inexistente |
| 404 | `ALUNO_NAO_ENCONTRADO` | aluno inexistente |
| 404 | `ATENDIMENTO_NAO_ENCONTRADO` | histórico inexistente |
| 409 | `SENHA_INDISPONIVEL` | senha já reservada ou fora da fila |
| 409 | `ATENDIMENTO_ATIVO_EXISTENTE` | usuário já possui senha atual |
| 409 | `ATENDIMENTO_JA_INICIADO` | repetição incompatível do início |
| 409 | `ATENDIMENTO_JA_FINALIZADO` | histórico já fechado |
| 409 | `PENDENCIA_INDISPONIVEL` | pendência já retomada |
| 409 | `ALUNO_JA_CADASTRADO` | número de inscrição duplicado |
| 409 | `MATRICULA_JA_EXISTENTE` | vínculo de curso duplicado |
| 409 | `DOCUMENTOS_PENDENTES` | tentativa de finalizar com pendência |
| 422 | `DOCUMENTO_PENDENTE_INVALIDO` | chave desconhecida |
| 422 | `CURSO_PERIODO_INVALIDO` | oferta não pertence ao curso |
| 422 | `ANO_ESCOLAR_INVALIDO` | ano fora de 1 a 3 |
| 422 | `ETAPA_INVALIDA` | operação incompatível com a etapa |

Não incluir nomes completos, documentos ou dados pessoais em logs de erro.

## 42. Responsabilidades dos services do backend

### `FilaService`

- listar aguardando;
- ordenar prioridade e emissão;
- reservar próxima ou selecionada;
- recuperar senha atual do usuário;
- listar histórico do dia;
- rechamar;
- listar pendências;
- retomar pendência;
- garantir concorrência e etapa.

### `AtendimentoService`

- iniciar histórico atual;
- validar propriedade do atendimento;
- salvar pendência;
- finalizar etapa;
- avançar para APM;
- manter operações transacionais.

### `AlunoService`

- pesquisa operacional por nome;
- excluir arquivados;
- carregar matrículas;
- criar aluno manual e vínculo;
- atualizar dados permitidos;
- validar oferta de curso;
- reutilizar regras da importação sem expor rota administrativa.

### `SenhaService`

- alterar prioridade;
- consultar detalhe;
- mapear estado e pendência;
- manter regras gerais da senha.

### `HistoricoSenhaService`

- criar histórico na chamada e retomada;
- registrar início;
- registrar rechamada;
- encerrar passagem;
- consultar histórico do dia.

Controllers devem apenas validar entrada, chamar services e mapear resposta.

## 43. Services do frontend

### `filaService.js`

Adicionar ou ajustar:

```js
listarFila(etapa)
chamarProximaSenha(etapa)
chamarSenhaSelecionada(senhaId, etapa)
obterSenhaAtual(etapa)
listarChamadasHoje(etapa)
rechamarSenha(senhaId, etapa)
listarPendencias(etapa)
retomarPendencia(senhaId, etapa)
atualizarPrioridadeSenha(senhaId, tipoSenha)
```

### `atendimentoService.js`

```js
obterDetalheSenha(senhaId)
iniciarAtendimento(senhaId)
salvarPendencia(atendimentoId, documentos)
finalizarAtendimento(atendimentoId)
```

### `triagemService.js`

```js
pesquisarAlunosPorNome(nome, limite)
cadastrarAlunoNaTriagem(dados)
salvarDadosDaTriagem(senhaId, dados)
listarCursosDisponiveis()
```

Remover `buscarAlunoPorCpf`.

Todos devem usar `requisitarApi` e normalizar respostas em um único local.

## 44. Estados da interface

### 44.1. Carregamento inicial

Mostrar um estado de carregamento sem ocultar completamente o layout. Não exibir
formulário habilitado antes de recuperar a senha atual.

### 44.2. Carregamento da fila

Durante atualização silenciosa, manter a lista anterior. Em falha, apresentar
aviso sem apagar as senhas já visíveis.

### 44.3. Busca de aluno

Estados:

- aguardando texto mínimo;
- buscando;
- resultados;
- nenhum resultado;
- erro recuperável.

Erro da busca não deve encerrar o atendimento.

### 44.4. Salvamento

Durante iniciar, finalizar, salvar pendência ou retomar:

- desabilitar a ação enviada;
- impedir duplo clique;
- manter o texto visível;
- mostrar indicador de progresso;
- preservar dados em caso de erro;
- limpar somente após sucesso.

### 44.5. Falha de concorrência

Em `SENHA_INDISPONIVEL` ou `PENDENCIA_INDISPONIVEL`:

- informar que outro atendente assumiu o registro;
- recarregar as listas;
- não manter a senha como atual localmente.

### 44.6. Sessão expirada

Limpar dados pessoais da memória e redirecionar para login pelo fluxo global de
autenticação.

## 45. Acessibilidade

- associar todos os labels aos campos;
- implementar o resultado da pesquisa como combobox acessível;
- permitir setas, Enter e Escape nas sugestões;
- informar expansão de documentos com `aria-expanded`;
- agrupar documentos em `fieldset` com legenda;
- não depender somente de cor para prioridade, sucesso ou pendência;
- manter foco visível;
- mover foco para a pesquisa depois do início bem-sucedido;
- devolver foco à ação adequada após fechar sugestão;
- anunciar mensagens assíncronas em região `aria-live`;
- usar `role="alert"` para erros que exigem correção;
- histórico deve usar elementos não interativos;
- cards de pendência devem ter nome acessível completo;
- botões devem manter rótulos visíveis, não apenas ícones.

## 46. Responsividade

### Desktop

- sidepost fixo;
- conteúdo principal flexível;
- ações no topo alinhadas à direita;
- formulário em grade;
- pendências em grade com detalhe lateral.

### Largura intermediária

- reduzir colunas do formulário;
- manter ações no topo com quebra de linha;
- empilhar lista e detalhe de pendência quando necessário.

### Tela estreita

- sidepost deixa de ocupar coluna fixa;
- campos ficam em uma coluna;
- ações ocupam largura disponível;
- documentos ficam em uma coluna;
- pendências usam duas ou uma coluna;
- evitar rolagem horizontal da página.

A ordem do DOM deve continuar lógica quando os blocos forem empilhados.

## 47. Segurança e privacidade

- autenticar todas as rotas operacionais, exceto emissão pública quando aplicável;
- autorizar a função Triagem no backend;
- obter voluntário e guichê da sessão;
- não aceitar `voluntarioId` livre enviado pelo cliente;
- não armazenar CPF;
- não armazenar cópia de documento;
- não retornar alunos arquivados na pesquisa padrão;
- limitar tamanho e quantidade dos resultados;
- escapar textos na interface;
- não incluir dados pessoais em logs;
- não guardar formulário no `localStorage`;
- limpar contexto no logout e em resposta `401`;
- impedir acesso a atendimento pertencente a outro usuário.

## 48. Atualização e desempenho

- fila pode continuar com atualização periódica de aproximadamente 5 segundos;
- pendências podem usar o mesmo intervalo ou evento em tempo real;
- busca usa debounce e limite;
- chamadas e retomadas não aguardam o próximo polling para atualizar localmente;
- consultas devem selecionar apenas campos necessários;
- índices de nome, situação, etapa, estado e horário devem sustentar as consultas;
- evitar carregar todas as pendências quando a quantidade crescer; preparar
  paginação ou limite no backend, ainda que a primeira versão tenha poucos dados;
- painel de TV deve receber evento de chamada e rechamada, não polling em alta
  frequência.

## 49. Ordem recomendada de implementação

### Etapa 1 — alinhar banco e Alunos

1. aplicar a modelagem de Alunos;
2. remover CPF;
3. permitir número de inscrição opcional para cadastro manual;
4. adicionar ano escolar em `CursoAluno`;
5. adicionar pendência JSON em `Senha`;
6. separar chamada e início no histórico;
7. criar migration e regenerar Prisma.

### Etapa 2 — fila e histórico

1. chamada automática com `senhaId` opcional;
2. vínculo com usuário e guichê;
3. recuperação da senha atual;
4. histórico do dia;
5. rechamada;
6. prioridade;
7. testes de concorrência.

### Etapa 3 — alunos operacionais

1. pesquisa por nome;
2. mappers públicos;
3. cadastro manual transacional;
4. validação de curso e oferta;
5. vínculo e edição pela Triagem.

### Etapa 4 — atendimento

1. início manual;
2. recuperação após atualização;
3. finalização para APM;
4. transações e idempotência.

### Etapa 5 — pendências

1. salvar pendência;
2. listar e detalhar;
3. contador;
4. retomada atômica;
5. recarregar documentos anteriores;
6. concluir ou salvar novamente.

### Etapa 6 — frontend refinado

1. reorganizar componentes;
2. mover ações para o topo;
3. remover card duplicado da senha;
4. implementar combobox;
5. implementar formulário;
6. implementar documentos recolhíveis;
7. implementar aba de pendências;
8. ajustar acessibilidade e responsividade;
9. testar recuperação e erros.

### Etapa 7 — processo ativo

Executar somente depois de confirmar matrícula/rematrícula e sua configuração
administrativa.

## 50. Casos de verificação

### 50.1. Fila e chamada

- chama senha prioritária antes da comum;
- respeita emissão dentro da mesma prioridade;
- chama automaticamente sem `senhaId`;
- chama selecionada com `senhaId`;
- impede dois atendentes na mesma senha;
- impede nova chamada com atendimento ativo;
- atualiza painel de TV;
- recarrega fila após conflito.

### 50.2. Início e recuperação

- formulário permanece bloqueado depois da chamada;
- Iniciar fica no topo e é habilitado na fase correta;
- iniciar registra horário;
- atualização do navegador recupera fase chamada;
- atualização recupera fase iniciada;
- não cria dois históricos ao repetir a requisição.

### 50.3. Pesquisa

- pesquisa por nome parcial;
- ignora caixa e acentos;
- limita resultados;
- não pesquisa CPF;
- diferencia homônimos;
- exclui arquivados;
- seleciona por `idAluno`;
- permite escolher matrícula quando houver mais de uma;
- ignora resposta antiga depois de nova digitação.

### 50.4. Dados

- candidato recebe sugestão de 1º ano;
- aluno existente mostra ano atual;
- todos os campos podem ser corrigidos;
- obrigatórios bloqueiam conclusão;
- classificação aceita `null`;
- escolaridade aceita não informado;
- curso e período incompatíveis são rejeitados;
- ano do processo não é usado como ano escolar.

### 50.5. Cadastro manual

- cria aluno sem número de inscrição;
- não inventa número;
- cria matrícula na mesma transação;
- candidato começa pendente;
- conflito de inscrição não duplica registro;
- falha da matrícula desfaz criação do aluno.

### 50.6. Documentos e pendência

- área começa fechada;
- atendimento normal não exige abri-la;
- marcar significa faltante;
- salvar sem item mostra aviso;
- salvar com itens mantém etapa Triagem;
- senha muda para pendente;
- JSON contém somente chaves e horário;
- pendência aparece na aba e no contador;
- não transfere para APM;
- dados do aluno são preservados.

### 50.7. Retomada

- pendência não aparece na fila aguardando;
- somente um atendente consegue retomar;
- volta diretamente para `em_atendimento`;
- cria nova passagem no histórico;
- mantém documentos marcados;
- permite salvar novamente com itens restantes;
- permite finalizar apenas sem documentos restantes.

### 50.8. Histórico e rechamada

- histórico lista chamadas do dia;
- histórico não contém botão;
- clicar histórico não chama senha;
- Rechamar aparece somente para atual;
- rechamada não cria atendimento novo;
- prioridade alterna nos dois sentidos.

### 50.9. Finalização

- exige atendimento iniciado;
- exige aluno e matrícula;
- bloqueia documentos ativos;
- fecha histórico;
- move para APM aguardando;
- não marca senha como finalizada;
- limpa interface somente após sucesso;
- repetição não avança duas vezes.

### 50.10. Interface

- senha atual não possui card duplicado no cabeçalho;
- Iniciar e Finalizar permanecem no topo;
- abas mantêm contador;
- layout funciona em diferentes larguras;
- navegação por teclado funciona;
- mensagens são anunciadas;
- dados não ficam visíveis após logout.

## 51. Critérios de conclusão

A tela estará concluída quando:

- não houver CPF na Triagem;
- a pesquisa por nome usar dados reais;
- chamada automática e selecionada forem atômicas;
- senha atual for recuperável após recarregar;
- início manual estiver separado da chamada;
- ações estiverem no topo;
- dados importados forem preenchidos e editáveis;
- cadastro manual funcionar sem inventar inscrição;
- aluno e matrícula forem vinculados à senha;
- pendências forem salvas, listadas e retomadas;
- documentos persistirem em formato validado;
- finalização encaminhar corretamente à APM;
- histórico for somente leitura;
- prioridade e rechamada funcionarem;
- permissões forem validadas no backend;
- concorrência tiver testes;
- estados de erro e vazio estiverem tratados;
- acessibilidade e responsividade forem verificadas;
- não houver dependência de dados locais do protótipo.

## 52. O que evitar

- manter pesquisa por CPF;
- repetir a senha atual em vários cards;
- deixar Iniciar no fim do formulário;
- iniciar automaticamente apenas por chamar;
- permitir formulário antes do início manual;
- usar o histórico para rechamada;
- mover pendência para outra etapa;
- devolver pendência para aguardando;
- armazenar cópias ou números de documentos;
- misturar pendência documental com status da matrícula;
- escolher silenciosamente a primeira matrícula;
- usar nome como identificador;
- inventar inscrição, cidade, sexo ou escolaridade;
- copiar ano do processo para ano escolar;
- filtrar matrícula/rematrícula por data sem configuração;
- criar tabela de pendência sem nova decisão;
- fazer chamadas concorrentes sem condição atômica;
- confiar apenas em botões desabilitados;
- limpar formulário antes da confirmação do backend;
- salvar dados pessoais no navegador;
- duplicar componentes globais;
- colocar regras de negócio nos controllers ou componentes.

## 53. Decisões ainda abertas

As decisões abaixo não impedem o restante do planejamento, mas precisam ser
confirmadas antes de suas etapas específicas:

1. formato exato da ação visual para retomar pendência;
2. configuração administrativa de matrícula ou rematrícula;
3. vínculo formal do candidato com o ciclo ativo;
4. progressão automática ou apenas sugerida do ano escolar;
5. possibilidade de documentos obrigatórios variarem por curso ou processo;
6. necessidade de paginação da lista de pendências;
7. tratamento de um aluno com várias matrículas no mesmo período;
8. edição da classificação de alunos que já não são candidatos.

Enquanto não forem confirmadas:

- usar ação explícita recomendada para retomada;
- pesquisar candidatos e ativos;
- atualizar ano manualmente;
- usar a lista fixa de documentos;
- manter classificação editável conforme o protótipo.

## 54. Resumo da arquitetura

```text
TriagemPage
  -> PostoLayout
       -> SidePostos
            -> fila aguardando
            -> senha atual e prioridade
            -> histórico somente leitura
       -> TriagemWorkspace
            -> faixa de estado e ações no topo
            -> Atendimento atual
                 -> BuscaAlunoCombobox
                 -> DadosAlunoTriagemForm
                 -> DocumentosPendencia
            -> Senhas pendentes
                 -> grade baseada no FilaGrid
                 -> DetalhePendenciaTriagem

Frontend services
  -> API operacional autenticada

API
  -> validators
  -> controllers finos
  -> FilaService / AtendimentoService / AlunoService
  -> transações Prisma
  -> PostgreSQL

Chamada
  -> senha em_atendimento
  -> histórico com horário de chamada
  -> início manual posterior

Sem pendência
  -> finalizar Triagem
  -> APM aguardando

Com pendência
  -> status pendente
  -> etapa continua Triagem
  -> JSON com documentos e horário
  -> retomada direta para em_atendimento
```
