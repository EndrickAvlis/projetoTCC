# Contrato da API — SIGAFila

Este é o contrato de integração entre frontend e backend. Ele define as rotas, os formatos de dados e a responsabilidade de cada lado. O modo de teste do frontend **não é contrato** e deve ser removido quando a API estiver disponível.

## 1. Regras que orientam todas as rotas

- Uma senha é única: `N001` percorre `triagem → apm → docs → finalizada` sem trocar de código.
- O backend é a única fonte de verdade para fila, prioridade, status, etapa, histórico, horários, permissões, preço, estoque e pagamentos.
- O frontend só apresenta respostas da API, mantém formulário temporário e mostra carregamento/erro.
- Campos monetários da API são sempre inteiros em centavos. Exemplo: `3850` significa R$ 38,50.
- Datas e horários são enviados em ISO 8601 com fuso, por exemplo `2026-07-28T13:05:00-03:00`.
- O frontend não envia nem recebe senhas de usuário em respostas.

### Valores controlados

| Campo | Valores |
|---|---|
| `etapaAtual` | `triagem`, `apm`, `docs` |
| `status` | `aguardando`, `em_atendimento`, `finalizada`, `cancelada` |
| `tipoSenha` | `false` (normal) ou `true` (prioritária) |
| `tipoUsuario` | `administrador`, `supervisor`, `atendente` |
| `formaPagamento` | `dinheiro`, `pix`, `debito`, `credito`, `outro` |

### Autorização e erros

Após o login, toda rota protegida deve receber:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

O backend deve responder erros neste formato:

```json
{
  "message": "A senha não pode ser finalizada neste estado.",
  "code": "SENHA_ESTADO_INVALIDO",
  "details": []
}
```

O frontend já exibe o campo `message` em seus alertas.

## 2. Sessão e permissões

### `POST /auth/login`

Usado por: `frontend/src/pages/LoginPage.jsx`.

Corpo enviado pelo frontend:

```json
{
  "username": "voluntario",
  "senha": "senha-digitada",
  "tela": "triagem",
  "guiche": "G1"
}
```

`guiche` é obrigatório para `triagem`, `apm` e `docs`; é opcional para `admin` e `secretaria`.

O backend deve validar credenciais, sessão/guichê e se o tipo de usuário pode acessar a tela solicitada. A escolha da tela nunca concede permissão.

Resposta de sucesso — formato exigido por `AuthContext.registrarSessao`:

