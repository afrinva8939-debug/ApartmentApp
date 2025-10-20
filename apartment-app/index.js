require('dotenv').config();

const express = require("express");
const app = express();
const connection = require("./db");

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.get('/', (req, res) => {
  connection.query(`
    SELECT
      apt_result_apartment_name,
      apt_result_address,
      apt_result_min_rent,
      apt_result_max_rent,
      apt_result_sqft,
      apt_result_bed,
      apt_result_bath,
      state,
      beds,
      bath
    FROM apartment_details
    LIMIT 100
  `, (error, results) => {
    if (error) {
      res.status(500).send('DB Error!');
    } else {
      res.render('index', { apartments: results });
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
