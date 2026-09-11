import { INTENT_META, detectIntent, detectScript, parseAddressee, stripCourtesy, stripInterjections } from './intents.ts'
import { bare, ennoble, lowerFirst, vulgarize } from './lexicon.ts'
import { TEMPLATES } from './templates.ts'
import { LEVELS, SLOT_INTENTS, type IntentId, type Level, type Rendering, type Translation } from './types.ts'

const upperFirst = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

/** Deterministic 32-bit hash so the same phrase always opens on the same variant. */
export function hashString(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Collapses doubled punctuation produced when a quoted phrase already ends a sentence. */
function tidy(text: string): string {
  return text
    .replace(/([.!?…])\s*\.(?=\s|$)/gu, '$1')
    .replace(/([。！？…])\s*。/gu, '$1')
    .replace(/\s+([,;:.!?])/gu, '$1')
    .replace(/,\s*,/gu, ',')
    .replace(/，\s*，/gu, '，')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

type Vars = Record<string, string>

interface SlotVars {
  it: Vars
  zh: Vars
}

/** The substance of a content-carrying phrase, stripped of courtesy or exclamation markers. */
function extractTopic(body: string, intent: IntentId): string {
  const stripped = bare(body)
  if (intent === 'request' || intent === 'command') return bare(stripCourtesy(stripped))
  if (intent === 'complaint') return bare(stripInterjections(stripped))
  return stripped
}

const EMPTY_COMPLAINT = { blunt: 'ancora questa storia', noble: 'ancora la medesima faccenda', zh: '又是这桩事' }
const EMPTY_REQUEST = { blunt: 'quella cosa che sai', noble: 'quanto Le è già noto', zh: '您已知晓的那件事' }

/**
 * Builds the per-language placeholder values. Addressee slots are present for
 * every intent; topic slots only carry the user's words for SLOT_INTENTS, so a
 * hand-written paraphrase can never fall back to echoing the input.
 */
function buildVars(body: string, addressee: string | null, intent: IntentId): SlotVars {
  const it: Vars = {
    Voc: addressee ? `${addressee}, ` : '',
    voc: addressee ? `, ${addressee}` : '',
  }
  const zh: Vars = {
    Voc: addressee ? `${addressee}，` : '',
    voc: addressee ? `，${addressee}` : '',
  }

  if (!SLOT_INTENTS.includes(intent)) return { it, zh }

  const topic = extractTopic(body, intent)
  if (!topic) {
    // Nothing but markers was said ("Che palle, di nuovo", "Per favore"), so the
    // slot carries the implied substance instead of echoing the marker.
    const fallback = intent === 'complaint' ? EMPTY_COMPLAINT : EMPTY_REQUEST
    Object.assign(it, {
      orig: '',
      q: `«${fallback.blunt}»`,
      noble: fallback.noble,
      Noble: upperFirst(fallback.noble),
      blunt: fallback.blunt,
      Blunt: upperFirst(fallback.blunt),
    })
    Object.assign(zh, { orig: '', q: fallback.zh, noble: fallback.zh, Noble: fallback.zh, blunt: fallback.zh, Blunt: fallback.zh })
    return { it, zh }
  }

  const script = detectScript(topic)
  const cjkQuote = `「${topic}」`
  const latinQuote = `«${topic}»`

  if (script === 'zh') {
    // A CJK topic cannot be run through the Italian lexicon, so the Italian
    // side reports it as a quotation.
    Object.assign(it, { orig: topic, q: latinQuote, noble: latinQuote, Noble: latinQuote, blunt: latinQuote, Blunt: latinQuote })
  } else {
    const noble = ennoble(topic)
    const blunt = vulgarize(topic)
    Object.assign(it, {
      orig: topic,
      q: latinQuote,
      noble: lowerFirst(noble),
      Noble: upperFirst(noble),
      blunt: lowerFirst(blunt),
      Blunt: upperFirst(blunt),
    })
  }
  Object.assign(zh, { orig: topic, q: cjkQuote, noble: cjkQuote, Noble: cjkQuote, blunt: cjkQuote, Blunt: cjkQuote })
  return { it, zh }
}

function render(template: string, vars: Vars): string {
  return upperFirst(tidy(template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? '')))
}

function fill(template: Rendering, vars: SlotVars, question: boolean): Rendering {
  const it = render(template.it, vars.it)
  const zh = render(template.zh, vars.zh)
  if (!question) return { it, zh }
  return {
    it: /[?!.…]$/u.test(it) ? it : `${it}?`,
    zh: /[？！。…]$/u.test(zh) ? zh : `${zh}？`,
  }
}

export interface DemoOptions {
  variant?: number
  now?: number
}

export function demoTranslate(input: string, options: DemoOptions = {}): Translation {
  const variant = options.variant ?? 0
  const now = options.now ?? Date.now()
  const trimmed = input.trim()
  const { addressee, body } = parseAddressee(trimmed)
  const intent = detectIntent(body)
  const vars = buildVars(body, addressee, intent)

  const seed = hashString(trimmed)
  const set = TEMPLATES[intent]
  const levels = Object.fromEntries(
    LEVELS.map((level, i) => {
      const pool = set[level]
      const idx = (seed + variant + i * 7) % pool.length
      return [level, fill(pool[idx] ?? pool[0]!, vars, intent === 'question')]
    }),
  ) as Record<Level, Rendering>

  return {
    id: `${now.toString(36)}-${seed.toString(36)}`,
    input: trimmed,
    intent,
    intentLabel: INTENT_META[intent].label,
    levels,
    source: 'demo',
    variant,
    createdAt: now,
  }
}

/** Number of distinct variants the demo engine can produce for an intent. */
export function variantCount(input: string): number {
  const set = TEMPLATES[detectIntent(input)]
  return Math.max(...LEVELS.map((l) => set[l].length))
}
