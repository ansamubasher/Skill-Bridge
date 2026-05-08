import React, { useState } from 'react';

const BidModal = ({ open, project, onClose, onSubmit }) => {
  const [amount, setAmount] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!open || !project) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount) return;
    setSubmitting(true);
    try {
      await onSubmit(project.projectId, amount);
      setDone(true);
      setTimeout(() => { setDone(false); setAmount(''); setCoverLetter(''); onClose(); }, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)', zIndex: 1000 }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 480, zIndex: 1001, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Bid Submitted!</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Good luck!</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Place a Bid</h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#9ca3af' }}>×</button>
            </div>

            <div style={{ background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>Project</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>{project.projectTitle}</div>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Your Bid Amount ($) *</label>
                <input type="number" placeholder="e.g. 250" value={amount} onChange={e => setAmount(e.target.value)} required
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#f97316'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Cover Letter <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea rows={4} placeholder="Why are you a great fit?" value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  onFocus={e => e.target.style.borderColor = '#f97316'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={onClose}
                  style={{ flex: 1, padding: 11, border: '1.5px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#374151' }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting || !amount}
                  style={{ flex: 2, padding: 11, background: submitting || !amount ? '#fdba74' : '#f97316', border: 'none', borderRadius: 8, cursor: submitting || !amount ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, color: '#fff' }}>
                  {submitting ? 'Submitting...' : 'Submit Bid'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </>
  );
};

export default BidModal;
