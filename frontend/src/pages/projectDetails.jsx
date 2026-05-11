import { useState, useEffect } from "react";

const API_BASE = "http://localhost:5000/api/freelancer";
const getToken = () => localStorage.getItem("sb_token");
const authFetch = (url) =>
  fetch(url, { headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" } });

function Navbar({ onBack }) {
  return (
    <nav style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <span style={{ fontSize: 22, fontWeight: 700, cursor: "pointer" }} onClick={onBack}>
          <span style={{ color: "#f97316" }}>Skill</span><span style={{ color: "#1f2937" }}>Bridge</span>
        </span>
        {["Find work ▾", "Deliver work ▾", "Manage Finances ▾", "Messages"].map((item) => (
          <button key={item} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: item.startsWith("Find") ? "#f97316" : "#374151", fontWeight: item.startsWith("Find") ? 600 : 400 }}>{item}</button>
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

function SkillTag({ label, mandatory }) {
  return (
    <span style={{
      padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: mandatory ? "#f97316" : "#fff",
      color: mandatory ? "#fff" : "#374151",
      border: `1px solid ${mandatory ? "#f97316" : "#d1d5db"}`,
      display: "inline-block", margin: "3px 4px 3px 0"
    }}>{label}</span>
  );
}

function Skeleton({ h = 16, w = "100%", mb = 10 }) {
  return <div style={{ height: h, width: w, background: "#f3f4f6", borderRadius: 6, marginBottom: mb, animation: "pulse 1.5s infinite" }} />;
}

export default function ProjectDetail({ projectId, onBack }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [bidMsg, setBidMsg] = useState("");
  const [bidStatus, setBidStatus] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch(`${API_BASE}/details/${projectId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProject(data);
      } catch {
        setProject({
          _id: projectId,
          title: "Canva Designer Needed for Big Tech",
          postedAt: "195 hours ago",
          description: `We are looking for a talented Canva designer to support our marketing team at a leading Big Tech company. You will be responsible for creating visually compelling social media graphics, presentation decks, and brand assets.\n\nThe ideal candidate has a strong eye for design, experience with Canva Pro, and the ability to work within brand guidelines. You should be able to deliver high-quality work under tight deadlines and handle multiple revision rounds professionally.\n\nThis is a remote, contract-based position with flexible hours. If you have a portfolio demonstrating your Canva expertise and a passion for clean, modern design, we'd love to hear from you.`,
          estimatedTime: "20–30 hours",
          skillLevel: "Beginner–Intermediate",
          budget: "$ 50,000 – Per",
          extraInfo: "Could need multiple revisions",
          projectType: "Small to mid level",
          mandatorySkills: ["Skill Fixer kit", "At animation", "Adv"],
          niceToHaveSkills: ["Skill Fixer dev", "Futil", "Adv", "Full"],
          proposals: 23,
          client: { jobsPosted: 3, memberSince: "10 Sep, 2023", profileUrl: "#" },
          otherJobs: [
            "AI automated email spam checker (these are all urls)",
            "Housing prices ML model",
            "Figma design for Task App",
          ],
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId]);

  const handleBid = async () => {
    if (!bidAmount) return;
    try {
      const res = await fetch(`${API_BASE}/bid`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ project: projectId, price: bidAmount }),
      });
      setBidStatus(res.ok ? "success" : "error");
    } catch {
      setBidStatus("error");
    } finally {
      setBidding(false);
      setBidAmount("");
      setBidMsg("");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "'Segoe UI', sans-serif" }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
      <Navbar onBack={onBack} />

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 20px", display: "grid", gridTemplateColumns: "1fr 260px", gap: 24, alignItems: "start" }}>

        {/* ── Main Content ── */}
        <div>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#f97316", fontSize: 13, fontWeight: 600, marginBottom: 16, padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
            ← Back to Jobs
          </button>

          <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 28, marginBottom: 20 }}>
            {loading ? (
              <>
                <Skeleton h={28} w="70%" mb={12} />
                <Skeleton h={14} w="30%" mb={20} />
                <Skeleton h={14} mb={8} />
                <Skeleton h={14} mb={8} />
                <Skeleton h={14} w="80%" mb={8} />
              </>
            ) : (
              <>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 6 }}>{project.title}</h1>
                <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 18 }}>Posted {project.postedAt}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Summary</div>
                {project.description?.split("\n\n").map((para, i) => (
                  <p key={i} style={{ fontSize: 13.5, color: "#4b5563", lineHeight: 1.7, marginBottom: 12 }}>{para}</p>
                ))}
              </>
            )}
          </div>

          {/* Project Info */}
          {!loading && (
            <>
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 24, marginBottom: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
                  {[
                    { label: "Estimated Time for Project", value: project.estimatedTime },
                    { label: "Required Skill level", value: project.skillLevel },
                    { label: "Project Budget", value: project.budget },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "#111827" }}>{value}</div>
                    </div>
                  ))}
                </div>
                {project.extraInfo && (
                  <div style={{ marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>Extra Info: </span>
                    <span style={{ fontSize: 13, color: "#374151" }}>{project.extraInfo}</span>
                  </div>
                )}
                <div>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>Project Type: </span>
                  <span style={{ fontSize: 13, color: "#374151" }}>{project.projectType}</span>
                </div>
              </div>

              {/* Skills */}
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 24, marginBottom: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Skills and Expertise</div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Mandatory skills</div>
                  <div>{(project.mandatorySkills || project.requiredSkills || []).map(s => <SkillTag key={s} label={s} mandatory />)}</div>
                </div>
                {project.niceToHaveSkills?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Nice to have skills</div>
                    <div>{project.niceToHaveSkills.map(s => <SkillTag key={s} label={s} />)}</div>
                  </div>
                )}
              </div>

              {/* Job Activity */}
              <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 24, marginBottom: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 10 }}>Job Activity</div>
                <div style={{ fontSize: 13.5, color: "#4b5563" }}>{project.proposals} people have applied so far!</div>
              </div>

              {/* Other jobs */}
              {project.otherJobs?.length > 0 && (
                <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 24 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 12 }}>Other open jobs by this client</div>
                  {project.otherJobs.map((j, i) => (
                    <div key={i} style={{ color: "#f97316", fontSize: 13.5, marginBottom: 6, cursor: "pointer", textDecoration: "underline" }}>{j}</div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div style={{ position: "sticky", top: 80 }}>
          {/* Apply / Save */}
          <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 20, marginBottom: 16 }}>
            {bidStatus === "success" && <div style={{ color: "#22c55e", fontWeight: 600, fontSize: 13, marginBottom: 10 }}>✅ Bid submitted!</div>}
            {bidStatus === "error" && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 10 }}>Failed to submit. Try again.</div>}

            {bidding ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input type="number" placeholder="Your price ($)" value={bidAmount} onChange={e => setBidAmount(e.target.value)}
                  style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 12px", fontSize: 13, outline: "none" }} />
                <textarea placeholder="Cover message (optional)" value={bidMsg} onChange={e => setBidMsg(e.target.value)} rows={3}
                  style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 12px", fontSize: 13, resize: "none", outline: "none" }} />
                <button onClick={handleBid} style={{ background: "#f97316", color: "#fff", border: "none", borderRadius: 6, padding: "10px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  Submit Bid
                </button>
                <button onClick={() => setBidding(false)} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px", fontSize: 13, cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => { setBidding(true); setBidStatus(null); }}
                  style={{ width: "100%", background: "#f97316", color: "#fff", border: "none", borderRadius: 6, padding: "12px", fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>
                  APPLY
                </button>
                <button onClick={() => setSaved(s => !s)}
                  style={{ width: "100%", background: saved ? "#fef3e2" : "#fff", color: saved ? "#f97316" : "#374151", border: "1px solid #e5e7eb", borderRadius: 6, padding: "11px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  {saved ? "✓ SAVED" : "SAVE JOB"}
                </button>
              </>
            )}
          </div>

          {/* About Client */}
          {!loading && project?.client && (
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 12 }}>About the Client</div>
              <div style={{ fontSize: 13, color: "#374151", marginBottom: 6 }}>
                <strong>{project.client.jobsPosted}</strong> jobs currently posted
              </div>
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 10 }}>
                Member since {project.client.memberSince}
              </div>
              <a href={project.client.profileUrl || "#"} style={{ color: "#f97316", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                Click to open client Profile →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
