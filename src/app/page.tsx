'use client';

import { type FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

// ─── Static data ──────────────────────────────────────────────────────────────


const DELIVERY_METHODS = [
  { id: 'MTN_MOMO' as const,    label: 'MTN MoMo',     icon: 'bi-phone-fill' },
  { id: 'AIRTEL_MONEY' as const, label: 'Airtel Money', icon: 'bi-phone' },
  { id: 'BANK_DEPOSIT' as const, label: 'Bank deposit', icon: 'bi-bank' },
];

const FEATURES = [
  { icon: 'bi-lightning-charge-fill', title: 'Instant Mobile Money',   desc: 'Money reaches MTN MoMo or Airtel Money in under 2 minutes. Recipient gets an instant SMS.', wide: true },
  { icon: 'bi-shield-check',          title: 'FCA Secured',            desc: 'Protected by world-class encryption and regulated standards.' },
  { icon: 'bi-graph-up',              title: 'Real-Time Rates',        desc: 'Mid-market rates updated every 60 seconds. No hidden markups, no surprise deductions.', tall: true },
  { icon: 'bi-receipt',               title: 'Flat Fees',              desc: 'Whether you send £10 or £10,000, the fee stays low and predictable.' },
  { icon: 'bi-bank',                  title: 'Every Rwandan Bank',     desc: 'Direct deposits to BK, Equity, I&M, and more — we cover the full financial landscape.', wide: true },
];

const STEPS = [
  { n: '1', title: 'Quick Sign Up',  desc: 'Create your account in 60 seconds with just your ID.' },
  { n: '2', title: 'Enter Details',  desc: 'Set the amount and choose MoMo or bank delivery.' },
  { n: '3', title: 'Instant Arrival', desc: 'Confirm and send. Money arrives in under 2 minutes.' },
];

type DeliveryMethodId = 'MTN_MOMO' | 'AIRTEL_MONEY' | 'BANK_DEPOSIT';

const gbpFmt = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
const rwfFmt = new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 });

// ─── Component ────────────────────────────────────────────────────────────────

