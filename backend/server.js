// server.js (drop into backend/)
require('dotenv').config();
const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- Sample fallback data (used if DB not available) ---
const SAMPLE_ROWS = [
  // Minimal example objects; add fields your front-end expects
  { id: 1, refid: 'REF1001', apt_result_apartment_name: 'Sample Apartments', apt_result_address: '123 Example St', apt_result_bed: '2 Bed', apt_result_bath: '2 Bath' },
  { id: 2, refid: 'REF1002', apt_result_apartment_name: 'Sample Towers', apt_result_address: '456 Demo Ave', apt_result_bed: '1 Bed', apt_result_bath: '1 Bath' }
];

// --- DB pool init ---
let pool = null;
async function makePoolFromEnv() {
  const cfg = {
    host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : (process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306),
    user: process.env.DB_USER || process.env.MYSQL_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'apartments',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
  pool = mysql.createPool(cfg);
  // test connection once
  try {
    await pool.query('SELECT 1');
    console.log('✅ MySQL pool ready');
  } catch (err) {
    console.warn('⚠️ Cannot connect to MySQL (will use sample data):', err.message);
    pool = null;
  }
}
makePoolFromEnv().catch(err => {
  console.warn('makePoolFromEnv err', err);
  pool = null;
});

// === Helpers: whitelist allowed filters and map query param -> DB column ===
// If your DB column names differ from the query params, change the map below.
const allowedFilters = {
  // queryParam : columnNameInDB
  bath: 'apt_result_bath',   // /api/results?bath=1  -> column apt_result_bath
  beds: 'apt_result_bed',    // /api/results?beds=2  -> column apt_result_bed
  refid: 'refid',
  group_name: 'group_name',
  // add more mappings if your DB has different column names
};

// Build WHERE clause and values array safely
function buildWhereFromQuery(q) {
  const clauses = [];
  const values = [];
  for (const [param, column] of Object.entries(allowedFilters)) {
    if (q[param] !== undefined && q[param] !== '') {
      // we treat values as strings; if you have numeric fields you can coerce as needed
      clauses.push(`${column} = ?`);
      values.push(q[param]);
    }
  }
  const where = clauses.length ? ('WHERE ' + clauses.join(' AND ')) : '';
  return { where, values };
}

// --- API: test route ---
app.get('/api/test-apartments', async (req, res) => {
  if (!pool) {
    return res.json({ ok: true, source: 'sample', rows: SAMPLE_ROWS });
  }
  try {
    const [rows] = await pool.query('SELECT id, refid, apt_result_apartment_name, apt_result_address, apt_result_bed, apt_result_bath FROM apartment_details LIMIT 500');
    return res.json({ ok: true, source: 'db', rows });
  } catch (err) {
    console.error('DB test query error:', err.message);
    return res.json({ ok: false, source: 'db', error: err.message });
  }
});

// --- API: results route (query filters) ---
// Example: /api/results?bath=1&beds=2
app.get('/api/results', async (req, res) => {
  // Build WHERE clause from allowed query params
  const { where, values } = buildWhereFromQuery(req.query);

  // Build SQL (select columns you need)
  const sql = `SELECT * FROM apartment_details ${where} LIMIT 500`;

  if (!pool) {
    // no DB: return filtered sample rows (apply a very simple filter to mimic behavior)
    const filtered = SAMPLE_ROWS.filter(r => {
      for (const [param, col] of Object.entries(allowedFilters)) {
        if (req.query[param] !== undefined && req.query[param] !== '') {
          // compare as string (simple)
          if (String((r[col] !== undefined ? r[col] : r[param] || '')).indexOf(String(req.query[param])) === -1) {
            return false;
          }
        }
      }
      return true;
    });
    return res.json({ ok: true, source: 'sample', rows: filtered });
  }

  try {
    const [rows] = await pool.query(sql, values);
    return res.json({ ok: true, source: 'db', rows });
  } catch (err) {
    console.error('Query error:', err);
    return res.json({ ok: false, error: err.message });
  }
});

// --- Serve frontend static build / public folder ---
const PUB = path.join(__dirname, 'public');
app.use(express.static(PUB));
// fallback for client-side routing: send index.html for unknown non-API requests
app.get('*', (req, res) => {
  // if the request begins with /api, return 404
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ ok: false, error: 'Not found' });
  }
  // otherwise serve client
  const indexFile = path.join(PUB, 'index.html');
  res.sendFile(indexFile, err => {
    if (err) {
      // if index.html missing, send a minimal placeholder
      res
        .status(200)
        .send(`<html><body><h1>ApartmentApp — placeholder index.html</h1>
          <p>This is a minimal placeholder so the server won't throw ENOENT.</p>
          <p>To test the API visit: <ul>
            <li><a href="/api/test-apartments">/api/test-apartments</a></li>
            <li><a href="/api/results?bath=1&beds=2">/api/results?bath=1&beds=2</a></li>
          </ul></p></body></html>`);
    }
  });
});

// --- Start server ---
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started and listening on http://localhost:${PORT}`);
});
