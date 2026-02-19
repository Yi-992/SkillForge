import express from "express";

const router = express.Router();

// ===============================
// Helpers
// ===============================
async function callOllama(prompt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10 * 60 * 1000); // 10 minutes

  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: controller.signal,
    body: JSON.stringify({
      model: "qwen2.5:14b",          // 👈 MUCH better at structured output than mistral //deepseek-coder:6.7b Chatbot
      prompt,
      stream: false
    })
  });

  clearTimeout(timeout);

  if (!res.ok) {
    const t = await res.text();
    throw new Error("Ollama HTTP error: " + res.status + " " + t);
  }

  const data = await res.json();
  return data.response || "";
}

// Extract first JSON object from text
function extractJSON(text) {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1) return null;
  return text.slice(first, last + 1);
}

// Try AI multiple times until valid JSON
async function generateValidJSON(prompt, maxTries = 3) {
  for (let i = 0; i < maxTries; i++) {
    const raw = await callOllama(prompt);
    console.log(`🧠 AI attempt ${i + 1} output:\n`, raw);

    const jsonString = extractJSON(raw);
    if (!jsonString) continue;

    try {
      const parsed = JSON.parse(jsonString);
      return parsed;
    } catch (e) {
      console.warn("⚠️ JSON parse failed, retrying...");
    }
  }
  return null;
}

// ===============================
// POST /api/ai/generate
// Generic text generation endpoint (used by typing game)
// ===============================
router.post("/generate", async (req, res) => {
  try {
    const defaultPrompt =
      "Write one clear, professional English paragraph suitable for a typing speed test. Avoid lists. Write natural prose. Do not add leading spaces.";
    const prompt =
      typeof req.body?.prompt === "string" && req.body.prompt.trim()
        ? req.body.prompt.trim()
        : defaultPrompt;

    const text = await callOllama(prompt);
    res.json({ text: text.trim() });
  } catch (err) {
    console.error("Generate text error:", err);
    res.status(500).json({ error: "Failed to generate text" });
  }
});

