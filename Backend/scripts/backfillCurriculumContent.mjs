import fs from 'fs';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: 'Backend/.env' });

const { Pool } = pg;
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

function uniq(arr) {
  return [...new Set(arr.map((s) => s.trim()).filter(Boolean))];
}

function extractQuotedStrings(block) {
  const out = [];
  const re = /"([^"]+)"/g;
  let m;
  while ((m = re.exec(block))) out.push(m[1]);
  return out;
}

function extractLearningTitles() {
  const file = fs.readFileSync('Frontend/src/Learning.jsx', 'utf8');
  const titles = [];

  const featureTitleRe = /title:\s*"([^"]+)"/g;
  let m;
  while ((m = featureTitleRe.exec(file))) titles.push(m[1]);

  const popularBlock = file.match(/const popularCourses = \[([\s\S]*?)\];/);
  if (popularBlock) titles.push(...extractQuotedStrings(popularBlock[1]));

  const coursesBlockRe = /courses:\s*\[([^\]]*?)\]/g;
  while ((m = coursesBlockRe.exec(file))) {
    titles.push(...extractQuotedStrings(m[1]));
  }

  return uniq(titles);
}

function textParagraph(topic, moduleTitle, lessonTitle, emphasis) {
  return `${topic} requires practical understanding, not memorization. In ${moduleTitle}, ${lessonTitle} focuses on ${emphasis} through guided examples and repeatable workflows. Start by identifying the problem each concept solves, then connect it to real implementation decisions. As complexity grows, break tasks into smaller checkpoints and validate outcomes at each step. This approach improves confidence, speeds up troubleshooting, and makes your progress measurable over time.`;
}

function codeSample(topic, lessonIdx) {
  return `// ${topic} practice snippet ${lessonIdx + 1}\nfunction planSession(goal) {\n  const steps = [\n    'define objective',\n    'implement smallest useful version',\n    'measure outcome',\n    'iterate with one improvement'\n  ];\n  return { goal, steps, complete: false };\n}\n\nconst session = planSession('Build ${topic} fundamentals');\nconsole.log(session);`;
}

function makeLesson(topic, moduleTitle, lessonTitle, lessonIdx) {
  return {
    title: lessonTitle,
    content: {
      sections: [
        { type: 'text', value: textParagraph(topic, moduleTitle, lessonTitle, 'foundational patterns') },
        { type: 'text', value: textParagraph(topic, moduleTitle, lessonTitle, 'decision-making under constraints') },
        { type: 'text', value: textParagraph(topic, moduleTitle, lessonTitle, 'real-world execution and review loops') },
        { type: 'code', language: 'javascript', value: codeSample(topic, lessonIdx) },
        { type: 'link', href: 'https://developer.mozilla.org/', text: 'Reference: MDN Documentation' },
        { type: 'image', src: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085', caption: `${topic} workspace setup` },
        { type: 'video', src: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
      ]
    }
  };
}

function makeCurriculum(topic) {
  const modules = [
    { title: `Foundations of ${topic}`, lessons: ['Core Concepts', 'Mental Models', 'Essential Terminology'] },
    { title: `Core Techniques in ${topic}`, lessons: ['Implementation Workflow', 'Quality and Validation', 'Debugging and Iteration'] },
    { title: `${topic} in Practice`, lessons: ['Project Blueprint', 'Hands-on Build', 'Performance and Optimization'] },
    { title: `Mastery Path for ${topic}`, lessons: ['Advanced Scenarios', 'Portfolio-Ready Output', 'Long-term Growth Plan'] },
  ];

  return {
    title: topic,
    description: `${topic} curriculum designed for progressive mastery with practical examples, guided implementation, and structured review loops.`,
    modules: modules.map((m, moduleIdx) => ({
      title: m.title,
      lessons: m.lessons.map((name, lessonIdx) => makeLesson(topic, m.title, name, moduleIdx * 3 + lessonIdx)),
    })),
  };
}

async function ensureCourseRow(title) {
  const existing = await pool.query('select id from courses where title = $1 limit 1', [title]);
  if (existing.rows.length) return;
  await pool.query(
    'insert into courses (title, image_url) values ($1, $2)',
    [title, 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b']
  );
}

async function upsertCurriculum(title) {
  const course = makeCurriculum(title);

  const currRes = await pool.query(
    `insert into curriculum (request_key, title, description)
     values ($1, $2, $3)
     on conflict (request_key) do update
     set title = excluded.title,
         description = excluded.description
     returning id`,
    [title, course.title, course.description]
  );

  const curriculumId = currRes.rows[0].id;

  const moduleCountRes = await pool.query(
    'select count(*)::int as count from modules where curriculum_id = $1',
    [curriculumId]
  );
  const moduleCount = moduleCountRes.rows[0].count;

  if (moduleCount > 0) {
    const lessonCountRes = await pool.query(
      `select count(*)::int as count
       from lessons l
       join modules m on m.id = l.module_id
       where m.curriculum_id = $1`,
      [curriculumId]
    );
    const lessonCount = lessonCountRes.rows[0].count;

    if (lessonCount > 0) return { inserted: false, reason: 'already_has_content' };

    await pool.query(
      `delete from lessons
       where module_id in (select id from modules where curriculum_id = $1)`,
      [curriculumId]
    );
    await pool.query('delete from modules where curriculum_id = $1', [curriculumId]);
  }

  for (let mi = 0; mi < course.modules.length; mi++) {
    const mod = course.modules[mi];
    const modRes = await pool.query(
      'insert into modules (curriculum_id, title, order_index) values ($1, $2, $3) returning id',
      [curriculumId, mod.title, mi]
    );
    const moduleId = modRes.rows[0].id;

    for (let li = 0; li < mod.lessons.length; li++) {
      const lesson = mod.lessons[li];
      await pool.query(
        'insert into lessons (module_id, title, content, order_index) values ($1, $2, $3, $4)',
        [moduleId, lesson.title, JSON.stringify(lesson.content), li]
      );
    }
  }

  return { inserted: true };
}

const learningTitles = extractLearningTitles();

const missingFromCoursesRes = await pool.query(
  `select c.title
   from courses c
   left join curriculum cur on cur.request_key = c.title
   where cur.id is null
   order by c.title`
);

const priorityMissing = missingFromCoursesRes.rows.map((r) => r.title);
const allTargets = uniq([...priorityMissing, ...learningTitles]);

let inserted = 0;
let skipped = 0;
let failed = 0;

for (const title of allTargets) {
  try {
    await ensureCourseRow(title);
    const result = await upsertCurriculum(title);
    if (result.inserted) inserted += 1;
    else skipped += 1;
  } catch (err) {
    failed += 1;
    console.error('FAILED:', title, err.message);
  }
}

const finalCounts = await pool.query(
  "select (select count(*) from courses) as courses, (select count(*) from curriculum) as curriculum, (select count(*) from modules) as modules, (select count(*) from lessons) as lessons"
);

console.log('BACKFILL_DONE', { targets: allTargets.length, inserted, skipped, failed });
console.log('FINAL_COUNTS', finalCounts.rows[0]);

await pool.end();
