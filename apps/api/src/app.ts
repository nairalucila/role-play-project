import express, { type ErrorRequestHandler } from "express";
import { healthRouter } from "./health/health.routes.ts";

// Crea la app sin levantar el servidor, para poder testearla por separado.
export function createApp() {
  const app = express();

  app.use(express.json());

  app.use("/health", healthRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // Express 5 captura también los errores de handlers async y los manda acá.
  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
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
