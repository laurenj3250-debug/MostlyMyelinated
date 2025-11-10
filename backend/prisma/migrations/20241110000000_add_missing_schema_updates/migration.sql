-- Add missing columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "maxReviewsPerDay" INTEGER NOT NULL DEFAULT 100;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "maxNewCardsPerDay" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "badges" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "xp" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "level" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "xpToNextLevel" INTEGER NOT NULL DEFAULT 100;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "title" TEXT NOT NULL DEFAULT 'Comatose Newbie';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "currentCombo" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "highestCombo" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "totalXpEarned" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "streak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastStudyDate" TIMESTAMP(3);

-- Add missing columns to Node table
ALTER TABLE "Node" ADD COLUMN IF NOT EXISTS "module" TEXT;
ALTER TABLE "Node" ADD COLUMN IF NOT EXISTS "summary" TEXT;
ALTER TABLE "Node" ADD COLUMN IF NOT EXISTS "parentId" TEXT;
ALTER TABLE "Node" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Node" ADD COLUMN IF NOT EXISTS "mainImageUrl" TEXT;

-- Create index on Node.module if it doesn't exist
CREATE INDEX IF NOT EXISTS "Node_userId_module_idx" ON "Node"("userId", "module");
CREATE INDEX IF NOT EXISTS "Node_userId_parentId_idx" ON "Node"("userId", "parentId");

-- Add foreign key constraint for Node.parentId if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Node_parentId_fkey'
  ) THEN
    ALTER TABLE "Node" ADD CONSTRAINT "Node_parentId_fkey"
      FOREIGN KEY ("parentId") REFERENCES "Node"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- CreateTable NodeRelationship
CREATE TABLE IF NOT EXISTS "NodeRelationship" (
    "id" TEXT NOT NULL,
    "sourceNodeId" TEXT NOT NULL,
    "targetNodeId" TEXT NOT NULL,
    "relationshipType" TEXT NOT NULL,
    "notes" TEXT,
    "strength" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NodeRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable NodeStep
CREATE TABLE IF NOT EXISTS "NodeStep" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "decisionPoint" BOOLEAN NOT NULL DEFAULT false,
    "nextSteps" JSONB,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NodeStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "NodeRelationship_sourceNodeId_idx" ON "NodeRelationship"("sourceNodeId");
CREATE INDEX IF NOT EXISTS "NodeRelationship_targetNodeId_idx" ON "NodeRelationship"("targetNodeId");
CREATE INDEX IF NOT EXISTS "NodeRelationship_relationshipType_idx" ON "NodeRelationship"("relationshipType");
CREATE INDEX IF NOT EXISTS "NodeStep_nodeId_stepNumber_idx" ON "NodeStep"("nodeId", "stepNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "NodeStep_nodeId_stepNumber_key" ON "NodeStep"("nodeId", "stepNumber");

-- AddForeignKey for NodeRelationship
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'NodeRelationship_sourceNodeId_fkey'
  ) THEN
    ALTER TABLE "NodeRelationship" ADD CONSTRAINT "NodeRelationship_sourceNodeId_fkey"
      FOREIGN KEY ("sourceNodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'NodeRelationship_targetNodeId_fkey'
  ) THEN
    ALTER TABLE "NodeRelationship" ADD CONSTRAINT "NodeRelationship_targetNodeId_fkey"
      FOREIGN KEY ("targetNodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey for NodeStep
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'NodeStep_nodeId_fkey'
  ) THEN
    ALTER TABLE "NodeStep" ADD CONSTRAINT "NodeStep_nodeId_fkey"
      FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
