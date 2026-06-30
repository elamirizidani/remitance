'use client';

import { useState } from 'react';

const faqs = [
  {
    id: 'delivery',
    q: 'How long does delivery take?',
    a: 'Mobile money (MTN MoMo or Airtel) usually arrives in under 2 minutes. Bank deposits can take the same or next business day.',
  },
  {
    id: 'fees',
    q: 'What fees will I pay?',
    a: 'We charge a flat fee of £1.55 per transfer. For transfers over £500 the fee is waived entirely. All fees are shown upfront before you pay.',
  },
  {
    id: 'rates',
    q: 'How is the exchange rate calculated?',
    a: 'We use the live mid-market rate updated every 60 seconds with no markup. What you see is what you get.',
  },
  {
    id: 'edit',
    q: 'Can I cancel or edit a transfer?',
    a: 'Transfers are processed instantly. Once sent, they cannot be cancelled. If there is an error, contact support immediately.',
  },
];

export default function Help() {
  const [openId, setOpenId] = useState('delivery');

  return (
    <section className="page-section">
      <div className="container">
        <div className="page-heading">
          <div>
            <span className="eyebrow mb-2 d-block">Help Center</span>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-1.5px' }}>Support</h1>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="surface-panel overflow-hidden">
              {faqs.map((faq, i) => {
                const isOpen = openId === faq.id;
                return (
                  <div
                    key={faq.id}
                    style={{ borderBottom: i < faqs.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? '' : faq.id)}
                      style={{
                        width: '100%', background: 'transparent', border: 'none',
                        textAlign: 'left', padding: '20px 24px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                        cursor: 'pointer',
                      }}
                      aria-expanded={isOpen}
                    >
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>{faq.q}</span>
                      <i
                        className={`bi ${isOpen ? 'bi-dash-lg' : 'bi-plus-lg'}`}
                        style={{ color: 'var(--brand-primary)', flexShrink: 0, fontSize: '1rem' }}
                      ></i>
                    </button>
                    {isOpen && (
                      <div style={{ padding: '0 24px 20px', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="surface-panel p-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div className="icon-box">
                  <i className="bi bi-headset"></i>
                </div>
                <div>
                  <div style={{ fontWeight: 800 }}>Contact Us</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>We're here to help</div>
                </div>
              </div>
              <div className="summary-box">
                {[
                  { l: 'Live Chat', v: '24/7 Available' },
                  { l: 'Email', v: 'support@fastafasta.com' },
                  { l: 'Phone', v: '+44 20 8888 9999' },
                ].map(r => (
                  <div key={r.l} className="sum-row" style={{ marginBottom: 14 }}>
                    <span>{r.l}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)', textAlign: 'right', fontSize: '0.85rem' }}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
