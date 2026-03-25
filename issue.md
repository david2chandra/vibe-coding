# Task: Implementasi Fitur Login User dan Session Management

**Deskripsi Tugas:**
Tugas ini bertujuan untuk mengimplementasikan fitur API Login pengguna (berdasarkan spesifikasi endpoint yang diberikan), di mana sistem akan memvalidasi kredensial pengguna dan menghasilkan UUID token sebagai penanda sesi pengguna yang berhasil login. 

---

## 1. Perubahan Skema Database

Buat tabel baru dengan nama `sessions` dengan struktur kolom berikut:

**Tabel: `sessions`**
- `id`: `integer auto increment` (Primary Key)
- `token`: `varchar(255) not null` (Akan diisi dengan UUID unik untuk menandai sesi / token user yang login)
- `user_id`: `integer` (Foreign Key merujuk ke tabel `users`)
- `created_at`: `timestamp default current_timestamp`
- `updated_at`: `timestamp default current_timestamp on update current_timestamp`

---

## 2. Spesifikasi API

**Endpoint:** `POST /api/users/login`

**Request Body (JSON):**
```json
{
  "email": "eko@localhost",
  "password": "[PASSWORD]"
}
```

**Response Success (HTTP Status: 200 OK):**
```json
{
  "data": "token"
}
```

**Response Error (HTTP Status: 400/401):**
```json
{
  "error": "Email atau password salah"
}
```

---

## 3. Struktur Direktori dan File

Penempatan file kode harus mengikuti arsitektur yang sudah ada:

- **`src/routes/`**: Berisi deklarasi routing / controller menggunakan framework Elysia.
  - File: `users-route.ts` (Buat atau modifikasi file ini)
- **`src/services/`**: Berisi komponen logika bisnis aplikasi (business logic).
  - File: `users-service.ts` (Buat atau modifikasi file ini)

---

## 4. Tahapan Implementasi (Untuk Programmer / AI)

Ikuti langkah-langkah di bawah ini secara terurut untuk menyelesaikan implementasi fitur:

### Langkah 1: Persiapan Database (Migrasi)
1. Buat file script migrasi database untuk membuat tabel `sessions`.
2. Pastikan tabel memiliki relasi *Foreign Key* pada `user_id` yang terhubung ke kolom referensi pada tabel `users`.
3. Jalankan migrasi ke database internal/lokal.

### Langkah 2: Pembuatan Logic di Service (`src/services/users-service.ts`)
1. Buat dan export fungsi `login(request)` yang menerima parameter `email` dan `password`.
2. Lakukan pencarian user berdasarkan `email` di dalam tabel `users`.
3. Validasi *Password*:
   - Jika user tidak ditemukan, lempar/throw error `"Email atau password salah"`.
   - Jika user ditemukan, ekstrak hashed password dari database dan bandingkan dengan `password` plain-text yang dikirim dengan menggunakan library perbandingan password (misalnya `bcrypt.compare` atau library kriptografi bawaan Bun).
   - Jika password tidak cocok, lempar/throw error `"Email atau password salah"`.
4. Generate UUID Token:
   - Jika login valid, buat token acak menggunakan standar UUID (misalnya, via `crypto.randomUUID()`).
   - Simpan informasi `token` dan `user_id` secara permanen menggunakan insert query ke tabel `sessions`.
5. Return string / objek data token tersebut.

### Langkah 3: Pembuatan Endpoint Route (`src/routes/users-route.ts`)
1. Import framework Elysia dan buka deklarasi API.
2. Daftarkan endpoint `POST /api/users/login`.
3. Gunakan validator *Request Body* (TypeBox dari `@sinclair/typebox` / validator bawaan Elysia) untuk memastikan bahwa field `email` (format string/email) dan `password` (format string) wajib diisi.
4. Di dalam resolver (handler) endpoint, panggil fungsi `login` dari `users-service.ts` dan teruskan request body-nya.
5. Susun response sukses menggunakan format JSON `{ "data": "<nilai_token>" }`.
6. Pastikan penanganan *throw Error* dari service bisa membuahkan bentuk HTTP Response error sesuai ekspektasi JSON ini: `{ "error": "Email atau password salah" }`.

### Langkah 4: Registrasi App Utama (`src/index.ts`)
1. Buka file utama di `src/index.ts`.
2. Import module `users-route.ts` yang telah dikonfigurasi.
3. Sematkan atau pasang (misalnya memanggil dengan metode `.use()`) *users route* tersebut ke instance utama Elysia, sehingga rute `/api/users/login` siap dilayani di HTTP server.

### Langkah 5: Pengujian
1. Jalankan aplikasi (server Elysia).
2. Lakukan pengujian manual menggunakan utilitas seperti Postman / cURL.
3. Tes sukses: berhasil login dengan user yang valid dan memastikan token UUID tersimpan di tabel `sessions`.
4. Tes gagal: menggunakan password/email yang tidak sesuai dan memastikan error JSON ter-render dengan tepat sesuai spesifikasi nomor 2.
