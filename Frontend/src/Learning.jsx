import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "./config/api.js";

const featuredCollections = [
  { title: "AI Engineering", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995", level: "Intermediate", duration: "8 weeks" },
  { title: "Data Analytics", image: "https://images.unsplash.com/photo-1551281044-8a8d7f5f4b0e", level: "Beginner", duration: "6 weeks" },
  { title: "Cloud Fundamentals", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa", level: "Beginner", duration: "5 weeks" },
  { title: "Product Design", image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6", level: "Intermediate", duration: "7 weeks" },
  { title: "Cybersecurity Ops", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b", level: "Advanced", duration: "10 weeks" },
  { title: "Public Speaking", image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2", level: "Beginner", duration: "4 weeks" },
  { title: "Quantitative Finance", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f", level: "Advanced", duration: "9 weeks" },
  { title: "Creative Writing Lab", image: "https://images.unsplash.com/photo-1455390582262-044cdead277a", level: "Beginner", duration: "5 weeks" },
  { title: "Mobile App Architecture", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9", level: "Intermediate", duration: "8 weeks" },
  { title: "Deep Learning Systems", image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a", level: "Advanced", duration: "11 weeks" },
  { title: "Startup Product Studio", image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d", level: "Intermediate", duration: "6 weeks" },
  { title: "Leadership Communication", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c", level: "Beginner", duration: "4 weeks" },
  { title: "Robotics Foundations", image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e", level: "Intermediate", duration: "9 weeks" },
  { title: "Game AI Design", image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc", level: "Advanced", duration: "8 weeks" },
  { title: "Bioinformatics Basics", image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69", level: "Intermediate", duration: "7 weeks" },
  { title: "Design Systems Engineering", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085", level: "Intermediate", duration: "6 weeks" },
  { title: "Systems Programming", image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4", level: "Advanced", duration: "10 weeks" },
  { title: "Advanced SQL Warehousing", image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d", level: "Intermediate", duration: "7 weeks" },
  { title: "Digital Strategy", image: "https://images.unsplash.com/photo-1552664730-d307ca884978", level: "Beginner", duration: "5 weeks" },
  { title: "Computer Vision Practice", image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc", level: "Advanced", duration: "9 weeks" },
];

const stockImages = [
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
  "https://images.unsplash.com/photo-1513258496099-48168024aec0",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
  "https://images.unsplash.com/photo-1555949963-aa79dcee981c",
];

const popularCourses = [
  "Python Programming", "JavaScript Programming", "System Design", "Frontend Engineering", "Backend APIs",
  "Data Structures", "Algorithms", "SQL Mastery", "PostgreSQL", "DevOps Essentials",
  "Docker & Kubernetes", "Machine Learning", "Deep Learning", "Statistics", "Linear Algebra",
  "Product Management", "UI/UX Design", "Cloud Computing", "Cybersecurity", "Network Fundamentals",
  "Game Development", "React Development", "Node.js", "TypeScript", "Go Programming",
  "Rust Programming", "Mobile App Development", "Financial Literacy", "Digital Marketing", "Public Speaking",
  "Communication Skills", "Critical Thinking", "Research Methods", "Operating Systems", "Computer Networks",
  "MLOps", "Prompt Engineering", "NLP Fundamentals", "Computer Vision", "Reinforcement Learning",
  "Data Engineering", "Apache Spark", "Airflow Pipelines", "ETL Design", "Data Governance",
  "Distributed Databases", "Graph Databases", "MongoDB Fundamentals", "Redis Caching", "Event Driven Architecture",
  "Microservices Design", "API Security", "OAuth and Identity", "Cloud Networking", "Terraform Infrastructure",
  "SRE Fundamentals", "Monitoring and Observability", "Kotlin Android", "Swift iOS", "Flutter Development",
  "React Native", "Unity Game Dev", "Unreal Game Dev", "Shader Programming", "3D Math for Games",
  "Product Analytics", "A/B Testing", "Growth Marketing", "Behavioral Economics", "Negotiation Skills",
  "Team Leadership", "Public Policy Basics", "Research Writing", "Academic Reading", "Technical Blogging",
  "Technical Interview Prep", "Concurrency in Java", "Advanced C++", "Embedded C", "RTOS Fundamentals",
  "Assembly Basics", "Compilers", "Cryptography Foundations", "Applied Probability", "Numerical Methods",
  "Optimization Techniques", "Bayesian Statistics", "Financial Modeling", "Quant Trading Basics", "Blockchain Systems",
  "Smart Contracts", "Web3 Security", "Ethical Hacking", "Penetration Testing", "Incident Response",
  "Digital Forensics", "Serverless Architecture", "BigQuery Analytics", "Snowflake Essentials", "Power BI Dashboards",
  "Tableau Analytics", "Linux Mastery", "Shell Scripting", "Git Workflows", "CI/CD Pipelines",
  "Design Thinking", "User Research", "Interaction Design", "Typography Systems", "Motion Design",
  "Entrepreneurship", "Venture Finance", "Sales Fundamentals", "Brand Strategy", "Community Building",
  "Time Management", "Productivity Systems", "Learning How to Learn", "Cognitive Science Basics", "Applied Logic",
];

const focusBundles = [
  { name: "AI Full Stack", courses: ["Python Programming", "Linear Algebra", "Machine Learning", "Deep Learning", "MLOps", "Prompt Engineering"] },
  { name: "Backend Mastery", courses: ["Backend APIs", "Node.js", "PostgreSQL", "Distributed Databases", "Event Driven Architecture", "API Security"] },
  { name: "Frontend Mastery", courses: ["Frontend Engineering", "React Development", "TypeScript", "Design Systems Engineering", "Interaction Design", "Motion Design"] },
  { name: "Data Career", courses: ["SQL Mastery", "Statistics", "Data Engineering", "Apache Spark", "Power BI Dashboards", "Tableau Analytics"] },
  { name: "Game Creator", courses: ["Game Development", "Unity Game Dev", "Unreal Game Dev", "Shader Programming", "Game AI Design", "3D Math for Games"] },
  { name: "Security Defender", courses: ["Cybersecurity", "Cryptography Foundations", "Ethical Hacking", "Penetration Testing", "Incident Response", "Digital Forensics"] },
  { name: "Cloud and DevOps", courses: ["Cloud Computing", "Terraform Infrastructure", "SRE Fundamentals", "Monitoring and Observability", "CI/CD Pipelines", "Docker & Kubernetes"] },
  { name: "Leadership Plus", courses: ["Communication Skills", "Team Leadership", "Negotiation Skills", "Product Management", "Public Speaking", "Design Thinking"] },
];

const STORAGE_KEYS = {
  progress: "learning.progress.v1",
  favorites: "learning.favorites.v1",
};

function randomImage() {
  return stockImages[Math.floor(Math.random() * stockImages.length)];
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function Learning() {
  const navigate = useNavigate();
  const location = useLocation();
  const aiAbortRef = useRef(null);

  const [courses, setCourses] = useState([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  const [showAIPopup, setShowAIPopup] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiCourse, setAiCourse] = useState(null);
  const [aiTitle, setAiTitle] = useState("");
  const [extending, setExtending] = useState(false);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [addQuery, setAddQuery] = useState("");
  const [customCourse, setCustomCourse] = useState("");

  const [progressMap, setProgressMap] = useState(() => readJSON(STORAGE_KEYS.progress, {}));
  const [favorites, setFavorites] = useState(() => readJSON(STORAGE_KEYS.favorites, []));

  useEffect(() => {
    fetch(API_ENDPOINTS.learning, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setCourses(data.courses || []))
      .catch(() => alert("Failed to load courses."));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progressMap));
  }, [progressMap]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (location.state?.reopenCourse && location.state.courseTitle) {
      openAICurriculum(location.state.courseTitle);
    }
  }, [location.state]);

  const filteredCourses = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = courses.filter((c) => c.title.toLowerCase().includes(term));

    if (sortBy === "title") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "progress") {
      list = [...list].sort((a, b) => (progressMap[b.id] || 0) - (progressMap[a.id] || 0));
    }

    return list;
  }, [courses, search, sortBy, progressMap]);

  const addableCourses = useMemo(() => {
    const q = addQuery.trim().toLowerCase();
    return popularCourses.filter((name) => name.toLowerCase().includes(q));
  }, [addQuery]);

  const stats = useMemo(() => {
    const total = courses.length;
    const completed = courses.filter((c) => (progressMap[c.id] || 0) >= 100).length;
    const avgProgress = total
      ? Math.round(courses.reduce((sum, c) => sum + (progressMap[c.id] || 0), 0) / total)
      : 0;
    return { total, completed, avgProgress, favorites: favorites.length };
  }, [courses, progressMap, favorites]);

  function addCourse(title) {
    if (!title || !title.trim()) return;

    fetch(API_ENDPOINTS.learning, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), image_url: randomImage() }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.course) {
          setCourses((prev) => [data.course, ...prev]);
          setCustomCourse("");
          setShowAddPopup(false);
        }
      })
      .catch(() => alert("Failed to add course."));
  }

  async function addBundle(bundle) {
    const existingTitles = new Set(courses.map((c) => c.title.toLowerCase()));
    const toCreate = bundle.courses.filter((title) => !existingTitles.has(title.toLowerCase()));
    if (toCreate.length === 0) return;

    try {
      const results = await Promise.all(
        toCreate.map((title) =>
          fetch(API_ENDPOINTS.learning, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, image_url: randomImage() }),
          }).then((res) => res.json())
        )
      );

      const created = results.map((r) => r.course).filter(Boolean);
      if (created.length) {
        setCourses((prev) => [...created, ...prev]);
      }
    } catch {
      alert("Failed to add focus bundle.");
    }
  }

  function requestDelete(course) {
    setCourseToDelete(course);
    setShowDeletePopup(true);
  }

  function confirmDelete() {
    fetch(`${API_ENDPOINTS.learning}/${courseToDelete.id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then(() => {
        setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
        setShowDeletePopup(false);
        setCourseToDelete(null);
      })
      .catch(() => alert("Failed to delete course."));
  }

  function toggleFavorite(courseId) {
    setFavorites((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  }

  function updateProgress(courseId, value) {
    setProgressMap((prev) => ({ ...prev, [courseId]: Number(value) }));
  }

  async function openAICurriculum(title) {
    setShowAIPopup(true);
    setAiLoading(true);
    setAiError(null);
    setAiCourse(null);
    setAiTitle(title);

    if (aiAbortRef.current) aiAbortRef.current.abort();
    const controller = new AbortController();
    aiAbortRef.current = controller;

    try {
      const res = await fetch(API_ENDPOINTS.aiGenerateCourse, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
        signal: controller.signal,
      });

      const data = await res.json();
      if (!data.course) throw new Error("No course returned");
      setAiCourse(data.course);
    } catch (err) {
      if (err.name !== "AbortError") setAiError("Failed to load course.");
    } finally {
      setAiLoading(false);
    }
  }

  async function extendCourse() {
    if (!aiTitle) return;
    setExtending(true);

    try {
      await fetch(API_ENDPOINTS.aiExtendCourse, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: aiTitle }),
      });
      await openAICurriculum(aiTitle);
    } catch {
      setAiError("Failed to extend course.");
    } finally {
      setExtending(false);
    }
  }

  const totalLessons = aiCourse
    ? aiCourse.modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)
    : 0;

  return (
    <div style={{ padding: "32px", maxWidth: "1240px", margin: "0 auto" }}>
      <section style={heroStyle}>
        <div>
          <h1 style={{ color: "#0f172a", margin: 0, fontSize: "32px" }}>Learning Studio</h1>
          <p style={{ color: "#334155", marginTop: "8px", marginBottom: 0 }}>
            Build skills through curated paths, AI-generated curriculum, and measurable progress.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button onClick={() => setShowAddPopup(true)} style={btnPrimary}>+ Add Course</button>
          <button onClick={() => setDeleteMode((p) => !p)} style={deleteMode ? btnNeutral : btnDanger}>
            {deleteMode ? "Done" : "Remove Course"}
          </button>
        </div>
      </section>

      <section style={statsGrid}>
        <MetricCard title="Courses" value={stats.total} subtitle="Your active library" />
        <MetricCard title="Completed" value={stats.completed} subtitle="Progress reached 100%" />
        <MetricCard title="Avg Progress" value={`${stats.avgProgress}%`} subtitle="Across all courses" />
        <MetricCard title="Favorites" value={stats.favorites} subtitle="Quick access picks" />
      </section>

      <h2 style={{ ...sectionTitle, marginTop: "22px" }}>Curriculum Focus Packs</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
        {focusBundles.map((bundle) => (
          <div key={bundle.name} style={cardPanel}>
            <div style={{ fontWeight: 800, color: "#0f172a" }}>{bundle.name}</div>
            <div style={{ color: "#64748b", fontSize: "12px", marginTop: "5px" }}>
              {bundle.courses.length} courses
            </div>
            <div style={{ marginTop: "8px", color: "#334155", fontSize: "13px", lineHeight: 1.45 }}>
              {bundle.courses.slice(0, 3).join(" • ")}
              {bundle.courses.length > 3 ? " • ..." : ""}
            </div>
            <button
              onClick={() => addBundle(bundle)}
              style={{ ...btnPrimary, marginTop: "10px", width: "100%" }}
            >
              Add Full Pack
            </button>
          </div>
        ))}
      </div>

      <section style={{ ...cardPanel, marginTop: "20px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your courses"
            style={{ ...inputStyle, minWidth: "260px" }}
          />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={inputStyle}>
            <option value="recent">Sort: Recent</option>
            <option value="title">Sort: Title</option>
            <option value="progress">Sort: Progress</option>
          </select>
        </div>
      </section>

      <h2 style={sectionTitle}>My Courses</h2>
      <div style={gridStyle}>
        {filteredCourses.length === 0 && <div style={{ color: "#64748b" }}>No courses matched your search.</div>}
        {filteredCourses.map((c) => (
          <CourseCard
            key={c.id}
            course={c}
            progress={progressMap[c.id] || 0}
            favorite={favorites.includes(c.id)}
            deletable={deleteMode}
            onDelete={() => requestDelete(c)}
            onToggleFavorite={() => toggleFavorite(c.id)}
            onProgress={(value) => updateProgress(c.id, value)}
            onOpen={() => !deleteMode && openAICurriculum(c.title)}
          />
        ))}
      </div>

      <h2 style={{ ...sectionTitle, marginTop: "40px" }}>New Curriculum Paths</h2>
      <div style={gridStyle}>
        {featuredCollections.map((c) => (
          <div key={c.title} style={featuredCardStyle} onClick={() => openAICurriculum(c.title)}>
            <img src={c.image} alt={c.title} style={{ width: "100%", height: 150, objectFit: "cover" }} />
            <div style={{ padding: "14px" }}>
              <div style={{ fontWeight: 700, color: "#0f172a" }}>{c.title}</div>
              <div style={{ color: "#475569", fontSize: "13px", marginTop: "6px" }}>
                {c.level} • {c.duration}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddPopup && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, maxWidth: "760px", maxHeight: "80vh", overflow: "hidden" }}>
            <button onClick={() => setShowAddPopup(false)} style={closeBtn}>x</button>
            <h2 style={{ color: "#0f172a", marginTop: 0 }}>Add Curriculum</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "10px", marginBottom: "14px" }}>
              <input
                value={customCourse}
                onChange={(e) => setCustomCourse(e.target.value)}
                placeholder="Create custom course title"
                style={inputStyle}
              />
              <button onClick={() => addCourse(customCourse)} style={btnPrimary}>Create</button>
            </div>

            <input
              value={addQuery}
              onChange={(e) => setAddQuery(e.target.value)}
              placeholder="Search popular courses"
              style={{ ...inputStyle, marginBottom: "12px", width: "100%" }}
            />

            <div style={{ overflowY: "auto", maxHeight: "52vh", paddingRight: "6px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
                {addableCourses.map((name) => (
                  <button key={name} onClick={() => addCourse(name)} style={addCourseButtonStyle}>
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeletePopup && courseToDelete && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, maxWidth: "420px", textAlign: "center" }}>
            <h3 style={{ marginTop: 0, color: "#0f172a" }}>Remove Course</h3>
            <p style={{ color: "#475569" }}>
              Remove <strong>{courseToDelete.title}</strong> from your library?
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <button onClick={() => setShowDeletePopup(false)} style={btnNeutral}>Cancel</button>
              <button onClick={confirmDelete} style={btnDanger}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {showAIPopup && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, maxWidth: "920px", maxHeight: "86vh", overflow: "auto" }}>
            <button
              onClick={() => {
                if (aiAbortRef.current) aiAbortRef.current.abort();
                setShowAIPopup(false);
              }}
              style={closeBtn}
            >
              x
            </button>

            <h2 style={{ color: "#0f172a", marginTop: 0 }}>{aiTitle}</h2>
            {aiLoading && <p style={{ color: "#334155" }}>Generating curriculum...</p>}
            {aiError && <p style={{ color: "#b91c1c" }}>{aiError}</p>}

            {aiCourse && (
              <>
                <div style={{ ...cardPanel, marginBottom: "14px", display: "flex", gap: "24px", flexWrap: "wrap" }}>
                  <span><strong>Modules:</strong> {aiCourse.modules.length}</span>
                  <span><strong>Lessons:</strong> {totalLessons}</span>
                </div>

                <p style={{ color: "#334155", lineHeight: 1.6 }}>{aiCourse.description}</p>

                {aiCourse.modules.map((m, i) => (
                  <div key={i} style={{ ...cardPanel, marginBottom: "12px" }}>
                    <h3 style={{ marginTop: 0, color: "#0f172a" }}>Module {i + 1}: {m.title}</h3>
                    <div style={{ display: "grid", gap: "8px" }}>
                      {m.lessons.map((l, j) => (
                        <button
                          key={l.id || j}
                          onClick={() =>
                            l.id &&
                            navigate(`/home/learning/lesson/${l.id}`, {
                              state: { reopenCourse: true, courseTitle: aiTitle },
                            })
                          }
                          style={{
                            ...lessonButtonStyle,
                            cursor: l.id ? "pointer" : "not-allowed",
                            opacity: l.id ? 1 : 0.7,
                          }}
                        >
                          Lesson {j + 1}: {l.title}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div style={{ textAlign: "center", marginTop: "14px" }}>
                  <button onClick={extendCourse} disabled={extending} style={btnPrimary}>
                    {extending ? "Extending..." : "+ Generate More Modules"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CourseCard({
  course,
  progress,
  favorite,
  deletable,
  onDelete,
  onToggleFavorite,
  onProgress,
  onOpen,
}) {
  return (
    <div style={courseCardStyle} onClick={onOpen}>
      {deletable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={deleteXStyle}
        >
          x
        </button>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        style={{ ...favButtonStyle, background: favorite ? "#f59e0b" : "rgba(15,23,42,0.65)" }}
      >
        {favorite ? "Fav" : "+Fav"}
      </button>

      <img src={course.image_url} alt={course.title} style={{ width: "100%", height: 150, objectFit: "cover" }} />

      <div style={{ padding: "12px" }}>
        <div style={{ fontWeight: 700, color: "#0f172a" }}>{course.title}</div>

        <div style={{ marginTop: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#475569" }}>
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onProgress(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle }) {
  return (
    <div style={metricCardStyle}>
      <div style={{ color: "#475569", fontSize: "13px" }}>{title}</div>
      <div style={{ color: "#0f172a", fontSize: "28px", fontWeight: 800 }}>{value}</div>
      <div style={{ color: "#64748b", fontSize: "12px" }}>{subtitle}</div>
    </div>
  );
}

const heroStyle = {
  background: "linear-gradient(130deg, #f8fafc, #e2e8f0)",
  borderRadius: "18px",
  padding: "22px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "14px",
  flexWrap: "wrap",
  border: "1px solid rgba(148,163,184,0.35)",
};

const statsGrid = {
  marginTop: "16px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px",
};

const metricCardStyle = {
  background: "rgba(255,255,255,0.92)",
  borderRadius: "14px",
  padding: "16px",
  border: "1px solid rgba(148,163,184,0.28)",
  boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
};

const cardPanel = {
  background: "rgba(255,255,255,0.9)",
  borderRadius: "14px",
  padding: "14px",
  border: "1px solid rgba(148,163,184,0.26)",
};

const sectionTitle = {
  color: "#0f172a",
  marginTop: "28px",
  marginBottom: "12px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
  gap: "14px",
};

const courseCardStyle = {
  background: "white",
  borderRadius: "14px",
  overflow: "hidden",
  boxShadow: "0 12px 26px rgba(15,23,42,0.1)",
  position: "relative",
  border: "1px solid rgba(148,163,184,0.2)",
  cursor: "pointer",
};

const featuredCardStyle = {
  background: "#f8fafc",
  borderRadius: "14px",
  overflow: "hidden",
  border: "1px solid rgba(148,163,184,0.3)",
  boxShadow: "0 10px 20px rgba(15,23,42,0.08)",
  cursor: "pointer",
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(2,6,23,0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 120,
  padding: "16px",
};

const modalStyle = {
  width: "100%",
  background: "white",
  borderRadius: "16px",
  padding: "20px",
  position: "relative",
  boxShadow: "0 30px 50px rgba(2,6,23,0.35)",
};

const closeBtn = {
  position: "absolute",
  top: 12,
  right: 12,
  border: "none",
  background: "transparent",
  fontSize: 18,
  cursor: "pointer",
};

const inputStyle = {
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  padding: "9px 11px",
  fontSize: "14px",
  outline: "none",
};

const btnPrimary = {
  padding: "9px 14px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const btnDanger = {
  padding: "9px 14px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(135deg, #ef4444, #dc2626)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const btnNeutral = {
  padding: "9px 14px",
  borderRadius: "10px",
  border: "none",
  background: "#64748b",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const addCourseButtonStyle = {
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  padding: "10px",
  cursor: "pointer",
  background: "#f8fafc",
  color: "#0f172a",
  fontWeight: 600,
};

const lessonButtonStyle = {
  textAlign: "left",
  width: "100%",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  padding: "10px",
  background: "#f8fafc",
  color: "#0f172a",
};

const deleteXStyle = {
  position: "absolute",
  top: 8,
  right: 8,
  width: 26,
  height: 26,
  border: "none",
  borderRadius: "999px",
  background: "rgba(220,38,38,0.95)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
  zIndex: 3,
};

const favButtonStyle = {
  position: "absolute",
  top: 8,
  left: 8,
  border: "none",
  borderRadius: "999px",
  color: "white",
  fontWeight: 700,
  fontSize: "11px",
  padding: "5px 8px",
  cursor: "pointer",
  zIndex: 3,
};

export default Learning;
