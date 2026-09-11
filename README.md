# Nobiliare-Aulico Translator · 贵族雅言转化器

Converts any phrase into the noble register of the house of **Rancido Stilnterra**, in **Italian and Chinese**, across three levels of courtly refinement:

1. **Versione Diretta / Volgare** — the bare meaning, no gloves.
2. **Versione Nobiliare Standard** — the court register: the *Lei* form (*La, Le, Sua*), 阁下 / 尊贵之躯, ceremony, restraint.
3. **Versione Nobiliare Spietata (Sarcasmo Aulico)** — velvet on the surface, a blade underneath.

The original intent is always preserved: praise stays praise, an insult stays an insult, a question stays a question. The house lexicon runs through every noble rendering — *incedere, magione, augusta persona, nocumento, vacuità d'ingegno, coatto, protocollare, solerte, celestiale, velleità*.

A single-page app built with **Vite 8 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui**, styled as parchment and ink with EB Garamond and Noto Serif SC.

## Features

- Large input textarea with example chips; **Ctrl/⌘ + Enter** submits.
- **Trasmuta / 转化** produces three result cards, each with Italian and Chinese text.
- Copy per block (IT, ZH, or both) and **copy all** as plain text.
- **Rigenera** cycles through alternative renderings of the same phrase.
- History of the last 30 translations, persisted in `localStorage` (restore, remove, clear).
- Live translation by an **LLM** (any OpenAI-compatible API, or MiniMax) through a server-side Cloudflare Pages Function — the API key never reaches the browser.
- Loading state while the model composes; a red **API 失败，演示模式** banner with the error if the call fails (or a gold one if no key is configured), in which case the offline demo engine answers instead.
- Collapsible glossary of the house lexicon with Italian and Chinese meanings.
- Responsive layout; works on phones.

## How translation works

### Live mode: an LLM via a Pages Function (default)

