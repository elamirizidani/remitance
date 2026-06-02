'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

type Recipient = {
  id: number;
  name: string;
  phone: string;
  method: string;
};

const emptyRecipient: Omit<Recipient, 'id'> = {
  name: '',
  phone: '+250 ',
  method: 'MTN MoMo',
};

export default function Recipients() {
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: 1, name: 'Jean Damascene', phone: '+250 788 123 456', method: 'MTN MoMo' },
    { id: 2, name: 'Alice Kamikazi', phone: '+250 722 987 654', method: 'Bank deposit' },
    { id: 3, name: 'Robert Mugisha', phone: '+250 733 111 222', method: 'Airtel Money' },
  ]);
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
    setFormData({ name: recipient.name, phone: recipient.phone, method: recipient.method });
    setModalOpen(true);
  };

  const saveRecipient = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editing) {
      setRecipients((current) => current.map((recipient) => recipient.id === editing.id ? { ...recipient, ...formData } : recipient));
    } else {
      const nextId = recipients.length > 0 ? Math.max(...recipients.map((recipient) => recipient.id)) + 1 : 1;
      setRecipients((current) => [...current, { id: nextId, ...formData }]);
    }
    setModalOpen(false);
  };

  return (
    <section className="page-section">
      <div className="container">
        <div className="page-heading">
          <div>
            <span className="eyebrow mb-2">Recipients</span>
            <h1 className="display-5 mb-2">Saved people</h1>
          </div>
          <button className="btn btn-premium btn-premium-primary" onClick={openAdd}>Add recipient</button>
        </div>

        <div className="surface-panel overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 table-premium">
              <thead>
                <tr>
                  <th className="ps-4 py-3">Name</th>
                  <th className="py-3">Phone</th>
                  <th className="py-3">Method</th>
                  <th className="py-3 text-end pe-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {recipients.map((recipient) => (
                  <tr key={recipient.id}>
                    <td className="ps-4 py-4 fw-bold text-white">{recipient.name}</td>
                    <td className="py-4 text-subtle">{recipient.phone}</td>
                    <td className="py-4 text-subtle">{recipient.method}</td>
                    <td className="py-4 text-end pe-4">
                      <div className="d-inline-flex gap-2">
                        <Link href="/" className="btn btn-premium btn-premium-primary py-2 px-3">Send</Link>
                        <button className="btn btn-premium btn-premium-secondary py-2 px-3" onClick={() => openEdit(recipient)}>Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {modalOpen && (
          <div className="modal-backdrop-custom" role="dialog" aria-modal="true" aria-labelledby="recipientTitle" onClick={() => setModalOpen(false)}>
            <form className="modal-panel-custom surface-panel p-4 animate-fade-in" onSubmit={saveRecipient} onClick={(event) => event.stopPropagation()}>
              <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                <div>
                  <span className="eyebrow mb-2">Recipient</span>
                  <h2 id="recipientTitle" className="h4 mb-0">{editing ? 'Edit recipient' : 'Add recipient'}</h2>
                </div>
                <button type="button" className="btn btn-premium btn-premium-secondary btn-icon" aria-label="Close recipient form" onClick={() => setModalOpen(false)}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <div className="row g-3">
                <div className="col-12">
                  <label htmlFor="recipientName" className="form-label">Name</label>
                  <input id="recipientName" className="form-control input-premium" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} required />
                </div>
                <div className="col-md-6">
                  <label htmlFor="recipientPhone" className="form-label">Phone</label>
                  <input id="recipientPhone" className="form-control input-premium" value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} required />
                </div>
                <div className="col-md-6">
                  <label htmlFor="payoutMethod" className="form-label">Method</label>
                  <select id="payoutMethod" className="form-select input-premium" value={formData.method} onChange={(event) => setFormData({ ...formData, method: event.target.value })}>
                    <option>MTN MoMo</option>
                    <option>Airtel Money</option>
                    <option>Bank deposit</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-premium btn-premium-primary w-100 mt-4" type="submit">Save</button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
