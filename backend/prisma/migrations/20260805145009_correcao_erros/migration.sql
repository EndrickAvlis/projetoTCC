/*
  Warnings:

  - The primary key for the `Aluno` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cpfAluno` on the `Compra` table. All the data in the column will be lost.
  - The primary key for the `CursoAluno` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cpfAluno` on the `CursoAluno` table. All the data in the column will be lost.
  - You are about to drop the column `idCurso` on the `CursoAluno` table. All the data in the column will be lost.
  - The primary key for the `ItemCompra` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `idCompra` on the `ItemCompra` table. All the data in the column will be lost.
  - You are about to drop the column `idProduto` on the `ItemCompra` table. All the data in the column will be lost.
  - You are about to drop the column `idAluno` on the `Senha` table. All the data in the column will be lost.
  - The `tipoVoluntario` column on the `Voluntario` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `codAluno` to the `Compra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `codAluno` to the `CursoAluno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `codCurso` to the `CursoAluno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `codCompra` to the `ItemCompra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `codProduto` to the `ItemCompra` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoVoluntario" AS ENUM ('admin', 'supervisor', 'atendente');

-- DropForeignKey
ALTER TABLE "Compra" DROP CONSTRAINT "Compra_cpfAluno_fkey";

-- DropForeignKey
ALTER TABLE "CursoAluno" DROP CONSTRAINT "CursoAluno_cpfAluno_fkey";

-- DropForeignKey
ALTER TABLE "CursoAluno" DROP CONSTRAINT "CursoAluno_idCurso_fkey";

-- DropForeignKey
ALTER TABLE "ItemCompra" DROP CONSTRAINT "ItemCompra_idCompra_fkey";

-- DropForeignKey
ALTER TABLE "ItemCompra" DROP CONSTRAINT "ItemCompra_idProduto_fkey";

-- DropForeignKey
ALTER TABLE "Senha" DROP CONSTRAINT "Senha_idAluno_fkey";

-- AlterTable
ALTER TABLE "Aluno" DROP CONSTRAINT "Aluno_pkey",
ADD COLUMN     "idAluno" SERIAL NOT NULL,
ADD CONSTRAINT "Aluno_pkey" PRIMARY KEY ("idAluno");

-- AlterTable
ALTER TABLE "Compra" DROP COLUMN "cpfAluno",
ADD COLUMN     "codAluno" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "CursoAluno" DROP CONSTRAINT "CursoAluno_pkey",
DROP COLUMN "cpfAluno",
DROP COLUMN "idCurso",
ADD COLUMN     "codAluno" INTEGER NOT NULL,
ADD COLUMN     "codCurso" INTEGER NOT NULL,
ADD CONSTRAINT "CursoAluno_pkey" PRIMARY KEY ("codCurso", "codAluno");

-- AlterTable
ALTER TABLE "ItemCompra" DROP CONSTRAINT "ItemCompra_pkey",
DROP COLUMN "idCompra",
DROP COLUMN "idProduto",
ADD COLUMN     "codCompra" INTEGER NOT NULL,
ADD COLUMN     "codProduto" INTEGER NOT NULL,
ADD CONSTRAINT "ItemCompra_pkey" PRIMARY KEY ("codProduto", "codCompra");

-- AlterTable
ALTER TABLE "Senha" DROP COLUMN "idAluno",
ADD COLUMN     "codAluno" INTEGER;

-- AlterTable
ALTER TABLE "Voluntario" DROP COLUMN "tipoVoluntario",
ADD COLUMN     "tipoVoluntario" "TipoVoluntario" NOT NULL DEFAULT 'atendente';

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_codAluno_fkey" FOREIGN KEY ("codAluno") REFERENCES "Aluno"("idAluno") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCompra" ADD CONSTRAINT "ItemCompra_codProduto_fkey" FOREIGN KEY ("codProduto") REFERENCES "Produto"("idProduto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCompra" ADD CONSTRAINT "ItemCompra_codCompra_fkey" FOREIGN KEY ("codCompra") REFERENCES "Compra"("idCompra") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CursoAluno" ADD CONSTRAINT "CursoAluno_codCurso_fkey" FOREIGN KEY ("codCurso") REFERENCES "Curso"("idCurso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CursoAluno" ADD CONSTRAINT "CursoAluno_codAluno_fkey" FOREIGN KEY ("codAluno") REFERENCES "Aluno"("idAluno") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Senha" ADD CONSTRAINT "Senha_codAluno_fkey" FOREIGN KEY ("codAluno") REFERENCES "Aluno"("idAluno") ON DELETE SET NULL ON UPDATE CASCADE;
