const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { pool } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { logAction }    = require('../utils/logger');

const router = express.Router();

// Accepts:  user@uni.edu  OR  user@uni.edu.tr
function isValidEduEmail(email) {
  return /^[^\s@]+@[^\s@]+\.(edu\.tr|edu)$/i.test(email.trim());
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, role, institution } = req.body;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ error: 'full_name, email, password, and role are required' });
    }

    if (!isValidEduEmail(email)) {
      return res.status(400).json({
        error: 'Email must belong to an academic institution (must end with .edu or .edu.tr)',
      });
    }

    const allowedRoles = ['engineer', 'healthcare_professional'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        error: 'Role must be either "engineer" or "healthcare_professional"',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, institution)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, role, institution, is_suspended, created_at`,
      [full_name.trim(), email.toLowerCase().trim(), password_hash, role, institution?.trim() || null]
    );

    const user = result.rows[0];
    await logAction('USER_REGISTERED', user.id, 'user', user.id, { role });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user });
  } catch (err) {
    console.error('[POST /auth/register]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (user.is_suspended) {
      return res.status(403).json({
        error: 'Your account has been suspended. Please contact an administrator.',
      });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await logAction('USER_LOGIN', user.id, 'user', user.id, { email: user.email });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error('[POST /auth/login]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, email, role, institution, is_suspended, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[GET /auth/me]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/auth/me
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [req.user.userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    await logAction('USER_DELETED_ACCOUNT', req.user.userId, 'user', req.user.userId, {});
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('[DELETE /auth/me]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
