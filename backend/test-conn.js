// backend/test-conn.js
const mysql = require('mysql2/promise');
const { URL } = require('url');

(async () => {
  try {
    // Paste the MYSQL_PUBLIC_URL you copied here (keep secret!)
    const connUrl = 'mysql://root:WNdaIcgRHGzrupqYkozaAXUvTbxwlEps@metro.proxy.rlwy.net:57451/railway';

    const u = new URL(connUrl);
    const conn = await mysql.createConnection({
      host: u.hostname,
      port: u.port || 3306,
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.replace(/^\//, '')
    });

    console.log('✅ Connected successfully!');
    await conn.end();
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    if (err.code) console.error('Error code:', err.code);
  }
})();
