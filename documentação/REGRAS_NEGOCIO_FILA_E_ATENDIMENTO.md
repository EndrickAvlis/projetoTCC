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

## 2. Chamar a senha selecionada

O atendente escolhe uma senha aguardando diretamente no Posto Lateral. `POST /filas/chamadas` recebe o `senhaId` e a `etapa`; ele não escolhe a próxima senha. A validação de etapa, estado, reserva, associação com atendente/guichê e atualização para `em_atendimento` devem ocorrer na mesma transação, impedindo chamadas concorrentes da mesma senha.

`Senha.tipoSenha` é um booleano persistente: `true` identifica uma senha prioritária e `false`, uma senha normal. A prioridade pode ser alterada na senha atual e deve acompanhar todo o fluxo, sem reordenamento automático da fila pelo backend.

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

## 5. Histórico exibido no posto

- `GET /filas/historico?etapa={etapa}` exibe apenas as senhas chamadas naquele posto no dia atual.
- O histórico é consulta: seus itens nunca podem iniciar uma nova chamada.
- Uma senha chamada na Triagem só aparece no histórico da APM ou Docs depois de ser chamada nessas respectivas etapas.

## 6. Fonte de verdade

Fila, prioridade, status da senha, etapa atual, histórico, horários e permissões pertencem à API. O frontend pode guardar temporariamente a resposta para renderização, carregamento, erro e edição de formulário, mas nunca substitui a fonte de verdade do servidor.
