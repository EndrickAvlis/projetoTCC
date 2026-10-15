# Especificação Técnica e Funcional: Tela de Postos

## 1. Finalidade deste documento

Este documento define de forma completa e definitiva o comportamento visual, funcional, arquitetural e técnico da tela administrativa de **Postos** do SIGA Phila (`/admin/postos`).

Ele orienta:
- O frontend React 19 (estrutura de páginas, componentes, hooks, services e tokens visuais);
- O reaproveitamento e padronização dos componentes de senhas e confirmações no sistema;
- As rotas, controladores, serviços e schemas de validação no backend Node.js / Express;
- O modelo do banco de dados (Prisma ORM e PostgreSQL);
- As regras de concorrência, filtros por período e segurança baseada em papéis (`admin` e `supervisor`).

---

## 2. Visão Geral e Responsabilidade da Tela

O nome e a rota no painel administrativo passam a ser **Postos** (`/admin/postos`).

A tela atua como o **centro de comando e monitor operacional** do atendimento do processo de matrículas, permitindo aos administradores e supervisores:
1. Acompanhar a vazão e o volume de senhas aguardando e em atendimento em cada posto operacional (Triagem, APM e Documentos);
2. Visualizar e gerenciar senhas com documentação pendente na Triagem;
3. Intervir administrativamente sobre senhas (alternar prioridade, transferir de posto e cancelar atendimento);
4. Analisar indicadores analíticos consolidados por períodos (Dia, Semana, Mês ou Personalizado);
5. Auditar o histórico completo de senhas encerradas (finalizadas e canceladas) com busca, paginação 7x7 e modal de detalhes.

### 2.1. Controle de Acesso e Permissões
- Tanto usuários com perfil **`admin`** quanto **`supervisor`** possuem acesso integral à tela e a todos os seus endpoints administrativos no backend.
- Atendentes não possuem acesso a esta tela (são direcionados às suas respectivas telas operacionais).

---

## 3. Divisão em 3 Abas Principais

A tela é organizada em 3 abas de navegação direta:
1. **Filas**: Monitoramento operacional dos 4 blocos retráteis (Triagem, APM, Documentos e Pendências de documentação), senhas em atendimento, senhas aguardando e ações imediatas.
2. **Atendimento**: Painel de inteligência operacional com filtros avançados de data (dia, semana, mês, personalizado), curso e período, 4 cards de KPIs, modal de cursos ativos, gráfico de finalizações por horário (07h às 18h) e gráfico retrátil de candidatos por curso.
3. **Histórico**: Tabela limpa e paginada (7 por 7) de senhas encerradas, com busca instantânea, filtro por situação, e filtro de período e modal de detalhes completos da senha.

---

## 4. Aba Filas

### 4.1. Controles Superiores da Aba
No topo da aba Filas situam-se os controles globais:
- **Toggle Switch "Mostrar somente prioritárias"**:
  - Componente switch reutilizável (`components/ui/ToggleSwitch.jsx`).
  - Quando ativo, filtra os cards das senhas exibidos em cada posto para mostrar apenas aquelas com prioridade.
  - **Regra**: O filtro altera exclusivamente a exibição dos cards; os contadores totais dos cabeçalhos permanecem inalterados.
- **Botões de Ação Global**:
  - `Expandir todos`: abre simultaneamente os 4 blocos retráteis.
  - `Recolher todos`: fecha simultaneamente os 4 blocos retráteis.

---

### 4.2. Os 4 Menus Retráteis (`CardRetratilPosto` e `MenuRetratilPendencias`)

A aba apresenta 4 cards retráteis empilhados com identidades visuais distintas baseadas nos tokens do `globals.css`:

