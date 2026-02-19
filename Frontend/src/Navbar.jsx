import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "./config/api.js";

function Navbar() {
  const navigate = useNavigate();
  const [userInitial, setUserInitial] = useState("U");
  const [userEmail, setUserEmail] = useState("Profile");

  useEffect(() => {
    fetch(`${API_ENDPOINTS.auth}/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const email = data?.user?.email;
        if (!email) return;
        setUserEmail(email);
        setUserInitial(String(email[0] || "U").toUpperCase());
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    const ok = window.confirm("Are you sure you want to log out?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_ENDPOINTS.auth}/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Logout failed");
        return;
      }

      navigate("/login");
    } catch {
      alert("Cannot reach server");
    }
  }

  return (
    <header style={shellStyle}>
      <div style={brandWrapStyle} onClick={() => navigate("/home")} title="Go to Dashboard">
        <div style={brandDotStyle} />
        <div>
          <div style={brandTitleStyle}>SkillForge</div>
          <div style={brandSubStyle}>Personal growth cockpit</div>
        </div>
      </div>

      <nav style={tabsWrapStyle}>
        <Tab to="/home" label="Home" end />
        <Tab to="/home/learning" label="Learning" />
        <Tab to="/home/gaming" label="Gaming" />
        <Tab to="/home/sports" label="Sports" />
        <Tab to="/home/hub" label="Hub" />
      </nav>

      <div style={actionsStyle}>
        <button onClick={handleLogout} style={logoutBtnStyle}>Logout</button>

        <button
          onClick={() => navigate("/home/profile")}
          style={avatarBtnStyle}
          title={userEmail}
        >
          {userInitial}
        </button>
      </div>
    </header>
  );
}

function Tab({ to, label, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      style={({ isActive }) => ({
        textDecoration: "none",
        color: isActive ? "#0f172a" : "#334155",
        fontWeight: isActive ? 800 : 700,
        padding: "10px 14px",
        borderRadius: "999px",
        background: isActive ? "linear-gradient(135deg, rgba(125,211,252,0.45), rgba(59,130,246,0.35))" : "transparent",
        border: isActive ? "1px solid rgba(59,130,246,0.45)" : "1px solid transparent",
        transition: "all 180ms ease",
        whiteSpace: "nowrap",
      })}
    >
      {label}
    </NavLink>
  );
}

const shellStyle = {
  minHeight: "74px",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  padding: "14px 24px",
  position: "sticky",
  top: 0,
  zIndex: 80,
  background: "rgba(255,255,255,0.82)",
  backdropFilter: "blur(12px)",
  borderBottom: "1px solid rgba(148,163,184,0.32)",
  boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
  flexWrap: "wrap",
};

const brandWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  cursor: "pointer",
  userSelect: "none",
};

const brandDotStyle = {
  width: "14px",
  height: "14px",
  borderRadius: "999px",
  background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
  boxShadow: "0 0 0 6px rgba(14,165,233,0.18)",
};

const brandTitleStyle = {
  fontWeight: 900,
  fontSize: "17px",
  color: "#0f172a",
  lineHeight: 1.1,
};

const brandSubStyle = {
  fontSize: "11px",
  color: "#64748b",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const tabsWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: "4px",
  flexWrap: "wrap",
  background: "rgba(248,250,252,0.95)",
  border: "1px solid rgba(148,163,184,0.28)",
  borderRadius: "999px",
  padding: "5px",
};

const actionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginLeft: "auto",
};

const logoutBtnStyle = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(239,68,68,0.4)",
  background: "linear-gradient(135deg, #ef4444, #dc2626)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 800,
  boxShadow: "0 8px 18px rgba(239,68,68,0.32)",
};

const avatarBtnStyle = {
  width: "38px",
  height: "38px",
  borderRadius: "999px",
  border: "1px solid rgba(59,130,246,0.35)",
  background: "linear-gradient(135deg, #0ea5e9, #1d4ed8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  fontWeight: 800,
  boxShadow: "0 8px 18px rgba(37,99,235,0.36)",
  cursor: "pointer",
};

export default Navbar;
