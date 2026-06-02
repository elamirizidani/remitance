'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

const rows = [
  { name: 'Fasta fasta', rate: '1,634.50', fee: '£0.00', best: true },
  { name: 'Digital wallet average', rate: '1,620.50', fee: '£1.99' },
  { name: 'Bank wire', rate: '1,612.20', fee: '£2.90' },
];

export default function Rates() {
  const [target, setTarget] = useState('1650');
  const [saved, setSaved] = useState(false);

  const saveAlert = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <section className="page-section">
      <div className="container">
        <div className="page-heading">
          <div>
            <span className="eyebrow mb-2">Rates</span>
            <h1 className="display-5 mb-2">GBP/RWF</h1>
            <p className="mb-0">1 GBP = <span className="text-cyan fw-bold">1,634.50 RWF</span></p>
          </div>
          <Link href="/" className="btn btn-premium btn-premium-primary">Send money</Link>
        </div>

        <div className="row g-4">
          <div className="col-lg-7">
            <div className="surface-panel overflow-hidden">
              <div className="table-responsive">
                <table className="table align-middle mb-0 table-premium">
                  <thead>
                    <tr>
                      <th className="ps-4 py-3">Provider</th>
                      <th className="py-3">Rate</th>
                      <th className="py-3 text-end pe-4">Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.name}>
                        <td className="ps-4 py-4">
                          <span className="fw-bold text-white">{row.name}</span>
                          {row.best && <span className="status-pill status-success ms-2">Best</span>}
                        </td>
                        <td className="py-4 text-subtle">{row.rate}</td>
                        <td className="py-4 text-end pe-4 text-subtle">{row.fee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <form className="surface-panel p-4 h-100" onSubmit={saveAlert}>
              <label htmlFor="rateTarget" className="form-label">Rate alert</label>
              <div className="d-flex gap-2">
                <input
                  id="rateTarget"
                  className="form-control input-premium"
                  value={target}
                  onChange={(event) => {
                    setTarget(event.target.value.replace(/[^0-9.]/g, ''));
                    setSaved(false);
                  }}
                  inputMode="decimal"
                />
                <button className="btn btn-premium btn-premium-primary px-4" type="submit">Save</button>
              </div>
              {saved && <div className="status-pill status-success mt-3">Alert saved</div>}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
