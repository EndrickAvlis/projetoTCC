# Especificação Backend: Tela de Postos (/postos)

Este documento especifica estritamente as rotas, regras de negócio, parâmetros e contratos de dados que o **Backend (Node.js / Express / Prisma)** deve implementar para atender a tela de **Postos** no frontend.

---

## 1. Controle de Acesso e Permissões

* **Prefixo base:** `/postos`
* **Autenticação:** Obrigatória via cookie HTTP-only (`accessValidator`).
* **Autorização:** Apenas perfis `admin` e `supervisor` (`validarRole(["admin", "supervisor"])`).
* **Bloqueio:** Perfis `atendente` devem receber `403 Acesso Negado`.

---

## 2. Endpoints e Contratos da API

### 2.1. `GET /postos/filas` — Resumo Consolidado das Filas (Aba Filas)
Retorna os contadores gerais, as senhas em atendimento, as senhas aguardando em cada um dos 3 postos e a lista de pendências da Triagem.

* **Query Params:** Nenhum.
* **Resposta (`200 OK`):**
```json
{
  "atualizadoEm": "2026-10-16T11:00:00.000Z",
  "resumo": {
    "totalAguardando": 15,
    "totalEmAtendimento": 5,
    "totalPendentes": 4
  },
  "postos": [
    {
      "id": "triagem",
      "nome": "Triagem",
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
          "iniciadoEm": "2026-10-16T10:45:00.000Z",
          "emitidaEm": "2026-10-16T10:30:00.000Z",
          "aluno": { "id": 12, "nome": "Gabriel Moraes" },
          "curso": { "id": 1, "nome": "Administração", "periodo": "manha" }
        }
      ],
      "aguardando": [
        {
          "id": 42,
          "codigo": 42,
          "prioritaria": false,
          "emitidaEm": "2026-10-16T10:50:00.000Z",
          "aluno": { "id": 15, "nome": "Lucas Silva" },
          "curso": { "id": 2, "nome": "Informática", "periodo": "tarde" }
        }
      ]
    },
    {
      "id": "apm",
      "nome": "APM",
      "totais": { "aguardando": 5, "emAtendimento": 1, "prioritarias": 1 },
      "emAtendimento": [],
      "aguardando": []
    },
    {
      "id": "docs",
      "nome": "Documentos",
      "totais": { "aguardando": 4, "emAtendimento": 2, "prioritarias": 1 },
      "emAtendimento": [],
      "aguardando": []
    }
  ],
  "pendencias": [
    {
      "id": 12,
      "codigo": 12,
      "prioritaria": false,
      "registradaEm": "2026-10-16T10:30:00.000Z",
      "documentos": ["foto_3x4", "historico_ensino_fundamental"],
      "aluno": { "id": 4, "nome": "Alice Mendes" },
      "curso": { "id": 3, "nome": "Enfermagem", "periodo": "integral" }
    }
  ]
}
```

---

### 2.2. `GET /postos/atendimento` — Indicadores e Gráficos (Aba Atendimento)
Retorna os 4 KPIs de atendimento, o histograma de finalizações por hora (07h às 18h) e os candidatos por curso ativo.

* **Query Params:**
  * `tipoPeriodo`: `"hoje"` | `"semana"` | `"mes"` | `"personalizado"` (padrão: `"hoje"`)
  * `dataInicio`: `YYYY-MM-DD` (obrigatório se `tipoPeriodo === "personalizado"`)
  * `dataFim`: `YYYY-MM-DD` (obrigatório se `tipoPeriodo === "personalizado"`)
  * `cursoId`: número inteiro (opcional)
  * `periodoCurso`: `"manha"` | `"tarde"` | `"noite"` | `"integral"` | `"online"` (opcional)
