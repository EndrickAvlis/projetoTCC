# Especificação Técnica do Back-end — Posto de Triagem (`TELA_TRIAGEM`)

## 1. Visão Geral do Fluxo

A Triagem é o primeiro posto de atendimento presencial da matrícula:
1. **Identificação do Aluno:** O atendente busca o aluno já existente no autocomplete (`GET /alunos`) utilizando os cursos disponíveis (`GET /cursos`). Caso seja um novo aluno não encontrado na busca, os dados são digitados diretamente no formulário sem necessidade de requisição prévia de cadastro.
2. **Persistência dos Dados (`PUT /senhas/:senhaId/aluno`):** Opera como um **Upsert Atômico**. Os dados preenchidos no formulário (dados pessoais do aluno e matrícula em curso/período/ano) são persistidos (criados se `alunoId == null` ou atualizados se já existir) e vinculados à senha em atendimento antes do encerramento.
3. **Desfecho sem Pendência:** Se a documentação estiver completa, o frontend executa `POST /atendimentos/finalizar` (ver [`ATENDIMENTO.md`](./ATENDIMENTO.md)), que encerra o histórico da senha e a encaminha para a fila da `apm`.
4. **Desfecho com Pendência (`POST /pendencias`):** Se faltar qualquer documento obrigatório, o atendente seleciona os itens faltantes e salva a pendência informando o `atendimentoId`. A senha assume `status = 'pendente'` e o guichê é liberado.
5. **Gestão e Retomada de Pendências:** A aba de pendências monitora as senhas pendentes da etapa (`GET /pendencias?etapa=triagem`). Ao retornar com os documentos faltantes, o atendimento é reaberto diretamente no guichê via `POST /pendencias/retomar`.

> **Nota:** As rotas universais de ciclo de atendimento (`iniciar`, `recuperar`, `rechamar`, `finalizar` e `cancelar`) são comuns a todos os postos operacionais e estão centralizadas em [`ATENDIMENTO.md`](./ATENDIMENTO.md). Todo o ciclo de pendências (`GET /pendencias`, `POST /pendencias` e `POST /pendencias/retomar`) é de domínio exclusivo da Triagem e está especificado integralmente neste documento.

---

## 2. Leitura de Cursos (`GET /cursos`)

* **Rota:** `GET /cursos`
* **Autenticação:** Obrigatória (`atendente`, `supervisor`, `admin`)
* **Finalidade:** Alimentar os seletores de curso e validar os períodos do formulário da triagem.

### Contrato de Resposta (HTTP 200):
```json
{
  "cursos": [
    {
      "id": 1,
      "nome": "Desenvolvimento de Sistemas",
      "periodos": [
        { "id": 1, "periodo": "manha", "vagasTotais": 40, "matriculaAtiva": true },
        { "id": 2, "periodo": "tarde", "vagasTotais": 40, "matriculaAtiva": true }
      ]
    }
  ],
  "total": 1
}
```

---

## 3. Busca Operacional de Candidatos (`GET /alunos`)

* **Rota:** `GET /alunos`
* **Autenticação:** Obrigatória
* **Finalidade:** Busca rápida por nome com autocomplete para carregar os dados cadastrais do candidato e suas matrículas pré-existentes.
* **Otimização de Performance:** Projeção enxuta de campos no Prisma (`select` estrito dos dados visíveis no autocomplete, evitando join com tabelas de compras, histórico ou logs).

### Parâmetros de Consulta (Query Params):
* `nome` (string, obrigatório, mín: 2 caracteres): termo de busca parcial (insensível a maiúsculas/minúsculas).
* `limite` (inteiro, opcional, padrão: 10): quantidade máxima de registros retornados.

