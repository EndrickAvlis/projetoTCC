export default class BaseService {
  constructor(model, primaryKey = "id") {
    this.model = model;
    this.primaryKey = primaryKey;
  }

  async listar(where = {}, options = {}) {
    return await this.model.findMany({
      where,
      ...options,
    });
  }

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
