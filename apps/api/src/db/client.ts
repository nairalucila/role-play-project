import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../env.ts";
import * as schema from "./schema.ts";

const sql = postgres(env.DATABASE_URL);

export const db = drizzle(sql, { schema });

// Cierra las conexiones (para el apagado del servidor y los scripts).
export function closeDb() {
  return sql.end();
}
