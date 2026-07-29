-- Permite emitir senha para a Triagem antes de vincular um aluno.
ALTER TABLE "Senha" ALTER COLUMN "cpfAluno" DROP NOT NULL;

-- Converte os tipos legados de senha para prioridade booleana.
ALTER TABLE "Senha"
ALTER COLUMN "tipoSenha" DROP DEFAULT,
ALTER COLUMN "tipoSenha" TYPE BOOLEAN
USING (LOWER("tipoSenha") IN ('prioritaria', 'prioritário', 'true', '1')),
ALTER COLUMN "tipoSenha" SET DEFAULT false;
