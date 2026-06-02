'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { name: 'Send', href: '/' },
    { name: 'Activity', href: '/transactions' },
    { name: 'Recipients', href: '/recipients' },
    { name: 'Rates', href: '/rates' },
    { name: 'Help', href: '/help' },
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-premium sticky-top py-3">
      <div className="container">
        <Link href="/" className="navbar-brand d-flex align-items-center gap-2">
          <span className="brand-mark">
            <i className="bi bi-intersect"></i>
          </span>
          <span className="fw-bold fs-5">
            Fasta <span className="text-brand">fasta</span>
          </span>
        </Link>

        <details className="mobile-nav d-lg-none">
          <summary className="btn btn-premium btn-premium-secondary btn-icon" aria-label="Toggle navigation">
            <i className="bi bi-list"></i>
          </summary>
          <div className="mobile-nav-panel surface-panel p-3">
            <div className="d-grid gap-1">
              {links.map((link) => (
                <Link
                  href={link.href}
                  className={`nav-link nav-link-premium ${pathname === link.href ? 'active' : ''}`}
                  key={link.href}
                >
                  {link.name}
                </Link>
              ))}
              <Link href="/" className="btn btn-premium btn-premium-primary mt-2">
                New transfer
              </Link>
            </div>
          </div>
        </details>

        <div className="navbar-collapse d-none d-lg-flex" id="navContent">
          <ul className="navbar-nav mx-auto mb-3 mb-lg-0 gap-1 mt-3 mt-lg-0">
            {links.map((link) => (
              <li className="nav-item" key={link.href}>
                <Link
                  href={link.href}
                  className={`nav-link nav-link-premium ${pathname === link.href ? 'active' : ''}`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          <Link href="/" className="btn btn-premium btn-premium-primary px-3">
            New transfer
          </Link>
        </div>
      </div>
    </nav>
  );
}
