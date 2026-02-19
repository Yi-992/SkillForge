import express from "express";
import pool from "./db.js";

const router = express.Router();

// ===============================
// GET /api/sports → list user's programs
// ===============================
router.get("/", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const userId = req.session.user.id;

    const result = await pool.query(
      "SELECT id, title, image_url FROM sports_programs WHERE user_id = $1 ORDER BY id DESC",
      [userId]
    );

    res.json({ programs: result.rows });
  } catch (err) {
    console.error("GET sports error:", err);
    res.status(500).json({ error: "Failed to load sports programs" });
  }
});

// ===============================
// POST /api/sports → add new program
// ===============================
router.post("/", async (req, res) => {
  const { title, image_url } = req.body;

  if (!title || !image_url) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const userId = req.session.user.id;

    const result = await pool.query(
      "INSERT INTO sports_programs (user_id, title, image_url) VALUES ($1, $2, $3) RETURNING id, title, image_url",
      [userId, title, image_url]
    );

    res.json({ program: result.rows[0] });
  } catch (err) {
    console.error("POST sports error:", err);
    res.status(500).json({ error: "Failed to add sports program" });
  }
});

// ===============================
// DELETE /api/sports/:id → delete program
// ===============================
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const userId = req.session.user.id;

    const result = await pool.query(
      "DELETE FROM sports_programs WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Program not found" });
    }

    res.json({ message: "Program deleted" });
  } catch (err) {
    console.error("DELETE sports error:", err);
    res.status(500).json({ error: "Failed to delete sports program" });
  }
});

export default router;
