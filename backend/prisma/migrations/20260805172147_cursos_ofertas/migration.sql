/*
  Warnings:

  - You are about to drop the column `periodoCurso` on the `Curso` table. All the data in the column will be lost.
  - The `tipoVoluntario` column on the `Voluntario` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TipoVoluntario" AS ENUM ('admin', 'supervisor', 'atendente');

-- CreateEnum
CREATE TYPE "PeriodoCurso" AS ENUM ('manha', 'tarde', 'noite', 'integral');

-- AlterTable
ALTER TABLE "Curso" DROP COLUMN "periodoCurso",
ADD COLUMN     "arquivado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Voluntario" DROP COLUMN "tipoVoluntario",
ADD COLUMN     "tipoVoluntario" "TipoVoluntario" NOT NULL DEFAULT 'atendente';

-- CreateTable
CREATE TABLE "OfertaCurso" (
    "idOferta" SERIAL NOT NULL,
    "idCurso" INTEGER NOT NULL,
    "periodo" "PeriodoCurso" NOT NULL,
    "vagasTotais" INTEGER NOT NULL,
    "matriculaAtiva" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "OfertaCurso_pkey" PRIMARY KEY ("idOferta")
);

-- CreateIndex
CREATE UNIQUE INDEX "OfertaCurso_idCurso_periodo_key" ON "OfertaCurso"("idCurso", "periodo");

-- AddForeignKey
ALTER TABLE "OfertaCurso" ADD CONSTRAINT "OfertaCurso_idCurso_fkey" FOREIGN KEY ("idCurso") REFERENCES "Curso"("idCurso") ON DELETE RESTRICT ON UPDATE CASCADE;
