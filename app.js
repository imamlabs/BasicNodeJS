// File: app.js
const express = require('express');
const session = require('express-session');
const db = require('./db'); // Modul koneksi database
const routes = require('./routes'); // Modul rute
const app = express();
app.use(express.urlencoded({ extended: true }));
// ...
app.set("views", "view");
//app.set("views", "view/mahasiswa");
app.set("view engine", "ejs");
// ...
//app.get('/mahasiswa', mahasiswaController.renderFormMahasiswa);
//app.get('/mahasiswa/:page', mahasiswaController.renderFormMahasiswa);
app.use(
  session({
    secret: 'secret-key',
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 300000,
      secure: false
    }
  })
);

app.use('/', routes);

db.connect((err) => {
  if (err) throw err;
  console.log("Database terhubung....");

  app.listen(8000, () => {
    console.log("Server Port 8000 ready....");
  });
});
