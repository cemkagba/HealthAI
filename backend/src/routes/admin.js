const express = require('express');
const { pool } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { requireRole }  = require('../middleware/rbac');
const { logAction }    = require('../utils/logger');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireRole('admin'));

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/users  — paginated user list
// ─────────────────────────────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    const conditions = [];
    const params = [];
    let p = 1;

    if (search) {
      conditions.push(`(full_name ILIKE $${p} OR email ILIKE $${p})`);
      params.push(`%${search}%`);
      p++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countResult, rowsResult] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM users ${where}`, params),
      pool.query(
        `SELECT id, full_name, email, role, institution, is_suspended, created_at
         FROM users ${where} ORDER BY created_at DESC LIMIT $${p++} OFFSET $${p++}`,
        [...params, limit, offset]
      ),
    ]);

    res.json({
      users: rowsResult.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count, 10),
        page, limit,
        totalPages: Math.ceil(parseInt(countResult.rows[0].count, 10) / limit),
      },
    });
  } catch (err) {
    console.error('[GET /admin/users]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/users/:id/suspend  — toggle suspend state
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/users/:id/suspend', async (req, res) => {
  try {
    const { suspended } = req.body; // boolean
    if (typeof suspended !== 'boolean') {
      return res.status(400).json({ error: '"suspended" must be a boolean' });
    }

    const existing = await pool.query('SELECT * FROM users WHERE id=$1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    if (existing.rows[0].role === 'admin') return res.status(400).json({ error: 'Admin accounts cannot be suspended' });

    const result = await pool.query(
      `UPDATE users SET is_suspended=$1 WHERE id=$2
       RETURNING id, full_name, email, role, institution, is_suspended, created_at`,
      [suspended, req.params.id]
    );

    const action = suspended ? 'USER_SUSPENDED' : 'USER_UNSUSPENDED';
    await logAction(action, req.user.userId, 'user', req.params.id, { target_email: existing.rows[0].email });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[PATCH /admin/users/:id/suspend]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/posts/:id  — admin can remove any post
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/posts/:id', async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM posts WHERE id=$1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Post not found' });

    await pool.query('DELETE FROM posts WHERE id=$1', [req.params.id]);
    await logAction('POST_REMOVED_BY_ADMIN', req.user.userId, 'post', req.params.id, {
      title: existing.rows[0].title,
    });
    res.json({ message: 'Post removed successfully' });
  } catch (err) {
    console.error('[DELETE /admin/posts/:id]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/posts  — all posts regardless of status (for admin overview)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/posts', async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const [countResult, rowsResult] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM posts'),
      pool.query(
        `SELECT p.*, u.full_name AS owner_name, u.email AS owner_email
         FROM posts p JOIN users u ON p.owner_id = u.id
         ORDER BY p.created_at DESC LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
    ]);

    res.json({
      posts: rowsResult.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count, 10),
        page, limit,
        totalPages: Math.ceil(parseInt(countResult.rows[0].count, 10) / limit),
      },
    });
  } catch (err) {
    console.error('[GET /admin/posts]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/logs  — paginated audit log
// ─────────────────────────────────────────────────────────────────────────────
router.get('/logs', async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const offset = (page - 1) * limit;

    const [countResult, rowsResult] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM audit_logs'),
      pool.query(
        `SELECT al.*, u.full_name AS actor_name, u.email AS actor_email
         FROM audit_logs al
         LEFT JOIN users u ON al.actor_id = u.id
         ORDER BY al.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
    ]);

    res.json({
      logs: rowsResult.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count, 10),
        page, limit,
        totalPages: Math.ceil(parseInt(countResult.rows[0].count, 10) / limit),
      },
    });
  } catch (err) {
    console.error('[GET /admin/logs]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/stats  — dashboard summary numbers
// ─────────────────────────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [users, posts, meetings, logs] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total, SUM(CASE WHEN is_suspended THEN 1 ELSE 0 END) AS suspended FROM users`),
      pool.query(`SELECT status, COUNT(*) AS count FROM posts GROUP BY status`),
      pool.query(`SELECT status, COUNT(*) AS count FROM meeting_requests GROUP BY status`),
      pool.query(`SELECT COUNT(*) AS total FROM audit_logs`),
    ]);

    const postsByStatus = {};
    posts.rows.forEach(r => { postsByStatus[r.status] = parseInt(r.count, 10); });

    const meetingsByStatus = {};
    meetings.rows.forEach(r => { meetingsByStatus[r.status] = parseInt(r.count, 10); });

    res.json({
      users: {
        total: parseInt(users.rows[0].total, 10),
        suspended: parseInt(users.rows[0].suspended, 10),
      },
      posts: postsByStatus,
      meetings: meetingsByStatus,
      totalLogEntries: parseInt(logs.rows[0].total, 10),
    });
  } catch (err) {
    console.error('[GET /admin/stats]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
