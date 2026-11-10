import { getTableName, type Table } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { devUser, seedCharacters } from "../../src/db/seed-data.ts";

// Base de datos falsa: registra cada insert + upsert en vez de ejecutarlo.
const mocks = vi.hoisted(() => {
  const inserts: { table: string; values: unknown; conflict: { target: { name: string }; set: object } }[] = [];
  const tx = {
    insert: (table: unknown) => ({
      values: (values: unknown) => ({
        onConflictDoUpdate: async (conflict: never) => {
          inserts.push({ table: table as string, values, conflict });
        },
      }),
    }),
  };
  return {
    inserts,
    db: { transaction: vi.fn(async (fn: (t: typeof tx) => Promise<void>) => fn(tx)) },
    closeDb: vi.fn(async () => {}),
  };
});

vi.mock("../../src/db/client.ts", () => ({ db: mocks.db, closeDb: mocks.closeDb }));

// seed.ts se ejecuta al importarse: se reinicia el registro de módulos para correrlo de nuevo en cada test.
async function runSeed() {
  vi.resetModules();
  await import("../../src/db/seed.ts");
}

const insertedTables = () => mocks.inserts.map((i) => getTableName(i.table as unknown as Table));

describe("seed", () => {
  beforeEach(() => {
    mocks.inserts.length = 0;
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.exitCode = undefined; // si quedara en 1, Vitest terminaría con error
  });

  it("inserta el usuario de desarrollo y los personajes en una sola transacción", async () => {
    await runSeed();
    expect(mocks.db.transaction).toHaveBeenCalledOnce();
    expect(insertedTables()).toEqual(["users", ...seedCharacters.map(() => "characters")]);
    expect(mocks.inserts[0]?.values).toEqual(devUser);
    expect(mocks.inserts.slice(1).map((i) => i.values)).toEqual(seedCharacters);
  });

  it("hace upsert por id, así correrlo dos veces no duplica filas", async () => {
    await runSeed();
    for (const insert of mocks.inserts) {
      expect(insert.conflict.target.name).toBe("id");
      expect(insert.conflict.set).not.toHaveProperty("id"); // el id nunca se pisa
    }
    expect(mocks.inserts[0]?.conflict.set).toEqual({ displayName: devUser.displayName });
  });

  it("cierra la conexión al terminar", async () => {
    await runSeed();
    expect(mocks.closeDb).toHaveBeenCalledOnce();
    expect(process.exitCode).toBeUndefined();
  });

  it("si falla: informa el error, sale con código 1 y cierra la conexión igual", async () => {
    mocks.db.transaction.mockRejectedValueOnce(new Error("Neon no responde"));
    await runSeed();
    expect(console.error).toHaveBeenCalledWith("❌ Falló el seed:", expect.any(Error));
    expect(process.exitCode).toBe(1);
    expect(mocks.closeDb).toHaveBeenCalledOnce();
  });
});
