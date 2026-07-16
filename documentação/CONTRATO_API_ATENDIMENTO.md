# Contrato da API — fluxo de atendimento

Este contrato define a integração futura entre frontend e backend. Ele não implementa endpoints nem adiciona chamadas HTTP no frontend.

## Regra central

Uma senha é única durante todo o atendimento. Exemplo: `N001` é emitida uma vez e percorre, nesta ordem:

```text
aguardando / triagem
  -> em_atendimento / triagem
  -> aguardando / apm
  -> em_atendimento / apm
  -> aguardando / docs
  -> em_atendimento / docs
  -> finalizada / docs
```

- A mudança de etapa acontece somente no backend, ao finalizar um atendimento.
- Cada início de atendimento cria um registro de histórico ligado à mesma senha.
- Cada histórico registra o atendente, o guichê, a etapa, data/hora de início e data/hora de fim.
- O frontend não calcula prioridade, escolhe a próxima senha, muda status, muda etapa ou cria horários/IDs de histórico.

## Valores controlados

| Campo        | Valores                                                   |
|--------------|-----------------------------------------------------------|
| `etapaAtual` | `triagem`, `apm`, `docs`                                  |
| `status`     | `aguardando`, `em_atendimento`, `finalizada`, `cancelada` |
| `tipo`       | `normal`, `prioritaria`                                   |

O termo oficial será `prioritaria`; não usar `preferencial` no contrato nem no código.

## Sessão

| Operação         | Método e rota       | Responsabilidade do backend                                                          |
|------------------|---------------------|--------------------------------------------------------------------------------------|
| Criar sessão     | `POST /auth/login`  | Validar credenciais, registrar sessão/guichê e retornar usuário, permissões e token. |
| Consultar sessão | `GET /auth/me`      | Retornar o usuário autenticado e os postos permitidos.                               |
| Encerrar sessão  | `POST /auth/logout` | Encerrar a sessão ativa e liberar o guichê, quando aplicável.                        |

O perfil vem do cadastro do voluntário. O login não recebe nem escolhe `tipoVoluntario`.

## Fila e chamada

| Operação          | Método e rota                          | Body                           | Res                                                 |
|-------------------|----------------------------------------|--------------------------------|-----------------------------------------------------|
| Listar aguardando | `GET /filas?etapa={etapa}`             | —                              | Lista de senhas aguardando na etapa.                |
| Chamar próxima    | `POST /filas/chamadas`                 | `{ "etapa": "triagem" }`       | Senha chamada, já marcada como `em_atendimento`.    |
| Rechamar          | `POST /senhas/:senhaId/rechamadas`     | —                              | Evento de chamada registrado e dados para o painel. |
| Cancelar          | `POST /senhas/:senhaId/cancelamentos`  | —                              | Senha com status `cancelada`.                       |

`POST /filas/chamadas` deve ser atômico: seleciona a senha segundo a prioridade 2-prioritárias, 1-normal, atualiza seu status e a associa ao atendente/guichê da sessão. A sessão deve ter permissão para a etapa enviada.

## Atendimento e histórico

| Operação                   | Método e rota                                    | Corpo                  | Resposta mínima                                              |
|----------------------------|--------------------------------------------------|------------------------|--------------------------------------------------------------|
| Iniciar atendimento        | `POST /atendimentos`                             | `{ "senhaId": "..." }` | Histórico aberto, senha e dados do aluno. Salva Inicio       |
| Finalizar atendimento      | `POST /atendimentos/:atendimentoId/finalizacoes` |                        |
| Histórico finalizado, horario de fim e senha já atualizada para a próxima etapa ou para `finalizada`.                                                                 |
| Carregar contexto da senha | `GET /senhas/:senhaId/detalhe`                   |                | Senha, aluno, cursos/matrículas e histórico necessário para a tela.  |

A resposta de finalização deve indicar claramente o resultado, por exemplo:

```json
{
  "atendimento": { "id": "H123", "finalizadoEm": "2026-07-15T13:10:00Z" },
  "senha": { "id": "S001", "codigo": "N001", "etapaAtual": "apm", "status": "aguardando" }
}
```

Para Docs, a mesma operação retorna `status: "finalizada"` e `finalizadoEm` na senha.

## Aluno e catálogos

| Operação | Método e rota | Finalidade |
|---|---|---|
| Buscar aluno | `GET /alunos?cpf={cpf}` | Retornar aluno e suas matrículas/cursos. |
| Salvar dados confirmados na triagem | `PUT /senhas/:senhaId/aluno` | Criar ou atualizar os dados do aluno vinculados à senha. |
| Listar cursos | `GET /cursos` | Alimentar o seletor de cursos. |

O frontend envia os dados preenchidos; o backend valida CPF, curso, período e vínculos antes de permitir a finalização da triagem.

## Limites do frontend

O frontend poderá manter somente estado de apresentação: carregando, erro, formulário em edição e a última resposta recebida. A fonte de verdade para fila, senha, atendimento, histórico, usuário, permissões, estoque, preços e pagamentos é a API.