| Bloco | Identificador | Cor / Token | Ícone | Cabeçalho |
|---|---|---|---|---|
| **Triagem** | `triagem` | Verde (`#10b981` / Emerald) | `FiCheckCircle` | Nome destacado + Contadores (`X esperando`, `Y em atendimento`, `Z prioritárias`) |
| **APM** | `apm` | Laranja (`#f97316` / Orange) | `FiDollarSign` ou `FiShoppingBag` | Nome destacado + Contadores (`X esperando`, `Y em atendimento`, `Z prioritárias`) |
| **Documentos** | `docs` | Roxo (`#8b5cf6` / Purple) | `FiFileText` | Nome destacado + Contadores (`X esperando`, `Y em atendimento`, `Z prioritárias`) |
| **Pendências de documentação** | `pendencias` | Amarelo/Âmbar (`#eab308` / Amber) | `FiAlertTriangle` | Nome destacado + Badge `<N> pendentes` |

#### Diretrizes dos Cabeçalhos dos Cards Retráteis:
- **Títulos**: Nomes dos postos com tipografia um pouco maior e peso semibold/bold para alta legibilidade.
- **Ícones**: Substituição de siglas textuais (`TR`, `AP`, `DO`, `!`) por ícones vetoriais modernos (`react-icons/fi`).
- **Sem setinhas e sem chevrons**: O cabeçalho é um botão de clique limpo e direto, sem o ícone de seta (`<`) ou chevron (`v` / `^`).
- **Sem badge de atendentes ativos**: O sistema não gerencia sessões ativas de voluntários no banco, portanto esse indicador foi integralmente removido.
- **Pendências de documentação**: Título direto e sem subtítulo longo explicativo, contendo o badge em destaque `<N> pendentes`.

---

### 4.3. Conteúdo Interno Expandido dos Postos (Triagem, APM, Documentos)

Quando expandido, cada posto divide seu espaço horizontalmente (em telas médias e grandes) ou verticalmente (em telas compactas):

#### 4.3.1. Senhas em Atendimento (Lado Esquerdo)
- Exibição alinhada ao visual dos postos operacionais de atendimento.
- Cada card exibe:
  - Número formatado da senha (ex: `A038`);
  - Identificação clara do guichê onde o atendimento ocorre (ex: `Guichê 1`);
  - Destaque com preenchimento suave da cor do posto;
  - Se for prioritária: borda e indicação visual destacada de prioridade;
  - Ao clicar no card, abre o **Modal de Detalhes da Senha**.

#### 4.3.2. Senhas Aguardando (Lado Direito)
- Grade de senhas utilizando o componente reutilizável `FilaGrid`.
- Cada card exibe o número formatado da senha (ex: `A042`).
- Senhas prioritárias possuem borda amarela destacada (`border-status-warning border-2`), aparecendo ordenadas no topo da fila.
- Ao clicar no card, abre o **Modal de Detalhes da Senha**.

---

### 4.4. Conteúdo Interno Expandido de Pendências de Documentação (`MenuRetratilPendencias`)

- Lista as senhas que tiveram o atendimento pausado na Triagem devido à ausência de documentos.
- Ordenadas rigorosamente da **mais antiga para a mais recente** (`registradaEm ASC`).
- Cada card exibe:
  - Número formatado da senha (ex: `A012`);
  - Quantidade de documentos pendentes com texto: `X documentos faltando`;
  - Horário de registro da pendência com o texto: `Pendente desde HH:mm`;
  - Destaque se a senha for prioritária;
  - **Tooltip ao passar o mouse ou focar via teclado**:
    ```text
    Documentos pendentes:
    • CIN
    • RG
    • Foto 3x4
    ...
    ```
  - Ao clicar no card, abre o **Modal de Detalhes da Senha**.

---

## 5. Modal de Detalhes da Senha e Ações Administrativas

O mesmo modal padronizado (`DetalhesSenhaModal.jsx`, baseado em `components/ui/Modal.jsx`) atende a todas as situações da senha:
- Senhas `aguardando`
- Senhas `em_atendimento`
- Senhas `pendente`
- Senhas encerradas (`finalizada` ou `cancelada`), abertas a partir da aba Histórico!