### Contrato de Resposta (HTTP 200):
```json
{
  "alunos": [
    {
      "id": 9,
      "nome": "Mariane Trindade",
      "cidade": "Orindiúva",
      "sexo": "F",
      "escolaridadePublica": true,
      "matriculas": [
        {
          "cursoId": 1,
          "curso": "Desenvolvimento de Sistemas",
          "classificacao": 1,
          "periodo": "manha",
          "anoEscolar": 1
        }
      ]
    }
  ],
  "total": 1
}
```

---

## 4. Salvar e Vincular Aluno à Senha (`PUT /senhas/:senhaId/aluno`)

* **Rota:** `PUT /senhas/:senhaId/aluno`
* **Autenticação:** Obrigatória
* **Finalidade:** Persistir os dados do formulário e vincular o aluno à senha atual. Funciona como **Upsert Atômico**: se o aluno for novo (`alunoId == null`), o registro é criado; se já existir, é atualizado, vinculando também o curso e a matrícula.

### Entrada (Payload):
```json
{
  "alunoId": 9,
  "dadosAluno": {
    "nome": "Mariane Trindade",
    "cidade": "Orindiúva",
    "sexo": "F",
    "escolaridadePublica": true
  },
  "matricula": {
    "cursoId": 1,
    "classificacao": 1,
    "periodo": "manha",
    "anoEscolar": 1
  }
}
```

### Passo a Passo da Transação no Back-end (`prisma.$transaction`):
1. **Validação da Senha:** Verificar se `senhaId` existe e pertence ao atendimento do voluntário logado.
2. **Aluno (Criar ou Atualizar — Upsert):**
   - Se `alunoId` for fornecido: atualizar dados em `Aluno` (`nomeAluno`, `cidadeAluno`, `sexoAluno`, `escolaridadePublica`).
   - Se `alunoId` for nulo: criar novo registro em `Aluno` com os dados enviados e obter o novo `idAluno`.
3. **Matrícula (`CursoAluno`):**
   - Atualizar ou inserir (`upsert`) registro em `CursoAluno` com `codCurso`, `codAluno`, `periodo`, `anoEscolar` e `classificacao`.
4. **Vínculo na Senha:**
   - Atualizar `Senha`: definir `codAluno = aluno.idAluno`.

### Contrato de Resposta (HTTP 200):
```json
{
  "mensagem": "Dados do aluno e matrícula vinculados à senha com sucesso.",
  "alunoId": 9
}
```

---

## 5. Listagem de Senhas Pendentes (`GET /pendencias`)

* **Rota:** `GET /pendencias?etapa=triagem`
* **Autenticação:** Obrigatória
* **Finalidade:** Listar todas as senhas que estão no estado `pendente` na etapa de triagem. Consumida pelo grid com polling de 5s no frontend.

