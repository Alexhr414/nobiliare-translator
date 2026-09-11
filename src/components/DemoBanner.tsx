import { FlaskConical, KeyRound, TriangleAlert, X } from 'lucide-react'
import type { LlmStatus } from '@/engine/api'
import type { Fallback } from '@/engine/translate'
import { Button } from '@/components/ui/button'

interface DemoBannerProps {
  /** `null` while the status probe is still in flight. */
  status: LlmStatus | null
  fallback: Fallback | null
  onDismissFallback: () => void
}

const SECRET_HINT = (
  <>
    Per attivare MiniMax imposta il segreto{' '}
    <code className="rounded bg-ink/8 px-1 py-0.5">wrangler pages secret put MINIMAX_API_KEY</code> sul progetto Cloudflare
    Pages e ridistribuisci (vedi README).
  </>
)

export function DemoBanner({ status, fallback, onDismissFallback }: DemoBannerProps) {
  if (fallback?.kind === 'failed') {
    return (
      <div
        role="alert"
        className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/8 px-4 py-3 text-sm text-ink"
      >
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
        <div className="flex-1 space-y-1">
          <p className="font-medium">
            MiniMax non ha risposto: il risultato qui sotto proviene dal motore dimostrativo offline.
            <span className="font-cjk text-ink-soft"> · MiniMax 未响应，以下结果由离线演示引擎生成。</span>
          </p>
          <p className="text-ink-soft font-mono text-xs break-all">{fallback.message}</p>
          <p className="text-ink-soft text-xs">Riprova con «Trasmuta» o «Rigenera» per interrogare di nuovo il modello.</p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onDismissFallback} aria-label="Chiudi avviso">
          <X />
        </Button>
      </div>
    )
  }

  if (fallback?.kind === 'unconfigured') {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-lg border border-gold/50 bg-gold-soft/30 px-4 py-3 text-sm text-ink"
      >
        <KeyRound className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
        <div className="flex-1 space-y-1">
          <p className="font-medium">
            Chiave MiniMax assente sul server: il risultato proviene dal motore dimostrativo offline.
            <span className="font-cjk text-ink-soft"> · 服务器未配置 MiniMax 密钥，以下结果由离线演示引擎生成。</span>
          </p>
          <p className="text-ink-soft text-xs">{SECRET_HINT}</p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onDismissFallback} aria-label="Chiudi avviso">
          <X />
        </Button>
      </div>
    )
  }

  if (status === null || status.configured) return null

  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-lg border border-gold/50 bg-gold-soft/30 px-4 py-3 text-sm text-ink"
    >
      <FlaskConical className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
      <div className="space-y-0.5">
        <p className="font-medium">
          Modalità dimostrativa: il modello MiniMax non è configurato, le trasmutazioni sono generate offline da un
          motore a modelli.
        </p>
        <p className="font-cjk text-ink-soft">演示模式：尚未配置 MiniMax 模型，所有转化均由离线模板引擎生成。</p>
        <p className="text-ink-soft text-xs">{SECRET_HINT}</p>
      </div>
    </div>
  )
}
