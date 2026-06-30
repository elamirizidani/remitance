'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const gbpFmt = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
const rwfFmt = new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 });

const STATUS_META: Record<string, { label: string; cls: string }> = {
  PENDING:          { label: 'Pending',         cls: 'status-info' },
  PAYMENT_CAPTURED: { label: 'Payment received', cls: 'status-info' },
  PAYOUT_INITIATED: { label: 'Sending',         cls: 'status-info' },
  COMPLETED:        { label: 'Completed',        cls: 'status-success' },
  FAILED:           { label: 'Failed',           cls: 'status-danger' },
  MANUAL_REVIEW:    { label: 'Manual review',    cls: 'status-warning' },
};

type Stats = {
  totalTransfers: number;
  completedTransfers: number;
  pendingReview: number;
  totalUsers: number;
  pendingKyc: number;
  totalVolume: number;
  totalRevenue: number;
  recentTransfers: Array<{
    id: string; recipientName: string; sendAmount: number;
    sendCurrency: string; receiveAmount: number; status: string; createdAt: string;
  }>;
  statusBreakdown: Array<{ status: string; count: number }>;
};

function MetricCard({ label, value, sub, icon, accent = false, alert = false }: {
  label: string; value: string; sub?: string; icon: string; accent?: boolean; alert?: boolean;
}) {
  return (
    <div style={{
      background: 'white', borderRadius: 12, padding: '20px 24px',
      border: `1px solid ${alert ? '#FDE68A' : '#E2E8F0'}`,
      borderLeft: `4px solid ${alert ? '#D97706' : accent ? 'var(--brand-accent)' : 'var(--brand-primary)'}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: 4 }}>{sub}</div>}
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: alert ? '#FFFBEB' : accent ? 'var(--brand-accent-soft)' : '#EFF6FF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: alert ? '#D97706' : accent ? 'var(--brand-accent)' : 'var(--brand-primary)',
          fontSize: '1.1rem',
        }}>
          <i className={`bi ${icon}`}></i>
        </div>
      </div>
    </div>
  );
}

export default function AdminOverview() {
  const [stats, setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1280, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Overview</h1>
        <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: '0.875rem' }}>
          Real-time metrics across all transfers and users
        </p>
      </div>

      {loading ? (
        <div style={{ color: '#94A3B8', textAlign: 'center', paddingTop: 80 }}>Loading dashboard…</div>
      ) : stats ? (
        <>
          {/* Metric cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            <MetricCard label="Total Volume" value={gbpFmt.format(stats.totalVolume)} sub="Completed transfers only" icon="bi-currency-pound" accent />
            <MetricCard label="Revenue (fees)" value={gbpFmt.format(stats.totalRevenue)} sub="Fees collected" icon="bi-graph-up-arrow" />
            <MetricCard label="Total Transfers" value={String(stats.totalTransfers)} sub={`${stats.completedTransfers} completed`} icon="bi-arrow-left-right" />
            <MetricCard label="Users" value={String(stats.totalUsers)} sub="Registered accounts" icon="bi-people-fill" />
            <MetricCard label="Manual Review" value={String(stats.pendingReview)} sub="Require intervention" icon="bi-exclamation-triangle-fill" alert={stats.pendingReview > 0} />
            <MetricCard label="KYC Pending" value={String(stats.pendingKyc)} sub="Awaiting review" icon="bi-shield-exclamation" alert={stats.pendingKyc > 0} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start' }}>
            {/* Recent transfers */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9' }}>
                <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', margin: 0 }}>Recent Transfers</h2>
                <Link href="/admin/transfers" style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>
                  View all →
                </Link>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['Recipient', 'Amount', 'Receives', 'Status', 'Date'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recentTransfers.map(t => {
                    const sm = STATUS_META[t.status] ?? { label: t.status, cls: 'status-info' };
                    return (
                      <tr key={t.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0F172A' }}>{t.recipientName}</div>
                          <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 1 }}>{t.id.slice(0,8).toUpperCase()}</div>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.875rem', color: '#0F172A' }}>
                          {gbpFmt.format(t.sendAmount)}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#64748B' }}>
                          {rwfFmt.format(t.receiveAmount)} RWF
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className={`status-pill ${sm.cls}`} style={{ fontSize: '0.72rem' }}>{sm.label}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: '#94A3B8' }}>
                          {new Date(t.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Status breakdown */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', padding: '20px 24px', minWidth: 220 }}>
              <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', margin: '0 0 16px' }}>Status Breakdown</h2>
              {stats.statusBreakdown
                .sort((a, b) => b.count - a.count)
                .map(s => {
                  const sm = STATUS_META[s.status] ?? { label: s.status, cls: 'status-info' };
                  const pct = Math.round((s.count / stats.totalTransfers) * 100);
                  return (
                    <div key={s.status} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span className={`status-pill ${sm.cls}`} style={{ fontSize: '0.72rem' }}>{sm.label}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>{s.count}</span>
                      </div>
                      <div style={{ height: 4, background: '#F1F5F9', borderRadius: 2 }}>
                        <div style={{ height: '100%', borderRadius: 2, background: 'var(--brand-primary)', width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Quick actions */}
          {(stats.pendingReview > 0 || stats.pendingKyc > 0) && (
            <div style={{ marginTop: 24, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <i className="bi bi-exclamation-triangle-fill" style={{ color: '#D97706', fontSize: '1.1rem' }}></i>
              <span style={{ fontSize: '0.875rem', color: '#92400E', fontWeight: 600 }}>
                Action required:{' '}
                {stats.pendingReview > 0 && `${stats.pendingReview} transfer(s) need manual review`}
                {stats.pendingReview > 0 && stats.pendingKyc > 0 && ' · '}
                {stats.pendingKyc > 0 && `${stats.pendingKyc} KYC submission(s) pending`}
              </span>
              <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                {stats.pendingReview > 0 && (
                  <Link href="/admin/transfers?status=MANUAL_REVIEW" style={{ background: '#D97706', color: 'white', padding: '6px 14px', borderRadius: 6, textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700 }}>
                    Review transfers
                  </Link>
                )}
                {stats.pendingKyc > 0 && (
                  <Link href="/admin/kyc" style={{ background: '#D97706', color: 'white', padding: '6px 14px', borderRadius: 6, textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700 }}>
                    Review KYC
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ color: '#DC2626', textAlign: 'center', paddingTop: 80 }}>Failed to load stats.</div>
      )}
    </div>
  );
}
