import express from "express";
import pool from "../src/db.js";
import { requireAuth } from "../src/requireAuth.js";

const router = express.Router();

// Save typing score
router.post("/typing", requireAuth, async (req, res) => {
  const { wpm } = req.body;
  const userId = req.session.user.id;

  await pool.query(
    "INSERT INTO typing_scores (user_id, wpm) VALUES ($1, $2)",
    [userId, wpm]
  );

  res.json({ message: "Score saved" });
});

// Save chess result
router.post("/chess", requireAuth, async (req, res) => {
  const { result } = req.body; // "win" | "lose"
  const userId = req.session.user.id;

  await pool.query(
    "INSERT INTO chess_results (user_id, result) VALUES ($1, $2)",
    [userId, result]
  );

  res.json({ message: "Result saved" });
});

export default router;
