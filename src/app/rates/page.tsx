'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';

const chartData = [1620, 1635, 1628, 1640, 1632, 1637, 1634, 1625, 1639, 1642, 1635, 1634.5];

const competitors = [
  { name: 'High street cash pickup', rate: '1,601.20', fee: '£4.99', note: 'Cash collection' },
  { name: 'Standard bank wire', rate: '1,612.20', fee: '£2.90', note: '1-2 business days' },
  { name: 'Digital wallet average', rate: '1,620.50', fee: '£1.99', note: 'Minutes to hours' },
  { name: 'Remitly Pro', rate: '1,634.50', fee: '£0.00', note: 'Rate lock included', best: true },
];

export default function Rates() {
  const [target, setTarget] = useState('1650');
  const [alertSaved, setAlertSaved] = useState(false);
  const max = Math.max(...chartData);
  const min = Math.min(...chartData);
  const spread = useMemo(() => max - min, [max, min]);

  const saveAlert = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAlertSaved(true);
  };

  return (
    <div className="page-section">
      <div className="container">
        <div className="page-heading">
          <div>
            <span className="eyebrow mb-2">
              <i className="bi bi-graph-up-arrow"></i>
              Rates
            </span>
            <h1 className="display-5 mb-2">GBP to RWF exchange rate</h1>
            <p className="mb-0">Watch the market, compare total cost, and create alerts before you send.</p>
          </div>
          <Link href="/" className="btn btn-premium btn-premium-primary">
            <i className="bi bi-send"></i>
            Send at this rate
          </Link>
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="surface-panel p-4 p-lg-5 h-100">
              <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
                <div>
                  <span className="status-pill status-success mb-3">
                    <i className="bi bi-broadcast"></i>
                    Live market feed
                  </span>
                  <h2 className="h3 mb-1">1 GBP = 1,634.50 RWF</h2>
                  <p className="mb-0 small">Indicative rate before final lock at checkout.</p>
                </div>
                <div className="text-md-end">
                  <div className="h4 mb-1 text-mint">+0.12%</div>
                  <div className="small text-subtle">24 hour movement</div>
                </div>
              </div>

              <div className="chart-bars mb-3" aria-label="Twelve hour GBP to RWF rate chart">
                {chartData.map((value, index) => (
                  <div
                    key={`${value}-${index}`}
                    className="chart-bar"
                    title={`${value.toFixed(2)} RWF`}
                    style={{ height: `${((value - min + 4) / (spread + 8)) * 100}%` }}
                  ></div>
                ))}
              </div>

              <div className="d-flex justify-content-between text-subtle small">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>Now</span>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="surface-panel p-4 mb-4">
              <span className="eyebrow mb-3">
                <i className="bi bi-bell"></i>
                Rate alert
              </span>
              <h2 className="h4 mb-2">Get notified when the rate improves.</h2>
              <p className="small mb-4">Set a target and we will flag the send screen when GBP/RWF reaches it.</p>
              <form onSubmit={saveAlert}>
                <label htmlFor="rateTarget" className="form-label">Target rate</label>
                <div className="d-flex gap-2">
                  <input
                    id="rateTarget"
                    className="form-control input-premium"
                    value={target}
                    onChange={(event) => {
                      setTarget(event.target.value.replace(/[^0-9.]/g, ''));
                      setAlertSaved(false);
                    }}
                    inputMode="decimal"
                  />
                  <button className="btn btn-premium btn-premium-primary btn-icon" type="submit" aria-label="Save rate alert">
                    <i className="bi bi-check2"></i>
                  </button>
                </div>
              </form>
              {alertSaved && (
                <div className="status-pill status-success mt-3">
                  <i className="bi bi-check2-circle"></i>
                  Alert saved
                </div>
              )}
            </div>

            <div className="surface-panel-soft p-4">
              <h2 className="h5 mb-3">Rate protection</h2>
              <div className="d-grid gap-3">
                <div className="d-flex gap-3">
                  <span className="icon-box mint">
                    <i className="bi bi-lock"></i>
                  </span>
                  <div>
                    <h3 className="h6 mb-1">30 minute lock</h3>
                    <p className="small mb-0">Your quoted rate stays fixed while you complete payment.</p>
                  </div>
                </div>
                <div className="d-flex gap-3">
                  <span className="icon-box gold">
                    <i className="bi bi-calculator"></i>
                  </span>
                  <div>
                    <h3 className="h6 mb-1">Total cost view</h3>
                    <p className="small mb-0">Compare rate, fee, delivery speed, and recipient total together.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="page-section pb-0">
          <div className="page-heading">
            <div>
              <span className="eyebrow mb-2">
                <i className="bi bi-columns-gap"></i>
                Comparison
              </span>
              <h2 className="h1 mb-0">Know the real cost before sending.</h2>
            </div>
          </div>

          <div className="row g-3">
            {competitors.map((item) => (
              <div className="col-md-6 col-xl-3" key={item.name}>
                <div className={`surface-panel-soft p-4 h-100 ${item.best ? 'border-info' : ''}`}>
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                    <h3 className={`h6 mb-0 ${item.best ? 'text-cyan' : ''}`}>{item.name}</h3>
                    {item.best && <span className="status-pill status-info">Best value</span>}
                  </div>
                  <div className="d-grid gap-2 small">
                    <div className="d-flex justify-content-between">
                      <span className="text-subtle">Rate</span>
                      <span className="fw-bold text-white">{item.rate}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-subtle">Fee</span>
                      <span className={item.best ? 'fw-bold text-mint' : 'fw-bold text-white'}>{item.fee}</span>
                    </div>
                    <div className="text-subtle">{item.note}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
