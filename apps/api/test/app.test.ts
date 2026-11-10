import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.ts";

// createApp() no levanta el servidor ni toca la base: supertest le hace pedidos en memoria.
const app = createApp();

describe("GET /health", () => {
  it("responde 200 con { ok: true }", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe("rutas inexistentes", () => {
  it("responden 404 en JSON", async () => {
    const res = await request(app).get("/no-existe");
    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(res.body).toEqual({ error: "Not found" });
  });
});

describe("manejo de errores", () => {
  it("un body JSON mal formado responde 400, no 500", async () => {
    const res = await request(app)
      .post("/health")
      .set("Content-Type", "application/json")
      .send("{ esto no es json");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});
