/**
 * Cloudflare Pages Function: `/api/transmute`.
 *
 *   GET  → `LlmStatus`  (is an API key configured, which provider/model)
 *   POST → `Translation` for `{ input, variant? }`, produced by the LLM
 *
 * The API key is read from the Pages project's encrypted env bindings — set with
 * `wrangler pages secret put OPENAI_API_KEY` (or `MINIMAX_API_KEY`) — and never
 * reaches the browser. Optional: OPENAI_BASE_URL / OPENAI_MODEL (MINIMAX_BASE_URL /
 * MINIMAX_MODEL). This file is served same-origin with the SPA, so no CORS is needed.
 */

import {
  MAX_BODY_BYTES,
  MAX_INPUT_LENGTH,
  MAX_VARIANT,
  type ApiError,
  type ApiErrorCode,
  type LlmStatus,
  type TransmuteRequest,
} from '../../src/engine/api.ts'
import { PROVIDERS, PROVIDER_ORDER, UpstreamError, llmTranslate, resolveLlmConfig, type LlmEnv } from '../../src/engine/llm.ts'

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...headers } })
}

function fail(error: ApiErrorCode, message: string, status: number, headers?: Record<string, string>): Response {
  const body: ApiError = { error, message }
  return json(body, status, headers)
}

export const UNCONFIGURED_MESSAGE = `No LLM API key is configured on the server. Set ${PROVIDER_ORDER.map(
  (p) => PROVIDERS[p].keyName,
).join(' or ')} with \`wrangler pages secret put <NAME> --project-name nobiliare-translator\` and redeploy.`

type ParsedBody = { ok: true; input: string; variant: number } | { ok: false; message: string; status: number }

const invalid = (message: string, status = 400): ParsedBody => ({ ok: false, message, status })

async function parseBody(request: Request): Promise<ParsedBody> {
  const contentType = (request.headers.get('content-type') ?? '').trim()
  if (!/^application\/json\b/i.test(contentType)) {
    return invalid('Content-Type must be application/json', 415)
  }
  if (Number(request.headers.get('content-length') ?? '0') > MAX_BODY_BYTES) {
    return invalid(`Body must be at most ${MAX_BODY_BYTES} bytes`, 413)
  }

  let text: string
  try {
    text = await request.text()
  } catch {
    return invalid('Could not read the request body')
  }
  if (text.length > MAX_BODY_BYTES) return invalid(`Body must be at most ${MAX_BODY_BYTES} bytes`, 413)

  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return invalid('Body must be JSON: { "input": string, "variant"?: number }')
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return invalid('Body must be a JSON object')
  }

  const { input, variant } = raw as Partial<Record<keyof TransmuteRequest, unknown>>
  if (typeof input !== 'string') return invalid('"input" must be a string')
  const trimmed = input.trim()
  if (!trimmed) return invalid('"input" must not be empty')
  if (trimmed.length > MAX_INPUT_LENGTH) {
    return invalid(`"input" must be at most ${MAX_INPUT_LENGTH} characters`)
  }

  let v = 0
  if (variant !== undefined && variant !== null) {
    if (typeof variant !== 'number' || !Number.isInteger(variant) || variant < 0 || variant > MAX_VARIANT) {
      return invalid(`"variant" must be an integer between 0 and ${MAX_VARIANT}`)
    }
    v = variant
  }
  return { ok: true, input: trimmed, variant: v }
}

function isAbortError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'AbortError' || error.name === 'TimeoutError' || /timed out/i.test(error.message))
  )
}

export interface HandlerDeps {
  fetchImpl?: typeof fetch
  now?: number
  timeoutMs?: number
}

/** Framework-free handler so the routing logic can be unit-tested without the Pages runtime. */
export async function handleTransmute(request: Request, env: LlmEnv, deps: HandlerDeps = {}): Promise<Response> {
  const config = resolveLlmConfig(env)

  if (request.method === 'GET' || request.method === 'HEAD') {
    const status: LlmStatus = {
      provider: config?.provider ?? null,
      configured: config !== null,
      model: config?.model ?? null,
    }
    return json(status)
  }

  if (request.method !== 'POST') {
    return fail('invalid_request', 'Method not allowed', 405, { allow: 'GET, HEAD, POST' })
  }

  // Same-origin only: a page on another site must not be able to spend this
  // deployment's model quota through a visitor's browser. Non-browser clients
  // (curl, scripts) send no Sec-Fetch-Site header and are unaffected.
  if (request.headers.get('sec-fetch-site') === 'cross-site') {
    return fail('forbidden', 'Cross-site requests are not allowed', 403)
  }

  const parsed = await parseBody(request)
  if (!parsed.ok) return fail('invalid_request', parsed.message, parsed.status)

  if (!config) return fail('llm_unconfigured', UNCONFIGURED_MESSAGE, 503)

  try {
    const translation = await llmTranslate(parsed.input, config, {
      variant: parsed.variant,
      signal: request.signal,
      fetchImpl: deps.fetchImpl,
      now: deps.now,
      timeoutMs: deps.timeoutMs,
    })
    return json(translation)
  } catch (error) {
    if (error instanceof UpstreamError) {
      // Some providers quote the rejected credential in their error body.
      const message = error.message.split(config.apiKey).join('[redacted]')
      const hint =
        error.status === 401 || error.status === 403
          ? ` The model API rejected the server credentials: check the ${PROVIDERS[config.provider].keyName} secret (and ${PROVIDERS[config.provider].baseUrlName}).`
          : ''
      return fail('llm_failed', message + hint, 502)
    }
    if (isAbortError(error)) {
      return fail('llm_failed', 'The language model did not answer in time', 504)
    }
    const message = error instanceof Error ? error.message : String(error)
    return fail('llm_failed', message, 502)
  }
}

export const onRequest: PagesFunction<LlmEnv> = ({ request, env }) => handleTransmute(request, env)
