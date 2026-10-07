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
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  };
  app.use(errorHandler);

  return app;
}
