const mysql = require("mysql2");
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,      // Set as Railway/Local env vars
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB
});
connection.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL");
  }
});
module.exports = connection;
