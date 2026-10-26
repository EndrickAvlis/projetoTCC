# Especificação Técnica do Back-end — Ciclo de Atendimento

Este documento define os contratos, regras de negócio e transações do **Back-end** para gerenciar o ciclo de vida do atendimento nos postos operacionais (**Triagem**, **APM** e **Documentos**).

Ele é consumido universalmente pelo `AtendimentoContext.jsx` e `AtendimentoActions.jsx` no frontend.

---

## 1. Visão Geral

O ciclo de vida da senha percorre as etapas do processo de matrícula:

```text
[ Fila Triagem ] ──▶ [ Posto Triagem ] ──▶ [ Fila APM ] ──▶ [ Posto APM ] ──▶ [ Fila Docs ] ──▶ [ Posto Docs ] ──▶ [ Concluída ]
```

### Transição de Status da Senha (`model Senha`):
* `aguardando`: A senha está na fila da etapa aguardando ser chamada.
* `em_atendimento`: A senha foi chamada pelo guichê e está sendo atendida.
* `finalizada`: A senha concluiu todas as etapas com sucesso (ou após o último posto).
* `cancelada`: O candidato não compareceu ou o atendimento foi cancelado pelo atendente.
* `pendente`: Status temporário exclusivo da Triagem quando faltam documentos.

---

## 2. Gerenciamento do Histórico (`model HistoricoSenha`)

Cada vez que um atendente interage com uma senha, um registro de histórico é gerado para métricas de tempo de espera e tempo de atendimento:

* **Início do Atendimento:** Registra `codSenha`, `codVoluntario`, `etapaHistorico` e `dataHoraInicioHistorico = new Date()`.
* **Finalização / Cancelamento:** Preenche `dataHoraFimHistorico = new Date()`.

---

## 3. Contratos de Rotas (`/atendimentos`)

Todas as rotas exigem autenticação do voluntário (`atendente`, `supervisor` ou `admin`). O `idVoluntario` é extraído implicitamente através do token de sessão (JWT) injetado na requisição pelo middleware de autenticação.

---

### 3.1. Iniciar Atendimento Formal
Registra o momento em que o aluno se sentou no guichê e o atendimento começou de fato (acionado pelo botão "Iniciar Atendimento").

* **Rota:** `POST /atendimentos/iniciar`
* **Body:**
  ```json
  {
    "senhaId": 12
  }
  ```
* **Responsabilidades do Back-end:**
  1. Validar se a senha existe, se está na etapa do posto e se está em atendimento (`statusSenha = 'em_atendimento'`).
  2. Criar ou confirmar abertura do registro em `HistoricoSenha` contendo `codSenha = senha.idSenha`, `codVoluntario = voluntarioAutenticado.idVoluntario`, `etapaHistorico = senha.etapaSenha` e `dataHoraInicioHistorico = new Date()`.
  3. Buscar e retornar os dados cadastrais e de matrícula do aluno vinculado à senha (necessários para os postos de **APM** e **Documentos**).
* **Resposta com aluno vinculado (APM e Docs) (HTTP 200):**
  ```json
  {
    "mensagem": "Atendimento iniciado com sucesso.",
    "atendimento": {
      "idHistorico": 84,
      "iniciadoEm": "2026-10-09T21:00:00.000Z"
    },
    "aluno": {
      "id": 15,
      "nome": "Endrick Silva Souza",
      "cidade": "São José do Rio Preto",
      "sexo": "Masculino",
      "escolaridadePublica": true,
      "status": "CANDIDATO",
      "curso": "Desenvolvimento de Sistemas",
      "periodo": "integral",
      "classificacao": 12,
      "statusMatricula": "PENDENTE"
    }
  }
  ```
* **Resposta sem aluno vinculado (Triagem antes do cadastro) (HTTP 200):**
  ```json
  {
    "mensagem": "Atendimento iniciado com sucesso.",
    "atendimento": {
      "idHistorico": 84,
      "iniciadoEm": "2026-10-09T21:00:00.000Z"
    },
    "aluno": null
  }
  ```

---

### 3.2. Recuperar Atendimento Ativo (Resiliência / F5)
Permite que o atendente recupere o atendimento em andamento caso a página seja recarregada ou a conexão caia. A busca é automatizada no banco com base no voluntário autenticado, eliminando parâmetros manuais de etapa do frontend.

* **Rota:** `GET /atendimentos/ativo`
* **Responsabilidades do Back-end:**
  1. Buscar se o voluntário autenticado (`idVoluntario`) possui algum registro de senha sob sua responsabilidade com `statusSenha = 'em_atendimento'`.
  2. Incluir os dados completos do aluno (`nomeAluno`, cidade, sexo, escolaridade pública, status e dados de curso/matrícula) vinculados a essa senha ativa.
  3. Buscar o `HistoricoSenha` correspondente ativo (sem `dataHoraFimHistorico`).
