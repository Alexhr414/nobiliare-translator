import { ApiError, apiTranslate } from './api.ts'
import { demoTranslate } from './demo.ts'
import type { Translation } from './types.ts'

/**
 * `api`  — default: every phrase goes to the same-origin `/api/transmute`
 *          Pages Function, which calls the LLM with the server-side key.
 * `demo` — offline template engine only; opt in with `VITE_TRANSLATE_MODE=demo`
 *          for development without a Cloudflare dev server or secrets.
 */
export type TranslateMode = 'api' | 'demo'

export function readTranslateMode(env: Record<string, string | undefined> | undefined): TranslateMode {
  return env?.VITE_TRANSLATE_MODE?.trim().toLowerCase() === 'demo' ? 'demo' : 'api'
}

export const translateMode: TranslateMode = readTranslateMode(import.meta.env)

export interface TranslateOptions {
  variant?: number
  signal?: AbortSignal
  /** Skip the API even in `api` mode. */
  forceDemo?: boolean
}

export interface TranslateResult {
  translation: Translation
  /** Set when the API call failed and the demo engine took over. */
  fallbackReason?: string
}

export function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.status > 0 ? `${error.message} (HTTP ${error.status} · ${error.code})` : `${error.message} (${error.code})`
  }
  return error instanceof Error ? error.message : String(error)
}

export async function translate(input: string, options: TranslateOptions = {}): Promise<TranslateResult> {
  const variant = options.variant ?? 0
  if (translateMode === 'demo' || options.forceDemo) {
    return { translation: demoTranslate(input, { variant }) }
  }
  try {
    const translation = await apiTranslate(input, { variant, signal: options.signal })
    return { translation }
  } catch (error) {
    if (options.signal?.aborted) throw error
    return { translation: demoTranslate(input, { variant }), fallbackReason: describeError(error) }
  }
}
