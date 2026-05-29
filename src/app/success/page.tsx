'use client';

import Link from 'next/link';
import { useTransfer } from '@/context/TransferContext';

const gbpFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
});

const rwfFormatter = new Intl.NumberFormat('en-RW', {
  maximumFractionDigits: 0,
});

export default function SuccessPage() {
  const { transferData } = useTransfer();
  const reference = 'RMP-584216';

  return (
    <div className="page-section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-9 col-xl-8">
            <div className="text-center mb-5">
              <span className="icon-box mint mx-auto mb-4" style={{ width: 72, height: 72, fontSize: '2rem' }}>
                <i className="bi bi-check2-circle"></i>
              </span>
              <span className="eyebrow mb-3 justify-content-center">
                <i className="bi bi-shield-check"></i>
                Payment confirmed
              </span>
              <h1 className="display-4 mb-3">Your transfer is on its way.</h1>
              <p className="fs-5 mb-0">
                {transferData.recipient} should receive <span className="text-cyan fw-bold">{rwfFormatter.format(transferData.receiveAmount)} RWF</span> via {transferData.method}.
              </p>
            </div>

            <div className="surface-panel p-4 p-lg-5 mb-4">
              <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
                <div>
                  <span className="text-subtle small">Reference</span>
                  <h2 className="h3 mb-0">{reference}</h2>
                </div>
                <span className="status-pill status-warning align-self-start">
                  <i className="bi bi-lightning-charge"></i>
                  Processing now
                </span>
              </div>

              <div className="row g-4 mb-4">
                <div className="col-md-4">
                  <div className="metric-tile">
                    <div className="text-subtle small mb-2">Paid</div>
                    <div className="h5 mb-1">{gbpFormatter.format(transferData.sendAmount + transferData.fee)}</div>
                    <div className="small text-mint">Secure checkout</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="metric-tile">
                    <div className="text-subtle small mb-2">Delivery</div>
                    <div className="h5 mb-1">{transferData.delivery}</div>
                    <div className="small text-cyan">{transferData.method}</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="metric-tile">
                    <div className="text-subtle small mb-2">Rate</div>
                    <div className="h5 mb-1">{transferData.rate.toFixed(2)}</div>
                    <div className="small text-gold">RWF per GBP</div>
                  </div>
                </div>
              </div>

              <div className="timeline">
                {[
                  ['Payment received', 'Your funding method was authorized successfully.'],
                  ['Transfer screening', 'Compliance and fraud checks are running in the background.'],
                  ['Recipient payout', `${transferData.recipientPhone} will be credited through ${transferData.method}.`],
                ].map(([title, desc], index) => (
                  <div className="timeline-row" key={title}>
                    <span className={`timeline-dot ${index === 2 ? 'status-warning' : ''}`}>
                      <i className={`bi ${index === 2 ? 'bi-hourglass-split' : 'bi-check2'}`}></i>
                    </span>
                    <div>
                      <h3 className="h6 mb-1">{title}</h3>
                      <p className="small mb-0">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="d-grid d-sm-flex justify-content-center gap-2 mb-4">
              <Link href="/transactions" className="btn btn-premium btn-premium-primary px-4">
                <i className="bi bi-clock-history"></i>
                Track transfer
              </Link>
              <button className="btn btn-premium btn-premium-secondary px-4">
                <i className="bi bi-receipt"></i>
                Download receipt
              </button>
              <Link href="/" className="btn btn-premium btn-premium-secondary px-4">
                <i className="bi bi-send"></i>
                Send again
              </Link>
            </div>

            <p className="text-center small mb-0">
              Need help? Share reference <span className="text-white fw-bold">{reference}</span> with support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
