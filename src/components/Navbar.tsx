'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { name: 'Send', href: '/', icon: 'bi-send' },
    { name: 'Activity', href: '/transactions', icon: 'bi-clock-history' },
    { name: 'Recipients', href: '/recipients', icon: 'bi-person-check' },
    { name: 'Rates', href: '/rates', icon: 'bi-graph-up-arrow' },
    { name: 'Help', href: '/help', icon: 'bi-headset' },
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-premium sticky-top py-3">
      <div className="container">
        <Link href="/" className="navbar-brand d-flex align-items-center gap-2" onClick={() => setOpen(false)}>
          <span className="brand-mark">
            <i className="bi bi-intersect"></i>
          </span>
          <span className="fw-bold fs-5">
            Remitly<span className="text-brand">Pro</span>
          </span>
        </Link>

        <button
          className="btn btn-premium btn-premium-secondary btn-icon d-lg-none"
          type="button"
          aria-controls="navContent"
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={() => setOpen((value) => !value)}
        >
          <i className={`bi ${open ? 'bi-x-lg' : 'bi-list'}`}></i>
        </button>

        <div className={`collapse navbar-collapse ${open ? 'show' : ''}`} id="navContent">
          <ul className="navbar-nav mx-auto mb-3 mb-lg-0 gap-1 mt-3 mt-lg-0">
            {links.map((link) => (
              <li className="nav-item" key={link.href}>
                <Link
                  href={link.href}
                  className={`nav-link nav-link-premium ${pathname === link.href ? 'active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <i className={`bi ${link.icon} me-2 d-lg-none`}></i>
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="d-flex flex-column flex-lg-row gap-2 align-items-lg-center">
            <Link href="/rates" className="status-pill status-info text-decoration-none justify-content-center" onClick={() => setOpen(false)}>
              <i className="bi bi-broadcast"></i>
              GBP/RWF live
            </Link>
            <Link href="/" className="btn btn-premium btn-premium-primary px-3" onClick={() => setOpen(false)}>
              <i className="bi bi-plus-circle"></i>
              New transfer
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
