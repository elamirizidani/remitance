'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry]   = useState<'GB' | 'BE'>('GB');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);

  const passwordWeak = password.length > 0 && password.length < 8;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError('');
    setLoading(true);

    const supabase = createSupabaseBrowserClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, country },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Profile row is created automatically on first login (see /login).
    // If email confirmation is disabled in Supabase, the user is already
    // logged in at this point — redirect straight to the app.
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Session exists (email confirmation disabled) — create profile now
      await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, country }),
      });
      window.location.href = '/';
      return;
    }

    setDone(true);
    setLoading(false);
  };

  if (done) {
    return (
      <section className="page-section d-flex justify-content-center">
        <div style={{ maxWidth: 440, textAlign: 'center' }}>
          <div className="icon-box mint mx-auto mb-4" style={{ width: 64, height: 64, borderRadius: '50%', background: '#ECFDF5', border: '2px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: '#059669' }}>
            <i className="bi bi-envelope-check"></i>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Check your email</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then{' '}
            <Link href="/login" style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>log in</Link>.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section d-flex justify-content-center">
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div className="text-center mb-4">
          <span className="eyebrow mb-2 d-block">Get started</span>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-1px' }}>Create account</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>Log in</Link>
          </p>
        </div>

        <div className="surface-panel p-4">
          {error && (
            <div className="status-pill status-danger mb-3" style={{ width: '100%', justifyContent: 'flex-start' }}>
              <i className="bi bi-exclamation-circle"></i> {error}
            </div>
          )}

          <form onSubmit={submit}>
            <div className="mb-3">
              <label htmlFor="fullName" className="form-label">Full name</label>
              <input
                id="fullName"
                className="input-premium"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                id="email"
                type="email"
                className="input-premium"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                className="input-premium"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
              />
              {passwordWeak && (
                <p style={{ fontSize: '0.78rem', color: '#DC2626', marginTop: 4, marginBottom: 0 }}>
                  Password must be at least 8 characters.
                </p>
              )}
            </div>
            <div className="mb-4">
              <label htmlFor="country" className="form-label">Sending from</label>
              <select
                id="country"
                className="input-premium"
                value={country}
                onChange={e => setCountry(e.target.value as 'GB' | 'BE')}
              >
                <option value="GB">🇬🇧 United Kingdom</option>
                <option value="BE">🇧🇪 Belgium</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? 'var(--border)' : 'var(--brand-accent)',
                border: 'none',
                color: loading ? 'var(--text-subtle)' : 'white',
                borderRadius: '100px', padding: '16px',
                fontWeight: 800, fontSize: '1rem',
                cursor: loading ? 'default' : 'pointer',
              }}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
