const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'db',
  database: process.env.DB_NAME || 'peopledb',
  password: process.env.DB_PASSWORD || 'password',
  port: 5432,
});

app.get('/api/people', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM people ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
});

app.post('/api/people', async (req, res) => {
  try {
    const { full_name, email } = req.body;
    const result = await pool.query(
      'INSERT INTO people (full_name, email) VALUES ($1, $2) RETURNING *',
      [full_name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Ekleme hatası' });
  }
});

app.delete('/api/people/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM people WHERE id = $1', [id]);
    res.json({ message: 'Kişi silindi' });
  } catch (err) {
    res.status(500).json({ error: 'Silme hatası' });
  }
});

app.put('/api/people/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email } = req.body;
    const result = await pool.query(
      'UPDATE people SET full_name = $1, email = $2 WHERE id = $3 RETURNING *',
      [full_name, email, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Güncelleme hatası' });
  }
});

app.listen(port, () => {
  console.log(`Backend ${port} portunda çalışıyor.`);
});