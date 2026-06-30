'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !data.user) {
      setError(authError?.message ?? 'Login failed');
      setLoading(false);
      return;
    }

    // Ensure user profile row exists — idempotent upsert.
    // Handles email-confirmed signups and any case where the profile
    // row wasn't created during signup.
    await fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: data.user.user_metadata?.full_name ?? data.user.email?.split('@')[0] ?? 'User',
        country:  data.user.user_metadata?.country  ?? 'GB',
      }),
    });

    router.push('/');
    router.refresh();
  };

  return (
    <section className="page-section d-flex justify-content-center">
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div className="text-center mb-4">
          <span className="eyebrow mb-2 d-block">Welcome back</span>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-1px' }}>Log in</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>Sign up</Link>
          </p>
        </div>

        <div className="surface-panel p-4">
          {error && (
            <div
              className="status-pill status-danger mb-3"
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              <i className="bi bi-exclamation-circle"></i> {error}
            </div>
          )}

          <form onSubmit={submit}>
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
            <div className="mb-4">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                className="input-premium"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
                required
                autoComplete="current-password"
              />
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
              {loading ? 'Signing in…' : 'Log in'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
