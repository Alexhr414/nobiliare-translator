# Nobiliare Translator

Italian ⇄ Chinese three-level (Nobiliare · Aulico) register translator.

Given a phrase in Italian or Chinese, the app returns the translation in three
registers of the target language:

- **Comune** — everyday, common speech
- **Nobiliare** — noble, refined speech
- **Aulico** — courtly, high-literary speech

## Stack

- **server** — Express + TypeScript API (`/api/translate`, `/api/phrasebook`, `/api/health`)
- **client** — React + TypeScript + Vite single-page UI

Both packages live in an npm workspaces monorepo.

## Getting started

```bash
npm install        # install all workspaces
npm run dev        # run API (:3001) and client (:5173) together
```

Then open http://localhost:5173.

Run the pieces individually if you prefer:

```bash
npm run dev:server   # Express API on :3001
npm run dev:client   # Vite dev server on :5173 (proxies /api → :3001)
```

## Other commands

```bash
npm run build            # type-check + build server and client
npm run typecheck        # type-check both workspaces
npm --workspace server run test   # run the translation-engine unit tests
```

## API

`POST /api/translate`

```json
{ "text": "Ciao", "from": "it", "to": "zh" }
```

returns

```json
{
  "input": "Ciao",
  "from": "it",
  "to": "zh",
  "matched": true,
  "conceptId": "greeting",
  "gloss": "hello / greeting",
  "translations": { "comune": "你好", "nobiliare": "您好", "aulico": "敬颂台安" }
}
```

`GET /api/phrasebook?lang=it` lists the curated phrases; `GET /api/health` is a
liveness probe.

## Cloud Agent environment

`.cursor/environment.json` installs dependencies with `npm install` and starts
the API and client as two long-running terminals on ports `3001` and `5173`.
