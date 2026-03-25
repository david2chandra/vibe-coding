import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";

export const usersService = {
  /**
   * Mendaftarkan user baru ke sistem.
   * Melakukan pengecekan email duplikat dan melakukan hashing pada password.
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
   * Melakukan verifikasi login user.
   * Jika sukses, akan menghasilkan UUID token baru dan menyimpannya ke tabel sessions.
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
   * Mengambil data profil user yang sedang login berdasarkan token sesi.
   * Melakukan join antara tabel sessions dan users.
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
   * Menghapus sesi user (logout) dengan cara menghapus record token dari tabel sessions.
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
