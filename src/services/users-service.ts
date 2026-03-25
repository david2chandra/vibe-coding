import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";

export const usersService = {
  /**
   * Mendaftarkan pengguna baru (Registrasi) ke dalam basis data.
   * 
   * Fungsi ini memvalidasi apakah email sudah terdaftar sebelumnya. 
   * Jika belum, fungsi akan melakukan hashing pada plain-text password menggunakan Bcrypt (Bun.password)
   * dan menyimpan record user baru ke tabel `users`.
   * 
   * @param name - Nama lengkap pengguna
   * @param email - Alamat email unik pengguna
   * @param password - Kata sandi dalam bentuk plain-text yang akan dienkripsi
   * @returns {Promise<Object>} Mengembalikan objek data pengguna yang baru dibuat (tanpa password)
   * @throws {Error} Melempar error "User already exists" apabila email telah digunakan
   */
  async register(name: string, email: string, password: string) {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error("User already exists");
    }

    // Hash password
    const hashedPassword = await Bun.password.hash(password);

    // Insert user
    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    });

    // Get the created user (without password)
    const newUser = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return newUser[0];
  },
  
  /**
   * Mengautentikasi pengguna (Login) berdasarkan kredensial email dan kata sandi.
   * 
   * Fungsi ini akan mencocokkan email di database dan memvalidasi kecocokan hash password.
   * Jika valid, fungsi akan membuat UUID unik sebagai Token Sesi, menyimpannya ke tabel `sessions`,
   * dan mengembalikan token tersebut kepada klien.
   * 
   * @param email - Alamat email pengguna
   * @param password - Kata sandi dalam bentuk plain-text untuk divalidasi
   * @returns {Promise<string>} String UUID v4 yang bertindak sebagai Bearer token sesi pengguna
   * @throws {Error} Melempar error "Email atau password salah" jika kredensial tidak valid/ditemukan
   */
  async login(email: string, password: string) {
    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      throw new Error("Email atau password salah");
    }

    // Verify password
    const isPasswordValid = await Bun.password.verify(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Email atau password salah");
    }

    // Generate UUID token
    const token = crypto.randomUUID();

    // Store session
    await db.insert(sessions).values({
      token,
      userId: user.id,
    });

    return token;
  },

  /**
   * Mengambil informasi profil pengguna yang sedang aktif (Current User) berdasarkan autentikasi Token Sesi.
   * 
   * Fungsi ini melakukan operasi INNER JOIN antara tabel `sessions` dan `users`
   * untuk memastikan bahwa token tersebut valid, belum kadaluwarsa/dihapus, dan terikat pada user tertentu.
   * 
   * @param token - Bearer UUID token sesi pengguna yang didapat ketika proses Login
   * @returns {Promise<Object>} Mengembalikan informasi profil pengguna (id, name, email, createdAt)
   * @throws {Error} Melempar error "Unauthorized" apabila token kosong, tidak valid, atau sesi telah hangus
   */
  async getCurrentUser(token: string) {
    if (!token) {
      throw new Error("Unauthorized");
    }

    const sessionData = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.token, token))
      .limit(1);

    if (sessionData.length === 0) {
      throw new Error("Unauthorized");
    }

    return sessionData[0];
  },

  /**
   * Mencabut akses pengguna (Logout) dengan cara menginvaliasi Token Sesi.
   * 
   * Fungsi ini akan mengeksekusi operasi DELETE secara fisik pada tabel `sessions`
   * berdasarkan token yang diberikan. Jika token tidak ditemukan, permintaan akan ditolak.
   * 
   * @param token - Bearer UUID token aktif pengguna yang akan dihapus dari sistem
   * @returns {Promise<void>} Tidak mengembalikan data apa-apa jika operasi penghapusan sukses
   * @throws {Error} Melempar error "Unauthorized" jika token kosong atau token tidak valid/sudah dihapus
   */
  async logout(token: string) {
    if (!token) {
      throw new Error("Unauthorized");
    }

    const [result] = await db.delete(sessions).where(eq(sessions.token, token));

    // result.affectedRows is specific to mysql2 driver output in Drizzle
    if (result.affectedRows === 0) {
      throw new Error("Unauthorized");
    }
  },
};
