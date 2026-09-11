import { LEVEL_META, type Translation } from '@/engine/types'

/** Plain-text export of a full translation, used by "copy all". */
export function formatTranslation(t: Translation): string {
  const blocks = LEVEL_META.map((meta) => {
    const r = t.levels[meta.id]
    return [`${meta.ordinal}. ${meta.title.it} · ${meta.title.zh}`, `IT: ${r.it}`, `ZH: ${r.zh}`].join('\n')
  })
  return [`«${t.input}»`, '', ...blocks.flatMap((b) => [b, ''])].join('\n').trimEnd()
}

export function formatRelativeTime(ts: number, now = Date.now(), locale = 'it'): string {
  const diff = Math.round((ts - now) / 1000)
  const abs = Math.abs(diff)
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  if (abs < 45) return rtf.format(0, 'second').replace(/^./, (c) => c.toUpperCase())
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour')
  return rtf.format(Math.round(diff / 86400), 'day')
}
