-- AlterTable
ALTER TABLE "Node" ADD COLUMN     "importBatchId" TEXT,
ADD COLUMN     "importedAt" TIMESTAMP(3),
ADD COLUMN     "isDismissed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sourceFile" TEXT;

-- CreateIndex
CREATE INDEX "Node_userId_importBatchId_idx" ON "Node"("userId", "importBatchId");

-- CreateIndex
CREATE INDEX "Node_userId_importedAt_idx" ON "Node"("userId", "importedAt");
