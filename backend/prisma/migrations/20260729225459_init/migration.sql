-- DropForeignKey
ALTER TABLE "Senha" DROP CONSTRAINT "Senha_cpfAluno_fkey";

-- AddForeignKey
ALTER TABLE "Senha" ADD CONSTRAINT "Senha_cpfAluno_fkey" FOREIGN KEY ("cpfAluno") REFERENCES "Aluno"("cpfAluno") ON DELETE SET NULL ON UPDATE CASCADE;
