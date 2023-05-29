const express = require('express');
const mysql = require('mysql');
const session = require('express-session');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));

// Konfigurasi session
app.use(
  session({
    secret: 'secret-key',
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 300000, // 5 menit dalam milidetik
      secure: false // Setel ke true jika menggunakan HTTPS
    }
  })
);

// Middleware untuk mengecek aktivitas sesi
const checkSession = (req, res, next) => {
  if (req.session.lastActivity && Date.now() - req.session.lastActivity > 300000) {
    req.session.destroy(); // Hapus sesi jika tidak ada aktivitas selama 5 menit
    res.redirect('/'); // Ganti dengan halaman logout atau halaman login jika diinginkan
  } else {
    req.session.lastActivity = Date.now(); // Perbarui waktu aktivitas terakhir
    next();
  }
};

// Konfigurasi database
const db = mysql.createConnection({
  host: "localhost",
  database: "sekolah",
  user: "root",
  password: ""
});

// Koneksi database
db.connect((err) => {
  if (err) throw err;
  console.log("Database terhubung....");
});

// Setel template engine
app.set("views", "view");
app.set("view engine", "ejs");

// Menampilkan halaman form mahasiswa
app.get("/formmahasiswa", checkSession, (req, res) => {
  if (req.session.loggedin) {
    const sql = "SELECT * FROM user";
    db.query(sql, (err, result) => {
      if (err) throw err;
      const users = JSON.parse(JSON.stringify(result));
      console.log('hasil database =>', users);
      res.render("formmahasiswa", {
        user: "",
        users: users,
        title: "Daftar Mahasiswa",
        username: req.session.username
      });
    });
  } else {
    res.redirect('/');
  }
});

// Menampilkan halaman login
app.get("/", (req, res) => {
  if (req.session.loggedin) {
    res.redirect('/formmahasiswa');
  } else {
    res.render("index", { title: "Login Admin" });
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Proses login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM akseslogin WHERE username = ? AND password = ?`;
  db.query(query, [username, password], (error, results) => {
    if (error) throw error;
    if (results.length > 0) {
      const username = results[0];

      if (results) {
        req.session.loggedin = true;
        req.session.username = username;
        res.redirect('/formmahasiswa');
      } else {
        res.send('Username or password is incorrect');
      }

    } else {
      res.send('Username or password is incorrect');
    }
  });
});

// Menambahkan data mahasiswa
app.post("/tambah", (req, res) => {
  const { nama, semester, jurusan } = req.body;
  const insertSql = `INSERT INTO user (nama, semester, Jurusan) VALUES (?, ?, ?)`;
  db.query(insertSql, [nama, semester, jurusan], (err, result) => {
    if (err) throw err;
    res.redirect("/formmahasiswa");
  });
});

// Menampilkan halaman edit mahasiswa
app.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  const selectSql = `SELECT * FROM user WHERE id = ?`;
  db.query(selectSql, [id], (err, result) => {
    if (err) throw err;
    const users = JSON.parse(JSON.stringify(result));
    const user = result[0]; // Ambil data user pertama dari hasil query
    res.render("formmahasiswa", { user: user, users: users, title: "Edit Mahasiswa" });
  });
});

// Menghapus data mahasiswa
app.post("/hapus/:id", (req, res) => {
  const id = req.params.id;
  const deleteSql = `DELETE FROM user WHERE id = ?`;
  db.query(deleteSql, [id], (err, result) => {
    if (err) throw err;
    // Mengatur ulang AUTO_INCREMENT ke nilai maksimum dari kolom id yang ada saat ini
    const resetAutoIncrementSql = `ALTER TABLE user AUTO_INCREMENT = 1`;
    db.query(resetAutoIncrementSql, (err, result) => {
      if (err) throw err;
      res.redirect("/formmahasiswa");
    });
  });
});

// Melakukan pencarian data mahasiswa
app.post('/cari', (req, res) => {
  const keyword = req.body.cari; // Mengambil kata kunci dari input teks dengan atribut "name" = "cari"

  // Lakukan operasi pencarian ke database menggunakan keyword
  const searchSql = `SELECT * FROM user WHERE nama LIKE '%${keyword}%' OR semester LIKE '%${keyword}%' OR Jurusan LIKE '%${keyword}%'`;
  db.query(searchSql, (err, result) => {
    if (err) throw err;
    const searchResults = JSON.parse(JSON.stringify(result));
    const message = searchResults.length > 0 ? "" : "Pencarian tidak ditemukan";

    res.render("formmahasiswa", {
      user: "",
      users: searchResults,
      title: "Daftar Mahasiswa",
      message: message,
      username: req.session.username
    });
  });
});
// Handler untuk mengupdate data mahasiswa
app.post("/update/:id", async (req, res) => {
   try {
      const id = req.params.id;
      const { nama, semester, jurusan } = req.body;

      // Memperbarui data mahasiswa di database
      await updateMahasiswa(id, nama, semester, jurusan);

      console.log(`Data dengan id ${id} telah diperbarui`);
      res.redirect("/formmahasiswa");
   } catch (err) {
      console.error(err);
      res.status(500).send('Terjadi kesalahan saat memperbarui data mahasiswa');
   }
});

// Fungsi untuk memperbarui data mahasiswa di database
async function updateMahasiswa(id, nama, semester, jurusan) {
   return new Promise((resolve, reject) => {
      const updateSql = `UPDATE user SET nama = ?, semester = ?, jurusan = ? WHERE id = ?`;
      db.query(updateSql, [nama, semester, jurusan, id], (err, result) => {
         if (err) {
            reject(err);
         } else {
            resolve();
         }
      });
   });
}


// Menjalankan server
app.listen(8000, () => {
  console.log("Server ready ....");
});
