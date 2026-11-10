import { MESSAGE_ROLES } from "@rp/shared";
import { getTableConfig, type PgTable } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";
import { characters, conversations, messageRole, messages, users } from "../../src/db/schema.ts";

// Resume las foreign keys de una tabla: columna → tabla destino y qué pasa al borrar.
function foreignKeysOf(table: PgTable) {
  return getTableConfig(table).foreignKeys.map((fk) => {
    const ref = fk.reference();
    return {
      column: ref.columns[0]?.name,
      references: getTableConfig(ref.foreignTable).name,
      onDelete: fk.onDelete,
    };
  });
}

function nullableColumnsOf(table: PgTable) {
  return getTableConfig(table).columns.filter((c) => !c.notNull).map((c) => c.name);
}

// Estos tests protegen las reglas documentadas en base/PROYECTO.md §7: si alguien cambia
// un cascade o vuelve opcional una columna sin querer, fallan antes de generar la migración.
describe("schema", () => {
  it("el enum message_role usa los valores de MESSAGE_ROLES", () => {
    expect(messageRole.enumName).toBe("message_role");
    expect(messageRole.enumValues).toEqual([...MESSAGE_ROLES]);
  });

  it("las tablas tienen los nombres esperados en la base", () => {
    expect([users, characters, conversations, messages].map((t) => getTableConfig(t).name)).toEqual([
      "users",
      "characters",
      "conversations",
      "messages",
    ]);
  });

  it("conversations: borrar un usuario o un personaje borra sus conversaciones", () => {
    expect(foreignKeysOf(conversations)).toEqual(
      expect.arrayContaining([
        { column: "user_id", references: "users", onDelete: "cascade" },
        { column: "character_id", references: "characters", onDelete: "cascade" },
      ]),
    );
  });

  it("messages: borrar una conversación borra sus mensajes; borrar un personaje deja sender en null", () => {
    expect(foreignKeysOf(messages)).toEqual(
      expect.arrayContaining([
        { column: "conversation_id", references: "conversations", onDelete: "cascade" },
        { column: "sender_character_id", references: "characters", onDelete: "set null" },
      ]),
    );
  });

  it("solo avatar_url y sender_character_id son opcionales", () => {
    expect(nullableColumnsOf(users)).toEqual([]);
    expect(nullableColumnsOf(characters)).toEqual(["avatar_url"]);
    expect(nullableColumnsOf(conversations)).toEqual([]);
    expect(nullableColumnsOf(messages)).toEqual(["sender_character_id"]);
  });

  it("messages tiene índice por (conversation_id, created_at) para traer el historial ordenado", () => {
    const [index] = getTableConfig(messages).indexes;
    const columns = index?.config.columns.map((c) => ("name" in c ? c.name : undefined));
    expect(columns).toEqual(["conversation_id", "created_at"]);
  });
});
