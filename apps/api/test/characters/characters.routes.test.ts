import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../../src/app.ts";

// Repositorio en memoria: las rutas se prueban de punta a punta sin base de datos.
const store = vi.hoisted(() => ({ rows: [] as object[] }));

vi.mock("../../src/characters/characters.repository.ts", () => ({
  findAllCharacters: async () => store.rows,
  insertCharacter: async (input: object) => {
    const row = { id: `id-${store.rows.length + 1}`, ...input, avatarUrl: null };
    store.rows.push(row);
    return row;
  },
}));

const app = createApp();

const validInput = {
  name: "Kai",
  gender: "masculino",
  personality: "Chico popular de la escuela",
  greeting: "¡Hola! ¿Sos nueva?",
};

beforeEach(() => {
  store.rows = [];
});

describe("GET /characters", () => {
  it("responde 200 con la lista de personajes", async () => {
    const res = await request(app).get("/characters");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("POST /characters", () => {
  it("responde 201 con el personaje creado", async () => {
    const res = await request(app).post("/characters").send(validInput);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: "id-1", ...validInput });
  });

  it("el personaje creado aparece en el listado", async () => {
    await request(app).post("/characters").send(validInput);
    const res = await request(app).get("/characters");
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject(validInput);
  });

  it("con un body inválido responde 400 con el detalle del error", async () => {
    const res = await request(app)
      .post("/characters")
      .send({ ...validInput, name: "", greeting: undefined });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid data");
    expect(Object.keys(res.body.details.fieldErrors).sort()).toEqual(["greeting", "name"]);
    expect(store.rows).toHaveLength(0);
  });

  it("sin body responde 400", async () => {
    const res = await request(app).post("/characters");
    expect(res.status).toBe(400);
  });
});
