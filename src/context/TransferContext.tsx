"use client";
import React, { createContext, useContext, useState } from 'react';

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

type TransferContextValue = {
  transferData: TransferData;
  setTransferData: React.Dispatch<React.SetStateAction<TransferData>>;
};

const TransferContext = createContext<TransferContextValue | null>(null);

export function TransferProvider({ children }: { children: React.ReactNode }) {
  const [transferData, setTransferData] = useState({
    sendAmount: 100,
    receiveAmount: 163450,
    recipient: 'Jean Damascene',
    recipientPhone: '+250 788 123 456',
    method: 'MTN MoMo',
    paymentMethod: 'card',
    rate: 1634.5,
    fee: 0,
    delivery: 'Usually in 2 minutes',
  });

  return (
    <TransferContext.Provider value={{ transferData, setTransferData }}>
      {children}
    </TransferContext.Provider>
  );
}

export const useTransfer = () => {
  const context = useContext(TransferContext);
  if (!context) {
    throw new Error('useTransfer must be used within a TransferProvider');
  }
  return context;
};
