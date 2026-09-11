import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ApiError, apiTranslate } from '../src/engine/api.ts'
import {
  DEFAULT_MODEL,
  SYSTEM_PROMPT,
  UpstreamError,
  buildChatRequest,
  completionToTranslation,
  llmTranslate,
  readLlmConfig,
} from '../src/engine/llm.ts'
import { extractJson, parseLevels, parseTranslation } from '../src/engine/schema.ts'
import { readTranslateMode } from '../src/engine/translate.ts'
import { LEVELS } from '../src/engine/types.ts'
import {
  MAX_INPUT_LENGTH,
  MAX_VARIANT,
  NOT_CONFIGURED_MESSAGE,
  RequestValidationError,
  handleTransmute,
  parseTransmuteRequest,
} from '../src/server/transmute.ts'

const LEVELS_JSON = {
  diretta: { it: 'Levati di torno.', zh: '滚一边去。' },
  standard: { it: 'La prego di non arrecare ulteriore nocumento alla mia quiete.', zh: '恳请阁下勿再对我的清静施加更多损害。' },
  spietata: { it: 'Sarei lieto di bearmi della Sua assenza.', zh: '若能沉醉于阁下的缺席，我将感到无限欣慰。' },
}

const ENV = { OPENAI_API_KEY: 'sk-test-secret', OPENAI_MODEL: 'test-model' }

