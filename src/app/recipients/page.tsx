'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';

type Recipient = {
  id: string;
  fullName: string;
  phone: string;
  deliveryMethod: 'MTN_MOMO' | 'AIRTEL_MONEY' | 'BANK_DEPOSIT';
  bankAccount?: string | null;
};

const METHOD_LABEL: Record<string, string> = {
  MTN_MOMO:     'MTN MoMo',
  AIRTEL_MONEY: 'Airtel Money',
  BANK_DEPOSIT: 'Bank deposit',
};

type DeliveryMethod = 'MTN_MOMO' | 'AIRTEL_MONEY' | 'BANK_DEPOSIT';
type FormState = { fullName: string; phone: string; deliveryMethod: DeliveryMethod; bankAccount: string };
const emptyForm: FormState = { fullName: '', phone: '+250', deliveryMethod: 'MTN_MOMO', bankAccount: '' };

export default function Recipients() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [saving, setSaving]         = useState(false);
  const [formError, setFormError]   = useState('');
  const [editing, setEditing]       = useState<Recipient | null>(null);
  const [form, setForm]             = useState<FormState>(emptyForm);
  const [open, setOpen]             = useState(false);

  useEffect(() => {
    fetch('/api/recipients')
      .then(r => {
        if (!r.ok) throw new Error(r.status === 401 ? 'auth' : 'error');
        return r.json();
      })
      .then(setRecipients)
      .catch(e => setError(e.message === 'auth' ? 'unauthenticated' : 'failed'))
      .finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setOpen(true);
  };

  const openEdit = (r: Recipient) => {
    setEditing(r);
    setForm({ fullName: r.fullName, phone: r.phone, deliveryMethod: r.deliveryMethod as DeliveryMethod, bankAccount: r.bankAccount ?? '' });
    setFormError('');
    setOpen(true);
  };

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    const body = {
      fullName: form.fullName,
      phone: form.phone,
      deliveryMethod: form.deliveryMethod,
      ...(form.bankAccount ? { bankAccount: form.bankAccount } : {}),
    };

    const url = editing ? `/api/recipients/${editing.id}` : '/api/recipients';
    const method = editing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setFormError(data.error ?? 'Failed to save recipient');
      setSaving(false);
      return;
    }

    const saved: Recipient = await res.json();
    if (editing) {
      setRecipients(cur => cur.map(r => r.id === editing.id ? saved : r));
    } else {
      setRecipients(cur => [saved, ...cur]);
    }
    setOpen(false);
    setSaving(false);
  };

  const remove = async (id: string) => {
    if (!window.confirm('Remove this recipient?')) return;
    await fetch(`/api/recipients/${id}`, { method: 'DELETE' });
    setRecipients(cur => cur.filter(r => r.id !== id));
  };

  return (
    <section className="page-section">
      <div className="container">
        <div className="page-heading">
          <div>
            <span className="eyebrow mb-2 d-block">Recipients</span>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-1.5px' }}>Saved People</h1>
          </div>
          <button className="btn btn-premium btn-premium-primary" onClick={openAdd}>
            <i className="bi bi-plus-lg"></i> Add Recipient
          </button>
        </div>

        <div className="surface-panel overflow-hidden">
          {loading && (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading recipients…
            </div>
          )}

          {error === 'unauthenticated' && (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>Log in to manage your recipients.</p>
              <Link href="/login" className="btn btn-premium btn-premium-primary">Log in</Link>
            </div>
          )}

          {error === 'failed' && (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#DC2626' }}>
              Could not load recipients. Please refresh the page.
            </div>
          )}

          {!loading && !error && recipients.length === 0 && (
            <div style={{ padding: '64px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>👥</div>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                Save your recipients here to send money faster next time.
              </p>
              <button className="btn btn-premium btn-premium-primary" onClick={openAdd}>
                <i className="bi bi-plus-lg"></i> Add Your First Recipient
              </button>
            </div>
          )}

          {!loading && !error && recipients.length > 0 && (
            <div className="table-responsive">
              <table className="table-premium w-100">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: 24 }}>Name</th>
                    <th>Phone</th>
                    <th>Method</th>
                    <th style={{ textAlign: 'right', paddingRight: 24 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recipients.map(r => (
                    <tr key={r.id}>
                      <td style={{ paddingLeft: 24, fontWeight: 700, color: 'var(--text-main)' }}>{r.fullName}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{r.phone}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{METHOD_LABEL[r.deliveryMethod] ?? r.deliveryMethod}</td>
                      <td style={{ textAlign: 'right', paddingRight: 24 }}>
                        <div className="d-inline-flex gap-2">
                          <Link href="/" className="btn btn-premium btn-premium-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                            <i className="bi bi-lightning-charge-fill"></i> Send
                          </Link>
                          <button
                            className="btn btn-premium btn-premium-secondary"
                            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                            onClick={() => openEdit(r)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-premium btn-premium-secondary"
                            style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#DC2626', borderColor: '#DC2626' }}
                            onClick={() => remove(r.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {open && (
          <div className="modal-backdrop-custom" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
            <form
              className="modal-panel-custom surface-panel p-4 animate-fade-in"
              onSubmit={save}
              onClick={e => e.stopPropagation()}
            >
              <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                <div>
                  <span className="eyebrow mb-2 d-block">Recipient</span>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 900 }}>{editing ? 'Edit Recipient' : 'Add Recipient'}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{
                    background: 'var(--bg-mid)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', width: 40, height: 40,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}
                  aria-label="Close"
                >
                  <i className="bi bi-x-lg" style={{ color: 'var(--text-muted)' }}></i>
                </button>
              </div>

              {formError && (
                <div className="status-pill status-danger mb-3" style={{ width: '100%', justifyContent: 'flex-start' }}>
                  <i className="bi bi-exclamation-circle"></i> {formError}
                </div>
              )}

              <div className="row g-3">
                <div className="col-12">
                  <span className="form-label">Full Name</span>
                  <input
                    className="input-premium"
                    value={form.fullName}
                    onChange={e => setForm({ ...form, fullName: e.target.value })}
                    placeholder="Recipient's full name"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <span className="form-label">Phone (E.164)</span>
                  <input
                    className="input-premium"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+250788xxxxxx"
                    inputMode="tel"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <span className="form-label">Delivery Method</span>
                  <select
                    className="input-premium"
                    value={form.deliveryMethod}
                    onChange={e => setForm({ ...form, deliveryMethod: e.target.value as DeliveryMethod })}
                  >
                    <option value="MTN_MOMO">MTN MoMo</option>
                    <option value="AIRTEL_MONEY">Airtel Money</option>
                    <option value="BANK_DEPOSIT">Bank deposit</option>
                  </select>
                </div>
                {form.deliveryMethod === 'BANK_DEPOSIT' && (
                  <div className="col-12">
                    <span className="form-label">Bank Account Number</span>
                    <input
                      className="input-premium"
                      value={form.bankAccount}
                      onChange={e => setForm({ ...form, bankAccount: e.target.value })}
                      placeholder="Account number"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  width: '100%', marginTop: 20,
                  background: saving ? 'var(--border)' : 'var(--brand-accent)',
                  border: 'none',
                  color: saving ? 'var(--text-subtle)' : 'white',
                  borderRadius: '100px', padding: 16,
                  fontWeight: 800, cursor: saving ? 'default' : 'pointer', fontSize: '1rem',
                }}
              >
                {saving ? 'Saving…' : 'Save Recipient'}
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
