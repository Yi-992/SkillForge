import { useMemo, useState } from "react";

const QUESTIONS = [
  {
    prompt: "If all A are B and some B are C, which statement is always true?",
    options: ["Some A are C", "All A are B", "No C are A", "All B are A"],
    answer: 1,
  },
  {
    prompt: "What comes next: 2, 6, 12, 20, 30, ?",
    options: ["36", "40", "42", "44"],
    answer: 2,
  },
  {
    prompt: "A clock shows 3:15. What is the angle between hands?",
    options: ["0°", "7.5°", "15°", "30°"],
    answer: 1,
  },
  {
    prompt: "A train travels 120km in 2 hours. Average speed?",
    options: ["40 km/h", "50 km/h", "60 km/h", "70 km/h"],
    answer: 2,
  },
  {
    prompt: "Choose the odd one out:",
    options: ["Triangle", "Square", "Circle", "Rectangle"],
    answer: 2,
  },
];

export default function LogicPuzzlesModal({ onClose }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);

  const q = QUESTIONS[index];
  const completed = index >= QUESTIONS.length;

  const resultText = useMemo(() => {
    if (!completed) return null;
    if (score === QUESTIONS.length) return "Perfect logic run.";
    if (score >= Math.ceil(QUESTIONS.length * 0.7)) return "Strong reasoning.";
    return "Good start. Run again and improve.";
  }, [completed, score]);

  function submit() {
    if (selected === null) return;
    if (selected === q.answer) setScore((s) => s + 1);
    setSelected(null);
    setIndex((i) => i + 1);
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setScore(0);
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeBtn}>x</button>
        <h2 style={{ marginTop: 0, color: "#0f172a" }}>Logic Puzzles</h2>

        {!completed && (
          <>
            <div style={{ ...panelStyle, marginBottom: "10px" }}>
              Question {index + 1}/{QUESTIONS.length}
            </div>

            <p style={{ color: "#334155", fontWeight: 700 }}>{q.prompt}</p>

            <div style={{ display: "grid", gap: "8px" }}>
              {q.options.map((opt, i) => (
                <button
                  key={opt}
                  onClick={() => setSelected(i)}
                  style={{
                    ...optionStyle,
                    background: selected === i ? "#bae6fd" : "#f8fafc",
                    borderColor: selected === i ? "#0284c7" : "#cbd5e1",
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#64748b" }}>Score: {score}</span>
              <button onClick={submit} style={btnPrimary} disabled={selected === null}>Submit</button>
            </div>
          </>
        )}

        {completed && (
          <div style={{ ...panelStyle, textAlign: "center" }}>
            <h3 style={{ color: "#0f172a", marginTop: 0 }}>Run Complete</h3>
            <p style={{ color: "#334155" }}>Final Score: <strong>{score}/{QUESTIONS.length}</strong></p>
            <p style={{ color: "#334155" }}>{resultText}</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <button onClick={restart} style={btnPrimary}>Play Again</button>
              <button onClick={onClose} style={btnNeutral}>Close</button>
            </div>
          </div>
        )}
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
};

const optionStyle = {
  textAlign: "left",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  padding: "10px",
  cursor: "pointer",
  color: "#0f172a",
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
