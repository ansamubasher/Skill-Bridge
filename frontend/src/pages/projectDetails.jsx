import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

const getToken = () => localStorage.getItem('sb_token');



function SkillTag({ label, mandatory }) {
  return (
    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: mandatory ? '#f97316' : '#fff', color: mandatory ? '#fff' : '#374151', border: `1px solid ${mandatory ? '#f97316' : '#d1d5db'}`, display: 'inline-block', margin: '3px 4px 3px 0' }}>
      {label}
    </span>
  );
}

function Skeleton({ h = 16, w = '100%', mb = 10 }) {
  return <div style={{ height: h, width: w, background: '#f3f4f6', borderRadius: 6, marginBottom: mb, animation: 'pulse 1.5s infinite' }} />;
}

export default function ProjectDetail({ projectId, onBack }) {
  const [project, setProject]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [bidding, setBidding]   = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMsg, setBidMsg]     = useState('');
  const [bidStatus, setBidStatus] = useState(null); // 'success' | 'error' | null
  const [saved, setSaved]       = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();
        setProject(data.project || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId]);

  const handleBid = async () => {
    if (!bidAmount) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/bids`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidAmount: Number(bidAmount), coverLetter: bidMsg }),
      });
      setBidStatus(res.ok ? 'success' : 'error');
    } catch {
      setBidStatus('error');
    } finally {
      setBidding(false);
      setBidAmount('');
      setBidMsg('');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: "'Inter', sans-serif" }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
      <Navbar />

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 20px', display: 'grid', gridTemplateColumns: '1fr 260px', gap: 24, alignItems: 'start' }}>

        {/* ── Main Content ── */}
        <div>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f97316', fontSize: 13, fontWeight: 600, marginBottom: 16, padding: 0 }}>
            ← Back to Jobs
          </button>

          <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 28, marginBottom: 20 }}>
            {loading ? (
              <><Skeleton h={28} w="70%" mb={12} /><Skeleton h={14} w="30%" mb={20} /><Skeleton h={14} mb={8} /><Skeleton h={14} mb={8} /><Skeleton h={14} w="80%" /></>
            ) : error ? (
              <div style={{ color: '#ef4444', padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
                Could not load project: {error}
              </div>
            ) : (
              <>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{project.title}</h1>
                <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 18 }}>
                  Posted {project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Summary</div>
                {project.description?.split('\n\n').map((para, i) => (
                  <p key={i} style={{ fontSize: 13.5, color: '#4b5563', lineHeight: 1.7, marginBottom: 12 }}>{para}</p>
                ))}
              </>
            )}
          </div>

          {!loading && !error && project && (
            <>
              {/* Project Info */}
              <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 24, marginBottom: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
                  {[
                    { label: 'Project Budget', value: project.budget ? `$${project.budget}` : '—' },
                    { label: 'Category', value: project.category || '—' },
                    { label: 'Deadline', value: project.deadline ? new Date(project.deadline).toLocaleDateString() : '—' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              {(project.requiredSkills?.length > 0) && (
                <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 24, marginBottom: 20 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Skills Required</div>
                  <div>{project.requiredSkills.map(s => <SkillTag key={s} label={s} mandatory />)}</div>
                </div>
              )}

              {/* Job Activity */}
              <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 24 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 10 }}>Job Activity</div>
                <div style={{ fontSize: 13.5, color: '#4b5563' }}>
                  {Array.isArray(project.bids) ? project.bids.length : 0} proposals submitted so far
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 20, marginBottom: 16 }}>
            {bidStatus === 'success' && <div style={{ color: '#22c55e', fontWeight: 600, fontSize: 13, marginBottom: 10 }}>✅ Bid submitted!</div>}
            {bidStatus === 'error'   && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 10 }}>Failed to submit. Try again.</div>}

            {bidding ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input type="number" placeholder="Your price ($)" value={bidAmount} onChange={e => setBidAmount(e.target.value)}
                  style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 12px', fontSize: 13, outline: 'none' }} />
                <textarea placeholder="Cover message (optional)" value={bidMsg} onChange={e => setBidMsg(e.target.value)} rows={3}
                  style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 12px', fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit' }} />
                <button onClick={handleBid} style={{ background: '#f97316', color: '#fff', border: 'none', borderRadius: 6, padding: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  Submit Bid
                </button>
                <button onClick={() => setBidding(false)} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: 8, fontSize: 13, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => { setBidding(true); setBidStatus(null); }}
                  style={{ width: '100%', background: '#f97316', color: '#fff', border: 'none', borderRadius: 6, padding: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 10 }}>
                  APPLY
                </button>
                <button onClick={() => setSaved(s => !s)}
                  style={{ width: '100%', background: saved ? '#fef3e2' : '#fff', color: saved ? '#f97316' : '#374151', border: '1px solid #e5e7eb', borderRadius: 6, padding: 11, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  {saved ? '✓ SAVED' : 'SAVE JOB'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
