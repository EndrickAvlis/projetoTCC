/*
  Warnings:

  - You are about to drop the column `codigoCsv` on the `Curso` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Curso_codigoCsv_key";

-- AlterTable
ALTER TABLE "Curso" DROP COLUMN "codigoCsv";
