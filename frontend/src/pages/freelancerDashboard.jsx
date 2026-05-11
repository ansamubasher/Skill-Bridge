import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getMyProfile } from "../services/api";
import BidModal from "../components/BidModal";
import axiosInstance from "../api/axiosInstance";



const CATEGORIES = ["All", "Graphic Design", "Web Design", "Development", "Canva", "Marketing", "Writing"];
const TABS = ["Best Matches", "Most Recent", "Saved Jobs"];

// ── Sub-components ──────────────────────────────────────────────

function Navbar({ activeNav, setActiveNav }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      axiosInstance.get('/notifications')
        .then(res => {
          if (res.data?.success) setNotifications(res.data.notifications);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await axiosInstance.patch(`/notifications/${notif._id}/read`);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      }
      setShowNotifications(false);
      if (notif.link) navigate(notif.link);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <span style={{ fontSize: 22, fontWeight: 700 }}>
          <span style={{ color: "#f97316" }}>Skill</span>
          <span style={{ color: "#1f2937" }}>Bridge</span>
        </span>
        {["Find work", "Deliver work"].map((item) => (
          <button 
            key={item} 
            onClick={() => setActiveNav && setActiveNav(item)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: activeNav === item ? "#f97316" : "#374151", fontWeight: activeNav === item ? 600 : 400 }}>
            {item} ▾
          </button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ position: 'relative' }}>
          <span 
            style={{ fontSize: 18, cursor: "pointer" }}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔
          </span>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              background: '#ef4444', color: '#fff', fontSize: 10,
              fontWeight: 700, padding: '2px 6px', borderRadius: 10
            }}>
              {unreadCount}
            </span>
          )}

          {showNotifications && (
            <div style={{
              position: 'absolute', top: 40, right: 0, width: 320,
              background: '#fff', border: '1px solid #e5e7eb',
              borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              maxHeight: 400, overflowY: 'auto', zIndex: 100
            }}>
              <div style={{ padding: 12, borderBottom: '1px solid #f3f4f6', fontWeight: 700, color: '#1f2937' }}>
                Notifications
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding: 16, textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
                  No notifications yet
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {notifications.map(n => (
                    <div
                      key={n._id}
                      onClick={() => handleNotificationClick(n)}
                      style={{
                        padding: 12, cursor: 'pointer', borderBottom: '1px solid #f9fafb',
                        background: !n.isRead ? '#fff7ed' : 'transparent',
                        transition: 'background 0.2s'
                      }}
                    >
                      <p style={{ fontSize: 14, color: '#1f2937', margin: 0 }}>{n.message}</p>
                      <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0 0' }}>
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <button 
          onClick={handleLogout}
          style={{ background: "none", border: "1px solid #e5e7eb", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 14, color: "#374151", fontWeight: 500 }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

function ProfileCard({ profile }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    getMyProfile().then(res => setProfileData(res.data.profile)).catch(() => {});
  }, []);

  const calculateCompletion = () => {
    let score = 20; // Base score for having an account
    if (user?.name) score += 20;
    if (user?.department) score += 20;
    if (profileData?.bio) score += 20;
    if (profileData?.skills && profileData.skills.length > 0) score += 20;
    return score > 100 ? 100 : score;
  };

  const completion = calculateCompletion();

  return (
    <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 20, marginBottom: 16, position: "relative" }}>
      {/* Edit Icon */}
      <div 
        onClick={() => navigate('/profile')} 
        style={{ position: "absolute", top: 16, right: 16, cursor: "pointer", fontSize: 16, color: "#9ca3af", padding: 4 }}
        title="Edit Profile"
      >
        ✏️
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15 }}>
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>{user?.name || "Loading..."}</div>
          {user?.department && <div style={{ color: "#f97316", fontSize: 13 }}>{user.department}</div>}
          <div onClick={() => navigate('/profile')} style={{ color: "#6b7280", fontSize: 12, textDecoration: "underline", cursor: "pointer", marginTop: 2 }}>View Profile</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ height: 6, flex: 1, background: "#e5e7eb", borderRadius: 4, overflow: "hidden", marginRight: 8 }}>
          <div style={{ width: `${completion}%`, height: "100%", background: "#f97316", borderRadius: 4, transition: "width 0.5s ease" }} />
        </div>
        <span style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>{completion}%</span>
      </div>
      
      {/* Reminder Banner if incomplete */}
      {completion < 100 && (
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 6, padding: "8px 12px", marginTop: 12 }}>
          <div style={{ fontSize: 12, color: "#c2410c", fontWeight: 600, display: "flex", alignItems: "flex-start", gap: 6 }}>
            <span>⚠️</span>
            <span>
              Your profile is incomplete. 
              <span onClick={() => navigate('/profile')} style={{ textDecoration: "underline", cursor: "pointer", marginLeft: 4 }}>Complete it now</span> to attract more clients!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Removed BidsCard



