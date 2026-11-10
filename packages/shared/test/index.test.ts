import { describe, expect, it } from "vitest";
import { MESSAGE_ROLES, characterInputSchema, messageRoleSchema, personaSchema } from "../src/index.ts";

const validCharacter = {
  name: "Leo Navarro",
  gender: "masculino",
  personality: "El chico popular de la escuela.",
  greeting: "Ey, ¿sos nueva?",
};

describe("characterInputSchema", () => {
  it("acepta un personaje válido", () => {
    expect(characterInputSchema.parse(validCharacter)).toEqual(validCharacter);
  });

  it("quita los espacios sobrantes de los textos", () => {
    const result = characterInputSchema.parse({ ...validCharacter, name: "  Leo  " });
    expect(result.name).toBe("Leo");
  });

  it("rechaza un nombre vacío o con solo espacios", () => {
    expect(characterInputSchema.safeParse({ ...validCharacter, name: "" }).success).toBe(false);
    expect(characterInputSchema.safeParse({ ...validCharacter, name: "   " }).success).toBe(false);
  });

  it("rechaza un nombre de más de 80 caracteres", () => {
    const result = characterInputSchema.safeParse({ ...validCharacter, name: "a".repeat(81) });
    expect(result.success).toBe(false);
  });

  it("acepta un nombre de exactamente 80 caracteres", () => {
    const result = characterInputSchema.safeParse({ ...validCharacter, name: "a".repeat(80) });
    expect(result.success).toBe(true);
  });

  it.each(["name", "gender", "personality", "greeting"] as const)("rechaza si falta %s", (field) => {
    const { [field]: _omitted, ...rest } = validCharacter;
    const result = characterInputSchema.safeParse(rest);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual([field]);
  });

  it("descarta campos que no están en el esquema", () => {
    const result = characterInputSchema.parse({ ...validCharacter, id: "x", isAdmin: true });
    expect(result).not.toHaveProperty("id");
    expect(result).not.toHaveProperty("isAdmin");
  });
});

describe("personaSchema", () => {
  it("acepta una persona válida", () => {
    const persona = { name: "Mía", description: "Chica tímida y misteriosa" };
    expect(personaSchema.parse(persona)).toEqual(persona);
  });

  it("rechaza una persona sin descripción", () => {
    expect(personaSchema.safeParse({ name: "Mía", description: "" }).success).toBe(false);
  });
});

describe("messageRoleSchema", () => {
  it.each(MESSAGE_ROLES)("acepta el rol %s", (role) => {
    expect(messageRoleSchema.parse(role)).toBe(role);
  });

  it("rechaza roles desconocidos", () => {
    expect(messageRoleSchema.safeParse("system").success).toBe(false);
  });

  it("usa exactamente los valores de MESSAGE_ROLES", () => {
    expect(messageRoleSchema.options).toEqual([...MESSAGE_ROLES]);
  });
});
