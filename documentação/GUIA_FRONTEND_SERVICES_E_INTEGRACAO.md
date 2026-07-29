# Guia do frontend, services e integração com a API

## 1. Objetivo deste documento

Este documento explica como utilizar a estrutura de integração criada no
frontend do SIGAFila e registra as incoerências que ainda precisam ser
resolvidas no restante do projeto.

O frontend está sem mocks e sem modo de teste. Por isso, login, filas,
atendimentos, cursos e vendas dependem das respostas reais da API.

O fluxo correto de dependências é:

```text
Tela ou componente
        ↓
Hook ou contexto
        ↓
Service do domínio
        ↓
apiClient
        ↓
Backend
```

Componentes não devem chamar `fetch` diretamente. Regras de fila, prioridade,
permissão, histórico, mudança de etapa, estoque e preços também não devem ser
implementadas no frontend.

## 2. Preparação do frontend

### 2.1. Configurar a URL da API

O arquivo `frontend/.env.example` contém:

```env
VITE_API_URL=http://localhost:3000
```

Para configurar o ambiente local:

1. copie `frontend/.env.example` para `frontend/.env`;
2. ajuste `VITE_API_URL` se o backend estiver em outro endereço;
3. reinicie o servidor do Vite depois de alterar o arquivo.

Quando a variável não estiver definida, o `apiClient` usa
`http://localhost:3000`.

### 2.2. Comandos úteis

Executar dentro da pasta `frontend`:

```bash
npm install
npm run dev
npm run lint
npm run build
```

- `npm run dev`: abre o frontend para desenvolvimento.
- `npm run lint`: verifica problemas no código.
- `npm run build`: gera a versão de produção em `frontend/dist`.

## 3. Como funciona o apiClient

Arquivo: `frontend/src/services/apiClient.js`.

O `apiClient` é o único ponto que usa `fetch`. A função principal é
`requisitarApi`.

Ela é responsável por:

- juntar a URL base com a rota;
- recuperar o token salvo em `tcc.auth`;
- enviar `Authorization: Bearer <token>`;
- adicionar `Content-Type: application/json` quando necessário;
- não definir manualmente o `Content-Type` de um `FormData`;
- interpretar respostas JSON, texto e `204 No Content`;
- transformar falhas HTTP em `ApiError`;
- transformar falhas de rede em `API_INDISPONIVEL`;
- avisar o sistema quando uma rota protegida retornar `401`.

### 3.1. Exemplo de GET protegido

```js
import { requisitarApi } from "./apiClient";

export const listarExemplo = () => requisitarApi("/exemplos");
```

O método padrão é `GET` e a autenticação é habilitada por padrão.

### 3.2. Exemplo de POST protegido

```js
export const criarExemplo = (dados) =>
  requisitarApi("/exemplos", {
    method: "POST",
    body: JSON.stringify(dados),
  });
```

### 3.3. Exemplo de rota pública

```js
export const autenticar = (credenciais) =>
  requisitarApi("/auth/login", {
    method: "POST",
    autenticada: false,
    body: JSON.stringify(credenciais),
  });
```

### 3.4. Tratamento de erros

Um erro da API pode ser tratado assim:

```js
try {
  await criarExemplo(dados);
} catch (erro) {
  setErro(erro.message);
}
```

O backend deve preferencialmente responder:

```json
{
  "message": "Descrição legível do erro.",
  "code": "CODIGO_DO_ERRO",
  "details": []
}
```

As propriedades disponíveis em `ApiError` são:

- `message`: mensagem exibida para o usuário;
- `status`: código HTTP, como `400`, `401` ou `404`;
- `code`: código de negócio definido pela API;
- `details`: informações adicionais opcionais.

## 4. Services disponíveis

### 4.1. authService

Arquivo: `frontend/src/services/authService.js`.

| Função | Endpoint | Finalidade |
|---|---|---|
| `autenticar` | `POST /auth/login` | Valida credenciais, tela e guichê. |
| `obterSessaoAtual` | `GET /auth/me` | Valida uma sessão restaurada do navegador. |
| `encerrarSessao` | `POST /auth/logout` | Encerra a sessão e libera o guichê no backend. |

