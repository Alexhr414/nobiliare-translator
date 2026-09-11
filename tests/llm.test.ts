import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  DEFAULT_BASE_URL,
  DEFAULT_MODEL,
  PROVIDERS,
  SYSTEM_PROMPT,
  UpstreamError,
  buildChatRequest,
  buildUserPrompt,
  extractJson,
  llmTranslate,
  parseLevels,
  resolveLlmConfig,
  stripThinking,
} from '../src/engine/llm.ts'
import { GLOSSARY } from '../src/engine/lexicon.ts'
import { LEVELS } from '../src/engine/types.ts'

const LEVELS_JSON = {
  diretta: { it: 'Sparisci, non ho un minuto per te.', zh: '滚开，我没空理你。' },
  standard: { it: 'Vi prego di incedere altrove: la mia augusta persona è impegnata.', zh: '请阁下移驾他处，本尊无暇奉陪。' },
  spietata: { it: 'Incedete pure: la magione respira meglio senza il Vostro nocumento.', zh: '请缓步离去，府邸少了阁下的损害，呼吸也顺畅了。' },
}

function completion(content: string, extra: Record<string, unknown> = {}) {
  return {
    id: 'cmpl-1',
    choices: [{ index: 0, finish_reason: 'stop', message: { role: 'assistant', content } }],
    base_resp: { status_code: 0, status_msg: '' },
    ...extra,
  }
}