function TagBadge({ tag, active }) {
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 4, fontSize: 12, fontWeight: 500, cursor: "pointer",
      background: active ? "#f97316" : "#f3f4f6",
      color: active ? "#fff" : "#374151",
      border: `1px solid ${active ? "#f97316" : "#e5e7eb"}`,
    }}>
      {tag}
    </span>
  );
}

function ProjectCard({ project, onBid, onSave, saved, onSelect , onOpenBid}) {

const [bidModal, setBidModal] = useState(null);
// bidModal = { projectId, projectTitle }
  const [bidding, setBidding] = useState(false);
  const [amount, setAmount] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleBid = async (e) => {
    e.stopPropagation();
    if (!amount) return;
    await onBid(project.id || project._id, amount);
    setSubmitted(true);
    setBidding(false);
  };

  const projectId = project.id || project._id;

  return (
    <div
      onClick={() => onSelect?.(projectId)}
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: 20,
        marginBottom: 16,
        transition: "box-shadow .2s, border-color .2s",
        cursor: "pointer",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
        e.currentTarget.style.borderColor = "#f97316";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "#e5e7eb";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6 }}>
            Posted {project.postedAt || "1 Hour ago"}
          </div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, color: "#111827", lineHeight: 1.4 }}>
            {project.title}
          </div>
          <div style={{ color: "#f97316", fontSize: 13, marginBottom: 10 }}>
            {project.type || "Fixed Price"} · {project.level || "Entry Level"} · Est. Budget: {project.budget || "5k"}
          </div>
          <p style={{ fontSize: 13.5, color: "#4b5563", lineHeight: 1.6, marginBottom: 6 }}>
            {project.description?.slice(0, 160)}
          </p>
          {project.descriptionExtra && (
            <p style={{ fontSize: 13.5, color: "#4b5563", lineHeight: 1.6, marginBottom: 10 }}>
              {project.descriptionExtra.slice(0, 160)}
            </p>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {(project.tags || project.requiredSkills || []).map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: 12, color: "#6b7280" }}>
            {project.paymentVerified && (
              <span style={{ color: "#22c55e", display: "flex", alignItems: "center", gap: 4 }}>
                ✅ Payment Verified
              </span>
            )}
            <span>Proposals: {project.bids?.length || "0"}</span>
            {project.deadline && <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>}
            {(project.clientName || project.client?.name) && <span>Client: <strong>{project.clientName || project.client?.name}</strong></span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginLeft: 16, flexShrink: 0 }}>
          <button
            onClick={e => { e.stopPropagation(); onSave(projectId); }}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: saved ? "#ef4444" : "#9ca3af" }}
          >
            {saved ? "❤️" : "🤍"}
          </button>
          <button
            onClick={e => e.stopPropagation()}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#9ca3af" }}
          >
            👎
          </button>
        </div>
      </div>

      {submitted ? (
        <div style={{ marginTop: 10, color: "#22c55e", fontSize: 13, fontWeight: 600 }}>Bid submitted!</div>
      ) : bidding ? (
        <div
          onClick={e => e.stopPropagation()}
          style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}
        >
          <input
            type="number"
            placeholder="Your bid amount ($)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 10px", fontSize: 13, width: 180 }}
          />
          <button onClick={handleBid} style={{ background: "#f97316", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
            Submit
          </button>
          <button onClick={e => { e.stopPropagation(); setBidding(false); }} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 14px", fontSize: 13, cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      ) : (
        <button
  onClick={e => {
    e.stopPropagation();
    onOpenBid({
      projectId: project.id || project._id,
      projectTitle: project.title,
    });
  }}
  style={{
    marginTop: 12,
    background: "#f97316",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "7px 18px",
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 600
  }}
>
  Place Bid
</button>
      )}
    </div>
  );
}
// ── Dummy fallback data ──────────────────────────────────────────

// Removed DUMMY_PROJECTS

// ── Main Dashboard ───────────────────────────────────────────────

