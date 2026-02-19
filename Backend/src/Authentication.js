import express from "express";
import argon2 from "argon2";
import pool from "./db.js";
import { requireAuth } from "./requireAuth.js";

const router = express.Router();

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Test route
router.get("/test", (req, res) => {
  res.send("AUTH ROUTER WORKS");
});

// Register
router.post("/register", async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }
  if (name.length < 2) {
    return res.status(400).json({ error: "Name must be at least 2 characters" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  try {
    const existing = await pool.query("SELECT 1 FROM users WHERE email = $1 LIMIT 1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await argon2.hash(password);

    await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)",
      [name, email, passwordHash]
    );

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already registered" });
    }
    res.status(500).json({ error: "Database error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const result = await pool.query(
      "SELECT id, email, password_hash FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isValid = await argon2.verify(user.password_hash, password);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    // ✅ Create session
    req.session.user = {
      id: user.id,
      email: user.email,
    };

    res.json({ message: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("sid");
    res.json({ message: "Logged out" });
  });
});

// Get current user (protected)
router.get("/me", requireAuth, (req, res) => {
  res.json({
    user: req.session.user,
  });
});

export default router;
