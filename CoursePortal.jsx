import { useState, useEffect, useRef } from "react";

const FONT = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');`;

// ─── Initial Data ───────────────────────────────────────────────────────────
const INITIAL_COURSES = [
  {
    id: 1, title: "Full-Stack Web Development", instructor: "Dr. Priya Sharma",
    description: "A comprehensive course covering React, Node.js, databases, and deployment strategies for modern web applications.",
    schedule: "Mon, Wed, Fri · 10:00–11:30 AM", capacity: 30, enrolled: 0,
    duration: "12 weeks", level: "Intermediate", category: "Engineering",
    startDate: "2026-06-15", fee: "₹12,000",
  },
  {
    id: 2, title: "Data Science with Python", instructor: "Prof. Arjun Mehta",
    description: "Learn data analysis, machine learning, and visualization using Python, Pandas, and scikit-learn.",
    schedule: "Tue, Thu · 2:00–4:00 PM", capacity: 25, enrolled: 0,
    duration: "10 weeks", level: "Beginner", category: "Data Science",
    startDate: "2026-06-20", fee: "₹10,500",
  },
  {
    id: 3, title: "UI/UX Design Fundamentals", instructor: "Ms. Kavya Reddy",
    description: "Master user experience principles, Figma prototyping, design systems, and usability testing methodologies.",
    schedule: "Sat, Sun · 9:00 AM–12:00 PM", capacity: 20, enrolled: 0,
    duration: "8 weeks", level: "Beginner", category: "Design",
    startDate: "2026-07-05", fee: "₹8,000",
  },
  {
    id: 4, title: "Cloud Architecture & DevOps", instructor: "Mr. Rahul Nair",
    description: "Deep dive into AWS, Docker, Kubernetes, CI/CD pipelines, and infrastructure as code practices.",
    schedule: "Mon, Wed · 6:00–8:00 PM", capacity: 15, enrolled: 0,
    duration: "14 weeks", level: "Advanced", category: "Engineering",
    startDate: "2026-06-10", fee: "₹18,000",
  },
  {
    id: 5, title: "Business Analytics & BI", instructor: "Dr. Sneha Joshi",
    description: "Transform data into decisions using Power BI, Tableau, SQL, and strategic business thinking frameworks.",
    schedule: "Tue, Thu, Sat · 11:00 AM–12:30 PM", capacity: 35, enrolled: 0,
    duration: "9 weeks", level: "Intermediate", category: "Business",
    startDate: "2026-07-01", fee: "₹9,500",
  },
];

const INITIAL_USERS = [
  { id: 1, name: "Admin User", email: "admin@portal.com", password: "admin123", role: "admin" },
  { id: 2, name: "Ravi Kumar", email: "ravi@example.com", password: "user123", role: "user" },
  { id: 3, name: "Ananya Singh", email: "ananya@example.com", password: "user123", role: "user" },
];

const LEVEL_COLOR = { Beginner: "#1D9E75", Intermediate: "#BA7517", Advanced: "#D85A30" };
const LEVEL_BG   = { Beginner: "#E1F5EE", Intermediate: "#FAEEDA", Advanced: "#FAECE7" };
const STATUS_STYLE = {
  pending:  { bg: "#FAEEDA", color: "#854F0B", label: "Pending" },
  accepted: { bg: "#EAF3DE", color: "#3B6D11", label: "Accepted" },
  rejected: { bg: "#FCEBEB", color: "#A32D2D", label: "Rejected" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
let nextId = 10;
const uid = () => ++nextId;

function Badge({ status }) {
  const s = STATUS_STYLE[status];
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 600, padding: "3px 10px",
      borderRadius: 20, letterSpacing: "0.4px", textTransform: "uppercase",
    }}>{s.label}</span>
  );
}

function LevelBadge({ level }) {
  return (
    <span style={{
      background: LEVEL_BG[level] || "#F1EFE8",
      color: LEVEL_COLOR[level] || "#5F5E5A",
      fontSize: 11, fontWeight: 600, padding: "3px 10px",
      borderRadius: 20, letterSpacing: "0.4px",
    }}>{level}</span>
  );
}

