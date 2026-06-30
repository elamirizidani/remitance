'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';

const rwfFmt = new Intl.NumberFormat('en-RW', { maximumFractionDigits: 2 });

export default function Rates() {
  const [rate, setRate]     = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState('1650');
  const [saved, setSaved]   = useState(false);

  useEffect(() => {
    fetch('/api/quote?sendAmount=100&sendCurrency=GBP')
      .then(r => r.json())
      .then(d => { setRate(d.exchangeRate); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const displayRate = rate !== null ? rwfFmt.format(rate) : '—';

  const comparison = rate !== null ? [
    { name: 'Fasta Fasta',             rate: rwfFmt.format(rate),            fee: '£0.00 (over £500) / £1.55', best: true },
    { name: 'Digital wallet average',  rate: rwfFmt.format(rate * 0.991),    fee: '£1.99' },
    { name: 'High-street bank wire',   rate: rwfFmt.format(rate * 0.986),    fee: '£2.90' },
  ] : [];

  const saveAlert = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <section className="page-section">
      <div className="container">
        <div className="page-heading">
          <div>
            <span className="eyebrow mb-2 d-block">Live Rates</span>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 8 }}>GBP / RWF</h1>
            <p className="mb-0">
              1 GBP ={' '}
              {loading ? (
                <span style={{ color: 'var(--text-subtle)' }}>Loading…</span>
              ) : (
                <span style={{ color: 'var(--brand-primary)', fontWeight: 800 }}>{displayRate} RWF</span>
              )}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginLeft: 8 }}>
                mid-market · updated every 60s
              </span>
            </p>
          </div>
          <Link href="/" className="btn btn-premium btn-premium-primary">
            <i className="bi bi-lightning-charge-fill"></i> Send Money
          </Link>
        </div>

        <div className="row g-4">
          <div className="col-lg-7">
            <div className="surface-panel overflow-hidden">
              {loading ? (
                <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading live rates…
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table-premium w-100">
                    <thead>
                      <tr>
                        <th style={{ paddingLeft: 24 }}>Provider</th>
                        <th>Rate (GBP → RWF)</th>
                        <th style={{ textAlign: 'right', paddingRight: 24 }}>Fee</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparison.map(row => (
                        <tr key={row.name}>
                          <td style={{ paddingLeft: 24 }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{row.name}</span>
                            {row.best && <span className="status-pill status-success ms-2">Best</span>}
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{row.rate}</td>
                          <td style={{ textAlign: 'right', paddingRight: 24, color: 'var(--text-muted)', fontWeight: 600 }}>{row.fee}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-5">
            <div className="surface-panel p-4 h-100">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div className="icon-box">
                  <i className="bi bi-bell"></i>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem' }}>Rate Alert</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Get notified when rate hits your target</div>
                </div>
              </div>
              <form onSubmit={saveAlert}>
                <span className="form-label">Target rate (RWF per GBP)</span>
                <div className="d-flex gap-2">
                  <input
                    id="rateTarget"
                    className="input-premium"
                    value={target}
                    onChange={e => { setTarget(e.target.value.replace(/[^0-9.]/g, '')); setSaved(false); }}
                    inputMode="decimal"
                    placeholder="e.g. 1700"
                  />
                  <button className="btn btn-premium btn-premium-primary px-4" type="submit">Save</button>
                </div>
                {saved && (
                  <div className="status-pill status-success mt-3">
                    <i className="bi bi-check2"></i> Alert saved for {target} RWF
                  </div>
                )}
              </form>

              {rate !== null && (
                <div style={{ marginTop: 24, padding: '16px', background: 'var(--bg-soft)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginBottom: 8 }}>Quick conversions</div>
                  {[50, 100, 200, 500].map(gbp => (
                    <div key={gbp} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-muted)' }}>£{gbp}</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        {rwfFmt.format(Math.round((gbp - (gbp >= 500 ? 0 : 1.55)) * rate))} RWF
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
