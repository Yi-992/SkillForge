import { useEffect, useMemo, useState } from "react";
import { API_ENDPOINTS } from "./config/api.js";

const STORAGE_KEY = "profile.preferences.v1";

function readPrefs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function Profile() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [readOnlyMode, setReadOnlyMode] = useState(false);

  const [prefs, setPrefs] = useState(() => ({
    weeklyHours: 6,
    learningFocus: "Balanced",
    reminderTime: "19:00",
    intensity: "Steady",
    visibility: "Private",
    ...readPrefs(),
  }));

  useEffect(() => {
    async function loadProfile() {
      try {
        const meRes = await fetch(`${API_ENDPOINTS.auth}/me`, { credentials: "include" });
        if (!meRes.ok) throw new Error("load failed");
        const meData = await meRes.json();
        const user = meData?.user || null;
        setProfile(user);
        setName(user?.name || user?.email?.split("@")[0] || "");
      } catch {
        setMessage("Failed to load profile.");
      }
    }

    loadProfile();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const initials = useMemo(() => {
    const source = name || profile?.email || "U";
    return source
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [name, profile?.email]);

  const profileCompleteness = useMemo(() => {
    let score = 40;
    if (name?.trim()) score += 20;
    if (prefs.weeklyHours > 0) score += 15;
    if (prefs.learningFocus) score += 15;
    if (prefs.reminderTime) score += 10;
    return Math.min(100, score);
  }, [name, prefs]);

  async function saveProfile() {
    if (readOnlyMode) {
      setProfile((p) => ({ ...(p || {}), name }));
      setMessage("Saved locally. Restart backend to enable server profile updates.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(API_ENDPOINTS.usersProfile, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.status === 404) {
        setReadOnlyMode(true);
        setProfile((p) => ({ ...(p || {}), name }));
        setMessage("Saved locally. Restart backend to enable server profile updates.");
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Failed to update profile.");
      } else {
        setProfile(data.profile);
        setMessage("Profile updated.");
      }
    } catch {
      setMessage("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={pageStyle}>
      <section style={heroStyle}>
        <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={avatarStyle}>{initials || "U"}</div>
          <div>
            <div style={pillStyle}>Account Center</div>
            <h1 style={{ margin: "8px 0 4px", color: "#0f172a" }}>Profile</h1>
            <p style={{ margin: 0, color: "#334155" }}>
              Manage account identity, focus settings, and routine defaults.
            </p>
          </div>
        </div>

        <div style={heroScoreStyle}>
          <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>Profile Completion</div>
          <div style={{ fontSize: "28px", color: "#0f172a", fontWeight: 900 }}>{profileCompleteness}%</div>
        </div>
      </section>

      <section style={gridStyle}>
        <div style={cardStyle}>
          <h2 style={cardTitle}>Account</h2>

          <label style={labelStyle}>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />

          <label style={labelStyle}>Email</label>
          <input value={profile?.email || ""} readOnly style={{ ...inputStyle, background: "#f8fafc", color: "#64748b" }} />

          <button onClick={saveProfile} disabled={saving} style={btnPrimary}>
            {saving ? "Saving..." : "Save Profile"}
          </button>

          {message && <p style={{ margin: 0, color: message.includes("Failed") ? "#b91c1c" : "#166534", fontWeight: 600 }}>{message}</p>}
        </div>

        <div style={cardStyle}>
          <h2 style={cardTitle}>Preferences</h2>

          <label style={labelStyle}>Weekly Study/Training Hours</label>
          <input
            type="number"
            min="1"
            value={prefs.weeklyHours}
            onChange={(e) => setPrefs((p) => ({ ...p, weeklyHours: Math.max(1, Number(e.target.value) || 1) }))}
            style={inputStyle}
          />

          <label style={labelStyle}>Primary Focus</label>
          <select
            value={prefs.learningFocus}
            onChange={(e) => setPrefs((p) => ({ ...p, learningFocus: e.target.value }))}
            style={inputStyle}
          >
            <option>Balanced</option>
            <option>Learning-heavy</option>
            <option>Gaming-heavy</option>
            <option>Sports-heavy</option>
          </select>

          <label style={labelStyle}>Daily Reminder Time</label>
          <input
            type="time"
            value={prefs.reminderTime}
            onChange={(e) => setPrefs((p) => ({ ...p, reminderTime: e.target.value }))}
            style={inputStyle}
          />
        </div>

        <div style={cardStyle}>
          <h2 style={cardTitle}>Style and Visibility</h2>

          <label style={labelStyle}>Pace</label>
          <select
            value={prefs.intensity}
            onChange={(e) => setPrefs((p) => ({ ...p, intensity: e.target.value }))}
            style={inputStyle}
          >
            <option>Light</option>
            <option>Steady</option>
            <option>Intense</option>
          </select>

          <label style={labelStyle}>Profile Visibility</label>
          <select
            value={prefs.visibility}
            onChange={(e) => setPrefs((p) => ({ ...p, visibility: e.target.value }))}
            style={inputStyle}
          >
            <option>Private</option>
            <option>Team</option>
            <option>Public</option>
          </select>

          <div style={hintStyle}>
            Settings are persisted in local storage and used to personalize your dashboard behavior.
          </div>
        </div>
      </section>
    </div>
  );
}

const pageStyle = {
  padding: "30px 20px 40px",
  maxWidth: "1080px",
  margin: "0 auto",
};

const heroStyle = {
  background: "linear-gradient(130deg, rgba(248,250,252,0.95), rgba(226,232,240,0.9))",
  borderRadius: "18px",
  padding: "20px",
  border: "1px solid rgba(148,163,184,0.35)",
  marginBottom: "14px",
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  flexWrap: "wrap",
  boxShadow: "0 14px 30px rgba(15,23,42,0.08)",
};

const heroScoreStyle = {
  background: "rgba(255,255,255,0.7)",
  borderRadius: "12px",
  border: "1px solid rgba(148,163,184,0.35)",
  padding: "10px 12px",
  minWidth: "150px",
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

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
  gap: "12px",
};

const cardStyle = {
  background: "rgba(255,255,255,0.92)",
  borderRadius: "14px",
  padding: "16px",
  border: "1px solid rgba(148,163,184,0.28)",
  boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
  display: "grid",
  gap: "8px",
};

const cardTitle = {
  margin: "0 0 6px",
  color: "#0f172a",
};

const avatarStyle = {
  width: "56px",
  height: "56px",
  borderRadius: "999px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
  color: "white",
  fontWeight: 800,
  fontSize: "18px",
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
  outline: "none",
  background: "#fff",
};

const btnPrimary = {
  marginTop: "4px",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const hintStyle = {
  marginTop: "4px",
  fontSize: "12px",
  color: "#64748b",
  lineHeight: 1.5,
};

export default Profile;