### 5.1. Cabeçalho e Identificação Visual
- **Número da Senha**: Exibido em destaque (ex: `A039`).
- **Badges alinhados**:
  - **Badge de Situação**: `Aguardando`, `Em atendimento`, `Pendente`, `Finalizada` ou `Cancelada`, com cantos suavemente arredondados (padrão `rounded-md` do sistema).
  - **Badge de Tipo**: `Prioritária` ou `Normal`, com a **mesma largura** do badge de situação para harmonia visual.

### 5.2. Dados Cadastrais e Operacionais
- **Aluno**: Nome do aluno vinculado ou a mensagem explícita *"Aluno ainda não identificado"* (caso de senhas aguardando na Triagem).
- **Curso e Período**: Exibição do curso e turno vinculado (ex: `Administração - Manhã`).
- **Posto**: Posto em que a senha se encontra ou onde foi encerrada.
- **Horário de Emissão**: Hora em que a senha foi emitida (ex: `13:12`).
- **Horário de Atendimento / Pendência**:
  - Se em atendimento: exibe o Guichê e horário de início do atendimento atual.
  - Se pendente: exibe `Pendente desde HH:mm` e a lista completa dos documentos faltando.
  - Se encerrada (finalizada/cancelada): exibe o horário de encerramento (ex: `14:24`) e o **Tempo Total de Atendimento** (ex: `1h12`).

### 5.3. Ações Administrativas no Rodapé do Modal

1. **Alternar Prioridade (`Tornar prioritária` / `Remover prioridade`)**:
   - Disponível para senhas ativas (`aguardando`, `em_atendimento`, `pendente`).
   - Desabilitada para senhas encerradas (`finalizada`, `cancelada`).
   - Atualiza imediatamente no backend e reflete na interface sem recarregar a página inteira.

2. **Alterar Posto (Transferência)**:
   - **Regra de domínio**: Disponível **única e exclusivamente** para senhas com status `aguardando`.
   - Abre modal compacto de confirmação (`TransferirSenhaModal.jsx`), listando apenas os outros postos disponíveis (excluindo o posto atual).
   - Ao confirmar, dispara a transferência atômica com validação de concorrência. Se a senha tiver acabado de ser chamada por um guichê, o sistema avisa o usuário com mensagem amigável e recarrega os dados.

3. **Cancelar Senha**:
   - Disponível para senhas ativas (`aguardando`, `em_atendimento`, `pendente`).
   - Aciona o modal padronizado de confirmação do sistema (`ModalConfirmacao.jsx`), **sem exigência de preenchimento de motivo**, solicitando apenas a confirmação direta da ação pelo administrador/supervisor.
   - Ao confirmar, encerra atendimentos em aberto, marca `statusSenha = "cancelada"`, registra `dataHoraFimSenha = agora` e move a senha imediatamente para a aba Histórico.

---

## 6. Aba Atendimento (Painel de Inteligência Operacional)

Apresenta indicadores consolidados, gráficos e relatórios dinâmicos sobre o fluxo de atendimento.

### 6.1. Filtros Globais da Aba (Topo Direito)
Os três filtros trabalham de forma coordenada e afetam **todos os componentes** da aba simultaneamente:
1. **Filtro de Período / Data**:
   - `Hoje` (padrão)
   - `Semana` (últimos 7 dias)
   - `Mês` (mês corrente)
   - `Personalizado` (seleção de data inicial e data final)
2. **Filtro de Curso**:
   - Opção `Todos os cursos` e lista de cursos individuais cadastrados.
3. **Filtro de Turno / Período**:
   - Opção `Todos os períodos` e períodos individuais (`Manhã`, `Tarde`, `Noite`, `Integral`, `Online`).

---

### 6.2. 4 Cards de Indicadores (KPIs)

1. **Senhas finalizadas**:
   - Destaque verde à esquerda, contagem do total de senhas que concluíram todo o fluxo no período filtrado.
   - Subtítulo: *"Concluíram todo o fluxo"*.