function ProgressBar({ value, max }) {
  const pct = Math.round((value / max) * 100);
  const color = pct > 85 ? "#D85A30" : pct > 60 ? "#BA7517" : "#1D9E75";
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: "#888" }}>{value}/{max} enrolled</span>
        <span style={{ fontSize: 12, fontWeight: 600, color }}>{pct}%</span>
      </div>
      <div style={{ height: 5, background: "#e8e8e8", borderRadius: 99 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: "28px 32px",
        width: wide ? 680 : 480, maxWidth: "95vw", maxHeight: "90vh",
        overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}>{title}</h2>
          <button onClick={onClose} style={{
            border: "none", background: "none", cursor: "pointer",
            fontSize: 20, color: "#888", padding: "4px 8px", borderRadius: 8,
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Course Form ──────────────────────────────────────────────────────────────
function CourseForm({ course, onSave, onClose }) {
  const [form, setForm] = useState(course || {
    title: "", instructor: "", description: "", schedule: "",
    capacity: 20, duration: "", level: "Beginner", category: "", startDate: "", fee: "",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inp = (k) => ({ value: form[k], onChange: e => set(k, e.target.value) });

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px" }}>
        {[["title","Course Title"],["instructor","Instructor"],["schedule","Schedule"],["duration","Duration"],["startDate","Start Date"],["fee","Fee"]].map(([k,l]) => (
          <div key={k}>
            <label style={labelSt}>{l}</label>
            <input {...inp(k)} type={k==="startDate"?"date":"text"} style={inputSt} />
          </div>
        ))}
        <div>
          <label style={labelSt}>Level</label>
          <select value={form.level} onChange={e => set("level", e.target.value)} style={inputSt}>
            {["Beginner","Intermediate","Advanced"].map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label style={labelSt}>Category</label>
          <input {...inp("category")} style={inputSt} />
        </div>
        <div>
          <label style={labelSt}>Capacity</label>
          <input {...inp("capacity")} type="number" min={1} style={inputSt} />
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <label style={labelSt}>Description</label>
        <textarea {...inp("description")} rows={3} style={{ ...inputSt, resize: "vertical" }} />
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
        <button onClick={onClose} style={btnSecondary}>Cancel</button>
        <button onClick={() => onSave(form)} style={btnPrimary}>
          {course ? "Save Changes" : "Create Course"}
        </button>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const labelSt = { display: "block", fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 5, letterSpacing: "0.3px", textTransform: "uppercase" };
const inputSt = { width: "100%", padding: "9px 12px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "#fafafa", transition: "border-color 0.2s" };
const btnPrimary = { background: "#1a1a2e", color: "#fff", border: "none", padding: "10px 22px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", letterSpacing: "0.2px" };
const btnSecondary = { background: "transparent", color: "#333", border: "1.5px solid #ddd", padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" };
const btnDanger = { background: "#FCEBEB", color: "#A32D2D", border: "1.5px solid #F7C1C1", padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" };
const btnSuccess = { background: "#EAF3DE", color: "#3B6D11", border: "1.5px solid #C0DD97", padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" };

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [registrations, setRegistrations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState("login");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("All");
  const [adminTab, setAdminTab] = useState("courses");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [regForm, setRegForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [regError, setRegError] = useState("");
  const [signupView, setSignupView] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const myRegs = currentUser ? registrations.filter(r => r.userId === currentUser.id) : [];

  // ─ Auth ─
  const handleLogin = () => {
    const u = users.find(u => u.email === loginForm.email && u.password === loginForm.password);
    if (!u) { setLoginError("Invalid email or password."); return; }
    setCurrentUser(u);
    setPage(u.role === "admin" ? "admin" : "courses");
    setLoginError("");
  };

  const handleSignup = () => {
    if (!regForm.name || !regForm.email || !regForm.password) { setRegError("All fields are required."); return; }
    if (regForm.password !== regForm.confirm) { setRegError("Passwords do not match."); return; }
    if (users.find(u => u.email === regForm.email)) { setRegError("Email already registered."); return; }
    const newUser = { id: uid(), name: regForm.name, email: regForm.email, password: regForm.password, role: "user" };
    setUsers(us => [...us, newUser]);
    setCurrentUser(newUser);
    setPage("courses");
    setRegError("");
  };

  const handleLogout = () => { setCurrentUser(null); setPage("login"); setLoginForm({ email: "", password: "" }); };

  // ─ Courses ─
  const saveCourse = (form) => {
    if (modal?.courseId) {
      setCourses(cs => cs.map(c => c.id === modal.courseId ? { ...c, ...form, capacity: Number(form.capacity) } : c));
      showToast("Course updated successfully.");
    } else {
      const newC = { ...form, id: uid(), capacity: Number(form.capacity), enrolled: 0 };
      setCourses(cs => [...cs, newC]);
      showToast("Course created successfully.");
    }
    setModal(null);
  };

  const deleteCourse = (id) => {
    setCourses(cs => cs.filter(c => c.id !== id));
    setRegistrations(rs => rs.filter(r => r.courseId !== id));
    showToast("Course deleted.", "warning");
  };

  // ─ Registrations ─
  const enroll = (courseId) => {
    const existing = registrations.find(r => r.courseId === courseId && r.userId === currentUser.id);
    if (existing) { showToast("You're already registered for this course.", "warning"); return; }
    const course = courses.find(c => c.id === courseId);
    if (course.enrolled >= course.capacity) { showToast("This course is full.", "warning"); return; }
    const reg = { id: uid(), courseId, userId: currentUser.id, userName: currentUser.name, userEmail: currentUser.email, status: "pending", date: new Date().toLocaleDateString() };
    setRegistrations(rs => [...rs, reg]);
    setCourses(cs => cs.map(c => c.id === courseId ? { ...c, enrolled: c.enrolled + 1 } : c));
    showToast("Registration submitted! Awaiting approval.");
    setModal(null);
  };

  const updateRegStatus = (regId, status) => {
    setRegistrations(rs => rs.map(r => r.id === regId ? { ...r, status } : r));
    showToast(`Registration ${status}.`);
  };

  const filteredCourses = courses.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
    const matchLevel = filterLevel === "All" || c.level === filterLevel;
    return matchSearch && matchLevel;
  });

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <style>{FONT}</style>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }
        input:focus, select:focus, textarea:focus { border-color: #1a1a2e !important; outline: none; background: #fff !important; }
        button:hover { opacity: 0.88; }
        .course-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.09) !important; }
        .nav-link:hover { background: rgba(255,255,255,0.12) !important; }
        .tab-btn { border: none; cursor: pointer; padding: 8px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; transition: all 0.15s; }
        .tab-btn.active { background: #1a1a2e; color: #fff; }
        .tab-btn:not(.active) { background: transparent; color: #666; }
        .tab-btn:not(.active):hover { background: #f0f0f0; color: #333; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 99px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f5f5f0", fontFamily: "'DM Sans', sans-serif" }}>

        {/* Toast */}
        {toast && (
          <div style={{
            position: "fixed", top: 24, right: 24, zIndex: 9999,
            background: toast.type === "success" ? "#1a1a2e" : toast.type === "warning" ? "#854F0B" : "#A32D2D",
            color: "#fff", padding: "12px 20px", borderRadius: 10,
            fontSize: 14, fontWeight: 500, boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            animation: "slideIn 0.3s ease",
          }}>{toast.msg}</div>
        )}

        {/* NAV */}
        {currentUser && (
          <nav style={{ background: "#1a1a2e", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
              <span style={{ color: "#fff", fontFamily: "'DM Serif Display', serif", fontSize: 20, letterSpacing: "0.5px" }}>
                CourseHub
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                {[["courses","All Courses"], ...(currentUser.role === "admin" ? [["admin","Admin Panel"]] : [["my-courses","My Registrations"]])].map(([p, l]) => (
                  <button key={p} className="nav-link" onClick={() => setPage(p)} style={{
                    background: page === p ? "rgba(255,255,255,0.15)" : "transparent",
                    color: "#fff", border: "none", padding: "7px 16px", borderRadius: 8,
                    fontSize: 14, cursor: "pointer", fontFamily: "inherit", fontWeight: page === p ? 600 : 400,
                  }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{currentUser.name}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>{currentUser.role}</div>
              </div>
              <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "7px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                Sign Out
              </button>
            </div>
          </nav>
        )}

        {/* ─── LOGIN / SIGNUP ─── */}
        {page === "login" && (
          <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
            <div style={{ background: "#fff", borderRadius: 20, padding: "40px 44px", width: 420, boxShadow: "0 24px 80px rgba(0,0,0,0.3)" }}>
              <div style={{ marginBottom: 28, textAlign: "center" }}>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#1a1a2e", marginBottom: 6 }}>CourseHub</div>
                <div style={{ fontSize: 13, color: "#888" }}>{signupView ? "Create your account" : "Sign in to your account"}</div>
              </div>

              {!signupView ? (
                <>
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelSt}>Email</label>
                    <input value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} type="email" placeholder="you@example.com" style={inputSt} onKeyDown={e => e.key === "Enter" && handleLogin()} />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelSt}>Password</label>
                    <input value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} type="password" placeholder="••••••••" style={inputSt} onKeyDown={e => e.key === "Enter" && handleLogin()} />
                  </div>
                  {loginError && <div style={{ color: "#A32D2D", fontSize: 13, marginBottom: 12, background: "#FCEBEB", padding: "8px 12px", borderRadius: 8 }}>{loginError}</div>}
                  <button onClick={handleLogin} style={{ ...btnPrimary, width: "100%", padding: "12px", fontSize: 15 }}>Sign In</button>
                  <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#888" }}>
                    Don't have an account?{" "}
                    <span style={{ color: "#1a1a2e", fontWeight: 600, cursor: "pointer" }} onClick={() => { setSignupView(true); setLoginError(""); }}>Register</span>
                  </div>
                  <div style={{ marginTop: 20, padding: "14px 16px", background: "#f5f5f0", borderRadius: 10, fontSize: 12, color: "#666" }}>
                    <div style={{ fontWeight: 600, marginBottom: 6, color: "#444" }}>Demo Accounts</div>
                    <div>Admin: admin@portal.com / admin123</div>
                    <div>User: ravi@example.com / user123</div>
                  </div>
                </>
              ) : (
                <>
                  {[["name","Full Name","text","Your full name"],["email","Email","email","you@example.com"],["password","Password","password","••••••••"],["confirm","Confirm Password","password","••••••••"]].map(([k,l,t,ph]) => (
                    <div key={k} style={{ marginBottom: 14 }}>
                      <label style={labelSt}>{l}</label>
                      <input value={regForm[k]} onChange={e => setRegForm(f => ({ ...f, [k]: e.target.value }))} type={t} placeholder={ph} style={inputSt} />
                    </div>
                  ))}
                  {regError && <div style={{ color: "#A32D2D", fontSize: 13, marginBottom: 12, background: "#FCEBEB", padding: "8px 12px", borderRadius: 8 }}>{regError}</div>}
                  <button onClick={handleSignup} style={{ ...btnPrimary, width: "100%", padding: "12px", fontSize: 15 }}>Create Account</button>
                  <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#888" }}>
                    Already have an account?{" "}
                    <span style={{ color: "#1a1a2e", fontWeight: 600, cursor: "pointer" }} onClick={() => { setSignupView(false); setRegError(""); }}>Sign In</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ─── COURSES PAGE ─── */}
        {page === "courses" && currentUser && (
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px" }}>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, fontWeight: 400, color: "#1a1a2e", marginBottom: 6 }}>
                Explore Courses
              </h1>
              <p style={{ color: "#888", fontSize: 15 }}>Browse and register for courses tailored to your goals.</p>
            </div>

            {/* Search + Filter */}
            <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by title, instructor, category…"
                style={{ ...inputSt, maxWidth: 340, background: "#fff" }}
              />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["All","Beginner","Intermediate","Advanced"].map(l => (
                  <button key={l} onClick={() => setFilterLevel(l)} style={{
                    padding: "8px 16px", borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: "pointer",
                    border: filterLevel === l ? "none" : "1.5px solid #ddd",
                    background: filterLevel === l ? "#1a1a2e" : "#fff",
                    color: filterLevel === l ? "#fff" : "#555",
                  }}>{l}</button>
                ))}
              </div>
            </div>

            {/* Course Grid */}
            {filteredCourses.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa", fontSize: 15 }}>No courses match your search.</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 20 }}>
                {filteredCourses.map(course => {
                  const myReg = myRegs.find(r => r.courseId === course.id);
                  const full = course.enrolled >= course.capacity;
                  return (
                    <div key={course.id} className="course-card" style={{ background: "#fff", borderRadius: 16, border: "1px solid #eee", padding: "22px 24px", cursor: "pointer", transition: "all 0.2s" }} onClick={() => setModal({ type: "courseDetail", course, myReg })}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <LevelBadge level={course.level} />
                        {myReg && <Badge status={myReg.status} />}
                      </div>
                      <h3 style={{ fontSize: 17, fontWeight: 600, color: "#1a1a2e", marginBottom: 6, lineHeight: 1.3 }}>{course.title}</h3>
                      <div style={{ fontSize: 13, color: "#888", marginBottom: 10 }}>by {course.instructor}</div>
                      <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {course.description}
                      </p>
                      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                        {[["🗓","schedule",course.schedule],["⏱","duration",course.duration],["💰","fee",course.fee]].map(([icon,k,v]) => (
                          <div key={k} style={{ fontSize: 12, color: "#888", display: "flex", alignItems: "center", gap: 4 }}>
                            <span>{icon}</span><span>{v}</span>
                          </div>
                        ))}
                      </div>
                      <ProgressBar value={course.enrolled} max={course.capacity} />
                      <button
                        onClick={e => { e.stopPropagation(); myReg ? null : full ? null : setModal({ type: "enroll", course }); }}
                        style={{
                          marginTop: 16, width: "100%", padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: myReg || full ? "default" : "pointer",
                          border: "none",
                          background: myReg ? STATUS_STYLE[myReg.status].bg : full ? "#f5f5f0" : "#1a1a2e",
                          color: myReg ? STATUS_STYLE[myReg.status].color : full ? "#aaa" : "#fff",
                        }}
                      >
                        {myReg ? `${STATUS_STYLE[myReg.status].label} — Registered` : full ? "Course Full" : "Register Now"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── MY REGISTRATIONS ─── */}
        {page === "my-courses" && currentUser && (
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px" }}>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, fontWeight: 400, color: "#1a1a2e", marginBottom: 6 }}>My Registrations</h1>
            <p style={{ color: "#888", marginBottom: 28 }}>Track your course registration statuses.</p>
            {myRegs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#bbb" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <div>You haven't registered for any courses yet.</div>
                <button onClick={() => setPage("courses")} style={{ ...btnPrimary, marginTop: 16 }}>Browse Courses</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {myRegs.map(reg => {
                  const course = courses.find(c => c.id === reg.courseId);
                  if (!course) return null;
                  return (
                    <div key={reg.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #eee", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: 16, color: "#1a1a2e" }}>{course.title}</span>
                          <Badge status={reg.status} />
                        </div>
                        <div style={{ fontSize: 13, color: "#888" }}>
                          {course.instructor} · {course.schedule} · Registered {reg.date}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <LevelBadge level={course.level} />
                        <span style={{ fontSize: 13, color: "#888" }}>{course.fee}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── ADMIN PANEL ─── */}
        {page === "admin" && currentUser?.role === "admin" && (
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
              <div>
                <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, fontWeight: 400, color: "#1a1a2e", marginBottom: 4 }}>Admin Panel</h1>
                <p style={{ color: "#888" }}>Manage courses, registrations, and users.</p>
              </div>
              {/* Stats */}
              <div style={{ display: "flex", gap: 12 }}>
                {[["Total Courses", courses.length, "#E6F1FB", "#185FA5"],["Registrations", registrations.length, "#EAF3DE", "#3B6D11"],["Pending", registrations.filter(r=>r.status==="pending").length, "#FAEEDA", "#854F0B"]].map(([l,v,bg,col]) => (
                  <div key={l} style={{ background: bg, borderRadius: 12, padding: "12px 20px", textAlign: "center", minWidth: 100 }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: col }}>{v}</div>
                    <div style={{ fontSize: 11, color: col, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#f0f0ee", padding: 4, borderRadius: 10, width: "fit-content" }}>
              {[["courses","Courses"],["registrations","Registrations"],["users","Users"]].map(([t,l]) => (
                <button key={t} className={`tab-btn ${adminTab===t?"active":""}`} onClick={() => setAdminTab(t)}>{l}</button>
              ))}
            </div>

            {/* COURSES tab */}
            {adminTab === "courses" && (
              <>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                  <button onClick={() => setModal({ type: "courseForm" })} style={btnPrimary}>+ Add Course</button>
                </div>
                <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #eee", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: "#f9f9f7", borderBottom: "1px solid #eee" }}>
                        {["Course","Instructor","Schedule","Capacity","Level","Actions"].map(h => (
                          <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.3px" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((c, i) => (
                        <tr key={c.id} style={{ borderBottom: i < courses.length-1 ? "1px solid #f0f0f0" : "none" }}>
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ fontWeight: 600, color: "#1a1a2e" }}>{c.title}</div>
                            <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{c.category} · {c.fee}</div>
                          </td>
                          <td style={{ padding: "14px 16px", color: "#555" }}>{c.instructor}</td>
                          <td style={{ padding: "14px 16px", color: "#666", fontSize: 13 }}>{c.schedule}</td>
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ fontSize: 13, color: "#555" }}>{c.enrolled}/{c.capacity}</div>
                            <div style={{ height: 4, background: "#eee", borderRadius: 99, marginTop: 4, width: 80 }}>
                              <div style={{ height: "100%", width: `${Math.round(c.enrolled/c.capacity*100)}%`, background: c.enrolled>=c.capacity?"#D85A30":"#1D9E75", borderRadius: 99 }} />
                            </div>
                          </td>
                          <td style={{ padding: "14px 16px" }}><LevelBadge level={c.level} /></td>
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button onClick={() => setModal({ type: "courseForm", courseId: c.id, course: c })} style={{ ...btnSecondary, padding: "6px 12px", fontSize: 12 }}>Edit</button>
                              <button onClick={() => deleteCourse(c.id)} style={btnDanger}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* REGISTRATIONS tab */}
            {adminTab === "registrations" && (
              <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #eee", overflow: "hidden" }}>
                {registrations.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "48px", color: "#bbb" }}>No registrations yet.</div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: "#f9f9f7", borderBottom: "1px solid #eee" }}>
                        {["Student","Course","Date","Status","Actions"].map(h => (
                          <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.3px" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map((r, i) => {
                        const course = courses.find(c => c.id === r.courseId);
                        return (
                          <tr key={r.id} style={{ borderBottom: i < registrations.length-1 ? "1px solid #f0f0f0" : "none" }}>
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ fontWeight: 600, color: "#1a1a2e" }}>{r.userName}</div>
                              <div style={{ fontSize: 12, color: "#aaa" }}>{r.userEmail}</div>
                            </td>
                            <td style={{ padding: "14px 16px", color: "#555" }}>{course?.title || "Deleted"}</td>
                            <td style={{ padding: "14px 16px", color: "#888", fontSize: 13 }}>{r.date}</td>
                            <td style={{ padding: "14px 16px" }}><Badge status={r.status} /></td>
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ display: "flex", gap: 8 }}>
                                {r.status !== "accepted" && (
                                  <button onClick={() => updateRegStatus(r.id, "accepted")} style={btnSuccess}>Accept</button>
                                )}
                                {r.status !== "rejected" && (
                                  <button onClick={() => updateRegStatus(r.id, "rejected")} style={btnDanger}>Reject</button>
                                )}
                                {r.status !== "pending" && (
                                  <button onClick={() => updateRegStatus(r.id, "pending")} style={{ ...btnSecondary, padding: "7px 12px", fontSize: 13 }}>Reset</button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* USERS tab */}
            {adminTab === "users" && (
              <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #eee", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: "#f9f9f7", borderBottom: "1px solid #eee" }}>
                      {["Name","Email","Role","Registrations"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.3px" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => {
                      const uRegs = registrations.filter(r => r.userId === u.id);
                      return (
                        <tr key={u.id} style={{ borderBottom: i < users.length-1 ? "1px solid #f0f0f0" : "none" }}>
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 34, height: 34, borderRadius: "50%", background: u.role === "admin" ? "#1a1a2e" : "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: u.role === "admin" ? "#fff" : "#185FA5" }}>
                                {u.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                              </div>
                              <span style={{ fontWeight: 600, color: "#1a1a2e" }}>{u.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: "14px 16px", color: "#555" }}>{u.email}</td>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{ background: u.role === "admin" ? "#1a1a2e" : "#f0f0f0", color: u.role === "admin" ? "#fff" : "#555", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.4px" }}>{u.role}</span>
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {uRegs.length === 0 ? <span style={{ color: "#ccc", fontSize: 13 }}>None</span> :
                                uRegs.map(r => (
                                  <span key={r.id} style={{ fontSize: 12, background: "#f5f5f0", color: "#555", padding: "2px 8px", borderRadius: 6 }}>
                                    {courses.find(c=>c.id===r.courseId)?.title?.split(" ").slice(0,2).join(" ")} · {STATUS_STYLE[r.status].label}
                                  </span>
                                ))
                              }
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── MODALS ─── */}
        {modal?.type === "courseForm" && (
          <Modal title={modal.courseId ? "Edit Course" : "New Course"} onClose={() => setModal(null)} wide>
            <CourseForm course={modal.course} onSave={saveCourse} onClose={() => setModal(null)} />
          </Modal>
        )}

        {modal?.type === "enroll" && (
          <Modal title="Confirm Registration" onClose={() => setModal(null)}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 17, color: "#1a1a2e", marginBottom: 6 }}>{modal.course.title}</div>
              <div style={{ fontSize: 14, color: "#888", marginBottom: 16 }}>by {modal.course.instructor}</div>
              {[["Schedule", modal.course.schedule],["Duration", modal.course.duration],["Start Date", modal.course.startDate],["Fee", modal.course.fee]].map(([l,v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f5f5f5", fontSize: 14 }}>
                  <span style={{ color: "#888" }}>{l}</span>
                  <span style={{ fontWeight: 500, color: "#333" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#FAEEDA", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#854F0B", marginBottom: 20 }}>
              Your registration will be reviewed and a decision will be communicated.
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => setModal(null)} style={btnSecondary}>Cancel</button>
              <button onClick={() => enroll(modal.course.id)} style={btnPrimary}>Confirm Registration</button>
            </div>
          </Modal>
        )}

        {modal?.type === "courseDetail" && (
          <Modal title={modal.course.title} onClose={() => setModal(null)} wide>
            <div>
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <LevelBadge level={modal.course.level} />
                <span style={{ background: "#f0f0f0", color: "#555", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>{modal.course.category}</span>
                {modal.myReg && <Badge status={modal.myReg.status} />}
              </div>
              <p style={{ color: "#555", lineHeight: 1.7, marginBottom: 20, fontSize: 14 }}>{modal.course.description}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px", marginBottom: 20 }}>
                {[["Instructor", modal.course.instructor],["Schedule", modal.course.schedule],["Duration", modal.course.duration],["Start Date", modal.course.startDate],["Fee", modal.course.fee],["Capacity", `${modal.course.enrolled}/${modal.course.capacity} enrolled`]].map(([l,v]) => (
                  <div key={l} style={{ background: "#f9f9f7", padding: "12px 14px", borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: "#aaa", fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#1a1a2e" }}>{v}</div>
                  </div>
                ))}
              </div>
              {!modal.myReg && modal.course.enrolled < modal.course.capacity ? (
                <button onClick={() => { setModal({ type: "enroll", course: modal.course }); }} style={{ ...btnPrimary, width: "100%", padding: "12px" }}>Register for This Course</button>
              ) : modal.myReg ? (
                <div style={{ textAlign: "center", padding: "12px", background: STATUS_STYLE[modal.myReg.status].bg, borderRadius: 10, color: STATUS_STYLE[modal.myReg.status].color, fontWeight: 600 }}>
                  Registration {STATUS_STYLE[modal.myReg.status].label}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "12px", background: "#f5f5f0", borderRadius: 10, color: "#aaa", fontWeight: 600 }}>Course is Full</div>
              )}
            </div>
          </Modal>
        )}

      </div>
    </>
  );
}
