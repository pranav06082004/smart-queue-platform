import request from "supertest";
import { createApp } from "../app";

const app = createApp();

describe("Idempotency", () => {
  it("returns the identical response for a repeated request with the same Idempotency-Key", async () => {
    // Set up a staff member, organization, service, and an OPEN queue
    const staffEmail = `idem-staff-${Date.now()}@example.com`;
    await request(app).post("/api/auth/register").send({ email: staffEmail, password: "password123", name: "Staff", role: "STAFF" });
    const staffLogin = await request(app).post("/api/auth/login").send({ email: staffEmail, password: "password123" });
    const staffToken = staffLogin.body.data.token;

    const org = await request(app).post("/api/organizations").set("Authorization", `Bearer ${staffToken}`).send({ name: "Idem Test Org" });
    const service = await request(app).post(`/api/organizations/${org.body.data.id}/services`).set("Authorization", `Bearer ${staffToken}`).send({ name: "Idem Test Service" });
    const queue = await request(app).post("/api/queues").set("Authorization", `Bearer ${staffToken}`).send({ serviceId: service.body.data.id, name: "Idem Test Queue" });
    const queueId = queue.body.data.id;
    await request(app).patch(`/api/queues/${queueId}/open`).set("Authorization", `Bearer ${staffToken}`);

    // Set up a customer to actually test idempotency with
    const email = `idem-${Date.now()}@example.com`;
    await request(app).post("/api/auth/register").send({ email, password: "password123", name: "Idem Test", role: "CUSTOMER" });
    const login = await request(app).post("/api/auth/login").send({ email, password: "password123" });
    const token = login.body.data.token;

    const key = `test-key-${Date.now()}`;
    const first = await request(app).post(`/api/queues/${queueId}/join`).set("Authorization", `Bearer ${token}`).set("Idempotency-Key", key);
    const second = await request(app).post(`/api/queues/${queueId}/join`).set("Authorization", `Bearer ${token}`).set("Idempotency-Key", key);

    expect(first.body.data.id).toBe(second.body.data.id);
    expect(first.body.data.tokenNumber).toBe(second.body.data.tokenNumber);
  });
});