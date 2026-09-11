/**
 * MiniMax client shared by the Cloudflare Pages Function (`functions/api/transmute.ts`)
 * and the test-suite. It never runs in the browser: the API key lives server-side only.
 *
 * MiniMax exposes an OpenAI-compatible Chat Completions endpoint at
 * `https://api.minimax.io/v1/chat/completions` (international; mainland China uses
 * `https://api.minimaxi.com/v1`). Current chat model ids are `MiniMax-M3`,
 * `MiniMax-M2.7`, `MiniMax-M2.7-highspeed`, `MiniMax-M2.5`, … — all reasoning models.
 */

import { GLOSSARY } from './lexicon.ts'
import { INTENT_META, detectIntent } from './intents.ts'
import { hashString } from './demo.ts'
import { LEVELS, type Level, type LlmConfig, type Rendering, type Translation } from './types.ts'

export const DEFAULT_BASE_URL = 'https://api.minimax.io/v1'
export const DEFAULT_MODEL = 'MiniMax-M3'
const TIMEOUT_MS = 45_000
// The answer is ~150 tokens of JSON, but M2.x models cannot switch thinking off and
// the reasoning counts against this budget, so leave ample headroom.
const MAX_COMPLETION_TOKENS = 4096

export interface LlmEnv {
  MINIMAX_API_KEY?: string
  MINIMAX_BASE_URL?: string
  MINIMAX_MODEL?: string
}

/** Builds the client configuration from server-side env bindings; `null` when no key is set. */
export function resolveLlmConfig(env: LlmEnv): LlmConfig | null {
  const apiKey = env.MINIMAX_API_KEY?.trim()
  if (!apiKey) return null
  return {
    apiKey,
    baseUrl: (env.MINIMAX_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, ''),
    model: env.MINIMAX_MODEL?.trim() || DEFAULT_MODEL,
  }
}

export const SYSTEM_PROMPT = `Sei il Maestro di Cerimonie della casata di Rancido Stilnterra. Trasmuti qualsiasi frase nel registro nobiliare-aulico della casata, preservando SEMPRE l'intento originale (una lode resta lode, un insulto resta insulto, una domanda resta domanda).

Regola inviolabile: PARAFRASI, mai eco. Non ricopiare la frase dell'utente né racchiuderla tra virgolette: riscrivila daccapo con parole tue, in ciascun livello e in ciascuna lingua. La versione cinese è una trasmutazione autonoma, non una traduzione letterale dell'italiano.

Produci TRE livelli, ciascuno in italiano E in cinese (mandarino, caratteri semplificati, registro letterario/古雅):
1. "diretta": Versione Diretta/Volgare — il senso nudo, colloquiale, senza fronzoli, 1 frase.
2. "standard": Versione Nobiliare Standard — cortese, cerimoniale, uso del Voi/尊称, 1-2 frasi.
3. "spietata": Versione Nobiliare Spietata (Sarcasmo Aulico) — elegante in superficie, tagliente sotto; ironia di corte, 1-2 frasi.

Lessico della casata da usare con naturalezza (non tutto insieme): ${GLOSSARY.map((g) => `${g.term} (${g.zh})`).join(', ')}.

Rispondi SOLO con JSON valido, senza testo attorno, senza blocchi di codice, nel formato:
{"diretta":{"it":"...","zh":"..."},"standard":{"it":"...","zh":"..."},"spietata":{"it":"...","zh":"..."}}`

export function buildUserPrompt(input: string, variant: number): string {
  return variant > 0
    ? `Frase da trasmutare (proponi una variante diversa dalle precedenti, tentativo ${variant + 1}):\n${input}`
    : `Frase da trasmutare:\n${input}`
}

interface ChatCompletion {
  choices?: { message?: { content?: string | null }; finish_reason?: string }[]
  base_resp?: { status_code?: number; status_msg?: string }
  error?: { message?: string; type?: string }
}

/** Removes reasoning blocks that MiniMax M-series models may inline in `content`. */
export function stripThinking(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/^[\s\S]*?<\/think>/i, '')
    .trim()
}

export function extractJson(text: string): unknown {
  const cleaned = stripThinking(text)
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start === -1 || end <= start) throw new Error('Model response contained no JSON object')
    return JSON.parse(cleaned.slice(start, end + 1))
  }
}

function isRendering(value: unknown): value is Rendering {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.it === 'string' && v.it.trim() !== '' && typeof v.zh === 'string' && v.zh.trim() !== ''
}

export function parseLevels(payload: unknown): Record<Level, Rendering> {
  if (typeof payload !== 'object' || payload === null) throw new Error('Model response is not an object')
  const obj = payload as Record<string, unknown>
  const out = {} as Record<Level, Rendering>
  for (const level of LEVELS) {
    const r = obj[level]
    if (!isRendering(r)) throw new Error(`Model response is missing level "${level}"`)
    out[level] = { it: r.it.trim(), zh: r.zh.trim() }
  }
  return out
}

export interface LlmOptions {
  variant?: number
  signal?: AbortSignal
  fetchImpl?: typeof fetch
  now?: number
}

export async function llmTranslate(input: string, config: LlmConfig, options: LlmOptions = {}): Promise<Translation> {
  const trimmed = input.trim()
  const variant = options.variant ?? 0
  const now = options.now ?? Date.now()
  const doFetch = options.fetchImpl ?? fetch

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(new Error('MiniMax request timed out')), TIMEOUT_MS)
  options.signal?.addEventListener('abort', () => controller.abort(options.signal?.reason), { once: true })

  try {
    const res = await doFetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: config.model,
        temperature: variant === 0 ? 0.8 : 1.0,
        max_completion_tokens: MAX_COMPLETION_TOKENS,
        // Honoured by MiniMax-M3 (answers directly); M2.x models keep thinking on.
        thinking: { type: 'disabled' },
        // Keeps any reasoning out of `content` so the JSON answer is clean.
        reasoning_split: true,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(trimmed, variant) },
        ],
      }),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new Error(`MiniMax request failed (${res.status})${detail ? `: ${detail.slice(0, 200)}` : ''}`)
    }

    const data = (await res.json()) as ChatCompletion
    // MiniMax reports auth/quota/parameter errors with HTTP 200 and a non-zero base_resp.
    if (data.base_resp && data.base_resp.status_code && data.base_resp.status_code !== 0) {
      throw new Error(`MiniMax error ${data.base_resp.status_code}: ${data.base_resp.status_msg ?? 'unknown'}`)
    }
    if (data.error?.message) throw new Error(`MiniMax error: ${data.error.message}`)

    const content = data.choices?.[0]?.message?.content
    if (!content || !stripThinking(content)) throw new Error('MiniMax returned an empty completion')

    const intent = detectIntent(trimmed)
    return {
      id: `${now.toString(36)}-${hashString(trimmed + variant).toString(36)}`,
      input: trimmed,
      intent,
      intentLabel: INTENT_META[intent].label,
      levels: parseLevels(extractJson(content)),
      source: 'llm',
      model: config.model,
      variant,
      createdAt: now,
    }
  } finally {
    clearTimeout(timer)
  }
}
