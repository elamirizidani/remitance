import Link from 'next/link';

export default function TrustFooter() {
  return (
    <footer className="border-top border-white border-opacity-10">
      <div className="container py-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <span className="fw-bold text-white">Remitly<span className="text-brand">Pro</span></span>
            <p className="small text-subtle mb-0 mt-1">Secure money transfer demo · 2026</p>
          </div>
          <div className="d-flex gap-3 small">
            <Link href="/rates" className="footer-link">Rates</Link>
            <Link href="/transactions" className="footer-link">Activity</Link>
            <Link href="/help" className="footer-link">Help</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
