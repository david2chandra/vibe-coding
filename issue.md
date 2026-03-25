# Task: Implementasi Fitur Get Current User

**Deskripsi Tugas:**
Tugas ini bertujuan untuk mengimplementasikan fungsionalitas pengambilan data pengguna (Get Current User) untuk sesi yang sedang aktif. Autentikasi dilakukan dengan memvalidasi Bearer Token melalui header HTTP request.

---

## 1. Spesifikasi API

**Endpoint:** `GET /api/users/current`

**Headers:**
- `Authorization: Bearer <token>`
*(Keterangan: `<token>` adalah UUID token yang diterima user saat login dan merujuk ke token yang tersimpan di dalam database)*

**Request Body:**
*(Kosong untuk HTTP GET)*

**Response Success (HTTP Status: 200 OK):**
```json
{
  "data": {
    "id": 1,
    "name": "eko",
    "email": "eko@localhost",
    "created_at": "timestamp"
  }
}
```

**Response Error (HTTP Status: 401 Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```

---

## 2. Struktur Direktori dan File

Modifikasi dilakukan pada struktur file yang sudah tersedia:
- **`src/routes/`**: Modifikasi file `users-route.ts`.
- **`src/services/`**: Modifikasi file `users-service.ts`.

---

## 3. Tahapan Implementasi (Untuk Programmer / AI)

Ikuti langkah-langkah di bawah ini untuk mengerjakan tugas:

### Langkah 1: Pembuatan Logic Data User (`src/services/users-service.ts`)
1. Buat metode baru dengan nama `getCurrentUser(token: string)` di dalam modul `usersService`.
2. Validasi parameter input `token`. Jika kosong, langsung throw error `"Unauthorized"`.
3. Lakukan query ke database (Drizzle ORM) terhadap tabel `sessions` menggunakan klausa `where token = <token>`.
4. Gunakan `user_id` dari hasil pencarian (atau lakukan JOIN) untuk mengambil data dari tabel `users`.
5. Jika string token tidak ditemukan di tabel `sessions`, atau tidak ada `user` yang cocok, *throw Error* dengan pesan `"Unauthorized"`.
6. Jika data user berhasil ditemukan, pilih secara implisit field yang akan dikembalikan: `id`, `name`, `email`, dan `createdAt`. (Jangan sertakan kolom password).
7. Return objek user tersebut.

### Langkah 2: Pembuatan Endpoint Route (`src/routes/users-route.ts`)
1. Tambahkan deklarasi endpoint baru berjenis `GET` pada path `/users/current`.
2. Tangkap (ekstrak) request `headers.authorization` di dalam resolver/handler Elysia.
3. Cek apakah format Bearer token valid (misalnya, memastikan string dimulai dengan "Bearer ").
4. Ambil bagian `<token>` string dan lewatkan ke service layer `usersService.getCurrentUser(token)`.
5. Format return sukses dengan JSON response wrapper standar: `{ "data": <hasil dari service> }`.
6. Implementasikan blok `try/catch`. Apabila terjadi error yang tidak valid atau service melempar error "Unauthorized", pastikan:
   - HTTP status diset ke `401`.
   - Response diubah persis menjadi JSON string `{ "error": "Unauthorized" }`.

### Langkah 3: Pengujian Fungsional (Testing)
1. Jalankan kembali API server (Elysia).
2. Lakukan pendaftaran `POST /api/users` dan permintaan `POST /api/users/login` untuk mensimulasikan sesi login dan mendapatkan `<token>`.
3. Jalankan HTTP Request (cURL/Postman) menuju `GET /api/users/current` dengan melampirkan header `Authorization: Bearer <token>`. Pastikan data sukses didapatkan (`200 OK`).
4. Uji kasus kesalahan: gunakan string acak atau Bearer kosong. Pastikan HTTP Status 401 dan respon `{ "error": "Unauthorized" }` dirender dengan benar.
