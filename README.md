# Vibe Coding Project - Elysia API

Aplikasi ini RESTful API backend yang dibangun dengan performa tinggi menggunakan ekosistem **Bun** berjalan di atas framework **Elysia.js**. Proyek ini ditujukan untuk mengelola autentikasi pengguna (Registrasi, Login, Manajemen Sesi, Logout) dengan keamanan penyimpanan token sesi di dalam basis data.

---

## 🎯 Fitur Utama (API Endpoints)
Aplikasi memaparkan 4 endpoint API utama:
1. **Daftar Pengguna Baru**
   - `POST /api/users`
   - _Body_: `{ "name": "...", "email": "...", "password": "..." }`
2. **Login Pengguna**
   - `POST /api/users/login`
   - _Body_: `{ "email": "...", "password": "..." }`
   - _Response_: UUID Session Token.
3. **Mendapatkan Profil Saat Ini (Protected)**
   - `GET /api/users/current`
   - _Header_: `Authorization: Bearer <token>`
   - _Response_: Mengembalikan data profil user berdasarkan token aktif.
4. **Logout Keluar Sesi (Protected)**
   - `DELETE /api/users/logout`
   - _Header_: `Authorization: Bearer <token>`
   - _Response_: Menghapus token fisik sesi dari Database.

---

## 🛠️ Technology Stack & Libraries
*   **Runtime Asynchronous**: [Bun](https://bun.sh/)
*   **Web Framework**: [Elysia.js](https://elysiajs.com/) (Extremely fast, TypeScript native)
*   **Database ORM**: [Drizzle ORM](https://orm.drizzle.team/)
*   **Database Driver**: `mysql2`
*   **Password Hashing**: Native `Bun.password` (Bcrypt)
*   **Test Runner**: Native `bun test`

---

## 🗃️ Arsitektur & Struktur Direktori

Kode aplikasi menggunakan pola pemisahan arsitektur (*Layered Architecture*) modular agar mudah dikembangkan (*maintainable*).

```
📂 vibe-coding
 ┣ 📂 src                    -> Akar kode utama
 ┃  ┣ 📂 db                  -> Konfigurasi database instansi Drizzle ORM
 ┃  ┃  ┣ 📄 index.ts         -> Koneksi MySQL client
 ┃  ┃  ┗ 📄 schema.ts        -> Definisi skema tabel (drizzle)
 ┃  ┣ 📂 routes              -> Definisi Framework Elysia Endpoints & Schema Validation (TypeBox)
 ┃  ┃  ┗ 📄 users-route.ts   -> Router kumpulan API Pengguna & Middleware Error Handling
 ┃  ┣ 📂 services            -> Domain Logic / Business Logic
 ┃  ┃  ┗ 📄 users-service.ts -> Logika manipulasi Drizzle CRUD, Validasi Email, Hashing
 ┃  ┣ 📄 app.ts              -> Deklarasi instansi aplikasi Elysia (terpisah untuk testing)
 ┃  ┗ 📄 index.ts            -> Titik masuk (*Entry Point*), Menjalankan Server (.listen)
 ┣ 📂 tests                  -> Koleksi skenario pengujian unit (Unit Test)
 ┃  ┣ 📄 users.test.ts       -> Integrasi kasus pengujian RESTful per route API.
 ┃  ┗ 📄 utils.ts            -> Helper Test (Contoh: Reset/Wipe database hook)
 ┣ 📄 drizzle.config.ts      -> Metadata sistem kit migrasi Drizzle
 ┣ 📄 docker-compose.yml     -> Blueprint Database Container lokal MySQL
 ┗ 📄 package.json           -> Daftar *Dependency* dan *Scripts* eksekusi project.
```

---

## 🗄️ Database Schema Representation

Platform ini sangat berpegang pada Relational Database. Terdapat 2 rancangan struktur tabel utama di dalamnya:

1. Tabel **`users`**
   - `id` (Serial/Auto-Increment, Primary Key)
   - `name` (Varchar 255)
   - `email` (Varchar 255, Unique)
   - `password` (Varchar 255, Hashed)
   - `createdAt` & `updatedAt` (Timestamp)
2. Tabel **`sessions`**
   - `id` (Serial/Auto-Increment, Primary Key)
   - `token` (Varchar 255, menampung UUID sesi)
   - `user_id` (BigInt, **Foreign Key** Constraint menuju `users.id`)
   - `createdAt` & `updatedAt` (Timestamp)

---

## 🚀 Panduan Setup & Run Project

1. **Prasyarat**:
   - Install [Bun](https://bun.sh/) di ekosistem Anda.
   - Install [Docker](https://www.docker.com/) (Jika ingin menggunakan DB Lokal Kontainer).
2. **Kloning Repositori**:
   ```bash
   git clone <repo_url>
   cd vibe-coding
   ```
3. **Install Dependencies**:
   ```bash
   bun install
   ```
4. **Siapkan Konfigurasi Lingkungan Tertutup (.env)**:
   Salin file referensi env (atau buat sendiri file `.env`)
   ```bash
   DATABASE_URL="mysql://root:root@localhost:3306/vibe_coding"
   ```
5. **Nyalakan Layanan Database** *(Lewati jika Anda menggunakan database cloud/PaaS eksternal)*:
   ```bash
   docker-compose up -d
   ```
6. **Migrasi / Inisialisasi Database Table** (Melalui Drizzle Kit):
   ```bash
   bun run db:push
   ```
7. **Jalankan Aplikasi Mode Pengembangan** (Hot-Reloading):
   ```bash
   bun run dev
   ```
8. *Server Anda sekarang responsif di **`http://localhost:3000`***
9. *Akses dokumentasi interaktif (Swagger) di **`http://localhost:3000/swagger`***

---

## 🧪 Cara Test Aplikasi

Sistem memanfaatkan *test-runner* bawaan engine eksekusi Bun yang sangat cepat. Rangkaian *test* akan meluncurkan server dalam mode isolasi memori dan akan senantiasa mengosongkan *database* pada setiap kaitan skenarionya demi menjamin validitas pengujian di titik 0.

Luncurkan *command* berikut:
```bash
bun test
```
*Pastikan database MySQL hidup karena Integration Test sangat membutuhkan konektivitas aktual Drizzle ke mesin database untuk mengetes keberhasilan input/hapus sesi secara fisik.*
