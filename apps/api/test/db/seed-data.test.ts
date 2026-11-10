import { characterInputSchema } from "@rp/shared";
import { describe, expect, it } from "vitest";
import { DEV_USER_ID, devUser, seedCharacters } from "../../src/db/seed-data.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// Validan los datos del seed sin conectarse a la base: si alguien edita seed-data.ts
// y rompe una regla, el test falla antes de correr `pnpm db:seed`.
describe("seed-data", () => {
  it("el usuario de desarrollo usa DEV_USER_ID", () => {
    expect(devUser.id).toBe(DEV_USER_ID);
    expect(DEV_USER_ID).toMatch(UUID);
  });

  it("trae al menos 3 personajes", () => {
    expect(seedCharacters.length).toBeGreaterThanOrEqual(3);
  });

  it.each(seedCharacters)("$name cumple characterInputSchema", ({ id: _id, ...input }) => {
    expect(characterInputSchema.safeParse(input).success).toBe(true);
  });

  it("todos los ids son UUID válidos y únicos", () => {
    const ids = seedCharacters.map((c) => c.id);
    for (const id of ids) expect(id).toMatch(UUID);
    expect(new Set([...ids, DEV_USER_ID]).size).toBe(ids.length + 1);
  });
});
