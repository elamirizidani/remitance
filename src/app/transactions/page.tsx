'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Transfer = {
  transferId: string;
  recipientName: string;
  sendAmount: number;
  sendCurrency: string;
  receiveAmount: number;
  receiveCurrency: string;
  status: string;
  payoutStatus: string | null;
  createdAt: string;
};

const gbpFmt = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
const rwfFmt = new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 });

const STATUS_META: Record<string, { label: string; cls: string }> = {
  PENDING:          { label: 'Pending',         cls: 'status-info' },
  PAYMENT_CAPTURED: { label: 'Payment received', cls: 'status-info' },
  PAYOUT_INITIATED: { label: 'Sending',         cls: 'status-info' },
  COMPLETED:        { label: 'Delivered',        cls: 'status-success' },
  FAILED:           { label: 'Failed',           cls: 'status-danger' },
  MANUAL_REVIEW:    { label: 'Under review',     cls: 'status-warning' },
};

function statusMeta(s: string) {
  return STATUS_META[s] ?? { label: s, cls: 'status-info' };
}

export default function Transactions() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [selected, setSelected]   = useState<Transfer | null>(null);

  useEffect(() => {
    fetch('/api/transfers/list')
      .then(r => {
        if (!r.ok) throw new Error(r.status === 401 ? 'auth' : 'error');
        return r.json();
      })
      .then(setTransfers)
      .catch(e => setError(e.message === 'auth' ? 'unauthenticated' : 'failed'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="page-section">
      <div className="container">
        <div className="page-heading">
          <div>
            <span className="eyebrow mb-2 d-block">Activity</span>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-1.5px' }}>Transfers</h1>
          </div>
          <Link href="/" className="btn btn-premium btn-premium-primary">
            <i className="bi bi-lightning-charge-fill"></i> New Transfer
          </Link>
        </div>

        <div className="surface-panel overflow-hidden">
          {loading && (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading transfers…
            </div>
          )}

          {error === 'unauthenticated' && (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>Log in to see your transfer history.</p>
              <Link href="/login" className="btn btn-premium btn-premium-primary">Log in</Link>
            </div>
          )}

          {error === 'failed' && (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#DC2626' }}>
              Could not load transfers. Please refresh the page.
            </div>
          )}

          {!loading && !error && transfers.length === 0 && (
            <div style={{ padding: '64px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>💸</div>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                Your transfer history will appear here.
              </p>
              <Link href="/" className="btn btn-premium btn-premium-primary">
                <i className="bi bi-lightning-charge-fill"></i> Send Money Now
              </Link>
            </div>
          )}

          {!loading && !error && transfers.length > 0 && (
            <div className="table-responsive">
              <table className="table-premium w-100">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: 24 }}>Recipient</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right', paddingRight: 24 }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map(txn => {
                    const sm = statusMeta(txn.status);
                    const date = new Date(txn.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    });
                    return (
                      <tr key={txn.transferId} onClick={() => setSelected(txn)} style={{ cursor: 'pointer' }}>
                        <td style={{ paddingLeft: 24 }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{txn.recipientName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                            {txn.transferId.slice(0, 8).toUpperCase()}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                            {gbpFmt.format(txn.sendAmount)}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                            {rwfFmt.format(txn.receiveAmount)} {txn.receiveCurrency}
                          </div>
                        </td>
                        <td><span className={`status-pill ${sm.cls}`}>{sm.label}</span></td>
                        <td style={{ textAlign: 'right', paddingRight: 24, color: 'var(--text-subtle)', fontSize: '0.85rem' }}>
                          {date}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selected && (
          <div className="modal-backdrop-custom" role="dialog" aria-modal="true" onClick={() => setSelected(null)}>
            <div className="modal-panel-custom surface-panel p-4 animate-fade-in" onClick={e => e.stopPropagation()}>
              <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                <div>
                  <span className="eyebrow mb-2 d-block">Transfer Details</span>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 4 }}>{selected.recipientName}</h2>
                  <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-muted)' }}>
                    {selected.transferId.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    background: 'var(--bg-mid)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', width: 40, height: 40,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0,
                  }}
                  aria-label="Close"
                >
                  <i className="bi bi-x-lg" style={{ color: 'var(--text-muted)' }}></i>
                </button>
              </div>
              <div className="summary-box">
                {[
                  { l: 'Sent',     v: gbpFmt.format(selected.sendAmount) },
                  { l: 'Received', v: `${rwfFmt.format(selected.receiveAmount)} ${selected.receiveCurrency}` },
                  { l: 'Date',     v: new Date(selected.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
                ].map(r => (
                  <div key={r.l} className="sum-row" style={{ marginBottom: 14 }}>
                    <span>{r.l}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{r.v}</span>
                  </div>
                ))}
                <div className="sum-row" style={{ marginBottom: 0 }}>
                  <span>Status</span>
                  <span className={`status-pill ${statusMeta(selected.status).cls}`}>
                    {statusMeta(selected.status).label}
                  </span>
                </div>
              </div>
              <Link
                href={`/success?transferId=${selected.transferId}`}
                className="btn btn-premium btn-premium-secondary w-100 mt-3"
                style={{ justifyContent: 'center' }}
                onClick={() => setSelected(null)}
              >
                View Full Details
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
