import { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import BidModal from '../components/BidModal';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const CATEGORIES = ['All', 'Graphic Design', 'Web Design', 'Development', 'Canva', 'Marketing', 'Writing'];
const TABS = ['Best Matches', 'Most Recent', 'Saved Jobs'];



// ── Profile Card ─────────────────────────────────────────────────────────────
function ProfileCard({ user }) {
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '?';
  return (
    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 20, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15 }}>
          {initial}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{user?.name || 'Freelancer'}</div>
          <div style={{ color: '#f97316', fontSize: 13 }}>{user?.department || 'Freelancer'}</div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#6b7280' }}>
        Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
      </div>
    </div>
  );
}

// ── Bids Card ─────────────────────────────────────────────────────────────────
function BidsCard({ count }) {
  return (
    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 16, marginBottom: 16 }}>
      <span style={{ fontSize: 14, color: '#374151' }}>Bids Available: </span>
      <span style={{ color: '#f97316', fontWeight: 700 }}>{count ?? '—'}</span>
    </div>
  );
}

// ── Tag Badge ─────────────────────────────────────────────────────────────────
function TagBadge({ tag, active }) {
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 4, fontSize: 12, fontWeight: 500, cursor: 'pointer',
      background: active ? '#f97316' : '#f3f4f6',
      color: active ? '#fff' : '#374151',
      border: `1px solid ${active ? '#f97316' : '#e5e7eb'}`,
    }}>
      {tag}
    </span>
  );
}

// ── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ project, onSave, saved, onSelect, onOpenBid }) {
  const projectId = project._id || project.id;
  return (
    <div
      onClick={() => onSelect?.(projectId)}
      style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 20, marginBottom: 16, transition: 'box-shadow .2s, border-color .2s', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#f97316'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>
            Posted {project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
          </div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, color: '#111827', lineHeight: 1.4 }}>
            {project.title}
          </div>
          <div style={{ color: '#f97316', fontSize: 13, marginBottom: 10 }}>
            {project.category || 'General'} · Est. Budget: {project.budget ? `$${project.budget}` : '—'}
          </div>
          <p style={{ fontSize: 13.5, color: '#4b5563', lineHeight: 1.6, marginBottom: 12 }}>
            {project.description?.slice(0, 200)}{project.description?.length > 200 ? '…' : ''}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {(project.requiredSkills || project.tags || []).map(tag => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 12, color: '#6b7280' }}>
            <span>Proposals: {Array.isArray(project.bids) ? project.bids.length : 0}</span>
            {project.deadline && <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>}
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onSave(projectId); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, marginLeft: 16, flexShrink: 0, color: saved ? '#ef4444' : '#9ca3af' }}
        >
          {saved ? '❤️' : '🤍'}
        </button>
      </div>

      <button
        onClick={e => { e.stopPropagation(); onOpenBid({ projectId, projectTitle: project.title }); }}
        style={{ marginTop: 12, background: '#f97316', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 18px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
      >
        Place Bid
      </button>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function FreelancerDashboard({ onSelectProject }) {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const [projects, setProjects]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [activeTab, setActiveTab]     = useState('Best Matches');
  const [activeCategory, setActiveCategory] = useState('All');
  const [savedJobs, setSavedJobs]     = useState(new Set());
  const [bidModal, setBidModal]       = useState(null);
  const [contracts, setContracts]     = useState([]);

  const token = localStorage.getItem('sb_token');

  // Fetch all open projects from real API
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setProjects(data.projects || data || []);
    } catch (err) {
      setError('Could not load projects: ' + err.message);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // Fetch freelancer contracts
  const fetchContracts = useCallback(async () => {
    try {
      const res = await fetch('/api/projects/contracts/mine', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setContracts(data.contracts || []);
      }
    } catch { /* silent */ }
  }, [token]);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  // Search
  useEffect(() => {
    if (!search.trim()) {
      fetchProjects();
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/projects?search=${encodeURIComponent(search)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setProjects(data.projects || data || []);
      } catch { /* keep current list */ }
    }, 400);
    return () => clearTimeout(timer);
  }, [search]); // only re-run when search changes, NOT fetchProjects

  // Submit bid via real API
  const handleBid = async (projectId, amount, coverLetter) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/bids`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidAmount: Number(amount), coverLetter: coverLetter || '' }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || 'Failed to place bid');
      }
    } catch (err) {
      console.error('Bid failed:', err);
    }
  };

  const handleSave = id => {
    setSavedJobs(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleLogout = () => {
    auth?.logout?.();
    navigate('/login');
  };

  const filtered = projects.filter(p => {
    const skills = p.requiredSkills || p.tags || [];
    const matchCat = activeCategory === 'All' || skills.includes(activeCategory);
    const matchTab = activeTab === 'Saved Jobs' ? savedJobs.has(p._id || p.id) : true;
    return matchCat && matchTab;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>

        {/* Left Column */}
        <div>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 24 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for jobs"
              style={{ width: '100%', padding: '12px 44px 12px 16px', borderRadius: 8, border: '2px solid #8b5cf6', fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fff' }}
            />
            <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#8b5cf6', fontSize: 18 }}>🔍</span>
          </div>

          {/* Title + Tabs + Categories */}
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Jobs you might like</h2>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex' }}>
                {TABS.map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '7px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: activeTab === tab ? 700 : 400, color: activeTab === tab ? '#111827' : '#6b7280', borderBottom: activeTab === tab ? '2px solid #111827' : '2px solid transparent' }}>
                    {tab === 'Saved Jobs' ? `Saved Jobs (${savedJobs.size})` : tab}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: activeCategory === cat ? '#f97316' : '#f3f4f6', color: activeCategory === cat ? '#fff' : '#374151', border: `1px solid ${activeCategory === cat ? '#f97316' : '#e5e7eb'}` }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Project Cards */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af', fontSize: 15 }}>Loading projects...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#ef4444', fontSize: 14 }}>{error}</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>No projects found</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Check back later or try a different search</div>
            </div>
          ) : (
            filtered.map(p => (
              <ProjectCard
                key={p._id || p.id}
                project={p}
                onSave={handleSave}
                saved={savedJobs.has(p._id || p.id)}
                onSelect={onSelectProject}
                onOpenBid={setBidModal}
              />
            ))
          )}
        </div>

        {/* Right Sidebar */}
        <div>
          <ProfileCard user={auth?.user} />
          <BidsCard count={auth?.user?.bidsAvailable} />

          {/* My Contracts / Accepted Bids */}
          <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              📄 My Contracts
              {contracts.length > 0 && (
                <span style={{ background: '#f97316', color: '#fff', borderRadius: 999, fontSize: 11, fontWeight: 700, padding: '1px 7px' }}>
                  {contracts.length}
                </span>
              )}
            </div>
            {contracts.length === 0 ? (
              <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: '12px 0' }}>
                No contracts yet. Keep bidding!
              </div>
            ) : (
              contracts.map((c, i) => (
                <div key={c._id || i} style={{ borderRadius: 8, border: '1px solid #e5e7eb', padding: '10px 12px', marginBottom: 8, background: '#fafafa' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#111827', marginBottom: 4 }}>
                    {c.project?.title || 'Project'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>Client: {c.client?.name || '—'}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '2px 8px',
                      background: c.status === 'active' ? '#f0fdf4' : '#f9fafb',
                      color: c.status === 'active' ? '#16a34a' : '#6b7280',
                      border: `1px solid ${c.status === 'active' ? '#bbf7d0' : '#d1d5db'}`,
                    }}>
                      {c.status?.toUpperCase() || 'ACTIVE'}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f97316' }}>
                    💰 ${c.agreedAmount}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <BidModal
        open={!!bidModal}
        project={bidModal}
        onClose={() => setBidModal(null)}
        onSubmit={handleBid}
      />
    </div>
  );
}
