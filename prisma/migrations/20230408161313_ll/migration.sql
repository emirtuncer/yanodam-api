-- DropIndex
DROP INDEX "users_authConfirmToken_key";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isTwoFactorAuthenticationEnabled" BOOLEAN NOT NULL DEFAULT false;
