import { Elysia } from "elysia";
import { db } from "./db";
import { users } from "./db/schema";
import { usersRoute } from "./routes/users-route";

export const app = new Elysia()
  .get("/", () => "Hello Elysia!")
  .use(usersRoute)
  .get("/users", async () => {
    try {
      return await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users);
    } catch (error) {
      return { error: "Database connection failed. Make sure MySQL is running and DATABASE_URL is correct." };
    }
  });
