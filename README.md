# Nobiliare-Aulico Translator · 贵族雅言转化器

Converts any phrase into the noble register of the house of **Rancido Stilnterra**, in **Italian and Chinese**, across three levels of courtly refinement:

1. **Versione Diretta / Volgare** — the bare meaning, no gloves.
2. **Versione Nobiliare Standard** — the court register: *Voi*, ceremony, restraint.
3. **Versione Nobiliare Spietata (Sarcasmo Aulico)** — velvet on the surface, a blade underneath.

The original intent is always preserved: praise stays praise, an insult stays an insult, a question stays a question. The house lexicon runs through every noble rendering — *incedere, magione, augusta persona, nocumento, vacuità d'ingegno, coatto, protocollare, solerte, celestiale, velleità*.

A single-page app built with **Vite 8 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui**, styled as parchment and ink with EB Garamond and Noto Serif SC.

## Features

- Large input textarea with example chips; **Ctrl/⌘ + Enter** submits.
- **Trasmuta / 转化** produces three result cards, each with Italian and Chinese text.
- Copy per block (IT, ZH, or both) and **copy all** as plain text.
- **Rigenera** cycles through alternative renderings of the same phrase.
- History of the last 30 translations, persisted in `localStorage` (restore, remove, clear).
- Live translation by **MiniMax** through a server-side Cloudflare Pages Function — the API key never reaches the browser.
- Loading state while the model composes; a banner if the key is missing or the call fails, in which case the offline demo engine answers instead.
- Collapsible glossary of the house lexicon with Italian and Chinese meanings.
- Responsive layout; works on phones.

## How translation works

### Live mode: MiniMax via a Pages Function (default)

