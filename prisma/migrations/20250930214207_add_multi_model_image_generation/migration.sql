-- AlterTable
ALTER TABLE "public"."messages" ADD COLUMN     "model" TEXT,
ADD COLUMN     "tokens_used" INTEGER;

-- CreateTable
CREATE TABLE "public"."generated_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "size" TEXT NOT NULL DEFAULT '1024x1024',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "messageId" TEXT NOT NULL,

    CONSTRAINT "generated_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."generated_images" ADD CONSTRAINT "generated_images_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
