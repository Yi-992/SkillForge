import { useEffect, useMemo, useRef, useState } from "react";

export default function ReactionTestModal({ onClose }) {
  const [phase, setPhase] = useState("idle"); // idle | waiting | ready | result
  const [resultMs, setResultMs] = useState(null);
  const [history, setHistory] = useState([]);
  const startRef = useRef(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function start() {
    setResultMs(null);
    setPhase("waiting");
    const wait = 1400 + Math.floor(Math.random() * 2400);
    timeoutRef.current = setTimeout(() => {
      setPhase("ready");
      startRef.current = performance.now();
    }, wait);
  }

  function clickArea() {
    if (phase === "waiting") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setPhase("idle");
      setResultMs(null);
      return;
    }

    if (phase === "ready") {
      const ms = Math.max(1, Math.round(performance.now() - startRef.current));
      setResultMs(ms);
      setHistory((h) => [ms, ...h].slice(0, 10));
      setPhase("result");
    }
  }

  const avg = useMemo(() => {
    if (!history.length) return null;
    return Math.round(history.reduce((a, b) => a + b, 0) / history.length);
  }, [history]);

  const boxColor =
    phase === "ready" ? "#22c55e" : phase === "waiting" ? "#f59e0b" : "#e2e8f0";

  const text =
    phase === "idle"
      ? "Press Start to begin"
      : phase === "waiting"
      ? "Wait for GREEN then click"
      : phase === "ready"
      ? "CLICK NOW"
      : `Your reaction: ${resultMs} ms`;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeBtn}>x</button>
        <h2 style={{ marginTop: 0, color: "#0f172a" }}>Reaction Test</h2>

        <button onClick={clickArea} style={{ ...testAreaStyle, background: boxColor }}>
          <span style={{ fontWeight: 800, color: "#0f172a", fontSize: "20px" }}>{text}</span>
          {phase === "waiting" && <span style={{ color: "#334155", marginTop: "8px" }}>Clicking too early resets the round.</span>}
        </button>

        <div style={{ ...panelStyle, marginTop: "10px" }}>
          <div>Latest: <strong>{resultMs ? `${resultMs} ms` : "-"}</strong></div>
          <div>Average: <strong>{avg ? `${avg} ms` : "-"}</strong></div>
          <div>Attempts: <strong>{history.length}</strong></div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "12px" }}>
          <button onClick={start} style={btnPrimary}>Start</button>
          <button onClick={() => setHistory([])} style={btnNeutral}>Clear History</button>
          <button onClick={onClose} style={btnNeutral}>Close</button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(2,6,23,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 300,
  padding: "16px",
};

const modalStyle = {
  width: "100%",
  maxWidth: "620px",
  background: "white",
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "0 30px 50px rgba(2,6,23,0.35)",
  position: "relative",
};

const closeBtn = {
  position: "absolute",
  top: 10,
  right: 10,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "18px",
};

const testAreaStyle = {
  width: "100%",
  minHeight: "220px",
  border: "1px solid #cbd5e1",
  borderRadius: "14px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const panelStyle = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  padding: "10px",
  color: "#334155",
  display: "grid",
  gap: "6px",
};

const btnPrimary = {
  border: "none",
  borderRadius: "10px",
  padding: "10px 14px",
  background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const btnNeutral = {
  border: "none",
  borderRadius: "10px",
  padding: "10px 14px",
  background: "#64748b",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};
