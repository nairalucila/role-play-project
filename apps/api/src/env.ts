import { fileURLToPath } from "node:url";
import { parseEnv } from "./env.schema.ts";

// El .env vive en la raíz del monorepo. Si no existe, se usan las variables del sistema.
const rootEnvPath = fileURLToPath(new URL("../../../.env", import.meta.url));
try {
  process.loadEnvFile(rootEnvPath);
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

const parsed = parseEnv(process.env);
if (!parsed.success) {
  console.error("❌ Variables de entorno inválidas:");
  for (const issue of parsed.error.issues) {
    console.error(`   - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
