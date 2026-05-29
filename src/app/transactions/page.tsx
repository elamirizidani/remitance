'use client';

import Link from 'next/link';
import { useState } from 'react';

type Transaction = {
  id: string;
  recipient: string;
  phone: string;
  sent: string;
  received: string;
  status: 'Delivered' | 'In review' | 'Refunded';
  date: string;
  method: string;
  fee: string;
  eta: string;
};

const transactions: Transaction[] = [
  {
    id: 'RMP-8812',
    recipient: 'Jean Damascene',
    phone: '+250 788 123 456',
    sent: '£100.00',
    received: '163,450 RWF',
    status: 'Delivered',
    date: '12 May 2026',
    method: 'MTN MoMo',
    fee: '£0.00',
    eta: 'Delivered in 1m 44s',
  },
  {
    id: 'RMP-9904',
    recipient: 'Alice Kamikazi',
    phone: '+250 722 987 654',
    sent: '£250.00',
    received: '408,625 RWF',
    status: 'In review',
    date: '14 May 2026',
    method: 'Bank deposit',
    fee: '£1.50',
    eta: 'Expected today',
  },
  {
    id: 'RMP-2231',
    recipient: 'Robert Mugisha',
    phone: '+250 733 111 222',
    sent: '£50.00',
    received: '81,725 RWF',
    status: 'Refunded',
    date: '10 May 2026',
    method: 'Airtel Money',
    fee: '£1.50',
    eta: 'Refund completed',
  },
];

function getStatusClass(status: Transaction['status']) {
  if (status === 'Delivered') return 'status-success';
  if (status === 'In review') return 'status-warning';
  return 'status-danger';
}

export default function Transactions() {
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  return (
    <div className="page-section">
      <div className="container">
        <div className="page-heading">
          <div>
            <span className="eyebrow mb-2">
              <i className="bi bi-clock-history"></i>
              Activity
            </span>
            <h1 className="display-5 mb-2">Transfer activity</h1>
            <p className="mb-0">Track delivery, download receipts, and repeat trusted transfers.</p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <button className="btn btn-premium btn-premium-secondary">
              <i className="bi bi-download"></i>
              Export
            </button>
            <Link href="/" className="btn btn-premium btn-premium-primary">
              <i className="bi bi-plus-circle"></i>
              New transfer
            </Link>
          </div>
        </div>

        <div className="metric-grid mb-4">
          <div className="metric-tile">
            <div className="text-subtle small mb-2">Sent this month</div>
            <div className="h4 mb-1">£400.00</div>
            <div className="small text-mint">3 transfers</div>
          </div>
          <div className="metric-tile">
            <div className="text-subtle small mb-2">Average delivery</div>
            <div className="h4 mb-1">4 min</div>
            <div className="small text-cyan">Mobile money rails</div>
          </div>
          <div className="metric-tile">
            <div className="text-subtle small mb-2">Fees saved</div>
            <div className="h4 mb-1">£7.40</div>
            <div className="small text-gold">Compared with high street cash pickup</div>
          </div>
        </div>

        <div className="surface-panel overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 table-premium">
              <thead>
                <tr>
                  <th className="ps-4 py-3">Recipient</th>
                  <th className="py-3">Amount</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Delivery</th>
                  <th className="py-3 text-end pe-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id}>
                    <td className="ps-4 py-4">
                      <div className="d-flex align-items-center gap-3">
                        <span className="icon-box">
                          <i className={`bi ${txn.method === 'Bank deposit' ? 'bi-bank' : 'bi-phone'}`}></i>
                        </span>
                        <div>
                          <div className="fw-bold text-white">{txn.recipient}</div>
                          <div className="small text-subtle">{txn.phone} · {txn.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="fw-bold text-white">{txn.sent}</div>
                      <div className="small text-subtle">{txn.received}</div>
                    </td>
                    <td className="py-4">
                      <span className={`status-pill ${getStatusClass(txn.status)}`}>
                        {txn.status === 'In review' && <i className="bi bi-hourglass-split"></i>}
                        {txn.status !== 'In review' && <i className={`bi ${txn.status === 'Delivered' ? 'bi-check2-circle' : 'bi-arrow-counterclockwise'}`}></i>}
                        {txn.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="fw-bold text-white small">{txn.method}</div>
                      <div className="small text-subtle">{txn.date} · {txn.eta}</div>
                    </td>
                    <td className="py-4 text-end pe-4">
                      <button className="btn btn-premium btn-premium-secondary py-2 px-3" onClick={() => setSelectedTxn(txn)}>
                        <i className="bi bi-eye"></i>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedTxn && (
          <div className="modal-backdrop-custom" role="dialog" aria-modal="true" aria-labelledby="transactionTitle" onClick={() => setSelectedTxn(null)}>
            <div className="modal-panel-custom surface-panel p-4 p-md-5 animate-fade-in" onClick={(event) => event.stopPropagation()}>
              <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                <div>
                  <span className="eyebrow mb-2">Transfer details</span>
                  <h2 id="transactionTitle" className="h3 mb-1">{selectedTxn.sent} to {selectedTxn.recipient}</h2>
                  <p className="mb-0 small">{selectedTxn.id} · {selectedTxn.date}</p>
                </div>
                <button className="btn btn-premium btn-premium-secondary btn-icon" aria-label="Close transfer details" onClick={() => setSelectedTxn(null)}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <div className="d-grid gap-3 mb-4">
                <div className="d-flex justify-content-between">
                  <span className="text-subtle">Status</span>
                  <span className={`status-pill ${getStatusClass(selectedTxn.status)}`}>{selectedTxn.status}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-subtle">Recipient receives</span>
                  <span className="fw-bold text-cyan">{selectedTxn.received}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-subtle">Fee</span>
                  <span className="fw-bold text-white">{selectedTxn.fee}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-subtle">Delivery method</span>
                  <span className="fw-bold text-white">{selectedTxn.method}</span>
                </div>
              </div>

              <div className="timeline mb-4">
                {[
                  ['Payment received', 'Funding method authorized and screened.'],
                  ['Transfer processed', 'Funds routed to the selected payout partner.'],
                  [selectedTxn.status === 'Delivered' ? 'Recipient paid' : 'Current status', selectedTxn.eta],
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

              <div className="d-grid d-sm-flex gap-2">
                <button className="btn btn-premium btn-premium-primary flex-fill">
                  <i className="bi bi-receipt"></i>
                  Download receipt
                </button>
                <Link href="/" className="btn btn-premium btn-premium-secondary flex-fill">
                  <i className="bi bi-arrow-repeat"></i>
                  Repeat transfer
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
