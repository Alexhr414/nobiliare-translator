/**
 * Browser client for the same-origin `/api/transmute` Pages Function. No API
 * key is involved here: the server holds it.
 */
import { parseTranslation } from './schema.ts'
import type { Translation } from './types.ts'

export const TRANSMUTE_ENDPOINT = '/api/transmute'
/** A little longer than the server's own upstream timeout so its error wins. */
export const CLIENT_TIMEOUT_MS = 40_000

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export interface ApiTranslateOptions {
  variant?: number
  signal?: AbortSignal
  fetchImpl?: typeof fetch
  endpoint?: string
  timeoutMs?: number
}

export async function apiTranslate(input: string, options: ApiTranslateOptions = {}): Promise<Translation> {
  const doFetch = options.fetchImpl ?? fetch
  const controller = new AbortController()
  const timer = setTimeout(
    () => controller.abort(new ApiError(0, 'client_timeout', 'Nessuna risposta dal server entro il tempo massimo')),
    options.timeoutMs ?? CLIENT_TIMEOUT_MS,
  )
  options.signal?.addEventListener('abort', () => controller.abort(options.signal?.reason), { once: true })

  try {
    let res: Response
    try {
      res = await doFetch(options.endpoint ?? TRANSMUTE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ input: input.trim(), variant: options.variant ?? 0 }),
      })
    } catch (error) {
      if (controller.signal.aborted) throw controller.signal.reason ?? error
      throw new ApiError(0, 'network_error', error instanceof Error ? error.message : String(error))
    }

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: unknown; message?: unknown } | null
      const code = typeof body?.error === 'string' ? body.error : 'http_error'
      const message = typeof body?.message === 'string' ? body.message : `HTTP ${res.status}`
      throw new ApiError(res.status, code, message)
    }

    let data: unknown
    try {
      data = await res.json()
    } catch {
      throw new ApiError(res.status, 'bad_response', 'The server returned a non-JSON answer')
    }
    try {
      return parseTranslation(data)
    } catch (error) {
      throw new ApiError(res.status, 'bad_response', error instanceof Error ? error.message : String(error))
    }
  } finally {
    clearTimeout(timer)
  }
}