// ===============================
// POST /api/ai/generate-course
// ===============================
router.post("/generate-course", async (req, res) => {
  try {
    let { title } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: "Title is required" });
    }

    const requestKey = title.trim();

    console.log("🔎 Checking DB for request_key:", requestKey);

    // =========================
    // 1. Check DB FIRST
    // =========================
    const existing = await req.db.query(
      `SELECT id, title, description 
       FROM curriculum 
       WHERE request_key = $1 
       LIMIT 1`,
      [requestKey]
    );

    if (existing.rows.length > 0) {
      const curriculumId = existing.rows[0].id;

      const modulesRes = await req.db.query(
        "SELECT id, title FROM modules WHERE curriculum_id = $1 ORDER BY order_index",
        [curriculumId]
      );

      const modules = [];

      for (const mod of modulesRes.rows) {
        const lessonsRes = await req.db.query(
          "SELECT id, title, content FROM lessons WHERE module_id = $1 ORDER BY order_index",
          [mod.id]
        );

        modules.push({
          id: mod.id,
          title: mod.title,
          lessons: lessonsRes.rows.map(l => ({
            id: l.id,
            title: l.title,
            ...l.content
          }))
        });
      }

      return res.json({
        success: true,
        source: "database",
        course: {
          title: existing.rows[0].title,
          description: existing.rows[0].description,
          modules
        }
      });
    }

    console.log("🤖 Not in DB, calling AI...");

    // =========================
    // 2. Force JSON Prompt
    // =========================
    const prompt = `
You are a senior university lecturer and curriculum designer.

Your task:
Write a FULL, IN-DEPTH, TEACHING-QUALITY course for: "${requestKey}"

STRICT OUTPUT RULES:
- Output MUST be VALID JSON ONLY
- NO markdown
- NO explanation
- NO extra text
- JSON MUST parse with JSON.parse()
- DO NOT include comments
- DO NOT include trailing commas
- DO NOT include placeholders like "..." or "example here"

CONTENT QUALITY RULES:
- The content MUST be LONG, DETAILED, and TEACHING-ORIENTED
- Each lesson MUST contain MULTIPLE long explanations
- Explain concepts step-by-step
- Use examples, analogies, and practical reasoning
- Assume the student is a beginner
- Do NOT be brief
- Do NOT summarize
- Do NOT write bullet-point-only content
- Write like a real textbook + lecture notes

MANDATORY STRUCTURE RULES:
- At least 4 modules
- Each module at least 3 lessons
- Each lesson at least 8–12 sections total
- At least 6 sections MUST be of type "text"
- Each "text" section MUST be a full paragraph (5–10 sentences)

MANDATORY MEDIA RULES (IMPORTANT):
- EACH lesson MUST include:
  - At least 1 "image" section
  - At least 1 "video" section
  - At least 1 "code" section (when relevant)
  - At least 1 "link" section to real documentation
- If you are unsure about a media URL, DO NOT invent it. Use a SAFE, WELL-KNOWN SOURCE instead.

IMAGE RULES:
- Images MUST come from ONE of these domains ONLY:
  - https://upload.wikimedia.org/
  - https://images.unsplash.com/
  - https://cdn.pixabay.com/
- Image URLs MUST end with .jpg, .png, or .webp
- Do NOT use random websites
- Do NOT use example.com
- Do NOT use broken or placeholder URLs

VIDEO RULES:
- Videos MUST be YouTube EMBED links ONLY
- Format MUST be EXACTLY:
  https://www.youtube.com/embed/VIDEO_ID
- Use well-known educational channels (e.g. 3Blue1Brown, freeCodeCamp, MIT OpenCourseWare, Computerphile, StatQuest, etc.)
- Do NOT use watch?v= links
- Do NOT invent fake video IDs
- If unsure, choose a very common educational topic video

LINK RULES:
- Links MUST point to real documentation or learning resources such as:
  - https://developer.mozilla.org/
  - https://docs.python.org/
  - https://scikit-learn.org/
  - https://pytorch.org/docs/
  - https://khanacademy.org/
  - https://wikipedia.org/
- Do NOT use fake domains
- Do NOT use example.com

SECTION FORMAT:
Sections are objects like:
{ "type": "text", "value": "..." }
{ "type": "code", "language": "python", "value": "..." }
{ "type": "link", "href": "https://...", "text": "..." }
{ "type": "image", "src": "https://upload.wikimedia.org/...", "caption": "..." }
{ "type": "video", "src": "https://www.youtube.com/embed/VIDEO_ID" }

FORMAT (MUST MATCH EXACTLY):

{
  "course": {
    "title": "${requestKey}",
    "description": "A long, detailed course description explaining what the student will learn and why it matters.",
    "modules": [
      {
        "title": "Module title",
        "lessons": [
          {
            "title": "Lesson title",
            "content": {
              "sections": [
                { "type": "text", "value": "LONG DETAILED PARAGRAPH..." }
              ]
            }
          }
        ]
      }
    ]
  }
}

FINAL CHECK BEFORE OUTPUT:
- Is the JSON valid?
- Does every lesson have at least 1 image and 1 video?
- Are image URLs from Wikimedia, Unsplash, or Pixabay?
- Are video URLs in https://www.youtube.com/embed/ format?
- Are text sections long and detailed?
- If anything is missing or broken, FIX IT BEFORE OUTPUTTING.

REMEMBER:
- Output JSON ONLY
- Output NOTHING ELSE
`;




    const parsed = await generateValidJSON(prompt, 3);

    if (!parsed || !parsed.course) {
      return res.status(500).json({ error: "AI returned invalid JSON" });
    }

    // =========================
    // 3. Normalize Structure (ANTI-AI BUG SHIELD)
    // =========================
    let course = parsed.course;
    course.title = course.title || requestKey;
    course.description = course.description || "No description provided.";
    course.modules = Array.isArray(course.modules) ? course.modules : [];

    if (course.modules.length === 0) {
      return res.status(500).json({ error: "AI returned empty course" });
    }

    course.modules = course.modules.map((m, mi) => {
      const lessons = Array.isArray(m.lessons) ? m.lessons : [];
      return {
        title: m.title || `Module ${mi + 1}`,
        lessons: lessons.map((l, li) => ({
          title: l.title || `Lesson ${li + 1}`,
          content: {
            sections: Array.isArray(l.content?.sections)
              ? l.content.sections
              : [{ type: "text", value: "Content coming soon." }]
          }
        }))
      };
    });

    // =========================
    // 4. Store in DB
    // =========================
    const curriculumResult = await req.db.query(
      `INSERT INTO curriculum (request_key, title, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (request_key) DO UPDATE
       SET title = EXCLUDED.title,
           description = EXCLUDED.description
       RETURNING id`,
      [requestKey, course.title, course.description]
    );

    const curriculumId = curriculumResult.rows[0].id;

    for (let i = 0; i < course.modules.length; i++) {
      const mod = course.modules[i];

      const modResult = await req.db.query(
        "INSERT INTO modules (curriculum_id, title, order_index) VALUES ($1, $2, $3) RETURNING id",
        [curriculumId, mod.title, i]
      );

      const moduleId = modResult.rows[0].id;

      for (let j = 0; j < mod.lessons.length; j++) {
        const lesson = mod.lessons[j];

        await req.db.query(
          "INSERT INTO lessons (module_id, title, content, order_index) VALUES ($1, $2, $3, $4)",
          [
            moduleId,
            lesson.title,
            JSON.stringify(lesson.content),
            j
          ]
        );
      }
    }

    res.json({
      success: true,
      source: "ai",
      course
    });

  } catch (err) {
    console.error("🔥 Generate course error:", err);
    res.status(500).json({ error: "Failed to generate course" });
  }
});

