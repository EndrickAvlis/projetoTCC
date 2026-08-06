/*
  Warnings:

  - The `tipoVoluntario` column on the `Voluntario` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TipoVoluntario" AS ENUM ('admin', 'supervisor', 'atendente');

-- AlterTable
ALTER TABLE "Voluntario" DROP COLUMN "tipoVoluntario",
ADD COLUMN     "tipoVoluntario" "TipoVoluntario" NOT NULL DEFAULT 'atendente';
