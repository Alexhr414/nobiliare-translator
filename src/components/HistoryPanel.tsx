import { History, Trash2, X } from 'lucide-react'
import type { Translation } from '@/engine/types'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'

interface HistoryPanelProps {
  items: Translation[]
  activeId: string | null
  onSelect: (t: Translation) => void
  onRemove: (id: string) => void
  onClear: () => void
}

export function HistoryPanel({ items, activeId, onSelect, onRemove, onClear }: HistoryPanelProps) {
  return (
    <section aria-label="Cronologia" className="paper-card rounded-xl border p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-display text-ink flex items-center gap-2 text-lg font-semibold">
          <History className="text-gold size-4" aria-hidden />
          Cronologia <span className="font-cjk text-ink-soft text-sm font-normal">· 历史记录</span>
        </h2>
        {items.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-ink-soft h-7 px-2 text-xs">
            <Trash2 /> Svuota
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-ink-soft text-sm italic">
          Nessuna trasmutazione ancora. Le ultime resteranno qui, salvate nel browser.
          <span className="font-cjk not-italic"> · 尚无记录；最近的转化将保存在浏览器中。</span>
        </p>
      ) : (
        <ul className="-mx-1 max-h-80 space-y-1 overflow-y-auto pr-1">
          {items.map((t) => {
            const active = t.id === activeId
            return (
              <li key={t.id} className="group flex items-start gap-1">
                <button
                  type="button"
                  onClick={() => onSelect(t)}
                  aria-current={active || undefined}
                  className={cn(
                    'min-w-0 flex-1 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-gold-soft/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                    active && 'bg-gold-soft/50',
                  )}
                >
                  <p className="font-display text-ink truncate text-sm">{t.input}</p>
                  <p className="text-ink-soft mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px]">
                    <span>{t.intentLabel.it}</span>
                    <span aria-hidden>·</span>
                    <span>{t.source === 'llm' ? 'LLM' : `demo v${t.variant + 1}`}</span>
                    <span aria-hidden>·</span>
                    <time dateTime={new Date(t.createdAt).toISOString()}>{formatRelativeTime(t.createdAt)}</time>
                  </p>
                </button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onRemove(t.id)}
                  aria-label={`Rimuovi «${t.input}» dalla cronologia`}
                  className="text-ink-soft mt-0.5 size-7 opacity-60 group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <X />
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
