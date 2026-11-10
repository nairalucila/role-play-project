import { z } from "zod";

// Se valida solo lo que la API usa hoy. Las variables AI_* se suman en RP-09.
export const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().regex(/^postgres(ql)?:\/\//, "debe ser una URL de Postgres (postgresql://...)"),
});

export type Env = z.infer<typeof envSchema>;

// Función pura (sin efectos secundarios) para poder testearla con cualquier objeto de variables.
export function parseEnv(source: Record<string, string | undefined>) {
  return envSchema.safeParse(source);
}
