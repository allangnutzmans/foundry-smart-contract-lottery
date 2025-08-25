/*
  Warnings:

  - You are about to drop the column `endDate` on the `WagerHistory` table. All the data in the column will be lost.
  - You are about to drop the column `prizeAmount` on the `WagerHistory` table. All the data in the column will be lost.
  - Added the required column `raffleRoundId` to the `WagerHistory` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "public"."RaffleRound" (
    "id" TEXT NOT NULL,
    "roundId" INTEGER NOT NULL,
    "prizeAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "winner" TEXT,
    "winnerId" TEXT,

    CONSTRAINT "RaffleRound_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RaffleRound_roundId_key" ON "public"."RaffleRound"("roundId");

-- AddForeignKey
INSERT INTO "public"."RaffleRound" ("id", "roundId", "prizeAmount", "createdAt", "updatedAt") 
VALUES ('legacy-round-0', 0, 0.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AddColumn
ALTER TABLE "public"."WagerHistory" ADD COLUMN "raffleRoundId" TEXT;

-- Update
UPDATE "public"."WagerHistory" SET "raffleRoundId" = 'legacy-round-0' WHERE "raffleRoundId" IS NULL;

-- AlterColumn
ALTER TABLE "public"."WagerHistory" ALTER COLUMN "raffleRoundId" SET NOT NULL;

-- DropColumn
ALTER TABLE "public"."WagerHistory" DROP COLUMN "endDate",
DROP COLUMN "prizeAmount";

-- AddForeignKey
ALTER TABLE "public"."RaffleRound" ADD CONSTRAINT "RaffleRound_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "public"."Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."WagerHistory" ADD CONSTRAINT "WagerHistory_raffleRoundId_fkey" FOREIGN KEY ("raffleRoundId") REFERENCES "public"."RaffleRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;
