'use client';

import { useEffect, useState } from 'react';

type User = {
  id: string; email: string; fullName: string; country: string;
  kycDocRef: string | null; createdAt: string;
};

type ActionState = { id: string; verb: 'VERIFIED' | 'REJECTED' } | null;

async function fetchSubmittedKycUsers(): Promise<User[]> {
  const response = await fetch('/api/admin/users?kyc=SUBMITTED&page=1');
  const data = await response.json();
  return data.users ?? [];
}

export default function AdminKyc() {
  const [users, setUsers]   = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<ActionState>(null);
  const [note, setNote]     = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setUsers(await fetchSubmittedKycUsers());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    fetchSubmittedKycUsers()
      .then(nextUsers => {
        if (!cancelled) setUsers(nextUsers);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const confirm = async () => {
    if (!action) return;
    setSaving(true); setErr('');
    try {
      const res = await fetch(`/api/admin/users/${action.id}/kyc`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action.verb, note }),
      });
      if (!res.ok) { const d = await res.json(); setErr(d.error ?? 'Failed'); return; }
      setAction(null); setNote('');
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>KYC Review Queue</h1>
        <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: '0.875rem' }}>
          Users who have submitted identity documents and are awaiting review.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#94A3B8' }}>Loading…</div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.5rem', color: '#16A34A' }}>
            <i className="bi bi-check-lg"></i>
          </div>
          <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '1rem' }}>All clear!</div>
          <div style={{ color: '#94A3B8', fontSize: '0.875rem', marginTop: 4 }}>No KYC submissions pending review.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {users.map(u => (
            <div key={u.id} style={{ background: 'white', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              {/* Card header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '1rem',
                }}>
                  {(u.fullName || u.email)[0].toUpperCase()}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {u.fullName || 'No name'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
                </div>
                <span className="status-pill status-warning" style={{ marginLeft: 'auto', flexShrink: 0, fontSize: '0.72rem' }}>Pending</span>
              </div>

              {/* Details */}
              <div style={{ padding: '14px 20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                  <Detail label="Country" value={u.country || '—'} />
                  <Detail label="Document ref" value={u.kycDocRef || 'Submitted (no ref)'} mono />
                  <Detail label="Submitted" value={new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} />
                </div>

                {action?.id === u.id ? (
                  <div>
                    {err && <div style={{ color: '#DC2626', fontSize: '0.78rem', marginBottom: 6 }}>{err}</div>}
                    <textarea
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder={`Note for ${action.verb === 'VERIFIED' ? 'approval' : 'rejection'} (optional)`}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: '0.82rem', resize: 'vertical', minHeight: 64, outline: 'none', marginBottom: 8 }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={confirm}
                        disabled={saving}
                        style={{
                          flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: saving ? 'default' : 'pointer',
                          background: action.verb === 'VERIFIED' ? '#16A34A' : '#DC2626',
                          color: 'white',
                        }}
                      >
                        {saving ? 'Saving…' : `Confirm ${action.verb === 'VERIFIED' ? 'Approve' : 'Reject'}`}
                      </button>
                      <button
                        onClick={() => { setAction(null); setNote(''); setErr(''); }}
                        style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #E2E8F0', background: 'white', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', color: '#64748B' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => { setAction({ id: u.id, verb: 'VERIFIED' }); setNote(''); setErr(''); }}
                      style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', background: '#16A34A', color: 'white', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      <i className="bi bi-check-lg"></i> Approve
                    </button>
                    <button
                      onClick={() => { setAction({ id: u.id, verb: 'REJECTED' }); setNote(''); setErr(''); }}
                      style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      <i className="bi bi-x-lg"></i> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ fontSize: '0.75rem', color: '#94A3B8', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0F172A', textAlign: 'right', fontFamily: mono ? 'monospace' : undefined, wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}
