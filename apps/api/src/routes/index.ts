import type { Router } from "express";
import { charactersRouter } from "../characters/characters.routes.ts";
import { healthRouter } from "../health/health.routes.ts";

// Todas las rutas de la API. Para sumar una entidad nueva, agregala a esta lista.
export const routes: { path: string; router: Router }[] = [
  { path: "/health", router: healthRouter },
  { path: "/characters", router: charactersRouter },
];
