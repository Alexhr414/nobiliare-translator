export const LEVELS = ['diretta', 'standard', 'spietata'] as const
export type Level = (typeof LEVELS)[number]

export interface LevelMeta {
  id: Level
  ordinal: number
  title: { it: string; zh: string }
  subtitle: { it: string; zh: string }
}

export const LEVEL_META: readonly LevelMeta[] = [
  {
    id: 'diretta',
    ordinal: 1,
    title: { it: 'Versione Diretta / Volgare', zh: '直白版 / 俚俗版' },
    subtitle: { it: 'Il senso nudo, senza guanti', zh: '赤裸本意，不戴手套' },
  },
  {
    id: 'standard',
    ordinal: 2,
    title: { it: 'Versione Nobiliare Standard', zh: '标准贵族版' },
    subtitle: { it: 'Il registro di corte di Rancido Stilnterra', zh: '朗奇多·斯蒂尔恩特拉的宫廷语体' },
  },
  {
    id: 'spietata',
    ordinal: 3,
    title: { it: 'Versione Nobiliare Spietata', zh: '无情贵族版' },
    subtitle: { it: 'Sarcasmo Aulico — la lama sotto il velluto', zh: '雅言讥讽——天鹅绒下的利刃' },
  },
]

export interface Rendering {
  it: string
  zh: string
}

export type IntentId =
  | 'greeting'
  | 'farewell'
  | 'gratitude'
  | 'apology'
  | 'praise'
  | 'insult'
  | 'dismissal'
  | 'disturbance'
  | 'silence'
  | 'refusal'
  | 'agreement'
  | 'disagreement'
  | 'request'
  | 'command'
  | 'question'
  | 'complaint'
  | 'boredom'
  | 'urgency'
  | 'hunger'
  | 'fatigue'
  | 'affection'
  | 'money'
  | 'lateness'
  | 'delay'
  | 'threat'
  | 'boast'
  | 'statement'

/**
 * Intents whose meaning lives in the user's own words (what is asked, ordered,
 * queried, stated). Their templates may embed a short topic slot; every other
 * intent is rendered as a complete hand-written paraphrase.
 */
export const SLOT_INTENTS: readonly IntentId[] = ['request', 'command', 'question', 'complaint', 'money', 'statement']

export type Source = 'demo' | 'llm'

export interface Translation {
  id: string
  input: string
  intent: IntentId
  intentLabel: { it: string; zh: string }
  levels: Record<Level, Rendering>
  source: Source
  model?: string
  variant: number
  createdAt: number
}

export interface LlmConfig {
  apiKey: string
  baseUrl: string
  model: string
}
