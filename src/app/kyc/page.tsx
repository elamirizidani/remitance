'use client';

import { useState } from 'react';
import Link from 'next/link';

type Step = 'info' | 'upload' | 'submitted';

const DOC_TYPES = [
  { id: 'passport',         label: 'Passport' },
  { id: 'driving_licence',  label: 'Driving Licence' },
  { id: 'national_id',      label: 'National ID Card' },
];

export default function KycPage() {
  const [step, setStep]         = useState<Step>('info');
  const [docType, setDocType]   = useState('passport');
  const [frontFile, setFront]   = useState<File | null>(null);
  const [backFile, setBack]     = useState<File | null>(null);
  const [selfie, setSelfie]     = useState<File | null>(null);
  const [submitting, setSubmit] = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontFile || !selfie) {
      setError('Please upload your document (front) and a selfie.');
      return;
    }
    setError('');
    setSubmit(true);

    const form = new FormData();
    form.append('docType', docType);
    form.append('front', frontFile);
    if (backFile) form.append('back', backFile);
    form.append('selfie', selfie);

    const res = await fetch('/api/kyc/submit', { method: 'POST', body: form });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Submission failed. Please try again.');
      setSubmit(false);
      return;
    }

    setStep('submitted');
  };

  if (step === 'submitted') {
    return (
      <section className="page-section d-flex justify-content-center">
        <div style={{ maxWidth: 500, textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: '#ECFDF5', border: '2px solid #A7F3D0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', fontSize: '1.8rem', color: '#059669',
          }}>
            <i className="bi bi-check2-circle"></i>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 12 }}>Documents submitted</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            We&apos;re reviewing your identity documents. This usually takes <strong>1–2 business days</strong>.
            We&apos;ll email you when your account is verified.
          </p>
          <Link href="/" className="btn btn-premium btn-premium-primary">Back to Home</Link>
        </div>
      </section>
    );
  }

  if (step === 'info') {
    return (
      <section className="page-section">
        <div className="container">
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <span className="eyebrow mb-2 d-block">Identity Verification</span>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 12 }}>
              Verify your identity
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 40, fontSize: '1rem' }}>
              UK law (FCA regulations) requires us to verify the identity of all customers before they can send money.
              This is a one-time process.
            </p>

            <div className="row g-3 mb-5">
              {[
                { icon: 'bi-clock', title: 'Takes 2 minutes', desc: 'Upload your ID and a selfie — that\'s it.' },
                { icon: 'bi-shield-lock', title: 'Bank-level security', desc: 'Your documents are encrypted and never shared.' },
                { icon: 'bi-check-circle', title: 'Verified in 1–2 days', desc: 'We\'ll email you once your account is approved.' },
              ].map(c => (
                <div className="col-md-4" key={c.title}>
                  <div className="surface-panel p-3 h-100">
                    <div className="icon-box mb-3" style={{ width: 40, height: 40 }}>
                      <i className={`bi ${c.icon}`}></i>
                    </div>
                    <div style={{ fontWeight: 800, marginBottom: 4 }}>{c.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="surface-panel p-4 mb-4">
              <h2 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 16 }}>What you&apos;ll need</h2>
              <ul style={{ paddingLeft: 20, color: 'var(--text-muted)', lineHeight: 2 }}>
                <li>A valid passport, driving licence, or national ID card</li>
                <li>A clear selfie (no sunglasses or hats)</li>
                <li>Both sides of your document if it&apos;s a card</li>
              </ul>
            </div>

            <button
              onClick={() => setStep('upload')}
              className="btn btn-premium btn-premium-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '18px', fontSize: '1.05rem', fontWeight: 800 }}
            >
              <i className="bi bi-arrow-right-circle-fill"></i> Start Verification
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="container">
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <button
            onClick={() => setStep('info')}
            style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontWeight: 700, cursor: 'pointer', padding: 0, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <i className="bi bi-arrow-left"></i> Back
          </button>

          <span className="eyebrow mb-2 d-block">Step 2 of 2</span>
          <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 8 }}>
            Upload your documents
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
            Make sure photos are clear, well-lit, and all text is readable.
          </p>

          {error && (
            <div className="status-pill status-danger mb-4" style={{ width: '100%', justifyContent: 'flex-start' }}>
              <i className="bi bi-exclamation-circle"></i> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="surface-panel p-4 mb-3">
              <label className="form-label">Document type</label>
              <select
                className="input-premium mb-0"
                value={docType}
                onChange={e => setDocType(e.target.value)}
              >
                {DOC_TYPES.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </div>

            <div className="surface-panel p-4 mb-3">
              <FileUploadField
                label="Document — front"
                hint="Clear photo of the front of your ID"
                accept="image/*,.pdf"
                file={frontFile}
                onChange={setFront}
                required
              />
            </div>

            {docType !== 'passport' && (
              <div className="surface-panel p-4 mb-3">
                <FileUploadField
                  label="Document — back"
                  hint="Clear photo of the back of your ID"
                  accept="image/*,.pdf"
                  file={backFile}
                  onChange={setBack}
                />
              </div>
            )}

            <div className="surface-panel p-4 mb-4">
              <FileUploadField
                label="Selfie"
                hint="A clear photo of your face — no sunglasses"
                accept="image/*"
                file={selfie}
                onChange={setSelfie}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                background: submitting ? 'var(--border)' : 'var(--brand-accent)',
                border: 'none',
                color: submitting ? 'var(--text-subtle)' : 'white',
                borderRadius: '100px', padding: '18px',
                fontSize: '1.05rem', fontWeight: 800,
                cursor: submitting ? 'default' : 'pointer',
              }}
            >
              {submitting ? 'Submitting…' : 'Submit for Review'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function FileUploadField({
  label, hint, accept, file, onChange, required = false,
}: {
  label: string;
  hint: string;
  accept: string;
  file: File | null;
  onChange: (f: File | null) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="form-label">{label}{required && <span style={{ color: '#DC2626' }}> *</span>}</label>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 10px' }}>{hint}</p>
      <label style={{
        display: 'flex', alignItems: 'center', gap: 12,
        border: `2px dashed ${file ? 'var(--brand-primary)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)', padding: '16px 20px',
        cursor: 'pointer', background: file ? '#EFF6FF' : 'var(--bg-soft)',
        transition: 'var(--transition)',
      }}>
        <i className={`bi ${file ? 'bi-check-circle-fill' : 'bi-upload'}`} style={{ fontSize: '1.3rem', color: file ? 'var(--brand-primary)' : 'var(--text-subtle)', flexShrink: 0 }}></i>
        <span style={{ fontSize: '0.9rem', color: file ? 'var(--brand-primary)' : 'var(--text-muted)', fontWeight: file ? 700 : 400 }}>
          {file ? file.name : 'Click to upload or drag and drop'}
        </span>
        <input
          type="file"
          accept={accept}
          required={required}
          style={{ display: 'none' }}
          onChange={e => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  );
}
