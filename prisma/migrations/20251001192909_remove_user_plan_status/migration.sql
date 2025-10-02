/*
  Warnings:

  - You are about to drop the column `plan` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "plan",
DROP COLUMN "status";

-- DropEnum
DROP TYPE "public"."UserPlan";

-- DropEnum
DROP TYPE "public"."UserStatus";
