// server.js — FINAL VERSION
// Run with: node server.js  (or npx nodemon server.js)
// Requires: npm i express mysql2 dotenv cors

const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PUBLIC_DIR = path.join(__dirname, 'public');
app.use(express.static(PUBLIC_DIR));

let pool;

// === Initialize MySQL connection ===
async function initDb() {
  const cfg = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'apartments',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };

  try {
    pool = mysql.createPool(cfg);
    await pool.query('SELECT 1');
    console.log('✅ MySQL pool ready');
  } catch (err) {
    console.error('❌ DB connection failed:', err.message);
    pool = null;
  }
}

initDb();

// === Allowed filter mapping ===
const allowedFilters = {
  beds: 'apt_result_bed',
  bath: 'apt_result_bath',
  refid: 'refid',
  group_name: 'group_name',
};

// === Helper to build WHERE clause ===
function buildWhereFromQuery(q) {
  const clauses = [];
  const values = [];

  for (const [param, column] of Object.entries(allowedFilters)) {
    const val = q[param];
    if (!val) continue;

    // Extract numeric values inside DB (since stored as "2 Bed", "1 Bath")
    if (param === 'beds' || param === 'bath') {
      clauses.push(`CAST(SUBSTRING_INDEX(${column}, ' ', 1) AS UNSIGNED) = ?`);
      values.push(Number(val));
    } else {
      clauses.push(`${column} = ?`);
      values.push(val);
    }
  }

  const where = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
  return { where, values };
}

// === Test endpoint ===
app.get('/api/test-apartments', async (req, res) => {
  try {
    if (!pool) return res.json({ ok: true, source: 'sample', rows: [] });
    const [rows] = await pool.query(
      `SELECT id, refid, apt_result_apartment_name, apt_result_address, apt_result_bed, apt_result_bath
       FROM apartment_details
       LIMIT 500`
    );
    res.json({ ok: true, source: 'db', rows });
  } catch (err) {
    console.error('DB error:', err.message);
    res.json({ ok: false, error: err.message });
  }
});

// === Results endpoint ===
app.get('/api/results', async (req, res) => {
  try {
    if (!pool) return res.json({ ok: false, error: 'No DB connection' });

    const { where, values } = buildWhereFromQuery(req.query);
    const sql = `SELECT * FROM apartment_details ${where} LIMIT 500`;

    const [rows] = await pool.query(sql, values);
    res.json({ ok: true, source: 'db', rows });
  } catch (err) {
    console.error('Query error:', err.message);
    res.json({ ok: false, error: err.message });
  }
});

// === Default route for index.html ===
app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'), (err) => {
    if (err) {
      res.send(`<html><body>
        <h1>ApartmentApp — Placeholder index.html</h1>
        <p>Server running successfully.</p>
        <ul>
          <li><a href="/api/test-apartments">/api/test-apartments</a></li>
          <li><a href="/api/results?beds=2&bath=1">/api/results?beds=2&bath=1</a></li>
        </ul>
      </body></html>`);
    }
  });
});

// === Start Server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started and listening on http://localhost:${PORT}`);
});
