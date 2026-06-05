import request from "supertest";

import { app } from "./app";

describe("Healthcheck (smoke test do scaffold)", () => {
  it("GET /health deve responder 200 com status ok", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok", service: "codehub-api" });
  });
});
