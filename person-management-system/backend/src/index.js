const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Email validation function
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
// ID validation function
const isValidId = (id) => /^\d+$/.test(String(id));

// Get /api/people all people
app.get('/api/people', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM people ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// Get /api/people/:id single person
app.get('/api/people/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ error: "VALIDATION_ERROR" });
    }
    const result = await pool.query('SELECT * FROM people WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "NOT_FOUND" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// Post /api/people
app.post('/api/people', async (req, res) => {
  const { full_name, email } = req.body;

  if (!full_name || !email || !isValidEmail(email)) {
    return res.status(400).json({ error: "VALIDATION_ERROR" });
  }

  try {
    const result = await pool.query(
      'INSERT INTO people (full_name, email) VALUES ($1, $2) RETURNING *',
      [full_name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    // Check for unique constraint violation (email already exists)
    if (err.code === '23505') {
      return res.status(409).json({ error: "EMAIL_ALREADY_EXISTS" });
    }
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// Put /api/people/:id
app.put('/api/people/:id', async (req, res) => {
  const { id } = req.params;
  const { full_name, email } = req.body;

  // Validate ID, full_name, and email
  if (!isValidId(id) || !full_name || !email || !isValidEmail(email)) {
    return res.status(400).json({ error: "VALIDATION_ERROR" });
  }

  try {
    const result = await pool.query(
      'UPDATE people SET full_name = $1, email = $2 WHERE id = $3 RETURNING *',
      [full_name, email, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "NOT_FOUND" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: "EMAIL_ALREADY_EXISTS" });
    }
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// Delete /api/people/:id
app.delete('/api/people/:id', async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ error: "VALIDATION_ERROR" });
  }
  try {
    const result = await pool.query('DELETE FROM people WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "NOT_FOUND" });
    }
    res.status(200).json({ message: "SUCCESS" });
  } catch (err) {
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// Export app for testing purposes