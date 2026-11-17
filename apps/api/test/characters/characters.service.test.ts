import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { findAllCharacters, insertCharacter } from "../../src/characters/characters.repository.ts";
import { createCharacter, listCharacters } from "../../src/characters/characters.service.ts";

// Repositorio simulado: el servicio se prueba sin base de datos.
vi.mock("../../src/characters/characters.repository.ts", () => ({
  findAllCharacters: vi.fn(),
  insertCharacter: vi.fn(async (input: object) => ({ id: "id-nuevo", ...input })),
}));

const validInput = {
  name: "Kai",
  gender: "masculino",
  personality: "Chico popular de la escuela",
  greeting: "¡Hola! ¿Sos nueva?",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("listCharacters", () => {
  it("devuelve lo que trae el repositorio", async () => {
    const rows = [{ id: "1", ...validInput }];
    vi.mocked(findAllCharacters).mockResolvedValueOnce(rows as never);
    await expect(listCharacters()).resolves.toBe(rows);
  });
});

describe("createCharacter", () => {
  it("guarda los datos validados y devuelve el personaje creado", async () => {
    const created = await createCharacter(validInput);
    expect(insertCharacter).toHaveBeenCalledWith(validInput);
    expect(created).toEqual({ id: "id-nuevo", ...validInput });
  });

  it("limpia los datos antes de guardar (espacios y campos extra)", async () => {
    await createCharacter({ ...validInput, name: "  Kai  ", id: "no-se-puede-elegir" });
    expect(insertCharacter).toHaveBeenCalledWith(validInput);
  });

  it("con datos inválidos lanza un ZodError y no toca el repositorio", async () => {
    expect(() => createCharacter({ ...validInput, name: "" })).toThrow(z.ZodError);
    expect(() => createCharacter(undefined)).toThrow(z.ZodError);
    expect(insertCharacter).not.toHaveBeenCalled();
  });
});
