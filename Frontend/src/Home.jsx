import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "./config/api.js";

function Home() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [games, setGames] = useState([]);
  const [sports, setSports] = useState([]);
  const [activity, setActivity] = useState([]);
  const [stats, setStats] = useState({
    level: 1,
    xp: 0,
    tasksCompleted: 0,
    streakDays: 0,
    coins: 0,
    bestWpm: 0,
  });

  const [weeklyGoal, setWeeklyGoal] = useState(() => {
    const saved = Number(localStorage.getItem("weeklyGoal") || 20);
    return Number.isFinite(saved) && saved > 0 ? saved : 20;
  });

  useEffect(() => {
    fetch(API_ENDPOINTS.learning, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setCourses((data.courses || []).slice(0, 4)))
      .catch(() => {});

    fetch(API_ENDPOINTS.gaming, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setGames((data.games || []).slice(0, 4)))
      .catch(() => {});

    fetch(API_ENDPOINTS.sports, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setSports((data.programs || []).slice(0, 4)))
      .catch(() => {});

    fetch(API_ENDPOINTS.usersDashboard, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.stats) setStats(data.stats);
        if (Array.isArray(data?.activity)) setActivity(data.activity);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem("weeklyGoal", String(weeklyGoal));
  }, [weeklyGoal]);

  const goalProgress = Math.min(100, Math.round((stats.tasksCompleted / weeklyGoal) * 100));

  const todayPlan = useMemo(() => {
    const steps = [];
    if (courses.length) steps.push(`Finish 1 lesson in ${courses[0].title}`);
    if (games.length) steps.push(`Play a 10-minute ${games[0].title} session`);
    if (sports.length) steps.push(`Complete 1 workout block in ${sports[0].title}`);
    if (!steps.length) steps.push("Add your first module from learning, gaming, or sports.");
    return steps;
  }, [courses, games, sports]);

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <section style={heroStyle}>
          <div>
            <div style={heroPillStyle}>Dashboard</div>
            <h1 style={{ margin: "10px 0 6px", color: "#0f172a", fontSize: "34px" }}>Welcome back</h1>
            <p style={{ color: "#334155", margin: 0, lineHeight: 1.6 }}>
              Keep your momentum: learn, train, and game every day with focused goals.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <QuickAction label="Go Learning" onClick={() => navigate("/home/learning")} />
            <QuickAction label="Go Gaming" onClick={() => navigate("/home/gaming")} />
            <QuickAction label="Go Sports" onClick={() => navigate("/home/sports")} />
          </div>
        </section>

        <section style={statsGridStyle}>
          <DashboardCard title="XP Level" value={stats.level} subtitle={`${stats.xp} XP total`} />
          <DashboardCard title="Tasks Completed" value={stats.tasksCompleted} subtitle="Across your modules" />
          <DashboardCard title="Streak" value={`${stats.streakDays} days`} subtitle="Recent active days" />
          <DashboardCard title="Coins" value={stats.coins} subtitle={`Best WPM: ${stats.bestWpm}`} />
        </section>

        <section style={splitGridStyle}>
          <div style={panelStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <strong style={{ color: "#0f172a" }}>Weekly Goal Progress</strong>
              <label style={{ fontSize: "13px", color: "#475569" }}>
                Goal:
                <input
                  type="number"
                  min="1"
                  value={weeklyGoal}
                  onChange={(e) => setWeeklyGoal(Math.max(1, Number(e.target.value) || 1))}
                  style={goalInputStyle}
                />
              </label>
            </div>

            <div style={progressTrackStyle}>
              <div style={{ ...progressFillStyle, width: `${goalProgress}%` }} />
            </div>
            <div style={{ marginTop: "8px", color: "#334155", fontSize: "13px" }}>
              {stats.tasksCompleted}/{weeklyGoal} tasks complete ({goalProgress}%)
            </div>
          </div>

          <div style={panelStyle}>
            <strong style={{ color: "#0f172a" }}>Today Plan</strong>
            <div style={{ marginTop: "8px", display: "grid", gap: "8px" }}>
              {todayPlan.map((step, i) => (
                <div key={i} style={planRowStyle}>{step}</div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ marginTop: "28px" }}>
          <h2 style={sectionTitleStyle}>Recent Activity</h2>
          <div style={panelStyle}>
            {activity.length === 0 && <p style={{ margin: 0, color: "#475569" }}>No activity yet. Start a course or game.</p>}
            {activity.map((line, i) => (
              <p key={i} style={{ margin: "0 0 8px", color: "#1e293b" }}>• {line}</p>
            ))}
          </div>
        </section>

        <Section title="Recent Courses" items={courses} onClickItem={() => navigate("/home/learning")} />
        <Section title="Recent Games" items={games} onClickItem={() => navigate("/home/gaming")} />
        <Section title="Recent Sports" items={sports} onClickItem={() => navigate("/home/sports")} />
      </div>
    </div>
  );
}

