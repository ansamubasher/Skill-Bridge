import { useState, useEffect, useCallback } from "react";
import BidModal from "../components/BidModal";
// bidModal = { projectId, projectTitle }
const API_BASE = "http://localhost:5000/api/freelancer";

const getToken = () => localStorage.getItem("token");

const authFetch = (url, options = {}) =>
  fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });

const CATEGORIES = ["All", "Graphic Design", "Web Design", "Development", "Canva", "Marketing", "Writing"];
const TABS = ["Best Matches", "Most Recent", "Saved Jobs"];

// ── Sub-components ──────────────────────────────────────────────

function Navbar() {
  return (
    <nav style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <span style={{ fontSize: 22, fontWeight: 700 }}>
          <span style={{ color: "#f97316" }}>Skill</span>
          <span style={{ color: "#1f2937" }}>Bridge</span>
        </span>
        {["Find work ▾", "Deliver work ▾", "Manage Finances ▾", "Messages"].map((item) => (
          <button key={item} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: item.startsWith("Find") ? "#f97316" : "#374151", fontWeight: item.startsWith("Find") ? 600 : 400 }}>
            {item}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 18, cursor: "pointer" }}>?</span>
        <span style={{ fontSize: 18, cursor: "pointer" }}>🔔</span>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>LL</div>
      </div>
    </nav>
  );
}

function ProfileCard({ profile }) {
  return (
    <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 20, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15 }}>
          {profile?.initials || "LL"}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{profile?.name || "Ling Long"}</div>
          <div style={{ color: "#f97316", fontSize: 13 }}>{profile?.title || "Graphic Design"}</div>
          <div style={{ color: "#6b7280", fontSize: 12, textDecoration: "underline", cursor: "pointer" }}>Complete Your Profile</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ height: 6, flex: 1, background: "#e5e7eb", borderRadius: 4, overflow: "hidden", marginRight: 8 }}>
          <div style={{ width: `${profile?.completion || 100}%`, height: "100%", background: "#f97316", borderRadius: 4 }} />
        </div>
        <span style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>{profile?.completion || 100}%</span>
      </div>
    </div>
  );
}

function BidsCard({ bids }) {
  return (
    <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 16, marginBottom: 16 }}>
      <span style={{ fontSize: 14, color: "#374151" }}>Bids Available: </span>
      <span style={{ color: "#f97316", fontWeight: 700 }}>{bids ?? "1 billion"}</span>
    </div>
  );
}

function PreferencesCard() {
  const prefs = [
    { label: "Hours per week", value: "As needed – Open to offers" },
    { label: "Profile Visibility", value: "Public" },
    { label: "Job Preference", value: "Open to contract-to-hire roles" },
  ];
  return (
    <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 20 }}>
      <div style={{ fontWeight: 700, color: "#f97316", marginBottom: 14, fontSize: 15 }}>Preferences</div>
      {prefs.map((p) => (
        <div key={p.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{p.label}</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{p.value}</div>
          </div>
          <span style={{ color: "#f97316", cursor: "pointer", fontSize: 15 }}>✏️</span>
        </div>
      ))}
    </div>
  );
}

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
            {(project.tags || []).map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: 12, color: "#6b7280" }}>
            {project.paymentVerified && (
              <span style={{ color: "#22c55e", display: "flex", alignItems: "center", gap: 4 }}>
                ✅ Payment Verified
              </span>
            )}
            <span>Proposals: {project.proposals || "10 to 15"}</span>
            {project.deadline && <span>Deadline: {project.deadline}</span>}
            {project.clientName && <span>Client: <strong>{project.clientName}</strong></span>}
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