O login deve retornar:

```json
{
  "token": "token",
  "usuario": {
    "id": "U10",
    "nome": "Maria Souza",
    "tipo": "atendente"
  },
  "telasPermitidas": ["triagem", "apm", "docs"],
  "telaAtual": "triagem",
  "postoAtual": "triagem",
  "guiche": "G1"
}
```

O `AuthContext` salva somente essa sessão. Escolher uma tela no login não concede
permissão: `telasPermitidas` deve sempre ser calculado pelo backend.

Ao recarregar a página:

1. a sessão é recuperada do `localStorage`;
2. `GET /auth/me` confirma se ela continua válida;
3. uma resposta `401` limpa a autenticação e o atendimento da tela;
4. `RotaProtegida` impede acesso a telas não autorizadas.

### 4.2. filaService

Arquivo: `frontend/src/services/filaService.js`.

| Função | Endpoint | Finalidade |
|---|---|---|
| `listarFila` | `GET /filas?etapa=...` | Obtém as senhas aguardando na ordem definida pela API. |
| `chamarProximaSenha` | `POST /filas/chamadas` | Solicita ao backend a próxima senha da etapa. |
| `rechamarSenha` | `POST /senhas/:id/rechamadas` | Registra uma nova chamada da senha atual. |
| `cancelarSenha` | `POST /senhas/:id/cancelamentos` | Cancela a senha conforme validação do backend. |
| `normalizarSenha` | Sem endpoint | Adapta os nomes da API para os nomes exibidos pela interface. |

`normalizarSenha` converte:

```text
codigo       → numero
etapaAtual   → etapa
emitidaEm ou chamadaEm → horario formatado
```

Ela não escolhe a próxima senha e não altera prioridade ou etapa.

O hook `useFila` carrega a fila, expõe carregamento/erro e chama essas funções.
O `PostoLayout` usa o mesmo hook para Triagem, APM e Docs.

### 4.3. atendimentoService

Arquivo: `frontend/src/services/atendimentoService.js`.

| Função | Endpoint | Finalidade |
|---|---|---|
| `obterDetalheSenha` | `GET /senhas/:id/detalhe` | Obtém senha, aluno e matrícula. |
| `iniciarAtendimento` | `POST /atendimentos` | Cria o histórico da etapa atual. |
| `finalizarAtendimento` | `POST /atendimentos/:id/finalizacoes` | Fecha o histórico e deixa o backend avançar a senha. |

O frontend nunca cria o ID do atendimento. Depois de
`POST /atendimentos`, o objeto `resposta.atendimento` é guardado no
`AtendimentoContext`.

### 4.4. triagemService

Arquivo: `frontend/src/services/triagemService.js`.

| Função | Endpoint | Finalidade |
|---|---|---|
| `listarCursos` | `GET /cursos` | Carrega as opções de curso. |
| `buscarAlunoPorCpf` | `GET /alunos?cpf=...` | Busca aluno e todas as matrículas encontradas. |
| `salvarDadosDaTriagem` | `PUT /senhas/:id/aluno` | Salva ou confirma os dados ligados à senha. |

`buscarAlunoPorCpf` normaliza a resposta para:

```js
{
  aluno: {
    cpf: "",
    nome: "",
  },
  matriculas: [
    {
      curso: "",
      ano: "",
      periodo: "",
    },
  ],
}
```

Quando houver mais de uma matrícula, `TriagemForm` apresenta um seletor.

Anos e períodos não vêm da API. Eles estão em
`frontend/src/constants/cursoOptions.js`:

- anos: `1`, `2` e `3`;
- períodos: `manha`, `tarde`, `noite` e `integral`.

Os mesmos valores podem ser reutilizados futuramente no cadastro de cursos da
tela administrativa.

### 4.5. apmService

Arquivo: `frontend/src/services/apmService.js`.

