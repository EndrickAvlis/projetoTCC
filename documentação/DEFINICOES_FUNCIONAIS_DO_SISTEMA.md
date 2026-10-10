# Definições Funcionais do Sistema — SIGA Phila

Este documento é a referência funcional oficial do projeto **SIGA Phila**. Seu objetivo é descrever a finalidade do sistema, seus atores, o fluxo operacional de atendimento e o papel de cada uma das telas e módulos, servindo como guia funcional para desenvolvimento e validação técnica do TCC.

---

## 1. Visão Geral e Objetivo do Sistema

O **SIGA Phila** é um sistema web desenvolvido sob medida para a **ETEC**, com o objetivo de gerenciar, organizar e otimizar todo o fluxo presencial de matrículas dos candidatos aprovados no Vestibulinho.

### Principais Problemas Solucionados
- **Desorganização de filas e salas:** elimina a aglomeração de candidatos e responsáveis nos corredores escolares.
- **Falta de visibilidade e gargalos:** monitora tempos médios de espera e atendimento em tempo real.
- **Gestão de pendências documentais:** controla casos em que o candidato comparece sem toda a documentação exigida, evitando retrabalho e perda de tempo na fila.
- **Arrecadação e controle da APM:** informatiza a venda de uniformes, locação de armários e arrecadação de contribuições voluntárias da Associação de Pais e Mestres, com controle de estoque e prestação de contas transparente.

---

## 2. Perfis de Usuários e Níveis de Acesso

O sistema é operado por três perfis de usuários (voluntários e servidores):

| Perfil | Escopo de Acesso | Responsabilidades Principais |
| :--- | :--- | :--- |
| **Administrador** | Acesso total e irrestrito a todas as telas operacionais e administrativas. | Configuração de cursos e vagas, importação de alunos via CSV, gestão de estoque e armários da APM, cadastro de usuários, cancelamento de senhas e relatórios consolidados. |
| **Supervisor** | Acesso às telas operacionais e à maioria das telas administrativas de monitoramento. | Acompanhamento do fluxo diário de filas, supervisão dos postos, apoio operacional e cadastro/gestão exclusiva de atendentes. |
| **Atendente** | Acesso restrito exclusivamente às telas dos postos operacionais vinculadas à sua atuação. | Atendimento direto dos candidatos nos postos de **Triagem**, **APM** ou **Documentos**. |

### Regra do Guichê de Atendimento
O guichê físico (mesa/posto de atendimento) **não é uma tabela cadastral fixa** no banco de dados. O número do guichê é informado dinamicamente pelo atendente no momento do login, permitindo total flexibilidade de reorganização das mesas e salas a cada turno de trabalho.

---

## 3. Jornada do Candidato e Fluxo Operacional

O processo presencial de matrícula é estruturado em etapas sequenciais pelas quais cada candidato avança:

```text
[ 1. Totem ] ──▶ [ Painel de TV ] ──▶ [ 2. Triagem ] ──▶ [ 3. APM ] ──▶ [ 4. Docs ] ──▶ [ Concluído ]
                          ▲                   │
                          │                   ▼
                          └── (Se houver) [ Pendência ]
```

1. **Chegada e Emissão de Senha:** O candidato retira uma senha numerada no totem e aguarda a chamada visual e sonora no painel.
2. **Posto 1 — Triagem:** Identificação cadastral do candidato, conferência inicial da documentação e vínculo da matrícula à senha. Se houver falta de documentos, a senha é marcada como pendente e o guichê é liberado.
3. **Posto 2 — APM:** Venda facultativa de camisetas de uniforme escolar, locação de armários individuais e registro de contribuição voluntária para a escola.
4. **Posto 3 — Documentos (Docs):** Conferência final da secretaria escolar, validação do dossiê do estudante e encerramento da senha presencial.

---

## 4. Descrição das Telas e Módulos

### 4.1. Módulo Operacional (Atendimento Presencial)

