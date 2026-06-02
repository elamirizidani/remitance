'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTransfer } from '@/context/TransferContext';
import type { TransferData } from '@/lib/transfer';

const payments = [
  { id: 'card', label: 'Card' },
  { id: 'apple', label: 'Apple Pay' },
  { id: 'bank', label: 'Bank' },
  { id: 'google', label: 'Google Pay' },
];

const gbpFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
});

const rwfFormatter = new Intl.NumberFormat('en-RW', {
  maximumFractionDigits: 0,
});

export default function PaymentClient({ initialTransferData }: { initialTransferData: TransferData }) {
  const { setTransferData } = useTransfer();
  const [paymentMethod, setPaymentMethod] = useState(initialTransferData.paymentMethod);
  const transferData = { ...initialTransferData, paymentMethod };
  const total = transferData.sendAmount + transferData.fee;

  const updatePaymentMethod = (id: string) => {
    setPaymentMethod(id);
    setTransferData({ ...transferData, paymentMethod: id });
  };

  const confirmPayment = () => {
    setTransferData(transferData);
  };

  return (
    <section className="page-section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10">
            <div className="page-heading align-items-start">
              <div>
                <span className="eyebrow mb-2">Guest checkout</span>
                <h1 className="display-5 mb-2">Review and pay</h1>
                <p className="mb-0">Confirm the recipient and payment method.</p>
              </div>
              <Link href="/" className="btn btn-premium btn-premium-secondary">
                Edit
              </Link>
            </div>

            <div className="row g-4">
              <div className="col-lg-7">
                <div className="surface-panel p-4 p-lg-5 h-100">
                  <label className="form-label">Payment method</label>
                  <div className="d-flex flex-wrap gap-2 mb-4">
                    {payments.map((payment) => (
                      <button
                        key={payment.id}
                        type="button"
                        className={`btn btn-premium ${paymentMethod === payment.id ? 'btn-premium-primary' : 'btn-premium-secondary'}`}
                        onClick={() => updatePaymentMethod(payment.id)}
                      >
                        {payment.label}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="row g-3">
                      <div className="col-12">
                        <label htmlFor="cardName" className="form-label">Name on card</label>
                        <input id="cardName" className="form-control input-premium" placeholder="Cardholder name" />
                      </div>
                      <div className="col-12">
                        <label htmlFor="cardNumber" className="form-label">Card number</label>
                        <input id="cardNumber" className="form-control input-premium" placeholder="0000 0000 0000 0000" inputMode="numeric" />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="expiry" className="form-label">Expiry</label>
                        <input id="expiry" className="form-control input-premium" placeholder="MM / YY" inputMode="numeric" />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="securityCode" className="form-label">CVC</label>
                        <input id="securityCode" className="form-control input-premium" placeholder="123" inputMode="numeric" />
                      </div>
                    </div>
                  )}

                  {paymentMethod !== 'card' && (
                    <div className="quote-field">
                      <p className="mb-0 small">You will confirm with {payments.find((payment) => payment.id === paymentMethod)?.label}, then return for delivery tracking.</p>
                    </div>
                  )}

                  <form action="/success" method="get" onSubmit={confirmPayment}>
                    <input type="hidden" name="sendAmount" value={transferData.sendAmount} />
                    <input type="hidden" name="receiveAmount" value={transferData.receiveAmount} />
                    <input type="hidden" name="recipient" value={transferData.recipient} />
                    <input type="hidden" name="recipientPhone" value={transferData.recipientPhone} />
                    <input type="hidden" name="method" value={transferData.method} />
                    <input type="hidden" name="paymentMethod" value={transferData.paymentMethod} />
                    <input type="hidden" name="rate" value={transferData.rate} />
                    <input type="hidden" name="fee" value={transferData.fee} />
                    <input type="hidden" name="delivery" value={transferData.delivery} />
                    <button className="btn btn-premium btn-premium-primary w-100 mt-4 py-3" type="submit">
                      Send
                    </button>
                  </form>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="surface-panel-soft p-4 h-100">
                  <div className="d-flex justify-content-between gap-3 mb-3">
                    <span className="text-subtle">Recipient</span>
                    <span className="fw-bold text-white text-end">{transferData.recipient}</span>
                  </div>
                  <div className="d-flex justify-content-between gap-3 mb-3">
                    <span className="text-subtle">Phone</span>
                    <span className="fw-bold text-white text-end">{transferData.recipientPhone}</span>
                  </div>
                  <div className="d-flex justify-content-between gap-3 mb-3">
                    <span className="text-subtle">Delivery</span>
                    <span className="fw-bold text-white text-end">{transferData.method}</span>
                  </div>
                  <hr className="border-white border-opacity-10" />
                  <div className="d-flex justify-content-between gap-3 mb-3">
                    <span className="text-subtle">You send</span>
                    <span className="fw-bold text-white">{gbpFormatter.format(transferData.sendAmount)}</span>
                  </div>
                  <div className="d-flex justify-content-between gap-3 mb-3">
                    <span className="text-subtle">Fee</span>
                    <span className="fw-bold text-white">{transferData.fee === 0 ? 'Free' : gbpFormatter.format(transferData.fee)}</span>
                  </div>
                  <div className="d-flex justify-content-between gap-3 mb-3">
                    <span className="text-subtle">Total</span>
                    <span className="fw-bold text-white">{gbpFormatter.format(total)}</span>
                  </div>
                  <div className="d-flex justify-content-between gap-3">
                    <span className="text-subtle">They receive</span>
                    <span className="fw-bold text-cyan text-end">{rwfFormatter.format(transferData.receiveAmount)} RWF</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
