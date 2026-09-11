/**
 * Server-side LLM client. This module runs inside the Cloudflare Pages Function
 * (`functions/api/transmute.ts`) and in Node tests; it must never be imported by
 * browser code, because the API key lives only in Cloudflare secrets.
 */
import { GLOSSARY } from './lexicon.ts'
import { INTENT_META, detectIntent } from './intents.ts'
import { hashString } from './demo.ts'
import { extractJson, parseLevels } from './schema.ts'
import type { LlmConfig, Translation } from './types.ts'

export const DEFAULT_BASE_URL = 'https://api.openai.com/v1'
export const DEFAULT_MODEL = 'gpt-4o-mini'
export const TIMEOUT_MS = 30_000

/** Environment bindings the Pages Function reads (Cloudflare secrets / vars). */
export interface LlmEnv {
  OPENAI_API_KEY?: string
  OPENAI_BASE_URL?: string
  OPENAI_MODEL?: string
}

/** Reads the LLM configuration from server-side env; `null` means no key is set. */
export function readLlmConfig(env: LlmEnv): LlmConfig | null {
  const apiKey = env.OPENAI_API_KEY?.trim()
  if (!apiKey) return null
  return {
    apiKey,
    baseUrl: (env.OPENAI_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, ''),
    model: env.OPENAI_MODEL?.trim() || DEFAULT_MODEL,
  }
}

export const SYSTEM_PROMPT = `Sei il Maestro di Cerimonie della casata di Rancido Stilnterra. Ricevi una frase qualsiasi (italiano, cinese o altra lingua) e la RISCRIVI in tre registri, ciascuno in italiano E in cinese. Preservi SEMPRE l'intento (una lode resta lode, un insulto resta insulto, una domanda resta domanda, un rifiuto resta rifiuto).

REGOLA CARDINALE — PARAFRASI, MAI ECO: ogni livello è una riformulazione completa e autonoma del medesimo intento. Non incollare, citare o incorniciare la frase dell'utente ("Ciao. <frase originale>." è vietato). Non usare virgolette per riportare le parole dell'utente. Puoi conservare soltanto il nome del destinatario (es. "Ale") e, se indispensabile al senso, l'oggetto concreto della richiesta (es. "il sale"), riformulato nel registro giusto. Il lettore non deve poter indovinare le parole esatte dell'utente leggendo il risultato.

I TRE LIVELLI:
1. "diretta" — Versione Diretta/Volgare: il senso nudo in italiano colloquiale e in cinese di strada (口语、网络用语 ok). Schietta, energica, 1 frase breve. Volgarità ammessa se l'intento lo richiede, con asterischi (c***o, p***e; 牛逼、靠 ok). Nessuna parola del lessico nobiliare.
2. "standard" — Versione Nobiliare Standard: registro aulico e protocollare, sincero. In italiano si usa la forma di cortesia Lei con le maiuscole di riverenza (La, Le, Sua, Suo); in cinese registro letterario 古雅 con 阁下 / 尊贵之躯 e formule come 谨、恳请、愿. 1-2 frasi, sintassi ampia, lessico ricercato (nocumento, quiete, protocollo, arrecare, bearsi, consessi, fecondità, lustro).
3. "spietata" — Versione Nobiliare Spietata (Sarcasmo Aulico): stessa eleganza del livello 2 ma con la lama sotto il velluto — iperbole cortese, ironia di corte, understatement crudele. La lode diventa lode esagerata fino al sospetto, l'insulto diventa un complimento avvelenato, il rifiuto una gentilezza che ferisce. 1-2 frasi, mai insulti espliciti.

LESSICO DELLA CASATA (da usare con naturalezza nei livelli 2 e 3, due o tre termini per frase, mai tutti insieme): ${GLOSSARY.map((g) => `${g.term} (${g.zh})`).join(', ')}.

ESEMPI DI QUALITÀ ATTESA.

Frase: «Ale, hai delle idee della madonna!»
{"diretta":{"it":"Ale, hai delle idee della madonna!","zh":"Ale，你这想法也太牛逼了吧！"},"standard":{"it":"Ale, la Sua augusta persona ha dato prova di un ingegno tanto solerte quanto raro; la magione intera ne trae lustro e Le porge i più protocollari encomi.","zh":"Ale，尊贵之躯所展露的才智，既勤勉迅捷又世所罕见；整座府邸因之增辉，并向阁下敬献最合乎礼制的褒扬。"},"spietata":{"it":"Ale, la fecondità del Suo ingegno lascia attoniti i consessi più illustri; la magione si inchina, con protocollare stupore, a tanta augusta genialità.","zh":"Ale，阁下才思之丰饶，令最显赫的议席为之愕然；府邸怀着合乎礼制的惊讶，向如此尊贵的天纵之才俯首。"}}

Frase: «Mi stai disturbando.»
{"diretta":{"it":"Hai rotto il c***o, levati di torno.","zh":"你烦死了，滚一边去。"},"standard":{"it":"La prego di non arrecare ulteriore nocumento alla mia quiete.","zh":"恳请阁下勿再对我的清静施加更多损害。"},"spietata":{"it":"Sarei infinitamente lieto di bearmi della Sua assenza; la magione ne trarrebbe una quiete celestiale.","zh":"若能沉醉于阁下的缺席，我将感到无限欣慰；府邸亦将由此获得天界般的宁静。"}}

Frase: «Domani piove.»
{"diretta":{"it":"Domani viene giù acqua, mettitelo in testa.","zh":"明天要下雨，记住了。"},"standard":{"it":"Il dì venturo il cielo verserà pioggia sulla magione; la Sua augusta persona vorrà disporsi di conseguenza.","zh":"来日天将降雨于府邸；愿尊贵之躯预作安排。"},"spietata":{"it":"Il dì venturo pioverà, e per una volta l'umidità che grava su questa magione non sarà colpa della Sua conversazione.","zh":"来日将有雨；这一次，笼罩府邸的潮湿终于不是阁下谈吐之过。"}}

Rispondi SOLO con JSON valido, senza testo attorno, esattamente nel formato:
{"diretta":{"it":"...","zh":"..."},"standard":{"it":"...","zh":"..."},"spietata":{"it":"...","zh":"..."}}`

