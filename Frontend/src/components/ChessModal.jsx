import { useState } from "react";
import { Chess } from "chess.js";

const pieceImages = {
  wp: "https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg",
  wr: "https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg",
  wn: "https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg",
  wb: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg",
  wq: "https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg",
  wk: "https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg",
  bp: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg",
  br: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg",
  bn: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg",
  bb: "https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg",
  bq: "https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg",
  bk: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg",
};

export default function ChessModal({ onClose }) {
  const [fen, setFen] = useState(new Chess().fen());
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState(null);
  const [difficulty, setDifficulty] = useState("easy");

  function reset() {
    const g = new Chess();
    setFen(g.fen());
    setSelected(null);
  }

  function makeMove(move) {
    const g = new Chess(fen);
    const result = g.move(move);
    if (!result) return null;
    setFen(g.fen());
    setSelected(null);
    return g;
  }

  function handleSquareClick(square) {
    const g = new Chess(fen);
    if (g.isGameOver()) return;

    if (mode === "ai" && g.turn() === "b") return;

    if (!selected) {
      const piece = g.get(square);
      if (piece && piece.color === g.turn()) setSelected(square);
      return;
    }

    if (selected === square) {
      setSelected(null);
      return;
    }

    const next = makeMove({ from: selected, to: square, promotion: "q" });
    if (!next) return;

    if (mode === "ai") {
      setTimeout(() => aiMove(next.fen()), 360);
    }
  }

  function aiMove(currentFen) {
    const g = new Chess(currentFen);
    if (g.isGameOver()) return;

    const moves = g.moves({ verbose: true });
    if (!moves.length) return;

    let move = null;
    if (difficulty === "easy") {
      move = moves[Math.floor(Math.random() * moves.length)];
    } else {
      const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
      let bestScore = -Infinity;
      for (const m of moves) {
        const score = m.captured ? values[m.captured] || 0 : 0;
        if (score > bestScore) {
          bestScore = score;
          move = m;
        }
      }
      if (!move) move = moves[Math.floor(Math.random() * moves.length)];
    }

    g.move(move);
    setFen(g.fen());
  }

  const game = new Chess(fen);
  const board = game.board();
  const inCheck = game.isCheck();

  function kingChecked(cell) {
    if (!cell || cell.type !== "k" || !inCheck) return false;
    return cell.color === game.turn();
  }

  const turn = game.turn() === "w" ? "White" : "Black";

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeBtnStyle} title="Close">x</button>

        <h2 style={{ margin: "0 0 6px", color: "#0f172a" }}>Chess Tactics Board</h2>
        <p style={{ margin: 0, color: "#64748b" }}>Train pattern recognition and decision quality.</p>

        {!mode && (
          <div style={{ marginTop: "14px" }}>
            <div style={modeSelectStyle}>
              <button style={primaryBtn} onClick={() => setMode("pvp")}>Player vs Player</button>
              <button style={primaryBtn} onClick={() => setMode("ai")}>Player vs AI</button>
            </div>

            <div style={{ marginTop: "10px", display: "flex", justifyContent: "center" }}>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={selectStyle}>
                <option value="easy">Easy AI</option>
                <option value="medium">Medium AI</option>
              </select>
            </div>
          </div>
        )}

        {mode && (
          <>
            <div style={statusStyle}>
              {game.isCheckmate()
                ? "Checkmate"
                : game.isDraw()
                ? "Draw"
                : inCheck
                ? `Turn: ${turn} (in check)`
                : `Turn: ${turn}`}
            </div>

            <div style={boardWrapStyle}>
              {board.map((row, r) =>
                row.map((cell, c) => {
                  const file = "abcdefgh"[c];
                  const rank = 8 - r;
                  const square = `${file}${rank}`;
                  const isSelected = selected === square;
                  const checked = kingChecked(cell);
                  const isLight = (r + c) % 2 === 0;

                  return (
                    <button
                      key={square}
                      onClick={() => handleSquareClick(square)}
                      style={{
                        ...squareStyle,
                        background: checked
                          ? "#fecaca"
                          : isLight
                          ? "#e2e8f0"
                          : "#94a3b8",
                        border: isSelected ? "2px solid #2563eb" : "1px solid rgba(15,23,42,0.08)",
                      }}
                    >
                      {cell && (
                        <img
                          src={pieceImages[cell.color + cell.type]}
                          alt=""
                          style={{ width: "84%", height: "84%" }}
                        />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {inCheck && !game.isCheckmate() && (
              <div style={warnStyle}>Check: protect your king before making another plan.</div>
            )}

            <div style={controlsStyle}>
              <button style={primaryBtn} onClick={reset}>Reset</button>
              <button
                style={secondaryBtn}
                onClick={() => {
                  setMode(null);
                  reset();
                }}
              >
                Change Mode
              </button>
              <button style={secondaryBtn} onClick={onClose}>Close</button>
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
  background: "rgba(2,6,23,0.56)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 300,
  padding: "14px",
};

const modalStyle = {
  position: "relative",
  width: "min(580px, 100%)",
  background: "linear-gradient(140deg, rgba(255,255,255,0.96), rgba(241,245,249,0.95))",
  borderRadius: "22px",
  padding: "20px",
  textAlign: "center",
  boxShadow: "0 28px 56px rgba(2,6,23,0.34)",
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

const modeSelectStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
};

const statusStyle = {
  marginTop: "12px",
  borderRadius: "10px",
  padding: "10px",
  background: "rgba(14,165,233,0.14)",
  border: "1px solid rgba(14,165,233,0.3)",
  color: "#0c4a6e",
  fontWeight: 700,
  fontSize: "14px",
};

const boardWrapStyle = {
  marginTop: "12px",
  display: "grid",
  gridTemplateColumns: "repeat(8, minmax(34px, 52px))",
  gap: "4px",
  justifyContent: "center",
};

const squareStyle = {
  width: "min(52px, 10vw)",
  height: "min(52px, 10vw)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "7px",
  cursor: "pointer",
  padding: 0,
};

const warnStyle = {
  marginTop: "10px",
  padding: "10px",
  borderRadius: "10px",
  background: "linear-gradient(135deg, #dc2626, #b91c1c)",
  color: "white",
  fontWeight: 800,
  fontSize: "14px",
};

const controlsStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "10px",
  marginTop: "14px",
  flexWrap: "wrap",
};

const primaryBtn = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
};

const secondaryBtn = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(148,163,184,0.42)",
  background: "white",
  color: "#1e293b",
  cursor: "pointer",
  fontWeight: 700,
};

const selectStyle = {
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  padding: "8px 10px",
  fontWeight: 700,
  color: "#0f172a",
  background: "#fff",
};
