/**
 * Idempotent seed script.
 * Checks for existing data before inserting — safe to call on every startup.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const SALT_ROUNDS = 12;

async function runSeed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ── Check if seed already applied ────────────────────────────────────────
    const { rows } = await client.query(
      "SELECT id FROM users WHERE email = 'yigit@cankaya.edu.tr' LIMIT 1"
    );
    if (rows.length > 0) {
      console.log('ℹ️  Seed already applied, skipping.');
      await client.query('ROLLBACK');
      return;
    }

    // ── Hash passwords ────────────────────────────────────────────────────────
    // Note: '1234' is used here as a direct DB seed, bypassing the API's
    // 8-character minimum which only applies to the /auth/register endpoint.
    const [adminHash, engineerHash, doctorHash] = await Promise.all([
      bcrypt.hash('1234', SALT_ROUNDS),
      bcrypt.hash('1234', SALT_ROUNDS),
      bcrypt.hash('1234', SALT_ROUNDS),
    ]);

    // ── Insert users ──────────────────────────────────────────────────────────
    const adminRes = await client.query(
      `INSERT INTO users (full_name, email, password_hash, role, institution)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      ['Yiğit Tacir', 'yigit@cankaya.edu.tr', adminHash, 'admin', 'Çankaya University']
    );
    const engineerRes = await client.query(
      `INSERT INTO users (full_name, email, password_hash, role, institution)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      ['Cem Kağba', 'cem@cankaya.edu.tr', engineerHash, 'engineer', 'Çankaya University']
    );
    const doctorRes = await client.query(
      `INSERT INTO users (full_name, email, password_hash, role, institution)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      ['Dr. Selin Samray', 'selin@cankaya.edu.tr', doctorHash, 'healthcare_professional', 'Çankaya University']
    );

    const adminId    = adminRes.rows[0].id;
    const engineerId = engineerRes.rows[0].id;
    const doctorId   = doctorRes.rows[0].id;

    // ── Insert posts (owned by Dr. Selin Samray) ──────────────────────────────
    await client.query(
      `INSERT INTO posts (owner_id, title, domain, required_expertise, stage, city, description, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')`,
      [
        doctorId,
        'AI-Powered ECG Anomaly Detection',
        'Cardiology',
        'Machine Learning',
        'Prototype',
        'Ankara',
        `We are developing an AI model capable of detecting rare cardiac arrhythmias from 12-lead ECG data with higher sensitivity than current clinical tools. The clinical dataset (de-identified) is ready and pre-processed. We are seeking a Machine Learning engineer experienced in time-series classification and model interpretability (SHAP/LIME) to join the team. The goal is to publish findings and proceed to a multi-center validation study. Weekly virtual syncs via Teams are planned.`,
      ]
    );

    await client.query(
      `INSERT INTO posts (owner_id, title, domain, required_expertise, stage, city, description, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')`,
      [
        doctorId,
        'NLP-Based Clinical Note Summarization',
        'Health Informatics',
        'Natural Language Processing',
        'Ideation',
        'Istanbul',
        `Clinicians in our hospital spend an average of 2.3 hours per shift on documentation. This project aims to build a Turkish-language NLP pipeline that auto-summarizes free-text SOAP notes into structured discharge summaries. We have IRB approval and access to a corpus of 50,000+ anonymized notes. Looking for an NLP engineer with experience in transformer-based models (BERT/mBERT) and ideally Turkish language models such as BERTurk. No patient identifiers will be shared outside the hospital firewall.`,
      ]
    );

    await client.query(
      `INSERT INTO posts (owner_id, title, domain, required_expertise, stage, city, description, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')`,
      [
        doctorId,
        'Federated Learning for MRI Segmentation',
        'Radiology',
        'Federated Learning',
        'Research',
        'Izmir',
        `This project addresses the critical challenge of training robust brain tumor segmentation models without centralizing sensitive MRI data. We propose a federated learning framework across three partner hospitals in the Aegean region. Each site retains full data sovereignty. We need an engineer with expertise in federated learning frameworks (PySyft, Flower) and medical image segmentation (U-Net variants). The long-term goal is a CE-marked clinical decision support tool. Research grant funding is already secured for Phase 1.`,
      ]
    );

    // ── Seed audit log entry ──────────────────────────────────────────────────
    await client.query(
      `INSERT INTO audit_logs (action, actor_id, target_type, metadata)
       VALUES ('SYSTEM_SEED', $1, 'system', $2)`,
      [adminId, JSON.stringify({ note: 'Initial seed applied on first startup' })]
    );

    await client.query('COMMIT');
    console.log('🌱 Seed complete: 3 users + 3 active posts created.');
    console.log('   yigit@cankaya.edu.tr   / 1234  (admin)');
    console.log('   cem@cankaya.edu.tr     / 1234  (engineer)');
    console.log('   selin@cankaya.edu.tr   / 1234  (healthcare_professional)');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { runSeed };

