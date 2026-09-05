import request from "supertest";
import { createApp } from "../app";

const app = createApp();

describe("Authentication", () => {
  const testEmail = `test-${Date.now()}@example.com`;

  it("registers a new user successfully", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: testEmail, password: "password123", name: "Test User", role: "CUSTOMER" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it("rejects duplicate email registration", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: testEmail, password: "password123", name: "Test User", role: "CUSTOMER" });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("EMAIL_ALREADY_EXISTS");
  });

  it("rejects login with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testEmail, password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("rejects requests with no token to protected routes", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("rejects a CUSTOMER accessing a STAFF-only endpoint", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: testEmail, password: "password123" });
    const token = login.body.data.token;

    const res = await request(app)
      .post("/api/organizations")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Should Fail" });

    expect(res.status).toBe(403);
  });
});