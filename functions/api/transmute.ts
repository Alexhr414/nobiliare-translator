/**
 * Cloudflare Pages Function: `/api/transmute`.
 *
 *   GET  → `LlmStatus`  (is MINIMAX_API_KEY configured, which model)
 *   POST → `Translation` for `{ input, variant? }`, produced by MiniMax
 *
 * The MiniMax key is read from the Pages project's encrypted env bindings
 * (`wrangler pages secret put MINIMAX_API_KEY`); it never reaches the browser.
 */

import {
  MAX_INPUT_LENGTH,
  MAX_VARIANT,
  type ApiError,
  type ApiErrorCode,
  type LlmStatus,
  type TransmuteRequest,
} from '../../src/engine/api.ts'
import { llmTranslate, resolveLlmConfig, type LlmEnv } from '../../src/engine/llm.ts'

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...headers } })
}

function fail(error: ApiErrorCode, message: string, status: number, headers?: Record<string, string>): Response {
  const body: ApiError = { error, message }
  return json(body, status, headers)
}

type ParsedBody = { ok: true; input: string; variant: number } | { ok: false; message: string }

async function parseBody(request: Request): Promise<ParsedBody> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return { ok: false, message: 'Body must be JSON: { "input": string, "variant"?: number }' }
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { ok: false, message: 'Body must be a JSON object' }
  }

  const { input, variant } = raw as Partial<Record<keyof TransmuteRequest, unknown>>
  if (typeof input !== 'string') return { ok: false, message: '"input" must be a string' }
  const trimmed = input.trim()
  if (!trimmed) return { ok: false, message: '"input" must not be empty' }
  if (trimmed.length > MAX_INPUT_LENGTH) {
    return { ok: false, message: `"input" must be at most ${MAX_INPUT_LENGTH} characters` }
  }

  let v = 0
  if (variant !== undefined) {
    if (typeof variant !== 'number' || !Number.isInteger(variant) || variant < 0 || variant > MAX_VARIANT) {
      return { ok: false, message: `"variant" must be an integer between 0 and ${MAX_VARIANT}` }
    }
    v = variant
  }
  return { ok: true, input: trimmed, variant: v }
}

export interface HandlerDeps {
  fetchImpl?: typeof fetch
  now?: number
}

/** Framework-free handler so the routing logic can be unit-tested without the Pages runtime. */
export async function handleTransmute(request: Request, env: LlmEnv, deps: HandlerDeps = {}): Promise<Response> {
  const config = resolveLlmConfig(env)

  if (request.method === 'GET' || request.method === 'HEAD') {
    const status: LlmStatus = { provider: 'minimax', configured: config !== null, model: config?.model ?? null }
    return json(status)
  }

  if (request.method !== 'POST') {
    return fail('invalid_request', 'Method not allowed', 405, { allow: 'GET, HEAD, POST' })
  }

  const parsed = await parseBody(request)
  if (!parsed.ok) return fail('invalid_request', parsed.message, 400)

  if (!config) {
    return fail(
      'llm_unconfigured',
      'MINIMAX_API_KEY is not configured on the server (wrangler pages secret put MINIMAX_API_KEY)',
      503,
    )
  }

  try {
    const translation = await llmTranslate(parsed.input, config, {
      variant: parsed.variant,
      signal: request.signal,
      fetchImpl: deps.fetchImpl,
      now: deps.now,
    })
    return json(translation)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return fail('llm_failed', message, 502)
  }
}

export const onRequest: PagesFunction<LlmEnv> = ({ request, env }) => handleTransmute(request, env)
