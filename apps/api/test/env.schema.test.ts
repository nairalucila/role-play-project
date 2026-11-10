import { describe, expect, it } from "vitest";
import { parseEnv } from "../src/env.schema.ts";

const DATABASE_URL = "postgresql://user:pass@host/db?sslmode=require";

describe("parseEnv", () => {
  it("aplica los valores por defecto de PORT y NODE_ENV", () => {
    const result = parseEnv({ DATABASE_URL });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ PORT: 3000, NODE_ENV: "development", DATABASE_URL });
  });

  it("convierte PORT de texto a número", () => {
    expect(parseEnv({ DATABASE_URL, PORT: "8080" }).data?.PORT).toBe(8080);
  });

  it.each(["abc", "-1", "3.5", "0"])("rechaza PORT inválido (%s)", (port) => {
    const result = parseEnv({ DATABASE_URL, PORT: port });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["PORT"]);
  });

  it("rechaza un NODE_ENV desconocido", () => {
    expect(parseEnv({ DATABASE_URL, NODE_ENV: "staging" }).success).toBe(false);
  });

  it("exige DATABASE_URL", () => {
    const result = parseEnv({});
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["DATABASE_URL"]);
  });

  it.each(["postgres://u@h/db", "postgresql://u@h/db"])("acepta URLs de Postgres (%s)", (url) => {
    expect(parseEnv({ DATABASE_URL: url }).success).toBe(true);
  });

  it.each(["mysql://u@h/db", "http://localhost", "no-es-una-url"])(
    "rechaza URLs que no son de Postgres (%s)",
    (url) => {
      const result = parseEnv({ DATABASE_URL: url });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toContain("URL de Postgres");
    },
  );
});
