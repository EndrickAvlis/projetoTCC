# Tela de Configurações do Sistema

## 1. Objetivo e Escopo

A tela de Configurações centraliza atalhos rápidos e controles operacionais globais do SIGA Phila. Nela, a administração pode pausar ou liberar instantaneamente a oferta de armários no atendimento da APM e controlar o ciclo diário da numeração de senhas.

Rota da tela:
```text
/admin/configuracoes
```

---

## 2. Acesso e Regras de Permissão

- **Perfil Administrador (`admin`)**: Acesso irrestrito a todas as opções e ações da tela.
- **Demais perfis (`supervisor` e `atendente`)**: Não possuem permissão para acionar as rotas operacionais de controle de senhas ou de configuração (`403 Acesso Negado`).

---

## 3. Interface da Tela

A interface em [`ConfiguracoesPage.jsx`](file:///c:/Users/endri/Desktop/TCC/frontend/src/features/admin/pages/ConfiguracoesPage.jsx) é composta por cards de ação direta organizados em grid responsivo:

### 3.1. Card de Locação de Armários
- **Finalidade:** Permite habilitar ou suspender em tempo real a comercialização de armários escolares no posto da APM sem necessidade de alterar o catálogo ou estoque.
- **Funcionamento:**
  - Carrega o estado atual do armário (`/produtos/armario`).
  - Apresenta um switch reutilizável (`Toggle`).
  - Ao alternar, chama a API alterando o status para `disponivel` ou `indisponivel`.
  - Quando pausado, o guichê presencial da APM oculta ou bloqueia a opção de incluir armário na cesta do candidato.

### 3.2. Card de Sequência de Senhas
- **Finalidade:** Visualização e reinicialização do contador diário sequencial de senhas emitidas pela instituição.
- **Componentes:**
  - **Mostrador em Tempo Real:** Exibe o número da última senha gerada no dia atual (ex: `045`), formatado em três dígitos via utilitário `formatarSenha()`.
  - **Botão "Reiniciar sequência diária":** Ação protegida visualmente com estilo de perigo/alerta.
  - **Modal de Confirmação (`ConfirmarModal.jsx`):** Exige confirmação explícita do administrador antes de executar a limpeza.
  - **Efeito da Reinicialização:**
    - Cancela todas as senhas geradas no dia que ainda não foram concluídas/canceladas (`statusSenha = 'cancelada'`, com registro de `dataHoraFimSenha`).
    - Redefine a contagem para que a próxima emissão do totem gere a senha `001`.
    - Apresenta banner de sucesso (`Alert type="success"`) informando a quantidade de senhas afetadas.

---

## 4. Endpoints da API (Backend)

| Método | Endpoint | Permissão | Finalidade |
| :--- | :--- | :--- | :--- |
| `GET` | `/senhas/ultima` | `admin` | Consulta o maior número de senha gerado no dia atual que não esteja cancelado. |
| `POST` | `/senhas/reiniciar-sequencia` | `admin` | Cancela as senhas pendentes do dia e reseta a sequência diária para 1. |
| `GET` | `/produtos/armario` | `admin` | Retorna o status de disponibilidade e dados do armário. |
| `PATCH` | `/produtos/:produtoId/status` | `admin` | Atualiza o status do armário entre `disponivel` e `indisponivel`. |

---

## 5. Regras de Negócio e Segurança

1. **Fuso Horário Padronizado (Horário de Brasília):**
   - O cálculo do intervalo do dia (`inicioDia` e `fimDia`) é processado rigorosamente no backend sob o timezone `America/Sao_Paulo`, garantindo que o ciclo diário feche e reinicie corretamente à meia-noite local.
2. **Preservação de Senhas Concluídas:**
   - A reinicialização da sequência cancela apenas senhas que não foram finalizadas. Senhas com status `finalizada` permanecem intactas no banco de dados para garantir a integridade dos relatórios e métricas de atendimento.
