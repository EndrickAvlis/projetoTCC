-- CreateTable
CREATE TABLE "Produto" (
    "idProduto" SERIAL NOT NULL,
    "nomeProduto" VARCHAR(50) NOT NULL,
    "precoProduto" DECIMAL(5,2) NOT NULL,
    "quantidadeProduto" INTEGER NOT NULL,
    "tipoProduto" VARCHAR(20) NOT NULL,
    "statusItem" VARCHAR(20) NOT NULL,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("idProduto")
);

-- CreateTable
CREATE TABLE "Compra" (
    "idCompra" SERIAL NOT NULL,
    "codVoluntario" INTEGER NOT NULL,
    "valorCompra" DECIMAL(6,2) NOT NULL,
    "dataHoraCompra" TIMESTAMP(3) NOT NULL,
    "codigoRetirada" VARCHAR(100) NOT NULL,

    CONSTRAINT "Compra_pkey" PRIMARY KEY ("idCompra")
);

-- CreateTable
CREATE TABLE "ItemCompra" (
    "idProduto" INTEGER NOT NULL,
    "idCompra" INTEGER NOT NULL,
    "precoUnitario" DECIMAL(5,2) NOT NULL,
    "quantidadeItem" INTEGER NOT NULL,
    "quantidadeRetiradaItem" INTEGER NOT NULL,
    "statusItem" VARCHAR(20) NOT NULL,

    CONSTRAINT "ItemCompra_pkey" PRIMARY KEY ("idProduto","idCompra")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "idPagamento" SERIAL NOT NULL,
    "codCompra" INTEGER NOT NULL,
    "valorPagamento" DECIMAL(6,2) NOT NULL,
    "tipoPagamento" VARCHAR(30) NOT NULL,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("idPagamento")
);

-- CreateTable
CREATE TABLE "Contribuicao" (
    "idContribuicao" SERIAL NOT NULL,
    "codCompra" INTEGER NOT NULL,
    "valorContribuicao" DECIMAL(6,2) NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contribuicao_pkey" PRIMARY KEY ("idContribuicao")
);

-- CreateTable
CREATE TABLE "Curso" (
    "idCurso" SERIAL NOT NULL,
    "periodoCurso" VARCHAR(20) NOT NULL,
    "nomeCurso" VARCHAR(100) NOT NULL,

    CONSTRAINT "Curso_pkey" PRIMARY KEY ("idCurso")
);

-- CreateTable
CREATE TABLE "Aluno" (
    "cpfAluno" VARCHAR(15) NOT NULL,
    "anoAluno" INTEGER NOT NULL,
    "nomeAluno" VARCHAR(100) NOT NULL,

    CONSTRAINT "Aluno_pkey" PRIMARY KEY ("cpfAluno")
);

-- CreateTable
CREATE TABLE "CursoAluno" (
    "idCurso" INTEGER NOT NULL,
    "cpfAluno" VARCHAR(15) NOT NULL,

    CONSTRAINT "CursoAluno_pkey" PRIMARY KEY ("idCurso","cpfAluno")
);

-- CreateTable
CREATE TABLE "Senha" (
    "idSenha" SERIAL NOT NULL,
    "cpfAluno" VARCHAR(15) NOT NULL,
    "senhaCodigo" VARCHAR(10) NOT NULL,
    "dataHoraInicioSenha" TIMESTAMP(3) NOT NULL,
    "dataHoraFimSenha" TIMESTAMP(3),
    "etapaSenha" VARCHAR(15) NOT NULL,
    "tipoSenha" VARCHAR(10) NOT NULL,
    "statusSenha" VARCHAR(20) NOT NULL,

    CONSTRAINT "Senha_pkey" PRIMARY KEY ("idSenha")
);

-- CreateTable
CREATE TABLE "Voluntario" (
    "idVoluntario" SERIAL NOT NULL,
    "nomeVoluntario" VARCHAR(100) NOT NULL,
    "senhaVoluntario" VARCHAR(50) NOT NULL,
    "tipoVoluntario" VARCHAR(20) NOT NULL,
    "statusVoluntario" VARCHAR(20) NOT NULL,

    CONSTRAINT "Voluntario_pkey" PRIMARY KEY ("idVoluntario")
);

-- CreateTable
CREATE TABLE "HistoricoSenha" (
    "idHistorico" SERIAL NOT NULL,
    "codSenha" INTEGER NOT NULL,
    "codVoluntario" INTEGER NOT NULL,
    "dataHoraInicioHistorico" TIMESTAMP(3) NOT NULL,
    "dataHoraFimHistorico" TIMESTAMP(3),

    CONSTRAINT "HistoricoSenha_pkey" PRIMARY KEY ("idHistorico")
);

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_codVoluntario_fkey" FOREIGN KEY ("codVoluntario") REFERENCES "Voluntario"("idVoluntario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCompra" ADD CONSTRAINT "ItemCompra_idProduto_fkey" FOREIGN KEY ("idProduto") REFERENCES "Produto"("idProduto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCompra" ADD CONSTRAINT "ItemCompra_idCompra_fkey" FOREIGN KEY ("idCompra") REFERENCES "Compra"("idCompra") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_codCompra_fkey" FOREIGN KEY ("codCompra") REFERENCES "Compra"("idCompra") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribuicao" ADD CONSTRAINT "Contribuicao_codCompra_fkey" FOREIGN KEY ("codCompra") REFERENCES "Compra"("idCompra") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CursoAluno" ADD CONSTRAINT "CursoAluno_idCurso_fkey" FOREIGN KEY ("idCurso") REFERENCES "Curso"("idCurso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CursoAluno" ADD CONSTRAINT "CursoAluno_cpfAluno_fkey" FOREIGN KEY ("cpfAluno") REFERENCES "Aluno"("cpfAluno") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Senha" ADD CONSTRAINT "Senha_cpfAluno_fkey" FOREIGN KEY ("cpfAluno") REFERENCES "Aluno"("cpfAluno") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoSenha" ADD CONSTRAINT "HistoricoSenha_codSenha_fkey" FOREIGN KEY ("codSenha") REFERENCES "Senha"("idSenha") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoSenha" ADD CONSTRAINT "HistoricoSenha_codVoluntario_fkey" FOREIGN KEY ("codVoluntario") REFERENCES "Voluntario"("idVoluntario") ON DELETE RESTRICT ON UPDATE CASCADE;