* **Resposta com atendimento ativo (HTTP 200):**
  ```json
  {
    "senha": {
      "id": 12,
      "codigo": 104,
      "prioritaria": false,
      "etapa": "apm",
      "status": "em_atendimento",
      "aluno": {
        "id": 15,
        "nome": "Endrick Silva Souza",
        "cidade": "São José do Rio Preto",
        "sexo": "Masculino",
        "escolaridadePublica": true,
        "status": "CANDIDATO",
        "curso": "Desenvolvimento de Sistemas",
        "periodo": "integral",
        "classificacao": 12,
        "statusMatricula": "PENDENTE"
      }
    },
    "atendimento": {
      "idHistorico": 84,
      "iniciadoEm": "2026-10-09T21:00:00.000Z"
    }
  }
  ```
* **Resposta quando há atendimento ativo sem aluno cadastrado (Triagem) (HTTP 200):**
  ```json
  {
    "senha": {
      "id": 12,
      "codigo": 104,
      "prioritaria": false,
      "etapa": "triagem",
      "status": "em_atendimento",
      "aluno": null
    },
    "atendimento": {
      "idHistorico": 84,
      "iniciadoEm": "2026-10-09T21:00:00.000Z"
    }
  }
  ```
* **Resposta quando não há atendimento ativo (HTTP 200):**
  ```json
  {
    "senha": null,
    "atendimento": null
  }
  ```
---

### 3.3. Rechamar Senha no Painel
Aciona o painel de chamadas sonoro/visual para reanunciar o número da senha. O back-end deduz a etapa de forma segura através do banco de dados.
**não fazer essa rota por enquanto Mori.

* **Rota:** `POST /atendimentos/:id/rechamar`
* **Parâmetro de URL:** `id` (ID da senha)
* **Body:** Vazio (`{}`)
* **Responsabilidades do Back-end:**
  1. Validar se a senha do ID fornecido está sob atendimento do voluntário solicitante.
  2. Buscar a `etapaSenha` atual gravada no banco de dados para evitar fraudes ou inconsistências visuais no painel.
  3. Emitir evento de rechamada com a etapa correta via SSE para o painel correto.
* **Resposta (HTTP 200):**
  ```json
  {
    "mensagem": "Senha rechamada no painel com sucesso."
  }
  ```

---

### 3.4. Finalizar Atendimento
Encerra a etapa atual da senha e transfere o aluno para o próximo posto na fila (ou conclui a matrícula caso seja o posto de Documentos).

* **Rota:** `POST /atendimentos/finalizar`
* **Body:**
  ```json
  {
    "senhaId": 12
  }
  ```
* **Transação no Back-end (`prisma.$transaction`):**
Mori pesquisa o que são transações no prisma, elas servem para executar varias mudanças no banco em tabelas diferentes sem ocorrer de uma delas dar erro e as outras serem executadas. Em uma transação ou tudo da certo ou nada é feito.
  1. Localizar a senha e verificar se `statusSenha == 'em_atendimento'` e se pertence à etapa do voluntário.
  2. Fechar o `HistoricoSenha` aberto associado a esta senha e voluntário (`dataHoraFimHistorico = new Date()`).
  3. Calcular a transição de etapa e status:
     - Se `etapaSenha == 'triagem'` ➔ próxima etapa: `'apm'`, `statusSenha = 'aguardando'`.
     - Se `etapaSenha == 'apm'` ➔ próxima etapa: `'docs'`, `statusSenha = 'aguardando'`.
     - Se `etapaSenha == 'docs'` (Conclusão Definitiva de Matrícula):
       - `etapaSenha = 'docs'`, `statusSenha = 'finalizada'`, `dataHoraFimSenha = new Date()`.
       - Atualizar cadastro do aluno: `statusAluno = 'ATIVO'`.
       - Atualizar a matrícula vinculada (`CursoAluno`): `statusMatricula = 'ATIVA'`.
  4. Atualizar a `Senha` e as entidades do aluno vinculadas.
* **Resposta (HTTP 200):**
  ```json
  {
    "mensagem": "Atendimento finalizado com sucesso.",
    "proximaEtapa": "docs"
  }
  ```

---

## 4. Matriz de Erros e Validações

Erros padronizados delegados ao middleware de erro global:

| Cenário | Status HTTP | Mensagem de Retorno |
| :--- | :---: | :--- |
| Senha não encontrada | `404 Not Found` | `Senha não encontrada.` |
| Senha não pertence ao voluntário | `403 Forbidden` | `Esta senha não está em atendimento pelo seu usuário.` |
| Senha já finalizada ou cancelada | `400 Bad Request` | `A senha já foi finalizada ou cancelada.` |
| Atendente já possui outra senha aberta | `409 Conflict` | `Você já possui outro atendimento em andamento nesta etapa.` |
