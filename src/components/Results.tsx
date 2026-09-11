import { Check, Copy, Cpu, FlaskConical, Quote } from 'lucide-react'
import { LEVEL_META, type Translation } from '@/engine/types'
import { ResultCard } from '@/components/ResultCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCopy } from '@/hooks/useCopy'
import { formatTranslation } from '@/lib/format'

interface ResultsProps {
  translation: Translation | null
  busy: boolean
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/80 px-6 py-14 text-center">
      <Quote className="text-gold size-8" strokeWidth={1.25} aria-hidden />
      <p className="font-display text-ink-soft max-w-md text-balance text-lg italic">
        Le tre versioni compariranno qui, come pergamene srotolate al cospetto della corte.
      </p>
      <p className="font-cjk text-ink-soft/80 text-sm">三种版本将在此展开，如同在宫廷前徐徐展开的卷轴。</p>
    </div>
  )
}

export function Results({ translation, busy }: ResultsProps) {
  const { copy, copiedKey } = useCopy()

  if (!translation) return <EmptyState />

  const allKey = 'all'
  return (
    <section aria-label="Risultati" aria-busy={busy} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h2 className="font-display text-ink text-xl font-semibold sm:text-2xl">
            Le tre versioni <span className="font-cjk text-ink-soft text-base font-normal">· 三重版本</span>
          </h2>
          <Badge variant="gold" title="Intento rilevato">
            {translation.intentLabel.it} · <span className="font-cjk">{translation.intentLabel.zh}</span>
          </Badge>
          {translation.source === 'llm' ? (
            <Badge variant="wine" title={translation.model}>
              <Cpu /> LLM{translation.model ? ` · ${translation.model}` : ''}
            </Badge>
          ) : (
            <Badge variant="outline">
              <FlaskConical /> demo · variante {translation.variant + 1}
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => void copy(allKey, formatTranslation(translation))}>
          {copiedKey === allKey ? <Check className="text-wine" /> : <Copy />}
          {copiedKey === allKey ? 'Copiato tutto' : 'Copia tutto'} <span className="font-cjk text-ink-soft">· 全部复制</span>
        </Button>
      </div>

      <p className="font-display text-ink-soft border-l-2 border-gold/60 pl-3 text-sm italic">
        «{translation.input}»
      </p>

      <div className={busy ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
        <div className="grid gap-4 md:grid-cols-3">
          {LEVEL_META.map((meta, i) => (
            <ResultCard
              key={`${translation.id}-${meta.id}`}
              meta={meta}
              rendering={translation.levels[meta.id]}
              copiedKey={copiedKey}
              onCopy={(k, t) => void copy(k, t)}
              style={{ animationDelay: `${i * 90}ms` }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
