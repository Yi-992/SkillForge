import { useEffect, useMemo, useState } from "react";

const ICONS = ["🚀", "🧠", "⚽", "🎯", "♟️", "📚", "💪", "🎮"];

function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function buildDeck() {
  return shuffle([...ICONS, ...ICONS]).map((icon, i) => ({ id: i, icon, matched: false }));
}

export default function MemoryMatchModal({ onClose }) {
  const [deck, setDeck] = useState(() => buildDeck());
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (flipped.length !== 2) return;

    setMoves((m) => m + 1);
    const [a, b] = flipped;
    const isMatch = deck[a].icon === deck[b].icon;

    if (isMatch) {
      setDeck((prev) =>
        prev.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c))
      );
      setFlipped([]);
    } else {
      const t = setTimeout(() => setFlipped([]), 700);
      return () => clearTimeout(t);
    }
  }, [flipped, deck]);

  const complete = useMemo(() => deck.every((c) => c.matched), [deck]);

  useEffect(() => {
    if (complete) setRunning(false);
  }, [complete]);

  function restart() {
    setDeck(buildDeck());
    setFlipped([]);
    setMoves(0);
    setSeconds(0);
    setRunning(true);
  }

  function clickCard(index) {
    if (flipped.length === 2) return;
    if (flipped.includes(index)) return;
    if (deck[index].matched) return;
    setFlipped((prev) => [...prev, index]);
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeBtn}>x</button>
        <h2 style={{ marginTop: 0, color: "#0f172a" }}>Memory Match</h2>

        <div style={{ ...panelStyle, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <span>Moves: <strong>{moves}</strong></span>
          <span>Time: <strong>{seconds}s</strong></span>
          <span>Status: <strong>{complete ? "Completed" : "In Progress"}</strong></span>
        </div>

        <div style={gridStyle}>
          {deck.map((card, index) => {
            const show = card.matched || flipped.includes(index);
            return (
              <button key={card.id} onClick={() => clickCard(index)} style={cardStyle}>
                <span style={{ fontSize: "24px" }}>{show ? card.icon : "?"}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
          <button onClick={restart} style={btnNeutral}>Restart</button>
          <button onClick={onClose} style={btnPrimary}>Close</button>
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

const panelStyle = {
  marginBottom: "12px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  padding: "10px",
  color: "#334155",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0,1fr))",
  gap: "10px",
  marginBottom: "14px",
};

const cardStyle = {
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  background: "#eff6ff",
  minHeight: "70px",
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
