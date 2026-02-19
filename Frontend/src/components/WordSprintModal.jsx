import { useEffect, useMemo, useState } from "react";

const WORD_BANK = [
  "algorithm", "syntax", "momentum", "practice", "discipline", "interface", "database", "compiler", "function",
  "context", "training", "focus", "resilience", "pattern", "strategy", "variable", "network", "iteration",
  "modular", "precision", "adaptive", "workflow", "optimize", "threshold", "stability", "pipeline", "analysis",
];

function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function WordSprintModal({ onClose }) {
  const [roundWords, setRoundWords] = useState(() => shuffle(WORD_BANK).slice(0, 18));
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [used, setUsed] = useState([]);

  useEffect(() => {
    if (!running || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, timeLeft]);

  const remaining = useMemo(() => roundWords.filter((w) => !used.includes(w)), [roundWords, used]);

  function start() {
    setRoundWords(shuffle(WORD_BANK).slice(0, 18));
    setInput("");
    setTimeLeft(60);
    setScore(0);
    setUsed([]);
    setRunning(true);
  }

  function submitWord(e) {
    e.preventDefault();
    if (!running || timeLeft <= 0) return;

    const word = input.trim().toLowerCase();
    if (!word) return;

    if (roundWords.includes(word) && !used.includes(word)) {
      setUsed((u) => [...u, word]);
      setScore((s) => s + Math.max(1, Math.floor(word.length / 2)));
    }

    setInput("");
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeBtn}>x</button>
        <h2 style={{ marginTop: 0, color: "#0f172a" }}>Word Sprint</h2>

        <div style={panelStyle}>
          <span>Time: <strong>{timeLeft}s</strong></span>
          <span>Score: <strong>{score}</strong></span>
          <span>Found: <strong>{used.length}/{roundWords.length}</strong></span>
        </div>

        <div style={wordPanelStyle}>
          {remaining.slice(0, 10).map((w) => (
            <span key={w} style={wordChipStyle}>{w}</span>
          ))}
        </div>

        <form onSubmit={submitWord} style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!running || timeLeft <= 0}
            style={inputStyle}
            placeholder="Type a word from the list"
          />
          <button type="submit" style={btnPrimary} disabled={!running || timeLeft <= 0}>Submit</button>
        </form>

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
  flexWrap: "wrap",
};

const wordPanelStyle = {
  marginTop: "10px",
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  minHeight: "44px",
};

const wordChipStyle = {
  padding: "6px 10px",
  borderRadius: "999px",
  background: "#e0f2fe",
  color: "#0c4a6e",
  fontWeight: 700,
  fontSize: "13px",
};

const inputStyle = {
  flex: 1,
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  padding: "10px",
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
