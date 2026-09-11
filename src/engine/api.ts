/** Wire contract between the SPA and the Pages Function at `/api/transmute`. */

import { LEVELS, type LlmProvider, type Translation } from './types.ts'

export const API_ENDPOINT = '/api/transmute'
export const MAX_INPUT_LENGTH = 600
export const MAX_VARIANT = 50
/** Upper bound for the JSON request body; the real payload is well under 2 KiB. */
export const MAX_BODY_BYTES = 16 * 1024

export interface TransmuteRequest {
  input: string
  variant?: number
}

/** Successful responses are the same `Translation` object the UI renders. */
export type TransmuteResponse = Translation

/**
 * `invalid_request`  400/405/413/415 — bad method, body, content type or size
 * `forbidden`        403 — cross-site browser request
 * `llm_unconfigured` 503 — no API key secret on the Pages project
 * `llm_failed`       502/504 — the model API errored, answered garbage, or timed out
 */
export type ApiErrorCode = 'invalid_request' | 'forbidden' | 'llm_unconfigured' | 'llm_failed'

export interface ApiError {
  error: ApiErrorCode
  message: string
}

/** `GET /api/transmute` — lets the UI say whether the live model is wired up, without exposing the key. */
export interface LlmStatus {
  provider: LlmProvider | null
  configured: boolean
  model: string | null
}

/** Badge label for a provider; OPENAI_* may point at any OpenAI-compatible service, hence the neutral name. */
export function providerLabel(provider: LlmProvider | null): string {
  return provider === 'minimax' ? 'MiniMax' : 'LLM'
}

export function isApiError(value: unknown): value is ApiError {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.error === 'string' && typeof v.message === 'string'
}

function hasRenderings(levels: unknown): boolean {
  if (typeof levels !== 'object' || levels === null) return false
  const l = levels as Record<string, unknown>
  return LEVELS.every((level) => {
    const r = l[level] as Record<string, unknown> | undefined
    return typeof r === 'object' && r !== null && typeof r.it === 'string' && typeof r.zh === 'string'
  })
}

export function isTranslation(value: unknown): value is Translation {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.input === 'string' &&
    typeof v.intent === 'string' &&
    hasRenderings(v.levels) &&
    (v.source === 'llm' || v.source === 'demo') &&
    typeof v.variant === 'number' &&
    typeof v.createdAt === 'number'
  )
}
