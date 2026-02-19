import { useMemo, useState } from "react";

function generateSecret() {
  const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  return digits.slice(0, 4).join("");
}

function scoreGuess(secret, guess) {
  let bulls = 0;
  let cows = 0;

  for (let i = 0; i < 4; i++) {
    if (guess[i] === secret[i]) bulls++;
    else if (secret.includes(guess[i])) cows++;
  }

  return { bulls, cows };
}

export default function CodeBreakerModal({ onClose }) {
  const [secret, setSecret] = useState(() => generateSecret());
  const [guess, setGuess] = useState("");
  const [history, setHistory] = useState([]);
  const [won, setWon] = useState(false);

  const attemptsLeft = useMemo(() => Math.max(0, 10 - history.length), [history.length]);

  function submit(e) {
    e.preventDefault();
    if (won || attemptsLeft <= 0) return;
    if (!/^\d{4}$/.test(guess)) return;
    if (new Set(guess).size !== 4) return;

    const res = scoreGuess(secret, guess);
    const entry = { guess, ...res };
    setHistory((h) => [entry, ...h]);
    if (res.bulls === 4) setWon(true);
    setGuess("");
  }

  function restart() {
    setSecret(generateSecret());
    setGuess("");
    setHistory([]);
    setWon(false);
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeBtn}>x</button>
        <h2 style={{ marginTop: 0, color: "#0f172a" }}>Code Breaker</h2>

        <div style={panelStyle}>
          <span>Attempts left: <strong>{attemptsLeft}</strong></span>
          <span>Status: <strong>{won ? "Solved" : attemptsLeft === 0 ? "Out of moves" : "In progress"}</strong></span>
        </div>

        <form onSubmit={submit} style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <input
            value={guess}
            onChange={(e) => setGuess(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="Enter 4 unique digits"
            style={inputStyle}
            disabled={won || attemptsLeft <= 0}
          />
          <button type="submit" style={btnPrimary} disabled={won || attemptsLeft <= 0}>Try</button>
        </form>

        <div style={historyStyle}>
          {history.map((h, i) => (
            <div key={i} style={rowStyle}>
              <span style={{ fontWeight: 700 }}>{h.guess}</span>
              <span>{h.bulls} bulls</span>
              <span>{h.cows} cows</span>
            </div>
          ))}
          {history.length === 0 && <div style={{ color: "#64748b" }}>No guesses yet.</div>}
        </div>

        {(won || attemptsLeft === 0) && (
          <div style={{ ...panelStyle, marginTop: 8 }}>
            {won ? "Great deduction." : `Secret was ${secret}`}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 12 }}>
          <button onClick={restart} style={btnPrimary}>Restart</button>
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

const inputStyle = {
  flex: 1,
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  padding: "10px",
};

const historyStyle = {
  marginTop: "10px",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  padding: "8px",
  maxHeight: "200px",
  overflowY: "auto",
  display: "grid",
  gap: "6px",
};

const rowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  background: "#f8fafc",
  borderRadius: "8px",
  padding: "8px",
  color: "#334155",
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
