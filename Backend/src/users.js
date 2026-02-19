import express from "express";
import pool from "./db.js";

const router = express.Router();

function getUserId(req) {
  return req.session?.user?.id;
}

// Dashboard stats for authenticated user
router.get("/dashboard-stats", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const safeQuery = async (sql, params, fallbackRows = [{}]) => {
      try {
        return await pool.query(sql, params);
      } catch (err) {
        console.warn("dashboard query fallback:", err.message);
        return { rows: fallbackRows };
      }
    };

    const [coursesRes, gamesRes, sportsRes, typingRes, chessWinsRes, streakRes] = await Promise.all([
      safeQuery("SELECT COUNT(*)::int AS count FROM user_courses WHERE user_id = $1", [userId], [{ count: 0 }]),
      safeQuery("SELECT COUNT(*)::int AS count FROM gaming WHERE user_id = $1", [userId], [{ count: 0 }]),
      safeQuery("SELECT COUNT(*)::int AS count FROM sports_programs WHERE user_id = $1", [userId], [{ count: 0 }]),
      safeQuery(
        "SELECT COUNT(*)::int AS count, COALESCE(MAX(wpm), 0)::int AS best_wpm FROM typing_scores WHERE user_id = $1",
        [userId],
        [{ count: 0, best_wpm: 0 }]
      ),
      safeQuery(
        "SELECT COUNT(*)::int AS wins FROM chess_results WHERE user_id = $1 AND result = 'win'",
        [userId],
        [{ wins: 0 }]
      ),
      safeQuery(
        `SELECT COUNT(DISTINCT DATE(added_at))::int AS streak_days
         FROM user_courses
         WHERE user_id = $1
           AND added_at >= NOW() - INTERVAL '14 days'`,
        [userId],
        [{ streak_days: 0 }]
      ),
    ]);

    const coursesCount = coursesRes.rows[0]?.count || 0;
    const gamesCount = gamesRes.rows[0]?.count || 0;
    const sportsCount = sportsRes.rows[0]?.count || 0;
    const typingCount = typingRes.rows[0]?.count || 0;
    const bestWpm = typingRes.rows[0]?.best_wpm || 0;
    const chessWins = chessWinsRes.rows[0]?.wins || 0;
    const streakDays = streakRes.rows[0]?.streak_days || 0;

    const tasksCompleted = coursesCount + gamesCount + sportsCount;
    const xp = coursesCount * 120 + gamesCount * 80 + sportsCount * 90 + typingCount * 20 + chessWins * 50;
    const level = Math.max(1, Math.floor(xp / 500) + 1);
    const coins = Math.floor(xp / 4);

    const [recentCourses, recentGames, recentSports] = await Promise.all([
      safeQuery(
        `SELECT c.title
         FROM user_courses uc
         JOIN courses c ON c.id = uc.course_id
         WHERE uc.user_id = $1
         ORDER BY uc.added_at DESC
         LIMIT 3`,
        [userId],
        []
      ),
      safeQuery(
        `SELECT title
         FROM gaming
         WHERE user_id = $1
         ORDER BY id DESC
         LIMIT 3`,
        [userId],
        []
      ),
      safeQuery(
        `SELECT title
         FROM sports_programs
         WHERE user_id = $1
         ORDER BY id DESC
         LIMIT 3`,
        [userId],
        []
      ),
    ]);

    const activity = [
      ...recentCourses.rows.map((r) => `Completed "${r.title}" lesson path`),
      ...recentGames.rows.map((r) => `Added game "${r.title}"`),
      ...recentSports.rows.map((r) => `Updated training "${r.title}"`),
    ].slice(0, 6);

    res.json({
      stats: {
        level,
        xp,
        tasksCompleted,
        streakDays,
        coins,
        bestWpm,
      },
      activity,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: "Failed to load dashboard stats" });
  }
});

// Get all users
router.get("/", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1 LIMIT 1",
      [userId]
    );
    res.json({ user: result.rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Current user profile
router.get("/profile", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1 LIMIT 1",
      [userId]
    );
    res.json({ profile: result.rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Update current user profile
router.put("/profile", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  if (!name) return res.status(400).json({ error: "Name is required" });
  if (name.length < 2) return res.status(400).json({ error: "Name must be at least 2 characters" });

  try {
    const result = await pool.query(
      "UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email",
      [name, userId]
    );
    res.json({ profile: result.rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Add user (legacy / test)
router.post("/", async (req, res) => {
  res.status(410).json({ error: "Legacy endpoint removed. Use /auth/register instead." });
});

export default router;