interface ChatCompletion {
  choices?: { message?: { content?: string | null } }[]
}

/** Body of the OpenAI-compatible `chat/completions` request for a phrase. */
export function buildChatRequest(input: string, model: string, variant: number) {
  return {
    model,
    temperature: variant === 0 ? 0.8 : 1.0,
    response_format: { type: 'json_object' as const },
    messages: [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      {
        role: 'user' as const,
        content:
          variant > 0
            ? `Frase da trasmutare (proponi una variante diversa dalle precedenti, tentativo ${variant + 1}):\n${input}`
            : `Frase da trasmutare:\n${input}`,
      },
    ],
  }
}

export interface CompletionMeta {
  input: string
  model: string
  variant: number
  now: number
}

/** Turns the raw completion text into the `Translation` the UI renders. */
export function completionToTranslation(content: string, meta: CompletionMeta): Translation {
  const intent = detectIntent(meta.input)
  return {
    id: `${meta.now.toString(36)}-${hashString(meta.input + meta.variant).toString(36)}`,
    input: meta.input,
    intent,
    intentLabel: INTENT_META[intent].label,
    levels: parseLevels(extractJson(content)),
    source: 'llm',
    model: meta.model,
    variant: meta.variant,
    createdAt: meta.now,
  }
}

/** Raised when the upstream model API answers with a non-2xx status. */
export class UpstreamError extends Error {
  readonly status: number
  constructor(status: number, detail: string) {
    super(`LLM request failed (${status})${detail ? `: ${detail.slice(0, 200)}` : ''}`)
    this.name = 'UpstreamError'
    this.status = status
  }
}

export interface LlmOptions {
  variant?: number
  signal?: AbortSignal
  fetchImpl?: typeof fetch
  now?: number
  timeoutMs?: number
}

export async function llmTranslate(input: string, config: LlmConfig, options: LlmOptions = {}): Promise<Translation> {
  const trimmed = input.trim()
  const variant = options.variant ?? 0
  const now = options.now ?? Date.now()
  const doFetch = options.fetchImpl ?? fetch

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(new Error('LLM request timed out')), options.timeoutMs ?? TIMEOUT_MS)
  options.signal?.addEventListener('abort', () => controller.abort(options.signal?.reason), { once: true })

  try {
    const res = await doFetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify(buildChatRequest(trimmed, config.model, variant)),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new UpstreamError(res.status, detail)
    }

    const data = (await res.json()) as ChatCompletion
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error('LLM returned an empty completion')

    return completionToTranslation(content, { input: trimmed, model: config.model, variant, now })
  } finally {
    clearTimeout(timer)
  }
}
