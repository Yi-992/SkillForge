import { useEffect, useMemo, useState } from "react";
import { API_ENDPOINTS } from "./config/api.js";

const featuredSports = [
  { title: "Football Performance", image: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?q=80&w=1200&auto=format&fit=crop", focus: "Speed + Agility" },
  { title: "Basketball Skills", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1200&auto=format&fit=crop", focus: "Footwork + Shooting" },
  { title: "Swimming Conditioning", image: "https://images.unsplash.com/photo-1502904550040-7534597429ae?q=80&w=1200&auto=format&fit=crop", focus: "Technique + Endurance" },
  { title: "Running Endurance", image: "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?q=80&w=1200&auto=format&fit=crop", focus: "VO2 + Pace" },
  { title: "Mobility Reset", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop", focus: "Recovery" },
  { title: "Strength Base", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop", focus: "Power + Stability" },
];

const stockImages = [
  "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502904550040-7534597429ae?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop",
];

const popularSports = [
  "Morning Cardio", "Strength Training", "Flexibility & Stretch", "HIIT Workout", "Endurance Running",
  "Cycling Basics", "Swimming Technique", "Football Skills", "Basketball Shooting", "Core Training",
  "Yoga Flow", "Pilates Basics", "Boxing Conditioning", "Kickboxing Fitness", "CrossFit Fundamentals",
  "Mobility Training", "Speed & Agility", "Jump Rope Training", "Bodyweight Workout", "Recovery & Mobility",
  "Functional Fitness", "Trail Running", "Sprint Mechanics", "Explosive Power", "Athletic Conditioning",
];

const STORAGE_KEY = "sports.plans.v2";

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

function defaultExercise() {
  return { name: "", sets: "", reps: "", rest: "", note: "", done: false };
}

function Sports() {
  const [programs, setPrograms] = useState([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [programToDelete, setProgramToDelete] = useState(null);

  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showProgramPopup, setShowProgramPopup] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [search, setSearch] = useState("");
  const [addQuery, setAddQuery] = useState("");
  const [customProgram, setCustomProgram] = useState("");

  const [rows, setRows] = useState([defaultExercise()]);
  const [weeklyDays, setWeeklyDays] = useState(["Mon", "Wed", "Fri"]);
  const [coachNote, setCoachNote] = useState("");

  const [aiAnswers, setAiAnswers] = useState({ intensity: "Medium", focus: "Balanced", duration: "45" });
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState([]);

  const [plans, setPlans] = useState(() => readJSON(STORAGE_KEY, {}));

  useEffect(() => {
    fetch(API_ENDPOINTS.sports, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setPrograms(data.programs || []))
      .catch(() => alert("Failed to load sports programs."));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  }, [plans]);

  const filteredPrograms = useMemo(() => {
    const q = search.trim().toLowerCase();
    return programs.filter((p) => p.title.toLowerCase().includes(q));
  }, [programs, search]);

  const addablePrograms = useMemo(() => {
    const q = addQuery.trim().toLowerCase();
    return popularSports.filter((name) => name.toLowerCase().includes(q));
  }, [addQuery]);

  const stats = useMemo(() => {
    const total = programs.length;
    const planned = programs.filter((p) => !!plans[getPlanKey(p)]).length;
    const completedExercises = Object.values(plans).reduce(
      (sum, plan) => sum + (plan.exercises || []).filter((e) => e.done).length,
      0
    );

    return {
      total,
      planned,
      completedExercises,
      adherence: total ? Math.round((planned / total) * 100) : 0,
    };
  }, [programs, plans]);

  function getPlanKey(program) {
    return program?.id ? `id:${program.id}` : `title:${program?.title || ""}`;
  }

  function addProgram(title) {
    if (!title || !title.trim()) return;

    fetch(API_ENDPOINTS.sports, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), image_url: randomImage() }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.program) {
          setPrograms((prev) => [data.program, ...prev]);
          setCustomProgram("");
          setShowAddPopup(false);
        }
      })
      .catch(() => alert("Failed to add program."));
  }

  function requestDelete(program) {
    setProgramToDelete(program);
    setShowDeletePopup(true);
  }

  function confirmDelete() {
    fetch(`${API_ENDPOINTS.sports}/${programToDelete.id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then(() => {
        setPrograms((prev) => prev.filter((p) => p.id !== programToDelete.id));
        setPlans((prev) => {
          const copy = { ...prev };
          delete copy[getPlanKey(programToDelete)];
          return copy;
        });
        setShowDeletePopup(false);
        setProgramToDelete(null);
      })
      .catch(() => alert("Failed to delete program."));
  }

  function openProgram(program) {
    const key = getPlanKey(program);
    const existing = plans[key];

    setSelectedProgram(program);
    setActiveTab("overview");
    setRows(existing?.exercises?.length ? existing.exercises : [defaultExercise()]);
    setCoachNote(existing?.note || "");
    setWeeklyDays(existing?.days || ["Mon", "Wed", "Fri"]);
    setAiResult([]);
    setShowProgramPopup(true);
  }

  function savePlan(exercises) {
    if (!selectedProgram) return;

    const key = getPlanKey(selectedProgram);
    const cleaned = (exercises || rows).filter((r) => r.name.trim());

    setPlans((prev) => ({
      ...prev,
      [key]: {
        exercises: cleaned,
        days: weeklyDays,
        note: coachNote,
        updatedAt: new Date().toISOString(),
      },
    }));

    setShowProgramPopup(false);
  }

  function addRow() {
    setRows((prev) => [...prev, defaultExercise()]);
  }

  function removeRow(index) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function updateRow(i, field, value) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }

  function toggleExerciseDone(index) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, done: !r.done } : r)));
  }

  function toggleDay(day) {
    setWeeklyDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  function generateAiPlan() {
    setAiGenerating(true);

    setTimeout(() => {
      const intensityMap = {
        Low: { sets: "2", reps: "10-12", rest: "90s" },
        Medium: { sets: "3", reps: "8-12", rest: "75s" },
        High: { sets: "4", reps: "6-10", rest: "60s" },
      };

      const base = intensityMap[aiAnswers.intensity] || intensityMap.Medium;
      const focusPool = {
        Strength: ["Squat", "Deadlift", "Bench Press", "Overhead Press", "Row"],
        Cardio: ["Bike Intervals", "Tempo Run", "Jump Rope", "Burpees", "Mountain Climbers"],
        Mobility: ["Hip Openers", "Thoracic Rotation", "Hamstring Flow", "Ankle Mobility", "Core Breathing"],
        Balanced: ["Goblet Squat", "Push Ups", "Split Squat", "Plank", "Row"],
      };

      const selected = (focusPool[aiAnswers.focus] || focusPool.Balanced).map((name) => ({
        name,
        sets: base.sets,
        reps: base.reps,
        rest: base.rest,
        note: `${aiAnswers.duration} min session target`,
        done: false,
      }));

      setAiResult(selected);
      setAiGenerating(false);
    }, 1100);
  }

  const selectedPlan = selectedProgram ? plans[getPlanKey(selectedProgram)] : null;

  return (
    <div style={{ padding: "32px", maxWidth: "1240px", margin: "0 auto" }}>
      <section style={heroStyle}>
        <div>
          <h1 style={{ margin: 0, color: "#0f172a" }}>Sports Lab</h1>
          <p style={{ margin: "8px 0 0", color: "#334155" }}>
            Build structured training plans with manual programming or AI-assisted generation.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button onClick={() => setShowAddPopup(true)} style={btnPrimary}>+ Add Program</button>
          <button onClick={() => setDeleteMode((p) => !p)} style={deleteMode ? btnNeutral : btnDanger}>
            {deleteMode ? "Done" : "Remove Program"}
          </button>
        </div>
      </section>

      <section style={statsGrid}>
        <MetricCard title="Programs" value={stats.total} subtitle="In your training library" />
        <MetricCard title="Planned" value={stats.planned} subtitle="With saved workout plan" />
        <MetricCard title="Completed Sets" value={stats.completedExercises} subtitle="Marked done in plans" />
        <MetricCard title="Adherence" value={`${stats.adherence}%`} subtitle="Programs with plans" />
      </section>

      <section style={{ ...panelStyle, marginTop: "20px" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search training programs"
          style={{ ...inputStyle, minWidth: "280px" }}
        />
      </section>

      <h2 style={sectionTitle}>Your Training Programs</h2>
      <div style={gridStyle}>
        {filteredPrograms.map((p) => (
          <ProgramCard
            key={p.id}
            program={p}
            hasPlan={!!plans[getPlanKey(p)]}
            deletable={deleteMode}
            onDelete={() => requestDelete(p)}
            onOpen={() => !deleteMode && openProgram(p)}
          />
        ))}
      </div>

      <h2 style={{ ...sectionTitle, marginTop: "42px" }}>Suggested Tracks</h2>
      <div style={gridStyle}>
        {featuredSports.map((s) => (
          <div
            key={s.title}
            style={featuredCardStyle}
            onClick={() => openProgram({ title: s.title, image_url: s.image })}
          >
            <img src={s.image} alt={s.title} style={{ width: "100%", height: 150, objectFit: "cover" }} />
            <div style={{ padding: "12px" }}>
              <div style={{ fontWeight: 700, color: "#0f172a" }}>{s.title}</div>
              <div style={{ color: "#475569", fontSize: "12px", marginTop: "6px" }}>{s.focus}</div>
            </div>
          </div>
        ))}
      </div>

      {showProgramPopup && selectedProgram && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, maxWidth: "980px", maxHeight: "88vh", overflow: "auto" }}>
            <button onClick={() => setShowProgramPopup(false)} style={closeBtn}>x</button>
            <h2 style={{ marginTop: 0, color: "#0f172a" }}>{selectedProgram.title}</h2>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
              {["overview", "manual", "ai", "history"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    ...chipStyle,
                    background: activeTab === tab ? "#0ea5e9" : "#e2e8f0",
                    color: activeTab === tab ? "white" : "#0f172a",
                  }}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <div style={panelStyle}>
                <p style={{ marginTop: 0, color: "#334155" }}>
                  Plan consistent sessions with progression and recovery days.
                </p>
                <strong style={{ color: "#0f172a" }}>Current Schedule:</strong>
                <p style={{ color: "#475569" }}>{weeklyDays.length ? weeklyDays.join(", ") : "No days selected"}</p>
                <strong style={{ color: "#0f172a" }}>Coach Note:</strong>
                <p style={{ color: "#475569", marginBottom: 0 }}>{coachNote || "No note added yet."}</p>
              </div>
            )}

            {activeTab === "manual" && (
              <>
                <div style={{ ...panelStyle, marginBottom: "10px" }}>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        style={{
                          ...chipStyle,
                          background: weeklyDays.includes(day) ? "#22c55e" : "#e2e8f0",
                          color: weeklyDays.includes(day) ? "white" : "#0f172a",
                        }}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Done</th>
                      <th style={thStyle}>Exercise</th>
                      <th style={thStyle}>Sets</th>
                      <th style={thStyle}>Reps</th>
                      <th style={thStyle}>Rest</th>
                      <th style={thStyle}>Notes</th>
                      <th style={thStyle}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i}>
                        <td style={{ textAlign: "center" }}>
                          <input type="checkbox" checked={!!r.done} onChange={() => toggleExerciseDone(i)} />
                        </td>
                        <td><input style={inputStyle} value={r.name} onChange={(e) => updateRow(i, "name", e.target.value)} /></td>
                        <td><input style={inputStyle} value={r.sets} onChange={(e) => updateRow(i, "sets", e.target.value)} /></td>
                        <td><input style={inputStyle} value={r.reps} onChange={(e) => updateRow(i, "reps", e.target.value)} /></td>
                        <td><input style={inputStyle} value={r.rest} onChange={(e) => updateRow(i, "rest", e.target.value)} /></td>
                        <td><input style={inputStyle} value={r.note} onChange={(e) => updateRow(i, "note", e.target.value)} /></td>
                        <td>
                          <button onClick={() => removeRow(i)} style={rowDeleteBtn}>x</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <textarea
                  value={coachNote}
                  onChange={(e) => setCoachNote(e.target.value)}
                  placeholder="Add coach note / focus cues"
                  style={{ ...inputStyle, width: "100%", minHeight: "72px", marginTop: "10px" }}
                />

                <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                  <button onClick={addRow} style={btnNeutral}>+ Add Exercise</button>
                  <button onClick={() => savePlan(rows)} style={btnPrimary}>Save Plan</button>
                </div>
              </>
            )}

            {activeTab === "ai" && (
              <>
                <div style={{ ...panelStyle, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "10px" }}>
                  <label>
                    <div style={labelStyle}>Intensity</div>
                    <select value={aiAnswers.intensity} onChange={(e) => setAiAnswers((a) => ({ ...a, intensity: e.target.value }))} style={inputStyle}>
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </label>

                  <label>
                    <div style={labelStyle}>Focus</div>
                    <select value={aiAnswers.focus} onChange={(e) => setAiAnswers((a) => ({ ...a, focus: e.target.value }))} style={inputStyle}>
                      <option>Balanced</option>
                      <option>Strength</option>
                      <option>Cardio</option>
                      <option>Mobility</option>
                    </select>
                  </label>

                  <label>
                    <div style={labelStyle}>Duration (min)</div>
                    <input value={aiAnswers.duration} onChange={(e) => setAiAnswers((a) => ({ ...a, duration: e.target.value }))} style={inputStyle} />
                  </label>
                </div>

                <div style={{ marginTop: "12px" }}>
                  <button onClick={generateAiPlan} style={btnPrimary}>Generate Plan</button>
                </div>

                {aiGenerating && <p style={{ color: "#0f172a" }}>Generating workout plan...</p>}

                {aiResult.length > 0 && (
                  <div style={{ ...panelStyle, marginTop: "12px" }}>
                    <h3 style={{ marginTop: 0, color: "#0f172a" }}>AI Plan</h3>
                    <ul style={{ margin: 0, paddingLeft: "18px", color: "#334155" }}>
                      {aiResult.map((e, i) => (
                        <li key={i}>{e.name} - {e.sets} sets x {e.reps} reps (rest {e.rest})</li>
                      ))}
                    </ul>

                    <div style={{ marginTop: "10px" }}>
                      <button
                        onClick={() => {
                          setRows(aiResult);
                          setActiveTab("manual");
                        }}
                        style={btnNeutral}
                      >
                        Move to Manual Editor
                      </button>
                      <button onClick={() => savePlan(aiResult)} style={{ ...btnPrimary, marginLeft: "8px" }}>Save AI Plan</button>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === "history" && (
              <div style={panelStyle}>
                {selectedPlan ? (
                  <>
                    <p style={{ marginTop: 0, color: "#334155" }}>
                      Last updated: {new Date(selectedPlan.updatedAt).toLocaleString()}
                    </p>
                    <ul style={{ margin: 0, paddingLeft: "18px", color: "#334155" }}>
                      {selectedPlan.exercises.map((e, i) => (
                        <li key={i}>
                          {e.done ? "[Done]" : "[Pending]"} {e.name} - {e.sets} x {e.reps}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p style={{ margin: 0, color: "#64748b" }}>No plan saved yet for this program.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showAddPopup && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, maxWidth: "760px" }}>
            <button onClick={() => setShowAddPopup(false)} style={closeBtn}>x</button>
            <h2 style={{ marginTop: 0, color: "#0f172a" }}>Add Training Program</h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "10px", marginBottom: "12px" }}>
              <input
                value={customProgram}
                onChange={(e) => setCustomProgram(e.target.value)}
                placeholder="Create custom program"
                style={inputStyle}
              />
              <button onClick={() => addProgram(customProgram)} style={btnPrimary}>Create</button>
            </div>

            <input
              value={addQuery}
              onChange={(e) => setAddQuery(e.target.value)}
              placeholder="Search templates"
              style={{ ...inputStyle, width: "100%", marginBottom: "12px" }}
            />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "10px", maxHeight: "54vh", overflowY: "auto" }}>
              {addablePrograms.map((name) => (
                <button key={name} onClick={() => addProgram(name)} style={addButtonStyle}>
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showDeletePopup && programToDelete && (
        <div style={overlayStyle}>
          <div style={{ ...modalStyle, maxWidth: "420px", textAlign: "center" }}>
            <h3 style={{ marginTop: 0, color: "#0f172a" }}>Remove Program</h3>
            <p style={{ color: "#475569" }}>
              Are you sure you want to remove <strong>{programToDelete.title}</strong>?
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <button onClick={() => setShowDeletePopup(false)} style={btnNeutral}>Cancel</button>
              <button onClick={confirmDelete} style={btnDanger}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgramCard({ program, hasPlan, deletable, onDelete, onOpen }) {
  return (
    <div style={programCardStyle} onClick={onOpen}>
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

      <img src={program.image_url} alt={program.title} style={{ width: "100%", height: 150, objectFit: "cover" }} />
      <div style={{ padding: "12px" }}>
        <div style={{ fontWeight: 700, color: "#0f172a" }}>{program.title}</div>
        <div style={{ marginTop: "8px", fontSize: "12px", color: hasPlan ? "#166534" : "#b45309" }}>
          {hasPlan ? "Plan saved" : "No plan yet"}
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

const panelStyle = {
  background: "rgba(255,255,255,0.9)",
  borderRadius: "14px",
  padding: "14px",
  border: "1px solid rgba(148,163,184,0.26)",
};

const sectionTitle = { color: "#0f172a", marginTop: "28px", marginBottom: "12px" };

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
  gap: "14px",
};

const featuredCardStyle = {
  background: "#f8fafc",
  borderRadius: "14px",
  overflow: "hidden",
  border: "1px solid rgba(148,163,184,0.3)",
  boxShadow: "0 10px 20px rgba(15,23,42,0.08)",
  cursor: "pointer",
};

const programCardStyle = {
  background: "white",
  borderRadius: "14px",
  overflow: "hidden",
  boxShadow: "0 12px 26px rgba(15,23,42,0.1)",
  position: "relative",
  border: "1px solid rgba(148,163,184,0.2)",
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

const chipStyle = {
  border: "none",
  borderRadius: "999px",
  padding: "8px 12px",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: "12px",
};

const addButtonStyle = {
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  padding: "10px",
  cursor: "pointer",
  background: "#f8fafc",
  color: "#0f172a",
  fontWeight: 600,
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

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  overflow: "hidden",
};

const thStyle = {
  textAlign: "left",
  color: "#0f172a",
  fontSize: "13px",
  background: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
  padding: "8px",
};

const rowDeleteBtn = {
  border: "none",
  background: "#ef4444",
  color: "white",
  borderRadius: "6px",
  width: "28px",
  height: "28px",
  cursor: "pointer",
  fontWeight: 700,
};

const labelStyle = {
  color: "#0f172a",
  fontWeight: 700,
  marginBottom: "6px",
};

export default Sports;
