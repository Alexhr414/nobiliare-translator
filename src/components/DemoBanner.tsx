import { FlaskConical, TriangleAlert, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TranslateMode } from '@/engine/translate'

interface DemoBannerProps {
  mode: TranslateMode
  fallbackReason: string | null
  onDismissFallback: () => void
}

export function DemoBanner({ mode, fallbackReason, onDismissFallback }: DemoBannerProps) {
  if (mode === 'api' && !fallbackReason) return null

  if (fallbackReason) {
    return (
      <div
        role="alert"
        className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/8 px-4 py-3 text-sm text-ink"
      >
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
        <div className="flex-1 space-y-1">
          <p className="font-medium">
            L&apos;API di trasmutazione non ha risposto: questo risultato viene dal motore dimostrativo offline.
            <span className="font-cjk text-destructive"> · API 失败，演示模式</span>
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
          Questa build è stata creata con <code className="rounded bg-ink/8 px-1 py-0.5">VITE_TRANSLATE_MODE=demo</code>. In
          produzione le frasi passano dall&apos;API <code className="rounded bg-ink/8 px-1 py-0.5">/api/transmute</code>, che
          usa la chiave impostata come secret di Cloudflare Pages (vedi README).
        </p>
      </div>
    </div>
  )
}
