import { characterInputSchema } from "@rp/shared";
import { findAllCharacters, insertCharacter } from "./characters.repository.ts";

// Lógica de personajes. No conoce Express: recibe datos y devuelve datos.

export function listCharacters() {
  return findAllCharacters();
}

// Si los datos no son válidos lanza un ZodError; el manejador de errores lo convierte en 400.
export function createCharacter(input: unknown) {
  const character = characterInputSchema.parse(input);
  return insertCharacter(character);
}
