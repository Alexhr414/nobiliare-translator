import express, { type Request, type Response } from "express";
import cors from "cors";
import { phrasebook, translate } from "./translator.js";
import type { Lang } from "./types.js";

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

app.use(cors());
app.use(express.json());

const LANGS: Lang[] = ["it", "zh"];

function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as string[]).includes(value);
}

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "nobiliare-translator", time: new Date().toISOString() });
});

app.get("/api/phrasebook", (req: Request, res: Response) => {
  const lang = req.query.lang;
  if (!isLang(lang)) {
    return res.status(400).json({ error: "query param 'lang' must be 'it' or 'zh'" });
  }
  res.json({ lang, phrases: phrasebook(lang) });
});

app.post("/api/translate", (req: Request, res: Response) => {
  const { text, from, to } = req.body ?? {};

  if (typeof text !== "string" || text.trim() === "") {
    return res.status(400).json({ error: "'text' must be a non-empty string" });
  }
  if (!isLang(from) || !isLang(to)) {
    return res.status(400).json({ error: "'from' and 'to' must be 'it' or 'zh'" });
  }
  if (from === to) {
    return res.status(400).json({ error: "'from' and 'to' must differ" });
  }

  res.json(translate(text, from, to));
});

app.listen(PORT, () => {
  console.log(`[nobiliare-translator] API listening on http://localhost:${PORT}`);
});
