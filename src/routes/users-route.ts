import { Elysia, t } from "elysia";
import { usersService } from "../services/users-service";

export const usersRoute = new Elysia({ prefix: "/api" })
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
        name: t.String(),
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .post(
    "/users/login",
    async ({ body, set }) => {
      try {
        const token = await usersService.login(body.email, body.password);
        return {
          data: token,
        };
      } catch (error: any) {
        set.status = 401;
        return {
          error: error.message,
        };
      }
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  );
