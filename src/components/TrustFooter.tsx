import Link from 'next/link';

export default function TrustFooter() {
  return (
    <footer style={{ background: '#0F172A', color: 'white', padding: '80px 0 32px' }}>
      <div className="container">
        <div className="row g-5 mb-5">
          {/* Brand column */}
          <div className="col-lg-5">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="brand-mark" style={{ background: 'rgba(26,79,186,0.2)', borderColor: 'rgba(26,79,186,0.4)' }}>
                <i className="bi bi-send-fill" style={{ color: '#93c5fd' }}></i>
              </div>
              <span style={{ fontWeight: 900, fontSize: '1.15rem', letterSpacing: '-0.5px' }}>
                Fasta <span style={{ color: '#60a5fa' }}>Fasta</span>
              </span>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: 320 }}>
              Redefining the way the Rwandan diaspora sends money home. Fast, transparent, and built for the modern era.
            </p>
          </div>

          {/* Product links */}
          <div className="col-6 col-lg-3">
            <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: 20 }}>Product</div>
            <ul className="list-unstyled d-grid gap-2">
              <li><Link href="/rates" className="footer-link">Live Exchange Rates</Link></li>
              <li><Link href="/" className="footer-link">Transfer Fees</Link></li>
              <li><Link href="/" className="footer-link">Mobile Wallets</Link></li>
              <li><Link href="/" className="footer-link">Bank Deposits</Link></li>
            </ul>
          </div>

          {/* Legal links */}
          <div className="col-6 col-lg-3">
            <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: 20 }}>Legal</div>
            <ul className="list-unstyled d-grid gap-2">
              <li><Link href="/help" className="footer-link">Privacy Policy</Link></li>
              <li><Link href="/help" className="footer-link">Terms of Service</Link></li>
              <li><Link href="/help" className="footer-link">FCA Compliance</Link></li>
              <li><Link href="/help" className="footer-link">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.08)',
            fontSize: '0.8rem', color: '#64748B', flexWrap: 'wrap', gap: 12,
          }}
        >
          <span>© 2026 Fasta Fasta Ltd. Registered in England &amp; Wales.</span>
          <div style={{ display: 'flex', gap: 20 }}>
            <span style={{ fontWeight: 700, color: '#94A3B8' }}>FCA Regulated</span>
            <span style={{ fontWeight: 700, color: '#94A3B8' }}>SSL Secured</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
