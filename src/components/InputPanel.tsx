import { useCallback, useId, type KeyboardEvent } from 'react'
import { CornerDownLeft, Eraser, LoaderCircle, RotateCcw, WandSparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const MAX_INPUT = 600

const EXAMPLES: readonly string[] = [
  'Vattene, non ho tempo per te.',
  'Sei stato bravissimo, complimenti!',
  'Ho fame, andiamo a mangiare?',
  'Sei sempre in ritardo.',
  'Mi passi il sale, per favore?',
  'Ti amo.',
  '你真是个白痴。',
  '谢谢你帮我。',
]

interface InputPanelProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onRegenerate: () => void
  onClear: () => void
  busy: boolean
  canRegenerate: boolean
}

export function InputPanel({ value, onChange, onSubmit, onRegenerate, onClear, busy, canRegenerate }: InputPanelProps) {
  const id = useId()
  const trimmed = value.trim()
  const empty = trimmed.length === 0
  const overflow = value.length > MAX_INPUT

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (!busy && !empty && !overflow) onSubmit()
      }
    },
    [busy, empty, overflow, onSubmit],
  )

  return (
    <section aria-labelledby={`${id}-label`} className="paper-card rounded-xl border p-4 sm:p-6">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <label id={`${id}-label`} htmlFor={`${id}-input`} className="font-display text-lg font-semibold text-ink">
          La frase da trasmutare <span className="font-cjk text-ink-soft font-normal">· 待转化的语句</span>
        </label>
        <span className={cn('text-xs tabular-nums', overflow ? 'text-destructive' : 'text-ink-soft')}>
          {value.length} / {MAX_INPUT}
        </span>
      </div>

      <Textarea
        id={`${id}-input`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Scrivi qui, in italiano o in cinese… 在此输入，中文或意大利文均可…"
        aria-invalid={overflow || undefined}
        className="font-display min-h-32 resize-y bg-background/70 text-lg leading-relaxed sm:min-h-36 sm:text-xl"
        autoFocus
        spellCheck
        maxLength={MAX_INPUT * 2}
      />

      <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Esempi">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => onChange(ex)}
            className="rounded-full border border-border/80 bg-background/60 px-2.5 py-1 text-xs text-ink-soft transition-colors hover:border-gold hover:bg-gold-soft/40 hover:text-ink focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            {ex}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRegenerate} disabled={busy || !canRegenerate}>
            <RotateCcw />
            Rigenera <span className="font-cjk text-ink-soft">· 重生成</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onClear} disabled={busy || (empty && !canRegenerate)}>
            <Eraser />
            Pulisci <span className="font-cjk text-ink-soft">· 清空</span>
          </Button>
        </div>

        <div className="flex flex-col items-stretch gap-1 sm:items-end">
          <Button size="lg" onClick={onSubmit} disabled={busy || empty || overflow} className="font-display text-lg">
            {busy ? <LoaderCircle className="animate-spin" /> : <WandSparkles />}
            Trasmuta <span className="font-cjk opacity-90">/ 转化</span>
          </Button>
          <span className="hidden items-center justify-end gap-1 text-[11px] text-ink-soft sm:flex">
            <kbd className="rounded border bg-background/70 px-1 font-mono">Ctrl</kbd>+
            <kbd className="rounded border bg-background/70 px-1 font-mono">
              <CornerDownLeft className="inline size-3" aria-label="Enter" />
            </kbd>
          </span>
        </div>
      </div>
    </section>
  )
}
