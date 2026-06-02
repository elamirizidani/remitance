"use client";
import React, { createContext, useContext, useState } from 'react';
import { defaultTransferData, type TransferData } from '@/lib/transfer';

type TransferContextValue = {
  transferData: TransferData;
  setTransferData: React.Dispatch<React.SetStateAction<TransferData>>;
};

const TransferContext = createContext<TransferContextValue | null>(null);

export function TransferProvider({ children }: { children: React.ReactNode }) {
  const [transferData, setTransferData] = useState(defaultTransferData);

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
