/*
  Warnings:

  - You are about to drop the column `closedAt` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `entryPrice` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `exitPrice` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `openedAt` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `pnl` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the column `pnlPct` on the `Trade` table. All the data in the column will be lost.
  - Added the required column `price` to the `Trade` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Trade_openedAt_idx";

-- AlterTable
ALTER TABLE "Signal" ADD COLUMN     "executed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Trade" DROP COLUMN "closedAt",
DROP COLUMN "entryPrice",
DROP COLUMN "exitPrice",
DROP COLUMN "openedAt",
DROP COLUMN "pnl",
DROP COLUMN "pnlPct",
ADD COLUMN     "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "price" DECIMAL(18,6) NOT NULL,
ADD COLUMN     "signalId" TEXT;

-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "quantity" DECIMAL(18,6) NOT NULL,
    "avgPrice" DECIMAL(18,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Position_assetId_key" ON "Position"("assetId");

-- CreateIndex
CREATE INDEX "PriceSnapshot_assetId_idx" ON "PriceSnapshot"("assetId");

-- CreateIndex
CREATE INDEX "Trade_executedAt_idx" ON "Trade"("executedAt");

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "Signal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