### Resposta (HTTP 200):
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
        "nome": "Mariane Trindade"
      },
      "matricula": {
        "curso": "Desenvolvimento de Sistemas",
        "periodo": "manha",
        "anoEscolar": 1
      },
      "documentos": ["RG_CIN", "FOTO"],
      "registradaEm": "2026-10-09T20:15:00.000Z"
    }
  ],
  "total": 1
}
```

---

## 6. Registro de Pendência Documental (`POST /pendencias`)

* **Rota:** `POST /pendencias`
* **Autenticação:** Obrigatória
* **Finalidade:** Registrar a pendência documental da triagem quando faltam documentos obrigatórios, liberando o guichê para novas chamadas.

### Chaves de Documentos Válidas (`DOCUMENTOS_TRIAGEM`):
* `RG_CIN`: RG / Carteira de Identidade Nacional
* `CPF_CIN`: CPF / Carteira de Identidade Nacional
* `FOTO`: Foto 3x4
* `ESCOLARIDADE_PUBLICA`: Comprovação de Escolaridade Pública
* `HISTORICO_ENSINO_FUNDAMENTAL`: Histórico Escolar do Ensino Fundamental

### Entrada (Payload):
```json
{
  "atendimentoId": 102,
  "documentos": ["RG_CIN", "FOTO"]
}
```

### Passo a Passo da Transação no Back-end (`prisma.$transaction`):
1. **Validações Prévias:**
   - Validar se `atendimentoId` e `documentos` estão preenchidos.
   - Validar se `documentos` é um array não-vazio contendo apenas chaves válidas permitidas.
   - Localizar o atendimento (`HistoricoSenha`) pelo `atendimentoId` e conferir se está ativo e pertence ao voluntário solicitante.
2. **Atualização da Senha:**
   - Atualizar `Senha`:
     - `statusSenha = 'pendente'`
     - `etapaSenha = 'triagem'`
     - `pendenciaTriagem = { documentos, registradaEm: new Date() }`
3. **Fechamento do Histórico:**
   - Atualizar `HistoricoSenha`: `dataHoraFimHistorico = new Date()`.

### Contrato de Resposta (HTTP 200):
```json
{
  "mensagem": "Pendência documental registrada com sucesso."
}
```

---

## 7. Retomada de Atendimento Pendente (`POST /pendencias/retomar`)

* **Rota:** `POST /pendencias/retomar`
* **Autenticação:** Obrigatória (`atendente`, `supervisor`, `admin`)
* **Finalidade:** Retomar uma senha pendente quando o aluno retorna ao posto com os documentos faltantes, alocando-a imediatamente no guichê do atendente.

### Contrato de Entrada (Payload):
```json
{
  "senhaId": 15,
  "etapa": "triagem"
}
```

### Passo a Passo da Transação no Back-end (`prisma.$transaction`):
1. **Validações Prévias:**
   - Validar se o voluntário solicitante já possui outro atendimento ativo nesta etapa (se sim, rejeitar com `409 Conflict`).
   - Validar se a senha existe, está com `statusSenha = 'pendente'` e `etapaSenha = 'triagem'`.
2. **Reserva da Senha:**
   - Atualizar `Senha`:
     - `statusSenha = 'em_atendimento'`
3. **Abertura de Novo Histórico:**
   - Criar novo registro em `HistoricoSenha`:
     - `codSenha = senha.idSenha`
     - `codVoluntario = voluntarioAutenticado.idVoluntario`
     - `etapaHistorico = 'triagem'`
     - `dataHoraChamada = new Date()`
     - `dataHoraInicioHistorico = new Date()`

### Contrato de Resposta (HTTP 200):
```json
{
  "mensagem": "Atendimento retomado com sucesso.",
  "senha": {
    "id": 15,
    "codigo": 42,
    "tipoSenha": false,
    "etapa": "triagem",
    "status": "em_atendimento",
    "aluno": {
      "id": 9,
      "nome": "Mariane Trindade"
    }
  },
  "atendimento": {
    "id": 102,
    "iniciadoEm": "2026-10-09T20:30:00.000Z"
  },
  "documentos": ["RG_CIN", "FOTO"]
}
```

---

## 8. Matriz Consolidada de Erros e Validações da Triagem

| Cenário | Status HTTP | Código / Mensagem |
| :--- | :---: | :--- |
| Nenhum documento informado na pendência | `400 Bad Request` | `Selecione ao menos um documento faltante.` |
| Chave de documento inválida | `422 Unprocessable` | `Documento informado não é reconhecido pela Triagem.` |
| Atendente já possui atendimento ativo ao tentar retomar | `409 Conflict` | `Você já possui outro atendimento em andamento nesta etapa.` |
| Senha pendente já retomada por outro atendente | `409 Conflict` | `Esta senha pendente já foi retomada por outro guichê.` |
| Senha não encontrada | `404 Not Found` | `Senha não encontrada.` |
| Atendimento não encontrado ou não pertence ao usuário | `403 Forbidden` | `Atendimento não encontrado ou não autorizado.` |
| Aluno inexistente ao vincular | `404 Not Found` | `Aluno não encontrado.` |
| Curso inexistente ou inativo | `404 Not Found` | `Curso selecionado não encontrado.` |
