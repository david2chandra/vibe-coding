# Project Setup: Bun + ElysiaJS + Drizzle + MySQL

## Tujuan
Menginisialisasi project backend baru menggunakan stack **Bun**, **ElysiaJS**, **Drizzle ORM**, dan **MySQL** di dalam direktori ini. 

Instruksi ini dirancang secara high-level agar model AI dapat memahaminya dan membuat implementasi secara mandiri.

## Langkah-langkah Implementasi

1. **Inisialisasi Project Bun**
   - Jalankan perintah inisialisasi project Bun kosong di direktori saat ini.
   - Pastikan `package.json` dan `tsconfig.json` terbentuk.

2. **Instalasi Dependency**
   - Install **ElysiaJS** sebagai framework web.
   - Install **Drizzle ORM** beserta driver **MySQL** yang direkomendasikan untuk environment Bun (misalnya `mysql2`).
   - Install **Drizzle Kit** sebagai development dependency untuk keperluan migrasi schema.

3. **Setup Database & Schema (Drizzle)**
   - Buat file konfigurasi Drizzle (misalnya `drizzle.config.ts`).
   - Buat folder `src/db/` dan definisikan satu schema tabel contoh yang sangat sederhana (misalnya tabel `users`) di `src/db/schema.ts`.
   - Buat instance koneksi Drizzle di `src/db/index.ts` menggunakan URL database dari environment variable.

4. **Setup Server (Elysia)**
   - Konfigurasikan file utama (misalnya `src/index.ts`) untuk menjalankan server ElysiaJS.
   - Buat endpoint dasar (contoh `GET /`) untuk memastikan server berjalan.
   - Buat satu endpoint sederhana yang melakukan pemanggilan ke database (misalnya `GET /users`) untuk memvalidasi integrasi Elysia dan Drizzle.

5. **Environment dan Scripts**
   - Buat file `.env.example` yang memberikan contoh format `DATABASE_URL` untuk MySQL.
   - Tambahkan utility scripts di dalam `package.json` untuk menjalankan development server (misal: `bun run dev`) dan script eksekusi migrasi Drizzle.

## Catatan
- Gunakan **TypeScript** untuk keseluruhan kode.
- Keep it simple: struktur folder dibuat clean & modular, tetapi tidak menumpuk terlalu banyak abstraksi.
