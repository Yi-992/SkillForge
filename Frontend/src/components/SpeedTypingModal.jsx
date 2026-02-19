import { useEffect, useRef, useState } from "react";
import { API_ENDPOINTS } from "../config/api.js";

export default function SpeedTypingModal({ onClose }) {
  const [duration, setDuration] = useState(null); // 60 | 120 | 300
  const [timeLeft, setTimeLeft] = useState(0);
  const [text, setText] = useState("");
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  const startTimeRef = useRef(null);
  const timerRef = useRef(null);
  const inputRef = useRef(""); // ✅ always holds latest typed text

  // ===============================
  // Fetch paragraph from OLLAMA
  // ===============================
  async function fetchText() {
    try {
      const res = await fetch(API_ENDPOINTS.aiGenerateText, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt:
            "Write one clear, professional English paragraph suitable for a typing speed test. Avoid lists. Write natural prose. Do not add leading spaces."
        })
      });

      const data = await res.json();

      let t = (data.text || "")
        .replace(/\s+/g, " ")
        .replace(/\s*([,.!?;:])\s*/g, "$1 ")
        .trim(); // ✅ removes leading/trailing spaces

      setText(t);
    } catch (err) {
      console.error("AI fetch failed:", err);

      // Fallback
      setText(
        "Software engineering is the discipline of designing and building systems that are reliable, maintainable, and efficient. A good developer thinks not only about how to make something work, but how to make it clear, robust, and easy to improve over time. Practice, patience, and curiosity are the foundations of real technical skill."
      );
    }
  }

  function startGame(sec) {
    setDuration(sec);
    setTimeLeft(sec);
    setInput("");
    inputRef.current = "";
    setStarted(false);
    setFinished(false);
    setWpm(0);
    setAccuracy(0);
    startTimeRef.current = null;

    if (timerRef.current) clearInterval(timerRef.current);

    fetchText();
  }

  // ===============================
  // Timer
  // ===============================
  useEffect(() => {
    if (!started || finished) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          finishGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [started, finished]);

  function handleChange(e) {
    if (finished) return;

    if (!started) {
      setStarted(true);
      startTimeRef.current = Date.now();
    }

    const val = e.target.value;
    setInput(val);
    inputRef.current = val; // ✅ keep latest text here
  }

  function finishGame() {
    setFinished(true);
    setStarted(false);

    if (timerRef.current) clearInterval(timerRef.current);

    const typed = inputRef.current; // ✅ always latest
    const target = text;

    console.log("Final typed:", typed);

    if (!typed || typed.length === 0) {
      setWpm(0);
      setAccuracy(0);
      return;
    }

    // Count correct characters
    let correct = 0;
    for (let i = 0; i < typed.length && i < target.length; i++) {
      if (typed[i] === target[i]) correct++;
    }

    const acc = Math.round((correct / typed.length) * 100);

    const minutes = duration / 60;
    const speed = Math.round((correct / 5) / minutes);

    setAccuracy(acc);
    setWpm(speed);
  }

  function reset() {
    setDuration(null);
    setTimeLeft(0);
    setText("");
    setInput("");
    inputRef.current = "";
    setStarted(false);
    setFinished(false);
    setWpm(0);
    setAccuracy(0);
    startTimeRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function renderColoredText() {
    return text.split("").map((char, i) => {
      let color = "#1e3a8a";
      if (i < input.length) {
        if (input[i] === char) color = "#16a34a";
        else color = "#dc2626";
      }
      return (
        <span key={i} style={{ color }}>
          {char}
        </span>
      );
    });
  }

  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, position: "relative" }}>
        {/* ❌ Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            border: "none",
            background: "transparent",
            fontSize: 22,
            cursor: "pointer",
            fontWeight: "700",
            color: "#1e3a8a"
          }}
        >
          ✕
        </button>

        <h2 style={{ color: "#1e3a8a" }}>⌨️ Speed Typing</h2>

        {!duration && (
          <>
            <p style={{ color: "#475569" }}>Choose duration</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button style={primaryBtn} onClick={() => startGame(60)}>1 Minute</button>
              <button style={primaryBtn} onClick={() => startGame(120)}>2 Minutes</button>
              <button style={primaryBtn} onClick={() => startGame(300)}>5 Minutes</button>
            </div>
          </>
        )}

        {duration && (
          <>
            <div
              style={{
                marginBottom: 12,
                fontWeight: "700",
                color: timeLeft <= 10 ? "#dc2626" : "#1e3a8a"
              }}
            >
              ⏱ Time Left: {timeLeft}s
            </div>

            <div style={textBoxStyle}>
              {text ? renderColoredText() : "Generating text with AI..."}
            </div>

            <textarea
              value={input}
              onChange={handleChange}
              onPaste={(e) => e.preventDefault()}
              disabled={finished}
              style={inputStyle}
              placeholder="Start typing..."
            />

            {finished && (
              <div style={resultBoxStyle}>
                🏁 Time's up! <br />
                <strong>{wpm} WPM</strong> · Accuracy: <strong>{accuracy}%</strong>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16 }}>
              {finished && (
                <button style={primaryBtn} onClick={() => startGame(duration)}>
                  Play Again
                </button>
              )}
              <button style={secondaryBtn} onClick={reset}>
                Change Time
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ===== Styles =====

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 300
};

const modalStyle = {
  background: "rgba(255,255,255,0.95)",
  borderRadius: "20px",
  padding: "28px",
  width: "600px",
  textAlign: "center",
  boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
  backdropFilter: "blur(12px)"
};

const textBoxStyle = {
  padding: "14px",
  borderRadius: "10px",
  background: "#f1f5f9",
  marginBottom: "12px",
  fontWeight: "600",
  color: "#1e3a8a",
  maxHeight: "160px",
  overflowY: "auto",
  textAlign: "left",
  lineHeight: "1.6"
};

const inputStyle = {
  width: "100%",
  minHeight: "110px",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #cbd5f5",
  fontSize: "14px"
};

const resultBoxStyle = {
  marginTop: "12px",
  padding: "12px",
  borderRadius: "12px",
  background: "rgba(22,163,74,0.15)",
  color: "#166534",
  fontWeight: "800",
  fontSize: "16px"
};

const primaryBtn = {
  padding: "10px 16px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  color: "white",
  cursor: "pointer",
  fontWeight: "600"
};

const secondaryBtn = {
  padding: "10px 16px",
  borderRadius: "10px",
  border: "1px solid #cbd5f5",
  background: "white",
  color: "#1e3a8a",
  cursor: "pointer",
  fontWeight: "600"
};
