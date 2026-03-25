import { describe, expect, it, beforeEach } from "bun:test";
import { app } from "../src/app";
import { resetDatabase } from "./utils";

describe("Users API", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  describe("POST /api/users (Registration)", () => {
    it("should register a new user successfully", async () => {
      const resp = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Eko",
            email: "eko@localhost",
            password: "password123",
          }),
        })
      );

      expect(resp.status).toBe(200);
      const body = (await resp.json()) as any;
      expect(body.message).toBe("User created successfully");
      expect(body.data.name).toBe("Eko");
      expect(body.data.email).toBe("eko@localhost");
    });

    it("should fail when registering with a duplicate email", async () => {
      // First registration
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Eko",
            email: "eko@localhost",
            password: "password123",
          }),
        })
      );

      // Duplicate registration
      const resp = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Eko Baru",
            email: "eko@localhost",
            password: "password123",
          }),
        })
      );

      expect(resp.status).toBe(400);
      const body = (await resp.json()) as any;
      expect(body.error).toBe("User already exists");
    });

    it("should fail when field exceeds 255 characters", async () => {
      const resp = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "A".repeat(300),
            email: "eko@localhost",
            password: "password123",
          }),
        })
      );

      expect(resp.status).toBe(422);
    });
  });

  describe("POST /api/users/login", () => {
    beforeEach(async () => {
      // Create user for login tests
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Eko",
            email: "eko@localhost",
            password: "password123",
          }),
        })
      );
    });

    it("should login successfully and return token", async () => {
      const resp = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "eko@localhost",
            password: "password123",
          }),
        })
      );

      expect(resp.status).toBe(200);
      const body = (await resp.json()) as any;
      expect(body.data).toBeDefined();
      expect(typeof body.data).toBe("string");
    });

    it("should fail with wrong password", async () => {
      const resp = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "eko@localhost",
            password: "wrongpassword",
          }),
        })
      );

      expect(resp.status).toBe(401);
      const body = (await resp.json()) as any;
      expect(body.error).toBe("Email atau password salah");
    });
  });

  describe("Authentication Protected Routes", () => {
    let token: string;

    beforeEach(async () => {
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Eko",
            email: "eko@localhost",
            password: "password123",
          }),
        })
      );

      const loginResp = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "eko@localhost",
            password: "password123",
          }),
        })
      );
      const result = (await loginResp.json()) as any;
      token = result.data;
    });

    describe("GET /api/users/current", () => {
      it("should get current user with valid token", async () => {
        const resp = await app.handle(
          new Request("http://localhost/api/users/current", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          })
        );

        expect(resp.status).toBe(200);
        const body = (await resp.json()) as any;
        expect(body.data.email).toBe("eko@localhost");
      });

      it("should fail with invalid token", async () => {
        const resp = await app.handle(
          new Request("http://localhost/api/users/current", {
            method: "GET",
            headers: { Authorization: "Bearer invalid-token" },
          })
        );

        expect(resp.status).toBe(401);
        const body = (await resp.json()) as any;
        expect(body.error).toBe("Unauthorized");
      });
    });

    describe("DELETE /api/users/logout", () => {
      it("should logout successfully", async () => {
        const resp = await app.handle(
          new Request("http://localhost/api/users/logout", {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          })
        );

        expect(resp.status).toBe(200);
        const body = (await resp.json()) as any;
        expect(body.data).toBe("OK");

        // Verify token is invalidated
        const recheck = await app.handle(
          new Request("http://localhost/api/users/current", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          })
        );
        expect(recheck.status).toBe(401);
      });
    });
  });
});