| Função | Endpoint | Finalidade |
|---|---|---|
| `carregarCatalogoVenda` | `GET /apm/catalogo-venda` | Carrega uniformes e armário. |
| `registrarVenda` | `POST /atendimentos/:id/vendas` | Registra a venda e finaliza a etapa APM. |
| `finalizarSemVenda` | `POST /atendimentos/:id/finalizacoes-sem-venda` | Finaliza a APM sem venda. |
| `centavosParaReais` | Sem endpoint | Adapta valores recebidos para exibição. |
| `reaisParaCentavos` | Sem endpoint | Adapta valores digitados para envio. |

O backend envia e recebe valores monetários em centavos. Exemplo:

```text
3800 ↔ R$ 38,00
```

O frontend calcula um resumo apenas para exibição. O backend deve recalcular e
validar preços, total, estoque e pagamentos antes de gravar a venda.

## 5. Contextos e hooks

### 5.1. AuthContext

Arquivos:

- `frontend/src/context/authContext.jsx`;
- `frontend/src/context/authContextBase.js`;
- `frontend/src/hooks/useAuth.jsx`.

Disponibiliza:

- `usuario`;
- `estaAutenticado`;
- `validandoSessao`;
- `registrarSessao`;
- `temAcessoATela`;
- `logout`.

Uso:

```js
const { usuario, estaAutenticado, logout } = useAuth();
```

### 5.2. AtendimentoContext

Arquivos:

- `frontend/src/context/atendimentoContext.jsx`;
- `frontend/src/context/atendimentoContextBase.js`;
- `frontend/src/hooks/useAtendimento.jsx`.

Disponibiliza:

- `senhaAtual`: senha chamada no posto;
- `atendendo`: indica se o atendimento foi iniciado;
- `atendimentoAtual`: objeto e ID criados pelo backend;
- `dados`: aluno e matrícula exibidos na tela;
- estados de carregamento e erro;
- `exibirDetalheSenha`;
- `limparAtendimentoExibido`.

Esse contexto guarda somente o estado visual. Ele não grava histórico e não
avança a etapa da senha.

### 5.3. useFila

Arquivo: `frontend/src/hooks/useFila.jsx`.

Responsabilidades:

- fazer a primeira consulta da fila;
- expor as senhas aguardando;
- chamar, rechamar e cancelar;
- permitir uma nova consulta com `carregarFila`;
- expor carregamento e mensagem de erro.

### 5.4. useSelectsTriagem

Arquivo: `frontend/src/hooks/useSelectsTriagem.jsx`.

Combina:

- cursos obtidos em `GET /cursos`;
- anos fixos;
- períodos fixos.

### 5.5. useVendaApm

Arquivo: `frontend/src/hooks/useVendaApm.js`.

Mantém somente o formulário temporário da venda:

- catálogo;
- uniformes selecionados;
- quantidade comprada e retirada;
- armário;
- contribuição;
- formas e valores de pagamento;
- resumo visual;
- montagem do corpo enviado para a API.

O método `gerarPayload` converte os valores para centavos e não envia o total
calculado pela tela.

## 6. Fluxo completo das telas

### 6.1. Login

```text
LoginPage
  → authService.autenticar
  → POST /auth/login
  → AuthContext.registrarSessao
  → RotaProtegida verifica telasPermitidas
  → usuário entra no posto autorizado
```

### 6.2. Chamada da senha

```text
PostoLayout
  → useFila.chamar
  → POST /filas/chamadas
  → senhaAtual é bloqueada na tela
  → GET /senhas/:id/detalhe
  → AtendimentoContext preenche senha, aluno e matrícula
```

A senha deve manter o mesmo código durante todo o fluxo:

```text
N001: triagem → apm → docs → finalizada
```

### 6.3. Início do atendimento

```text
AtendimentoActions
  → POST /atendimentos
  → backend cria o histórico
  → atendimentoAtual recebe o ID retornado
  → campos da tela são liberados
```

### 6.4. Finalização da Triagem

```text
TriagemForm
  → PUT /senhas/:senhaId/aluno
  → POST /atendimentos/:atendimentoId/finalizacoes
  → backend encerra a Triagem
  → mesma senha fica aguardando na APM
```

### 6.5. Finalização da APM

Com venda:

