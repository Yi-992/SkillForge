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

const names = ['courses', 'curriculum', 'modules', 'lessons', 'user_courses'];
for (const n of names) {
  const r = await pool.query(
    "select column_name,data_type from information_schema.columns where table_schema='public' and table_name=$1 order by ordinal_position",
    [n]
  );
  console.log('\n' + n + ': ' + r.rows.map((x) => x.column_name + ':' + x.data_type).join(', '));
}

const counts = await pool.query(
  "select (select count(*) from courses) as courses, (select count(*) from curriculum) as curriculum, (select count(*) from modules) as modules, (select count(*) from lessons) as lessons"
);
console.log('\nCOUNTS', counts.rows[0]);

const missing = await pool.query(
  `select c.title
   from courses c
   left join curriculum cur on cur.request_key = c.title
   where cur.id is null
   order by c.title
   limit 25`
);
console.log('\nCOURSES_WITHOUT_CURRICULUM', missing.rows.map((r) => r.title));

await pool.end();
