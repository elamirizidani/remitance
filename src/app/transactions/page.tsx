'use client';

import Link from 'next/link';
import { useState } from 'react';

type Transaction = {
  id: string;
  recipient: string;
  sent: string;
  received: string;
  status: 'Delivered' | 'In review' | 'Refunded';
  method: string;
  date: string;
};

const transactions: Transaction[] = [
  { id: 'RMP-8812', recipient: 'Jean Damascene', sent: '£100.00', received: '163,450 RWF', status: 'Delivered', method: 'MTN MoMo', date: '12 May 2026' },
  { id: 'RMP-9904', recipient: 'Alice Kamikazi', sent: '£250.00', received: '408,625 RWF', status: 'In review', method: 'Bank deposit', date: '14 May 2026' },
  { id: 'RMP-2231', recipient: 'Robert Mugisha', sent: '£50.00', received: '81,725 RWF', status: 'Refunded', method: 'Airtel Money', date: '10 May 2026' },
];

function getStatusClass(status: Transaction['status']) {
  if (status === 'Delivered') return 'status-success';
  if (status === 'In review') return 'status-warning';
  return 'status-danger';
}

export default function Transactions() {
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  return (
    <section className="page-section">
      <div className="container">
        <div className="page-heading">
          <div>
            <span className="eyebrow mb-2">Activity</span>
            <h1 className="display-5 mb-2">Transfers</h1>
          </div>
          <Link href="/" className="btn btn-premium btn-premium-primary">New transfer</Link>
        </div>

        <div className="surface-panel overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 table-premium">
              <thead>
                <tr>
                  <th className="ps-4 py-3">Recipient</th>
                  <th className="py-3">Amount</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-end pe-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id} className="clickable-surface" onClick={() => setSelectedTxn(txn)}>
                    <td className="ps-4 py-4">
                      <div className="fw-bold text-white">{txn.recipient}</div>
                      <div className="small text-subtle">{txn.method} · {txn.id}</div>
                    </td>
                    <td className="py-4">
                      <div className="fw-bold text-white">{txn.sent}</div>
                      <div className="small text-subtle">{txn.received}</div>
                    </td>
                    <td className="py-4">
                      <span className={`status-pill ${getStatusClass(txn.status)}`}>{txn.status}</span>
                    </td>
                    <td className="py-4 text-end pe-4 text-subtle small">{txn.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedTxn && (
          <div className="modal-backdrop-custom" role="dialog" aria-modal="true" aria-labelledby="transactionTitle" onClick={() => setSelectedTxn(null)}>
            <div className="modal-panel-custom surface-panel p-4 animate-fade-in" onClick={(event) => event.stopPropagation()}>
              <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                <div>
                  <span className="eyebrow mb-2">Transfer</span>
                  <h2 id="transactionTitle" className="h4 mb-1">{selectedTxn.recipient}</h2>
                  <p className="small mb-0">{selectedTxn.id}</p>
                </div>
                <button className="btn btn-premium btn-premium-secondary btn-icon" aria-label="Close transfer details" onClick={() => setSelectedTxn(null)}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <div className="d-grid gap-3 small">
                <div className="d-flex justify-content-between"><span className="text-subtle">Sent</span><span className="fw-bold text-white">{selectedTxn.sent}</span></div>
                <div className="d-flex justify-content-between"><span className="text-subtle">Received</span><span className="fw-bold text-cyan">{selectedTxn.received}</span></div>
                <div className="d-flex justify-content-between"><span className="text-subtle">Method</span><span className="fw-bold text-white">{selectedTxn.method}</span></div>
                <div className="d-flex justify-content-between"><span className="text-subtle">Status</span><span className={`status-pill ${getStatusClass(selectedTxn.status)}`}>{selectedTxn.status}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
