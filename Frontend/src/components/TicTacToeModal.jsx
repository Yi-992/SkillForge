import { useState } from "react";

export default function TicTacToeModal({ onClose }) {
  const [mode, setMode] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xTurn, setXTurn] = useState(true);

  const winLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  function getWinner(b) {
    for (const line of winLines) {
      const [a, b1, c] = line;
      if (b[a] && b[a] === b[b1] && b[a] === b[c]) return { player: b[a], line };
    }
    return null;
  }

  function isDraw(b) {
    return b.every((cell) => cell !== null);
  }

  const result = getWinner(board);
  const draw = !result && isDraw(board);

  function minimax(newBoard, isMaximizing) {
    const res = getWinner(newBoard);
    if (res?.player === "O") return { score: 1 };
    if (res?.player === "X") return { score: -1 };
    if (isDraw(newBoard)) return { score: 0 };

    const moves = [];

    for (let i = 0; i < 9; i += 1) {
      if (newBoard[i] === null) {
        const move = { index: i };
        newBoard[i] = isMaximizing ? "O" : "X";
        const score = minimax(newBoard, !isMaximizing).score;
        newBoard[i] = null;
        move.score = score;
        moves.push(move);
      }
    }

    if (isMaximizing) {
      return moves.reduce((best, m) => (m.score > best.score ? m : best), { score: -Infinity });
    }

    return moves.reduce((best, m) => (m.score < best.score ? m : best), { score: Infinity });
  }

  function aiMove(currentBoard) {
    const best = minimax([...currentBoard], true);
    if (best && best.index !== undefined) {
      const next = [...currentBoard];
      next[best.index] = "O";
      setBoard(next);
      setXTurn(true);
    }
  }

  function handleClick(i) {
    if (board[i] || result || draw) return;

    const next = [...board];
    next[i] = xTurn ? "X" : "O";
    setBoard(next);

    if (mode === "ai") {
      if (!getWinner(next) && !isDraw(next)) {
        setTimeout(() => aiMove(next), 260);
      }
    } else {
      setXTurn((p) => !p);
    }
  }

  function reset() {
    setBoard(Array(9).fill(null));
    setXTurn(true);
  }

  function getEndMessage() {
    if (mode === "ai") {
      if (result?.player === "X") return "Player wins";
      if (result?.player === "O") return "AI wins";
      if (draw) return "Draw";
    } else {
      if (result?.player === "X") return "Player 1 wins";
      if (result?.player === "O") return "Player 2 wins";
      if (draw) return "Draw";
    }
    return null;
  }

  const turnLabel = mode === "ai" ? (xTurn ? "Player" : "AI") : (xTurn ? "Player 1" : "Player 2");

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeBtnStyle} title="Close">x</button>

        <div style={headerStyle}>
          <h2 style={{ margin: 0, color: "#0f172a" }}>Tic Tac Toe Arena</h2>
          <p style={{ margin: "6px 0 0", color: "#64748b" }}>Quick tactical rounds with clean board UI.</p>
        </div>

        {!mode && (
          <div style={{ marginTop: "16px" }}>
            <p style={{ color: "#475569", marginBottom: "12px", fontWeight: 700 }}>Choose mode</p>
            <div style={modeGridStyle}>
              <button onClick={() => setMode("pvp")} style={modeBtnStyle}>Player vs Player</button>
              <button onClick={() => setMode("ai")} style={{ ...modeBtnStyle, ...altBtnStyle }}>Player vs AI</button>
            </div>
          </div>
        )}

        {mode && (
          <>
            <div style={statusBarStyle}>
              {getEndMessage() ? `Game over: ${getEndMessage()}` : `Turn: ${turnLabel}`}
            </div>

            <div style={{ position: "relative", display: "inline-block", marginTop: "12px" }}>
              <div style={boardStyle}>
                {board.map((cell, i) => (
                  <button
                    key={i}
                    onClick={() => handleClick(i)}
                    style={{
                      ...cellStyle,
                      color: cell === "X" ? "#2563eb" : "#ef4444",
                    }}
                  >
                    {cell}
                  </button>
                ))}
              </div>

              {result && (
                <svg viewBox="0 0 300 300" style={lineSvgStyle}>
                  {(() => {
                    const map = {
                      "0,1,2": { x1: 30, y1: 50, x2: 270, y2: 50 },
                      "3,4,5": { x1: 30, y1: 150, x2: 270, y2: 150 },
                      "6,7,8": { x1: 30, y1: 250, x2: 270, y2: 250 },
                      "0,3,6": { x1: 50, y1: 30, x2: 50, y2: 270 },
                      "1,4,7": { x1: 150, y1: 30, x2: 150, y2: 270 },
                      "2,5,8": { x1: 250, y1: 30, x2: 250, y2: 270 },
                      "0,4,8": { x1: 30, y1: 30, x2: 270, y2: 270 },
                      "2,4,6": { x1: 270, y1: 30, x2: 30, y2: 270 },
                    };
                    const line = map[result.line.join(",")];
                    return <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="#16a34a" strokeWidth="8" strokeLinecap="round" />;
                  })()}
                </svg>
              )}
            </div>

            <div style={controlsStyle}>
              <button onClick={reset} style={actionBtnStyle}>Reset</button>
              <button onClick={() => { setMode(null); reset(); }} style={ghostBtnStyle}>Change Mode</button>
              <button onClick={onClose} style={ghostBtnStyle}>Close</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(2,6,23,0.52)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 200,
  padding: "14px",
};

const modalStyle = {
  position: "relative",
  width: "min(460px, 100%)",
  background: "linear-gradient(140deg, rgba(255,255,255,0.96), rgba(241,245,249,0.94))",
  borderRadius: "22px",
  padding: "22px",
  textAlign: "center",
  boxShadow: "0 28px 56px rgba(2,6,23,0.35)",
  border: "1px solid rgba(148,163,184,0.34)",
};

const closeBtnStyle = {
  position: "absolute",
  top: 10,
  right: 10,
  border: "none",
  width: "30px",
  height: "30px",
  borderRadius: "8px",
  background: "rgba(148,163,184,0.2)",
  cursor: "pointer",
  color: "#0f172a",
  fontWeight: 800,
};

const headerStyle = {
  textAlign: "left",
  paddingRight: "32px",
};

const modeGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
};

const modeBtnStyle = {
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid rgba(37,99,235,0.3)",
  background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const altBtnStyle = {
  background: "linear-gradient(135deg, #16a34a, #15803d)",
  border: "1px solid rgba(22,163,74,0.36)",
};

const statusBarStyle = {
  marginTop: "12px",
  borderRadius: "10px",
  padding: "10px",
  background: "rgba(14,165,233,0.14)",
  border: "1px solid rgba(14,165,233,0.3)",
  color: "#0c4a6e",
  fontWeight: 700,
  fontSize: "14px",
};

const boardStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(74px, 92px))",
  gap: "9px",
  justifyContent: "center",
};

const cellStyle = {
  width: "min(92px, 24vw)",
  height: "min(92px, 24vw)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "36px",
  fontWeight: 900,
  background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
  borderRadius: "12px",
  border: "1px solid rgba(148,163,184,0.28)",
  cursor: "pointer",
  boxShadow: "0 8px 16px rgba(15,23,42,0.12)",
};

const lineSvgStyle = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
};

const controlsStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "10px",
  marginTop: "14px",
  flexWrap: "wrap",
};

const actionBtnStyle = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const ghostBtnStyle = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(148,163,184,0.4)",
  background: "white",
  color: "#1e293b",
  fontWeight: 700,
  cursor: "pointer",
};
