'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { TransferStatusResponse } from '@/lib/types';

const gbpFmt = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
const rwfFmt = new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 });

const TERMINAL = new Set(['COMPLETED', 'FAILED', 'MANUAL_REVIEW']);

const STATUS_LABEL: Record<string, { label: string; pillClass: string }> = {
  PENDING:          { label: 'Pending',           pillClass: 'status-info' },
  PAYMENT_CAPTURED: { label: 'Payment received',  pillClass: 'status-info' },
  PAYOUT_INITIATED: { label: 'Sending to Rwanda', pillClass: 'status-info' },
  COMPLETED:        { label: 'Delivered',          pillClass: 'status-success' },
  FAILED:           { label: 'Failed',             pillClass: 'status-danger' },
  MANUAL_REVIEW:    { label: 'Under review',       pillClass: 'status-warning' },
};

export default function SuccessClient({ transferId }: { transferId: string | null }) {
  const [transfer, setTransfer] = useState<TransferStatusResponse | null>(null);
  const [error, setError]       = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!transferId) return;

    const fetchStatus = () => {
      fetch(`/api/transfers/${transferId}`)
        .then(r => r.json())
        .then((data: TransferStatusResponse) => {
          setTransfer(data);
          if (TERMINAL.has(data.status) && intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        })
        .catch(() => setError('Could not load transfer details.'));
    };

    fetchStatus();
    intervalRef.current = setInterval(fetchStatus, 5_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [transferId]);

  const statusInfo = transfer ? (STATUS_LABEL[transfer.status] ?? { label: transfer.status, pillClass: 'status-info' }) : null;

  return (
    <section className="page-section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="surface-panel p-4 p-lg-5 text-center" style={{ borderTop: '4px solid var(--brand-accent)' }}>

              {/* Icon */}
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: '#ECFDF5', border: '2px solid #A7F3D0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px', fontSize: '1.8rem', color: '#059669',
              }}>
                <i className="bi bi-check2"></i>
              </div>

              <span className="eyebrow mb-3 d-flex justify-content-center">Payment Confirmed</span>
              <h1 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 12 }}>
                Money is on the way!
              </h1>

              {!transferId && !error && (
                <p style={{ color: 'var(--text-muted)' }}>Your payment was received. Check your email for details.</p>
              )}

              {error && (
                <div className="status-pill status-danger mb-3" style={{ justifyContent: 'center' }}>
                  <i className="bi bi-exclamation-circle"></i> {error}
                </div>
              )}

              {transfer && (
                <>
                  <p style={{ marginBottom: 32, fontSize: '1rem' }}>
                    {transfer.recipientName && (
                      <>Sent to <strong>{transfer.recipientName}</strong> · </>
                    )}
                    Recipient will receive{' '}
                    <span style={{ color: 'var(--brand-primary)', fontWeight: 800 }}>
                      {rwfFmt.format(transfer.receiveAmount)} RWF
                    </span>
                  </p>

                  <div className="summary-box text-start mb-4">
                    <div className="sum-row" style={{ marginBottom: 14 }}>
                      <span>Transfer ID</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.82rem' }}>{transfer.transferId}</span>
                    </div>
                    <div className="sum-row" style={{ marginBottom: 14 }}>
                      <span>You Paid</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        {gbpFmt.format(transfer.sendAmount + transfer.fee)}
                      </span>
                    </div>
                    <div className="sum-row" style={{ marginBottom: 14 }}>
                      <span>Exchange Rate</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        1 {transfer.sendCurrency} = {transfer.exchangeRate.toFixed(2)} RWF
                      </span>
                    </div>
                    <div className="sum-row" style={{ marginBottom: 0 }}>
                      <span>Status</span>
                      {statusInfo && (
                        <span className={`status-pill ${statusInfo.pillClass}`}>
                          {transfer.status !== 'COMPLETED' && transfer.status !== 'FAILED' && transfer.status !== 'MANUAL_REVIEW' && (
                            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'currentColor', marginRight: 4, animation: 'pulse 1.5s ease-in-out infinite' }}></span>
                          )}
                          {statusInfo.label}
                        </span>
                      )}
                    </div>

                    {transfer.payout?.failureReason && (
                      <div style={{ marginTop: 12, padding: '10px 14px', background: '#FEF2F2', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: '#DC2626' }}>
                        <strong>Note:</strong> {transfer.payout.failureReason}. Our team will contact you.
                      </div>
                    )}
                  </div>
                </>
              )}

              {!transfer && !error && transferId && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>
                  Loading transfer details…
                </div>
              )}

              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Link href="/transactions" className="btn btn-premium btn-premium-primary px-4">
                  <i className="bi bi-list-check"></i> View Activity
                </Link>
                <Link href="/" className="btn btn-premium btn-premium-secondary px-4">
                  Send Again
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