Every phrase is sent to `POST /api/transmute`, a [Cloudflare Pages Function](https://developers.cloudflare.com/pages/functions/) in `functions/api/transmute.ts`. The Function validates the request, calls MiniMax's OpenAI-compatible Chat Completions endpoint with the house system prompt (paraphrase, never echo; three levels; Italian + Chinese; strict JSON), and returns the same `Translation` object the UI renders. The browser bundle contains **no API key and no `VITE_*` secrets**.

```
POST /api/transmute      { "input": string, "variant"?: number }   → Translation JSON
GET  /api/transmute      → { "provider": "minimax", "configured": boolean, "model": string | null }
```

Error responses are `{ "error": "invalid_request" | "llm_unconfigured" | "llm_failed", "message": string }` with status 400 / 503 / 502. On any error the UI shows a banner and answers from the offline demo engine.

Secrets are read from the Pages project's environment (server-side only):

| Secret | Required | Default | Purpose |
| --- | --- | --- | --- |
| `MINIMAX_API_KEY` | yes | *(unset → demo mode)* | Bearer token for MiniMax |
| `MINIMAX_BASE_URL` | no | `https://api.minimax.io/v1` | OpenAI-compatible base URL. International endpoint by default; mainland China is `https://api.minimaxi.com/v1` |
| `MINIMAX_MODEL` | no | `MiniMax-M3` | Any MiniMax chat model id (`MiniMax-M3`, `MiniMax-M2.7`, `MiniMax-M2.7-highspeed`, `MiniMax-M2.5`, …) |

Set them once per Pages project, then redeploy so the Function picks them up:

```bash
npx wrangler login                                                   # once
npx wrangler pages secret put MINIMAX_API_KEY  --project-name nobiliare-translator
npx wrangler pages secret put MINIMAX_BASE_URL --project-name nobiliare-translator   # optional
npx wrangler pages secret put MINIMAX_MODEL    --project-name nobiliare-translator   # optional
npm run deploy:cf                                                    # or push to main with Git integration
```

Equivalently, in the Cloudflare dashboard: *Workers & Pages → nobiliare-translator → Settings → Variables and Secrets*, add them as **Secrets** for Production (and Preview if wanted), then trigger a new deployment.

Implementation notes: MiniMax M-series models are reasoning models. The Function sends `thinking: { type: "disabled" }` (honoured by MiniMax-M3; M2.x keep thinking on) and `reasoning_split: true`, and also strips any inline `<think>…</think>` block before parsing the JSON. MiniMax reports auth/quota errors as HTTP 200 with a non-zero `base_resp.status_code`; those surface as `llm_failed`. Requests time out after 45 s.

### Offline demo engine (fallback)

Used when `MINIMAX_API_KEY` is not set or the live call fails. No network, no keys. The engine:

1. **Detects the intent** of the phrase (greeting, farewell, gratitude, apology, praise, insult, dismissal, refusal, agreement, request, command, question, complaint, hunger, fatigue, affection, money, lateness, threat, boast, or a generic statement). Italian, English and Chinese trigger words are recognised.
2. **Ennobles the original wording** with a word-level substitution table (`casa → magione`, `stupido → coatto di vacuità d'ingegno`, `veloce → con solerzia`, …), preserving capitalisation.
3. **Fills bilingual templates** for the three levels. Each intent has several variants per level; the phrase's hash picks the opening variant and *Rigenera* advances through the rest.

Engine code lives in `src/engine/` (`intents.ts`, `lexicon.ts`, `templates.ts`, `demo.ts`). The MiniMax client and system prompt shared by the Function and the tests live in `src/engine/llm.ts`; the wire contract in `src/engine/api.ts`.

**No secrets are committed to this repository** — `.env*`, `.dev.vars*` (except the `.example`) are git-ignored.

## Development

```bash
npm install
npm run dev          # http://localhost:5173 — UI only; /api/transmute is absent, so the app runs in demo mode
```

To exercise the Pages Function locally, copy `.dev.vars.example` to `.dev.vars`, fill in `MINIMAX_API_KEY`, then:

```bash
npm run dev:cf       # npm run build && wrangler pages dev  → http://127.0.0.1:8788 with the Function
```

Other scripts:

```bash
npm run build        # type-check (app + functions) + production build into ./dist
npm run preview      # serve ./dist locally (static only)
npm run typecheck    # tsc -b
npm run lint         # oxlint
npm test             # engine, MiniMax client and Pages Function tests (Node's built-in test runner)
```

Requires Node 22+ (the tests use `--experimental-strip-types`).

## Deploying to Cloudflare Pages

The SPA is served from `dist/`; the Function in `functions/` is bundled and deployed alongside it. `public/_routes.json` limits Function invocations to `/api/*`, and `public/_redirects` keeps deep links on `index.html`.

Remember to set the **`MINIMAX_API_KEY`** secret (see above) — without it the deployed site runs in demo mode.

### Git integration (recommended)

Connect the repository in the Cloudflare dashboard (*Workers & Pages → Create → Pages → Connect to Git*) with:

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | 22 (set `NODE_VERSION=22` in environment variables if needed) |

Every push to `main` then deploys automatically. Add `MINIMAX_API_KEY` (and optionally `MINIMAX_BASE_URL` / `MINIMAX_MODEL`) under *Settings → Variables and Secrets* as **Secrets** — they are runtime bindings for the Function, not build-time variables.

### Direct upload with Wrangler

`wrangler.jsonc` sets `pages_build_output_dir` to `./dist`, so a single command builds and uploads both the site and the Function:

```bash
npx wrangler login          # once
npm run deploy:cf           # npm run build && wrangler pages deploy
```

Or non-interactively with an API token that has *Cloudflare Pages: Edit*:

```bash
CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ACCOUNT_ID=… npm run deploy:cf
```

The first deploy creates the `nobiliare-translator` project (or run `npx wrangler pages project create nobiliare-translator --production-branch main` beforehand). The site is served at `https://nobiliare-translator.pages.dev`.

## Project layout

```
functions/
  api/transmute.ts  Cloudflare Pages Function: GET status, POST → MiniMax → Translation JSON
src/
  engine/        intent detection, lexicon, templates, demo engine, MiniMax client (llm.ts), API contract (api.ts), translate()
  components/    Header, DemoBanner, InputPanel, Results, ResultCard, HistoryPanel, Glossary, Footer
  components/ui/ shadcn/ui primitives (button, card, badge, textarea, separator, tooltip)
  hooks/         useHistory (localStorage), useCopy (clipboard)
  lib/           cn(), text formatting helpers
tests/           node:test suites: engine, MiniMax client, Pages Function + frontend client
public/          favicon, Cloudflare Pages _redirects and _routes.json
wrangler.jsonc   Cloudflare Pages configuration
.dev.vars.example  local secret names for `wrangler pages dev`
```

## License

MIT
