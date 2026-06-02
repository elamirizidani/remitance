import SuccessClient from './SuccessClient';
import { defaultTransferData, type TransferData } from '@/lib/transfer';

type SearchParams = Record<string, string | string[] | undefined>;

function getString(params: SearchParams, key: string, fallback: string) {
  const value = params[key];
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

function getNumber(params: SearchParams, key: string, fallback: number) {
  const value = getString(params, key, String(fallback));
  const numberValue = Number.parseFloat(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const transferData: TransferData = {
    sendAmount: getNumber(params, 'sendAmount', defaultTransferData.sendAmount),
    receiveAmount: getNumber(params, 'receiveAmount', defaultTransferData.receiveAmount),
    recipient: getString(params, 'recipient', defaultTransferData.recipient),
    recipientPhone: getString(params, 'recipientPhone', defaultTransferData.recipientPhone),
    method: getString(params, 'method', defaultTransferData.method),
    paymentMethod: getString(params, 'paymentMethod', defaultTransferData.paymentMethod),
    rate: getNumber(params, 'rate', defaultTransferData.rate),
    fee: getNumber(params, 'fee', defaultTransferData.fee),
    delivery: getString(params, 'delivery', defaultTransferData.delivery),
  };

  return <SuccessClient transferData={transferData} />;
}
