'use client';

import { useMemo, useState } from 'react';

const faqs = [
  {
    id: 'delivery',
    q: 'How long does a transfer to Rwanda take?',
    a: 'MTN MoMo and Airtel Money transfers usually arrive within minutes. Bank deposits can arrive the same day or next business day depending on the receiving bank.',
  },
  {
    id: 'fees',
    q: 'How are fees and exchange rates shown?',
    a: 'The quote screen shows the fee, locked exchange rate, total to pay, and exact RWF amount before checkout. The final receipt repeats the same breakdown.',
  },
  {
    id: 'security',
    q: 'How is my payment protected?',
    a: 'We use encrypted checkout, payment screening, recipient verification, and identity checks required for regulated international money transfer.',
  },
  {
    id: 'cancel',
    q: 'Can I cancel or change a transfer?',
    a: 'You can request cancellation while a transfer is still in review. Once funds are paid to a recipient wallet or bank account, cancellation may no longer be possible.',
  },
  {
    id: 'recipient',
    q: 'What if I entered the wrong recipient details?',
    a: 'Open Activity immediately and contact support with your transfer reference. We will try to pause delivery if the payout partner has not completed it.',
  },
];

const supportActions = [
  { icon: 'bi-chat-dots', title: 'Live chat', desc: 'Fastest help for active transfers.', action: 'Start chat' },
  { icon: 'bi-telephone', title: 'Phone support', desc: '+44 20 8888 9999, open 24/7.', action: 'Call support' },
  { icon: 'bi-envelope', title: 'Email team', desc: 'priority@remitlypromax.com', action: 'Email us' },
];

export default function Help() {
  const [query, setQuery] = useState('');
  const [openFaq, setOpenFaq] = useState('delivery');

  const filteredFaqs = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return faqs;
    return faqs.filter((faq) => `${faq.q} ${faq.a}`.toLowerCase().includes(normalized));
  }, [query]);

  return (
    <div>
      <section className="page-section border-bottom border-white border-opacity-10">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <span className="eyebrow justify-content-center mb-3">
                <i className="bi bi-headset"></i>
                Help center
              </span>
              <h1 className="display-4 mb-3">Support for every step of your transfer.</h1>
              <p className="fs-5 mb-4">Search guidance on delivery, rates, security, recipients, and payment reviews.</p>
              <div className="quote-field d-flex gap-2 align-items-center">
                <i className="bi bi-search text-subtle fs-5 ms-2"></i>
                <input
                  type="search"
                  className="form-control border-0 bg-transparent shadow-none text-white py-2"
                  placeholder="Search help topics"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="Search help topics"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="page-heading">
                <div>
                  <span className="eyebrow mb-2">
                    <i className="bi bi-question-circle"></i>
                    Common questions
                  </span>
                  <h2 className="h1 mb-0">Answers without the maze.</h2>
                </div>
              </div>

              <div className="surface-panel overflow-hidden">
                {filteredFaqs.map((faq) => {
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
                        <span className="fw-bold text-white fs-5">{faq.q}</span>
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
                {filteredFaqs.length === 0 && (
                  <div className="p-4">
                    <p className="mb-0">No matching articles found. Contact support and include your transfer reference if this is urgent.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="col-lg-4">
              <div className="surface-panel p-4 mb-4">
                <span className="eyebrow mb-3">
                  <i className="bi bi-life-preserver"></i>
                  Contact support
                </span>
                <div className="d-grid gap-3">
                  {supportActions.map((item) => (
                    <button className="rail-row text-start" key={item.title}>
                      <span className="d-flex align-items-center gap-3">
                        <span className="icon-box brand">
                          <i className={`bi ${item.icon}`}></i>
                        </span>
                        <span>
                          <span className="d-block fw-bold text-white">{item.title}</span>
                          <span className="small text-subtle">{item.desc}</span>
                        </span>
                      </span>
                      <span className="small fw-bold text-cyan">{item.action}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="surface-panel-soft p-4 mb-4">
                <span className="eyebrow mb-3">
                  <i className="bi bi-shield-lock"></i>
                  Security checklist
                </span>
                <div className="timeline">
                  {[
                    ['Never share one-time passcodes', 'Support will not ask for your card PIN or wallet PIN.'],
                    ['Check recipient details', 'Confirm names and phone numbers before payment.'],
                    ['Use Activity for status', 'Official delivery updates appear in your transfer history.'],
                  ].map(([title, desc]) => (
                    <div className="timeline-row" key={title}>
                      <span className="timeline-dot">
                        <i className="bi bi-check2"></i>
                      </span>
                      <div>
                        <h3 className="h6 mb-1">{title}</h3>
                        <p className="small mb-0">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="surface-panel-soft p-4">
                <h2 className="h5 mb-2">Emergency transfer issue?</h2>
                <p className="small mb-3">Open a support case with your transfer reference so the team can check payout status immediately.</p>
                <button className="btn btn-premium btn-premium-primary w-100">
                  <i className="bi bi-exclamation-circle"></i>
                  Report issue
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