#### Totem de Autoatendimento (`/emitir-senha`)
- Interface simplificada voltada ao público na entrada da escola.
- Permite a emissão de **Senha Normal** ou **Senha Prioritária** (gestantes, idosos, pessoas com deficiência).
- Gera numeração sequencial diária única para toda a escola.
- Aciona a impressão térmica do comprovante contendo número, tipo, data e horário de emissão.

#### Painel de Chamada de TV (`/painel`)
- Interface de exibição em tela cheia projetada em televisores e monitores nas salas de espera.
- Exibe com destaque a **senha chamada**, o **posto de destino** e o **número do guichê**.
- Dispara alerta sonoro e sintetização de voz para guiar o candidato.
- Apresenta barra lateral com o histórico das últimas senhas chamadas e relógio em tempo real.

#### Estrutura Comum dos Postos de Atendimento (`/postos/:posto`)
Todas as telas operacionais (**Triagem**, **APM** e **Documentos**) compartilham uma estrutura visual padronizada:
- **Painel de Fila:** listagem ordenada das senhas aguardando atendimento na etapa atual, com destaque para senhas prioritárias. Permite chamada automática (próxima da fila) ou chamada manual pelo atendente.
- **Card de Senha Ativa:** exibição clara da senha em atendimento no guichê, tempo decorrido, dados do candidato e botões de ação (Rechamar, Finalizar, Cancelar).
- **Histórico Local:** registro visual das últimas senhas atendidas pelo atendente no posto.

#### Posto de Triagem
- **Identificação do Candidato:** busca rápida por nome na base de classificados importada do Vestibulinho ou cadastro manual caso necessário.
- **Conferência Documental:** validação dos itens obrigatórios:
  - Documento de identificação (RG / CIN);
  - Cadastro de Pessoa Física (CPF / CIN);
  - Foto 3x4;
  - Comprovante de escolaridade pública (quando aplicável à cota);
  - Histórico escolar do Ensino Fundamental.
- **Gestão de Pendências:** caso falte qualquer documento, o atendente assinala os itens pendentes e salva a pendência. A senha é enviada para a aba de pendências e o guichê é liberado para chamar o próximo candidato.
- **Retomada de Atendimento:** quando o candidato retorna com os documentos faltantes, o atendente retoma a senha diretamente pela aba de pendências.
- **Encaminhamento:** após validação completa, o atendente avança o candidato diretamente para a fila da **APM**.

#### Posto da APM
- **Visualização Cadastral:** exibe nome do aluno, curso selecionado e indicação visual se o aluno utilizou cota de escola pública.
- **Venda de Uniformes:** seleção de camisetas por tamanho, exibindo preço unitário e estoque em tempo real.
- **Locação de Armários:** opção para incluir a locação de armário escolar individual caso haja vagas configuradas.
- **Contribuição Voluntária:** campo para digitação de valor livre para apoio aos projetos da escola.
- **Pagamentos Diversificados:** suporte à divisão do pagamento entre dinheiro, Pix, débito e crédito, com cálculo automático da diferença restante e bloqueio de confirmação com valor divergente.
- **Retiradas:** controle de entrega imediata no guichê ou geração de cupom de retirada posterior para itens sem pronta-entrega.
- **Atendimento sem Compra:** caso o candidato opte por não adquirir produtos ou armário, o atendimento é concluído normalmente e a senha é avançada para a etapa de **Documentos**.

#### Posto de Documentos (Docs)
- **Revisão Final:** apresentação completa dos dados do candidato, curso e pendências já sanadas na triagem.
- **Conferência da Secretaria:** checagem final física e arquivamento dos documentos para inserção no sistema acadêmico oficial da escola.
- **Encerramento da Matrícula:** conclusão definitiva do atendimento, finalizando o ciclo de vida da senha no sistema presencial.

---

### 4.2. Módulo Administrativo (`/admin`)

