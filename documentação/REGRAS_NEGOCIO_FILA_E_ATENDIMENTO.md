# Regras de negócio — fila e atendimento

Este documento preserva as regras removidas do frontend nas Tarefas 2 e 3. Elas devem ser implementadas e validadas pelo backend.

## 1. Ciclo de vida de uma senha

Uma senha é emitida uma única vez e conserva o mesmo identificador em todo o fluxo.

```text
Triagem -> APM -> Docs -> finalizada
```

Exemplo: a senha `N001`, emitida às 10:00, pode ser chamada e atendida na Triagem e, após a finalização dessa etapa, torna-se aguardando na APM. O código continua sendo `N001`; não é criada outra senha.

Uma senha tem exatamente uma etapa atual e um status:

| Status | Significado |
|---|---|
| `aguardando` | Pode ser chamada na sua etapa atual. |
| `em_atendimento` | Está reservada para um atendimento em aberto. |
| `finalizada` | Concluiu a etapa Docs; não volta à fila. |
| `cancelada` | Foi encerrada antes do fim do fluxo; não volta à fila. |

## 2. Chamar a próxima senha

Somente o endpoint `POST /filas/chamadas` pode escolher e reservar uma senha. A operação deve ser atômica para que dois guichês nunca recebam a mesma senha.

Por etapa, a ordem deve respeitar a regra de atendimento:

1. Atender até duas senhas `prioritaria` consecutivas, quando existirem.
2. Havendo senha `normal` aguardando depois dessas duas, atender uma normal.
3. Se não houver prioritária, atender a próxima normal e zerar o contador.
4. Se não houver normal, a prioritária pode continuar sendo atendida.

O contador de prioritárias consecutivas pertence à fila da etapa e deve ser mantido no banco. A seleção, a atualização de status e a associação com atendente/guichê devem ocorrer na mesma transação.

## 3. Histórico de atendimento

Cada vez que uma senha inicia atendimento, o backend cria um histórico com:

- senha;
- etapa em que ela estava naquele momento;
- atendente e guichê da sessão ativa;
- data/hora de início.

Ao finalizar, o backend preenche a data/hora de fim e fecha o histórico. IDs, relógio oficial e duração são responsabilidade do servidor.

## 4. Avanço do fluxo

Somente `POST /atendimentos/:atendimentoId/finalizacoes` pode finalizar um atendimento e decidir o próximo estado:

| Etapa finalizada | Resultado da senha |
|---|---|
| `triagem` | `aguardando` na etapa `apm` |
| `apm` | `aguardando` na etapa `docs` |
| `docs` | `finalizada` |

O frontend apenas exibe a senha retornada pela API. Ele não contém tabela de transição, nem muda `etapaAtual` ou `status` localmente.

## 5. Cancelamento e rechamada

- Apenas uma senha em estado permitido pelo backend pode ser cancelada.
- O cancelamento registra quem realizou a ação, quando e, se exigido, o motivo.
- Rechamar não escolhe outra senha nem inicia novo histórico; apenas registra/emite uma nova chamada para a senha já reservada.
- A chamada deve poder ser enviada ao painel público pelo backend.

## 6. Fonte de verdade

Fila, prioridade, status da senha, etapa atual, histórico, horários e permissões pertencem à API. O frontend pode guardar temporariamente a resposta para renderização, carregamento, erro e edição de formulário, mas nunca substitui a fonte de verdade do servidor.
