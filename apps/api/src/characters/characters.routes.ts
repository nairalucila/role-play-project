import { Router } from "express";
import { createCharacter, listCharacters } from "./characters.service.ts";

export const charactersRouter = Router();

// GET /characters
charactersRouter.get("/", async (_req, res) => {
  res.json(await listCharacters());
});

// GET /characters/:userid
 /** 
charactersRouter.get("/", async (req, res) => {
  res.json(await listCharacters());
});
*/

// POST /characters
charactersRouter.post("/", async (req, res) => {
  res.status(201).json(await createCharacter(req.body));
});
