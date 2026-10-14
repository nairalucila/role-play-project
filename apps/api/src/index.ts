import { env } from "./env.ts";
import { createApp } from "./app.ts";
import { closeDb } from "./db/client.ts";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`🚀 API escuchando en http://localhost:${env.PORT}`);
});

// Cierre ordenado al detener el proceso (Ctrl+C o el reinicio de tsx watch).
function shutdown() {
  server.close(async () => {
    await closeDb();
    process.exit(0);
  });
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
