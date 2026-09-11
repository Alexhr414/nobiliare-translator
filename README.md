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
- Every phrase is translated by an LLM through the same-origin `POST /api/transmute` Pages Function; the browser never sees an API key.
- Clear loading state while the model writes; a red **API 失败，演示模式** banner with the error if the API fails and the offline demo engine takes over.
- Collapsible glossary of the house lexicon with Italian and Chinese meanings.
- Responsive layout; works on phones.

## How translation works

### LLM mode (default): `POST /api/transmute`

The browser sends `{ "input": "…", "variant": 0 }` to `/api/transmute`, a **Cloudflare Pages Function** (`functions/api/transmute.ts`) served from the same origin as the site. The Function:

1. validates the request (JSON object, non-empty `input` ≤ 600 characters, optional integer `variant`; rejects cross-site browser requests, non-JSON bodies and oversized payloads);
2. reads `OPENAI_API_KEY`, `OPENAI_BASE_URL` and `OPENAI_MODEL` from the Pages project's **secrets/variables** — never from the client bundle;
3. calls the OpenAI-compatible `/v1/chat/completions` endpoint with the house system prompt from `src/engine/llm.ts` (the register, the three levels, the lexicon, the *parafrasi, mai eco* rule, golden few-shots) and `response_format: json_object`;
4. parses and validates the three IT+ZH levels and returns the same `Translation` JSON the UI renders (`id`, `input`, `intent`, `levels`, `source: "llm"`, `model`, `variant`, `createdAt`).

Error responses are JSON `{ "error": code, "message": … }`:

| Status | `error` | Meaning |
| --- | --- | --- |
| 400 | `invalid_json`, `invalid_request` | Malformed body / bad `input` or `variant` |
| 403 | `forbidden` | Cross-site browser request |
| 405 / 413 / 415 | `method_not_allowed`, `payload_too_large`, `unsupported_media_type` | Use `POST`, ≤ 16 KiB, `Content-Type: application/json` |
| 502 | `upstream_error`, `bad_completion` | The model API failed or answered with unusable JSON |
| 503 | `llm_not_configured` | `OPENAI_API_KEY` is not set on the Pages project |
| 504 | `timeout` | No answer from the model within 30 s |

When the API fails for any reason, the UI shows the error in a red banner (**API 失败，演示模式**) and renders the phrase with the offline demo engine so the user still gets an answer.

Try it from a shell against a deployment:

```bash
curl -sS -X POST https://nobiliare-translator.pages.dev/api/transmute \
  -H 'Content-Type: application/json' \
  -d '{"input":"Mi stai disturbando."}'
```

### Offline demo engine (fallback)

Used only when the API fails, or for every phrase when the client is built with `VITE_TRANSLATE_MODE=demo` (offline development without secrets). No network, no keys. The engine:

1. **Splits off the addressee** (`Ale, …`, `老王，…`) so every level can speak to the person by name.
2. **Detects the intent** of the phrase (greeting, farewell, gratitude, apology, praise, insult, dismissal, disturbance, silence, refusal, agreement, disagreement, request, command, question, complaint, boredom, urgency, hunger, fatigue, affection, money, lateness, delay, threat, boast, or a generic statement). Italian, English and Chinese trigger words are recognised.
3. **Renders three hand-written paraphrases** in Italian and Chinese. Every level is a complete sentence in its own register — Volgare is blunt street talk, Standard is sincere court prose in the *Lei* form, Spietata is the same prose with the blade underneath — and none of them pastes the user's sentence into a noble shell. Each intent has at least three variants per level; the phrase's hash picks the opening variant and *Rigenera* advances through the rest.
4. For the few **content-carrying intents** (request, command, question, complaint, money, generic statement) the thing being asked or stated is embedded as a short topic slot, run through a colloquial lexicon for the blunt level and the noble lexicon (`casa → magione`, `domani → il dì venturo`, `stupido → coatto di vacuità d'ingegno`, …) for the noble levels, with courtesy markers ("per favore", "请") and exclamations ("che palle", "又来了") stripped so the template supplies them in the right register.

Engine code lives in `src/engine/` (`intents.ts`, `lexicon.ts`, `templates.ts`, `demo.ts`).

## Configuration & secrets

The API key is read **only on the server** (the Pages Function). Nothing sensitive goes through `VITE_*` variables or the client bundle.

| Name | Where | Default | Purpose |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | Pages **secret** | *(required — 503 `llm_not_configured` without it)* | Bearer token for the model API |
| `OPENAI_BASE_URL` | Pages secret or variable | `https://api.openai.com/v1` | Any OpenAI-compatible base URL (OpenRouter, Groq, Ollama behind a tunnel, a proxy…) |
| `OPENAI_MODEL` | Pages secret or variable | `gpt-4o-mini` | Model name |
| `VITE_TRANSLATE_MODE` | client build env | *(unset → API mode)* | `demo` forces the offline engine; for local development only |

