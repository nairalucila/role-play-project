import { characterInputSchema } from "@rp/shared";
import { closeDb, db } from "./client.ts";
import { characters, users } from "./schema.ts";
import { devUser, seedCharacters } from "./seed-data.ts";

// Upsert por id: si la fila ya existe se actualiza con los datos de seed-data.ts,
// así correrlo varias veces no duplica nada.
async function seed() {
  await db.transaction(async (tx) => {
    await tx
      .insert(users)
      .values(devUser)
      .onConflictDoUpdate({ target: users.id, set: { displayName: devUser.displayName } });

    for (const { id, ...input } of seedCharacters) {
      // Los personajes del seed cumplen las mismas reglas que los creados por la API.
      const data = characterInputSchema.parse(input);
      await tx
        .insert(characters)
        .values({ id, ...data })
        .onConflictDoUpdate({ target: characters.id, set: data });
    }
  });

  console.log(`✅ Seed listo: 1 usuario y ${seedCharacters.length} personajes.`);
}

try {
  await seed();
} catch (error) {
  console.error("❌ Falló el seed:", error);
  process.exitCode = 1;
} finally {
  await closeDb();
}
