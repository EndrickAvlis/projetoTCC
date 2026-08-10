Para criar uma nova rota vc deve fazer assim

router.metodo(
  "/rota",
  validarRequisicao(schemaDaRota),
  controller.funcao,
);

schemaDaRota é o arquivo presente na pasta validators, ele deve ser criado para cada função do sistema, esse arquivo valida se os dados que vc recebe pela requisição estão da maneira que o controller ou o service aceita receber sem dar erro. Ele é feito utilizando a biblioteca zod para validação.

controller.funcao é executado se o validarRequisicao() retornar sem erros e com os dados validados. 


// 1. Validator: define body, params e/ou query com Zod

// 2. Route: aplica validarRequisicao(schema)

// 3. Controller: usa req.validado e responde sucesso

// 4. Service: acessa o banco e lança AppError para regras de negócio

// 5. errorHandler: devolve 404, 409 ou 500