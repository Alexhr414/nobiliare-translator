import { API_ENDPOINT, isApiError, isTranslation, type ApiErrorCode, type LlmStatus, type TransmuteRequest } from './api.ts'
import { demoTranslate } from './demo.ts'
import type { Translation } from './types.ts'

export class ApiRequestError extends Error {
  readonly code: ApiErrorCode | 'network' | 'bad_response'
  readonly status: number | null

  constructor(code: ApiRequestError['code'], message: string, status: number | null = null) {
    super(message)
    this.name = 'ApiRequestError'
    this.code = code
    this.status = status
  }
}

/**
 * `api`  — default: every phrase goes to the same-origin `/api/transmute` Pages Function.
 * `demo` — offline template engine only, no network; opt in with `VITE_TRANSLATE_MODE=demo`
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
  /** Skip the live model and answer from the offline engine. */
  forceDemo?: boolean
  fetchImpl?: typeof fetch
}

export type FallbackKind = 'unconfigured' | 'failed'

export interface Fallback {
  kind: FallbackKind
  message: string
}

export interface TranslateResult {
  translation: Translation
  /** Set when the live model could not answer and the offline demo engine took over. */
  fallback?: Fallback
}

async function readJson(res: Response): Promise<unknown> {
  const type = res.headers.get('content-type') ?? ''
  if (!type.includes('application/json')) {
    throw new ApiRequestError('bad_response', `Unexpected ${res.status} response from ${API_ENDPOINT}`, res.status)
  }
  try {
    return await res.json()
  } catch {
    throw new ApiRequestError('bad_response', `Malformed JSON from ${API_ENDPOINT}`, res.status)
  }
}

/** Calls the Pages Function; throws `ApiRequestError` on any failure. */
export async function requestTransmute(
  input: string,
  variant: number,
  options: Pick<TranslateOptions, 'signal' | 'fetchImpl'> = {},
): Promise<Translation> {
  const doFetch = options.fetchImpl ?? fetch
  const body: TransmuteRequest = { input: input.trim(), variant }

  let res: Response
  try {
    res = await doFetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(body),
      signal: options.signal,
    })
  } catch (error) {
    if (options.signal?.aborted) throw error
    throw new ApiRequestError('network', error instanceof Error ? error.message : String(error))
  }

  const payload = await readJson(res)
  if (!res.ok) {
    if (isApiError(payload)) throw new ApiRequestError(payload.error, payload.message, res.status)
    throw new ApiRequestError('bad_response', `${API_ENDPOINT} answered ${res.status}`, res.status)
  }
  if (!isTranslation(payload)) throw new ApiRequestError('bad_response', 'Server returned an unexpected payload', res.status)
  return payload
}

export async function translate(input: string, options: TranslateOptions = {}): Promise<TranslateResult> {
  const variant = options.variant ?? 0
  if (options.forceDemo || translateMode === 'demo') return { translation: demoTranslate(input, { variant }) }

  try {
    const translation = await requestTransmute(input, variant, { signal: options.signal, fetchImpl: options.fetchImpl })
    return { translation }
  } catch (error) {
    if (options.signal?.aborted) throw error
    const message = error instanceof Error ? error.message : String(error)
    const kind: FallbackKind = error instanceof ApiRequestError && error.code === 'llm_unconfigured' ? 'unconfigured' : 'failed'
    return { translation: demoTranslate(input, { variant }), fallback: { kind, message } }
  }
}

export const OFFLINE_STATUS: LlmStatus = { provider: null, configured: false, model: null }

/** Asks the Pages Function whether a model is configured. Any failure (e.g. plain `vite dev`) reads as offline. */
export async function fetchLlmStatus(options: Pick<TranslateOptions, 'signal' | 'fetchImpl'> = {}): Promise<LlmStatus> {
  if (translateMode === 'demo') return OFFLINE_STATUS
  const doFetch = options.fetchImpl ?? fetch
  try {
    const res = await doFetch(API_ENDPOINT, { headers: { accept: 'application/json' }, signal: options.signal })
    if (!res.ok) return OFFLINE_STATUS
    const payload = (await readJson(res)) as Partial<LlmStatus>
    if (typeof payload.configured !== 'boolean') return OFFLINE_STATUS
    return {
      provider: payload.provider === 'openai' || payload.provider === 'minimax' ? payload.provider : null,
      configured: payload.configured,
      model: typeof payload.model === 'string' ? payload.model : null,
    }
  } catch (error) {
    if (options.signal?.aborted) throw error
    return OFFLINE_STATUS
  }
}
