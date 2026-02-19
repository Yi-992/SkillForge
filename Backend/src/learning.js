import express from "express";
import pool from "./db.js";

const router = express.Router();

function getUserId(req) {
  return req.session?.user?.id;
}

// GET: fetch user's courses
router.get("/", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  console.log(`[LEARNING] GET courses for user_id=${userId}`);

  try {
    const result = await pool.query(
      `
      SELECT 
        c.id,
        c.title,
        c.image_url,
        uc.added_at
      FROM user_courses uc
      JOIN courses c ON c.id = uc.course_id
      WHERE uc.user_id = $1
      ORDER BY uc.added_at DESC
      `,
      [userId]
    );

    console.log(`[LEARNING] Found ${result.rows.length} courses for user_id=${userId}`);

    res.json({ courses: result.rows });
  } catch (err) {
    console.error("[LEARNING] GET error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// POST: add new course
router.post("/", async (req, res) => {
  const { title, image_url } = req.body;
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  console.log(`[LEARNING] POST add course request: title="${title}" user_id=${userId}`);

  if (!title) {
    console.warn("[LEARNING] POST missing title");
    return res.status(400).json({ error: "Missing title" });
  }

  try {
    // 1) Check if course already exists
    let courseResult = await pool.query(
      "SELECT id, title, image_url FROM courses WHERE title = $1",
      [title]
    );

    let course;

    if (courseResult.rows.length === 0) {
      console.log(`[LEARNING] Course not found. Creating new course: "${title}"`);

      const insertCourse = await pool.query(
        "INSERT INTO courses (title, image_url) VALUES ($1, $2) RETURNING *",
        [title, image_url || null]
      );
      course = insertCourse.rows[0];

      console.log(`[LEARNING] Created course id=${course.id}`);
    } else {
      course = courseResult.rows[0];
      console.log(`[LEARNING] Course already exists id=${course.id}`);
    }

    // 3) Link user to course (user_courses)
    await pool.query(
      "INSERT INTO user_courses (user_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [userId, course.id]
    );

    console.log(`[LEARNING] Linked user_id=${userId} to course_id=${course.id}`);

    res.status(201).json({ course });
  } catch (err) {
    console.error("[LEARNING] POST error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// DELETE: remove course from user
router.delete("/:courseId", async (req, res) => {
  const { courseId } = req.params;
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  console.log(`[LEARNING] DELETE request: user_id=${userId} course_id=${courseId}`);

  try {
    const result = await pool.query(
      "DELETE FROM user_courses WHERE user_id = $1 AND course_id = $2",
      [userId, courseId]
    );

    console.log(`[LEARNING] Removed link user_id=${userId} course_id=${courseId}. Rows affected: ${result.rowCount}`);

    res.json({ message: "Course removed", courseId });
  } catch (err) {
    console.error("[LEARNING] DELETE error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
