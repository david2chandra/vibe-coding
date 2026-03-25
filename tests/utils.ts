import { db } from "../src/db";
import { users, sessions } from "../src/db/schema";
import { sql } from "drizzle-orm";

export async function resetDatabase() {
  // Disable foreign key checks to truncate tables with relationships
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
  await db.delete(sessions);
  await db.delete(users);
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);
}
