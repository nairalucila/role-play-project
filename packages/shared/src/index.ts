import { z } from "zod";

// Personaje público con el que se puede conversar (ej: "Chico popular de la escuela").
export const characterInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  gender: z.string().trim().min(1).max(40),
  personality: z.string().trim().min(1).max(2000),
  greeting: z.string().trim().min(1).max(2000),
});
export type CharacterInput = z.infer<typeof characterInputSchema>;

// Personaje que interpreta el usuario dentro de una conversación (ej: "Chica tímida y misteriosa").
export const personaSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).max(2000),
});
export type Persona = z.infer<typeof personaSchema>;

export const messageRoleSchema = z.enum(["user", "assistant"]);
export type MessageRole = z.infer<typeof messageRoleSchema>;