function completion(content: string, status = 200): Response {
  return new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

interface Captured {
  url: string
  init: RequestInit
}

/** Fake upstream: records the outgoing request and returns the queued response. */
function fakeFetch(respond: (captured: Captured) => Response | Promise<Response>, log: Captured[] = []) {
  const impl: typeof fetch = async (url, init) => {
    const captured = { url: String(url), init: init ?? {} }
    log.push(captured)
    return respond(captured)
  }
  return { impl, log }
}

function post(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request('https://example.test/api/transmute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

describe('readLlmConfig', () => {
  it('returns null without a key', () => {
    assert.equal(readLlmConfig({}), null)
    assert.equal(readLlmConfig({ OPENAI_API_KEY: '   ' }), null)
  })
  it('applies defaults and trims trailing slashes', () => {
    assert.deepEqual(readLlmConfig({ OPENAI_API_KEY: 'k' }), {
      apiKey: 'k',
      baseUrl: 'https://api.openai.com/v1',
      model: DEFAULT_MODEL,
    })
    assert.deepEqual(readLlmConfig({ OPENAI_API_KEY: 'k', OPENAI_BASE_URL: 'https://proxy.test/v1/// ', OPENAI_MODEL: ' m ' }), {
      apiKey: 'k',
      baseUrl: 'https://proxy.test/v1',
      model: 'm',
    })
  })
})

describe('buildChatRequest', () => {
  it('uses the house system prompt and requests JSON', () => {
    const body = buildChatRequest('Mi stai disturbando.', 'm', 0)
    assert.equal(body.model, 'm')
    assert.deepEqual(body.response_format, { type: 'json_object' })
    assert.equal(body.messages[0]?.role, 'system')
    assert.equal(body.messages[0]?.content, SYSTEM_PROMPT)
    assert.match(SYSTEM_PROMPT, /PARAFRASI, MAI ECO/)
    assert.match(body.messages[1]?.content ?? '', /Mi stai disturbando\./)
    assert.equal(body.temperature, 0.8)
  })
  it('asks for a different variant on regenerate', () => {
    const body = buildChatRequest('Ciao', 'm', 2)
    assert.match(body.messages[1]?.content ?? '', /variante diversa.*tentativo 3/)
    assert.equal(body.temperature, 1.0)
  })
})

describe('extractJson', () => {
  it('parses plain JSON', () => {
    assert.deepEqual(extractJson('{"a":1}'), { a: 1 })
  })
  it('strips Markdown fences', () => {
    assert.deepEqual(extractJson('```json\n{"a":1}\n```'), { a: 1 })
    assert.deepEqual(extractJson('```\n{"a":1}\n```'), { a: 1 })
  })
  it('tolerates prose around the object', () => {
    assert.deepEqual(extractJson('Ecco il risultato:\n{"a":{"b":2}}\nSpero vada bene.'), { a: { b: 2 } })
  })
  it('throws when there is no object', () => {
    assert.throws(() => extractJson('nessun json qui'), /no JSON object/)
  })
})

describe('parseLevels', () => {
  it('accepts a complete payload and trims whitespace', () => {
    const levels = parseLevels({ ...LEVELS_JSON, diretta: { it: '  Levati.  ', zh: ' 滚。 ' } })
    assert.equal(levels.diretta.it, 'Levati.')
    assert.equal(levels.diretta.zh, '滚。')
    for (const level of LEVELS) assert.ok(levels[level].it && levels[level].zh)
  })
  it('rejects missing or empty levels', () => {
    assert.throws(() => parseLevels({ diretta: LEVELS_JSON.diretta }), /missing level "standard"/)
    assert.throws(() => parseLevels({ ...LEVELS_JSON, spietata: { it: 'x', zh: '' } }), /missing level "spietata"/)
    assert.throws(() => parseLevels(null), /not an object/)
    assert.throws(() => parseLevels('str'), /not an object/)
  })
})

describe('completionToTranslation', () => {
  it('builds a full Translation from the model text', () => {
    const t = completionToTranslation(JSON.stringify(LEVELS_JSON), {
      input: 'Mi stai disturbando.',
      model: 'm',
      variant: 1,
      now: 1000,
    })
    assert.equal(t.source, 'llm')
    assert.equal(t.model, 'm')
    assert.equal(t.variant, 1)
    assert.equal(t.createdAt, 1000)
    assert.equal(t.intent, 'disturbance')
    assert.deepEqual(t.levels, LEVELS_JSON)
    assert.deepEqual(parseTranslation(JSON.parse(JSON.stringify(t))), t)
  })
})

describe('parseTranslation', () => {
  it('rejects malformed wire payloads', () => {
    assert.throws(() => parseTranslation(null), /not an object/)
    assert.throws(() => parseTranslation({ id: 'x' }), /missing "input"/)
    assert.throws(() => parseTranslation({ id: 'x', input: 'y', intent: 'nope' }), /unknown intent/)
    assert.throws(
      () => parseTranslation({ id: 'x', input: 'y', intent: 'praise', source: 'llm', variant: 0, createdAt: 1, levels: {} }),
      /missing level/,
    )
  })
})

describe('llmTranslate', () => {
  it('sends the bearer token to the configured base URL', async () => {
    const { impl, log } = fakeFetch(() => completion(JSON.stringify(LEVELS_JSON)))
    const config = { apiKey: 'sk-x', baseUrl: 'https://proxy.test/v1', model: 'm' }
    const t = await llmTranslate('Mi stai disturbando.', config, { fetchImpl: impl, now: 5 })
    const upstream = log[0]!
    assert.equal(upstream.url, 'https://proxy.test/v1/chat/completions')
    assert.equal((upstream.init.headers as Record<string, string>).Authorization, 'Bearer sk-x')
    assert.equal(t.source, 'llm')
    assert.equal(t.createdAt, 5)
  })
  it('raises UpstreamError on non-2xx', async () => {
    const { impl } = fakeFetch(() => new Response('{"error":"quota"}', { status: 429 }))
    await assert.rejects(
      llmTranslate('Ciao', { apiKey: 'k', baseUrl: 'https://x.test/v1', model: 'm' }, { fetchImpl: impl }),
      (e: unknown) => e instanceof UpstreamError && e.status === 429 && /quota/.test(e.message),
    )
  })
  it('aborts on timeout', async () => {
    const { impl } = fakeFetch(
      ({ init }) =>
        new Promise<Response>((_, reject) => {
          init.signal?.addEventListener('abort', () => reject(init.signal?.reason))
        }),
    )
    await assert.rejects(
      llmTranslate('Ciao', { apiKey: 'k', baseUrl: 'https://x.test/v1', model: 'm' }, { fetchImpl: impl, timeoutMs: 5 }),
      /timed out/,
    )
  })
})

describe('parseTransmuteRequest', () => {
  it('normalises a valid body', () => {
    assert.deepEqual(parseTransmuteRequest({ input: '  Ho fame  ' }), { input: 'Ho fame', variant: 0 })
    assert.deepEqual(parseTransmuteRequest({ input: 'Ho fame', variant: 3 }), { input: 'Ho fame', variant: 3 })
    assert.deepEqual(parseTransmuteRequest({ input: 'Ho fame', variant: null }), { input: 'Ho fame', variant: 0 })
  })
  it('rejects invalid bodies', () => {
    for (const bad of [null, 'str', [], 42, {}, { input: 7 }, { input: '' }, { input: '   ' }]) {
      assert.throws(() => parseTransmuteRequest(bad), RequestValidationError, JSON.stringify(bad))
    }
    assert.throws(() => parseTransmuteRequest({ input: 'a'.repeat(MAX_INPUT_LENGTH + 1) }), /at most/)
    assert.doesNotThrow(() => parseTransmuteRequest({ input: 'a'.repeat(MAX_INPUT_LENGTH) }))
  })
  it('rejects invalid variants', () => {
    for (const variant of [-1, 1.5, '2', MAX_VARIANT + 1, Number.NaN]) {
      assert.throws(() => parseTransmuteRequest({ input: 'x', variant }), /"variant"/, String(variant))
    }
  })
})

describe('handleTransmute', () => {
  const readJson = async (res: Response) => (await res.json()) as Record<string, unknown>

  it('rejects non-POST methods', async () => {
    const res = await handleTransmute(new Request('https://example.test/api/transmute'), ENV)
    assert.equal(res.status, 405)
    assert.equal(res.headers.get('Allow'), 'POST')
    assert.equal((await readJson(res)).error, 'method_not_allowed')
  })

  it('rejects cross-site browser requests', async () => {
    const res = await handleTransmute(post({ input: 'Ciao' }, { 'Sec-Fetch-Site': 'cross-site' }), ENV)
    assert.equal(res.status, 403)
  })

  it('requires a JSON content type', async () => {
    const req = new Request('https://example.test/api/transmute', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'Ciao',
    })
    const res = await handleTransmute(req, ENV)
    assert.equal(res.status, 415)
  })

  it('rejects malformed JSON and invalid payloads', async () => {
    assert.equal((await handleTransmute(post('{not json'), ENV)).status, 400)
    const res = await handleTransmute(post({ input: '' }), ENV)
    assert.equal(res.status, 400)
    const body = await readJson(res)
    assert.equal(body.error, 'invalid_request')
    assert.match(String(body.message), /must not be empty/)
  })

  it('rejects oversized bodies', async () => {
    const res = await handleTransmute(post({ input: 'x', pad: 'p'.repeat(20_000) }), ENV)
    assert.equal(res.status, 413)
  })

  it('answers 503 with setup instructions when no key is configured', async () => {
    const { impl, log } = fakeFetch(() => completion('{}'))
    const res = await handleTransmute(post({ input: 'Ciao' }), {}, { fetchImpl: impl })
    assert.equal(res.status, 503)
    const body = await readJson(res)
    assert.equal(body.error, 'llm_not_configured')
    assert.equal(body.message, NOT_CONFIGURED_MESSAGE)
    assert.match(String(body.message), /wrangler pages secret put OPENAI_API_KEY/)
    assert.equal(log.length, 0, 'must not call upstream without a key')
  })

  it('proxies a valid request and returns the Translation shape', async () => {
    const { impl, log } = fakeFetch(() => completion('```json\n' + JSON.stringify(LEVELS_JSON) + '\n```'))
    const res = await handleTransmute(post({ input: ' Mi stai disturbando. ', variant: 1 }), ENV, {
      fetchImpl: impl,
      now: () => 4242,
    })
    assert.equal(res.status, 200)
    assert.match(res.headers.get('Content-Type') ?? '', /application\/json/)
    assert.equal(res.headers.get('Cache-Control'), 'no-store')

    const t = parseTranslation(await res.json())
    assert.equal(t.input, 'Mi stai disturbando.')
    assert.equal(t.variant, 1)
    assert.equal(t.source, 'llm')
    assert.equal(t.model, 'test-model')
    assert.equal(t.createdAt, 4242)
    assert.equal(t.intent, 'disturbance')
    assert.deepEqual(t.levels, LEVELS_JSON)

    const upstream = log[0]!
    assert.equal(upstream.url, 'https://api.openai.com/v1/chat/completions')
    assert.equal((upstream.init.headers as Record<string, string>).Authorization, `Bearer ${ENV.OPENAI_API_KEY}`)
    const sent = JSON.parse(String(upstream.init.body)) as ReturnType<typeof buildChatRequest>
    assert.equal(sent.model, 'test-model')
    assert.equal(sent.messages[0]?.content, SYSTEM_PROMPT)
  })

  it('never leaks the API key in responses', async () => {
    const { impl } = fakeFetch(() => new Response('Incorrect API key provided: sk-test-secret', { status: 401 }))
    const res = await handleTransmute(post({ input: 'Ciao' }), ENV, { fetchImpl: impl })
    assert.equal(res.status, 502)
    const body = await readJson(res)
    assert.equal(body.error, 'upstream_error')
    assert.match(String(body.message), /401/)
    assert.match(String(body.message), /\[redacted\]/)
    assert.match(String(body.message), /check the OPENAI_API_KEY secret/)
    assert.doesNotMatch(JSON.stringify(body), /sk-test-secret/)
  })

  it('maps upstream failures and unusable completions to 502', async () => {
    const quota = fakeFetch(() => new Response('rate limited', { status: 429 }))
    const r1 = await handleTransmute(post({ input: 'Ciao' }), ENV, { fetchImpl: quota.impl })
    assert.equal(r1.status, 502)
    assert.equal((await readJson(r1)).error, 'upstream_error')

    const garbage = fakeFetch(() => completion('Non posso rispondere in JSON.'))
    const r2 = await handleTransmute(post({ input: 'Ciao' }), ENV, { fetchImpl: garbage.impl })
    assert.equal(r2.status, 502)
    assert.equal((await readJson(r2)).error, 'bad_completion')

    const partial = fakeFetch(() => completion(JSON.stringify({ diretta: LEVELS_JSON.diretta })))
    const r3 = await handleTransmute(post({ input: 'Ciao' }), ENV, { fetchImpl: partial.impl })
    assert.equal(r3.status, 502)
    assert.match(String((await readJson(r3)).message), /missing level "standard"/)
  })

  it('maps upstream timeouts to 504', async () => {
    const { impl } = fakeFetch(
      ({ init }) =>
        new Promise<Response>((_, reject) => {
          init.signal?.addEventListener('abort', () => reject(init.signal?.reason))
        }),
    )
    const res = await handleTransmute(post({ input: 'Ciao' }), ENV, { fetchImpl: impl, timeoutMs: 5 })
    assert.equal(res.status, 504)
    assert.equal((await readJson(res)).error, 'timeout')
  })
})

describe('apiTranslate (browser client)', () => {
  it('posts to /api/transmute and validates the answer', async () => {
    // Reuse the server handler as the fake network so client and server stay in lockstep.
    const log: Captured[] = []
    const upstream = fakeFetch(() => completion(JSON.stringify(LEVELS_JSON)))
    const viaServer: typeof fetch = async (url, init) => {
      log.push({ url: String(url), init: init ?? {} })
      return handleTransmute(new Request(`https://example.test${String(url)}`, init), ENV, { fetchImpl: upstream.impl })
    }
    const t = await apiTranslate('Mi stai disturbando.', { variant: 2, fetchImpl: viaServer })
    assert.equal(log[0]?.url, '/api/transmute')
    assert.deepEqual(JSON.parse(String(log[0]?.init.body)), { input: 'Mi stai disturbando.', variant: 2 })
    assert.equal(t.source, 'llm')
    assert.equal(t.variant, 2)
    assert.deepEqual(t.levels, LEVELS_JSON)
  })

  it('surfaces server error codes as ApiError', async () => {
    const viaServer: typeof fetch = async (url, init) =>
      handleTransmute(new Request(`https://example.test${String(url)}`, init), {})
    await assert.rejects(
      apiTranslate('Ciao', { fetchImpl: viaServer }),
      (e: unknown) => e instanceof ApiError && e.status === 503 && e.code === 'llm_not_configured',
    )
  })

  it('wraps network failures and non-JSON answers', async () => {
    const offline: typeof fetch = async () => {
      throw new TypeError('Failed to fetch')
    }
    await assert.rejects(apiTranslate('Ciao', { fetchImpl: offline }), (e: unknown) => e instanceof ApiError && e.code === 'network_error')

    const html: typeof fetch = async () => new Response('<!doctype html>', { status: 200, headers: { 'Content-Type': 'text/html' } })
    await assert.rejects(apiTranslate('Ciao', { fetchImpl: html }), (e: unknown) => e instanceof ApiError && e.code === 'bad_response')
  })
})

describe('readTranslateMode', () => {
  it('defaults to the API and only opts into demo explicitly', () => {
    assert.equal(readTranslateMode({}), 'api')
    assert.equal(readTranslateMode({ VITE_TRANSLATE_MODE: '' }), 'api')
    assert.equal(readTranslateMode({ VITE_TRANSLATE_MODE: 'llm' }), 'api')
    assert.equal(readTranslateMode({ VITE_TRANSLATE_MODE: 'demo' }), 'demo')
    assert.equal(readTranslateMode({ VITE_TRANSLATE_MODE: ' Demo ' }), 'demo')
  })
})
