import { fileURLToPath } from "node:url";
import { z } from "zod";

// El .env vive en la raíz del monorepo. Si no existe, se usan las variables del sistema.
const rootEnvPath = fileURLToPath(new URL("../../../.env", import.meta.url));
try {
  process.loadEnvFile(rootEnvPath);
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

// Se valida solo lo que la API usa hoy. Las variables AI_* se suman en RP-09.
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().regex(/^postgres(ql)?:\/\//, "debe ser una URL de Postgres (postgresql://...)"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Variables de entorno inválidas:");
  for (const issue of parsed.error.issues) {
    console.error(`   - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