```text
ApmVendas
  → POST /atendimentos/:atendimentoId/vendas
  → backend valida e grava tudo em uma transação
  → mesma senha fica aguardando em Docs
```

Sem venda:

```text
ApmVendas
  → confirmação do usuário
  → POST /atendimentos/:atendimentoId/finalizacoes-sem-venda
  → mesma senha fica aguardando em Docs
```

### 6.6. Finalização de Docs

```text
DocsPanel
  → POST /atendimentos/:atendimentoId/finalizacoes
  → backend fecha o último histórico
  → senha fica finalizada
```

### 6.7. Logout

```text
Header
  → POST /auth/logout
  → limpa atendimento exibido
  → limpa tcc.auth
  → volta ao login
```

A limpeza local também ocorre quando a API retorna `401`.

## 7. Como adicionar um novo endpoint

Exemplo para uma futura tela administrativa:

1. criar ou escolher um service de domínio;
2. adicionar a função que chama `requisitarApi`;
3. chamar a função a partir de um hook ou evento da tela;
4. mostrar carregamento, sucesso e erro;
5. não duplicar URL, token ou tratamento HTTP no componente.

```js
// services/adminService.js
import { requisitarApi } from "./apiClient";

export const cadastrarCurso = (curso) =>
  requisitarApi("/admin/cursos", {
    method: "POST",
    body: JSON.stringify(curso),
  });
```

Na tela:

```js
try {
  setCarregando(true);
  await cadastrarCurso(dados);
} catch (erro) {
  setErro(erro.message);
} finally {
  setCarregando(false);
}
```

## 8. O que foi removido

Foram removidos do frontend:

- o modo temporário de teste;
- o mock da Triagem;
- o mock da APM;
- o desvio temporário das permissões;
- dados e temporizadores usados para simular a API.

Consequência esperada: sem um backend implementando o contrato, o frontend
mostrará erro de conexão ou listas vazias. Isso não significa que os services
estão simulando respostas; significa que agora eles dependem da API real.

## 9. Endpoints que o backend precisa implementar

| Grupo | Endpoint |
|---|---|
| Autenticação | `POST /auth/login` |
| Autenticação | `GET /auth/me` |
| Autenticação | `POST /auth/logout` |
| Fila | `GET /filas?etapa={etapa}` |
| Fila | `POST /filas/chamadas` |
| Fila | `POST /senhas/:id/rechamadas` |
| Fila | `POST /senhas/:id/cancelamentos` |
| Senha | `GET /senhas/:id/detalhe` |
| Triagem | `GET /alunos?cpf={cpf}` |
| Triagem | `PUT /senhas/:id/aluno` |
| Triagem | `GET /cursos` |
| Atendimento | `POST /atendimentos` |
| Atendimento | `POST /atendimentos/:id/finalizacoes` |
| APM | `GET /apm/catalogo-venda` |
| APM | `POST /atendimentos/:id/vendas` |
| APM | `POST /atendimentos/:id/finalizacoes-sem-venda` |

Os corpos e respostas completos permanecem definidos em
`documentação/CONTRATO_API_ATENDIMENTO.md`.

## 10. Incoerências e pendências atuais

### 10.1. Bloqueadores para conectar o backend

#### Backend não inicia

`backend/src/app.js` importa `./routes/senhas` sem a extensão `.js`, embora o
projeto use `"type": "module"`.

A execução atual termina com `ERR_MODULE_NOT_FOUND`. Além disso,
`backend/src/routes/senhas.js` está vazio e não fornece o `default export`
esperado pelo `app.js`.

#### Endpoints ainda não existem

As pastas de rotas e controllers estão praticamente vazias. Nenhum dos
endpoints usados pelo frontend está implementado de forma funcional.

#### Prisma Client não está disponível no caminho importado

`backend/src/config/prisma.js` importa:

```js
../generated/prisma/client
```

Entretanto, `backend/src/generated/prisma/client` não existe atualmente.

O schema passa em `prisma validate`, mas o client ainda precisa ser gerado no
caminho correto e o import precisa incluir uma extensão/entrada compatível com
o modo ESM.

#### Nomes de arquivos diferem em maiúsculas e minúsculas