2. **Senhas canceladas**:
   - Destaque vermelho à esquerda, contagem de senhas canceladas pelo administrador no período filtrado.
   - Subtítulo: *"Encerradas pelo administrador"*.
3. **Senhas emitidas**:
   - Destaque azul à esquerda, contagem de todas as senhas geradas no período filtrado.
   - Rótulo: *"Total emitidas"*.
4. **Cursos ativos**:
   - Destaque em **azul claro tipo ciano**, contagem de cursos que possuem ofertas com matrículas ativas.
   - Subtítulo: *"Com matrícula disponível"*.
   - **Elemento Clicável**: Ao clicar no card, abre o **Modal de Cursos Ativos**.

---

### 6.3. Modal de Cursos Ativos para Matrícula (`CursosAtivosModal.jsx`)

Exibe a relação detalhada dos cursos que estão recebendo matrículas:
- Layout estruturado em **pequenos cards limpos e modernos** para cada curso;
- Cada card exibe:
  - Nome do curso;
  - **Pequenos badges** indicando os turnos/períodos disponíveis (ex: `Manhã`, `Noite`);
  - Total de candidatos vinculados/cadastrados para o curso no período do filtro selecionado.

---

### 6.4. Gráfico 1: "Senhas finalizadas por horário" (Lado Esquerdo)

- **Eixo Horário**: Intervalo das **07h às 18h** (agrupamento de 1 em 1 hora).
- **Conteúdo**: Contabiliza somente pessoas que concluíram todo o fluxo (`statusSenha = "finalizada"` de acordo com o horário de finalização).
- **Identidade Visual**:
  - Barras na cor oficial do sistema: azul escuro `#0a2647` (`--color-primary`);
  - Cantos superiores das barras arredondados;
  - Badge em destaque no topo do card com o período filtrado (ex: `Hoje`);
  - Tooltip interativo ao passar o mouse ou tocar, exibindo a hora e o número exato de finalizações.

---

### 6.5. Gráfico 2: "Candidatos por curso" (Lado Direito, Retrátil)

- **Card Retrátil**: Possui controle de expansão/recolhimento.
  - **Quando recolhido**: Exibe de forma compacta apenas o título **"Candidatos por curso"** e o botão de expandir.
  - **Quando expandido**: Exibe o título, subtítulo *"Cursos ativos"* e as barras de distribuição.
- **Estrutura Visual**:
  - Formato de ranking horizontal com barras de progresso proporcionais;
  - Cada linha exibe:
    1. Posição e Nome do curso (ex: `1. Desenvolvimento de Sistemas`);
    2. Barra de progresso horizontal;
    3. Quantidade de candidatos identificados no período filtrado (ex: `29`).

---

## 7. Aba Histórico (Auditoria de Senhas Encerradas)

Dedicada à conferência detalhada de todas as senhas que concluíram o fluxo (`finalizada`) ou que foram interrompidas (`cancelada`).

### 7.1. Controles e Filtros
- **Título**: "Senhas encerradas" (sem subtítulo longo).
- **Card de Resultados**: Card/badge em destaque no canto superior direito indicando o total de registros (ex: `15 resultados`).
- **Campo de Busca**: Input de busca padronizado com ícone de lupa e texto *"Pesquisar por número da senha ou nome do aluno..."*, aplicando debounce de 300ms.
- **Filtros Combinados**:
  - Filtro de Período de Data (`Hoje`, `Semana`, `Mês`, `Personalizado`);
  - Filtro de Situação (`Todas as situações`, `Finalizadas`, `Canceladas`).

---

### 7.2. Tabela de Dados (`DataTable`)
A tabela apresenta um layout limpo, com as colunas essenciais:

| Coluna | Conteúdo | Exemplo |
|---|---|---|
| **SENHA** | Código da senha em negrito | `A039` |
| **ALUNO** | Nome do aluno cadastrado | `Lívia Fernandes` |
| **CURSO** | Nome do curso com o período junto | `Administração - Manhã` |
| **SITUAÇÃO** | Badge pill padronizado | `• Finalizada` (verde) ou `• Cancelada` (vermelho) |
| **AÇÕES** | Botão/link para abrir detalhes | `Ver detalhes` |

