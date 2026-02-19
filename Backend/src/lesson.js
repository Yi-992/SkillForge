import express from "express";

const router = express.Router();

// ===============================
// GET /api/lessons/:id
// Return full lesson content (uses session cookie auth via requireAuth)
// ===============================
router.get("/:id", async (req, res) => {
  try {
    // This proves the cookie/session is present
    console.log("Session user:", req.session?.user || req.session);

    const lessonId = parseInt(req.params.id, 10);

    if (isNaN(lessonId)) {
      return res.status(400).json({ error: "Invalid lesson id" });
    }

    const result = await req.db.query(
      "SELECT id, title, content FROM lessons WHERE id = $1",
      [lessonId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    const lesson = result.rows[0];

    res.json({
      success: true,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        content: lesson.content // { sections: [...] }
      }
    });

  } catch (err) {
    console.error("Get lesson error:", err);
    res.status(500).json({ error: "Failed to load lesson" });
  }
});

export default router;
