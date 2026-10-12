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

Todas as rotas exigem autenticação do voluntário (`atendente`, `supervisor` ou `admin`). O `idVoluntario` é extraído do token da sessão.

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
  1. Validar se a senha existe e está na etapa do posto.
  2. Criar ou confirmar abertura do registro em `HistoricoSenha` contendo `codSenha = senha.idSenha`, `codVoluntario = voluntarioAutenticado.idVoluntario`, `etapaHistorico = senha.etapaSenha` e `dataHoraInicioHistorico = new Date()`.
* **Resposta (HTTP 200):**
  ```json
  {
    "mensagem": "Atendimento iniciado com sucesso.",
    "atendimento": {
      "idHistorico": 84,
      "iniciadoEm": "2026-10-09T21:00:00.000Z"
    }
  }
  ```

---

### 3.2. Recuperar Atendimento Ativo (Resiliência / F5)
Permite que o atendente recupere o atendimento em andamento caso a página seja recarregada ou a conexão caia.

* **Rota:** `GET /atendimento/recuperar/:etapa`
* **Parâmetro de URL:** `etapa` (`triagem`, `apm` ou `docs`)
* **Responsabilidades do Back-end:**
  1. Buscar se o voluntário autenticado possui uma senha com `statusSenha = 'em_atendimento'` e `etapaSenha = etapa`.
  2. Incluir os dados do aluno (`nomeAluno`, curso) vinculados à senha.
  3. Buscar o `HistoricoSenha` ativo (sem `dataHoraFimHistorico`).
* **Resposta com atendimento ativo (HTTP 200):**
  ```json
  {
    "senha": {
      "id": 12,
      "codigo": 104,
      "prioritaria": false,
      "etapa": "apm",
      "aluno": {
        "idAluno": 15,
        "nome": "Endrick Silva Souza"
      }
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
Aciona o painel de chamadas sonoro/visual para reanunciar o número da senha.

* **Rota:** `POST /atendimento/rechamar`
* **Body:**
  ```json
  {
    "senhaId": 12,
    "etapa": "apm"
  }
  ```
* **Responsabilidades do Back-end:**
  1. Validar se a senha está sob atendimento do voluntário solicitante.
  2. Emitir evento de rechamada (WebSocket, SSE ou flag no banco de dados para o painel de senhas).
* **Resposta (HTTP 200):**
  ```json
  {
    "mensagem": "Senha rechamada no painel com sucesso."
  }
  ```

---

### 3.4. Finalizar Atendimento
Encerra a etapa atual da senha e transfere o aluno para o próximo posto na fila.

* **Rota:** `POST /atendimento/finalizar`
* **Body:**
  ```json
  {
    "senhaId": 12
  }
  ```
* **Transação no Back-end (`prisma.$transaction`):**
  1. Localizar a senha e verificar se `statusSenha == 'em_atendimento'`.
  2. Fechar o `HistoricoSenha` aberto associado a esta senha e voluntário (`dataHoraFimHistorico = new Date()`).
  3. Calcular a próxima etapa:
     - Se `etapaSenha == 'triagem'` ➔ próxima etapa: `'apm'`, `statusSenha = 'aguardando'`.
     - Se `etapaSenha == 'apm'` ➔ próxima etapa: `'docs'`, `statusSenha = 'aguardando'`.
     - Se `etapaSenha == 'docs'` ➔ `etapaSenha = 'docs'`, `statusSenha = 'finalizada'`, `dataHoraFimSenha = new Date()`.
  4. Atualizar a `Senha`.
* **Resposta (HTTP 200):**
  ```json
  {
    "mensagem": "Atendimento finalizado com sucesso.",
    "proximaEtapa": "docs"
  }
  ```

---

### 3.5. Cancelar
Utilizado quando o aluno chamado não compareceu ao guichê após tentativas de rechamada.

* **Rota:** `POST /atendimento/cancelar`
* **Body:**
  ```json
  {
    "senhaId": 12
  }
  ```
* **Transação no Back-end (`prisma.$transaction`):**
  1. Fechar o `HistoricoSenha` atual (`dataHoraFimHistorico = new Date()`).
  2. Atualizar `Senha`:
     - `statusSenha = 'cancelada'`
     - `dataHoraFimSenha = new Date()`
* **Resposta (HTTP 200):**
  ```json
  {
    "mensagem": "Atendimento cancelado com sucesso."
  }
  ```

---

### 3.6. Retomar Atendimento Pendente
Utilizado quando um aluno que estava com pendência documental retorna com os documentos e tem seu atendimento reaberto no guichê.

* **Rota:** `POST /atendimento/retomar`
* **Body:**
  ```json
  {
    "senhaId": 15,
    "etapa": "triagem"
  }
  ```
* **Transação no Back-end (`prisma.$transaction`):**
  1. Validar se o voluntário já possui outro atendimento ativo nesta etapa (`409 Conflict`).
  2. Validar se a senha está com `statusSenha = 'pendente'`.
  3. Atualizar `Senha`: `statusSenha = 'em_atendimento'`.
  4. Criar novo `HistoricoSenha` (`codSenha = senha.idSenha`, `codVoluntario = voluntarioAutenticado.idVoluntario`, `etapaHistorico = etapa`, `dataHoraInicioHistorico = new Date()`).
* **Resposta (HTTP 200):**
  ```json
  {
    "mensagem": "Atendimento retomado com sucesso.",
    "senha": {
      "id": 15,
      "codigo": 42,
      "tipoSenha": false,
      "etapa": "triagem",
      "status": "em_atendimento"
    },
    "atendimento": {
      "idHistorico": 102,
      "iniciadoEm": "2026-10-09T20:30:00.000Z"
    }
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
