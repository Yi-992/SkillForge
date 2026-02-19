import { useEffect, useMemo, useState } from "react";

function makeQuestion() {
  const a = Math.floor(Math.random() * 20) + 1;
  const b = Math.floor(Math.random() * 20) + 1;
  const ops = ["+", "-", "*"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let answer;
  if (op === "+") answer = a + b;
  if (op === "-") answer = a - b;
  if (op === "*") answer = a * b;
  return { text: `${a} ${op} ${b}`, answer };
}

export default function MathSprintModal({ onClose }) {
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [q, setQ] = useState(() => makeQuestion());
  const [input, setInput] = useState("");
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);

  useEffect(() => {
    if (!running || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, timeLeft]);

  const accuracy = useMemo(() => {
    const total = correct + wrong;
    if (!total) return 0;
    return Math.round((correct / total) * 100);
  }, [correct, wrong]);

  function start() {
    setRunning(true);
    setTimeLeft(45);
    setQ(makeQuestion());
    setInput("");
    setCorrect(0);
    setWrong(0);
  }

  function submit(e) {
    e.preventDefault();
    if (!running || timeLeft <= 0) return;

    const val = Number(input);
    if (Number.isFinite(val) && val === q.answer) setCorrect((s) => s + 1);
    else setWrong((s) => s + 1);

    setQ(makeQuestion());
    setInput("");
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeBtn}>x</button>
        <h2 style={{ marginTop: 0, color: "#0f172a" }}>Math Sprint</h2>

        <div style={panelStyle}>
          <span>Time: <strong>{timeLeft}s</strong></span>
          <span>Correct: <strong>{correct}</strong></span>
          <span>Accuracy: <strong>{accuracy}%</strong></span>
        </div>

        <div style={questionStyle}>{q.text}</div>

        <form onSubmit={submit} style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!running || timeLeft <= 0}
            style={inputStyle}
            placeholder="Type your answer"
          />
          <button type="submit" style={btnPrimary} disabled={!running || timeLeft <= 0}>Check</button>
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
  maxWidth: "580px",
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
};

const questionStyle = {
  marginTop: "12px",
  marginBottom: "10px",
  fontSize: "34px",
  fontWeight: 800,
  textAlign: "center",
  color: "#0f172a",
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
