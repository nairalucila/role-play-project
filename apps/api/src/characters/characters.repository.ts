import type { CharacterInput } from "@rp/shared";
import { db } from "../db/client.ts";
import { characters } from "../db/schema.ts";

// Único lugar que habla con la base para los personajes.
export function findAllCharacters() {
  return db.select().from(characters).orderBy(characters.createdAt);
}

export async function insertCharacter(input: CharacterInput) {
  const [created] = await db.insert(characters).values(input).returning();
  if (!created) throw new Error("El insert del personaje no devolvió ninguna fila");
  return created;
}
