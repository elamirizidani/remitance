'use client';

import { useState } from 'react';

const faqs = [
  {
    id: 'delivery',
    q: 'How long does delivery take?',
    a: 'Mobile money usually arrives in minutes. Bank deposits can take the same or next business day.',
  },
  {
    id: 'fees',
    q: 'Where do I see fees?',
    a: 'The send form shows the fee, total to pay, exchange rate, and recipient amount before checkout.',
  },
  {
    id: 'edit',
    q: 'Can I use a new recipient?',
    a: 'Yes. Type any recipient name and phone number on the Send page.',
  },
];

export default function Help() {
  const [openFaq, setOpenFaq] = useState('delivery');

  return (
    <section className="page-section">
      <div className="container">
        <div className="page-heading">
          <div>
            <span className="eyebrow mb-2">Help</span>
            <h1 className="display-5 mb-2">Support</h1>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="surface-panel overflow-hidden">
              {faqs.map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <div className="border-bottom border-white border-opacity-10" key={faq.id}>
                    <button
                      type="button"
                      className="w-100 bg-transparent border-0 text-start p-4 d-flex justify-content-between align-items-center gap-3"
                      onClick={() => setOpenFaq(isOpen ? '' : faq.id)}
                      aria-expanded={isOpen}
                      aria-controls={`${faq.id}-panel`}
                    >
                      <span className="fw-bold text-white">{faq.q}</span>
                      <i className={`bi ${isOpen ? 'bi-dash-lg' : 'bi-plus-lg'} text-cyan`}></i>
                    </button>
                    {isOpen && (
                      <div id={`${faq.id}-panel`} className="px-4 pb-4">
                        <p className="mb-0">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="surface-panel p-4">
              <h2 className="h5 mb-3">Contact</h2>
              <div className="d-grid gap-2 small">
                <div className="d-flex justify-content-between gap-3">
                  <span className="text-subtle">Chat</span>
                  <span className="fw-bold text-white">24/7</span>
                </div>
                <div className="d-flex justify-content-between gap-3">
                  <span className="text-subtle">Email</span>
                  <span className="fw-bold text-white text-end">support@fastafasta.com</span>
                </div>
                <div className="d-flex justify-content-between gap-3">
                  <span className="text-subtle">Phone</span>
                  <span className="fw-bold text-white">+44 20 8888 9999</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