> **Nota de Design**: Informações complementares de tempo (horário de emissão, horário de encerramento e o Tempo Total de Atendimento) ficam agrupadas com clareza dentro do **Modal de Detalhes da Senha**, preservando a tabela leve e agradável.

---

### 7.3. Paginação e Rodapé
- Paginação server-side de **7 em 7 itens** (`limite = 7`), seguindo o padrão já utilizado na tela de Alunos.
- Rodapé com contagem: `Mostrando 1–7 de 15 senhas`.
- Controles de paginação nativos do componente `DataTable`: botão anterior (`<`), números de página com círculo azul escuro na página ativa, e botão próximo (`>`).

---

## 8. Arquitetura de Componentes Frontend e Padronização

Para evitar código duplicado e seguir o princípio DRY (Don't Repeat Yourself), a implementação unifica os padrões visuais:

### 8.1. Estrutura de Arquivos

```text
frontend/src/
├── components/
│   ├── ui/
│   │   ├── ToggleSwitch.jsx              # Switch genérico reutilizável
│   │   ├── ModalConfirmacao.jsx          # Diálogo padronizado de confirmação
│   │   ├── DataTable.jsx                 # Tabela com paginação server-side
│   │   └── Modal.jsx                     # Modal base do sistema
│   └── Fila/
│       ├── FilaGrid.jsx                  # Grade de senhas aguardando reutilizável
│       ├── SenhaCard.jsx                 # Card unificado de senha (atendimento / aguardando / histórico)
│       └── SenhaAtualCard.jsx            # Card de atendimento do operador
├── features/admin/
│   ├── pages/
│   │   └── postosPage.jsx                # Página mestre da rota /admin/postos
│   ├── components/postos/
│   │   ├── CardRetratilPosto.jsx         # Card retrátil individual de cada posto (TR, AP, DO)
│   │   ├── MenuRetratilPendencias.jsx    # Card retrátil de pendências com tooltip
│   │   ├── DetalhesSenhaModal.jsx        # Modal com dados da senha e histórico
│   │   ├── TransferirSenhaModal.jsx      # Modal compacto para transferir fila
│   │   ├── CursosAtivosModal.jsx         # Modal com cards pequenos dos cursos ativos
│   │   ├── GraficoFinalizadasHora.jsx    # Gráfico de barras por hora (07h às 18h)
│   │   └── RankingCandidatosCurso.jsx    # Card retrátil com ranking horizontal de cursos
│   ├── hooks/
│   │   ├── usePostos.js                  # Lógica e polling da Aba Filas
│   │   ├── useAtendimentoPostos.js       # Lógica e métricas da Aba Atendimento
│   │   └── useHistoricoPostos.js         # Lógica e paginação da Aba Histórico
│   └── services/
│       └── postosService.js              # Chamadas HTTP padronizadas via apiClient
```

### 8.2. Componentes UI Universais Propostos
1. **`ToggleSwitch.jsx`**: Switch estilizado para substituição de checkboxes booleanos em qualquer parte do sistema.
2. **`ModalConfirmacao.jsx`**: Diálogo com título, mensagem explicativa, botão de confirmação com variante (`danger`, `primary`) e botão cancelar. Substitui alertas manuais e confirmações ad-hoc.
3. **`SenhaCard.jsx`**: Componente padrão para desenhar senhas no sistema com suporte a variantes (`atendimento`, `aguardando`, `historico`, `pendente`).

---

## 9. Análise Técnica dos Gráficos: SVG / Tailwind vs Recharts

O usuário solicitou uma recomendação técnica fundamentada sobre a melhor opção para a renderização dos gráficos no projeto:

| Critério | Opção A: SVG / HTML com Tailwind (Recomendada) | Opção B: Biblioteca Recharts |
|---|---|---|
| **Compatibilidade React 19** | 100% nativo, sem risco de incompatibilidade ou erros de peer dependencies. | Requer versões específicas (v2.15+) ou flags de instalação; histórico de atritos com React 19 canary/latest. |
| **Peso no Bundle** | 0 KB adicionais. Código limpo, ultra leve e de carregamento instantâneo. | +500 KB adicionais de biblioteca externa e dependências de cálculo geométrico. |
| **Fidelidade Visual** | Idêntico aos protótipos (`media_1790374794298.png`), utilizando diretamente os tokens de cor do `globals.css`. | Exige sobrescrever CSS/SVG interno da biblioteca para alinhar fontes, cantos arredondados e cores do sistema. |
| **Manutenibilidade** | Fácil de debugar e estilizar usando classes Tailwind normais. | Exige consulta à API do Recharts (ResponsiveContainer, BarChart, Tooltip, XAxis, etc.). |

**Recomendação Oficial**: Utilizar **Opção A (SVG/Tailwind sob medida)**. Por se tratar de gráficos pontuais (barras verticais horárias e barras horizontais de ranking), o código é enxuto, extremamente rápido e não adiciona dívida técnica ou incompatibilidades futuras com o React 19.

---

## 10. Atualização dos Dados e Sincronização em Tempo Real

1. **Polling Silencioso na Aba Filas**:
   - Ciclo automático a cada **30 segundos**;
   - Atualização em segundo plano: mantém abas, postos expandidos e seleções abertas sem causar "piscadas" ou descer a rolagem da tela;
   - Exibição discreta do horário da última atualização bem-sucedida (ex: `Atualizado às 14:42:05`);
   - Botão `Atualizar agora` para sincronização manual imediata.
2. **Atualização Imediata pós-Mutações**:
   - Sempre que o administrador alternar a prioridade, transferir o posto ou cancelar a senha, o estado local é atualizado instantaneamente com o retorno da API, disparando também um refresh silencioso das filas sem aguardar o intervalo de 30 segundos.

---

## 11. Especificação de Rotas e Contratos da API (Backend)

Todas as rotas são prefixadas por `/admin/postos` e protegidas pelos middlewares `accessValidator` e `validarRole(["admin", "supervisor"])`.

### 11.1. `GET /admin/postos` — Resumo Consolidado das Filas
- **Objetivo**: Retorna em uma única consulta os dados completos para a renderização dos 4 cards retráteis da aba Filas.
- **Resposta (`200 OK`)**:
```json
{
  "atualizadoEm": "2026-09-25T19:30:00.000Z",
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
          "iniciadoEm": "2026-09-25T19:15:00.000Z",
          "aluno": { "id": 12, "nome": "Gabriel Moraes" }
        }
      ],
      "aguardando": [
        {
          "id": 42,
          "codigo": 42,
          "prioritaria": false,
          "emitidaEm": "2026-09-25T19:10:00.000Z"
        }
      ]
    },
    {
      "id": "apm",
      "nome": "APM",
      "totais": { "aguardando": 5, "emAtendimento": 1, "prioritarias": 2 },
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
      "registradaEm": "2026-09-25T18:40:00.000Z",
      "quantidadeDocumentos": 2,
      "documentos": ["foto_3x4", "historico_ensino_fundamental"],
      "aluno": { "id": 4, "nome": "Alice Mendes" },
      "curso": { "id": 3, "nome": "Enfermagem", "periodo": "integral" }
    }
  ]
}
```

---

### 11.2. `GET /admin/postos/atendimento` — Indicadores e Gráficos
- **Query Params**:
  - `tipoPeriodo`: `hoje` | `semana` | `mes` | `personalizado` (padrão: `hoje`)
  - `dataInicio`: `YYYY-MM-DD` (obrigatório se personalizado)
  - `dataFim`: `YYYY-MM-DD` (obrigatório se personalizado)
  - `cursoId`: número inteiro (opcional)
  - `periodo`: `manha` | `tarde` | `noite` | `integral` | `online` (opcional)
- **Resposta (`200 OK`)**:
```json
{
  "periodo": {
    "tipo": "hoje",
    "inicio": "2026-09-25T00:00:00-03:00",
    "fim": "2026-09-25T23:59:59-03:00"
  },
  "indicadores": {
    "senhasFinalizadas": 85,
    "senhasCanceladas": 5,
    "senhasEmitidas": 112,
    "cursosAtivos": 7
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
  "candidatosPorCurso": [
    { "cursoId": 1, "curso": "Desenvolvimento de Sistemas", "quantidade": 29 },
    { "cursoId": 2, "curso": "Administração", "quantidade": 27 },
    { "cursoId": 3, "curso": "Enfermagem", "quantidade": 21 }
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

### 11.3. `GET /admin/postos/historico` — Histórico de Senhas Encerradas
- **Query Params**:
  - `busca`: texto livre (código da senha ou nome do aluno)
  - `status`: `finalizada` | `cancelada` (opcional)
  - `tipoPeriodo`: `hoje` | `semana` | `mes` | `personalizado` (padrão: `hoje`)
  - `dataInicio`: `YYYY-MM-DD`
  - `dataFim`: `YYYY-MM-DD`
  - `pagina`: número inteiro positivo (padrão: 1)
  - `limite`: número de itens por página (padrão: 7)
- **Resposta (`200 OK`)**:
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
      "emitidaEm": "2026-09-25T13:12:00.000Z",
      "encerradaEm": "2026-09-25T14:24:00.000Z",
      "status": "finalizada",
      "tempoTotalFormatado": "1h12",
      "duracaoSegundos": 4320
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

### 11.4. `GET /admin/postos/senhas/:senhaId` — Detalhes da Senha
- **Resposta (`200 OK`)**:
```json
{
  "senha": {
    "id": 18,
    "codigo": 18,
    "status": "pendente",
    "posto": "triagem",
    "prioritaria": true,
    "emitidaEm": "2026-09-25T15:16:00.000Z",
    "encerradaEm": null,
    "tempoTotalFormatado": null,
    "guiche": null,
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
      "registradaEm": "2026-09-25T15:43:00.000Z",
      "documentos": ["rg_cin", "cpf_cin", "comprovante_escolaridade_publica"]
    },
    "acoes": {
      "podeAlterarPrioridade": true,
      "podeTransferir": false,
      "podeCancelar": true
    }
  }
}
```

---

### 11.5. `PATCH /admin/postos/senhas/:senhaId/posto` — Transferência de Posto
- **Body**: `{ "posto": "apm" }`
- **Validação Transacional**:
  - Senha deve existir (`404 SENHA_NAO_ENCONTRADA`).
  - Status deve ser `aguardando` (`409 SENHA_NAO_AGUARDANDO`).
  - Posto de destino não pode ser o mesmo do atual (`409 POSTO_IGUAL`).
  - Proteção contra corrida via `updateMany` transacional no Prisma.
- **Resposta (`200 OK`)**:
```json
{
  "message": "Senha transferida para APM com sucesso.",
  "senha": {
    "id": 42,
    "codigo": 42,
    "posto": "apm",
    "status": "aguardando"
  }
}
```

---

### 11.6. `PATCH /admin/postos/senhas/:senhaId/cancelamento` — Cancelamento Administrativo
- **Body**: `{}` (confirmação direta, sem obrigatoriedade de motivo)
- **Validação**:
  - Senha não pode estar encerrada (`409 SENHA_JA_ENCERRADA`).
  - Encerra qualquer histórico em aberto (`dataHoraFimHistorico = agora`).
  - Define `statusSenha = "cancelada"` e `dataHoraFimSenha = agora`.
- **Resposta (`200 OK`)**:
```json
{
  "message": "Senha cancelada com sucesso.",
  "senha": {
    "id": 42,
    "codigo": 42,
    "status": "cancelada",
    "encerradaEm": "2026-09-25T19:40:00.000Z"
  }
}
```

---

### 11.7. `PATCH /senhas/:senhaId/prioridade` — Alternância de Prioridade
- **Body**: `{ "tipoSenha": true }` ou `{ "tipoSenha": false }`
- **Resposta (`200 OK`)**:
```json
{
  "message": "Prioridade atualizada com sucesso.",
  "senha": {
    "id": 42,
    "tipoSenha": true
  }
}
```

---

## 12. Alteração Mínima no Banco de Dados (Prisma ORM)

Para suportar o armazenamento nativo e padronizado dos documentos pendentes sem criar tabelas desnecessárias para checklists fixos:

No arquivo `backend/prisma/schema.prisma`:
```prisma
model Senha {
  idSenha             Int       @id @default(autoincrement())
  codAluno            Int?
  senhaCodigo         Int    
  dataHoraInicioSenha DateTime
  dataHoraFimSenha    DateTime?
  etapaSenha          String    @db.VarChar(15)
  tipoSenha           Boolean   @default(false)
  statusSenha         String    @db.VarChar(20)
  documentosPendentes Json?     // Campo adicionado para persistir pendências

  aluno      Aluno?           @relation(fields: [codAluno], references: [idAluno])
  historicos HistoricoSenha[]
}
```

### Estrutura do JSON de Documentos Pendentes:
```json
{
  "versao": 1,
  "registradaEm": "2026-09-25T15:43:00.000Z",
  "resolvidaEm": null,
  "documentos": [
    "rg_cin",
    "cpf_cin",
    "foto_3x4",
    "comprovante_escolaridade_publica",
    "historico_ensino_fundamental"
  ]
}
```

---

## 13. Roteiro e Fases de Execução

1. **Fase 1 — Backend e Banco de Dados**:
   - Atualizar `schema.prisma` com `documentosPendentes Json?` e rodar migração/push;
   - Implementar `backend/src/schemas/SchemaPostos.js` com validações Zod completas;
   - Implementar `backend/src/services/PostosAdminService.js` com consultas paralelas consolidadas, transações atômicas de transferência e cancelamento, e filtros por período;
   - Implementar `backend/src/controllers/PostosAdminController.js`;
   - Registrar rotas em `backend/src/routes/postosAdminRoutes.js` com permissões para `admin` e `supervisor`;
   - Registrar `/admin/postos` no `backend/src/app.js`.

2. **Fase 2 — Componentes Base e Utilitários no Frontend**:
   - Criar `components/ui/ToggleSwitch.jsx`;
   - Criar `components/ui/ModalConfirmacao.jsx`;
   - Adaptar/generalizar `components/Fila/FilaGrid.jsx` e criar `components/Fila/SenhaCard.jsx`;
   - Implementar `features/admin/services/postosService.js`.

3. **Fase 3 — Hooks e Abas da Tela de Postos**:
   - Implementar `usePostos.js` (com polling silencioso de 30s);
   - Implementar `useAtendimentoPostos.js` (com filtros por período, curso e turno);
   - Implementar `useHistoricoPostos.js` (com debounce e paginação 7x7);
   - Construir os componentes da Aba Filas (`CardRetratilPosto`, `MenuRetratilPendencias`);
   - Construir os modais (`DetalhesSenhaModal`, `TransferirSenhaModal`, `CursosAtivosModal`);
   - Construir os gráficos (`GraficoFinalizadasHora`, `RankingCandidatosCurso`);
   - Integrar a página final em `features/admin/pages/postosPage.jsx`.

4. **Fase 4 — Rotas, Navegação e Validação**:
   - Atualizar navegação em `adminNavigation.js` para rotular "Postos" apontando para `/admin/postos`;
   - Atualizar rotas em `App.jsx` substituindo `/admin/filas` por `/admin/postos`;
   - Testar o fluxo completo em múltiplos tamanhos de tela.
