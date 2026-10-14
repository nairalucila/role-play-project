import { defineConfig } from "drizzle-kit";

// drizzle-kit se ejecuta desde apps/api; el .env vive en la raíz del monorepo.
try {
  process.loadEnvFile("../../.env");
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

if (!process.env.DATABASE_URL) {
  throw new Error("Falta DATABASE_URL en el .env de la raíz");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL },
  strict: true,
  verbose: true,
});
