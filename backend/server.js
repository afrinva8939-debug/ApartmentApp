require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// API endpoint: fetch apartments with optional filters
app.get('/api/apartments', async (req, res) => {
  try {
    const { name, state, bed, bath } = req.query;
    let sql = 'SELECT * FROM apartment_details WHERE 1=1';
    const params = [];

    if (name) {
      sql += ' AND apt_result_apartment_name LIKE ?';
      params.push(`%${name}%`);
    }
    if (state) {
      sql += ' AND state LIKE ?';
      params.push(`%${state}%`);
    }
    if (bed) {
      sql += ' AND apt_result_bed LIKE ?';
      params.push(`%${bed}%`);
    }
    if (bath) {
      sql += ' AND apt_result_bath LIKE ?';
      params.push(`%${bath}%`);
    }

    sql += ' ORDER BY apt_result_available_date_formatted ASC LIMIT 100';

    const [rows] = await pool.query(sql, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
