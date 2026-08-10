import prisma from "../config/prisma.js";

export default class BaseService {
  constructor(model, primaryKey = "id") {
    this.model = model;
    //Adicionei a primaryKey pra dar certo a pesquisa por Id
    this.primaryKey = primaryKey;
  }

  // Eu coloquei o options para poder aceitar outras informações como o select ou orderBy
  async listar(where = {}, options = {}) {
    console.log(where)
    return await this.model.findMany({
      where,
      ...options,
    });
  }

  //Aqui a mesma coisa, e coloque o [this.primaryKey] para dizer a qual id quero referenciar.
  // No super do service alem do model eu passo o id
  async buscarPorId(id, options = {}) {
    return this.model.findUnique({
      where: { [this.primaryKey]: id },
      ...options,
    });
  }

  async criar(dados = {}, options = {}) {
    return await this.model.create({
      data: dados,
      ...options,
    });
  }

  /* Coloquei esse "dado" para ter certeza de que alguma informação vai retornar, 
    ele primeiro verifica se existe algum dado com o id enviado, depois atualiza ele.
   Porque se eu tento atualizar uma informação que não existe no banco ele retorna um erro do prisma
   e o tratamento de erro só funciona se ele retornar null*/
  async atualizar(id, dados, options = {}) {
    const dado = await this.buscarPorId(id);

    if (!dado) {
      return null;
    }

    return this.model.update({
      where: { [this.primaryKey]: id },
      data: dados,
      ...options,
    });
  }

  async excluir(id) {
    return await this.model.delete({
      where: { [this.primaryKey]: id },
    });
  }
}