function fakeFetch(handler: (url: string, init: RequestInit) => Response | Promise<Response>): typeof fetch {
  return ((url: string | URL | Request, init?: RequestInit) => Promise.resolve(handler(String(url), init ?? {}))) as typeof fetch
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

describe('resolveLlmConfig', () => {
  it('is null without an API key', () => {
    assert.equal(resolveLlmConfig({}), null)
    assert.equal(resolveLlmConfig({ OPENAI_API_KEY: '   ' }), null)
    assert.equal(resolveLlmConfig({ MINIMAX_API_KEY: '   ' }), null)
  })

  it('defaults OPENAI_API_KEY to api.openai.com and gpt-4o-mini', () => {
    const cfg = resolveLlmConfig({ OPENAI_API_KEY: 'sk-test' })
    assert.deepEqual(cfg, { provider: 'openai', apiKey: 'sk-test', baseUrl: DEFAULT_BASE_URL, model: DEFAULT_MODEL })
    assert.equal(DEFAULT_BASE_URL, 'https://api.openai.com/v1')
    assert.equal(DEFAULT_MODEL, 'gpt-4o-mini')
  })

  it('honours OPENAI_BASE_URL / OPENAI_MODEL overrides and trims trailing slashes', () => {
    const cfg = resolveLlmConfig({
      OPENAI_API_KEY: ' sk-test ',
      OPENAI_BASE_URL: 'https://openrouter.ai/api/v1///',
      OPENAI_MODEL: ' openai/gpt-4.1-mini ',
    })
    assert.deepEqual(cfg, {
      provider: 'openai',
      apiKey: 'sk-test',
      baseUrl: 'https://openrouter.ai/api/v1',
      model: 'openai/gpt-4.1-mini',
    })
  })

  it('falls back to MINIMAX_API_KEY with the MiniMax endpoint and a current model', () => {
    const cfg = resolveLlmConfig({ MINIMAX_API_KEY: 'sk-test' })
    assert.deepEqual(cfg, {
      provider: 'minimax',
      apiKey: 'sk-test',
      baseUrl: PROVIDERS.minimax.baseUrl,
      model: PROVIDERS.minimax.model,
    })
    assert.equal(PROVIDERS.minimax.baseUrl, 'https://api.minimax.io/v1')
    assert.equal(PROVIDERS.minimax.model, 'MiniMax-M3')
  })

  it('honours MiniMax overrides and trims trailing slashes', () => {
    const cfg = resolveLlmConfig({
      MINIMAX_API_KEY: ' sk-test ',
      MINIMAX_BASE_URL: 'https://api.minimaxi.com/v1///',
      MINIMAX_MODEL: 'MiniMax-M2.7-highspeed',
    })
    assert.deepEqual(cfg, {
      provider: 'minimax',
      apiKey: 'sk-test',
      baseUrl: 'https://api.minimaxi.com/v1',
      model: 'MiniMax-M2.7-highspeed',
    })
  })

  it('prefers OPENAI_API_KEY when both keys are set', () => {
    const cfg = resolveLlmConfig({ OPENAI_API_KEY: 'sk-openai', MINIMAX_API_KEY: 'sk-minimax' })
    assert.equal(cfg?.provider, 'openai')
    assert.equal(cfg?.apiKey, 'sk-openai')
  })
})

describe('buildChatRequest', () => {
  it('sends JSON mode and no vendor extensions to OpenAI-compatible endpoints', () => {
    const body = buildChatRequest('Ciao', { provider: 'openai', model: 'gpt-4o-mini' }, 0)
    assert.equal(body.model, 'gpt-4o-mini')
    assert.deepEqual(body.response_format, { type: 'json_object' })
    assert.equal('thinking' in body, false)
    assert.equal('reasoning_split' in body, false)
    assert.equal(body.temperature, 0.8)
    assert.equal(body.messages[0]?.content, SYSTEM_PROMPT)
    assert.match(body.messages[1]?.content ?? '', /^Frase da trasmutare:\nCiao$/)
  })

  it('sends the reasoning controls to MiniMax and raises the temperature on regenerate', () => {
    const body = buildChatRequest('Ciao', { provider: 'minimax', model: 'MiniMax-M3' }, 2)
    assert.deepEqual(body.thinking, { type: 'disabled' })
    assert.equal(body.reasoning_split, true)
    assert.equal('response_format' in body, false)
    assert.equal(body.temperature, 1.0)
    assert.match(body.messages[1]?.content ?? '', /tentativo 3/)
  })
})

describe('prompt', () => {
  it('demands paraphrase, never echo, and lists the house lexicon', () => {
    assert.match(SYSTEM_PROMPT, /PARAFRASI, MAI ECO/i)
    assert.match(SYSTEM_PROMPT, /senza blocchi di codice/)
    assert.match(SYSTEM_PROMPT, /"diretta"/)
    assert.match(SYSTEM_PROMPT, /"standard"/)
    assert.match(SYSTEM_PROMPT, /"spietata"/)
    for (const g of GLOSSARY) assert.ok(SYSTEM_PROMPT.includes(g.term), `prompt lacks ${g.term}`)
  })

  it('asks for a fresh variant on regenerate', () => {
    assert.match(buildUserPrompt('Ciao', 0), /^Frase da trasmutare:\nCiao$/)
    assert.match(buildUserPrompt('Ciao', 2), /variante diversa.*tentativo 3/)
  })
})

describe('response parsing', () => {
  it('strips <think> blocks emitted by reasoning models', () => {
    assert.equal(stripThinking('<think>\nragiono…\n</think>\n{"a":1}'), '{"a":1}')
    assert.equal(stripThinking('ragionamento senza apertura</think>{"a":1}'), '{"a":1}')
    assert.equal(stripThinking('{"a":1}'), '{"a":1}')
  })

  it('extracts JSON from fences, prose and thinking', () => {
    const payload = JSON.stringify(LEVELS_JSON)
    assert.deepEqual(extractJson(payload), LEVELS_JSON)
    assert.deepEqual(extractJson('```json\n' + payload + '\n```'), LEVELS_JSON)
    assert.deepEqual(extractJson('Ecco la trasmutazione:\n' + payload + '\nSpero gradiate.'), LEVELS_JSON)
    assert.deepEqual(extractJson('<think>ok</think>' + payload), LEVELS_JSON)
    assert.throws(() => extractJson('nessun json qui'), /no JSON object/)
  })

  it('validates all three levels in both languages', () => {
    const levels = parseLevels(LEVELS_JSON)
    for (const level of LEVELS) assert.ok(levels[level].it && levels[level].zh)
    assert.throws(() => parseLevels({ ...LEVELS_JSON, spietata: { it: 'solo italiano' } }), /missing level "spietata"/)
    assert.throws(() => parseLevels(null), /not an object/)
  })
})

describe('llmTranslate (OpenAI-compatible)', () => {
  const config = { provider: 'openai' as const, apiKey: 'sk-test', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' }

  it('posts a JSON-mode chat completion with the bearer key and returns a Translation', async () => {
    let seen: { url: string; init: RequestInit } | null = null
    const doFetch = fakeFetch((url, init) => {
      seen = { url, init }
      return jsonResponse(completion(JSON.stringify(LEVELS_JSON)))
    })

    const t = await llmTranslate('Vattene, non ho tempo per te.', config, { fetchImpl: doFetch, now: 1 })

    assert.ok(seen)
    assert.equal(seen!.url, 'https://api.openai.com/v1/chat/completions')
    const headers = seen!.init.headers as Record<string, string>
    assert.equal(headers.Authorization, 'Bearer sk-test')
    const body = JSON.parse(String(seen!.init.body))
    assert.equal(body.model, 'gpt-4o-mini')
    assert.deepEqual(body.response_format, { type: 'json_object' })
    assert.equal(body.thinking, undefined)
    assert.equal(body.reasoning_split, undefined)
    assert.equal(t.source, 'llm')
    assert.equal(t.model, 'gpt-4o-mini')
    assert.deepEqual(t.levels, LEVELS_JSON)
  })

  it('raises UpstreamError with the status on non-2xx answers', async () => {
    const doFetch = fakeFetch(() => new Response('{"error":{"message":"Incorrect API key"}}', { status: 401 }))
    await assert.rejects(
      llmTranslate('Ciao', config, { fetchImpl: doFetch }),
      (e: unknown) => e instanceof UpstreamError && e.status === 401 && /LLM request failed \(401\)/.test(e.message),
    )
  })

  it('aborts when the model does not answer within timeoutMs', async () => {
    const hanging = ((_: unknown, init?: RequestInit) =>
      new Promise<Response>((_, reject) => init?.signal?.addEventListener('abort', () => reject(init.signal?.reason)))) as typeof fetch
    await assert.rejects(llmTranslate('Ciao', config, { fetchImpl: hanging, timeoutMs: 5 }), /timed out/)
  })
})

describe('llmTranslate (MiniMax)', () => {
  const config = { provider: 'minimax' as const, apiKey: 'sk-test', baseUrl: 'https://api.minimax.io/v1', model: 'MiniMax-M3' }

  it('posts an OpenAI-compatible chat completion with the bearer key and returns a Translation', async () => {
    let seen: { url: string; init: RequestInit } | null = null
    const doFetch = fakeFetch((url, init) => {
      seen = { url, init }
      return jsonResponse(completion(JSON.stringify(LEVELS_JSON)))
    })

    const t = await llmTranslate('Vattene, non ho tempo per te.', config, { fetchImpl: doFetch, now: 1, variant: 1 })

    assert.ok(seen)
    assert.equal(seen!.url, 'https://api.minimax.io/v1/chat/completions')
    assert.equal(seen!.init.method, 'POST')
    const headers = seen!.init.headers as Record<string, string>
    assert.equal(headers.Authorization, 'Bearer sk-test')
    const body = JSON.parse(String(seen!.init.body))
    assert.equal(body.model, 'MiniMax-M3')
    assert.deepEqual(body.thinking, { type: 'disabled' })
    assert.equal(body.reasoning_split, true)
    assert.equal(body.response_format, undefined)
    assert.equal(body.messages[0].role, 'system')
    assert.equal(body.messages[0].content, SYSTEM_PROMPT)
    assert.match(body.messages[1].content, /tentativo 2/)

    assert.equal(t.source, 'llm')
    assert.equal(t.model, 'MiniMax-M3')
    assert.equal(t.intent, 'dismissal')
    assert.equal(t.variant, 1)
    assert.deepEqual(t.levels, LEVELS_JSON)
  })

  it('tolerates inline <think> reasoning in content', async () => {
    const doFetch = fakeFetch(() =>
      jsonResponse(completion('<think>Devo essere aulico.</think>\n' + JSON.stringify(LEVELS_JSON))),
    )
    const t = await llmTranslate('Vattene', config, { fetchImpl: doFetch, now: 1 })
    assert.deepEqual(t.levels, LEVELS_JSON)
  })

  it('surfaces MiniMax base_resp errors even on HTTP 200', async () => {
    const doFetch = fakeFetch(() =>
      jsonResponse({ choices: [], base_resp: { status_code: 1004, status_msg: 'login fail' } }),
    )
    await assert.rejects(llmTranslate('Ciao', config, { fetchImpl: doFetch }), /MiniMax error 1004: login fail/)
  })

  it('surfaces HTTP errors with a snippet of the body', async () => {
    const doFetch = fakeFetch(() => new Response('insufficient balance', { status: 429 }))
    await assert.rejects(llmTranslate('Ciao', config, { fetchImpl: doFetch }), /failed \(429\): insufficient balance/)
  })

  it('rejects empty or malformed completions', async () => {
    await assert.rejects(
      llmTranslate('Ciao', config, { fetchImpl: fakeFetch(() => jsonResponse(completion('<think>solo pensieri</think>'))) }),
      /empty completion/,
    )
    await assert.rejects(
      llmTranslate('Ciao', config, { fetchImpl: fakeFetch(() => jsonResponse(completion('{"diretta":{"it":"x","zh":"y"}}'))) }),
      /missing level "standard"/,
    )
  })
})
