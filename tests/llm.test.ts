import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  DEFAULT_BASE_URL,
  DEFAULT_MODEL,
  SYSTEM_PROMPT,
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
    assert.equal(resolveLlmConfig({ MINIMAX_API_KEY: '   ' }), null)
  })

  it('defaults to the MiniMax OpenAI-compatible endpoint and a current model', () => {
    const cfg = resolveLlmConfig({ MINIMAX_API_KEY: 'sk-test' })
    assert.deepEqual(cfg, { apiKey: 'sk-test', baseUrl: DEFAULT_BASE_URL, model: DEFAULT_MODEL })
    assert.equal(DEFAULT_BASE_URL, 'https://api.minimax.io/v1')
    assert.equal(DEFAULT_MODEL, 'MiniMax-M3')
  })

  it('honours overrides and trims trailing slashes', () => {
    const cfg = resolveLlmConfig({
      MINIMAX_API_KEY: ' sk-test ',
      MINIMAX_BASE_URL: 'https://api.minimaxi.com/v1///',
      MINIMAX_MODEL: 'MiniMax-M2.7-highspeed',
    })
    assert.deepEqual(cfg, { apiKey: 'sk-test', baseUrl: 'https://api.minimaxi.com/v1', model: 'MiniMax-M2.7-highspeed' })
  })
})

describe('prompt', () => {
  it('demands paraphrase, never echo, and lists the house lexicon', () => {
    assert.match(SYSTEM_PROMPT, /PARAFRASI, mai eco/)
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

describe('llmTranslate (MiniMax)', () => {
  const config = { apiKey: 'sk-test', baseUrl: 'https://api.minimax.io/v1', model: 'MiniMax-M3' }

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
