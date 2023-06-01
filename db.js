// File: db.js
const mysql = require('mysql');

const db = mysql.createConnection({
  host: "localhost",
  database: "sekolah",
  user: "root",
  password: ""
});

module.exports = db;
