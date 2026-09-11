import { FlaskConical, TriangleAlert, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DemoBannerProps {
  llmEnabled: boolean
  fallbackReason: string | null
  onDismissFallback: () => void
}

export function DemoBanner({ llmEnabled, fallbackReason, onDismissFallback }: DemoBannerProps) {
  if (llmEnabled && !fallbackReason) return null

  if (fallbackReason) {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/8 px-4 py-3 text-sm text-ink"
      >
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
        <div className="flex-1 space-y-1">
          <p className="font-medium">
            Il modello linguistico non ha risposto: risultato prodotto dal motore dimostrativo.
            <span className="font-cjk text-ink-soft"> · 语言模型未响应，已改用演示引擎。</span>
          </p>
          <p className="text-ink-soft font-mono text-xs break-all">{fallbackReason}</p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onDismissFallback} aria-label="Chiudi avviso">
          <X />
        </Button>
      </div>
    )
  }

  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-lg border border-gold/50 bg-gold-soft/30 px-4 py-3 text-sm text-ink"
    >
      <FlaskConical className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
      <div className="space-y-0.5">
        <p className="font-medium">
          Modalità dimostrativa: le trasmutazioni sono generate offline da un motore a modelli, senza alcun servizio
          esterno.
        </p>
        <p className="font-cjk text-ink-soft">演示模式：所有转化均由离线模板引擎生成，不调用任何外部服务。</p>
        <p className="text-ink-soft text-xs">
          Per attivare un LLM compatibile OpenAI imposta <code className="rounded bg-ink/8 px-1 py-0.5">VITE_OPENAI_API_KEY</code>{' '}
          al momento della build (vedi README).
        </p>
      </div>
    </div>
  )
}
