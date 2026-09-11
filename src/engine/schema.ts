import { INTENT_META } from './intents.ts'
import { LEVELS, type Level, type Rendering, type Translation } from './types.ts'

/**
 * Pulls a JSON object out of a model completion, tolerating Markdown fences
 * and stray prose around the payload.
 */
export function extractJson(text: string): unknown {
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

export function isRendering(value: unknown): value is Rendering {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.it === 'string' && v.it.trim() !== '' && typeof v.zh === 'string' && v.zh.trim() !== ''
}

/** Validates the `{diretta, standard, spietata}` object the model must return. */
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

/** Validates a full `Translation` as received over the wire from `/api/transmute`. */
export function parseTranslation(payload: unknown): Translation {
  if (typeof payload !== 'object' || payload === null) throw new Error('Response is not an object')
  const obj = payload as Record<string, unknown>
  if (typeof obj.id !== 'string' || obj.id === '') throw new Error('Response is missing "id"')
  if (typeof obj.input !== 'string') throw new Error('Response is missing "input"')
  if (typeof obj.intent !== 'string' || !(obj.intent in INTENT_META)) throw new Error('Response has an unknown intent')
  if (obj.source !== 'demo' && obj.source !== 'llm') throw new Error('Response has an unknown source')
  if (typeof obj.variant !== 'number' || typeof obj.createdAt !== 'number') throw new Error('Response is missing metadata')
  const intent = obj.intent as Translation['intent']
  return {
    id: obj.id,
    input: obj.input,
    intent,
    intentLabel: INTENT_META[intent].label,
    levels: parseLevels(obj.levels),
    source: obj.source,
    model: typeof obj.model === 'string' ? obj.model : undefined,
    variant: obj.variant,
    createdAt: obj.createdAt,
  }
}
