// ─── API Request / Response types ────────────────────────────────────────────

export type QuoteRequest = {
  sendAmount: number;
  sendCurrency: 'GBP' | 'EUR';
};

export type QuoteResponse = {
  sendAmount: number;
  sendCurrency: string;
  receiveAmount: number;
  receiveCurrency: 'RWF';
  exchangeRate: number;
  fee: number;
  totalCharged: number;
  rateExpiresAt: string; // ISO timestamp, rate is locked for 60 seconds
};

export type CreateTransferRequest = {
  sendAmount: number;
  sendCurrency: 'GBP' | 'EUR';
  recipientName: string;
  recipientPhone: string;  // E.164 format
  deliveryMethod: 'MTN_MOMO' | 'AIRTEL_MONEY' | 'BANK_DEPOSIT';
  // Optional: link to a saved recipient
  recipientId?: string;
};

export type CreateTransferResponse = {
  transferId: string;
  checkoutUrl: string;   // Stripe hosted checkout URL
  idempotencyKey: string;
};

export type TransferStatusResponse = {
  transferId: string;
  status: string;
  sendAmount: number;
  sendCurrency: string;
  receiveAmount: number;
  receiveCurrency: string;
  exchangeRate: number;
  fee: number;
  recipientName?: string;
  payout?: {
    status: string;
    pawapayDepositId: string;
    failureReason?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiError = {
  error: string;
  code?: string;
};
