-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "image" TEXT,
ALTER COLUMN "password" DROP NOT NULL;
