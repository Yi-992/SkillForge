import { useEffect, useMemo, useState } from "react";

function randomPos() {
  return {
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
    size: 34 + Math.random() * 30,
  };
}

export default function AimTrainerModal({ onClose }) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [running, setRunning] = useState(false);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [target, setTarget] = useState(randomPos());

  useEffect(() => {
    if (!running || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, timeLeft]);

  const accuracy = useMemo(() => {
    const total = hits + misses;
    if (!total) return 0;
    return Math.round((hits / total) * 100);
  }, [hits, misses]);

  function start() {
    setTimeLeft(30);
    setRunning(true);
    setHits(0);
    setMisses(0);
    setTarget(randomPos());
  }

  function hit(e) {
    e.stopPropagation();
    if (!running || timeLeft <= 0) return;
    setHits((h) => h + 1);
    setTarget(randomPos());
  }

  function miss() {
    if (!running || timeLeft <= 0) return;
    setMisses((m) => m + 1);
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeBtn}>x</button>
        <h2 style={{ marginTop: 0, color: "#0f172a" }}>Aim Trainer</h2>

        <div style={panelStyle}>
          <span>Time: <strong>{timeLeft}s</strong></span>
          <span>Hits: <strong>{hits}</strong></span>
          <span>Accuracy: <strong>{accuracy}%</strong></span>
        </div>

        <div onClick={miss} style={arenaStyle}>
          <button
            onClick={hit}
            style={{
              ...targetStyle,
              left: `${target.x}%`,
              top: `${target.y}%`,
              width: `${target.size}px`,
              height: `${target.size}px`,
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 12 }}>
          <button onClick={start} style={btnPrimary}>{running ? "Restart" : "Start"}</button>
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
  maxWidth: "700px",
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

const panelStyle = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  padding: "10px",
  color: "#334155",
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  marginBottom: "10px",
};

const arenaStyle = {
  position: "relative",
  width: "100%",
  minHeight: "320px",
  borderRadius: "14px",
  border: "1px solid #cbd5e1",
  background: "linear-gradient(160deg, #e2e8f0, #f8fafc)",
  overflow: "hidden",
  cursor: "crosshair",
};

const targetStyle = {
  position: "absolute",
  transform: "translate(-50%, -50%)",
  borderRadius: "999px",
  border: "2px solid white",
  background: "radial-gradient(circle, #fb7185 15%, #ef4444 65%, #991b1b 100%)",
  cursor: "pointer",
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
