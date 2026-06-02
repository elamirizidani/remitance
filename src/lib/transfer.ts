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
  sendAmount: 100,
  receiveAmount: 163450,
  recipient: 'Jean Damascene',
  recipientPhone: '+250 788 123 456',
  method: 'MTN MoMo',
  paymentMethod: 'card',
  rate: 1634.5,
  fee: 0,
  delivery: 'Usually in 2 minutes',
};
