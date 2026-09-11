import { INTENT_META, detectIntent, detectScript } from './intents.ts'
import { bare, ennoble, lowerFirst } from './lexicon.ts'
import { TEMPLATES } from './templates.ts'
import { LEVELS, type Level, type Rendering, type Translation } from './types.ts'

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
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function fill(template: Rendering, vars: Record<string, string>, question: boolean): Rendering {
  const apply = (s: string) => tidy(s.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? ''))
  const it = apply(template.it)
  const zh = apply(template.zh)
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
  const intent = detectIntent(trimmed)
  const script = detectScript(trimmed)

  const orig = bare(trimmed)
  // A CJK phrase run through the Italian lexicon would come back unchanged,
  // so it is echoed verbatim; Latin phrases get the ennobled treatment.
  const ennobled = script === 'zh' ? orig : ennoble(orig)
  const vars = {
    orig,
    noble: lowerFirst(ennobled),
    Noble: upperFirst(ennobled),
    q: `「${orig}」`,
  }

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
