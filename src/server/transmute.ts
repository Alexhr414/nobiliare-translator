/**
 * Server-side handler for `POST /api/transmute`, shared by the Cloudflare Pages
 * Function and the Node tests. It validates the request, calls the LLM with the
 * key from Cloudflare secrets and returns the same `Translation` shape the UI
 * renders. Runtime-agnostic: only Fetch API primitives are used.
 */
import { UpstreamError, llmTranslate, readLlmConfig, type LlmEnv } from '../engine/llm.ts'
import type { Translation } from '../engine/types.ts'

/** Mirrors the textarea limit in `InputPanel`. */
export const MAX_INPUT_LENGTH = 600
export const MAX_VARIANT = 50
export const MAX_BODY_BYTES = 16 * 1024

export type ApiErrorCode =
  | 'method_not_allowed'
  | 'forbidden'
  | 'unsupported_media_type'
  | 'payload_too_large'
  | 'invalid_json'
  | 'invalid_request'
  | 'llm_not_configured'
  | 'upstream_error'
  | 'bad_completion'
  | 'timeout'

export interface ApiErrorBody {
  error: ApiErrorCode
  message: string
}

export interface TransmuteRequest {
  input: string
  variant: number
}

export class RequestValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RequestValidationError'
  }
}

/** Validates and normalises the JSON body `{ input, variant? }`. */
export function parseTransmuteRequest(payload: unknown): TransmuteRequest {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    throw new RequestValidationError('Body must be a JSON object like {"input": "..."}')
  }
  const { input, variant } = payload as Record<string, unknown>

  if (typeof input !== 'string') throw new RequestValidationError('"input" must be a string')
  const trimmed = input.trim()
  if (trimmed === '') throw new RequestValidationError('"input" must not be empty')
  if (trimmed.length > MAX_INPUT_LENGTH) {
    throw new RequestValidationError(`"input" must be at most ${MAX_INPUT_LENGTH} characters`)
  }

  let v = 0
  if (variant !== undefined && variant !== null) {
    if (typeof variant !== 'number' || !Number.isInteger(variant) || variant < 0 || variant > MAX_VARIANT) {
      throw new RequestValidationError(`"variant" must be an integer between 0 and ${MAX_VARIANT}`)
    }
    v = variant
  }

  return { input: trimmed, variant: v }
}

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }

function jsonResponse(body: Translation | ApiErrorBody, status: number, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...extraHeaders } })
}

export function errorResponse(status: number, error: ApiErrorCode, message: string, extraHeaders?: Record<string, string>) {
  return jsonResponse({ error, message }, status, extraHeaders)
}

export const NOT_CONFIGURED_MESSAGE =
  'OPENAI_API_KEY is not set on the server. Run `wrangler pages secret put OPENAI_API_KEY` for the Pages project and redeploy.'

export interface HandlerDeps {
  fetchImpl?: typeof fetch
  now?: () => number
  timeoutMs?: number
}

function isAbortError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.name === 'AbortError' || error.name === 'TimeoutError' || /timed out/i.test(error.message)
  }
  return false
}

export async function handleTransmute(request: Request, env: LlmEnv, deps: HandlerDeps = {}): Promise<Response> {
  if (request.method !== 'POST') {
    return errorResponse(405, 'method_not_allowed', 'Use POST with a JSON body {"input": "..."}', { Allow: 'POST' })
  }

  // The endpoint is same-origin only: browsers on other sites must not be able
  // to spend this deployment's API quota. Non-browser clients send no header.
  if (request.headers.get('Sec-Fetch-Site') === 'cross-site') {
    return errorResponse(403, 'forbidden', 'Cross-site requests are not allowed')
  }

  const contentType = request.headers.get('Content-Type') ?? ''
  if (!/^application\/json\b/i.test(contentType.trim())) {
    return errorResponse(415, 'unsupported_media_type', 'Content-Type must be application/json')
  }

  const declaredLength = Number(request.headers.get('Content-Length') ?? '0')
  if (declaredLength > MAX_BODY_BYTES) {
    return errorResponse(413, 'payload_too_large', `Body must be at most ${MAX_BODY_BYTES} bytes`)
  }

  let raw: string
  try {
    raw = await request.text()
  } catch {
    return errorResponse(400, 'invalid_json', 'Could not read the request body')
  }
  if (raw.length > MAX_BODY_BYTES) {
    return errorResponse(413, 'payload_too_large', `Body must be at most ${MAX_BODY_BYTES} bytes`)
  }

  let payload: unknown
  try {
    payload = JSON.parse(raw)
  } catch {
    return errorResponse(400, 'invalid_json', 'Body is not valid JSON')
  }

  let req: TransmuteRequest
  try {
    req = parseTransmuteRequest(payload)
  } catch (error) {
    return errorResponse(400, 'invalid_request', error instanceof Error ? error.message : String(error))
  }

  const config = readLlmConfig(env)
  if (!config) {
    return errorResponse(503, 'llm_not_configured', NOT_CONFIGURED_MESSAGE)
  }

  try {
    const translation = await llmTranslate(req.input, config, {
      variant: req.variant,
      signal: request.signal,
      fetchImpl: deps.fetchImpl,
      now: deps.now?.(),
      timeoutMs: deps.timeoutMs,
    })
    return jsonResponse(translation, 200)
  } catch (error) {
    if (error instanceof UpstreamError) {
      // Upstream error bodies sometimes quote the credential they rejected.
      const message = error.message.split(config.apiKey).join('[redacted]')
      const hint =
        error.status === 401 || error.status === 403
          ? ' The model API rejected the server credentials: check the OPENAI_API_KEY secret (and OPENAI_BASE_URL).'
          : ''
      return errorResponse(502, 'upstream_error', message + hint)
    }
    if (isAbortError(error)) {
      return errorResponse(504, 'timeout', 'The language model did not answer in time')
    }
    const message = error instanceof Error ? error.message : String(error)
    return errorResponse(502, 'bad_completion', `The language model returned an unusable answer: ${message}`)
  }
}
