'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Suspense } from 'react';

const KYC_STATUSES = ['PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED'];
const KYC_META: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: 'Not submitted', cls: 'status-info' },
  SUBMITTED: { label: 'Pending review', cls: 'status-warning' },
  VERIFIED:  { label: 'Verified',       cls: 'status-success' },
  REJECTED:  { label: 'Rejected',       cls: 'status-danger' },
};

type User = {
  id: string; email: string; fullName: string; country: string;
  kycStatus: string; kycDocRef: string | null;
  transferCount: number; createdAt: string;
};

function UsersContent() {
  const [users, setUsers]   = useState<User[]>([]);
  const [total, setTotal]   = useState(0);
  const [pages, setPages]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kyc, setKyc]       = useState('');
  const [page, setPage]     = useState(1);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback((q: string, k: string, p: number) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p) });
    if (q) params.set('q', q);
    if (k) params.set('kyc', k);
    fetch(`/api/admin/users?${params}`)
      .then(r => r.json())
      .then(d => { setUsers(d.users); setTotal(d.total); setPages(d.pages); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(search, kyc, page); }, [kyc, page, load]);  // eslint-disable-line

  const onSearch = (q: string) => {
    setSearch(q);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => { setPage(1); load(q, kyc, 1); }, 350);
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Users</h1>
        <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: '0.875rem' }}>{total} registered accounts</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search by name or email…"
          style={{ flex: 1, minWidth: 240, padding: '9px 14px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: '0.875rem', outline: 'none', color: '#0F172A' }}
        />
        <select
          value={kyc}
          onChange={e => { setKyc(e.target.value); setPage(1); }}
          style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: '0.875rem', color: '#0F172A', outline: 'none', background: 'white' }}
        >
          <option value="">All KYC statuses</option>
          {KYC_STATUSES.map(s => <option key={s} value={s}>{KYC_META[s]?.label ?? s}</option>)}
        </select>
      </div>

      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94A3B8' }}>Loading…</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94A3B8' }}>No users found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                {['Name', 'Email', 'Country', 'KYC Status', 'Transfers', 'Joined'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const km = KYC_META[u.kycStatus] ?? { label: u.kycStatus, cls: 'status-info' };
                return (
                  <tr key={u.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0F172A' }}>{u.fullName || '—'}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: 1 }}>{u.id.slice(0,8).toUpperCase()}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#64748B', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#64748B' }}>{u.country || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`status-pill ${km.cls}`} style={{ fontSize: '0.72rem' }}>{km.label}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: '0.875rem', color: '#0F172A', textAlign: 'center' }}>{u.transferCount}</td>
                    <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

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
    </div>
  );
}

export default function AdminUsers() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: '#94A3B8' }}>Loading…</div>}>
      <UsersContent />
    </Suspense>
  );
}
