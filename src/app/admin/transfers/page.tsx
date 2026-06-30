'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const gbpFmt = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
const rwfFmt = new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 });

const STATUSES = ['PENDING','PAYMENT_CAPTURED','PAYOUT_INITIATED','COMPLETED','FAILED','MANUAL_REVIEW'];
const STATUS_META: Record<string, { label: string; cls: string }> = {
  PENDING:          { label: 'Pending',         cls: 'status-info' },
  PAYMENT_CAPTURED: { label: 'Payment received', cls: 'status-info' },
  PAYOUT_INITIATED: { label: 'Sending',         cls: 'status-info' },
  COMPLETED:        { label: 'Completed',        cls: 'status-success' },
  FAILED:           { label: 'Failed',           cls: 'status-danger' },
  MANUAL_REVIEW:    { label: 'Manual review',    cls: 'status-warning' },
};

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  MANUAL_REVIEW:    ['COMPLETED', 'FAILED'],
  PAYOUT_INITIATED: ['COMPLETED', 'MANUAL_REVIEW', 'FAILED'],
  PAYMENT_CAPTURED: ['PAYOUT_INITIATED', 'MANUAL_REVIEW', 'FAILED'],
};

type Transfer = {
  id: string; userEmail: string; recipientName: string;
  sendAmount: number; sendCurrency: string; receiveAmount: number; receiveCurrency: string;
  fee: number; exchangeRate: number; status: string; idempotencyKey: string;
  payout: { status: string; failureReason: string | null; pawapayDepositId: string } | null;
  stripe: { stripeSessionId: string; stripePaymentIntent: string | null } | null;
  createdAt: string; updatedAt: string;
};

type DetailedTransfer = Transfer & {
  user: { id: string; email: string; fullName: string; kycStatus: string };
  logs: Array<{ id: string; event: string; fromStatus: string | null; toStatus: string | null; metadata: unknown; createdAt: string }>;
};

