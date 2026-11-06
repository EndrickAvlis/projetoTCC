import prisma from "../config/prisma.js";
import AppError from "../errors/AppError.js";
import BaseService from "./baseService.js";

export default class CompraService extends BaseService {
    constructor() {
        super(prisma.compra, "idCompra");
    }

    async registrarCompra(codVoluntario, codAluno, itens, pagamentos, contribuicao) {
        try {
            const resultado = await prisma.$transaction(async (tx) => {

                const aluno = await tx.aluno.findUnique({
                    where: {
                        idAluno: codAluno
                    }
                })

                if (!aluno) {
                    throw new AppError("Aluno não encontrado", {
                        status: 404,
                        code: "ALUNO_NAO_ENCONTRADO"
                    });
                }

                const produtos = await tx.produto.findMany({
                    where: {
                        idProduto: { in: itens.produtoId }
                    }
                });

                if (produtos.length !== itens.length) {
                    throw new AppError('Um ou mais produtos não foram encontrados no banco de dados.', {
                        status: 404,
                        code: "PRODUTO_NÃO_ENCONTRADO"
                    });
                }

                const valorTotal = contribuicao + itens.reduce((totalAcumulado, item) => {
                    const produtoDoItem = produtos.find(p => p.idProduto === item.produtoId);

                    if (!produtoDoItem) {
                        throw new AppError(`Produto com ID ${item.produtoId} não encontrado.`, {
                            status: 404,
                            code: "PRODUTO_NÃO_ENCONTRADO"
                        });
                    }


                    if (item.quantidadeRetirada > produtoDoItem.quantidadeProduto) {
                        throw new AppError(`Estoque insuficiente para o produto ID ${item.produto}`, {
                            status: 400,
                            code: "ESTOQUE_INSUFICIENTE"
                        });
                    }
                    const subtotal = produtoDoItem.precoProduto * item.quantidade;

                    return totalAcumulado + subtotal;
                }, 0);


                const valorTotalPago = pagamentos.reduce((totalPago, pagamento) => {
                    return totalPago + pagamento.valor;
                }, 0);

                if (valorTotal !== valorTotalPago) {
                    throw new AppError("O total pago diverge do valor da compra", {
                        status: 400,
                        code: "PAGAMENTO_DIVERGENTE"
                    })
                }


                const codigoDeRetirada = gerarCodigo(tx);


                const agora = new Date();

                const compra = await tx.compra.create({
                    data: {
                        codVoluntario: codVoluntario,
                        codAluno: codAluno,
                        valorCompra: valorTotal,
                        dataHoraCompra: agora,
                        codigoRetirada: codigoDeRetirada,
                    }
                })

                for(const item of itens) {
                    const produtoDoItem = produtos.find(p => p.idProduto === item.produtoId);

                    await tx.itemCompra.create({
                        data: {
                            codProduto: produtoDoItem.idProduto,
                            codCompra: compra.idCompra,
                            precoUnitario: produtoDoItem.precoProduto,
                            quantidadeItem: item.quantidade,
                            quantidadeRetiradaItem: item.quantidadeRetirada,
                            statusItem: (item.quantidadeRetirada == item.quantidade ? 'retirado' : item.quantidadeRetirada == 0 ? 'pendente' : 'parcial')
                        }
                    });

                    await tx.produto.update({
                        where: {
                            idProduto: produtoDoItem.idProduto
                        },
                        data: {
                            quantidadeProduto: {
                                decrement: item.quantidadeRetirada
                            }
                        }
                    });
                }

                for(const pagamento of pagamentos) {
                    if (pagamento.valor > 0) {
                        await tx.pagamento.create({
                            data: {
                                codCompra: compra.idCompra,
                                valorPagamento: pagamento.valor,
                                tipoPagamento: pagamento.tipo
                            }
                        });
                    }
                }

                if (contribuicao > 0) {
                    await tx.contribuicao.create({
                        data: {
                            codCompra: compra.idCompra,
                            valorContribuicao: contribuicao,
                            dataHora: agora
                        }
                    });
                }

                return {
                    sucesso: true,
                    mensagem: "Compra registrada com sucesso",
                    codigoDeRetirada: codigoDeRetirada
                }
            });

            return resultado;
        } catch (AppError) {
            throw AppError;
        }
    }
}

function gerarCodigo(tx) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let codigo = "";
    let verificacao = {};
    do {
        const randomPart = Array.from({ length: 7 }, () =>
            chars[Math.floor(Math.random() * chars.length)]
        ).join("");

        codigo = `RET-${randomPart}`;

        verificacao = tx.compra.findMany({
            where: {
                codigoRetirada: codigo
            }
        })
    } while (verificacao > 0)

    return codigo;
}