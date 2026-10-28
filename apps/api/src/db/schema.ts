import { index, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { MESSAGE_ROLES } from "@rp/shared";

// Los valores del enum salen de la misma constante que usa el esquema Zod (API y web).
export const messageRole = pgEnum("message_role", MESSAGE_ROLES);

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();


export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  displayName: varchar("display_name", { length: 80 }).notNull(),
  createdAt: createdAt(),
});

export const characters = pgTable("characters", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 80 }).notNull(),
  gender: varchar("gender", { length: 40 }).notNull(),
  personality: text("personality").notNull(),
  greeting: text("greeting").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: createdAt(),
});

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    characterId: uuid("character_id")
      .notNull()
      .references(() => characters.id, { onDelete: "cascade" }),
    // La persona del usuario se guarda dentro de la conversación (ver base/PROYECTO.md §7).
    personaName: varchar("persona_name", { length: 80 }).notNull(),
    personaDescription: text("persona_description").notNull(),
    createdAt: createdAt(),
  },
  (table) => [index("conversations_user_id_idx").on(table.userId)],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: messageRole("role").notNull(),
    // Pensado para chats grupales: qué personaje habló. Hoy queda en null.
    senderCharacterId: uuid("sender_character_id").references(() => characters.id, {
      onDelete: "set null",
    }),
    content: text("content").notNull(),
    createdAt: createdAt(),
  },
  (table) => [index("messages_conversation_created_idx").on(table.conversationId, table.createdAt)],
);