O Git registra alguns arquivos assim:

```text
pages/loginPage.jsx
pages/triagemPage.jsx
pages/apmPage.jsx
pages/docsPage.jsx
components/ui/button.jsx
components/ui/input.jsx
components/ui/select.jsx
```

Mas os imports usam `LoginPage`, `TriagemPage`, `Button`, `Input` e `Select`.
Isso funciona no Windows, cujo sistema de arquivos normalmente ignora essa
diferença, mas pode falhar ao compilar ou publicar em Linux.

#### CPF tem formatos divergentes

`TriagemForm` mantém e envia CPF formatado, como `123.456.789-00`. O contrato
exemplifica CPF sem pontuação, como `12345678900`.

É necessário escolher um formato oficial. A opção recomendada é:

- frontend pode exibir formatado;
- frontend envia somente dígitos;
- backend normaliza e valida novamente.

#### A senha exige aluno antes da Triagem no schema

No Prisma, `Senha.cpfAluno` é obrigatório. No fluxo visual, a senha pode ser
emitida e o aluno ser identificado somente durante a Triagem.

Se esse for realmente o fluxo do sistema, `cpfAluno` precisa ser opcional na
emissão e preenchido na Triagem, ou a emissão precisa solicitar o CPF antes de
criar a senha.

### 10.2. Modelo de dados ainda não cobre as regras documentadas

#### Histórico não guarda etapa nem guichê

`HistoricoSenha` possui senha, voluntário e horários, mas não registra:

- etapa daquele atendimento;
- guichê;
- status ou motivo de encerramento.

Como `Senha.etapaSenha` muda ao longo do processo, consultar apenas a etapa
atual da senha não permite reconstruir em qual posto cada histórico ocorreu.

#### Não existe sessão ou guichê no banco

O contrato exige login, logout, reserva/liberação de guichê e identificação do
guichê em cada atendimento. O schema ainda não possui entidade ou campos para
isso.

#### Não existe estado da regra de prioridade por fila

A regra de duas prioritárias para uma normal precisa de controle transacional
por etapa. O schema atual não possui fila, contador ou estado equivalente.

#### Matrícula não guarda ano e período corretamente

`Aluno` possui um único `anoAluno`, enquanto `CursoAluno` contém apenas aluno e
curso. Porém, a API retorna uma lista de matrículas e cada matrícula tem seu
próprio curso, ano e período.

O modelo atual não representa corretamente um aluno com múltiplas matrículas
ou anos/períodos diferentes.

Além disso, `Curso.periodoCurso` fixa um período no curso, enquanto a tela
permite selecionar período junto à matrícula. É necessário decidir a qual
entidade o período realmente pertence.

#### Compra não está ligada ao atendimento

O endpoint de venda recebe `atendimentoId`, mas `Compra` não possui relação com
`HistoricoSenha`/atendimento ou diretamente com a senha. Isso dificulta
rastreabilidade, idempotência e garantia de que uma venda pertence à etapa APM
correta.

#### Armário do contrato não possui ID

O schema trata armário como um `Produto`, que possui `idProduto`. O contrato
envia apenas quantidades no campo `armario`.

É necessário decidir se existe um único produto de armário conhecido pelo
backend ou se o frontend também deve enviar `produtoId`.

#### Usuário e senha precisam de ajustes

- O login usa `username`, mas o schema possui somente `nomeVoluntario`.
- `nomeVoluntario` não é único.
- `senhaVoluntario` tem `VARCHAR(50)`, insuficiente para hashes bcrypt
  tradicionais de 60 caracteres e possivelmente insuficiente para outros
  algoritmos.

O backend não deve armazenar senha em texto puro.

#### Valores controlados são strings livres

Etapa, status, tipo de senha, tipo de usuário, tipo de produto e forma de
pagamento são `String` no Prisma. A documentação exige valores controlados.

Esses valores precisam de enums ou validação obrigatória no backend e,
preferencialmente, restrições correspondentes no banco.

### 10.3. Pendências do frontend

#### Admin e Secretaria não possuem telas

