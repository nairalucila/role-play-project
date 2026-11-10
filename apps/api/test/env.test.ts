import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const DATABASE_URL = "postgresql://u:p@host/db?sslmode=require";

// env.ts tiene efectos secundarios al importarse (lee el .env y puede cortar el proceso),
// así que se simulan loadEnvFile y process.exit, y se reimporta el módulo en cada test.
async function importEnv() {
  vi.resetModules();
  return import("../src/env.ts");
}

function fsError(code: string) {
  return Object.assign(new Error(code), { code });
}

describe("env", () => {
  beforeEach(() => {
    vi.spyOn(process, "loadEnvFile").mockImplementation(() => {}); // nunca lee tu .env real
    vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`process.exit(${code})`); // corta la ejecución como el exit real
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("DATABASE_URL", DATABASE_URL);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("carga el .env de la raíz del monorepo", async () => {
    await importEnv();
    const rootEnv = fileURLToPath(new URL("../../../.env", import.meta.url));
    expect(process.loadEnvFile).toHaveBeenCalledWith(rootEnv);
  });

  it("exporta las variables ya validadas y convertidas", async () => {
    vi.stubEnv("PORT", "4000");
    const { env } = await importEnv();
    expect(env.PORT).toBe(4000);
    expect(env.DATABASE_URL).toBe(DATABASE_URL);
  });

  it("si no existe el .env, sigue con las variables del sistema", async () => {
    vi.mocked(process.loadEnvFile).mockImplementation(() => {
      throw fsError("ENOENT");
    });
    const { env } = await importEnv();
    expect(env.DATABASE_URL).toBe(DATABASE_URL);
  });

  it("si el .env existe pero no se puede leer, no oculta el error", async () => {
    vi.mocked(process.loadEnvFile).mockImplementation(() => {
      throw fsError("EACCES");
    });
    await expect(importEnv()).rejects.toThrow("EACCES");
  });

  it("con una variable inválida informa cuál y sale con código 1", async () => {
    vi.stubEnv("DATABASE_URL", "mysql://u@host/db");
    await expect(importEnv()).rejects.toThrow("process.exit(1)");
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("DATABASE_URL"));
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
