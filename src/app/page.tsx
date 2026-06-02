'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useTransfer } from '@/context/TransferContext';

const recipients = [
  { name: 'Jean Damascene', phone: '+250 788 123 456', method: 'MTN MoMo' },
  { name: 'Alice Kamikazi', phone: '+250 722 987 654', method: 'Bank deposit' },
  { name: 'Robert Mugisha', phone: '+250 733 111 222', method: 'Airtel Money' },
];

const deliveryMethods = [
  { id: 'mtn', label: 'MTN MoMo', eta: 'Usually in 2 minutes' },
  { id: 'airtel', label: 'Airtel Money', eta: 'Usually in 5 minutes' },
  { id: 'bank', label: 'Bank deposit', eta: 'Same or next business day' },
];

const gbpFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
});

const rwfFormatter = new Intl.NumberFormat('en-RW', {
  maximumFractionDigits: 0,
});

export default function Home() {
  const { setTransferData } = useTransfer();
  const [sendAmt, setSendAmt] = useState('250');
  const [rate, setRate] = useState(1634.5);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('+250 ');
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

  const quickFillRecipient = (recipient: (typeof recipients)[number]) => {
    setRecipientName(recipient.name);
    setRecipientPhone(recipient.phone);
    const matchingMethod = deliveryMethods.find((method) => method.label === recipient.method);
    if (matchingMethod) setMethodId(matchingMethod.id);
  };

  const continueToPayment = (event: FormEvent<HTMLFormElement>) => {
    if (!canContinue) {
      event.preventDefault();
      return;
    }

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
  };

  return (
    <section className="page-section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10">
            <div className="page-heading align-items-start">
              <div>
                <span className="eyebrow mb-2">No sign-in required</span>
                <h1 className="display-5 mb-2">Send money home to Rwanda instantly<br/> 🇬🇧 → 🇷🇼</h1>
                <p className="mb-0">Enter a recipient, review the rate, and continue to payment.</p>
              </div>
              <span className="status-pill status-info">1 GBP = {rate.toFixed(2)} RWF</span>
            </div>

            <form action="/payment" method="get" onSubmit={continueToPayment} className="surface-panel p-4 p-lg-5">
              <input type="hidden" name="receiveAmount" value={receiveAmount} />
              <input type="hidden" name="method" value={selectedMethod.label} />
              <input type="hidden" name="paymentMethod" value="card" />
              <input type="hidden" name="rate" value={rate} />
              <input type="hidden" name="fee" value={fee} />
              <input type="hidden" name="delivery" value={selectedMethod.eta} />

              <div className="row g-4">
                <div className="col-lg-6">
                  <label htmlFor="sendAmount" className="form-label">You send</label>
                  <div className="quote-field mb-3">
                    <div className="d-flex align-items-center gap-3">
                      <input
                        id="sendAmount"
                        name="sendAmount"
                        type="text"
                        inputMode="decimal"
                        className="form-control bg-transparent border-0 shadow-none text-white fs-2 fw-bold p-0"
                        value={sendAmt}
                        onChange={(event) => setSendAmt(event.target.value.replace(/[^0-9.]/g, ''))}
                        aria-label="Amount to send in GBP"
                      />
                      <span className="currency-chip">GBP</span>
                    </div>
                  </div>

                  <div className="quote-field">
                    <div className="d-flex align-items-center justify-content-between gap-3">
                      <div>
                        <div className="form-label mb-1">Recipient gets</div>
                        <div className="fs-2 fw-bold text-cyan">{rwfFormatter.format(receiveAmount)}</div>
                      </div>
                      <span className="currency-chip">RWF</span>
                    </div>
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="recipientName" className="form-label">Recipient name</label>
                      <input
                        id="recipientName"
                        name="recipient"
                        className="form-control input-premium"
                        value={recipientName}
                        onChange={(event) => setRecipientName(event.target.value)}
                        placeholder="Full name"
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="recipientPhone" className="form-label">Recipient phone</label>
                      <input
                        id="recipientPhone"
                        name="recipientPhone"
                        className="form-control input-premium"
                        value={recipientPhone}
                        onChange={(event) => setRecipientPhone(event.target.value)}
                        placeholder="+250 7xx xxx xxx"
                        inputMode="tel"
                      />
                    </div>
                    <div className="col-12">
                      <label htmlFor="method" className="form-label">Delivery</label>
                      <select
                        id="method"
                        className="form-select input-premium"
                        value={methodId}
                        onChange={(event) => setMethodId(event.target.value)}
                      >
                        {deliveryMethods.map((method) => (
                          <option key={method.id} value={method.id}>{method.label} · {method.eta}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-2 mt-3">
                    {recipients.map((recipient) => (
                      <button
                        key={recipient.phone}
                        type="button"
                        className="btn btn-premium btn-premium-secondary py-2 px-3"
                        onClick={() => quickFillRecipient(recipient)}
                      >
                        {recipient.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <hr className="border-white border-opacity-10 my-4" />

              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                <div className="small text-subtle">
                  Fee: <span className="text-white fw-bold">{fee === 0 ? 'Free' : gbpFormatter.format(fee)}</span>
                  <span className="mx-2">·</span>
                  Total: <span className="text-white fw-bold">{gbpFormatter.format(amount + fee)}</span>
                </div>
                <button type="submit" className="btn btn-premium btn-premium-primary px-4" disabled={!canContinue}>
                  Continue
                  <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