O login oferece `admin` e `secretaria`, mas as rotas correspondentes continuam
comentadas em `App.jsx`. Se o backend autorizar uma dessas opções,
`LoginPage` navegará para uma rota inexistente.

#### Fila não possui atualização em tempo real

`useFila` consulta a fila ao abrir a tela e depois de alguns eventos locais.
Novas senhas, chamadas de outro guichê ou alterações externas não aparecem
automaticamente.

Antes do uso com vários guichês, escolher uma estratégia:

- WebSocket ou Server-Sent Events;
- consulta periódica;
- botão de atualização manual;
- atualização explícita depois de toda operação.

O backend continua sendo a fonte de verdade em qualquer opção.

#### Total da fila retornado pela API é ignorado

O contrato retorna `{ senhas, total }`, mas `filaService` devolve somente
`senhas`, e a tela usa `senhasAguardando.length`.

Se futuramente a API limitar ou paginar a lista, a quantidade “Aguardando” ficará
incorreta.

#### Forma de pagamento `outro` não aparece na APM

O contrato aceita `outro`, mas `useVendaApm` apresenta somente:

- `pix`;
- `dinheiro`;
- `debito`;
- `credito`.

É necessário remover `outro` do contrato ou adicioná-lo à interface.

#### Dinheiro é decimal dentro do formulário

O payload final é convertido corretamente para centavos, mas os cálculos
temporários da APM ainda usam números decimais do JavaScript.

Os valores são arredondados para duas casas, porém manter centavos durante todo
o formulário seria mais seguro.

#### Botão “Encerrar” significa cancelamento

Na barra lateral, o botão `Encerrar` chama o endpoint de cancelamento da senha.
Já o botão dentro do formulário finaliza normalmente o atendimento.

Os nomes podem confundir o operador. “Cancelar senha” deixaria a ação lateral
mais explícita.

### 10.4. Documentação desatualizada

`CONTRATO_API_ATENDIMENTO.md` ainda apresenta como pendentes tarefas que já
foram concluídas:

- criação do `filaService`;
- criação de `atendimentoAtual`;
- seletor para múltiplas matrículas;
- conversão do payload da APM para centavos;
- criação dos demais services;
- remoção do modo de teste.

Esses trechos devem ser atualizados para que o parceiro do backend não pense
que ainda precisa contornar uma versão antiga do frontend.

### 10.5. Qualidade, segurança e operação

- O backend possui um script `test` que sempre termina com erro e ainda não tem
  testes reais.
- O frontend possui lint e build aprovados, mas não tem testes automatizados de
  componentes ou integração.
- O CORS do backend está aberto para qualquer origem; em produção deve aceitar
  apenas os endereços autorizados.
- A migração que adiciona `Compra.cpfAluno` obrigatório falha se a tabela já
  possuir registros, conforme o aviso gravado na própria migration.
- Datas importantes não possuem valores padrão no schema; todos os horários
  precisarão ser fornecidos corretamente pelo backend.

## 11. Ordem recomendada para as próximas correções

1. Corrigir a execução mínima do backend e gerar o Prisma Client.
2. Definir as mudanças necessárias no schema para senha sem aluno, histórico,
   etapa, guichê, sessão, matrícula e vínculo da compra.
3. Atualizar migrations antes de criar dados importantes.
4. Implementar autenticação e autorização.
5. Implementar fila e chamada atômica.
6. Implementar detalhe, atendimento e avanço de etapa.
7. Implementar Triagem.
8. Implementar catálogo e venda APM.
9. Implementar atualização da fila para múltiplos guichês.
10. Criar Admin e Secretaria quando seus requisitos estiverem definidos.
11. Atualizar o contrato removendo as pendências antigas.
12. Adicionar testes de backend e testes dos fluxos principais do frontend.

## 12. Estado atual validado

Na última validação:

- `npm run lint` do frontend foi aprovado;
- `npm run build` do frontend foi aprovado;
- não restaram referências a mocks ou modo de teste no frontend;
- `prisma validate` foi aprovado;
- a inicialização do backend falhou antes de subir o Express;
- nenhum arquivo do backend foi alterado durante esta revisão.
