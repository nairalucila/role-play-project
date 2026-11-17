import express, { type ErrorRequestHandler } from "express";
import { z } from "zod";
import { routes } from "./routes/index.ts";

// Crea la app sin levantar el servidor, para poder testearla por separado.
export function createApp() {
  const app = express();

  app.use(express.json());

  for (const { path, router } of routes) {
    app.use(path, router);
  }

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // Express 5 captura también los errores de handlers async y los manda acá.
  // TODO: moved to a separate file and add tests for it.
  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    // Datos inválidos según un esquema Zod (lo lanzan los servicios): 400 con el detalle por campo.
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid data", details: z.flattenError(err) });
      return;
    }
    // Errores del cliente (ej: JSON mal formado → 400): se respeta el status y se expone el mensaje.
    const status: unknown = err?.status ?? err?.statusCode;
    if (typeof status === "number" && status >= 400 && status < 500) {
      res.status(status).json({ error: err.expose ? err.message : "Bad request" });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  };
  app.use(errorHandler);

  return app;
}
