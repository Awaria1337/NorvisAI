/*
  Warnings:

  - You are about to drop the column `isActive` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `lastLoginIp` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `admins` table. All the data in the column will be lost.
  - The `role` column on the `admins` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `admin_audit_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ai_calls` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `feature_flags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `system_metrics` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."admin_audit_logs" DROP CONSTRAINT "admin_audit_logs_adminId_fkey";

-- DropIndex
DROP INDEX "public"."admins_username_key";

-- AlterTable
ALTER TABLE "public"."admins" DROP COLUMN "isActive",
DROP COLUMN "lastLoginIp",
DROP COLUMN "username",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'admin';

-- AlterTable
ALTER TABLE "public"."system_settings" ALTER COLUMN "siteDescription" DROP NOT NULL,
ALTER COLUMN "siteDescription" DROP DEFAULT,
ALTER COLUMN "logoUrl" DROP NOT NULL,
ALTER COLUMN "logoUrl" SET DEFAULT '/norvis_logo.png',
ALTER COLUMN "defaultModel" SET DEFAULT 'google/gemini-2.0-flash-exp:free',
ALTER COLUMN "enableVoiceChat" SET DEFAULT true,
ALTER COLUMN "sessionTimeout" SET DEFAULT 168,
ALTER COLUMN "smtpHost" DROP DEFAULT,
ALTER COLUMN "smtpFrom" DROP DEFAULT,
ALTER COLUMN "enableAnalytics" SET DEFAULT false,
ALTER COLUMN "enableErrorTracking" SET DEFAULT false;

-- DropTable
DROP TABLE "public"."admin_audit_logs";

-- DropTable
DROP TABLE "public"."ai_calls";

-- DropTable
DROP TABLE "public"."feature_flags";

-- DropTable
DROP TABLE "public"."notifications";

-- DropTable
DROP TABLE "public"."system_metrics";

-- DropEnum
DROP TYPE "public"."AdminRole";

-- DropEnum
DROP TYPE "public"."NotificationStatus";

-- DropEnum
DROP TYPE "public"."NotificationTarget";

-- DropEnum
DROP TYPE "public"."NotificationType";
