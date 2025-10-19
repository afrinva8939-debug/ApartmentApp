// backend/server.js
// Express server that serves the frontend build and provides API routes.
// Requires: express, mysql2, dotenv, cors, path

const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
// Only enable CORS if you expect cross-origin requests (e.g., dev split).
// In production, if React build is served by this server, CORS not required.
app.use(cors());

// Create a mysql pool using environment variables.
// Set these env vars in Railway or .env (do NOT commit .env to git).
const DB_HOST = process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.MYSQL_PORT || 3306;
const DB_USER = process.env.MYSQL_USER || process.env.MYSQL_USERNAME || 'root';
const DB_PASSWORD = process.env.MYSQL_PASSWORD || process.env.MYSQL_ROOT_PASSWORD || '';
const DB_NAME = process.env.MYSQL_DATABASE || process.env.DB_NAME || 'railway';

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

// --- Simple test endpoint to verify server is reachable ---
app.get('/api/test-apartments', (req, res) => {
  const sample = [
    { id: 1, title: 'Nice studio', beds: 1, baths: 1, price: 450 },
    { id: 2, title: '2BR downtown', beds: 2, baths: 1, price: 850 },
  ];
  res.json(sample);
});

// --- Real results endpoint (example). Adjust SQL to your schema. ---
app.get('/api/results', async (req, res) => {
  // Example query parameters: ?bath=1&beds=2
  const { bath, beds, limit = 50 } = req.query;

  try {
    // Build a simple query with optional filters. Use parameterized queries to avoid injection.
    let sql = 'SELECT id, title, beds, baths, price FROM apartments';
    const where = [];
    const params = [];

    if (bath !== undefined) {
      where.push('baths = ?');
      params.push(Number(bath));
    }
    if (beds !== undefined) {
      where.push('beds = ?');
      params.push(Number(beds));
    }

    if (where.length) {
      sql += ' WHERE ' + where.join(' AND ');
    }

    sql += ' ORDER BY id DESC LIMIT ?';
    params.push(Number(limit));

    const [rows] = await pool.query(sql, params);
    res.json(Array.isArray(rows) ? rows : []);
  } catch (err) {
    console.error('Error in /api/results:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// --- Serve static frontend (React build) ---
// Ensure you put your React build output in backend/public (or change this path).
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Fallback to index.html for client-side routing (React Router)
app.get('*', (req, res) => {
  // If request is for an API endpoint, return 404 instead of index.html
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(publicPath, 'index.html'), (err) => {
    if (err) {
      console.error('Error sending index.html', err);
      res.status(500).send('Server error');
    }
  });
});

// Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
  console.log(`  NODE env: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  DB host: ${DB_HOST}:${DB_PORT} DB name: ${DB_NAME}`);
});
