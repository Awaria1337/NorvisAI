/*
  Warnings:

  - A unique constraint covering the columns `[verificationToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[resetToken]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpires" TIMESTAMP(3),
ADD COLUMN     "verificationExpires" TIMESTAMP(3),
ADD COLUMN     "verificationToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_verificationToken_key" ON "public"."users"("verificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_resetToken_key" ON "public"."users"("resetToken");
