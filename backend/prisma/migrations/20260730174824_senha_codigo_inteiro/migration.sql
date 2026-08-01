/*
  Warnings:

  - Changed the type of `senhaCodigo` on the `Senha` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Senha" DROP COLUMN "senhaCodigo",
ADD COLUMN     "senhaCodigo" INTEGER NOT NULL;
