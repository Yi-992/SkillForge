import { useEffect, useMemo, useState } from "react";

const COLORS = ["#ef4444", "#22c55e", "#3b82f6", "#f59e0b"];

function randomIndex() {
  return Math.floor(Math.random() * COLORS.length);
}

export default function SequenceRecallModal({ onClose }) {
  const [sequence, setSequence] = useState([randomIndex()]);
  const [player, setPlayer] = useState([]);
  const [showing, setShowing] = useState(true);
  const [flashIndex, setFlashIndex] = useState(-1);
  const [level, setLevel] = useState(1);
  const [status, setStatus] = useState("Watch the sequence");

  useEffect(() => {
    if (!showing) return;
    let i = 0;
    setStatus("Watch the sequence");
    const interval = setInterval(() => {
      setFlashIndex(sequence[i]);
      setTimeout(() => setFlashIndex(-1), 360);
      i += 1;
      if (i >= sequence.length) {
        clearInterval(interval);
        setTimeout(() => {
          setShowing(false);
          setStatus("Repeat the sequence");
        }, 420);
      }
    }, 620);
    return () => clearInterval(interval);
  }, [sequence, showing]);

  const progress = useMemo(() => `${player.length}/${sequence.length}`, [player.length, sequence.length]);

  function startOver() {
    const first = [randomIndex()];
    setSequence(first);
    setPlayer([]);
    setShowing(true);
    setFlashIndex(-1);
    setLevel(1);
    setStatus("Watch the sequence");
  }

  function tap(index) {
    if (showing) return;

    const next = [...player, index];
    setPlayer(next);

    for (let i = 0; i < next.length; i++) {
      if (next[i] !== sequence[i]) {
        setStatus("Wrong sequence. Try again.");
        setPlayer([]);
        setShowing(true);
        return;
      }
    }

    if (next.length === sequence.length) {
      const newSeq = [...sequence, randomIndex()];
      setSequence(newSeq);
      setPlayer([]);
      setShowing(true);
      setLevel((l) => l + 1);
      setStatus("Great. Next level.");
    }
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeBtn}>x</button>
        <h2 style={{ marginTop: 0, color: "#0f172a" }}>Sequence Recall</h2>

        <div style={panelStyle}>
          <span>Level: <strong>{level}</strong></span>
          <span>Progress: <strong>{progress}</strong></span>
          <span>{status}</span>
        </div>

        <div style={gridStyle}>
          {COLORS.map((c, i) => (
            <button
              key={i}
              onClick={() => tap(i)}
              style={{
                ...tileStyle,
                background: c,
                opacity: flashIndex === i ? 1 : 0.72,
                transform: flashIndex === i ? "scale(1.03)" : "scale(1)",
              }}
            />
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
          <button onClick={startOver} style={btnPrimary}>Restart</button>
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
  maxWidth: "560px",
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
  gap: 8,
  flexWrap: "wrap",
  marginBottom: "10px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0,1fr))",
  gap: "10px",
  marginBottom: "12px",
};

const tileStyle = {
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.4)",
  minHeight: "120px",
  cursor: "pointer",
  transition: "all 0.15s ease",
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