export default function SkillBridgeDashboard({ onSelectProject }) {
  const [activeNav, setActiveNav] = useState("Find work");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Best Matches");
  const [activeCategory, setActiveCategory] = useState("All");
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [bidModal, setBidModal] = useState(null);
  const [activeContracts, setActiveContracts] = useState([]);
  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/projects`);
      setProjects(res.data.projects || res.data || []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  useEffect(() => {
    if (activeNav === "Deliver work") {
      axiosInstance.get('/projects/contracts/mine')
        .then(res => {
          if (res.data?.success) {
            setActiveContracts(res.data.contracts);
          }
        })
        .catch(err => console.error("Failed to fetch contracts", err));
    }
  }, [activeNav]);

  const handleSearch = useCallback(async (q) => {
    if (!q.trim()) return fetchProjects();
    try {
      const res = await axiosInstance.get(`/projects?search=${encodeURIComponent(q)}`);
      setProjects(res.data.projects || res.data || []);
    } catch {
      setProjects([]);
    }
  }, [fetchProjects]);

  useEffect(() => {
    const timer = setTimeout(() => handleSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search, handleSearch]);

  const handleBid = async (projectId, amount) => {
    try {
      await axiosInstance.post(`/projects/${projectId}/bids`, { bidAmount: amount });
    } catch {}
  };

  const handleSave = (id) => {
    setSavedJobs(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = projects.filter(p => {
    const matchCat = activeCategory === "All" || (p.tags || []).includes(activeCategory);
    const matchTab = activeTab === "Saved Jobs" ? savedJobs.has(p.id || p._id) : true;
    return matchCat && matchTab;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "'Segoe UI', sans-serif" }}>
      <Navbar activeNav={activeNav} setActiveNav={setActiveNav} />
      
      {activeNav === "Find work" && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px", display: "grid", gridTemplateColumns: "1fr 280px", gap: 24 }}>
          {/* Left Column */}
          <div>
          {/* Search */}
          <div style={{ position: "relative", marginBottom: 24 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for jobs"
              style={{ width: "100%", padding: "12px 44px 12px 16px", borderRadius: 8, border: "2px solid #8b5cf6", fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fff" }}
            />
            <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#8b5cf6", fontSize: 18 }}>🔍</span>
          </div>

          {/* Title + Tabs */}
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 12 }}>Jobs you might like</h2>
            <div style={{ display: "flex", gap: 4, alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 0 }}>
                {TABS.map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    padding: "7px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 13.5,
                    fontWeight: activeTab === tab ? 700 : 400,
                    color: activeTab === tab ? "#111827" : "#6b7280",
                    borderBottom: activeTab === tab ? "2px solid #111827" : "2px solid transparent",
                  }}>
                    {tab === "Saved Jobs" ? `Saved Jobs(${savedJobs.size})` : tab}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                    padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer",
                    background: activeCategory === cat ? "#f97316" : "#f3f4f6",
                    color: activeCategory === cat ? "#fff" : "#374151",
                    border: `1px solid ${activeCategory === cat ? "#f97316" : "#e5e7eb"}`,
                  }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cards */}
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>Loading projects...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>No projects found.</div>
          ) : (
            filtered.map(p => (
              <ProjectCard
                key={p.id || p._id}
                project={p}
                onBid={handleBid}
                onSave={handleSave}
                saved={savedJobs.has(p.id || p._id)}
                onSelect={onSelectProject}
                onOpenBid={setBidModal}
              />
            ))
          )}
        </div>

        {/* Right Sidebar */}
        <div>
          <ProfileCard profile={null} />
        </div>
      </div>
      )}

      <BidModal
        open={!!bidModal}
        project={bidModal}
        onClose={() => setBidModal(null)}
        onSubmit={handleBid}
      />

      {activeNav === "Deliver work" && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 20 }}>Your Active Contracts</h2>
          {activeContracts.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 40, textAlign: "center", color: "#6b7280" }}>
              <p style={{ fontSize: 16 }}>No active contracts found.</p>
              <p style={{ fontSize: 14, marginTop: 8 }}>When you win a bid and the client hires you, the contract will appear here.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              {activeContracts.map(contract => (
                <div key={contract._id} style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 4 }}>{contract.project?.title || "Project"}</h3>
                    <p style={{ fontSize: 14, color: "#6b7280" }}>Client: {contract.client?.name}</p>
                    <p style={{ fontSize: 14, color: "#6b7280" }}>Agreed Amount: <span style={{ color: "#16a34a", fontWeight: 600 }}>${contract.agreedAmount}</span></p>
                  </div>
                  <button 
                    onClick={() => navigate('/deliver-work', { state: { contract } })}
                    style={{ background: "#f97316", color: "#fff", padding: "8px 16px", borderRadius: 6, fontWeight: 600, border: "none", cursor: "pointer" }}
                  >
                    Deliver Work
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}



    </div>
  );
}
