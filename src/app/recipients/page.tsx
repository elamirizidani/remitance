'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

type Recipient = {
  id: number;
  name: string;
  phone: string;
  method: string;
  relationship: string;
  verified: boolean;
  lastSent: string;
};

const initialRecipients: Recipient[] = [
  { id: 1, name: 'Jean Damascene', phone: '+250 788 123 456', method: 'MTN MoMo', relationship: 'Family', verified: true, lastSent: '12 May 2026' },
  { id: 2, name: 'Alice Kamikazi', phone: '+250 722 987 654', method: 'Bank deposit', relationship: 'Household', verified: true, lastSent: '14 May 2026' },
  { id: 3, name: 'Robert Mugisha', phone: '+250 733 111 222', method: 'Airtel Money', relationship: 'Family', verified: false, lastSent: '10 May 2026' },
];

const emptyRecipient: Omit<Recipient, 'id'> = {
  name: '',
  phone: '+250 ',
  method: 'MTN MoMo',
  relationship: 'Family',
  verified: true,
  lastSent: 'Not yet',
};

export default function Recipients() {
  const [recipients, setRecipients] = useState(initialRecipients);
  const [editing, setEditing] = useState<Recipient | null>(null);
  const [formData, setFormData] = useState(emptyRecipient);
  const [modalOpen, setModalOpen] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setFormData(emptyRecipient);
    setModalOpen(true);
  };

  const openEdit = (recipient: Recipient) => {
    setEditing(recipient);
    setFormData({
      name: recipient.name,
      phone: recipient.phone,
      method: recipient.method,
      relationship: recipient.relationship,
      verified: recipient.verified,
      lastSent: recipient.lastSent,
    });
    setModalOpen(true);
  };

  const saveRecipient = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editing) {
      setRecipients((current) => current.map((recipient) => (
        recipient.id === editing.id ? { ...recipient, ...formData } : recipient
      )));
    } else {
      const nextId = recipients.length > 0 ? Math.max(...recipients.map((recipient) => recipient.id)) + 1 : 1;
      setRecipients((current) => [...current, { id: nextId, ...formData }]);
    }

    setEditing(null);
    setModalOpen(false);
  };

  const deleteRecipient = (id: number) => {
    setRecipients((current) => current.filter((recipient) => recipient.id !== id));
  };

  return (
    <div className="page-section">
      <div className="container">
        <div className="page-heading">
          <div>
            <span className="eyebrow mb-2">
              <i className="bi bi-person-check"></i>
              Recipients
            </span>
            <h1 className="display-5 mb-2">Trusted people and payout details</h1>
            <p className="mb-0">Keep recipient information verified so repeat transfers stay fast and low-friction.</p>
          </div>
          <button className="btn btn-premium btn-premium-primary" onClick={openAdd}>
            <i className="bi bi-person-plus"></i>
            Add recipient
          </button>
        </div>

        <div className="metric-grid mb-4">
          <div className="metric-tile">
            <div className="text-subtle small mb-2">Saved recipients</div>
            <div className="h4 mb-1">{recipients.length}</div>
            <div className="small text-cyan">Ready for repeat transfers</div>
          </div>
          <div className="metric-tile">
            <div className="text-subtle small mb-2">Verified</div>
            <div className="h4 mb-1">{recipients.filter((recipient) => recipient.verified).length}</div>
            <div className="small text-mint">Identity checks complete</div>
          </div>
          <div className="metric-tile">
            <div className="text-subtle small mb-2">Payout coverage</div>
            <div className="h4 mb-1">3 rails</div>
            <div className="small text-gold">MTN, Airtel, bank</div>
          </div>
        </div>

        {recipients.length > 0 ? (
          <div className="row g-4">
            {recipients.map((recipient) => (
              <div className="col-md-6 col-xl-4" key={recipient.id}>
                <div className="surface-panel p-4 h-100">
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div className="d-flex align-items-center gap-3">
                      <span className="icon-box brand fw-bold">{recipient.name.charAt(0)}</span>
                      <div>
                        <h2 className="h5 mb-1">{recipient.name}</h2>
                        <div className="small text-subtle">{recipient.relationship}</div>
                      </div>
                    </div>
                    <span className={`status-pill ${recipient.verified ? 'status-success' : 'status-warning'}`}>
                      <i className={`bi ${recipient.verified ? 'bi-check2-circle' : 'bi-exclamation-triangle'}`}></i>
                      {recipient.verified ? 'Verified' : 'Review'}
                    </span>
                  </div>

                  <div className="d-grid gap-3 mb-4">
                    <div className="d-flex justify-content-between gap-3">
                      <span className="text-subtle small">Phone</span>
                      <span className="text-white fw-bold small">{recipient.phone}</span>
                    </div>
                    <div className="d-flex justify-content-between gap-3">
                      <span className="text-subtle small">Payout</span>
                      <span className="text-white fw-bold small">{recipient.method}</span>
                    </div>
                    <div className="d-flex justify-content-between gap-3">
                      <span className="text-subtle small">Last sent</span>
                      <span className="text-white fw-bold small">{recipient.lastSent}</span>
                    </div>
                  </div>

                  <div className="d-grid d-sm-flex gap-2">
                    <Link href="/" className="btn btn-premium btn-premium-primary flex-fill">
                      <i className="bi bi-send"></i>
                      Send
                    </Link>
                    <button className="btn btn-premium btn-premium-secondary btn-icon" aria-label={`Edit ${recipient.name}`} onClick={() => openEdit(recipient)}>
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className="btn btn-premium btn-premium-secondary btn-icon" aria-label={`Delete ${recipient.name}`} onClick={() => deleteRecipient(recipient.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="surface-panel p-5 text-center">
            <span className="icon-box brand mx-auto mb-4">
              <i className="bi bi-person-plus"></i>
            </span>
            <h2 className="h3 mb-2">No recipients yet</h2>
            <p className="mb-4">Add a recipient once, then reuse verified details for faster future transfers.</p>
            <button className="btn btn-premium btn-premium-primary" onClick={openAdd}>
              Add your first recipient
            </button>
          </div>
        )}

        {modalOpen && (
          <div className="modal-backdrop-custom" role="dialog" aria-modal="true" aria-labelledby="recipientTitle" onClick={() => setModalOpen(false)}>
            <form className="modal-panel-custom surface-panel p-4 p-md-5 animate-fade-in" onSubmit={saveRecipient} onClick={(event) => event.stopPropagation()}>
              <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                <div>
                  <span className="eyebrow mb-2">Recipient profile</span>
                  <h2 id="recipientTitle" className="h3 mb-0">{editing ? 'Edit recipient' : 'Add recipient'}</h2>
                </div>
                <button type="button" className="btn btn-premium btn-premium-secondary btn-icon" aria-label="Close recipient form" onClick={() => setModalOpen(false)}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <div className="row g-3">
                <div className="col-12">
                  <label htmlFor="recipientName" className="form-label">Full name</label>
                  <input
                    id="recipientName"
                    className="form-control input-premium"
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                    placeholder="Recipient name"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="recipientPhone" className="form-label">Mobile number</label>
                  <input
                    id="recipientPhone"
                    className="form-control input-premium"
                    value={formData.phone}
                    onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                    placeholder="+250 7xx xxx xxx"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="relationship" className="form-label">Relationship</label>
                  <select
                    id="relationship"
                    className="form-select input-premium"
                    value={formData.relationship}
                    onChange={(event) => setFormData({ ...formData, relationship: event.target.value })}
                  >
                    <option>Family</option>
                    <option>Household</option>
                    <option>Education</option>
                    <option>Business</option>
                  </select>
                </div>
                <div className="col-12">
                  <label htmlFor="payoutMethod" className="form-label">Preferred payout method</label>
                  <select
                    id="payoutMethod"
                    className="form-select input-premium"
                    value={formData.method}
                    onChange={(event) => setFormData({ ...formData, method: event.target.value })}
                  >
                    <option>MTN MoMo</option>
                    <option>Airtel Money</option>
                    <option>Bank deposit</option>
                  </select>
                </div>
              </div>

              <div className="d-grid d-sm-flex gap-2 mt-4">
                <button className="btn btn-premium btn-premium-primary flex-fill" type="submit">
                  <i className="bi bi-check2-circle"></i>
                  Save recipient
                </button>
                <button className="btn btn-premium btn-premium-secondary flex-fill" type="button" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