```json
{
  "token": "jwt-ou-token-da-sessao",
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

### `GET /auth/me`

Usado ao restaurar ou validar uma sessão após recarregar o navegador. Retorna exatamente o mesmo formato da resposta de login, exceto que pode omitir um token novo se ele não for renovado.

### `POST /auth/logout`

Usado por: `frontend/src/components/layout/Header.jsx`.

O backend encerra a sessão ativa e libera o guichê. Resposta sugerida: `204 No Content`.

## 3. Fila e chamada

### Formato padrão de senha da API

```json
{
  "id": "S001",
  "codigo": "N001",
  "etapaAtual": "triagem",
  "status": "aguardando",
  "tipoSenha": false,
  "emitidaEm": "2026-07-28T10:00:00-03:00",
  "chamadaEm": null
}
```

O frontend exibe apenas `numero`; o `filaService` mapeia `codigo → numero`. O backend não deve retornar horário formatado como `"10:00"`.

### `GET /filas?etapa={etapa}`

Usado por: `PostoLayout`/`useFila`, para Triagem, APM e Docs.

Resposta:

```json
{
  "senhas": [
    {
      "id": "S001",
      "codigo": "N001",
      "etapaAtual": "triagem",
      "status": "aguardando",
      "tipoSenha": false,
      "emitidaEm": "2026-07-28T10:00:00-03:00",
      "chamadaEm": null
    }
  ],
  "total": 1
}
```

Retornar somente senhas `aguardando`. A prioridade é apenas um marcador visual (`tipoSenha`); o atendente escolhe a senha a chamar.

### `POST /filas/chamadas`

Usado ao clicar em uma senha aguardando no `PostoLayout`.

```json
{ "senhaId": "S001", "etapa": "triagem" }
```

O backend deve, em uma transação atômica:

1. validar a permissão da sessão e se a senha pertence à etapa informada;
2. confirmar que a senha está `aguardando`;
3. impedir atomicamente que dois guichês chamem a mesma senha;
4. mudar o status para `em_atendimento`;
5. associar a chamada ao atendente e guichê da sessão.

Resposta: `{ "senha": { ...formato padrão de senha... } }`.

### `GET /filas/historico?etapa={etapa}`

Usado pela aba **Chamadas hoje** do Posto Lateral. Retorna somente senhas chamadas na etapa solicitada, entre 00:00 e 23:59 do dia atual no fuso configurado pelo servidor. A resposta tem o mesmo formato de `GET /filas`; seus itens são apenas para consulta.

### `PATCH /senhas/:senhaId/prioridade`

Usado pelo controle **Ativar/Remover prioridade** da senha atual.

```json
{ "tipoSenha": true }
```

O backend persiste o booleano na senha e devolve `{ "senha": { ... } }`. A prioridade acompanha a senha em todas as etapas e deve aparecer na fila, histórico e detalhe.

## 4. Detalhe da senha, aluno e Triagem

### `GET /senhas/:senhaId/detalhe`

Usado logo após chamar a senha, antes de preencher o `AtendimentoContext`.

Resposta exigida por `exibirDetalheSenha`:

```json
{
  "senha": {
    "id": "S001",
    "codigo": "N001",
    "etapaAtual": "triagem",
    "status": "em_atendimento",
    "emitidaEm": "2026-07-28T10:00:00-03:00",
    "chamadaEm": "2026-07-28T10:05:00-03:00"
  },
  "aluno": {
    "cpf": "12345678900",
    "nome": "Maria Souza"
  },
  "matricula": {
    "curso": "DS",
    "ano": "2",
    "periodo": "manha"
  }
}
```

Na Triagem, `aluno` e `matricula` podem ser `null`, pois a senha ainda não possui vínculo com aluno. Nesse caso, o frontend deve exibir campos vazios, nunca dados do atendimento anterior. Em APM e Docs, o backend deve retornar os dados do aluno vinculado.

### `GET /alunos?cpf={cpf}`

Usado pelo botão de busca da Triagem.

Resposta:

```json
{
  "aluno": {
    "cpf": "12345678900",
    "nome": "Maria Souza"
  },
  "matriculas": [
    { "curso": "DS", "ano": "2", "periodo": "manha" }
  ]
}
```

Retornar `404` se não houver aluno. Caso existam múltiplas matrículas, retornar todas. **Pendência do frontend:** a tela atual usa a primeira matrícula; antes da integração real ela deve receber um seletor para o usuário escolher a matrícula correta.

### `PUT /senhas/:senhaId/aluno`

Usado ao concluir a Triagem, antes de finalizar o atendimento.

```json
{
  "cpf": "12345678900",
  "nome": "Maria Souza",
  "curso": "DS",
  "ano": "2",
  "periodo": "manha"
}
```

O backend cria ou atualiza o aluno/vínculo de curso conforme as regras do sistema. Resposta sugerida: detalhe atualizado da senha.

### `GET /cursos`

Usado por `useSelectsTriagem`.

```json
{
  "cursos": [
    { "value": "DS", "label": "Desenvolvimento de Sistemas" }
  ]
}
```

Os valores de ano (`1`, `2`, `3`) e período (`manha`, `tarde`, `noite`, `integral`) são fixos no frontend e também devem ser validados pelo backend.

## 5. Atendimento e histórico

### `POST /atendimentos`

Usado pelo botão **Iniciar Atendimento**.

```json
{ "senhaId": "S001" }
```

O backend cria o histórico para a etapa atual da senha e vincula atendente/guichê da sessão. Resposta:

```json
{
  "atendimento": {
    "id": "A100",
    "senhaId": "S001",
    "etapa": "triagem",
    "iniciadoEm": "2026-07-28T10:06:00-03:00"
  },
  "senha": { "id": "S001", "status": "em_atendimento", "etapaAtual": "triagem" }
}
```

**Pendência do frontend:** adicionar `atendimentoAtual`/`atendimentoId` ao `AtendimentoContext`, pois a finalização usa esse ID.

### `POST /atendimentos/:atendimentoId/finalizacoes`

Usado para finalizar Triagem ou Docs. Na Triagem, chamar depois de `PUT /senhas/:senhaId/aluno` concluir com sucesso.

O backend fecha o histórico e decide a transição:

| Etapa finalizada | Resultado |
|---|---|
| `triagem` | senha fica `aguardando` em `apm` |
| `apm` | senha fica `aguardando` em `docs` |
| `docs` | senha fica `finalizada` |

Resposta:

```json
{
  "atendimento": { "id": "A100", "finalizadoEm": "2026-07-28T10:10:00-03:00" },
  "senha": { "id": "S001", "codigo": "N001", "etapaAtual": "apm", "status": "aguardando" }
}
```

## 6. APM e vendas

### `GET /apm/catalogo-venda`

Usado por `useVendaApm`. Este é o nome oficial; não usar `/apm/produtos-venda`.

```json
{
  "uniformes": [
    {
      "id": "U-M",
      "tamanho": "M",
      "precoCentavos": 3800,
      "estoque": 20
    }
  ],
  "armario": {
    "permitido": true,
    "precoCentavos": 8000,
    "estoque": 6
  }
}
```

Uniforme sem estoque pode constar no catálogo e ser vendido com retirada pendente. Armário só aparece quando permitido e com estoque.

### `POST /atendimentos/:atendimentoId/vendas`

Usado ao finalizar compra e atendimento APM. O ID fica apenas na URL, não no corpo.

```json
{
  "itens": [
    {
      "uniformeId": "U-M",
      "quantidadeComprada": 3,
      "quantidadeRetirada": 2
    }
  ],
  "contribuicaoCentavos": 1000,
  "armario": {
    "quantidadeComprada": 1,
    "quantidadeRetirada": 1
  },
  "pagamentos": [
    { "forma": "pix", "valorCentavos": 10000 },
    { "forma": "debito", "valorCentavos": 9400 }
  ]
}
```

O backend calcula total/preço, valida soma dos pagamentos, registra preço histórico, baixa somente estoque retirado e finaliza o atendimento em uma única transação. Em qualquer erro, não grava efeitos parciais.

### `POST /atendimentos/:atendimentoId/finalizacoes-sem-venda`

Usado no botão **Pular venda**. Só é aceito sem itens, armário, contribuição ou pagamentos. Finaliza a APM e deixa a senha aguardando em Docs.

### Pendências de adequação do frontend APM

`useVendaApm` hoje usa decimais e os campos `valorContribuicao`/`valorTotal`. Antes de ligar a API, ele deve converter para `contribuicaoCentavos`/`valorCentavos` — idealmente mantendo centavos internamente. O backend nunca deve confiar em total, preço ou estoque calculados pela tela.

## 7. Mapa de implementação para o backend

Estrutura sugerida:

```text
backend/src/
  routes/
    authRoutes.js           # /auth/login, /auth/me, /auth/logout
    filaRoutes.js           # /filas, /filas/historico e /filas/chamadas
    senhaRoutes.js          # /senhas/:id/detalhe, /senhas/:id/aluno e /senhas/:id/prioridade
    atendimentoRoutes.js    # /atendimentos
    alunoRoutes.js          # /alunos e /cursos
    apmRoutes.js            # /apm/catalogo-venda e vendas da APM
  controllers/
    authController.js
    filaController.js
    senhaController.js
    atendimentoController.js
    alunoController.js
    apmController.js
  services/
    filaService.js          # prioridade, transação e concorrência
    atendimentoService.js   # histórico e avanço de etapa
    vendaService.js         # venda, estoque, pagamento e preço histórico
```

As rotas devem ser registradas em `backend/src/app.js`. Autenticação e autorização devem ser middleware aplicado a todas as rotas, exceto `POST /auth/login`.

## 8. Mapa de implementação para o frontend

Quando o modo de teste for removido, criar ou completar estes serviços sem fazer `fetch` diretamente nos componentes:

```text
frontend/src/services/
  apiClient.js          # URL base, Authorization, erro padrão
  authService.js        # login, me, logout
  filaService.js        # listar, consultar histórico, chamar senha selecionada e alterar prioridade
  atendimentoService.js # detalhe, iniciar, finalizar
  triagemService.js     # já existe: cursos, aluno, salvar dados
  apmService.js         # catálogo, venda, finalizar sem venda
```

Cada serviço chama `requisitarApi`; a tela chama o serviço; o `AuthContext` ou `AtendimentoContext` recebe a resposta e atualiza apenas a interface.
