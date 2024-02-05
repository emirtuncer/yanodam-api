/*
  Warnings:

  - A unique constraint covering the columns `[authConfirmToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "users_authConfirmToken_key" ON "users"("authConfirmToken");
