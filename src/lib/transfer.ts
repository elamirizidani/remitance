// This file is kept for type exports only.
// The /payment page redirects to / — transfer state lives in /api/transfers.

export type TransferData = {
  sendAmount: number;
  receiveAmount: number;
  recipient: string;
  recipientPhone: string;
  method: string;
  paymentMethod: string;
  rate: number;
  fee: number;
  delivery: string;
};

export const defaultTransferData: TransferData = {
  sendAmount: 0,
  receiveAmount: 0,
  recipient: '',
  recipientPhone: '',
  method: '',
  paymentMethod: '',
  rate: 0,
  fee: 0,
  delivery: '',
};
