'use client';

import Link from 'next/link';
import type { TransferData } from '@/lib/transfer';

const gbpFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
});

const rwfFormatter = new Intl.NumberFormat('en-RW', {
  maximumFractionDigits: 0,
});

export default function SuccessClient({ transferData }: { transferData: TransferData }) {
  const reference = 'RMP-584216';

  return (
    <section className="page-section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-7">
            <div className="surface-panel p-4 p-lg-5 text-center">
              <span className="icon-box mint mx-auto mb-4">
                <i className="bi bi-check2"></i>
              </span>
              <span className="eyebrow justify-content-center mb-2">Transfer sent</span>
              <h1 className="display-6 mb-3">Money is on the way</h1>
              <p className="mb-4">
                {transferData.recipient} will receive <span className="text-cyan fw-bold">{rwfFormatter.format(transferData.receiveAmount)} RWF</span>.
              </p>

              <div className="surface-panel-soft p-4 text-start mb-4">
                <div className="d-flex justify-content-between gap-3 mb-3">
                  <span className="text-subtle">Reference</span>
                  <span className="fw-bold text-white">{reference}</span>
                </div>
                <div className="d-flex justify-content-between gap-3 mb-3">
                  <span className="text-subtle">Paid</span>
                  <span className="fw-bold text-white">{gbpFormatter.format(transferData.sendAmount + transferData.fee)}</span>
                </div>
                <div className="d-flex justify-content-between gap-3 mb-3">
                  <span className="text-subtle">Phone</span>
                  <span className="fw-bold text-white text-end">{transferData.recipientPhone}</span>
                </div>
                <div className="d-flex justify-content-between gap-3">
                  <span className="text-subtle">Delivery</span>
                  <span className="fw-bold text-white text-end">{transferData.delivery}</span>
                </div>
              </div>

              <div className="d-grid d-sm-flex justify-content-center gap-2">
                <Link href="/transactions" className="btn btn-premium btn-premium-primary px-4">
                  Track
                </Link>
                <Link href="/" className="btn btn-premium btn-premium-secondary px-4">
                  Send again
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
