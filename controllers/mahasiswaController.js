// File: controllers/mahasiswaController.js
const db = require('../db');
 const target="mahasiswa";
const timestamp = new Date().toLocaleTimeString();
const renderFormMahasiswa = (req, res) => {
  if (req.session.loggedin) {
    const sql = "SELECT * FROM mahasiswa";
    db.query(sql, (err, result) => {
      if (err) {
        console.log(err);
        res.redirect('/');
        return;
      }
      const users = JSON.parse(JSON.stringify(result));
      console.log(target);
      console.log(timestamp);
      res.render("mahasiswa", {
        user: "",
        target: target,
        users: users,
        title: "Daftar Mahasiswa",
        username: req.session.username
      });
    });
  } else {
    res.redirect('/');
  }
};



// Handler untuk tambah data mahasiswa
const handleTambahMahasiswa = (req, res) => {
  const { nama, semester, jurusan } = req.body;
  const insertSql = `INSERT INTO mahasiswa (nama, semester, Jurusan) VALUES (?, ?, ?)`;
  db.query(insertSql, [nama, semester, jurusan], (err, result) => {
    if (err) throw err;
    res.redirect('/mahasiswa');
  });
};

// Handler untuk edit data mahasiswa
const handleEditMahasiswa = (req, res) => {
  const id = req.params.id;
  const selectSql = `SELECT * FROM mahasiswa WHERE id = ?`;
  db.query(selectSql, [id], (err, result) => {
    if (err) throw err;
    const users = JSON.parse(JSON.stringify(result));
    const user = result[0];
    res.render("mahasiswa", { user: user, target: target,users: users, title: "Edit Mahasiswa" });
  });
};

// Handler untuk hapus data mahasiswa
const handleHapusMahasiswa = (req, res) => {
  const id = req.params.id;
  const deleteSql = `DELETE FROM mahasiswa WHERE id = ?`;
  db.query(deleteSql, [id], (err, result) => {
    if (err) throw err;
    const resetAutoIncrementSql = `ALTER TABLE mahasiswa AUTO_INCREMENT = 1`;
    db.query(resetAutoIncrementSql, (err, result) => {
      if (err) throw err;
      res.redirect('/mahasiswa');
    });
  });
};

// Handler untuk proses login
const handleLogin = (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM akseslogin WHERE username = ? AND password = ?`;
  db.query(query, [username, password], (error, results) => {
    if (error) throw error;
    if (results.length > 0) {
      const username = results[0];

      if (results) {
        req.session.loggedin = true;
        req.session.username = username;
        res.redirect('/mahasiswa');
      } else {
        res.send('Username or password is incorrect');
      }

    } else {
      res.send('Username or password is incorrect');
    }
  });
};

// Handler untuk logout
const handleLogout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

// Handler untuk pencarian data mahasiswa
const handlePencarian = (req, res) => {
  const keyword = req.body.cari;
  const searchSql = `SELECT * FROM mahasiswa WHERE nama LIKE '%${keyword}%' OR semester LIKE '%${keyword}%' OR Jurusan LIKE '%${keyword}%'`;
  db.query(searchSql, (err, result) => {
    if (err) throw err;
    const searchResults = JSON.parse(JSON.stringify(result));
    const message = searchResults.length > 0 ? "" : "Pencarian tidak ditemukan";
    
    res.render("mahasiswa", {
      user: "",
      users: searchResults,
      target: target,
      title: "Daftar Mahasiswa",
      message: message,
      username: req.session.username
    });
  });
};
// Handler untuk mengupdate data mahasiswa
const handleUpdateMahasiswa = async (req, res) => {
   try {
      const id = req.params.id;
      const { npm, nama, semester, jurusan } = req.body;

      // Memperbarui data mahasiswa di database
      await updateMahasiswa(id, npm, nama, semester, jurusan);

      console.log(`Data dengan id ${id} telah diperbarui`);
      res.redirect('/mahasiswa');
   } catch (err) {
      console.error(err);
      res.status(500).send('Terjadi kesalahan saat memperbarui data mahasiswa');
   }
};

// Fungsi untuk memperbarui data mahasiswa di database
async function updateMahasiswa(id, npm, nama, semester, jurusan) {
   return new Promise((resolve, reject) => {
      const updateSql = `UPDATE mahasiswa SET npm = ?, nama = ?, semester = ?, jurusan = ? WHERE id = ?`;
      db.query(updateSql, [npm, nama, semester, jurusan, id], (err, result) => {
         if (err) {
            reject(err);
         } else {
            resolve();
         }
      });
   });
}

module.exports = {
  renderFormMahasiswa,
  handleTambahMahasiswa,
  handleEditMahasiswa,
  handleHapusMahasiswa,
  handleLogin,
  handleLogout,
  handlePencarian,
  handleUpdateMahasiswa
};
