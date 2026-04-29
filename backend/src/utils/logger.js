const { pool } = require('../config/db');

/**
 * Writes a structured entry to the audit_logs table.
 * Failures are caught and logged to console — never throw.
 *
 * @param {string} action      - e.g. 'USER_REGISTERED', 'POST_DELETED'
 * @param {string|null} actorId   - UUID of acting user (null for system)
 * @param {string|null} targetType - 'user' | 'post' | 'meeting_request'
 * @param {string|null} targetId   - UUID of the affected resource
 * @param {object} metadata    - Any additional structured data
 */
async function logAction(action, actorId = null, targetType = null, targetId = null, metadata = {}) {
  try {
    await pool.query(
      `INSERT INTO audit_logs (action, actor_id, target_type, target_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [action, actorId, targetType, targetId, JSON.stringify(metadata)]
    );
  } catch (err) {
    console.error(`[AUDIT LOG FAILED] ${action}:`, err.message);
  }
}

module.exports = { logAction };
