import { BookOpen, ChevronDown } from 'lucide-react'
import { GLOSSARY } from '@/engine/lexicon'

export function Glossary() {
  return (
    <details className="paper-card group rounded-xl border open:pb-4">
      <summary className="font-display text-ink flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-lg font-semibold select-none sm:px-5 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          <BookOpen className="text-gold size-4" aria-hidden />
          Lessico della casata <span className="font-cjk text-ink-soft text-sm font-normal">· 家族词汇</span>
        </span>
        <ChevronDown className="text-ink-soft size-4 transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <dl className="grid gap-x-6 gap-y-3 px-4 sm:grid-cols-2 sm:px-5">
        {GLOSSARY.map((g) => (
          <div key={g.term} className="border-gold/40 border-l-2 pl-3">
            <dt className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-display text-wine text-base font-semibold">{g.term}</span>
              <span className="font-cjk text-ink-soft text-sm">{g.zh}</span>
            </dt>
            <dd className="text-ink-soft text-sm">
              {g.meaning.it} <span className="font-cjk">· {g.meaning.zh}</span>
            </dd>
          </div>
        ))}
      </dl>
    </details>
  )
}
