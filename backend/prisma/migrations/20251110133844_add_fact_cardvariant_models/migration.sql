/*
  Warnings:

  - You are about to drop the column `keyTerms` on the `Fact` table. All the data in the column will be lost.
  - You are about to drop the column `statement` on the `Fact` table. All the data in the column will be lost.
  - Added the required column `cleanedText` to the `Fact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `confidence` to the `Fact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalText` to the `Fact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Fact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Fact` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Fact" DROP CONSTRAINT "Fact_nodeId_fkey";

-- AlterTable
ALTER TABLE "Fact" DROP COLUMN "keyTerms",
DROP COLUMN "statement",
ADD COLUMN     "cleanedText" TEXT NOT NULL,
ADD COLUMN     "confidence" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "originalText" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "nodeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "cardVariantId" TEXT,
ADD COLUMN     "comboAtReview" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "xpEarned" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "cardId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "CardVariant" (
    "id" TEXT NOT NULL,
    "factId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "due" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "elapsedDays" INTEGER NOT NULL DEFAULT 0,
    "scheduledDays" INTEGER NOT NULL DEFAULT 0,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "state" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CardVariant_factId_idx" ON "CardVariant"("factId");

-- CreateIndex
CREATE INDEX "CardVariant_due_idx" ON "CardVariant"("due");

-- CreateIndex
CREATE INDEX "Fact_userId_nodeId_idx" ON "Fact"("userId", "nodeId");

-- CreateIndex
CREATE INDEX "Fact_userId_createdAt_idx" ON "Fact"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Review_userId_cardVariantId_idx" ON "Review"("userId", "cardVariantId");

-- AddForeignKey
ALTER TABLE "Fact" ADD CONSTRAINT "Fact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fact" ADD CONSTRAINT "Fact_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardVariant" ADD CONSTRAINT "CardVariant_factId_fkey" FOREIGN KEY ("factId") REFERENCES "Fact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_cardVariantId_fkey" FOREIGN KEY ("cardVariantId") REFERENCES "CardVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