* **Resposta (`200 OK`):**
```json
{
  "cards": {
    "senhasFinalizadas": 85,
    "senhasCanceladas": 5,
    "senhasEmitidas": 112,
    "tma": 14
  },
  "finalizadasPorHora": [
    { "hora": "07h", "quantidade": 0 },
    { "hora": "08h", "quantidade": 4 },
    { "hora": "09h", "quantidade": 8 },
    { "hora": "10h", "quantidade": 13 },
    { "hora": "11h", "quantidade": 16 },
    { "hora": "12h", "quantidade": 15 },
    { "hora": "13h", "quantidade": 18 },
    { "hora": "14h", "quantidade": 11 },
    { "hora": "15h", "quantidade": 0 },
    { "hora": "16h", "quantidade": 0 },
    { "hora": "17h", "quantidade": 0 },
    { "hora": "18h", "quantidade": 0 }
  ],
  "cursosAtivos": [
    {
      "id": 1,
      "nome": "Desenvolvimento de Sistemas",
      "periodos": ["manha", "tarde", "noite"],
      "candidatosPeriodo": 29
    }
  ]
}
```

---

### 2.3. `GET /postos/auditoria` — Auditoria de Senhas Encerradas (Aba Auditoria)
Retorna lista paginada das senhas que concluíram (`finalizada`) ou foram interrompidas (`cancelada`).

* **Query Params:**
  * `busca`: string livre para pesquisa por código da senha ou nome do aluno (opcional)
  * `status`: `"finalizada"` | `"cancelada"` (opcional; se omitido ou vazio, retorna ambas)
  * `tipoPeriodo`: `"hoje"` | `"semana"` | `"mes"` | `"personalizado"` (padrão: `"hoje"`)
  * `dataInicio`: `YYYY-MM-DD` (opcional)
  * `dataFim`: `YYYY-MM-DD` (opcional)
  * `pagina`: inteiro positivo (padrão: 1)
  * `limite`: inteiro positivo (padrão: 7)
* **Resposta (`200 OK`):**
```json
{
  "itens": [
    {
      "id": 39,
      "codigo": 39,
      "prioritaria": false,
      "status": "finalizada",
      "posto": "docs",
      "aluno": {
        "id": 17,
        "nome": "Lívia Fernandes"
      },
      "curso": {
        "id": 1,
        "nome": "Administração",
        "periodo": "manha"
      },
      "emitidaEm": "2026-10-16T10:12:00.000Z",
      "encerradaEm": "2026-10-16T11:24:00.000Z",
      "tempoTotal": "1h12",
      "duracaoSegundos": 4320,
      "documentos": []
    }
  ],
  "paginacao": {
    "pagina": 1,
    "limite": 7,
    "totalItens": 15,
    "totalPaginas": 3
  }
}
```

---

### 2.4. `PATCH /postos/:id/transferencia` — Transferência Administrativa de Posto
Transfere uma senha em fila de espera para outro posto de atendimento.

* **Parâmetro de URL:** `:id` (ID da senha, numérico).
* **Body:**
```json
{
  "posto": "apm"
}
```
  * *Valores válidos para `posto`:* `"triagem"`, `"apm"`, `"docs"`.
* **Regras de Negócio e Validações:**
  1. Senha deve existir (`404 SENHA_NAO_ENCONTRADA`).
  2. Status da senha deve ser estritamente `aguardando` (`409 SENHA_NAO_AGUARDANDO`).
  3. Posto de destino não pode ser idêntico ao posto atual (`400 POSTO_IGUAL`).
  4. Executar via transação atômica (`prisma.senha.updateMany` com filtro `where: { idSenha: id, statusSenha: 'aguardando' }`) para evitar concorrência caso um operador chame a senha simultaneamente.
* **Resposta (`200 OK`):**
```json
{
  "message": "Senha transferida com sucesso.",
  "senha": {
    "id": 42,
    "codigo": 42,
    "posto": "apm",
    "status": "aguardando"
  }
}
```

---

### 2.5. `PATCH /postos/:id/cancelamento` — Cancelamento Administrativo
Utilizado exclusivamente pelo Administrador ou Supervisor diretamente pelo painel administrativo quando o aluno chamado não compareceu ao guichê após as tentativas de rechamada ou por outra inconsistência.

