import request from "supertest";
import { createApp } from "../../src/app";
import { prisma } from "../../src/utils/prisma";

const app = createApp();

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /api/health", () => {
  it("should return status ok when database is connected", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: "ok",
      service: "HopLedger Backend",
      database: "connected",
    });
    expect(res.body.timestamp).toBeDefined();
  });
});

describe("API Key Authentication", () => {
  it("should allow requests when no API_KEY is configured", async () => {
    delete process.env["API_KEY"];

    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
  });

  it("should reject requests with wrong API key when API_KEY is set", async () => {
    process.env["API_KEY"] = "test-secret-key";

    // Health is public, so test a protected path
    // For now, any /api path that isn't /health or /public/* requires auth
    const res = await request(app)
      .get("/api/nonexistent")
      .set("x-api-key", "wrong-key");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid or missing API key");

    delete process.env["API_KEY"];
  });
});
