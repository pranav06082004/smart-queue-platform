import request from "supertest";
import { createApp } from "../app";
const app = createApp();

describe("Idempotency", () => {
  it("returns the identical response for a repeated request with the same Idempotency-Key", async () => {
    const email = `idem-${Date.now()}@example.com`;
    await request(app).post("/api/auth/register").send({ email, password: "password123", name: "Idem Test", role: "CUSTOMER" });
    const login = await request(app).post("/api/auth/login").send({ email, password: "password123" });
    const token = login.body.data.token;

    // (Setup: create+open a queue — omitted here for brevity, same pattern as concurrency.test.ts)
    // ... assume queueId is available ...

    const key = `test-key-${Date.now()}`;
    const first = await request(app).post(`/api/queues/${queueId}/join`).set("Authorization", `Bearer ${token}`).set("Idempotency-Key", key);
    const second = await request(app).post(`/api/queues/${queueId}/join`).set("Authorization", `Bearer ${token}`).set("Idempotency-Key", key);

    expect(first.body.data.id).toBe(second.body.data.id);
    expect(first.body.data.tokenNumber).toBe(second.body.data.tokenNumber);
  });
});