* **Parâmetro de URL:** `:id` (ID da senha, numérico).
* **Body:** Vazio `{}`.
* **Transação no Back-end (`prisma.$transaction`):**
  1. Validar se o usuário autenticado possui o papel (role) de `admin` ou `supervisor` (`403 Forbidden`).
  2. Localizar a senha correspondente ao ID (`404 SENHA_NAO_ENCONTRADA`).
  3. Validar se a senha não está previamente encerrada (`finalizada` ou `cancelada`) (`409 SENHA_JA_ENCERRADA`).
  4. Fechar o `HistoricoSenha` que estiver aberto para esta senha (definindo `dataHoraFimHistorico = new Date()`), caso ela estivesse em atendimento no momento do cancelamento.
  5. Atualizar Senha:
     * `statusSenha = 'cancelada'`
     * `dataHoraFimSenha = new Date()`
* **Resposta (`200 OK`):**
```json
{
  "message": "Atendimento cancelado com sucesso pelo administrador.",
  "senha": {
    "id": 42,
    "codigo": 42,
    "status": "cancelada",
    "encerradaEm": "2026-10-16T11:30:00.000Z"
  }
}
```

---

### 2.6. `PATCH /senhas/:id/prioridade` — Alternância de Prioridade
*(Rota já existente no backend)*
* **Body:** `{ "tipoSenha": true }` ou `{ "tipoSenha": false }`.
* **Resposta (`200 OK`):** Retorna status de sucesso e objeto da senha atualizada.

---

## 3. Regras de Negócio e Lógica dos Cálculos

1. **Ordenação de Filas e Pendências:**
   * **Aguardando:** Prioritárias primeiro (`tipoSenha = true`), ordenadas por `dataHoraInicioSenha ASC`.
   * **Pendências:** Ordenadas da mais antiga para a mais recente (`registradaEm ASC`).
   * **Auditoria:** Ordenadas da mais recente para a mais antiga (`dataHoraFimSenha DESC`).

2. **Cálculo do TMA (Tempo Médio de Atendimento):**
   * Média aritmética calculada sobre senhas finalizadas no período selecionado: `(dataHoraFimHistorico - dataHoraInicioHistorico)`.
   * Resultado em minutos inteiros (`Math.round(totalMinutos / totalFinalizadas)`). Retornar `0` caso não haja finalizações.

3. **Histograma de Finalizadas por Hora (07h às 18h):**
   * Retornar obrigatoriamente um array fixo de 12 posições, cobrindo os horários de `"07h"` até `"18h"`.
   * Horários sem finalizações devem ter `quantidade: 0`.

4. **Documentos Pendentes:**
   * As chaves de documentos aceitas e reconhecidas pelo frontend são:
     * `foto_3x4`: Foto 3x4
     * `rg_cin`: RG / CIN
     * `cpf_cin`: CPF / CIN
     * `historico_ensino_fundamental`: Histórico Escolar
     * `comprovante_residencia`: Comprovante de Residência
     * `comprovante_escolaridade_publica`: Comprovante de Escola Pública
   * O campo `documentosPendentes` na tabela `Senha` deve armazenar o array de chaves (`documentos: string[]`) e a data do registro (`registradaEm: ISO string`).

---

## 4. Arquitetura Sugerida para o Backend

Para respeitar os padrões estabelecidos no projeto (KISS, Camadas Diretas sem overengineering):

```text
backend/src/
├── routes/
│   └── postosRoutes.js         # Rotas /postos com accessValidator e role check
├── controllers/
│   └── postosController.js     # Extração de params e respostas HTTP
├── schemas/
│   └── SchemaPostos.js         # Validações Zod para params, query e body
└── services/
    └── postosService.js        # Consultas Prisma, transações e métricas
```

Registrar no `backend/src/app.js`:
```javascript
import postosRoutes from "./routes/postosRoutes.js";
// ...
app.use("/postos", postosRoutes);
```
