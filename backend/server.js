// ------------------------------
// server.js (Full Version)
// ------------------------------

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// ------------------------------
// Middleware setup
// ------------------------------
app.use(cors()); // Allow frontend API access (if hosted separately)
app.use(express.json()); // Parse incoming JSON requests

// ------------------------------
// API routes (optional section)
// ------------------------------
// Example: API endpoint test route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the ApartmentApp backend 🚀' });
});

// You can add your actual backend routes here
// e.g. app.use('/api/apartments', apartmentsRouter);

// ------------------------------
// Serve React frontend build
// ------------------------------

// Serve all static files from the "public" directory (React build folder)
app.use(express.static(path.join(__dirname, 'public')));

// Handle React routing, return all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ------------------------------
// Start the server
// ------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`🌍 Open http://localhost:${PORT} to view it locally`);
});
