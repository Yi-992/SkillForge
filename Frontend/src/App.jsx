import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "./config/api.js";

import mascot from "./assets/Mascot.png";
import mascot2 from "./assets/mascot2.png";

function App() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const [showRegister, setShowRegister] = useState(false);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regMessage, setRegMessage] = useState("");
  const [regIsError, setRegIsError] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    if (!email || !password) {
      setMessage("Email and password are required");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Login failed");
      } else {
        setMessage("Login successful!");
        setTimeout(() => navigate("/home"), 700);
      }
    } catch (err) {
      console.error(err);
      setMessage("Cannot reach server");
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !regConfirmPassword) {
      setRegIsError(true);
      setRegMessage("All fields are required");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegIsError(true);
      setRegMessage("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setRegIsError(true);
        setRegMessage(data.error || "Registration failed");
      } else {
        setRegIsError(false);
        setRegMessage(data.message || "Registration successful!");
        setShowRegister(false);
        setMessage("Account created. Please sign in.");
      }
    } catch (error) {
      setRegIsError(true);
      console.error("Registration error:", error);
      setRegMessage("Registration failed");
    }
  }

  function switchMode(isRegister) {
    setShowRegister(isRegister);
    setMessage("");
    setRegMessage("");
  }

  return (
    <div style={pageStyle}>
      <div className="bg-layer layer1" />
      <div className="bg-layer layer2" />
      <div className="bg-layer layer3" />

      <div style={orbOneStyle} />
      <div style={orbTwoStyle} />

      <div style={layoutStyle}>
        <section style={brandPanelStyle}>
          <div style={brandBadgeStyle}>SkillForge</div>
          <h1 style={brandTitleStyle}>Learn. Play. Train.</h1>
          <p style={brandCopyStyle}>
            Your all-in-one growth dashboard for curriculum, game-based practice, and workout planning.
          </p>

          <div style={featureListStyle}>
            <FeatureLine text="AI-generated curriculum paths" />
            <FeatureLine text="Interactive game-based training" />
            <FeatureLine text="Structured sports programming" />
          </div>

          <img src={mascot2} alt="Assistant mascot" style={brandMascotStyle} />
        </section>

        <section style={authCardStyle}>
          <div style={segmentedStyle}>
            <button onClick={() => switchMode(false)} style={{ ...tabStyle, ...(showRegister ? {} : activeTabStyle) }}>
              Login
            </button>
            <button onClick={() => switchMode(true)} style={{ ...tabStyle, ...(showRegister ? activeTabStyle : {}) }}>
              Register
            </button>
          </div>

          {!showRegister && (
            <>
              <h2 style={formTitleStyle}>Welcome back</h2>
              <p style={formSubtitleStyle}>Sign in and continue your momentum.</p>

              <form onSubmit={handleLogin}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                />
                <button type="submit" style={buttonStyle}>Enter Dashboard</button>
              </form>

              {message && <p style={statusStyle}>{message}</p>}
            </>
          )}

          {showRegister && (
            <>
              <div style={registerHeroStyle}>
                <img src={mascot} alt="Register mascot" style={registerMascotStyle} />
              </div>

              <h2 style={formTitleStyle}>Create account</h2>
              <p style={formSubtitleStyle}>Start your personalized growth journey.</p>

              <form onSubmit={handleRegister}>
                <input type="text" placeholder="Name" value={regName} onChange={(e) => setRegName(e.target.value)} style={inputStyle} />
                <input type="email" placeholder="Email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} style={inputStyle} />
                <input type="password" placeholder="Password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} style={inputStyle} />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  style={inputStyle}
                />
                <button type="submit" style={buttonStyle}>Create Account</button>
              </form>

              {regMessage && (
                <p style={{ ...statusStyle, color: regIsError ? "#b91c1c" : "#166534" }}>{regMessage}</p>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function FeatureLine({ text }) {
  return (
    <div style={featureLineStyle}>
      <span style={featureDotStyle} />
      <span>{text}</span>
    </div>
  );
}

const pageStyle = {
  position: "fixed",
  inset: 0,
  overflow: "auto",
  background: "linear-gradient(145deg, #eff6ff 0%, #f8fafc 45%, #e2e8f0 100%)",
};

const layoutStyle = {
  minHeight: "100%",
  width: "100%",
  display: "grid",
  gridTemplateColumns: "minmax(280px, 1.05fr) minmax(320px, 0.95fr)",
  gap: "20px",
  alignItems: "center",
  maxWidth: "1180px",
  margin: "0 auto",
  padding: "40px 22px",
};

const brandPanelStyle = {
  borderRadius: "20px",
  padding: "26px",
  background: "linear-gradient(130deg, rgba(15,23,42,0.92), rgba(30,64,175,0.9))",
  border: "1px solid rgba(148,163,184,0.35)",
  color: "#e2e8f0",
  boxShadow: "0 24px 44px rgba(15,23,42,0.35)",
  position: "relative",
  overflow: "hidden",
};

const brandBadgeStyle = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "rgba(56,189,248,0.2)",
  border: "1px solid rgba(125,211,252,0.5)",
  fontSize: "12px",
  fontWeight: 700,
};

const brandTitleStyle = {
  margin: "14px 0 8px",
  fontSize: "40px",
  lineHeight: 1.05,
  color: "#f8fafc",
};

const brandCopyStyle = {
  margin: 0,
  color: "#cbd5e1",
  lineHeight: 1.6,
  maxWidth: "520px",
};

const featureListStyle = {
  marginTop: "18px",
  display: "grid",
  gap: "8px",
  color: "#cbd5e1",
};

const featureLineStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontSize: "14px",
};

const featureDotStyle = {
  width: "8px",
  height: "8px",
  borderRadius: "999px",
  background: "#38bdf8",
  boxShadow: "0 0 0 4px rgba(56,189,248,0.18)",
};

const brandMascotStyle = {
  width: "200px",
  marginTop: "18px",
  filter: "drop-shadow(0 16px 20px rgba(2,6,23,0.45))",
  animation: "floatMascot2 4.5s ease-in-out infinite",
};

const authCardStyle = {
  borderRadius: "20px",
  padding: "24px",
  background: "rgba(255,255,255,0.9)",
  border: "1px solid rgba(148,163,184,0.3)",
  boxShadow: "0 18px 42px rgba(15,23,42,0.18)",
  backdropFilter: "blur(12px)",
};

const segmentedStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "8px",
  background: "#e2e8f0",
  borderRadius: "12px",
  padding: "6px",
};

const tabStyle = {
  border: "none",
  borderRadius: "8px",
  padding: "10px",
  fontWeight: 700,
  cursor: "pointer",
  background: "transparent",
  color: "#475569",
};

const activeTabStyle = {
  background: "white",
  color: "#0f172a",
  boxShadow: "0 6px 16px rgba(15,23,42,0.1)",
};

const formTitleStyle = {
  margin: "16px 0 4px",
  color: "#0f172a",
  fontSize: "28px",
};

const formSubtitleStyle = {
  margin: "0 0 14px",
  color: "#64748b",
  fontSize: "14px",
};

const inputStyle = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  marginBottom: "10px",
  fontSize: "14px",
  outline: "none",
  background: "#f8fafc",
};

const buttonStyle = {
  width: "100%",
  padding: "13px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
  color: "#fff",
  fontSize: "15px",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 10px 20px rgba(37,99,235,0.35)",
};

const statusStyle = {
  marginTop: "10px",
  marginBottom: 0,
  color: "#334155",
  fontWeight: 600,
  fontSize: "13px",
};

const registerHeroStyle = {
  display: "flex",
  justifyContent: "center",
  marginTop: "8px",
};

const registerMascotStyle = {
  width: "104px",
  filter: "drop-shadow(0 10px 14px rgba(2,6,23,0.22))",
  animation: "floatMascot 4s ease-in-out infinite",
};

const orbOneStyle = {
  position: "absolute",
  width: "420px",
  height: "420px",
  borderRadius: "999px",
  background: "radial-gradient(circle, rgba(56,189,248,0.3), rgba(56,189,248,0))",
  top: "-120px",
  right: "-120px",
  pointerEvents: "none",
};

const orbTwoStyle = {
  position: "absolute",
  width: "380px",
  height: "380px",
  borderRadius: "999px",
  background: "radial-gradient(circle, rgba(37,99,235,0.2), rgba(37,99,235,0))",
  bottom: "-150px",
  left: "-100px",
  pointerEvents: "none",
};

export default App;
