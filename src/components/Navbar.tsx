'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const links = [
  { name: 'Send Money',  href: '/' },
  { name: 'Activity',   href: '/transactions' },
  { name: 'Recipients', href: '/recipients' },
  { name: 'Live Rates', href: '/rates' },
  { name: 'Help',       href: '/help' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [user, setUser]      = useState<User | null>(null);
  const [signingOut, setOut] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    setOut(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-premium sticky-top" style={{ height: 80 }}>
      <div className="container">
        {/* Brand */}
        <Link href="/" className="navbar-brand d-flex align-items-center gap-2 text-decoration-none">
          <span className="brand-mark">
            <i className="bi bi-send-fill"></i>
          </span>
          <span style={{ fontWeight: 900, fontSize: '1.15rem', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            Fasta <span style={{ color: 'var(--brand-primary)' }}>Fasta</span>
          </span>
        </Link>

        {/* Mobile toggle */}
        <details className="mobile-nav d-lg-none">
          <summary
            className="btn btn-premium btn-premium-secondary btn-icon"
            style={{ borderRadius: 'var(--radius-sm)' }}
            aria-label="Toggle navigation"
          >
            <i className="bi bi-list" style={{ fontSize: '1.2rem' }}></i>
          </summary>
          <div className="mobile-nav-panel surface-panel p-3">
            <div className="d-grid gap-1">
              {links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link nav-link-premium ${pathname === link.href ? 'active' : ''}`}
                >
                  {link.name}
                </Link>
              ))}
              <hr style={{ borderColor: 'var(--border)', margin: '8px 0' }} />
              {user ? (
                <>
                  <Link href="/kyc" className="nav-link nav-link-premium" style={{ fontSize: '0.85rem' }}>
                    <i className="bi bi-shield-check" style={{ marginRight: 6 }}></i> Verify Identity
                  </Link>
                  <button onClick={signOut} disabled={signingOut} className="btn btn-premium btn-premium-secondary">
                    {signingOut ? 'Signing out…' : 'Sign out'}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login"  className="btn btn-premium btn-premium-secondary">Log in</Link>
                  <Link href="/signup" className="btn btn-premium btn-premium-primary">Get Started</Link>
                </>
              )}
            </div>
          </div>
        </details>

        {/* Desktop nav links */}
        <div className="d-none d-lg-flex align-items-center gap-1 mx-auto">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link nav-link-premium ${pathname === link.href ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="d-none d-lg-flex align-items-center gap-2">
          {user ? (
            <>
              <Link
                href="/kyc"
                style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, padding: '6px 12px', borderRadius: '100px', border: '1px solid var(--border)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}
              >
                <i className="bi bi-shield-check"></i> Verify ID
              </Link>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </span>
              <button
                onClick={signOut}
                disabled={signingOut}
                style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', fontWeight: 700, fontSize: '0.9rem', padding: '8px 16px', cursor: 'pointer', borderRadius: '100px' }}
              >
                {signingOut ? '…' : 'Sign out'}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontWeight: 700, fontSize: '0.9rem', padding: '8px 16px', cursor: 'pointer', textDecoration: 'none' }}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="btn btn-premium"
                style={{ background: 'var(--text-main)', color: 'white', borderRadius: '100px', fontSize: '0.9rem', padding: '10px 22px', textDecoration: 'none' }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
