-- AlterTable Produto: renomeia statusItem para statusProduto e converte para BOOLEAN
ALTER TABLE "Produto" RENAME COLUMN "statusItem" TO "statusProduto";
ALTER TABLE "Produto" 
  ALTER COLUMN "statusProduto" TYPE BOOLEAN USING (CASE WHEN "statusProduto"::text IN ('ativo', 'disponivel', 'true') THEN true ELSE false END);
ALTER TABLE "Produto" ALTER COLUMN "statusProduto" SET DEFAULT true;
