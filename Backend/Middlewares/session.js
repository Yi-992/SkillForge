/**
 * Session Middleware Configuration
 * 
 * Configures Express session management with PostgreSQL as the session store.
 * Sessions are persisted to the database table "user_sessions" for server restarts
 * and horizontal scaling across multiple instances.
 */

import session from "express-session";
import pgSession from "connect-pg-simple";
import pool from "../src/db.js";

const PgSession = pgSession(session);

/**
 * @constant {string} sessionSecret - Secret key for signing session IDs
 * @throws {Error} If SESSION_SECRET environment variable is not set
 * 
 * Security: Must be a strong, random string (min 32 characters recommended).
 * Load from .env file - never hardcode or commit to version control.
 */
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error("SESSION_SECRET environment variable is required");
}

/**
 * Express session middleware with PostgreSQL persistence
 * 
 * Configuration:
 * - store: PostgreSQL-backed session store using connect-pg-simple
 * - resave: false - Only save modified sessions (memory efficient)
 * - saveUninitialized: false - Only save sessions after user data is added
 * 
 * Cookie security settings:
 * - httpOnly: Prevents client-side JS access (protects against XSS)
 * - secure: Set to true in production with HTTPS (prevents man-in-the-middle)
 * - sameSite: "lax" - Mitigates CSRF attacks while allowing same-site form submissions
 * - maxAge: Session expiration time (2 hours = 7200000ms)
 */
export const sessionMiddleware = session({
  store: new PgSession({
    pool: pool,
    tableName: "user_sessions",
  }),
  name: "sid",                 // cookie name
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,   // set true if using HTTPS
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 2, // 2 hours
  },
});

export default sessionMiddleware;
