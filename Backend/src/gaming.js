import express from "express";
import pool from "./db.js";

const router = express.Router();

// GET /api/gaming → list user's games
router.get("/", async (req, res) => {
  try {
    const userId = req.session.user.id;

    const result = await pool.query(
      "SELECT id, title, image_url FROM gaming WHERE user_id = $1 ORDER BY id DESC",
      [userId]
    );

    res.json({ games: result.rows });
  } catch (err) {
    console.error("GET gaming error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// POST /api/gaming → add new game
router.post("/", async (req, res) => {
  const { title, image_url } = req.body;

  if (!title || !image_url) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const userId = req.session.user.id;

    const result = await pool.query(
      "INSERT INTO gaming (user_id, title, image_url) VALUES ($1, $2, $3) RETURNING id, title, image_url",
      [userId, title, image_url]
    );

    res.json({ game: result.rows[0] });
  } catch (err) {
    console.error("POST gaming error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// DELETE /api/gaming/:id → delete game
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const userId = req.session.user.id;

    const result = await pool.query(
      "DELETE FROM gaming WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json({ message: "Game deleted" });
  } catch (err) {
    console.error("DELETE gaming error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