// ===============================
// POST /api/ai/extend-course
// Extend existing course (append only)
// ===============================
router.post("/extend-course", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const requestKey = title.trim();

    // 1. Load existing course
    const currRes = await req.db.query(
      `SELECT id, title, description FROM curriculum WHERE request_key = $1 LIMIT 1`,
      [requestKey]
    );

    if (currRes.rows.length === 0) {
      return res.status(404).json({ error: "Course not found. Generate it first." });
    }

    const curriculumId = currRes.rows[0].id;

    const modulesRes = await req.db.query(
      `SELECT id, title, order_index FROM modules WHERE curriculum_id = $1 ORDER BY order_index`,
      [curriculumId]
    );

    const existingModules = modulesRes.rows;

    // Load lessons for context
    const fullModules = [];
    for (const m of existingModules) {
      const lessonsRes = await req.db.query(
        `SELECT title, content FROM lessons WHERE module_id = $1 ORDER BY order_index`,
        [m.id]
      );

      fullModules.push({
        title: m.title,
        lessons: lessonsRes.rows
      });
    }

    const currentCount = existingModules.length;

    if (currentCount >= 10) {
      return res.json({
        success: true,
        message: "Course already has maximum modules (10). No extension needed."
      });
    }

    // 2. Ask AI to EXTEND only
    const prompt = `
You are an expert instructor.

We already have this course:

${JSON.stringify({
  title: currRes.rows[0].title,
  description: currRes.rows[0].description,
  modules: fullModules
}, null, 2)}

Task:
- EXTEND this course by ADDING NEW MODULES ONLY
- Do NOT rewrite or repeat existing modules
- Total modules after extension must be between 7 and 10
- Add deep, detailed teaching content
- Follow this STRICT JSON format:

{
  "new_modules": [
    {
      "title": "...",
      "lessons": [
        {
          "title": "...",
          "content": {
            "sections": [
              { "type": "text", "value": "Long detailed explanation..." },
              { "type": "code", "language": "javascript", "value": "code here" },
              { "type": "link", "href": "https://...", "text": "Reference" }
            ]
          }
        }
      ]
    }
  ]
}

JSON ONLY. No markdown. No explanation.
`;

    const raw = await callOllama(prompt);

    const first = raw.indexOf("{");
    const last = raw.lastIndexOf("}");
    if (first === -1 || last === -1) {
      return res.status(500).json({ error: "AI returned invalid JSON" });
    }

    const jsonString = raw.slice(first, last + 1);

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (e) {
      console.error("Extend JSON parse failed:", jsonString);
      return res.status(500).json({ error: "AI returned invalid JSON" });
    }

    const newModules = parsed.new_modules;
    if (!Array.isArray(newModules) || newModules.length === 0) {
      return res.status(500).json({ error: "No new modules returned by AI" });
    }

    // 3. Insert new modules after existing ones
    let orderBase = existingModules.length;

    for (let i = 0; i < newModules.length; i++) {
      const mod = newModules[i];

      const modResult = await req.db.query(
        `INSERT INTO modules (curriculum_id, title, order_index)
         VALUES ($1, $2, $3) RETURNING id`,
        [curriculumId, mod.title, orderBase + i]
      );

      const moduleId = modResult.rows[0].id;

      for (let j = 0; j < (mod.lessons || []).length; j++) {
        const lesson = mod.lessons[j];

        const content = lesson.content && lesson.content.sections
          ? lesson.content
          : { sections: [] };

        await req.db.query(
          `INSERT INTO lessons (module_id, title, content, order_index)
           VALUES ($1, $2, $3, $4)`,
          [
            moduleId,
            lesson.title,
            JSON.stringify(content),
            j
          ]
        );
      }
    }

    res.json({
      success: true,
      addedModules: newModules.length
    });

  } catch (err) {
    console.error("Extend course error:", err);
    res.status(500).json({ error: "Failed to extend course" });
  }
});


export default router;