#### Dashboard Geral
- Visão gerencial com indicadores em tempo real da operação diária.
- Métricas de desempenho: total de atendimentos concluídos, cancelados e pendentes.
- Cálculo de **Tempo Médio de Espera (TME)** e **Tempo Médio de Atendimento (TMA)** geral e discriminado por posto.
- Alertas visuais de gargalos operacionais e acúmulo de senhas em espera.

#### Gestão de Cursos e Períodos
- Cadastro e edição do catálogo de cursos técnicos e integrados da escola.
- Configuração de períodos de oferta (Manhã, Tarde, Noite, Integral) e quantidade total de vagas autorizadas.
- Abertura e encerramento manual de matrículas por período.
- Arquivamento lógico de cursos desativados, preservando o histórico de anos anteriores.

#### Gestão de Alunos e Matrículas
- **Importação do Vestibulinho:** carregamento de arquivo CSV oficial da instituição contendo a lista de candidatos classificados, notas e cotas.
- Mapeamento e associação dos códigos de curso do CSV aos cursos cadastrados no sistema.
- Listagem paginada de candidatos com busca textual por nome e filtros por curso e situação cadastral (*Candidato*, *Ativo*, *Arquivado*).
- Cadastro manual avulso de alunos e edição de dados pessoais e de matrícula.

#### Gestão de Produtos e Estoque (APM)
- **Catálogo de Uniformes:** cadastro de tamanhos de camisetas, definição de preços de venda e controle de quantidade física em estoque.
- Registro de entradas e correções manuais de estoque.
- Arquivamento de tamanhos fora de linha.
- **Configuração de Armários:** definição da quantidade total de armários disponíveis para locação no período letivo, preço unitário do semestre e chave de disponibilidade geral de venda.

#### Gestão de Usuários (Voluntários)
- Cadastro e gerenciamento de contas de acesso ao sistema com três níveis: Administrador, Supervisor e Atendente.
- Atribuição de permissões operacionais.
- Redefinição administrativa de senhas de acesso.
- Desativação temporária e reativação de contas de voluntários.

#### Monitoramento de Filas
- Visão panorâmica de todas as filas simultâneas em operação.
- Identificação de guichês ativos e voluntários logados.
- Recurso administrativo para reinício da sequência diária de senhas ou cancelamento de senhas extraviadas.

#### Relatórios e Prestação de Contas
- **Relatório Financeiro da APM:** demonstrativo de arrecadação detalhado por forma de pagamento (Pix, Dinheiro, Cartão), produtos vendidos, armários locados e contribuições espontâneas.
- **Relatório de Matrículas:** totalização de alunos atendidos agrupados por curso e período.
- **Relatório de Desempenho Operacional:** tempos de atendimento por posto e produtividade de cada atendente.
- **Exportação de Dados:** geração de planilhas nos formatos CSV e Excel para prestação de contas aos órgãos fiscalizadores e conselho de escola.

---

## 5. Regras de Negócio e Diretrizes Gerais

1. **Identificação dos Alunos:** Por diretriz de privacidade e simplificação operacional, o sistema não adota o CPF como chave primária de identificação do aluno nem realiza consultas públicas por CPF. O aluno é identificado por um identificador interno (`idAluno`) e localizado na interface por pesquisa textual de seu nome.
2. **Modelo Simplificado de Armários:** Não há cadastro individual de cada porta ou bloco de armários. O armário é tratado como um produto especial único no sistema com quantidade disponível, preço e status de disponibilidade geral.
3. **Preservação de Histórico (Sem Exclusão Física):** Cursos, alunos, voluntários e senhas nunca são excluídos permanentemente da base de dados caso possuam vínculos ou movimentações registradas. O sistema adota status de arquivamento, cancelamento ou inativação para manter a integridade auditorial.
4. **Independência de Matrícula Acadêmica:** O SIGA Phila gerencia o fluxo operacional e presencial do dia da matrícula. O cadastro acadêmico oficial definitivo (atribuição de prontuário, notas e frequências) continua sob responsabilidade do sistema acadêmico corporativo da instituição.