export default function Home() {
  const [sendAmt, setSendAmt]       = useState('200');
  const [methodId, setMethodId]     = useState<DeliveryMethodId>('MTN_MOMO');
  const [recipientName, setName]    = useState('');
  const [recipientPhone, setPhone]  = useState('+250');

  // Quote from /api/quote
  const [quote, setQuote] = useState<{
    receiveAmount: number; exchangeRate: number; fee: number;
  }>({ receiveAmount: 0, exchangeRate: 1634.5, fee: 1.55 });

  // Auth state
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = loading

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Transfer initiation
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError]     = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced quote fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const amount = parseFloat(sendAmt);
      if (!amount || amount <= 0) return;

      fetch(`/api/quote?sendAmount=${amount}&sendCurrency=GBP`)
        .then(r => r.json())
        .then(d => setQuote({ receiveAmount: d.receiveAmount, exchangeRate: d.exchangeRate, fee: d.fee }))
        .catch(() => {}); // keep previous quote on network error
    }, 400);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [sendAmt]);

  const amount    = parseFloat(sendAmt) || 0;
  const canSubmit = amount > 0 && recipientName.trim().length > 1 && recipientPhone.trim().length > 5;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setApiError('');

    const res = await fetch('/api/transfers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sendAmount: amount,
        sendCurrency: 'GBP',
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        deliveryMethod: methodId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.code === 'KYC_NOT_VERIFIED') {
        setApiError('KYC_NOT_VERIFIED');
      } else if (data.code === 'UNAUTHENTICATED' || res.status === 401) {
        setApiError('UNAUTHENTICATED');
      } else if (res.status === 429) {
        setApiError('Too many requests. Please wait a minute before trying again.');
      } else {
        setApiError(data.error ?? 'Something went wrong. Please try again.');
      }
      setSubmitting(false);
      return;
    }

    // Keep spinner up until Stripe redirects — page.tsx won't unmount immediately
    window.location.href = data.checkoutUrl;
  };

  return (
    <>
      {/* ── Hero ── */}
      <section
        style={{
          position: 'relative',
          padding: '100px 0 80px',
          background: 'linear-gradient(160deg, #EFF6FF 0%, #ffffff 50%)',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: -120, right: -120, width: 600, height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26,79,186,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />

        <div className="container">
          <div className="row align-items-center g-5">
            {/* Headline + stats */}
            <div className="col-lg-6">
              <span className="eyebrow mb-3 d-block">🇬🇧 UK &amp; 🇧🇪 Belgium → 🇷🇼 Rwanda</span>
              <h1 style={{ fontSize: 'clamp(38px, 5.5vw, 62px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-2.5px', marginBottom: 24 }}>
                The fastest way<br />to send{' '}
                <span style={{ color: 'var(--brand-primary)' }}>money</span><br />
                to Rwanda
              </h1>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: 48, maxWidth: 500 }}>
                Premium remittance with zero hidden fees, real-time rates, and delivery in under 2 minutes.
              </p>
              <div className="d-flex gap-5 flex-wrap">
                {[
                  { n: gbpFmt.format(1.55), l: 'Low flat fee' },
                  { n: '< 2 min', l: 'Avg. delivery' },
                  { n: 'FCA',     l: 'Regulated' },
                ].map(s => (
                  <div key={s.l}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{s.n}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Send widget */}
            <div className="col-lg-6">
              <div style={{
                background: 'white', borderRadius: 'var(--radius-xl)', padding: 40,
                boxShadow: 'var(--shadow-premium)', border: '1px solid rgba(0,0,0,0.05)',
              }}>
                <form onSubmit={handleSubmit}>
                  {/* API errors */}
                  {apiError && apiError !== 'KYC_NOT_VERIFIED' && apiError !== 'UNAUTHENTICATED' && (
                    <div className="status-pill status-danger mb-3" style={{ width: '100%', justifyContent: 'flex-start' }}>
                      <i className="bi bi-exclamation-circle"></i> {apiError}
                    </div>
                  )}
                  {apiError === 'KYC_NOT_VERIFIED' && (
                    <div className="status-pill status-warning mb-3" style={{ width: '100%', justifyContent: 'flex-start', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                      <span><i className="bi bi-shield-exclamation"></i> Identity verification required before you can send.</span>
                      <Link href="/kyc" style={{ color: 'var(--brand-primary)', fontWeight: 700, fontSize: '0.85rem' }}>
                        Complete KYC verification →
                      </Link>
                    </div>
                  )}

                  {/* Amount */}
                  <span className="form-label">Amount to Send</span>
                  <div style={{
                    display: 'flex', alignItems: 'center', background: 'var(--bg-mid)',
                    borderRadius: 'var(--radius-md)', padding: '10px 18px', marginBottom: 24,
                    border: '2px solid transparent', transition: 'var(--transition)',
                  }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--brand-primary)')}
                    onBlur={e  => (e.currentTarget.style.borderColor = 'transparent')}
                  >
                    <span style={{ fontWeight: 800, color: 'var(--brand-primary)', marginRight: 10, fontSize: '1.1rem' }}>£</span>
                    <input
                      type="number"
                      value={sendAmt}
                      min={1}
                      max={10000}
                      onChange={e => setSendAmt(e.target.value)}
                      style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '2rem', fontWeight: 800, width: '100%', color: 'var(--text-main)' }}
                      aria-label="Amount to send in GBP"
                    />
                  </div>

                  {/* Delivery method */}
                  <span className="form-label">Delivery Method</span>
                  <div className="row g-2 mb-4">
                    {DELIVERY_METHODS.map(m => (
                      <div className="col-4" key={m.id}>
                        <button
                          type="button"
                          onClick={() => setMethodId(m.id)}
                          style={{
                            width: '100%', padding: '12px 8px',
                            border: `1px solid ${methodId === m.id ? 'var(--brand-primary)' : 'var(--border)'}`,
                            borderRadius: 'var(--radius-md)',
                            background: methodId === m.id ? '#EFF6FF' : 'white',
                            cursor: 'pointer', textAlign: 'center', transition: 'var(--transition)',
                          }}
                        >
                          <i className={`bi ${m.icon}`} style={{ fontSize: '1.2rem', color: methodId === m.id ? 'var(--brand-primary)' : 'var(--text-subtle)', display: 'block', marginBottom: 4 }}></i>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: methodId === m.id ? 'var(--brand-primary)' : 'var(--text-muted)' }}>{m.label}</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Recipient */}
                  <div className="row g-2 mb-4">
                    <div className="col-6">
                      <span className="form-label">Recipient Name</span>
                      <input className="input-premium" value={recipientName} onChange={e => setName(e.target.value)} placeholder="Full name" style={{ fontSize: '0.9rem' }} />
                    </div>
                    <div className="col-6">
                      <span className="form-label">Phone (E.164)</span>
                      <input className="input-premium" value={recipientPhone} onChange={e => setPhone(e.target.value)} placeholder="+250788xxxxxx" inputMode="tel" style={{ fontSize: '0.9rem' }} />
                    </div>
                  </div>

                  {/* Live rate summary */}
                  <div className="summary-box mb-4">
                    <div className="sum-row">
                      <span>Exchange Rate</span>
                      <span>1 GBP = {quote.exchangeRate.toFixed(2)} RWF</span>
                    </div>
                    <div className="sum-row">
                      <span>Transfer Fee</span>
                      <span>{quote.fee === 0 ? 'Free' : gbpFmt.format(quote.fee)}</span>
                    </div>
                    <div className="sum-total">
                      <span>Recipient Gets</span>
                      <span>{quote.receiveAmount > 0 ? rwfFmt.format(quote.receiveAmount) + ' RWF' : '— RWF'}</span>
                    </div>
                  </div>

                  {/* Auth-aware submit button */}
                  {user === null ? (
                    // Not logged in — direct to signup/login
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <Link
                        href="/signup"
                        style={{
                          width: '100%', background: 'var(--brand-accent)', border: 'none',
                          color: 'white', borderRadius: '100px', padding: '18px',
                          fontSize: '1.05rem', fontWeight: 800, textAlign: 'center',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                          boxShadow: '0 12px 24px rgba(255,107,26,0.3)',
                          textDecoration: 'none',
                        }}
                      >
                        <i className="bi bi-person-plus-fill"></i> Create free account to send
                      </Link>
                      <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-subtle)', margin: 0 }}>
                        Already have an account?{' '}
                        <Link href="/login" style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>Log in</Link>
                      </p>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={!canSubmit || submitting || user === undefined}
                      style={{
                        width: '100%',
                        background: canSubmit && !submitting ? 'var(--brand-accent)' : 'var(--border)',
                        border: 'none',
                        color: canSubmit && !submitting ? 'white' : 'var(--text-subtle)',
                        borderRadius: '100px', padding: '18px',
                        fontSize: '1.05rem', fontWeight: 800,
                        cursor: canSubmit && !submitting ? 'pointer' : 'default',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        boxShadow: canSubmit ? '0 12px 24px rgba(255,107,26,0.3)' : 'none',
                        transition: 'var(--transition)',
                      }}
                    >
                      <i className="bi bi-lightning-charge-fill"></i>
                      {submitting ? 'Redirecting to checkout…' : 'Send Now'}
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="page-section reveal">
        <div className="container">
          <div className="text-center mb-5">
            <span className="eyebrow mb-3 d-block">Why Fasta Fasta</span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 16 }}>
              Built for the way you send
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto' }}>
              We&apos;ve reimagined remittance by removing the friction, the hidden fees, and the long waits.
            </p>
          </div>
          <div className="bento-grid">
            {FEATURES.map(f => (
              <div key={f.title} className={`bento-card${f.wide ? ' wide' : ''}${f.tall ? ' tall' : ''}`}>
                <div className="icon-box mb-4"><i className={`bi ${f.icon}`}></i></div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 10 }}>{f.title}</div>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Steps ── */}
      <section className="page-section reveal" style={{ background: 'var(--bg-soft)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <span className="eyebrow mb-3 d-block">The Process</span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-1.5px' }}>Three simple steps</h2>
          </div>
          <div className="row g-4 justify-content-center">
            {STEPS.map(s => (
              <div className="col-md-4" key={s.n}>
                <div className="how-step">
                  <div className="step-num">{s.n}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 10 }}>{s.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
