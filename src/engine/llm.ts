import { GLOSSARY } from './lexicon.ts'
import { INTENT_META, detectIntent } from './intents.ts'
import { hashString } from './demo.ts'
import { LEVELS, type Level, type LlmConfig, type Rendering, type Translation } from './types.ts'

const DEFAULT_BASE_URL = 'https://api.openai.com/v1'
const DEFAULT_MODEL = 'gpt-4o-mini'
const TIMEOUT_MS = 30_000

/** Reads the optional LLM configuration from Vite env; `null` means demo mode. */
export function readLlmConfig(env: Record<string, string | undefined> = import.meta.env): LlmConfig | null {
  const apiKey = env.VITE_OPENAI_API_KEY?.trim()
  if (!apiKey) return null
  return {
    apiKey,
    baseUrl: (env.VITE_OPENAI_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, ''),
    model: env.VITE_OPENAI_MODEL?.trim() || DEFAULT_MODEL,
  }
}

const SYSTEM_PROMPT = `Sei il Maestro di Cerimonie della casata di Rancido Stilnterra. Trasmuti qualsiasi frase nel registro nobiliare-aulico della casata, preservando SEMPRE l'intento originale (una lode resta lode, un insulto resta insulto, una domanda resta domanda).

Produci TRE livelli, ciascuno in italiano E in cinese (mandarino, caratteri semplificati, registro letterario/古雅):
1. "diretta": Versione Diretta/Volgare — il senso nudo, colloquiale, senza fronzoli, 1 frase.
2. "standard": Versione Nobiliare Standard — cortese, cerimoniale, uso del Voi/尊称, 1-2 frasi.
3. "spietata": Versione Nobiliare Spietata (Sarcasmo Aulico) — elegante in superficie, tagliente sotto; ironia di corte, 1-2 frasi.

Lessico della casata da usare con naturalezza (non tutto insieme): ${GLOSSARY.map((g) => `${g.term} (${g.zh})`).join(', ')}.

Rispondi SOLO con JSON valido, senza testo attorno, nel formato:
{"diretta":{"it":"...","zh":"..."},"standard":{"it":"...","zh":"..."},"spietata":{"it":"...","zh":"..."}}`

interface ChatCompletion {
  choices?: { message?: { content?: string | null } }[]
}

function extractJson(text: string): unknown {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
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

function parseLevels(payload: unknown): Record<Level, Rendering> {
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
  const timer = setTimeout(() => controller.abort(new Error('LLM request timed out')), TIMEOUT_MS)
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
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content:
              variant > 0
                ? `Frase da trasmutare (proponi una variante diversa dalle precedenti, tentativo ${variant + 1}):\n${trimmed}`
                : `Frase da trasmutare:\n${trimmed}`,
          },
        ],
      }),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new Error(`LLM request failed (${res.status})${detail ? `: ${detail.slice(0, 200)}` : ''}`)
    }

    const data = (await res.json()) as ChatCompletion
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error('LLM returned an empty completion')

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
