/**
 * routes/auth.js
 * --------------
 * POST /api/auth/register  -> create a new user account
 * POST /api/auth/login     -> authenticate and receive a JWT
 * GET  /api/auth/me        -> fetch the current logged-in user (protected)
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '7d';

router.post('/register', (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Please enter your name.' });
    }
    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);

    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Try logging in instead.' });
    }

    const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);
    const info = db
      .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
      .run(name.trim(), normalizedEmail, passwordHash);

    const user = { id: info.lastInsertRowid, name: name.trim(), email: normalizedEmail };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Something went wrong while creating your account. Please try again.' });
  }
});

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both email and password.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);

    if (!row || !bcrypt.compareSync(password, row.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = { id: row.id, name: row.name, email: row.email };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Something went wrong while logging you in. Please try again.' });
  }
});

router.get('/me', authenticate, (req, res) => {
  const row = db
    .prepare('SELECT id, name, email, created_at FROM users WHERE id = ?')
    .get(req.user.id);

  if (!row) {
    return res.status(404).json({ error: 'User account not found.' });
  }

  res.json({ user: row });
});

module.exports = router;
