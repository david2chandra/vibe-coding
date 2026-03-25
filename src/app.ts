import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { usersRoute } from "./routes/users-route";

export const app = new Elysia()
  .use(swagger())
  .get("/", () => "Hello Elysia!")
  .use(usersRoute);
