import Link from 'next/link';

export default function TrustFooter() {
  const assurances = [
    {
      icon: 'bi-shield-lock',
      title: 'Regulated transfers',
      desc: 'Identity checks, payment screening, and clear audit trails for every payment.',
    },
    {
      icon: 'bi-lightning-charge',
      title: 'Fast Rwanda delivery',
      desc: 'Mobile money payments can arrive in minutes when the receiving network is online.',
    },
    {
      icon: 'bi-cash-coin',
      title: 'Transparent pricing',
      desc: 'Fees, exchange rate, delivery method, and recipient total are shown before checkout.',
    },
    {
      icon: 'bi-headset',
      title: 'Human support',
      desc: 'Specialists are available around the clock for payment reviews and delivery questions.',
    },
  ];

  return (
    <footer className="mt-5 border-top border-white border-opacity-10">
      <div className="container py-5">
        <div className="row g-4 mb-5">
          {assurances.map((item) => (
            <div className="col-md-6 col-lg-3" key={item.title}>
              <div className="d-flex gap-3 h-100">
                <span className="icon-box gold">
                  <i className={`bi ${item.icon}`}></i>
                </span>
                <div>
                  <h6 className="mb-1">{item.title}</h6>
                  <p className="small mb-0 text-subtle">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="surface-panel p-4 p-lg-5 mb-5">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <span className="eyebrow mb-2">
                <i className="bi bi-patch-check"></i>
                Built for trusted remittance
              </span>
              <h2 className="h3 mb-2">Send with rate confidence and delivery visibility.</h2>
              <p className="mb-0">Track payment status, manage saved recipients, and compare rates before money leaves your account.</p>
            </div>
            <div className="col-lg-5 text-lg-end">
              <Link href="/" className="btn btn-premium btn-premium-primary px-4">
                <i className="bi bi-send"></i>
                Start a transfer
              </Link>
            </div>
          </div>
        </div>

        <div className="row align-items-start g-4">
          <div className="col-lg-5">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="brand-mark">
                <i className="bi bi-intersect"></i>
              </span>
              <span className="fw-bold fs-5 text-white">Remitly<span className="text-brand">Pro</span></span>
            </div>
            <p className="small mb-0 text-subtle">
              © 2026 Remitly Pro Max Global Inc. International money transfer services are subject to identity verification and local network availability.
            </p>
          </div>
          <div className="col-lg-7">
            <div className="row g-4 justify-content-lg-end">
              <div className="col-6 col-md-4">
                <h6 className="small text-white mb-3">Product</h6>
                <div className="d-grid gap-2 small">
                  <Link href="/" className="footer-link">Send money</Link>
                  <Link href="/rates" className="footer-link">Exchange rates</Link>
                  <Link href="/recipients" className="footer-link">Recipients</Link>
                </div>
              </div>
              <div className="col-6 col-md-4">
                <h6 className="small text-white mb-3">Trust</h6>
                <div className="d-grid gap-2 small">
                  <Link href="/help" className="footer-link">Security</Link>
                  <Link href="/transactions" className="footer-link">Transfer status</Link>
                  <Link href="/help" className="footer-link">Compliance</Link>
                </div>
              </div>
              <div className="col-6 col-md-4">
                <h6 className="small text-white mb-3">Support</h6>
                <div className="d-grid gap-2 small">
                  <Link href="/help" className="footer-link">Help center</Link>
                  <Link href="/help" className="footer-link">Contact us</Link>
                  <Link href="/help" className="footer-link">Report an issue</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
