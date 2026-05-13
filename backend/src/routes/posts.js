const express = require('express');
const { pool } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { logAction }    = require('../utils/logger');

const router = express.Router();

const VALID_STATUSES = ['draft', 'active', 'meeting_scheduled', 'partner_found', 'expired'];

// Helper: expire overdue active posts
async function expireOverduePosts(client) {
  const result = await client.query(
    `UPDATE posts
     SET status = 'expired', updated_at = NOW()
     WHERE status = 'active'
       AND expires_at IS NOT NULL
       AND expires_at < NOW()
     RETURNING id, owner_id, title`
  );
  if (result.rows.length > 0) {
    console.log(`⏰ Auto-expired ${result.rows.length} post(s).`);
    // Create notifications for owners
    for (const post of result.rows) {
      await client.query(
        `INSERT INTO notifications (user_id, type, message, link_url)
         VALUES ($1, 'POST_EXPIRED', $2, '/my-posts')`,
        [post.owner_id, `Your post "${post.title}" has expired and is no longer visible.`]
      );
    }
  }
  return result.rows.length;
}

module.exports.expireOverduePosts = expireOverduePosts;

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/posts
// Server-side filtering: ?domain=&expertise=&city=&page=1&limit=12
// Returns only 'active' posts for non-owners; draft posts never exposed here.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const { domain, expertise, city } = req.query;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const offset = (page - 1) * limit;

    // Auto-expire before returning results
    const dbClient = await pool.connect();
    try {
      await expireOverduePosts(dbClient);
    } finally {
      dbClient.release();
    }

    const conditions = ["p.status = 'active'"];
    const params = [];
    let p = 1;

    if (domain)    { conditions.push(`p.domain ILIKE $${p++}`);             params.push(`%${domain}%`); }
    if (expertise) { conditions.push(`p.required_expertise ILIKE $${p++}`); params.push(`%${expertise}%`); }
    if (city)      { conditions.push(`p.city ILIKE $${p++}`);               params.push(`%${city}%`); }

    const where = conditions.join(' AND ');

    const [countResult, rowsResult] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM posts p WHERE ${where}`, params),
      pool.query(
        `SELECT p.*, u.full_name AS owner_name, u.institution AS owner_institution
         FROM posts p JOIN users u ON p.owner_id = u.id
         WHERE ${where}
         ORDER BY p.created_at DESC
         LIMIT $${p++} OFFSET $${p++}`,
        [...params, limit, offset]
      ),
    ]);

    const total = parseInt(countResult.rows[0].count, 10);
    res.json({
      posts: rowsResult.rows,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[GET /posts]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/posts/mine  (must be before /:id to avoid conflict)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/mine', authenticate, async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const [countResult, rowsResult] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM posts WHERE owner_id = $1', [req.user.userId]),
      pool.query(
        `SELECT p.*, u.full_name AS owner_name, u.institution AS owner_institution
         FROM posts p JOIN users u ON p.owner_id = u.id
         WHERE p.owner_id = $1
         ORDER BY p.created_at DESC
         LIMIT $2 OFFSET $3`,
        [req.user.userId, limit, offset]
      ),
    ]);

    const total = parseInt(countResult.rows[0].count, 10);
    res.json({
      posts: rowsResult.rows,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[GET /posts/mine]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/posts/:id
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.full_name AS owner_name, u.institution AS owner_institution
       FROM posts p JOIN users u ON p.owner_id = u.id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    const post = result.rows[0];

    // Draft posts are only visible to their owner
    if (post.status === 'draft' && post.owner_id !== req.user.userId) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (err) {
    console.error('[GET /posts/:id]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/posts
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, domain, required_expertise, stage, city, description, status, duration_days } = req.body;

    if (!title || !domain || !required_expertise || !stage || !city || !description) {
      return res.status(400).json({ error: 'title, domain, required_expertise, stage, city, and description are required' });
    }

    const initialStatus = status === 'active' ? 'active' : 'draft';

    // Validate and clamp duration
    const days = Math.min(90, Math.max(20, parseInt(duration_days) || 20));
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const result = await pool.query(
      `INSERT INTO posts (owner_id, title, domain, required_expertise, stage, city, description, status, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [req.user.userId, title.trim(), domain.trim(), required_expertise.trim(), stage.trim(), city.trim(), description.trim(), initialStatus, expiresAt]
    );

    await logAction('POST_CREATED', req.user.userId, 'post', result.rows[0].id, { status: initialStatus, duration_days: days });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[POST /posts]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/posts/:id  — owner only, edit content fields
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id', authenticate, async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM posts WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    if (existing.rows[0].owner_id !== req.user.userId) return res.status(403).json({ error: 'Only the post owner can edit this post' });

    const { title, domain, required_expertise, stage, city, description } = req.body;
    const post = existing.rows[0];

    const result = await pool.query(
      `UPDATE posts
       SET title = $1, domain = $2, required_expertise = $3, stage = $4,
           city = $5, description = $6, updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [
        title?.trim()               || post.title,
        domain?.trim()              || post.domain,
        required_expertise?.trim()  || post.required_expertise,
        stage?.trim()               || post.stage,
        city?.trim()                || post.city,
        description?.trim()         || post.description,
        req.params.id,
      ]
    );

    await logAction('POST_UPDATED', req.user.userId, 'post', req.params.id, {});
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[PUT /posts/:id]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/posts/:id/status  — owner only
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const existing = await pool.query('SELECT * FROM posts WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    if (existing.rows[0].owner_id !== req.user.userId) return res.status(403).json({ error: 'Only the post owner can change post status' });

    const result = await pool.query(
      `UPDATE posts SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );

    await logAction('POST_STATUS_CHANGED', req.user.userId, 'post', req.params.id, {
      from: existing.rows[0].status, to: status,
    });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[PATCH /posts/:id/status]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/posts/:id/expiry  — owner only, update expiry date
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id/expiry', authenticate, async (req, res) => {
  try {
    const { duration_days } = req.body;
    if (!duration_days) {
      return res.status(400).json({ error: 'duration_days is required' });
    }

    const existing = await pool.query('SELECT * FROM posts WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
    if (existing.rows[0].owner_id !== req.user.userId) return res.status(403).json({ error: 'Only the post owner can change expiry' });

    // Validate: minimum 20 days from now
    const days = Math.min(90, Math.max(20, parseInt(duration_days)));
    const newExpiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const result = await pool.query(
      `UPDATE posts SET expires_at = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [newExpiresAt, req.params.id]
    );

    await logAction('POST_EXPIRY_UPDATED', req.user.userId, 'post', req.params.id, { days });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[PATCH /posts/:id/expiry]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
module.exports = router;
module.exports.expireOverduePosts = expireOverduePosts;