Every phrase is sent to `POST /api/transmute`, a [Cloudflare Pages Function](https://developers.cloudflare.com/pages/functions/) in `functions/api/transmute.ts`, served from the same origin as the site (no CORS). The Function validates the request, calls an OpenAI-compatible Chat Completions endpoint with the house system prompt from `src/engine/llm.ts` (the *parafrasi, mai eco* rule — every level is a full paraphrase, never the user's sentence in a noble frame — the three registers, the lexicon and worked examples; strict JSON), and returns the same `Translation` object the UI renders. The browser bundle contains **no API key and no `VITE_*` secrets**.

```
POST /api/transmute      { "input": string, "variant"?: number }   → Translation JSON
GET  /api/transmute      → { "provider": "openai" | "minimax" | null, "configured": boolean, "model": string | null }
```

Error responses are JSON `{ "error": code, "message": string }`:

| Status | `error` | Meaning |
| --- | --- | --- |
| 400 | `invalid_request` | Malformed JSON, `input` missing/empty/over 600 characters, bad `variant` |
| 403 | `forbidden` | Cross-site browser request (`Sec-Fetch-Site: cross-site`) |
| 405 / 413 / 415 | `invalid_request` | Use `POST`; body ≤ 16 KiB; `Content-Type: application/json` |
| 502 | `llm_failed` | The model API errored or answered with unusable JSON (the key is redacted from any echoed error; 401/403 upstream add a hint to check the secret) |
| 503 | `llm_unconfigured` | No API key secret on the Pages project — the message names the secrets to set |
| 504 | `llm_failed` | No answer from the model within 45 s |

On any error the UI shows a banner — red **API 失败，演示模式** with the reason, or gold when the key is simply missing — and answers from the offline demo engine so the user still gets a result.

Try it from a shell against a deployment:

```bash
curl -sS https://nobiliare-translator.pages.dev/api/transmute            # status probe, no key exposed
curl -sS -X POST https://nobiliare-translator.pages.dev/api/transmute \
  -H 'Content-Type: application/json' -d '{"input":"Mi stai disturbando."}'
```

#### Secrets

Secrets are read from the Pages project's environment (server-side only). Two providers are supported; **`OPENAI_API_KEY` wins if both are set**.

| Secret | Required | Default | Purpose |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | yes (one of the two keys) | *(unset → try MiniMax, else demo mode)* | Bearer token for an OpenAI-compatible API |
| `OPENAI_BASE_URL` | no | `https://api.openai.com/v1` | Any OpenAI-compatible base URL (OpenAI, OpenRouter, Groq, a proxy, …) |
| `OPENAI_MODEL` | no | `gpt-4o-mini` | Model name |
| `MINIMAX_API_KEY` | alternative | *(unset)* | Bearer token for MiniMax, used when `OPENAI_API_KEY` is not set |
| `MINIMAX_BASE_URL` | no | `https://api.minimax.io/v1` | International endpoint by default; mainland China is `https://api.minimaxi.com/v1` |
| `MINIMAX_MODEL` | no | `MiniMax-M3` | Any MiniMax chat model id (`MiniMax-M3`, `MiniMax-M2.7`, `MiniMax-M2.7-highspeed`, `MiniMax-M2.5`, …) |

Set them once per Pages project, then redeploy so the Function picks them up:

```bash
npx wrangler login                                                   # once
npx wrangler pages secret put OPENAI_API_KEY  --project-name nobiliare-translator
npx wrangler pages secret put OPENAI_BASE_URL --project-name nobiliare-translator   # optional
npx wrangler pages secret put OPENAI_MODEL    --project-name nobiliare-translator   # optional
npm run deploy:cf                                                    # or push to main with Git integration
```

(For MiniMax, use `MINIMAX_API_KEY` / `MINIMAX_BASE_URL` / `MINIMAX_MODEL` instead.) Equivalently, in the Cloudflare dashboard: *Workers & Pages → nobiliare-translator → Settings → Variables and Secrets*, add them as **Secrets** for Production (and Preview if wanted), then trigger a new deployment. Verify with `npx wrangler pages secret list --project-name nobiliare-translator` or with the `GET /api/transmute` probe above: `"configured": false` means the secret is missing.

Implementation notes: for `openai` the request carries `response_format: { type: "json_object" }` and nothing vendor-specific (OpenAI rejects unknown parameters). MiniMax M-series models are reasoning models, so for `minimax` the Function instead sends `thinking: { type: "disabled" }` (honoured by MiniMax-M3; M2.x keep thinking on) and `reasoning_split: true`, and strips any inline `<think>…</think>` block before parsing the JSON; MiniMax reports auth/quota errors as HTTP 200 with a non-zero `base_resp.status_code`, which surface as `llm_failed`. Requests time out after 45 s.

### Offline demo engine (fallback)

Used when no key is set or the live call fails — or for every phrase when the client is built with `VITE_TRANSLATE_MODE=demo` (offline UI work without wrangler or secrets). No network, no keys. The engine:

1. **Splits off the addressee** (`Ale, …`, `老王，…`) so every level can speak to the person by name.
2. **Detects the intent** of the phrase (greeting, farewell, gratitude, apology, praise, insult, dismissal, disturbance, silence, refusal, agreement, disagreement, request, command, question, complaint, boredom, urgency, hunger, fatigue, affection, money, lateness, delay, threat, boast, or a generic statement). Italian, English and Chinese trigger words are recognised.
3. **Renders three hand-written paraphrases** in Italian and Chinese. Every level is a complete sentence in its own register — Volgare is blunt street talk, Standard is sincere court prose in the *Lei* form, Spietata is the same prose with the blade underneath — and none of them pastes the user's sentence into a noble shell. Each intent has at least three variants per level; the phrase's hash picks the opening variant and *Rigenera* advances through the rest.
4. For the few **content-carrying intents** (request, command, question, complaint, money, generic statement) the thing being asked or stated is embedded as a short topic slot, run through a colloquial lexicon for the blunt level and the noble lexicon (`casa → magione`, `domani → il dì venturo`, `stupido → coatto di vacuità d'ingegno`, …) for the noble levels, with courtesy markers ("per favore", "请") and exclamations ("che palle", "又来了") stripped so the template supplies them in the right register.

Engine code lives in `src/engine/` (`intents.ts`, `lexicon.ts`, `templates.ts`, `demo.ts`). The LLM client and system prompt shared by the Function and the tests live in `src/engine/llm.ts` (never imported by browser code); the wire contract in `src/engine/api.ts`.

**No secrets are committed to this repository** — `.env*`, `.dev.vars*` (except the `.example`) are git-ignored.

## Development

```bash
npm install
npm run dev          # http://localhost:5173 — hot-reloading UI; /api/* is proxied to :8788
```

To exercise the Pages Function locally, copy `.dev.vars.example` to `.dev.vars`, fill in `OPENAI_API_KEY` (or `MINIMAX_API_KEY`), then run the Function next to Vite:

```bash
npm run build        # wrangler pages dev serves ./dist, so it must exist once
npm run dev:api      # wrangler pages dev --port 8788 → Functions + .dev.vars
```

Keep `npm run dev` for the UI at :5173 (Vite forwards `/api/*` to :8788), or open http://127.0.0.1:8788 to use the production-like build directly. `npm run dev:cf` does the build and starts wrangler in one go. Without a running Function the UI shows the *API 失败，演示模式* banner and answers with the offline engine; to work fully offline without the banner, run `VITE_TRANSLATE_MODE=demo npm run dev` (see `.env.example`).

Other scripts:

```bash
npm run build        # type-check (app + functions) + production build into ./dist
npm run preview      # serve ./dist locally (static only, no Functions)
npm run typecheck    # tsc -b
npm run lint         # oxlint
npm test             # engine, LLM client and Pages Function tests (Node's built-in test runner)
```

Requires Node 22+ (the tests use `--experimental-strip-types`).

## Deploying to Cloudflare Pages

The SPA is served from `dist/`; the Function in `functions/` (TypeScript, including its imports from `src/engine/`) is bundled by Wrangler and deployed alongside it. `public/_routes.json` limits Function invocations to `/api/*`, and `public/_redirects` keeps deep links on `index.html`.

Remember to set the **`OPENAI_API_KEY`** secret (see above) — without it the deployed site answers `503 llm_unconfigured` and the UI runs in demo mode. Secrets are per project, not per deployment: set them once and every later deploy keeps them.

### Git integration (recommended)

Connect the repository in the Cloudflare dashboard (*Workers & Pages → Create → Pages → Connect to Git*) with:

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | 22 (set `NODE_VERSION=22` in environment variables if needed) |

Every push to `main` then deploys automatically. Add `OPENAI_API_KEY` (and optionally `OPENAI_BASE_URL` / `OPENAI_MODEL`, or the `MINIMAX_*` set) under *Settings → Variables and Secrets* as **Secrets** — they are runtime bindings for the Function, not build-time variables. Do not add any `VITE_*_API_KEY`: Vite would inline it into the public bundle.

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
  api/transmute.ts  Cloudflare Pages Function: GET status, POST → LLM → Translation JSON
src/
  engine/        intent detection, lexicon, templates, demo engine, LLM client + system prompt (llm.ts),
                 wire contract (api.ts), translate() with demo fallback
  components/    Header, DemoBanner, InputPanel, Results, ResultCard, HistoryPanel, Glossary, Footer
  components/ui/ shadcn/ui primitives (button, card, badge, textarea, separator, tooltip)
  hooks/         useHistory (localStorage), useCopy (clipboard)
  lib/           cn(), text formatting helpers
tests/           node:test suites: engine, LLM client, Pages Function + frontend client
public/          favicon, Cloudflare Pages _redirects and _routes.json
wrangler.jsonc   Cloudflare Pages configuration
tsconfig.functions.json  type-checks functions/ against @cloudflare/workers-types
.dev.vars.example  local secret names for `wrangler pages dev`
.env.example       client-only VITE_TRANSLATE_MODE switch (never keys)
```

## License

MIT
