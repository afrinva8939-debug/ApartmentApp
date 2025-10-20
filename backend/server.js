// server.js (CommonJS style — works with node >= 12)
import os from 'os';
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors()); // allow requests from any origin (for dev). In production restrict origin.
app.use(express.json());

// --- DB config (from .env or fallback)
const cfg = {
  host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : (process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306),
  user: process.env.DB_USER || process.env.MYSQL_USER || 'root',
  password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || 'root',
  database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'apartments',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool = null;
async function initPool() {
  try {
    pool = mysql.createPool(cfg);
    // quick test query
    await pool.query('SELECT 1');
    console.log('✅ MySQL pool ready');
  } catch (err) {
    pool = null;
    console.warn('⚠️ Cannot connect to MySQL — server will still run but use sample data. DB error:', err.message);
  }
}
initPool().catch(err => console.error('initPool error', err));

// --- Sample fallback rows (used if DB not connected)
const SAMPLE_ROWS = [
  { id: 1001, refid: 'REF1001', apt_result_apartment_name: 'Sample Apartments', apt_result_address: '123 Example St', apt_result_bed: '1 Bed', apt_result_bath: '1 Bath' },
  { id: 1002, refid: 'REF1002', apt_result_apartment_name: 'Sample Apartments', apt_result_address: '456 Example St', apt_result_bed: '2 Bed', apt_result_bath: '2 Bath' },
];

// --- Allowed filters map (query param -> DB column)
const allowedFilters = {
  beds: 'apt_result_bed',    // /api/results?beds=2  -> apt_result_bed LIKE '2%'
  bed: 'apt_result_bed',
  bath: 'apt_result_bath',   // /api/results?bath=1  -> apt_result_bath LIKE '1%'
  refid: 'refid',
  group_name: 'group_name',
  // add more mappings if needed
};

// Build WHERE clause safely, returning SQL and values
function buildWhereFromQuery(q = {}) {
  const clauses = [];
  const values = [];

  for (const [param, column] of Object.entries(allowedFilters)) {
    if (q[param] === undefined || q[param] === '') continue;
    const v = String(q[param]).trim();
    if (column === 'apt_result_bed' || column === 'apt_result_bath') {
      // match prefix: "2 Bed", "1 Bath", etc.
      clauses.push(`${column} LIKE ?`);
      values.push(`${v}%`);
    } else {
      clauses.push(`${column} = ?`);
      values.push(v);
    }
  }

  const where = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
  return { where, values };
}

// Remove numeric shorthand fields before sending response
function removeNumericBedsBath(rows) {
  return rows.map(r => {
    const copy = Object.assign({}, r);
    if ('bath' in copy) delete copy.bath;
    if ('beds' in copy) delete copy.beds;
    return copy;
  });
}

// Serve static public (if you build frontend into backend/public)
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath, { index: false }));

// --- API: test route ---
app.get('/api/test-apartments', async (req, res) => {
  try {
    if (!pool) return res.json({ ok: true, source: 'sample', rows: SAMPLE_ROWS.map(r => removeNumericBedsBath([r])[0]) });
    const [rows] = await pool.query('SELECT * FROM apartment_details LIMIT 500');
    return res.json({ ok: true, source: 'db', rows: removeNumericBedsBath(rows) });
  } catch (err) {
    console.error('Test route error:', err);
    return res.status(500).json({ ok: false, error: String(err.message) });
  }
});

// --- API: results with filters ---
app.get('/api/results', async (req, res) => {
  try {
    const q = req.query || {};
    const { where, values } = buildWhereFromQuery(q);
    const sql = `SELECT * FROM apartment_details ${where} LIMIT 500`;

    if (!pool) {
      // DB not available: apply simple JS filtering over sample rows
      let rows = SAMPLE_ROWS.slice();
      if (q.beds) rows = rows.filter(r => (r.apt_result_bed || '').startsWith(String(q.beds)));
      if (q.bath) rows = rows.filter(r => (r.apt_result_bath || '').startsWith(String(q.bath)));
      return res.json({ ok: true, source: 'sample', rows: removeNumericBedsBath(rows) });
    }

    const [rows] = await pool.query(sql, values);
    return res.json({ ok: true, source: 'db', rows: removeNumericBedsBath(rows) });
  } catch (err) {
    console.error('Query error:', err);
    return res.status(500).json({ ok: false, error: String(err.message) });
  }
});

// Fallback to index.html for SPA (or placeholder if index.html missing)
app.get('*', (req, res) => {
  const index = path.join(publicPath, 'index.html');
  res.sendFile(index, err => {
    if (err) {
      res.status(200).send(`
        <!doctype html>
        <html><head><meta charset="utf-8"><title>ApartmentApp — placeholder</title></head>
        <body style="font-family: system-ui, Arial; padding: 24px;">
          <h1>ApartmentApp — placeholder index.html</h1>
          <p>This placeholder prevents ENOENT when running server directly. Use the API endpoints below to test:</p>
          <ul>
            <li><a href="/api/test-apartments">/api/test-apartments</a></li>
            <li><a href="/api/results?beds=2&bath=1">/api/results?beds=2&bath=1</a></li>
          </ul>
        </body></html>`);
    }
  });
});

// Start
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const HOST = process.env.HOST || '127.0.0.1';

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Server started and listening on http://${HOST}:${PORT}`);
  const ifaces = os.networkInterfaces();
  const addrs = [];
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (!iface.internal && iface.family === 'IPv4') addrs.push(iface.address);
    }
  }
  console.log(`   Local: http://localhost:${PORT}`);
  if (addrs.length) console.log(`   LAN:   http://${addrs[0]}:${PORT}`);
  console.log('✅ MySQL pool ready');
});

server.on('error', err => {
  console.error('Server error:', err && err.stack ? err.stack : err);
  process.exit(1);
});