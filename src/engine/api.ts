/** Wire contract between the SPA and the Pages Function at `POST /api/transmute`. */

import type { Translation } from './types.ts'

export const API_ENDPOINT = '/api/transmute'
export const MAX_INPUT_LENGTH = 600
export const MAX_VARIANT = 50

export interface TransmuteRequest {
  input: string
  variant?: number
}

/** Successful responses are the same `Translation` object the UI renders. */
export type TransmuteResponse = Translation

export type ApiErrorCode = 'invalid_request' | 'llm_unconfigured' | 'llm_failed'

export interface ApiError {
  error: ApiErrorCode
  message: string
}

/** `GET /api/transmute` — lets the UI say whether the live model is wired up, without exposing the key. */
export interface LlmStatus {
  provider: 'minimax'
  configured: boolean
  model: string | null
}

export function isApiError(value: unknown): value is ApiError {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.error === 'string' && typeof v.message === 'string'
}

export function isTranslation(value: unknown): value is Translation {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.input === 'string' &&
    typeof v.intent === 'string' &&
    typeof v.levels === 'object' &&
    v.levels !== null &&
    (v.source === 'llm' || v.source === 'demo') &&
    typeof v.variant === 'number' &&
    typeof v.createdAt === 'number'
  )
}
