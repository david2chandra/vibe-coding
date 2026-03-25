import { Elysia, t } from "elysia";
import { usersService } from "../services/users-service";

export const usersRoute = new Elysia({ prefix: "/api" })
  .error({
    UNAUTHORIZED: Error,
  })
  .onError(({ code, error, set }) => {
    const message = (error as any).message;
    if (code === "UNAUTHORIZED" || message === "Unauthorized" || message === "Email atau password salah") {
      set.status = 401;
      return {
        error: message,
      };
    }
  })
  .post(
    "/users",
    async ({ body, set }) => {
      try {
        const user = await usersService.register(
          body.name,
          body.email,
          body.password
        );

        return {
          message: "User created successfully",
          data: user,
        };
      } catch (error: any) {
        if (error.message === "User already exists") {
          set.status = 400;
          return {
            message: "User already exists",
            error: "User already exists",
          };
        }

        set.status = 500;
        return {
          message: "Internal server error",
          error: error.message,
        };
      }
    },
    {
      body: t.Object({
        name: t.String({ maxLength: 255 }),
        email: t.String({ maxLength: 255 }),
        password: t.String({ maxLength: 255 }),
      }),
    }
  )
  .post(
    "/users/login",
    async ({ body }) => {
      const token = await usersService.login(body.email, body.password);
      return {
        data: token,
      };
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .guard({
    beforeHandle: ({ headers }) => {
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("Unauthorized");
      }
    },
  })
  .derive(({ headers }) => {
    const token = headers.authorization!.replace("Bearer ", "").trim();
    return { token };
  })
  .get("/users/current", async ({ token }) => {
    const user = await usersService.getCurrentUser(token);
    return {
      data: user,
    };
  })
  .delete("/users/logout", async ({ token }) => {
    await usersService.logout(token);
    return {
      data: "OK",
    };
  });
