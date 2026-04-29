const express = require('express');
const { pool } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { logAction }    = require('../utils/logger');

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/meetings
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  try {
    const { post_id, nda_accepted, proposed_slots, message } = req.body;

    if (!post_id || nda_accepted !== true) {
      return res.status(400).json({ error: 'post_id is required and nda_accepted must be true' });
    }
    if (!Array.isArray(proposed_slots) || proposed_slots.length < 1 || proposed_slots.length > 3) {
      return res.status(400).json({ error: 'proposed_slots must be an array of 1–3 datetime strings' });
    }
    for (const slot of proposed_slots) {
      if (isNaN(Date.parse(slot))) return res.status(400).json({ error: `Invalid datetime: "${slot}"` });
    }

    const postResult = await pool.query('SELECT * FROM posts WHERE id = $1', [post_id]);
    if (postResult.rows.length === 0) return res.status(404).json({ error: 'Post not found' });

    const post = postResult.rows[0];
    if (post.status !== 'active') return res.status(409).json({ error: 'Meeting requests can only be sent to active posts' });
    if (post.owner_id === req.user.userId) return res.status(400).json({ error: 'You cannot send a request to your own post' });

    const dupCheck = await pool.query(
      `SELECT id FROM meeting_requests WHERE post_id=$1 AND requester_id=$2 AND status='pending'`,
      [post_id, req.user.userId]
    );
    if (dupCheck.rows.length > 0) return res.status(409).json({ error: 'You already have a pending request for this post' });

    const result = await pool.query(
      `INSERT INTO meeting_requests (post_id, requester_id, nda_accepted, proposed_slots, message)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [post_id, req.user.userId, true, JSON.stringify(proposed_slots), message?.trim() || null]
    );
    await logAction('MEETING_REQUEST_SENT', req.user.userId, 'meeting_request', result.rows[0].id, { post_id });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('[POST /meetings]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/meetings/received
router.get('/received', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT mr.*, u.full_name AS requester_name, u.email AS requester_email,
              u.institution AS requester_institution, u.role AS requester_role, p.title AS post_title
       FROM meeting_requests mr
       JOIN users u ON mr.requester_id = u.id
       JOIN posts p ON mr.post_id = p.id
       WHERE p.owner_id = $1 ORDER BY mr.created_at DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[GET /meetings/received]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/meetings/sent
router.get('/sent', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT mr.*, p.title AS post_title, u.full_name AS post_owner_name,
              u.institution AS post_owner_institution
       FROM meeting_requests mr
       JOIN posts p ON mr.post_id = p.id
       JOIN users u ON p.owner_id = u.id
       WHERE mr.requester_id = $1 ORDER BY mr.created_at DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[GET /meetings/sent]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/meetings/:id/accept  — post owner accepts a slot
router.patch('/:id/accept', authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    const { accepted_slot } = req.body;
    if (!accepted_slot || isNaN(Date.parse(accepted_slot))) {
      return res.status(400).json({ error: 'A valid accepted_slot datetime is required' });
    }
    await client.query('BEGIN');

    const mrResult = await client.query('SELECT * FROM meeting_requests WHERE id=$1', [req.params.id]);
    if (mrResult.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Not found' }); }

    const mr = mrResult.rows[0];
    if (mr.status !== 'pending') { await client.query('ROLLBACK'); return res.status(409).json({ error: 'Only pending requests can be accepted' }); }

    const postResult = await client.query('SELECT * FROM posts WHERE id=$1', [mr.post_id]);
    if (postResult.rows[0].owner_id !== req.user.userId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Only the post owner can accept requests' });
    }

    const updated = await client.query(
      `UPDATE meeting_requests SET status='accepted', accepted_slot=$1 WHERE id=$2 RETURNING *`,
      [new Date(accepted_slot), req.params.id]
    );
    await client.query(
      `UPDATE meeting_requests SET status='rejected' WHERE post_id=$1 AND id!=$2 AND status='pending'`,
      [mr.post_id, req.params.id]
    );
    await client.query(`UPDATE posts SET status='meeting_scheduled', updated_at=NOW() WHERE id=$1`, [mr.post_id]);
    await client.query('COMMIT');

    await logAction('MEETING_REQUEST_ACCEPTED', req.user.userId, 'meeting_request', req.params.id, { post_id: mr.post_id, accepted_slot });
    res.json(updated.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[PATCH /meetings/:id/accept]', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// PATCH /api/meetings/:id/reject  — post owner rejects
router.patch('/:id/reject', authenticate, async (req, res) => {
  try {
    const mrResult = await pool.query('SELECT * FROM meeting_requests WHERE id=$1', [req.params.id]);
    if (mrResult.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const mr = mrResult.rows[0];
    if (mr.status !== 'pending') return res.status(409).json({ error: 'Only pending requests can be rejected' });

    const postResult = await pool.query('SELECT owner_id FROM posts WHERE id=$1', [mr.post_id]);
    if (postResult.rows[0].owner_id !== req.user.userId) return res.status(403).json({ error: 'Only the post owner can reject requests' });

    const result = await pool.query(
      `UPDATE meeting_requests SET status='rejected' WHERE id=$1 RETURNING *`, [req.params.id]
    );
    await logAction('MEETING_REQUEST_REJECTED', req.user.userId, 'meeting_request', req.params.id, { post_id: mr.post_id });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[PATCH /meetings/:id/reject]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
