# Especificação: Impressão Térmica e Código de Retirada (APM)

Documento de referência para a futura implementação da impressão de comprovantes e controle de retirada de produtos da APM.

---

## 1. Objetivo
Ao finalizar uma compra no posto da APM, o backend deve gerar automaticamente um **Código de Retirada** legível e enviar os dados para a impressora térmica local gerar o cupom/comprovante do aluno.

---

## 2. Padrão do Código de Retirada
- **Geração:** Exclusivamente no **Back-end** dentro da transação de finalização da compra (`prisma.$transaction`).
- **Formato:** Alfanumérico amigável em caixa alta, fácil de leitura em papel e rápido para digitação na conferência.
  - **Exemplo:** `RET-7QS1GH3`
  - **Tamanho:** Prefixo `RET-` seguido de caracteres alfanuméricos únicos (compatível com a coluna `codigoRetirada VARCHAR(100)` do model `Compra`).

---

## 3. Conteúdo do Cupom para Impressão
O comprovante impresso deve conter as seguintes informações:

1. **Cabeçalho:**
   - Identificação da Instituição (ETEC / APM).
   - Data e hora da compra.
   - Atendente / Voluntário responsável.

2. **Código de Retirada (Destaque Principal):**
   - Código formatado em destaque (ex: `RET-7QS1GH3`) e, se viável, QR Code / Código de barras correspondente.

3. **Identificação do Aluno:**
   - Nome completo.
   - Curso, período e turma.

4. **Detalhamento dos Itens:**
   - **Peças Retiradas na Hora:** quantidade e tamanho já entregues.
   - **Peças Pendentes:** quantidade e tamanho a retirar posteriormente.
   - **Armário / Contribuição Voluntária:** se houver.

5. **Financeiro:**
   - Total da compra.
   - Formas de pagamento utilizadas (Pix, Dinheiro, Débito, Crédito) e respectivos valores.

6. **Rodapé:**
   - Mensagem de orientação para apresentação do comprovante quando os uniformes pendentes estiverem disponíveis para retirada.

---

## 4. Arquitetura de Comunicação com a Impressora
- **Cenário Back-end:** Serviço ou worker Node.js integrado via protocolo ESC/POS (ex.: pacote `node-thermal-printer` ou spooler de impressão do SO) conectado à impressora térmica de cupons.
- **Alternativa Front-end (Fallback):** Layout de impressão formatado via `@media print` no navegador (`window.print()`), caso a impressora não esteja diretamente conectada como serviço do backend.

---

## 5. Status do Requisito
- **Status:** Registrado para implementação posterior.
- **Ação imediata:** Nenhuma alteração no fluxo atual da aplicação; regra preservada para a etapa de integração com hardware/serviços de impressão.
