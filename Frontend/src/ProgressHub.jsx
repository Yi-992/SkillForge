import { useEffect, useMemo, useState } from "react";
import { API_ENDPOINTS } from "./config/api.js";

const HUB_KEY = "progress.hub.v1";

function readHub() {
  try {
    return JSON.parse(localStorage.getItem(HUB_KEY) || "{}");
  } catch {
    return {};
  }
}

function ProgressHub() {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [games, setGames] = useState([]);
  const [sports, setSports] = useState([]);

  const [hubState, setHubState] = useState(() => ({
    weeklyTarget: 5,
    priorities: ["Finish one lesson", "Play one focus game", "Complete one workout"],
    focusTheme: "Balanced",
    ...readHub(),
  }));

  useEffect(() => {
    localStorage.setItem(HUB_KEY, JSON.stringify(hubState));
  }, [hubState]);

  useEffect(() => {
    fetch(API_ENDPOINTS.usersDashboard, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setStats(data.stats || null))
      .catch(() => {});

    fetch(API_ENDPOINTS.learning, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setCourses(data.courses || []))
      .catch(() => {});

    fetch(API_ENDPOINTS.gaming, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setGames(data.games || []))
      .catch(() => {});

    fetch(API_ENDPOINTS.sports, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setSports(data.programs || []))
      .catch(() => {});
  }, []);

  const recommendations = useMemo(() => {
    const items = [];
    if (courses.length < 3) items.push("Add more learning tracks to diversify your skillset.");
    if (games.length < 2) items.push("Add at least two games for cognitive cross-training.");
    if (sports.length < 2) items.push("Create another sports plan for active recovery days.");
    if ((stats?.bestWpm || 0) < 60) items.push("Schedule 10-minute speed typing drills to improve WPM.");
    if ((stats?.streakDays || 0) < 3) items.push("Focus on consistency: complete one activity daily for 3 days.");
    if (items.length === 0) items.push("Great balance. Increase weekly target slightly for steady growth.");
    return items;
  }, [courses.length, games.length, sports.length, stats?.bestWpm, stats?.streakDays]);

  const progressRatio = Math.min(100, Math.round(((stats?.tasksCompleted || 0) / Math.max(1, hubState.weeklyTarget)) * 100));

  const consistencyScore = Math.min(
    100,
    Math.round((stats?.streakDays || 0) * 8 + (stats?.tasksCompleted || 0) * 2)
  );

  const nextAction = useMemo(() => {
    if (courses.length === 0) return "Add your first learning track.";
    if (games.length === 0) return "Add a reaction or strategy game module.";
    if (sports.length === 0) return "Add a sports program and set 3 training days.";
    return "Complete one priority item before adding a new module.";
  }, [courses.length, games.length, sports.length]);

  function updatePriority(index, value) {
    setHubState((s) => {
      const copy = [...s.priorities];
      copy[index] = value;
      return { ...s, priorities: copy };
    });
  }

  return (
    <div style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <div style={pillStyle}>Execution Center</div>
          <h1 style={{ margin: "8px 0 4px", color: "#0f172a" }}>Progress Hub</h1>
          <p style={{ margin: 0, color: "#334155" }}>
            Your command center for goals, recommendations, and weekly execution.
          </p>
        </div>

        <div style={{ display: "grid", gap: "8px" }}>
          <label style={labelStyle}>Focus Theme</label>
          <select
            value={hubState.focusTheme}
            onChange={(e) => setHubState((s) => ({ ...s, focusTheme: e.target.value }))}
            style={inputStyle}
          >
            <option>Balanced</option>
            <option>Learning First</option>
            <option>Competitive Gaming</option>
            <option>Athlete Mode</option>
          </select>
        </div>
      </section>

      <section style={statsGrid}>
        <Metric title="XP" value={stats?.xp ?? 0} subtitle="Overall progress points" />
        <Metric title="Level" value={stats?.level ?? 1} subtitle="Current mastery stage" />
        <Metric title="Streak" value={`${stats?.streakDays ?? 0} days`} subtitle="Consistency window" />
        <Metric title="Coins" value={stats?.coins ?? 0} subtitle="Rewards bank" />
      </section>

      <section style={splitGridStyle}>
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <strong>Weekly Mission</strong>
            <label style={{ color: "#475569", fontSize: "13px" }}>
              Target activities:
              <input
                type="number"
                min="1"
                value={hubState.weeklyTarget}
                onChange={(e) => setHubState((s) => ({ ...s, weeklyTarget: Math.max(1, Number(e.target.value) || 1) }))}
                style={{ ...smallInputStyle, marginLeft: "8px" }}
              />
            </label>
          </div>

          <div style={trackStyle}>
            <div style={{ ...fillStyle, width: `${progressRatio}%` }} />
          </div>
          <div style={{ marginTop: "6px", color: "#334155", fontSize: "13px" }}>
            {stats?.tasksCompleted ?? 0}/{hubState.weeklyTarget} completed ({progressRatio}%)
          </div>
        </div>

        <div style={cardStyle}>
          <strong>Performance Snapshot</strong>
          <div style={{ marginTop: "8px", display: "grid", gap: "8px" }}>
            <div style={badgeRowStyle}>Consistency Score: {consistencyScore}%</div>
            <div style={badgeRowStyle}>Next Action: {nextAction}</div>
          </div>
        </div>
      </section>

      <section style={gridTwo}>
        <div style={cardStyle}>
          <h2 style={cardTitle}>Top Recommendations</h2>
          <ul style={{ margin: 0, paddingLeft: "18px", color: "#334155", lineHeight: 1.7 }}>
            {recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>

        <div style={cardStyle}>
          <h2 style={cardTitle}>Priorities This Week</h2>
          {[0, 1, 2].map((i) => (
            <input
              key={i}
              value={hubState.priorities?.[i] || ""}
              onChange={(e) => updatePriority(i, e.target.value)}
              style={{ ...inputStyle, marginBottom: "8px" }}
            />
          ))}
          <div style={{ color: "#64748b", fontSize: "12px" }}>Tip: keep priorities specific and measurable.</div>
        </div>
      </section>

      <section style={gridThree}>
        <MiniList title="Learning Tracks" items={courses.map((c) => c.title).slice(0, 6)} empty="No courses yet." />
        <MiniList title="Game Library" items={games.map((g) => g.title).slice(0, 6)} empty="No games yet." />
        <MiniList title="Workout Plans" items={sports.map((s) => s.title).slice(0, 6)} empty="No sports programs yet." />
      </section>
    </div>
  );
}

function Metric({ title, value, subtitle }) {
  return (
    <div style={metricCardStyle}>
      <div style={{ color: "#64748b", fontSize: "13px" }}>{title}</div>
      <div style={{ color: "#0f172a", fontSize: "28px", fontWeight: 800 }}>{value}</div>
      <div style={{ color: "#64748b", fontSize: "12px" }}>{subtitle}</div>
    </div>
  );
}

function MiniList({ title, items, empty }) {
  return (
    <div style={cardStyle}>
      <h3 style={{ margin: "0 0 8px", color: "#0f172a" }}>{title}</h3>
      {items.length === 0 ? (
        <div style={{ color: "#64748b", fontSize: "13px" }}>{empty}</div>
      ) : (
        <ul style={{ margin: 0, paddingLeft: "18px", color: "#334155", lineHeight: 1.7 }}>
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

const pageStyle = {
  padding: "30px 20px 40px",
  maxWidth: "1120px",
  margin: "0 auto",
};

const heroStyle = {
  background: "linear-gradient(130deg, rgba(248,250,252,0.95), rgba(226,232,240,0.9))",
  borderRadius: "18px",
  padding: "20px",
  border: "1px solid rgba(148,163,184,0.35)",
  marginBottom: "12px",
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  flexWrap: "wrap",
  boxShadow: "0 14px 30px rgba(15,23,42,0.08)",
};

const pillStyle = {
  display: "inline-flex",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "rgba(14,165,233,0.14)",
  border: "1px solid rgba(14,165,233,0.3)",
  color: "#0369a1",
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px",
  marginBottom: "12px",
};

const splitGridStyle = {
  marginBottom: "12px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "12px",
};

const metricCardStyle = {
  background: "rgba(255,255,255,0.92)",
  borderRadius: "14px",
  padding: "16px",
  border: "1px solid rgba(148,163,184,0.28)",
  boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
};

const cardStyle = {
  background: "rgba(255,255,255,0.92)",
  borderRadius: "14px",
  padding: "16px",
  border: "1px solid rgba(148,163,184,0.28)",
  boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
};

const trackStyle = {
  marginTop: "10px",
  width: "100%",
  height: "11px",
  borderRadius: "999px",
  background: "#dbeafe",
  overflow: "hidden",
};

const fillStyle = {
  height: "100%",
  background: "linear-gradient(90deg, #0ea5e9, #2563eb)",
};

const badgeRowStyle = {
  background: "#f8fafc",
  border: "1px solid rgba(148,163,184,0.26)",
  borderRadius: "10px",
  padding: "8px 10px",
  color: "#334155",
  fontSize: "13px",
};

const gridTwo = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "12px",
};

const gridThree = {
  marginTop: "12px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "12px",
};

const cardTitle = {
  margin: "0 0 10px",
  color: "#0f172a",
};

const labelStyle = {
  fontSize: "13px",
  fontWeight: 700,
  color: "#334155",
};

const inputStyle = {
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  padding: "9px 11px",
  fontSize: "14px",
  width: "100%",
  outline: "none",
  background: "#fff",
};

const smallInputStyle = {
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  padding: "4px 8px",
  width: "70px",
};

export default ProgressHub;
