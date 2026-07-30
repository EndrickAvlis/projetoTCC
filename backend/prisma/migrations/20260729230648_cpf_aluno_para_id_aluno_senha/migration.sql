/*
  Warnings:

  - You are about to drop the column `cpfAluno` on the `Senha` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Senha" DROP CONSTRAINT "Senha_cpfAluno_fkey";

-- AlterTable
ALTER TABLE "Senha" DROP COLUMN "cpfAluno",
ADD COLUMN     "idAluno" VARCHAR(15);

-- AddForeignKey
ALTER TABLE "Senha" ADD CONSTRAINT "Senha_idAluno_fkey" FOREIGN KEY ("idAluno") REFERENCES "Aluno"("cpfAluno") ON DELETE SET NULL ON UPDATE CASCADE;
