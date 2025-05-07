-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "address" TEXT DEFAULT '',
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "cpf" TEXT DEFAULT '',
ADD COLUMN     "observations" TEXT DEFAULT '';
