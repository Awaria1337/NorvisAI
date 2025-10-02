-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "profileImage" TEXT,
ALTER COLUMN "messageLimit" SET DEFAULT 25;
