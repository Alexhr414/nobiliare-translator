import { Crown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { TranslateMode } from '@/engine/translate'

interface HeaderProps {
  mode: TranslateMode
  /** Model reported by the last successful API translation, if any. */
  model?: string
}

export function Header({ mode, model }: HeaderProps) {
  return (
    <header className="flex flex-col items-center gap-4 pt-10 pb-6 text-center sm:pt-14">
      <div className="flex items-center gap-3 text-gold">
        <span className="h-px w-10 bg-linear-to-r from-transparent to-gold sm:w-16" />
        <Crown className="size-6" strokeWidth={1.5} aria-hidden />
        <span className="h-px w-10 bg-linear-to-l from-transparent to-gold sm:w-16" />
      </div>

      <div className="space-y-2">
        <h1 className="font-display text-balance text-4xl leading-none font-semibold tracking-tight text-ink sm:text-5xl md:text-6xl">
          Nobiliare-Aulico <span className="text-wine italic">Translator</span>
        </h1>
        <p className="font-cjk text-xl text-ink-soft sm:text-2xl">贵族雅言转化器</p>
      </div>

      <p className="font-display max-w-2xl text-balance text-base text-ink-soft italic sm:text-lg">
        Trasmuta qualsiasi frase nel registro di corte di Rancido Stilnterra: tre livelli di raffinatezza, in italiano e
        in cinese, con l&apos;intento originale intatto.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge variant="gold">Volgare → Nobiliare → Spietata</Badge>
        <Badge variant="outline" className="font-cjk">
          直白 → 贵族 → 无情
        </Badge>
        {mode === 'api' ? (
          <Badge variant="wine" title={model ?? 'Traduzione tramite /api/transmute'}>
            LLM attivo{model ? ` · ${model}` : ''}
          </Badge>
        ) : (
          <Badge variant="secondary">Modalità demo · 演示模式</Badge>
        )}
      </div>
    </header>
  )
}
