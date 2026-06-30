'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const NAV = [
  { href: '/admin',           label: 'Overview',   icon: 'bi-grid-1x2-fill' },
  { href: '/admin/transfers', label: 'Transfers',  icon: 'bi-arrow-left-right' },
  { href: '/admin/users',     label: 'Users',      icon: 'bi-people-fill' },
  { href: '/admin/kyc',       label: 'KYC Review', icon: 'bi-shield-check' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [checking, setChecking] = useState(true);
  const [email, setEmail]       = useState('');

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace('/login'); return; }
      // Quick client-side gate — server routes enforce this too
      const res = await fetch('/api/admin/stats');
      if (res.status === 403) { router.replace('/'); return; }
      setEmail(data.user.email ?? '');
      setChecking(false);
    });
  }, [router]);

  if (checking) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-muted)' }}>
        Checking access…
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, flexShrink: 0, background: '#0F172A',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <Link href="/admin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 32, height: 32, borderRadius: 8, background: 'var(--brand-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem', color: 'white',
            }}>
              <i className="bi bi-send-fill"></i>
            </span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'white', lineHeight: 1 }}>Fasta Fasta</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>Admin</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px' }}>
          {NAV.map(item => {
            const active = item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 8, marginBottom: 2,
                  textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600,
                  background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: active ? 'white' : '#94A3B8',
                  transition: 'all 0.15s',
                }}
              >
                <i className={`bi ${item.icon}`} style={{ fontSize: '1rem', width: 18, textAlign: 'center' }}></i>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '16px 10px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ padding: '8px 12px', marginBottom: 6, fontSize: '0.78rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {email}
          </div>
          <Link
            href="/"
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
              borderRadius: 8, textDecoration: 'none', fontSize: '0.82rem',
              fontWeight: 600, color: '#64748B', transition: 'color 0.15s',
            }}
          >
            <i className="bi bi-arrow-left" style={{ fontSize: '0.85rem' }}></i>
            Back to app
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  );
}
