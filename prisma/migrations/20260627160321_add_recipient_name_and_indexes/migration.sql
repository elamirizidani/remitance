/*
  Warnings:

  - Added the required column `recipient_name` to the `transfers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transfers" ADD COLUMN     "recipient_name" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "recipients_user_id_idx" ON "recipients"("user_id");

-- CreateIndex
CREATE INDEX "transaction_logs_transfer_id_idx" ON "transaction_logs"("transfer_id");

-- CreateIndex
CREATE INDEX "transfers_user_id_idx" ON "transfers"("user_id");

-- CreateIndex
CREATE INDEX "transfers_status_idx" ON "transfers"("status");
