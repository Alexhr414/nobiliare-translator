import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { handleTransmute } from '../functions/api/transmute.ts'
import { API_ENDPOINT, MAX_INPUT_LENGTH } from '../src/engine/api.ts'
import { ApiRequestError, fetchLlmStatus, requestTransmute, translate } from '../src/engine/translate.ts'

const LEVELS_JSON = {
  diretta: { it: 'Ho una fame da lupi.', zh: '我饿得像狼一样。' },
  standard: { it: "Avverto l'appetito: si incede a desinare?", zh: '本尊略感饥馑，可否缓步赴宴？' },
  spietata: { it: 'La magione ha vivande, o solo velleità?', zh: '府邸可有佳肴，抑或只有空妄之愿？' },
}

const minimaxOk = (() =>
  Promise.resolve(
    new Response(
      JSON.stringify({
        choices: [{ message: { role: 'assistant', content: JSON.stringify(LEVELS_JSON) } }],
        base_resp: { status_code: 0, status_msg: '' },
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    ),
  )) as typeof fetch

const minimaxDown = (() => Promise.resolve(new Response('upstream exploded', { status: 500 }))) as typeof fetch

const post = (body: unknown) =>
  new Request('https://example.pages.dev' + API_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })

const ENV = { MINIMAX_API_KEY: 'sk-test' }

describe('Pages Function /api/transmute', () => {
  it('GET reports whether MiniMax is configured without leaking the key', async () => {
    const off = await handleTransmute(new Request('https://x/api/transmute'), {})
    assert.equal(off.status, 200)
    assert.deepEqual(await off.json(), { provider: 'minimax', configured: false, model: null })

    const on = await handleTransmute(new Request('https://x/api/transmute'), { ...ENV, MINIMAX_MODEL: 'MiniMax-M2.7' })
    const body = await on.text()
    assert.deepEqual(JSON.parse(body), { provider: 'minimax', configured: true, model: 'MiniMax-M2.7' })
    assert.ok(!body.includes('sk-test'))
  })

  it('rejects other methods', async () => {
    const res = await handleTransmute(new Request('https://x/api/transmute', { method: 'DELETE' }), ENV)
    assert.equal(res.status, 405)
    assert.equal(res.headers.get('allow'), 'GET, HEAD, POST')
  })

  it('validates the body', async () => {
    const cases: [unknown, RegExp][] = [
      ['not json', /must be JSON/],
      [[], /must be a JSON object/],
      [{}, /"input" must be a string/],
      [{ input: '   ' }, /must not be empty/],
      [{ input: 'x'.repeat(MAX_INPUT_LENGTH + 1) }, /at most 600/],
      [{ input: 'Ciao', variant: -1 }, /"variant"/],
      [{ input: 'Ciao', variant: 1.5 }, /"variant"/],
      [{ input: 'Ciao', variant: '2' }, /"variant"/],
    ]
    for (const [body, expected] of cases) {
      const res = await handleTransmute(post(body), ENV, { fetchImpl: minimaxOk })
      assert.equal(res.status, 400, JSON.stringify(body))
      const err = (await res.json()) as { error: string; message: string }
      assert.equal(err.error, 'invalid_request')
      assert.match(err.message, expected)
    }
  })

  it('answers 503 llm_unconfigured when the secret is missing', async () => {
    const res = await handleTransmute(post({ input: 'Ho fame' }), {}, { fetchImpl: minimaxOk })
    assert.equal(res.status, 503)
    const err = (await res.json()) as { error: string; message: string }
    assert.equal(err.error, 'llm_unconfigured')
    assert.match(err.message, /MINIMAX_API_KEY/)
  })

  it('returns the Translation the UI understands', async () => {
    const res = await handleTransmute(post({ input: '  Ho fame  ', variant: 2 }), ENV, { fetchImpl: minimaxOk, now: 42 })
    assert.equal(res.status, 200)
    assert.match(res.headers.get('content-type') ?? '', /application\/json/)
    assert.equal(res.headers.get('cache-control'), 'no-store')
    const t = (await res.json()) as Record<string, unknown>
    assert.equal(t.source, 'llm')
    assert.equal(t.model, 'MiniMax-M3')
    assert.equal(t.input, 'Ho fame')
    assert.equal(t.intent, 'hunger')
    assert.equal(t.variant, 2)
    assert.equal(t.createdAt, 42)
    assert.deepEqual(t.levels, LEVELS_JSON)
  })

  it('answers 502 llm_failed when MiniMax errors', async () => {
    const res = await handleTransmute(post({ input: 'Ho fame' }), ENV, { fetchImpl: minimaxDown })
    assert.equal(res.status, 502)
    const err = (await res.json()) as { error: string; message: string }
    assert.equal(err.error, 'llm_failed')
    assert.match(err.message, /500/)
  })
})

/** Wires the browser-side client straight into the handler, bypassing the network. */
function viaHandler(env: Record<string, string>, upstream: typeof fetch): typeof fetch {
  return ((url: string | URL | Request, init?: RequestInit) => {
    const request = new Request('https://example.pages.dev' + String(url), init)
    return handleTransmute(request, env, { fetchImpl: upstream, now: 7 })
  }) as typeof fetch
}

/** Mimics `vite dev`, which has no Function: the SPA fallback returns HTML. */
const spaOnly = (() =>
  Promise.resolve(new Response('<!doctype html>', { status: 200, headers: { 'content-type': 'text/html' } }))) as typeof fetch

describe('frontend translate()', () => {
  it('uses the live API by default', async () => {
    const { translation, fallback } = await translate('Ho fame', { fetchImpl: viaHandler(ENV, minimaxOk) })
    assert.equal(fallback, undefined)
    assert.equal(translation.source, 'llm')
    assert.deepEqual(translation.levels, LEVELS_JSON)
  })

  it('falls back to the demo engine with an "unconfigured" reason when the secret is unset', async () => {
    const { translation, fallback } = await translate('Ho fame', { fetchImpl: viaHandler({}, minimaxOk) })
    assert.equal(translation.source, 'demo')
    assert.equal(fallback?.kind, 'unconfigured')
    assert.match(fallback?.message ?? '', /MINIMAX_API_KEY/)
  })

  it('falls back to the demo engine with a "failed" reason when MiniMax errors', async () => {
    const { translation, fallback } = await translate('Ho fame', { variant: 1, fetchImpl: viaHandler(ENV, minimaxDown) })
    assert.equal(translation.source, 'demo')
    assert.equal(translation.variant, 1)
    assert.equal(fallback?.kind, 'failed')
    assert.match(fallback?.message ?? '', /500/)
  })

  it('treats a non-JSON answer (no Function deployed) as a failure, not a crash', async () => {
    await assert.rejects(requestTransmute('Ho fame', 0, { fetchImpl: spaOnly }), (e: unknown) => {
      assert.ok(e instanceof ApiRequestError)
      assert.equal(e.code, 'bad_response')
      return true
    })
    const { translation, fallback } = await translate('Ho fame', { fetchImpl: spaOnly })
    assert.equal(translation.source, 'demo')
    assert.equal(fallback?.kind, 'failed')
  })

  it('never calls the network with forceDemo', async () => {
    const boom = (() => Promise.reject(new Error('should not be called'))) as typeof fetch
    const { translation, fallback } = await translate('Ho fame', { forceDemo: true, fetchImpl: boom })
    assert.equal(translation.source, 'demo')
    assert.equal(fallback, undefined)
  })

  it('propagates aborts instead of falling back', async () => {
    const controller = new AbortController()
    const hanging = ((_: unknown, init?: RequestInit) =>
      new Promise<Response>((_, reject) => init?.signal?.addEventListener('abort', () => reject(new Error('aborted'))))) as typeof fetch
    const pending = translate('Ho fame', { signal: controller.signal, fetchImpl: hanging })
    controller.abort()
    await assert.rejects(pending, /aborted/)
  })
})

describe('fetchLlmStatus', () => {
  it('reads the probe', async () => {
    assert.deepEqual(await fetchLlmStatus({ fetchImpl: viaHandler(ENV, minimaxOk) }), {
      provider: 'minimax',
      configured: true,
      model: 'MiniMax-M3',
    })
  })

  it('reads offline when the Function is absent or broken', async () => {
    assert.equal((await fetchLlmStatus({ fetchImpl: spaOnly })).configured, false)
    const boom = (() => Promise.reject(new Error('offline'))) as typeof fetch
    assert.equal((await fetchLlmStatus({ fetchImpl: boom })).configured, false)
  })
})
