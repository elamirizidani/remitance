'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTransfer } from '@/context/TransferContext';
import type { TransferData } from '@/lib/transfer';

const payments = [
  { id: 'card',   label: 'Card',        icon: 'bi-credit-card' },
  { id: 'apple',  label: 'Apple Pay',   icon: 'bi-apple' },
  { id: 'bank',   label: 'Bank',        icon: 'bi-bank' },
  { id: 'google', label: 'Google Pay',  icon: 'bi-google' },
];

const gbpFmt = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
const rwfFmt = new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 });

export default function PaymentClient({ initialTransferData }: { initialTransferData: TransferData }) {
  const { setTransferData } = useTransfer();
  const [paymentMethod, setPaymentMethod] = useState(initialTransferData.paymentMethod);
  const transferData = { ...initialTransferData, paymentMethod };
  const total = transferData.sendAmount + transferData.fee;

  const confirm = () => setTransferData(transferData);

  return (
    <section className="page-section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10">
            <div className="page-heading align-items-start">
              <div>
                <span className="eyebrow mb-2 d-block">Guest checkout</span>
                <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 8 }}>Review and Pay</h1>
                <p className="mb-0">Confirm the recipient and choose your payment method.</p>
              </div>
              <Link href="/" className="btn btn-premium btn-premium-secondary">
                <i className="bi bi-pencil"></i> Edit
              </Link>
            </div>

            <div className="row g-4">
              {/* Payment form */}
              <div className="col-lg-7">
                <div className="surface-panel p-4 p-lg-5 h-100">
                  <span className="form-label">Payment Method</span>
                  <div className="d-flex flex-wrap gap-2 mb-4">
                    {payments.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPaymentMethod(p.id)}
                        style={{
                          padding: '10px 18px',
                          background: paymentMethod === p.id ? 'var(--brand-primary)' : 'var(--bg-mid)',
                          color: paymentMethod === p.id ? 'white' : 'var(--text-main)',
                          border: `1px solid ${paymentMethod === p.id ? 'var(--brand-primary)' : 'var(--border)'}`,
                          borderRadius: '100px', fontWeight: 700, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem',
                        }}
                      >
                        <i className={`bi ${p.icon}`}></i> {p.label}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="row g-3">
                      <div className="col-12">
                        <span className="form-label">Name on card</span>
                        <input className="input-premium" placeholder="Cardholder name" />
                      </div>
                      <div className="col-12">
                        <span className="form-label">Card number</span>
                        <input className="input-premium" placeholder="0000 0000 0000 0000" inputMode="numeric" />
                      </div>
                      <div className="col-md-6">
                        <span className="form-label">Expiry</span>
                        <input className="input-premium" placeholder="MM / YY" inputMode="numeric" />
                      </div>
                      <div className="col-md-6">
                        <span className="form-label">CVC</span>
                        <input className="input-premium" placeholder="123" inputMode="numeric" />
                      </div>
                    </div>
                  )}

                  {paymentMethod !== 'card' && (
                    <div
                      style={{
                        background: 'var(--bg-soft)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)', padding: 16,
                      }}
                    >
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        You will confirm with <strong style={{ color: 'var(--text-main)' }}>{payments.find(p => p.id === paymentMethod)?.label}</strong>, then return for delivery tracking.
                      </p>
                    </div>
                  )}

                  <form action="/success" method="get" onSubmit={confirm}>
                    <input type="hidden" name="sendAmount"     value={transferData.sendAmount} />
                    <input type="hidden" name="receiveAmount"  value={transferData.receiveAmount} />
                    <input type="hidden" name="recipient"      value={transferData.recipient} />
                    <input type="hidden" name="recipientPhone" value={transferData.recipientPhone} />
                    <input type="hidden" name="method"         value={transferData.method} />
                    <input type="hidden" name="paymentMethod"  value={transferData.paymentMethod} />
                    <input type="hidden" name="rate"           value={transferData.rate} />
                    <input type="hidden" name="fee"            value={transferData.fee} />
                    <input type="hidden" name="delivery"       value={transferData.delivery} />
                    <button
                      type="submit"
                      style={{
                        width: '100%', marginTop: 24,
                        background: 'var(--brand-accent)', border: 'none', color: 'white',
                        borderRadius: '100px', padding: '18px',
                        fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        boxShadow: '0 12px 24px rgba(255,107,26,0.28)',
                        transition: 'var(--transition)',
                      }}
                    >
                      <i className="bi bi-lightning-charge-fill"></i> Send Money
                    </button>
                  </form>
                </div>
              </div>

              {/* Order summary */}
              <div className="col-lg-5">
                <div className="surface-panel-soft p-4 h-100">
                  <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 20 }}>Transfer Summary</div>
                  <div className="summary-box">
                    {[
                      { l: 'Recipient',    v: transferData.recipient },
                      { l: 'Phone',        v: transferData.recipientPhone },
                      { l: 'Delivery',     v: transferData.method },
                    ].map(r => (
                      <div key={r.l} className="sum-row" style={{ marginBottom: 12 }}>
                        <span>{r.l}</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)', textAlign: 'right' }}>{r.v}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border)', margin: '12px 0' }} />
                    {[
                      { l: 'You send', v: gbpFmt.format(transferData.sendAmount) },
                      { l: 'Fee',      v: transferData.fee === 0 ? 'Free' : gbpFmt.format(transferData.fee) },
                      { l: 'Total',    v: gbpFmt.format(total) },
                    ].map(r => (
                      <div key={r.l} className="sum-row" style={{ marginBottom: 12 }}>
                        <span>{r.l}</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{r.v}</span>
                      </div>
                    ))}
                    <div className="sum-total">
                      <span>They Receive</span>
                      <span>{rwfFmt.format(transferData.receiveAmount)} RWF</span>
                    </div>
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
