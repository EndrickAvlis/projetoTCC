# Especificação Técnica do Back-end — Posto da APM (`TELA_APM`)

## 1. Visão Geral do Fluxo

A APM segue o mesmo padrão de ciclo de vida já consolidado na **Triagem**:
1. **Operação de Negócio (Se houver):** Se o aluno adquirir produtos (`totalCompra > 0`), o frontend chama a rota de compra (`POST /compras`) para registrar o financeiro, baixar o estoque e gerar o código de retirada.
2. **Encerramento do Atendimento (Universal):** O frontend chama a rota padrão de finalização (`POST /atendimento/finalizar`), que encerra o histórico da senha e avança o aluno para o próximo posto (`docs`).
3. **Atendimento sem Compra:** Se o aluno não comprar nada (`totalCompra === 0`), apenas a rota `POST /atendimento/finalizar` é executada.

---

## 2. Leitura de Catálogo (Existente via `Promise.all`)

A listagem dos produtos consome as rotas REST já existentes no backend:
- `GET /produtos?tipo=uniforme&arquivado=false` (Lista de uniformes ativos)
- `GET /produtos/armario` (Configuração e disponibilidade de armários)

---

## 3. Registro de Compra (`POST /compras`)

* **Rota:** `POST /compras`
* **Autenticação:** Obrigatória (`atendente`, `supervisor`, `admin`)
* **Finalidade:** Criar a compra, itens comprados, pagamentos, contribuição voluntária, decrementar estoque e gerar o código de retirada em uma transação atômica (`prisma.$transaction`).

### Contrato de Entrada (Payload enviado pelo Frontend):
```json
{
  "codAluno": 15,
  "itens": [
    {
      "produtoId": 1,
      "quantidade": 2,
      "quantidadeRetirada": 1,
      "precoUnitario": 35.00
    }
  ],
  "armario": true,
  "valorContribuicao": 20.00,
  "pagamentos": [
    { "tipo": "pix", "valor": 50.00 },
    { "tipo": "dinheiro", "valor": 40.00 }
  ],
  "valorTotal": 90.00
}
```

---

## 4. Passo a Passo da Transação no Back-end (`prisma.$transaction`)

Ao receber `POST /compras`, o `CompraService` executa em transação única atômica:

```text
[ Recebe Payload ]
       │
       ▼
1. Validações Prévias
   ├── Validar se codAluno existe
   ├── Conferir se a soma dos pagamentos enviados == compra.valorTotal
   └── Validar se há estoque suficiente para cada uniforme e para o armário
       │
       ▼
2. Geração do Código de Retirada
   └── Gerar string alfanumérica única no padrão legível (ex: "RET-7QS1GH3")
       │
       ▼
3. Inserção do Registro de Compra (Model: Compra)
   ├── codAluno: payload.codAluno
   ├── codVoluntario: voluntarioAutenticado.idVoluntario
   ├── valorCompra: payload.valorTotal
   ├── dataHoraCompra: new Date()
   └── codigoRetirada: "RET-7QS1GH3"
       │
       ▼
4. Inserção dos Itens e Baixa de Estoque (Model: ItemCompra + Produto)
   ├── Para cada item em payload.itens:
   │     ├── Inserir ItemCompra:
   │     │     quantidadeItem: item.quantidade
   │     │     quantidadeRetiradaItem: item.quantidadeRetirada
   │     │     precoUnitario: item.precoUnitario
   │     │     statusItem: (retirada == quantidade ? 'retirado' : retirada == 0 ? 'pendente' : 'parcial')
   │     └── Decrementar quantidadeProduto na tabela Produto
   └── Se payload.armario == true:
         ├── Inserir ItemCompra para o produto de armário
         └── Decrementar 1 unidade em quantidadeProduto do armário
       │
       ▼
5. Inserção dos Pagamentos (Model: Pagamento)
   └── Para cada forma em payload.pagamentos com valor > 0:
         └── Criar registro com tipoPagamento ("pix", "dinheiro", etc.) e valorPagamento
       │
       ▼
6. Inserção da Contribuição Voluntária (Model: Contribuicao)
   └── Se payload.valorContribuicao > 0:
         └── Criar registro com codCompra, valorContribuicao e dataHora
```

---

## 5. Contrato de Resposta (HTTP 201)

```json
{
  "mensagem": "Compra registrada com sucesso."
}
```

---

## 6. Matriz de Erros e Validações (`POST /compras`)

| Cenário | Status HTTP | Mensagem de Retorno |
| :--- | :---: | :--- |
| Estoque insuficiente de uniforme | `400 Bad Request` | `Estoque insuficiente para o produto ID {x}.` |
| Estoque de armário esgotado | `400 Bad Request` | `Não há armários disponíveis para locação.` |
| Total pago difere do total da compra | `400 Bad Request` | `O total pago diverge do valor da compra.` |
| Aluno inexistente | `404 Not Found` | `Aluno não encontrado.` |
