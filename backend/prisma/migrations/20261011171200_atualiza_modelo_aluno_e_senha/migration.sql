-- CreateEnum
CREATE TYPE "StatusAluno" AS ENUM ('CANDIDATO', 'ATIVO', 'ARQUIVADO');

-- CreateEnum
CREATE TYPE "StatusMatricula" AS ENUM ('PENDENTE', 'ATIVA');

-- AlterTable
ALTER TABLE "Aluno" DROP COLUMN "anoAluno",
DROP COLUMN "cpfAluno",
ADD COLUMN     "anoProcesso" INTEGER,
ADD COLUMN     "cidadeAluno" VARCHAR(100),
ADD COLUMN     "escolaridadePublica" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "semestreProcesso" INTEGER,
ADD COLUMN     "sexoAluno" VARCHAR(20),
ADD COLUMN     "statusAluno" "StatusAluno" NOT NULL DEFAULT 'CANDIDATO';

-- AlterTable
ALTER TABLE "Curso" ADD COLUMN     "codigoCsv" VARCHAR(50);

-- AlterTable
ALTER TABLE "CursoAluno" ADD COLUMN     "classificacao" INTEGER,
ADD COLUMN     "periodo" "Periodo",
ADD COLUMN     "statusMatricula" "StatusMatricula" NOT NULL DEFAULT 'PENDENTE';

-- AlterTable
ALTER TABLE "Senha" ADD COLUMN     "documentosPendentes" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "Curso_codigoCsv_key" ON "Curso"("codigoCsv");
