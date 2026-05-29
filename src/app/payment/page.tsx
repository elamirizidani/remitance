'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransfer } from '@/context/TransferContext';

const payments = [
  { id: 'card', label: 'Card', icon: 'bi-credit-card', sub: 'Visa, Mastercard, Amex' },
  { id: 'apple', label: 'Apple Pay', icon: 'bi-apple', sub: 'Biometric approval' },
  { id: 'bank', label: 'Bank transfer', icon: 'bi-bank', sub: 'UK Faster Payments' },
  { id: 'google', label: 'Google Pay', icon: 'bi-google', sub: 'Fast wallet checkout' },
];

const gbpFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
});

const rwfFormatter = new Intl.NumberFormat('en-RW', {
  maximumFractionDigits: 0,
});

export default function PaymentPage() {
  const { transferData, setTransferData } = useTransfer();
  const router = useRouter();
  const selectedPayment = payments.find((payment) => payment.id === transferData.paymentMethod) || payments[0];
  const total = transferData.sendAmount + transferData.fee;

  return (
    <div className="page-section">
      <div className="container">
        <div className="page-heading">
          <div>
            <span className="eyebrow mb-2">
              <i className="bi bi-lock"></i>
              Secure checkout
            </span>
            <h1 className="display-5 mb-2">Fund your transfer</h1>
            <p className="mb-0">Choose how to pay. Your exchange rate and recipient amount stay locked during checkout.</p>
          </div>
          <Link href="/" className="btn btn-premium btn-premium-secondary">
            <i className="bi bi-arrow-left"></i>
            Edit quote
          </Link>
        </div>

        <div className="stepper mb-4">
          <div className="step-item active">
            <div className="small text-subtle mb-1">Step 1</div>
            <div className="fw-bold">Quote locked</div>
          </div>
          <div className="step-item active">
            <div className="small text-subtle mb-1">Step 2</div>
            <div className="fw-bold">Payment</div>
          </div>
          <div className="step-item">
            <div className="small text-subtle mb-1">Step 3</div>
            <div className="fw-bold">Delivery</div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-7">
            <div className="surface-panel p-4 p-lg-5 mb-4">
              <h2 className="h4 mb-4">Payment method</h2>
              <div className="rail-list mb-4" role="group" aria-label="Payment method">
                {payments.map((payment) => (
                  <button
                    key={payment.id}
                    type="button"
                    className={`rail-row text-start ${transferData.paymentMethod === payment.id ? 'border-info' : ''}`}
                    aria-pressed={transferData.paymentMethod === payment.id}
                    onClick={() => setTransferData({ ...transferData, paymentMethod: payment.id })}
                  >
                    <span className="d-flex align-items-center gap-3">
                      <span className="icon-box brand">
                        <i className={`bi ${payment.icon}`}></i>
                      </span>
                      <span>
                        <span className="d-block fw-bold text-white">{payment.label}</span>
                        <span className="small text-subtle">{payment.sub}</span>
                      </span>
                    </span>
                    <i className={`bi ${transferData.paymentMethod === payment.id ? 'bi-check-circle-fill text-mint' : 'bi-circle text-subtle'}`}></i>
                  </button>
                ))}
              </div>

              {transferData.paymentMethod === 'card' ? (
                <div className="animate-fade-in">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="h5 mb-0">Card details</h3>
                    <span className="status-pill status-info">
                      <i className="bi bi-shield-lock"></i>
                      3D Secure
                    </span>
                  </div>

                  <div className="row g-3">
                    <div className="col-12">
                      <label htmlFor="cardName" className="form-label">Cardholder name</label>
                      <input id="cardName" type="text" className="form-control input-premium" placeholder="Name on card" />
                    </div>
                    <div className="col-12">
                      <label htmlFor="cardNumber" className="form-label">Card number</label>
                      <input id="cardNumber" type="text" className="form-control input-premium" placeholder="0000 0000 0000 0000" inputMode="numeric" />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="expiry" className="form-label">Expiry</label>
                      <input id="expiry" type="text" className="form-control input-premium" placeholder="MM / YY" inputMode="numeric" />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="securityCode" className="form-label">Security code</label>
                      <input id="securityCode" type="text" className="form-control input-premium" placeholder="CVC" inputMode="numeric" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="quote-field p-4 animate-fade-in">
                  <div className="d-flex align-items-start gap-3">
                    <span className="icon-box brand">
                      <i className={`bi ${selectedPayment.icon}`}></i>
                    </span>
                    <div>
                      <h3 className="h5 mb-2">Continue with {selectedPayment.label}</h3>
                      <p className="small mb-0">You will confirm this payment with your provider, then return here for delivery tracking.</p>
                    </div>
                  </div>
                </div>
              )}

              <button className="btn btn-premium btn-premium-primary w-100 py-3 mt-4" onClick={() => router.push('/success')}>
                Pay {gbpFormatter.format(total)} securely
                <i className="bi bi-lock-fill"></i>
              </button>
            </div>

            <div className="surface-panel-soft p-4">
              <div className="d-flex gap-3">
                <span className="icon-box mint">
                  <i className="bi bi-shield-check"></i>
                </span>
                <div>
                  <h2 className="h5 mb-1">Protected checkout</h2>
                  <p className="small mb-0">Payments are screened for fraud, encrypted in transit, and matched to your verified recipient before release.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="surface-panel p-4 p-lg-5 position-sticky" style={{ top: '96px' }}>
              <span className="eyebrow mb-3">
                <i className="bi bi-receipt"></i>
                Transfer summary
              </span>
              <div className="d-grid gap-3 mb-4">
                <div className="d-flex justify-content-between gap-3">
                  <span className="text-subtle">You send</span>
                  <span className="fw-bold text-white">{gbpFormatter.format(transferData.sendAmount)}</span>
                </div>
                <div className="d-flex justify-content-between gap-3">
                  <span className="text-subtle">Fee</span>
                  <span className={transferData.fee === 0 ? 'fw-bold text-mint' : 'fw-bold text-white'}>
                    {transferData.fee === 0 ? 'Free' : gbpFormatter.format(transferData.fee)}
                  </span>
                </div>
                <div className="d-flex justify-content-between gap-3">
                  <span className="text-subtle">Total to pay</span>
                  <span className="fw-bold text-white">{gbpFormatter.format(total)}</span>
                </div>
                <hr className="border-white border-opacity-10 my-1" />
                <div className="d-flex justify-content-between gap-3 align-items-start">
                  <span className="text-subtle">Recipient gets</span>
                  <span className="fw-bold text-cyan text-end">{rwfFormatter.format(transferData.receiveAmount)} RWF</span>
                </div>
              </div>

              <div className="d-grid gap-3 small mb-4">
                <div className="d-flex justify-content-between gap-3">
                  <span className="text-subtle">Recipient</span>
                  <span className="text-white fw-bold text-end">{transferData.recipient}</span>
                </div>
                <div className="d-flex justify-content-between gap-3">
                  <span className="text-subtle">Phone</span>
                  <span className="text-white fw-bold text-end">{transferData.recipientPhone}</span>
                </div>
                <div className="d-flex justify-content-between gap-3">
                  <span className="text-subtle">Payout</span>
                  <span className="text-white fw-bold text-end">{transferData.method}</span>
                </div>
                <div className="d-flex justify-content-between gap-3">
                  <span className="text-subtle">Rate</span>
                  <span className="text-white fw-bold text-end">1 GBP = {transferData.rate.toFixed(2)} RWF</span>
                </div>
              </div>

              <div className="rail-row">
                <span className="d-flex align-items-center gap-3">
                  <span className="icon-box mint">
                    <i className="bi bi-lightning-charge"></i>
                  </span>
                  <span>
                    <span className="d-block fw-bold text-white">Delivery estimate</span>
                    <span className="small text-subtle">{transferData.delivery}</span>
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
