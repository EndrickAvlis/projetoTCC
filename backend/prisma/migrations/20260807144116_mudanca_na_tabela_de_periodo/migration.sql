/*
  Warnings:

  - You are about to drop the column `periodoCurso` on the `Curso` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Periodo" AS ENUM ('manha', 'tarde', 'noite', 'integral');

-- AlterTable
ALTER TABLE "Curso" DROP COLUMN "periodoCurso",
ADD COLUMN     "arquivado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Voluntario" ALTER COLUMN "tipoVoluntario" SET DEFAULT 'admin';

-- CreateTable
CREATE TABLE "PeriodoCurso" (
    "idPeriodo" SERIAL NOT NULL,
    "codCurso" INTEGER NOT NULL,
    "periodo" "Periodo" NOT NULL,
    "vagasTotais" INTEGER NOT NULL,
    "matriculaAtiva" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PeriodoCurso_pkey" PRIMARY KEY ("idPeriodo")
);

-- CreateIndex
CREATE UNIQUE INDEX "PeriodoCurso_codCurso_periodo_key" ON "PeriodoCurso"("codCurso", "periodo");

-- AddForeignKey
ALTER TABLE "PeriodoCurso" ADD CONSTRAINT "PeriodoCurso_codCurso_fkey" FOREIGN KEY ("codCurso") REFERENCES "Curso"("idCurso") ON DELETE RESTRICT ON UPDATE CASCADE;
