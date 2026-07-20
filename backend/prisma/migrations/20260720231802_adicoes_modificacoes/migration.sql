/*
  Warnings:

  - Added the required column `cpfAluno` to the `Compra` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Compra" ADD COLUMN     "cpfAluno" VARCHAR(15) NOT NULL;

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_cpfAluno_fkey" FOREIGN KEY ("cpfAluno") REFERENCES "Aluno"("cpfAluno") ON DELETE RESTRICT ON UPDATE CASCADE;
