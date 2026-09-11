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
- Demo-mode banner when no LLM key is configured; a warning banner if the LLM call fails and the demo engine takes over.
- Collapsible glossary of the house lexicon with Italian and Chinese meanings.
- Responsive layout; works on phones.

## How translation works

### Offline demo engine (default)

No network, no keys. The engine:

1. **Detects the intent** of the phrase (greeting, farewell, gratitude, apology, praise, insult, dismissal, refusal, agreement, request, command, question, complaint, hunger, fatigue, affection, money, lateness, threat, boast, or a generic statement). Italian, English and Chinese trigger words are recognised.
2. **Ennobles the original wording** with a word-level substitution table (`casa → magione`, `stupido → coatto di vacuità d'ingegno`, `veloce → con solerzia`, …), preserving capitalisation.
3. **Fills bilingual templates** for the three levels. Each intent has several variants per level; the phrase's hash picks the opening variant and *Rigenera* advances through the rest.

Engine code lives in `src/engine/` (`intents.ts`, `lexicon.ts`, `templates.ts`, `demo.ts`).

### Optional LLM mode

If `VITE_OPENAI_API_KEY` is present at build time, phrases are sent to an OpenAI-compatible `chat/completions` endpoint with a system prompt describing the register, the three levels and the lexicon, requesting strict JSON. If the request fails (network, quota, malformed output, 30 s timeout) the app **falls back to the demo engine** and says so.

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_OPENAI_API_KEY` | *(unset → demo mode)* | Bearer token for the API |
| `VITE_OPENAI_BASE_URL` | `https://api.openai.com/v1` | Any OpenAI-compatible base URL (OpenRouter, Groq, Ollama, a proxy…) |
| `VITE_OPENAI_MODEL` | `gpt-4o-mini` | Model name |

Vite inlines `VITE_*` variables into the client bundle, so the key is visible to anyone with the built site. Use a proxy or a rate-limited key for public deployments. **No secrets are committed to this repository** — `.env*` files are git-ignored; see `.env.example`.

## Development

```bash
npm install
npm run dev          # http://localhost:5173
```

Other scripts:

```bash
npm run build        # type-check + production build into ./dist
npm run preview      # serve ./dist locally
npm run typecheck    # tsc -b
npm run lint         # oxlint
npm test             # engine unit tests (Node's built-in test runner)
```

Requires Node 22+ (the tests use `--experimental-strip-types`).

## Deploying to Cloudflare Pages

The site is a static SPA; `public/_redirects` routes every path to `index.html`.

### Git integration (recommended)

Connect the repository in the Cloudflare dashboard (*Workers & Pages → Create → Pages → Connect to Git*) with:

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | 22 (set `NODE_VERSION=22` in environment variables if needed) |

Add `VITE_OPENAI_API_KEY` (and optionally the base URL / model) as **build-time** environment variables in the Pages project if you want LLM mode. Every push to `main` then deploys automatically.

### Direct upload with Wrangler

`wrangler.jsonc` sets `pages_build_output_dir` to `./dist`, so a single command builds and uploads:

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
src/
  engine/        intent detection, lexicon, templates, demo + LLM engines
  components/    Header, DemoBanner, InputPanel, Results, ResultCard, HistoryPanel, Glossary, Footer
  components/ui/ shadcn/ui primitives (button, card, badge, textarea, separator, tooltip)
  hooks/         useHistory (localStorage), useCopy (clipboard)
  lib/           cn(), text formatting helpers
tests/           node:test suites for the engine
public/          favicon, Cloudflare Pages _redirects
wrangler.jsonc   Cloudflare Pages configuration
```

## License

MIT