function Section({ title, items, onClickItem }) {
  return (
    <section style={{ marginTop: "32px" }}>
      <h2 style={sectionTitleStyle}>{title}</h2>

      <div style={sectionGridStyle}>
        {items.length === 0 && <div style={{ color: "#475569" }}>No items yet.</div>}

        {items.map((item) => (
          <MiniCard key={item.id} title={item.title} image={item.image_url} onClick={() => onClickItem(item)} />
        ))}
      </div>
    </section>
  );
}

function DashboardCard({ title, value, subtitle }) {
  return (
    <div style={metricCardStyle}>
      <div style={{ color: "#64748b", fontSize: "13px" }}>{title}</div>
      <div style={{ fontSize: "30px", fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>{value}</div>
      <div style={{ color: "#475569", fontSize: "12px" }}>{subtitle}</div>
    </div>
  );
}

function QuickAction({ label, onClick }) {
  return (
    <button onClick={onClick} style={quickActionStyle}>
      {label}
    </button>
  );
}

function MiniCard({ title, image, onClick }) {
  return (
    <button onClick={onClick} style={miniCardStyle}>
      {image && <img src={image} alt={title} style={miniCardImageStyle} />}
      <div style={{ padding: "12px", fontWeight: 700, color: "#0f172a", textAlign: "left" }}>{title}</div>
    </button>
  );
}

const pageStyle = {
  minHeight: "100vh",
  width: "100%",
  background: "transparent",
};

const containerStyle = {
  padding: "30px 20px 40px",
  maxWidth: "1120px",
  margin: "0 auto",
};

const heroStyle = {
  background: "linear-gradient(135deg, rgba(248,250,252,0.95), rgba(226,232,240,0.9))",
  borderRadius: "20px",
  padding: "22px",
  border: "1px solid rgba(148,163,184,0.34)",
  marginBottom: "16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "14px",
  flexWrap: "wrap",
  boxShadow: "0 16px 34px rgba(15,23,42,0.08)",
};

const heroPillStyle = {
  display: "inline-flex",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "rgba(14,165,233,0.14)",
  border: "1px solid rgba(14,165,233,0.3)",
  color: "#0369a1",
  fontSize: "12px",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px",
};

const metricCardStyle = {
  background: "rgba(255,255,255,0.92)",
  borderRadius: "14px",
  padding: "16px",
  boxShadow: "0 10px 28px rgba(15,23,42,0.08)",
  border: "1px solid rgba(148,163,184,0.26)",
  textAlign: "left",
};

const splitGridStyle = {
  marginTop: "12px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "12px",
};

const panelStyle = {
  background: "rgba(255,255,255,0.9)",
  borderRadius: "14px",
  padding: "16px",
  boxShadow: "0 10px 28px rgba(15,23,42,0.08)",
  border: "1px solid rgba(148,163,184,0.26)",
  color: "#1e293b",
};

const goalInputStyle = {
  marginLeft: "8px",
  width: "74px",
  padding: "5px 7px",
  borderRadius: "7px",
  border: "1px solid #cbd5e1",
};

const progressTrackStyle = {
  width: "100%",
  height: "10px",
  marginTop: "10px",
  background: "#dbeafe",
  borderRadius: "999px",
  overflow: "hidden",
};

const progressFillStyle = {
  height: "100%",
  background: "linear-gradient(90deg, #2563eb, #1d4ed8)",
};

const planRowStyle = {
  background: "#f8fafc",
  border: "1px solid rgba(148,163,184,0.3)",
  borderRadius: "10px",
  padding: "8px 10px",
  color: "#334155",
  fontSize: "14px",
};

const sectionTitleStyle = {
  color: "#0f172a",
  marginBottom: "12px",
  fontSize: "22px",
};

const sectionGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: "12px",
};

const quickActionStyle = {
  border: "none",
  borderRadius: "10px",
  padding: "10px 14px",
  background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 10px 20px rgba(37,99,235,0.24)",
};

const miniCardStyle = {
  background: "rgba(255,255,255,0.92)",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 8px 22px rgba(15,23,42,0.09)",
  cursor: "pointer",
  border: "1px solid rgba(148,163,184,0.25)",
  padding: 0,
};

const miniCardImageStyle = {
  width: "100%",
  height: "124px",
  objectFit: "cover",
  display: "block",
};

export default Home;