Set the production secrets once for the Pages project, then redeploy so the Function picks them up:

```bash
npx wrangler pages secret put OPENAI_API_KEY --project-name nobiliare-translator
# optional
npx wrangler pages secret put OPENAI_BASE_URL --project-name nobiliare-translator
npx wrangler pages secret put OPENAI_MODEL --project-name nobiliare-translator
npm run deploy:cf
```

(Equivalent: *Workers & Pages → nobiliare-translator → Settings → Variables and Secrets*, type **Secret**, for the Production environment; then trigger a new deployment.) Verify with `npx wrangler pages secret list --project-name nobiliare-translator`, or `curl` the endpoint as shown above — a 503 means the secret is missing, a 502 mentioning 401 means the key was rejected upstream.

**No secrets are committed to this repository** — `.env*`, `.dev.vars` and `.wrangler/` are git-ignored; see `.env.example` and `.dev.vars.example`.

## Development

```bash
npm install
npm run dev          # http://localhost:5173 — SPA only; /api/* is proxied to :8788
```

To exercise the real LLM path locally, put your key in `.dev.vars` (copy `.dev.vars.example`) and run the Pages Function next to Vite:

```bash
npm run build        # wrangler pages dev serves ./dist, so it must exist once
npm run dev:api      # wrangler pages dev --port 8788 (Functions + .dev.vars)
```

Keep `npm run dev` for the hot-reloading UI at :5173 (Vite forwards `/api/*` to :8788), or open http://localhost:8788 to use the production-like build directly. `npm run dev:cf` does the build and starts wrangler in one go. Without a running Function the UI shows the *API 失败，演示模式* banner and answers with the offline engine; to develop fully offline without the banner, run `VITE_TRANSLATE_MODE=demo npm run dev`.

Other scripts:

```bash
npm run build        # type-check (app + functions) + production build into ./dist
npm run preview      # serve ./dist locally (static only, no Functions)
npm run typecheck    # tsc -b
npm run lint         # oxlint
npm test             # engine + API function unit tests (Node's built-in test runner)
```

Requires Node 22+ (the tests use `--experimental-strip-types`).

## Deploying to Cloudflare Pages

The site is a static SPA plus one Pages Function. `public/_redirects` routes every non-API path to `index.html`; `public/_routes.json` limits Function invocations to `/api/*` so static assets are served directly from the edge. Wrangler bundles `functions/` (TypeScript, including its imports from `src/engine/`) automatically on deploy.

### Git integration (recommended)

Connect the repository in the Cloudflare dashboard (*Workers & Pages → Create → Pages → Connect to Git*) with:

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | 22 (set `NODE_VERSION=22` in environment variables if needed) |

Add `OPENAI_API_KEY` (and optionally `OPENAI_BASE_URL` / `OPENAI_MODEL`) as **secrets** in the project's Production environment (see above). Every push to `main` then deploys automatically. Do not add `VITE_OPENAI_*` build variables: they no longer exist and would be public.

### Direct upload with Wrangler

`wrangler.jsonc` sets `pages_build_output_dir` to `./dist`, so a single command builds and uploads the site together with the Function:

```bash
npx wrangler login          # once
npm run deploy:cf           # npm run build && wrangler pages deploy
```

Or non-interactively with an API token that has *Cloudflare Pages: Edit*:

```bash
CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ACCOUNT_ID=… npm run deploy:cf
```

The first deploy creates the `nobiliare-translator` project (or run `npx wrangler pages project create nobiliare-translator --production-branch main` beforehand). The site is served at `https://nobiliare-translator.pages.dev`. Secrets are per project, not per deployment: set them once with `wrangler pages secret put` and every later deploy keeps them.

## Project layout

```
functions/
  api/transmute.ts   Cloudflare Pages Function: POST /api/transmute (thin adapter)
src/
  server/            handleTransmute(): request validation, LLM call, error mapping (runtime-agnostic)
  engine/            intent detection, lexicon, templates, demo engine, schema guards,
                     llm.ts (server-side OpenAI client + system prompt), api.ts (browser client)
  components/        Header, DemoBanner, InputPanel, Results, ResultCard, HistoryPanel, Glossary, Footer
  components/ui/     shadcn/ui primitives (button, card, badge, textarea, separator, tooltip)
  hooks/             useHistory (localStorage), useCopy (clipboard)
  lib/               cn(), text formatting helpers
tests/               node:test suites for the engine and the API function
public/              favicon, Cloudflare Pages _redirects and _routes.json
wrangler.jsonc       Cloudflare Pages configuration
tsconfig.functions.json  type-checks functions/ against @cloudflare/workers-types
```

## License

MIT
