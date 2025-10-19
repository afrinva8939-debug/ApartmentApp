/**
 * server.js
 * Minimal, robust Express + mysql2 server for your app.
 *
 * - Provides /api/test-apartments (simple test)
 * - Provides /api/results that safely applies simple filters
 * - Falls back to sample data when DB is not available
 *
 * IMPORTANT:
 * Create a .env with DB credentials:
 * DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME
 * PORT (optional, defaults to 5000)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

// config from env with safe defaults
const cfg = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'root',
  database: process.env.DB_NAME || 'apartments',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool = null;
let dbAvailable = false;

async function initDb() {
  try {
    pool = mysql.createPool(cfg);
    // quick test query
    await pool.query('SELECT 1');
    dbAvailable = true;
    console.log(`✅ MySQL connected: ${cfg.host} ${cfg.database}`);
  } catch (err) {
    dbAvailable = false;
    console.warn('⚠️ Cannot connect to MySQL — falling back to sample data.');
    console.warn('DB error:', err.message || err);
  }
}
initDb();

// Sample fallback rows (used when DB unavailable)
const sampleRows = [
  {
    id: 1,
    refid: 'REF1001',
    apt_result_apartment_name: 'Sample Towers',
    apt_result_address: '123 Example St',
    beds: 2,
    bath: 1,
  },
  {
    id: 2,
    refid: 'REF1002',
    apt_result_apartment_name: 'Example Heights',
    apt_result_address: '456 Example Ave',
    beds: 3,
    bath: 2,
  },
];

// === Helpers: whitelist allowed filters and map param -> column ===
// If your DB column names differ from the query params, adjust the map below.
const allowedFilters = {
  // queryParam : columnNameInDB
  bath: 'apt_result_bath',   // ?bath=1 -> column apt_result_bath
  beds: 'apt_result_bed',    // ?beds=2 -> column apt_result_bed
  refid: 'refid',
  group_name: 'group_name',
  // add more mappings if needed
};


// Build WHERE / params safely
function buildWhereFromQuery(q) {
  const clauses = [];
  const values = [];
  for (const [param, column] of Object.entries(allowedFilters)) {
    if (q[param] !== undefined && q[param] !== '') {
      // numeric values should be converted, but we'll accept as-is and pass as parameter
      clauses.push(`${column} = ?`);
      values.push(q[param]);
    }
  }
  const where = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
  return { where, values };
}

// === API routes ===

// test route
app.get('/api/test-apartments', async (req, res) => {
  if (!dbAvailable) {
    return res.json({ ok: true, source: 'sample', rows: sampleRows.slice(0, 10) });
  }
  try {
    const [rows] = await pool.query('SELECT id, refid, apt_result_apartment_name, apt_result_address FROM apartment_details LIMIT 10');
    res.json({ ok: true, source: 'db', rows });
  } catch (err) {
    console.error('Query error (test):', err.message || err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

// main results route
app.get('/api/results', async (req, res) => {
  // Example: allowed query params: ?bath=1&beds=2
  const q = req.query;

  // Build where and params safely
  const { where, values } = buildWhereFromQuery(q);

  // final SQL - add LIMIT to avoid runaway results in testing
  const sql = `SELECT * FROM apartment_details ${where} LIMIT 500`;

  if (!dbAvailable) {
    // return filtered sample data if DB isn't connected
    let results = sampleRows;
    if (q.bath !== undefined) results = results.filter(r => String(r.bath) === String(q.bath));
    if (q.beds !== undefined) results = results.filter(r => String(r.beds) === String(q.beds));
    return res.json({ ok: true, source: 'sample', rows: results });
  }

  try {
    const [rows] = await pool.query(sql, values);
    res.json({ ok: true, source: 'db', rows });
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

// Serve static index (placeholder or built React)
const publicPath = path.join(__dirname, 'public');

// if you have a produced React build placed inside backend/public, Express will serve it.
// We also include a small placeholder index.html in public so we don't get ENOENT.
app.use(express.static(publicPath));
app.get('*', (req, res) => {
  // fallback to index.html to allow SPA client-side routing
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Start server
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started and listening on http://localhost:${PORT}`);
});
