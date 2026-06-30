-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'PAYMENT_CAPTURED', 'PAYOUT_INITIATED', 'COMPLETED', 'FAILED', 'MANUAL_REVIEW');

-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('MTN_MOMO', 'AIRTEL_MONEY', 'BANK_DEPOSIT');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('INITIATED', 'ACCEPTED', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "kyc_status" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "kyc_doc_ref" TEXT,
    "country" TEXT NOT NULL DEFAULT 'GB',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipients" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "delivery_method" "DeliveryMethod" NOT NULL,
    "bank_account" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfers" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "recipient_id" UUID,
    "send_amount" DECIMAL(12,2) NOT NULL,
    "send_currency" TEXT NOT NULL DEFAULT 'GBP',
    "receive_amount" DECIMAL(16,2) NOT NULL,
    "receive_currency" TEXT NOT NULL DEFAULT 'RWF',
    "exchange_rate" DECIMAL(10,4) NOT NULL,
    "fee" DECIMAL(8,2) NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "idempotency_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stripe_payments" (
    "id" UUID NOT NULL,
    "transfer_id" UUID NOT NULL,
    "stripe_session_id" TEXT NOT NULL,
    "stripe_payment_intent" TEXT,
    "amount_charged" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'created',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stripe_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" UUID NOT NULL,
    "transfer_id" UUID NOT NULL,
    "pawapay_deposit_id" TEXT NOT NULL,
    "recipient_phone" TEXT NOT NULL,
    "amount" DECIMAL(16,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RWF',
    "status" "PayoutStatus" NOT NULL DEFAULT 'INITIATED',
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_logs" (
    "id" UUID NOT NULL,
    "transfer_id" UUID NOT NULL,
    "event" TEXT NOT NULL,
    "from_status" TEXT,
    "to_status" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "transfers_idempotency_key_key" ON "transfers"("idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_payments_transfer_id_key" ON "stripe_payments"("transfer_id");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_payments_stripe_session_id_key" ON "stripe_payments"("stripe_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "payouts_transfer_id_key" ON "payouts"("transfer_id");

-- CreateIndex
CREATE UNIQUE INDEX "payouts_pawapay_deposit_id_key" ON "payouts"("pawapay_deposit_id");

-- AddForeignKey
ALTER TABLE "recipients" ADD CONSTRAINT "recipients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "recipients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stripe_payments" ADD CONSTRAINT "stripe_payments_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "transfers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "transfers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_logs" ADD CONSTRAINT "transaction_logs_transfer_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "transfers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
