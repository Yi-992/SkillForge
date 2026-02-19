import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import sessionMiddleware from "../Middlewares/session.js";
import learningRouter from "./learning.js";
import userRoutes from "./users.js";
import authRoutes from "./Authentication.js";
import { requireAuth } from "./requireAuth.js";
import gamingRouter from "./gaming.js";
import tttRouter from "../Games/tictactoe.js";
import gamesStatsRouter from "../Games/gamesStats.js";
import aiRouter from "./ai.js";
import pool from "./db.js";
import lessonsRouter from "../src/lesson.js";
import sportsRouter from "../src/sports.js";


const app = express();
const PORT = 5143;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware order matters
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(sessionMiddleware);

// 🔥 ADD THIS MIDDLEWARE (CRITICAL)
app.use((req, res, next) => {
  if (!pool) {
    console.error("❌ DB pool is not initialized");
    return res.status(500).json({ error: "Database not available" });
  }

  req.db = pool;
  next();
});


// ===== STATIC FILES (CSS, JS, images) =====
app.use(express.static(path.join(__dirname, "../public")));

// ===== TEST ROUTE =====
app.get("/ping", (req, res) => {
  res.send("pong");
});

// ===== API ROUTES =====
app.use("/auth", authRoutes); // login, register, logout (public)
app.use("/users", requireAuth, userRoutes); // protected API
app.use("/api/learning", requireAuth, learningRouter); // protected API
app.use("/api/gaming", requireAuth, gamingRouter);
app.use("/api/tictactoe", requireAuth, tttRouter);
app.use("/api/stats", requireAuth, gamesStatsRouter);
app.use("/api/ai", requireAuth,aiRouter);
app.use("/api/lessons", requireAuth, lessonsRouter);
app.use("/api/sports", requireAuth, sportsRouter);

// ===== GLOBAL ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});


// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`API running at http://127.0.0.1:${PORT}`);
});
