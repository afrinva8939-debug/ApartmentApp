// backend/server.js
const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const app = express();

// Read DB config from environment variables (Railway provides these in "Variables")
const {
  MYSQLHOST,
  MYSQLPORT,
  MYSQLUSER,
  MYSQLPASSWORD,
  MYSQLDATABASE,
  PORT = 5000
} = process.env;

if (!MYSQLHOST || !MYSQLUSER || !MYSQLPASSWORD || !MYSQLDATABASE) {
  console.warn('Warning: DB env vars not fully set. /api endpoints will fail until configured.');
}

// Helper: create a connection and return it
async function getConn() {
  if (!MYSQLHOST) throw new Error('Missing MYSQLHOST env var');
  return mysql.createConnection({
    host: MYSQLHOST,
    port: MYSQLPORT ? Number(MYSQLPORT) : 3306,
    user: MYSQLUSER,
    password: MYSQLPASSWORD,
    database: MYSQLDATABASE,
  });
}

// A small test route to verify the server and DB connection
app.get('/api/test-apartments', async (req, res) => {
  try {
    // Quick DB test: return single row count if DB configured
    const conn = await getConn();
    const [rows] = await conn.execute('SELECT 1 AS ok');
    await conn.end();
    return res.json({ ok: true, sample: rows[0] });
  } catch (err) {
    // If DB missing, still return a helpful json (so you can test network)
    return res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

/*
  /api/results
  Query params (example):
    /api/results?bath=1&beds=2&limit=50
  This example uses parameterized queries to avoid injection.
  You must adapt the SQL column names and filters to match your `apartment_details` table.
*/
app.get('/api/results', async (req, res) => {
  try {
    // Parse & sanitize incoming query params
    const bath = req.query.bath ? Number(req.query.bath) : null;
    const beds = req.query.beds ? Number(req.query.beds) : null;
    const limit = req.query.limit ? Math.min(200, Math.max(1, Number(req.query.limit) || 50)) : 50;

    // Basic validation
    const filters = [];
    const params = [];

    if (bath !== null && !Number.isNaN(bath)) {
      filters.push('bath = ?');
      params.push(bath);
    }
    if (beds !== null && !Number.isNaN(beds)) {
      filters.push('beds = ?');
      params.push(beds);
    }

    // Basic SQL — change column names to match your DB!
    // Example assumes columns `bath`, `beds`, `apt_result_apartment_name`, etc.
    let sql = 'SELECT id, refid, apt_result_apartment_name, apt_result_address, beds, bath FROM apartment_details';
    if (filters.length) sql += ' WHERE ' + filters.join(' AND ');
    sql += ' ORDER BY id LIMIT ?';
    params.push(limit);

    const conn = await getConn();
    const [rows] = await conn.execute(sql, params);
    await conn.end();

    return res.json({ ok: true, count: rows.length, results: rows });
  } catch (err) {
    console.error('API /api/results error:', err);
    return res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

// ---- Serve static frontend ----
// When you build your React app, copy the build into backend/public (see notes below).
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// Fallback to index.html so SPA client-side routing works.
// Any GET request that didn't hit /api/* will return index.html
app.get('*', (req, res) => {
  // If the path begins with /api, return 404 (should be handled above).
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ ok: false, error: 'API route not found' });
  }

  res.sendFile(path.join(publicDir, 'index.html'), (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Server error');
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} — publicDir=${publicDir}`);
});
