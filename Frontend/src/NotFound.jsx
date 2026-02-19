import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div style={pageStyle}>
      <div className="bg-layer layer1" />
      <div className="bg-layer layer2" />

      <div style={cardStyle}>
        <div style={badgeStyle}>404</div>
        <h1 style={titleStyle}>This page drifted off course</h1>
        <p style={copyStyle}>
          The route does not exist or was moved. Return to login and continue from your dashboard.
        </p>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/" style={primaryLinkStyle}>Go to Login</Link>
          <Link to="/home" style={secondaryLinkStyle}>Go to Home</Link>
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "24px",
  position: "relative",
  overflow: "hidden",
};

const cardStyle = {
  width: "min(640px, 100%)",
  borderRadius: "22px",
  background: "rgba(255,255,255,0.9)",
  border: "1px solid rgba(148,163,184,0.34)",
  boxShadow: "0 24px 48px rgba(15,23,42,0.16)",
  backdropFilter: "blur(12px)",
  textAlign: "center",
  padding: "34px 24px",
  zIndex: 1,
};

const badgeStyle = {
  margin: "0 auto",
  width: "86px",
  height: "86px",
  borderRadius: "999px",
  background: "linear-gradient(135deg, #0ea5e9, #1d4ed8)",
  color: "white",
  fontSize: "30px",
  fontWeight: 900,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 14px 28px rgba(37,99,235,0.36)",
};

const titleStyle = {
  margin: "18px 0 10px",
  fontSize: "34px",
  lineHeight: 1.1,
  color: "#0f172a",
};

const copyStyle = {
  margin: "0 auto 18px",
  color: "#475569",
  maxWidth: "480px",
  lineHeight: 1.65,
};

const primaryLinkStyle = {
  padding: "12px 18px",
  borderRadius: "10px",
  background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
  color: "#fff",
  textDecoration: "none",
  fontWeight: 800,
};

const secondaryLinkStyle = {
  padding: "12px 18px",
  borderRadius: "10px",
  background: "rgba(255,255,255,0.95)",
  border: "1px solid rgba(148,163,184,0.4)",
  color: "#0f172a",
  textDecoration: "none",
  fontWeight: 800,
};

export default NotFound;
