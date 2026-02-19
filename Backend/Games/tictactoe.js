import express from "express";

const router = express.Router();

// In-memory games (for now)
const games = new Map(); // gameId -> { board, turn, mode, winner }

function checkWinner(board) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  for (const [a,b,c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  if (board.every(cell => cell)) return "draw";
  return null;
}

function computerMove(board) {
  // very simple AI: pick first empty
  const idx = board.findIndex(c => c === null);
  if (idx !== -1) board[idx] = "O";
}

// Create new game
router.post("/new", (req, res) => {
  const { mode } = req.body; // "pvp" or "cpu"

  const gameId = crypto.randomUUID();
  games.set(gameId, {
    board: Array(9).fill(null),
    turn: "X",
    mode,
    winner: null
  });

  res.json({ gameId });
});

// Get game state
router.get("/:id", (req, res) => {
  const game = games.get(req.params.id);
  if (!game) return res.status(404).json({ error: "Game not found" });

  res.json(game);
});

// Make move
router.post("/:id/move", (req, res) => {
  const { index } = req.body;
  const game = games.get(req.params.id);
  if (!game) return res.status(404).json({ error: "Game not found" });

  if (game.winner) return res.json(game);
  if (game.board[index]) return res.status(400).json({ error: "Invalid move" });

  // Player move
  game.board[index] = game.turn;
  game.turn = game.turn === "X" ? "O" : "X";

  // Check win
  let winner = checkWinner(game.board);
  if (!winner && game.mode === "cpu" && game.turn === "O") {
    computerMove(game.board);
    game.turn = "X";
    winner = checkWinner(game.board);
  }

  game.winner = winner;

  res.json(game);
});

export default router;