const DUMMY_PROJECTS = [
  {  
    
    id: "1", title: "Canva Design Support & Template Creation for Social Media Marketing and Management",
    type: "Fixed Price", level: "Entry Level", budget: "$5k", postedAt: "1 Hour ago",
    description: "I'm looking for support with Canva design and template creation to assist our ongoing social media marketing and social media management across Instagram, Facebook, and TikTok.",
    descriptionExtra: "The goal is to create clean, reusable Canva templates for social media content that make content creation faster and more consistent while maintaining strong visual alignment with our brand.",
    tags: ["Graphic Design", "Web Design", "Canva"], paymentVerified: true, proposals: "10 to 15", clientName: "TechCorp Inc.", deadline: "2025-07-01",
  },
  {
    id: "2", title: "React Developer for E-Commerce Platform Redesign",
    type: "Hourly", level: "Intermediate", budget: "$50/hr", postedAt: "3 Hours ago",
    description: "We need an experienced React developer to help redesign our e-commerce platform. You will work closely with our design team to implement pixel-perfect UI components.",
    descriptionExtra: "Experience with Tailwind CSS, Redux, and REST API integration is required. The project spans 3 months with potential for long-term collaboration.",
    tags: ["React", "JavaScript", "Tailwind"], paymentVerified: true, proposals: "5 to 10", clientName: "ShopEasy Ltd.", deadline: "2025-08-15",
  },
  {
    id: "3", title: "Content Writer for Tech Blog – AI & Machine Learning Topics",
    type: "Fixed Price", level: "Expert", budget: "$2k", postedAt: "5 Hours ago",
    description: "Looking for a skilled technical writer to produce engaging blog posts about AI, machine learning, and data science for our growing tech publication.",
    descriptionExtra: "Must be able to simplify complex topics for a general audience while maintaining technical accuracy. SEO knowledge is a plus.",
    tags: ["Writing", "AI", "Marketing"], paymentVerified: false, proposals: "20+", clientName: "DevBlog Media", deadline: "2025-06-20",
  },
  {
    id: "4", title: "UI/UX Designer for Mobile App – Health & Fitness",
    type: "Fixed Price", level: "Intermediate", budget: "$8k", postedAt: "8 Hours ago",
    description: "We are building a health and fitness app and need a talented UI/UX designer to create intuitive, beautiful user interfaces and user flows.",
    descriptionExtra: "Figma expertise required. Deliverables include wireframes, prototypes, and final design assets.",
    tags: ["Graphic Design", "Web Design", "Figma"], paymentVerified: true, proposals: "15 to 20", clientName: "FitLife Co.", deadline: "2025-09-01",
  },
];

// ── Main Dashboard ───────────────────────────────────────────────

export default function SkillBridgeDashboard({ onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Best Matches");
  const [activeCategory, setActiveCategory] = useState("All");
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [profile] = useState({ name: "Ling Long", title: "Graphic Design", initials: "LL", completion: 100 });
  // After your other useState declarations, add:
const [bidModal, setBidModal] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await authFetch(`${API_BASE}/dashboard`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProjects(data.projects || data || []);
    } catch {
      setProjects(DUMMY_PROJECTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleSearch = useCallback(async (q) => {
    if (!q.trim()) return fetchProjects();
    try {
      const res = await authFetch(`${API_BASE}/searched?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProjects(data.projects || data || []);
    } catch {
      setProjects(DUMMY_PROJECTS.filter(p => p.title.toLowerCase().includes(q.toLowerCase())));
    }
  }, [fetchProjects]);

  useEffect(() => {
    const timer = setTimeout(() => handleSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search, handleSearch]);

  const handleBid = async (projectId, amount) => {
    try {
      await authFetch(`${API_BASE}/bid`, {
        method: "POST",
        body: JSON.stringify({ projectId, amount }),
      });
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
      <Navbar />
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
<BidModal
  open={!!bidModal}
  project={bidModal}
  onClose={() => setBidModal(null)}
  onSubmit={handleBid}
/>
        {/* Right Sidebar */}
        <div>
          <ProfileCard profile={profile} />
          <BidsCard />
          <PreferencesCard />
        </div>
      </div>
    </div>
  );
}
