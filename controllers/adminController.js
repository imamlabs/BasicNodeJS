// File: controllers/mahasiswaController.js
const db = require('../db');
const target="admin";

const timestamp = new Date().toLocaleTimeString();
const renderFormAdmin = (req, res) => {
  if (req.session.loggedin) {
    const sql = "SELECT * FROM akseslogin";
    db.query(sql, (err, result) => {
      if (err) {
        console.log(err);
        res.redirect('/');
        return;
      }
      const usersadmin = JSON.parse(JSON.stringify(result));
      
      console.log(target);
      console.log(timestamp);
      res.render("admin", {
        user: "",
        target: target,
        usersadmin: usersadmin,
        title: "Daftar Admin",
        username: req.session.username
      });
      
    });
  } else {
    res.redirect('/');
  }
};



// Handler untuk tambah data admin
const handleTambahAdmin = (req, res) => {
  const { username, password } = req.body;
  const insertSql = `INSERT INTO akseslogin (username,password) VALUES (?, ?)`;
  db.query(insertSql, [username, password], (err, result) => {
    if (err) throw err;
    res.redirect('/admin');
  });
};

// Handler untuk edit data admin
const handleEditAdmin = (req, res) => {
  const id = req.params.id;
  const selectSql = `SELECT * FROM akseslogin WHERE id = ?`;
  db.query(selectSql, [id], (err, result) => {
    if (err) throw err;
    const usersadmin = JSON.parse(JSON.stringify(result));
    const user = result[0];
    res.render("admin", { user: user, target: target,usersadmin: usersadmin, title: "Edit Admin" });
  });
};

// Handler untuk hapus data admin
const handleHapusAdmin = (req, res) => {
  const id = req.params.id;
  const deleteSql = `DELETE FROM akseslogin WHERE id = ?`;
  db.query(deleteSql, [id], (err, result) => {
    if (err) throw err;
    const resetAutoIncrementSql = `ALTER TABLE akseslogin AUTO_INCREMENT = 1`;
    db.query(resetAutoIncrementSql, (err, result) => {
      if (err) throw err;
      res.redirect('/admin');
    });
  });
};



// Handler untuk pencarian data admin
const handlePencarianAdmin = (req, res) => {
  const keyword = req.body.cari;
  const searchSqlAdmin = `SELECT * FROM akseslogin WHERE username LIKE '%${keyword}%'`;
  db.query(searchSqlAdmin, (err, result) => {
    if (err) throw err;
    const searchResults = JSON.parse(JSON.stringify(result));
    const message = searchResults.length > 0 ? "" : "Pencarian tidak ditemukan";
    res.render("admin", {
      user: "",
      target: target,
      usersadmin: searchResults, 
      title: "Daftar Admin",
      message: message,
      username: req.session.username
    });
  });
};
// Handler untuk mengupdate data admin
const handleUpdateAdmin = async (req, res) => {
   try {
      const id = req.params.id;
      const { username, password } = req.body;

      // Memperbarui data admin di database
      await updateAdmin(id, username, password);

      console.log(`Data dengan id ${id} telah diperbarui`);
      res.redirect('/admin');
   } catch (err) {
      console.error(err);
      res.status(500).send('Terjadi kesalahan saat memperbarui data mahasiswa');
   }
};

// Fungsi untuk memperbarui data admin di database
async function updateAdmin(id, username, password) {
   return new Promise((resolve, reject) => {
      const updateSql = `UPDATE akseslogin SET username = ?, password = ? WHERE id = ?`;
      db.query(updateSql, [username, password,id], (err, result) => {
         if (err) {
            reject(err);
         } else {
            resolve();
         }
      });
   });
}

module.exports = {
  renderFormAdmin,
  handleTambahAdmin,
  handleEditAdmin,
  handleHapusAdmin,
  handlePencarianAdmin,
  handleUpdateAdmin
};
