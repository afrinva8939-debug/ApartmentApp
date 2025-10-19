// backend/server.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(express.json());
// If you run frontend on a different origin, enable CORS for it; otherwise you can rely on create-react-app proxy.
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || true }));

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'apartments',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Helper: build SQL + params for filters
function buildFilterQuery(filters) {
  const where = [];
  const params = [];

  if (filters.name) {
    // search in apartment name OR address
    where.push('(apt_result_apartment_name LIKE ? OR apt_result_address LIKE ?)');
    const v = `%${filters.name}%`;
    params.push(v, v);
  }

  if (filters.state) {
    where.push('state = ?');
    params.push(filters.state);
  }

  if (filters.bed) {
    // beds stored like "1 Bed" or "2 Bed", accept numeric input "2"
    // We'll match rows where apt_result_bed starts with the number
    where.push('apt_result_bed LIKE ?');
    params.push(`${filters.bed}%`);
  }

  if (filters.bath) {
    where.push('apt_result_bath LIKE ?');
    params.push(`${filters.bath}%`);
  }

  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const sql = `SELECT id, refid, apt_result_apartment_name, apt_result_address, apt_result_unit_number,
                      apt_result_available_date, apt_result_floorplan, apt_result_min_rent, apt_result_max_rent,
                      apt_result_sqft, apt_result_bed, apt_result_bath, state
               FROM apartment_details
               ${whereSql}
               ORDER BY apt_result_available_date ASC
               LIMIT 500`; // safe limit
  return { sql, params };
}

// GET /api/apartments?name=...&state=...&bed=2&bath=1
app.get('/api/apartments', async (req, res) => {
  try {
    const filters = {
      name: req.query.name ? String(req.query.name).trim() : '',
      state: req.query.state ? String(req.query.state).trim().toUpperCase() : '',
      bed: req.query.bed ? String(req.query.bed).trim() : '',
      bath: req.query.bath ? String(req.query.bath).trim() : '',
    };

    const { sql, params } = buildFilterQuery(filters);
    const [rows] = await pool.execute(sql, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error('API error', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// basic health
app.get('/api/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`✅ Server running on http://localhost:${port}`));