function TransferDrawer({ id, onClose, onStatusChange }: { id: string; onClose: () => void; onStatusChange: () => void }) {
  const [transfer, setTransfer] = useState<DetailedTransfer | null>(null);
  const [loading, setLoading]   = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote]         = useState('');
  const [saving, setSaving]     = useState(false);
  const [err, setErr]           = useState('');

  useEffect(() => {
    fetch(`/api/admin/transfers/${id}`)
      .then(r => r.json())
      .then(d => { setTransfer(d); setLoading(false); });
  }, [id]);

  const allowed = transfer ? (ALLOWED_TRANSITIONS[transfer.status] ?? []) : [];

  const applyStatus = async () => {
    if (!newStatus) return;
    setSaving(true); setErr('');
    const res = await fetch(`/api/admin/transfers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, note }),
    });
    if (!res.ok) { const d = await res.json(); setErr(d.error ?? 'Failed'); setSaving(false); return; }
    onStatusChange();
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div style={{ width: 560, background: 'white', height: '100%', overflowY: 'auto', boxShadow: '-20px 0 40px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>Transfer Detail</div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 2 }}>{id.slice(0,8).toUpperCase()}</div>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="bi bi-x-lg" style={{ fontSize: '0.85rem', color: '#64748B' }}></i>
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 32, color: '#94A3B8', textAlign: 'center' }}>Loading…</div>
        ) : transfer ? (
          <div style={{ padding: 24, flex: 1 }}>
            {/* Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <span className={`status-pill ${STATUS_META[transfer.status]?.cls ?? 'status-info'}`} style={{ fontSize: '0.8rem' }}>
                {STATUS_META[transfer.status]?.label ?? transfer.status}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                {new Date(transfer.createdAt).toLocaleString('en-GB')}
              </span>
            </div>

            {/* Amounts */}
            <Section title="Transfer">
              <Row label="Sender" value={transfer.user.email} />
              <Row label="Sender name" value={transfer.user.fullName} />
              <Row label="KYC status" value={transfer.user.kycStatus} />
              <Row label="Recipient" value={transfer.recipientName} />
              <Row label="Sent" value={gbpFmt.format(transfer.sendAmount)} />
              <Row label="Fee" value={gbpFmt.format(transfer.fee)} />
              <Row label="Receives" value={`${rwfFmt.format(transfer.receiveAmount)} ${transfer.receiveCurrency}`} />
              <Row label="Rate" value={`1 ${transfer.sendCurrency} = ${transfer.exchangeRate.toFixed(2)} RWF`} />
              <Row label="Idempotency key" value={transfer.idempotencyKey} mono />
            </Section>

            {transfer.stripe && (
              <Section title="Stripe">
                <Row label="Session" value={transfer.stripe.stripeSessionId} mono />
                {transfer.stripe.stripePaymentIntent && (
                  <Row label="Payment intent" value={transfer.stripe.stripePaymentIntent} mono />
                )}
              </Section>
            )}

            {transfer.payout && (
              <Section title="Pawapay Payout">
                <Row label="Deposit ID" value={transfer.payout.pawapayDepositId} mono />
                <Row label="Status" value={transfer.payout.status} />
                {transfer.payout.failureReason && <Row label="Failure reason" value={transfer.payout.failureReason} />}
              </Section>
            )}

            {/* Manual override */}
            {allowed.length > 0 && (
              <Section title="Manual Status Override">
                {err && <div style={{ color: '#DC2626', fontSize: '0.8rem', marginBottom: 8 }}>{err}</div>}
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  {allowed.map(s => (
                    <button
                      key={s}
                      onClick={() => setNewStatus(s)}
                      style={{
                        padding: '6px 14px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                        background: newStatus === s ? '#0F172A' : '#F1F5F9',
                        color: newStatus === s ? 'white' : '#64748B',
                        border: `1px solid ${newStatus === s ? '#0F172A' : '#E2E8F0'}`,
                      }}
                    >
                      → {STATUS_META[s]?.label ?? s}
                    </button>
                  ))}
                </div>
                {newStatus && (
                  <>
                    <textarea
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="Add a note (optional)"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: '0.85rem', resize: 'vertical', minHeight: 72, outline: 'none', marginBottom: 8 }}
                    />
                    <button
                      onClick={applyStatus}
                      disabled={saving}
                      style={{ background: '#0F172A', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: saving ? 'default' : 'pointer', fontSize: '0.875rem' }}
                    >
                      {saving ? 'Saving…' : `Apply: ${STATUS_META[newStatus]?.label}`}
                    </button>
                  </>
                )}
              </Section>
            )}

            {/* Audit log */}
            {transfer.logs.length > 0 && (
              <Section title="Audit Log">
                {transfer.logs.map(log => (
                  <div key={log.id} style={{ padding: '10px 0', borderBottom: '1px solid #F1F5F9', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, color: '#0F172A' }}>{log.event}</span>
                      <span style={{ color: '#94A3B8' }}>{new Date(log.createdAt).toLocaleString('en-GB')}</span>
                    </div>
                    {(log.fromStatus || log.toStatus) && (
                      <span style={{ color: '#64748B' }}>{log.fromStatus} → {log.toStatus}</span>
                    )}
                  </div>
                ))}
              </Section>
            )}
          </div>
        ) : <div style={{ padding: 32, color: '#DC2626' }}>Transfer not found.</div>}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{title}</div>
      <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '4px 0', border: '1px solid #F1F5F9' }}>{children}</div>
    </div>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderBottom: '1px solid #F1F5F9' }}>
      <span style={{ fontSize: '0.78rem', color: '#64748B', flexShrink: 0, marginRight: 16 }}>{label}</span>
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0F172A', textAlign: 'right', fontFamily: mono ? 'monospace' : undefined, wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}

function TransfersContent() {
  const sp = useSearchParams();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [total, setTotal]   = useState(0);
  const [pages, setPages]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(sp.get('q') ?? '');
  const [status, setStatus] = useState(sp.get('status') ?? '');
  const [page, setPage]     = useState(parseInt(sp.get('page') ?? '1'));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback((q: string, s: string, p: number) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p) });
    if (q) params.set('q', q);
    if (s) params.set('status', s);
    fetch(`/api/admin/transfers?${params}`)
      .then(r => r.json())
      .then(d => { setTransfers(d.transfers); setTotal(d.total); setPages(d.pages); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(search, status, page); }, [status, page, load]);  // eslint-disable-line

  const onSearch = (q: string) => {
    setSearch(q);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => { setPage(1); load(q, status, 1); }, 350);
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Transfers</h1>
        <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: '0.875rem' }}>{total} total transfers</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search by name or transfer ID…"
          style={{ flex: 1, minWidth: 240, padding: '9px 14px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: '0.875rem', outline: 'none', color: '#0F172A' }}
        />
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: '0.875rem', color: '#0F172A', outline: 'none', background: 'white' }}
        >
          <option value="">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s]?.label ?? s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94A3B8' }}>Loading…</div>
        ) : transfers.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94A3B8' }}>No transfers found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                {['ID', 'Sender', 'Recipient', 'Sent', 'Receives', 'Status', 'Date', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transfers.map(t => {
                const sm = STATUS_META[t.status] ?? { label: t.status, cls: 'status-info' };
                return (
                  <tr key={t.id} style={{ borderTop: '1px solid #F1F5F9', cursor: 'pointer' }} onClick={() => setSelectedId(t.id)}>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#64748B' }}>{t.id.slice(0,8).toUpperCase()}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#64748B', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.userEmail}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.875rem', color: '#0F172A' }}>{t.recipientName}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.875rem', color: '#0F172A', whiteSpace: 'nowrap' }}>{gbpFmt.format(t.sendAmount)}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap' }}>{rwfFmt.format(t.receiveAmount)} RWF</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`status-pill ${sm.cls}`} style={{ fontSize: '0.72rem' }}>{sm.label}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                      {new Date(t.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <i className="bi bi-chevron-right" style={{ color: '#CBD5E1', fontSize: '0.75rem' }}></i>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Page {page} of {pages} · {total} total</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #E2E8F0', background: 'white', cursor: page === 1 ? 'default' : 'pointer', color: '#64748B', fontSize: '0.8rem' }}>
              ← Prev
            </button>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #E2E8F0', background: 'white', cursor: page === pages ? 'default' : 'pointer', color: '#64748B', fontSize: '0.8rem' }}>
              Next →
            </button>
          </div>
        </div>
      )}

      {selectedId && (
        <TransferDrawer
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onStatusChange={() => { setSelectedId(null); load(search, status, page); }}
        />
      )}
    </div>
  );
}

export default function AdminTransfers() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: '#94A3B8' }}>Loading…</div>}>
      <TransfersContent />
    </Suspense>
  );
}
