-- CreateEnum
CREATE TYPE "EtapaSenha" AS ENUM ('triagem', 'apm', 'docs');

-- CreateEnum
CREATE TYPE "StatusSenha" AS ENUM ('aguardando', 'em_atendimento', 'pendente', 'finalizada', 'cancelada');

-- CreateEnum
CREATE TYPE "StatusItem" AS ENUM ('retirado', 'pendente', 'parcial');

-- CreateEnum
CREATE TYPE "TipoPagamento" AS ENUM ('pix', 'dinheiro', 'debito', 'credito');

-- AlterTable HistoricoSenha
ALTER TABLE "HistoricoSenha" 
  ALTER COLUMN "etapaHistorico" TYPE "EtapaSenha" USING "etapaHistorico"::"EtapaSenha";

-- AlterTable ItemCompra
ALTER TABLE "ItemCompra" 
  ALTER COLUMN "statusItem" TYPE "StatusItem" USING "statusItem"::"StatusItem";

-- AlterTable Pagamento
ALTER TABLE "Pagamento" 
  ALTER COLUMN "tipoPagamento" TYPE "TipoPagamento" USING "tipoPagamento"::"TipoPagamento";

-- AlterTable Senha
ALTER TABLE "Senha" 
  ALTER COLUMN "etapaSenha" TYPE "EtapaSenha" USING "etapaSenha"::"EtapaSenha",
  ALTER COLUMN "statusSenha" TYPE "StatusSenha" USING "statusSenha"::"StatusSenha";

-- AlterTable Voluntario
ALTER TABLE "Voluntario" ALTER COLUMN "statusVoluntario" DROP DEFAULT;
ALTER TABLE "Voluntario" 
  ALTER COLUMN "statusVoluntario" TYPE BOOLEAN USING (CASE WHEN "statusVoluntario" = 'inativo' THEN false ELSE true END);
ALTER TABLE "Voluntario" ALTER COLUMN "statusVoluntario" SET DEFAULT true;
