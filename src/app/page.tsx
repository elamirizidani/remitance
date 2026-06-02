'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useTransfer } from '@/context/TransferContext';

const recipients = [
  { name: 'Jean Damascene', phone: '+250 788 123 456', method: 'MTN MoMo' },
  { name: 'Alice Kamikazi', phone: '+250 722 987 654', method: 'Bank deposit' },
  { name: 'Robert Mugisha', phone: '+250 733 111 222', method: 'Airtel Money' },
];

const deliveryMethods = [
  { id: 'mtn', label: 'MTN MoMo', eta: 'Usually in 2 minutes', icon: 'bi-phone' },
  { id: 'airtel', label: 'Airtel Money', eta: 'Usually in 5 minutes', icon: 'bi-sim' },
  { id: 'bank', label: 'Bank deposit', eta: 'Same or next business day', icon: 'bi-bank' },
];

const gbpFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
});

const rwfFormatter = new Intl.NumberFormat('en-RW', {
  maximumFractionDigits: 0,
});

export default function Home() {
  const router = useRouter();
  const { setTransferData } = useTransfer();
  const [sendAmt, setSendAmt] = useState('250');
  const [rate, setRate] = useState(1634.5);
  const [recipientName, setRecipientName] = useState(recipients[0].name);
  const [recipientPhone, setRecipientPhone] = useState(recipients[0].phone);
  const [methodId, setMethodId] = useState('mtn');

  useEffect(() => {
    let isMounted = true;

    fetch('https://api.frankfurter.app/latest?from=GBP&to=RWF')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setRate(data.rates?.RWF || 1634.5);
        }
      })
      .catch(() => setRate(1634.5));

    return () => {
      isMounted = false;
    };
  }, []);

  const amount = Number.parseFloat(sendAmt) || 0;
  const receiveAmount = useMemo(() => Math.round(amount * rate), [amount, rate]);
  const selectedMethod = deliveryMethods.find((method) => method.id === methodId) || deliveryMethods[0];
  const fee = amount >= 500 ? 0 : 1.5;
  const canContinue = amount > 0 && recipientName.trim().length > 0 && recipientPhone.trim().length > 0;

  const handleAmountChange = (value: string) => {
    const cleanValue = value.replace(/[^0-9.]/g, '');
    setSendAmt(cleanValue);
  };

  const quickFillRecipient = (recipient: (typeof recipients)[number]) => {
    setRecipientName(recipient.name);
    setRecipientPhone(recipient.phone);
    const matchingMethod = deliveryMethods.find((method) => method.label === recipient.method);
    if (matchingMethod) {
      setMethodId(matchingMethod.id);
    }
  };

  const continueToPayment = () => {
    if (!canContinue) return;

    setTransferData({
      sendAmount: amount,
      receiveAmount,
      recipient: recipientName.trim(),
      recipientPhone: recipientPhone.trim(),
      method: selectedMethod.label,
      paymentMethod: 'card',
      rate,
      fee,
      delivery: selectedMethod.eta,
    });
    router.push('/payment');
  };

  return (
    <div>
      <section className="page-section">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="eyebrow mb-3">
                <i className="bi bi-shield-check"></i>
                Open guest transfer
              </span>
              <h1 className="display-3 mb-4">
                Send money home to Rwanda instantly.
              </h1>
              <p className="fs-5 mb-4">
                Compare your GBP/RWF rate, confirm the delivery rail, and see the exact amount your recipient receives. No sign-in is required to try the flow.
              </p>

              <div className="metric-grid mb-4">
                <div className="metric-tile">
                  <div className="text-subtle small mb-2">Delivery</div>
                  <div className="h5 mb-1">2 min</div>
                  <div className="small text-mint">Mobile money average</div>
                </div>
                <div className="metric-tile">
                  <div className="text-subtle small mb-2">First transfer</div>
                  <div className="h5 mb-1">£0 fee</div>
                  <div className="small text-gold">Shown upfront</div>
                </div>
                <div className="metric-tile">
                  <div className="text-subtle small mb-2">Security</div>
                  <div className="h5 mb-1">Guest mode</div>
                  <div className="small text-cyan">No sign-in required</div>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <Link href="/rates" className="btn btn-premium btn-premium-secondary">
                  <i className="bi bi-graph-up-arrow"></i>
                  View rates
                </Link>
                <Link href="/recipients" className="btn btn-premium btn-premium-secondary">
                  <i className="bi bi-person-plus"></i>
                  Manage recipients
                </Link>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="quote-tool p-4 p-md-5">
                <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
                  <div>
                    <span className="eyebrow mb-2">
                      <i className="bi bi-broadcast"></i>
                      Live quote
                    </span>
                    <h2 className="h4 mb-0">Send to Rwanda</h2>
                  </div>
                  <span className="status-pill status-success">Rate locked 30 min</span>
                </div>

                <div className="quote-field mb-3">
                  <label htmlFor="sendAmount" className="form-label mb-2">You send</label>
                  <div className="d-flex gap-3 align-items-center">
                    <input
                      id="sendAmount"
                      type="text"
                      inputMode="decimal"
                      className="form-control bg-transparent border-0 shadow-none text-white fs-2 fw-bold p-0"
                      value={sendAmt}
                      onChange={(event) => handleAmountChange(event.target.value)}
                      aria-label="Amount to send in GBP"
                    />
                    <span className="currency-chip">GBP</span>
                  </div>
                </div>

                <div className="quote-field mb-4">
                  <div className="form-label mb-2">Recipient gets</div>
                  <div className="d-flex gap-3 align-items-center justify-content-between">
                    <div className="fs-2 fw-bold text-cyan">{rwfFormatter.format(receiveAmount)}</div>
                    <span className="currency-chip">RWF</span>
                  </div>
                </div>

                <div className="rail-list mb-4" role="group" aria-label="Delivery method">
                  {deliveryMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      className={`rail-row text-start ${methodId === method.id ? 'border-info' : ''}`}
                      aria-pressed={methodId === method.id}
                      onClick={() => setMethodId(method.id)}
                    >
                      <span className="d-flex align-items-center gap-3">
                        <span className="icon-box">
                          <i className={`bi ${method.icon}`}></i>
                        </span>
                        <span>
                          <span className="d-block fw-bold text-white">{method.label}</span>
                          <span className="small text-subtle">{method.eta}</span>
                        </span>
                      </span>
                      <i className={`bi ${methodId === method.id ? 'bi-check-circle-fill text-mint' : 'bi-circle text-subtle'}`}></i>
                    </button>
                  ))}
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label htmlFor="recipientName" className="form-label">Recipient name</label>
                    <input
                      id="recipientName"
                      className="form-control input-premium"
                      value={recipientName}
                      onChange={(event) => setRecipientName(event.target.value)}
                      placeholder="Type any recipient name"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="recipientPhone" className="form-label">Recipient phone</label>
                    <input
                      id="recipientPhone"
                      className="form-control input-premium"
                      value={recipientPhone}
                      onChange={(event) => setRecipientPhone(event.target.value)}
                      placeholder="+250 7xx xxx xxx"
                      inputMode="tel"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="form-label mb-2">Quick-fill saved recipients</div>
                  <div className="d-flex flex-wrap gap-2">
                    {recipients.map((recipient) => (
                      <button
                        key={recipient.phone}
                        type="button"
                        className="btn btn-premium btn-premium-secondary py-2 px-3"
                        onClick={() => quickFillRecipient(recipient)}
                      >
                        <i className="bi bi-person-check"></i>
                        {recipient.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="d-grid gap-2 mb-4">
                  <div className="d-flex justify-content-between small">
                    <span className="text-subtle">Exchange rate</span>
                    <span className="text-white fw-bold">1 GBP = {rate.toFixed(2)} RWF</span>
                  </div>
                  <div className="d-flex justify-content-between small">
                    <span className="text-subtle">Transfer fee</span>
                    <span className={fee === 0 ? 'text-mint fw-bold' : 'text-white fw-bold'}>{fee === 0 ? 'Free' : gbpFormatter.format(fee)}</span>
                  </div>
                  <div className="d-flex justify-content-between small">
                    <span className="text-subtle">Total to pay</span>
                    <span className="text-white fw-bold">{gbpFormatter.format(amount + fee)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-premium btn-premium-primary w-100 py-3"
                  onClick={continueToPayment}
                  disabled={!canContinue}
                >
                  Continue to secure payment
                  <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section pt-0">
        <div className="container">
          <div className="row g-4 align-items-stretch">
            <div className="col-lg-7">
              <div className="route-visual h-100">
                <div className="route-line"></div>
                <div className="route-node start">
                  <div className="small text-subtle">Funding</div>
                  <div className="fw-bold">United Kingdom</div>
                  <div className="small text-cyan">GBP</div>
                </div>
                <div className="route-node end">
                  <div className="small text-subtle">Payout</div>
                  <div className="fw-bold">Rwanda</div>
                  <div className="small text-gold">RWF</div>
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="surface-panel p-4 h-100">
                <span className="eyebrow mb-3">
                  <i className="bi bi-list-check"></i>
                  What happens next
                </span>
                <div className="timeline">
                  {[
                    ['Quote locked', 'Your exchange rate and fee are fixed before checkout.'],
                    ['Payment verified', 'Card, bank, Apple Pay, and Google Pay funding are screened securely.'],
                    ['Recipient paid', 'Delivery updates appear in Activity with a downloadable receipt.'],
                  ].map(([title, desc]) => (
                    <div className="timeline-row" key={title}>
                      <span className="timeline-dot">
                        <i className="bi bi-check2"></i>
                      </span>
                      <div>
                        <h3 className="h6 mb-1">{title}</h3>
                        <p className="small mb-0">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section pt-0">
        <div className="container">
          <div className="page-heading">
            <div>
              <span className="eyebrow mb-2">
                <i className="bi bi-stars"></i>
                Designed for repeat senders
              </span>
              <h2 className="h1 mb-0">Critical remittance features, surfaced early.</h2>
            </div>
          </div>

          <div className="row g-4">
            {[
              { icon: 'bi-person-check', title: 'Verified recipients', desc: 'Save mobile money and bank recipients with clear delivery preferences.' },
              { icon: 'bi-bell', title: 'Rate alerts', desc: 'Set GBP/RWF thresholds so you can send when the exchange rate improves.' },
              { icon: 'bi-receipt', title: 'Audit-ready receipts', desc: 'Every transfer includes a reference, fee breakdown, status timeline, and support path.' },
            ].map((feature) => (
              <div className="col-md-4" key={feature.title}>
                <div className="surface-panel-soft p-4 h-100">
                  <span className="icon-box brand mb-4">
                    <i className={`bi ${feature.icon}`}></i>
                  </span>
                  <h3 className="h5 mb-2">{feature.title}</h3>
                  <p className="mb-0 small">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
