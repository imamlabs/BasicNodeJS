// File: routes.js
const express = require('express');
const router = express.Router();
const checkSession = require('./middlewares/checkSession'); // Modul middleware
const {
  renderFormMahasiswa,
  handleTambahMahasiswa,
  handleEditMahasiswa,
  handleHapusMahasiswa,
  handleLogin,
  handleLogout,
  handlePencarian,
  handleUpdateMahasiswa,
} = require('./controllers/mahasiswaController'); // Modul controller

const {
  renderFormAdmin,
  handleTambahAdmin,
  handleEditAdmin,
  handleHapusAdmin,
  handleUpdateAdmin,
  handlePencarianAdmin,
} = require('./controllers/adminController'); // Modul controller

router.get('/', (req, res) => {
  if (req.session.loggedin) {
    res.redirect('/mahasiswa');
  } else {
    res.render("index", { title: "Login Admin" });
  }
});
/*
router.get('/mahasiswa/:halaman', checkSession, (req, res) => {
  const halaman = parseInt(req.params.halaman);
  renderFormMahasiswa(req, res, halaman);
});
*/
// Menambahkan rute untuk halaman pertama mahasiswa
/*router.get('/mahasiswa/index', checkSession, (req, res) => {
  renderFormMahasiswa(req, res, 1);
});
*/
router.get('/mahasiswa', checkSession, renderFormMahasiswa);
router.post('/tambah', handleTambahMahasiswa);
router.get('/edit/:id', handleEditMahasiswa);
router.post('/hapus/:id', handleHapusMahasiswa);
router.post('/login', handleLogin);
router.get('/logout', handleLogout);
//router.post('/cari', handlePencarian);
// File routes.js
// File routes.js


// File routes.js
router.post('/cari', (req, res) => {
  const { target } = req.body;
  if (target === 'admin') {
    handlePencarianAdmin(req, res);
  } else {
    handlePencarian(req, res);
  }
});


router.post('/update/:id', handleUpdateMahasiswa);

router.get('/admin', checkSession, renderFormAdmin);
router.post('/tambahadmin', handleTambahAdmin);
router.get('/editadmin/:id', handleEditAdmin);
router.post('/hapusadmin/:id', handleHapusAdmin);
//router.post('/cariadmin', handlePencarianAdmin);
router.post('/updateadmin/:id', handleUpdateAdmin);

module.exports = router;
