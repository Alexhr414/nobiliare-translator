import type { CSSProperties } from 'react'
import { Check, Copy } from 'lucide-react'
import type { LevelMeta, Rendering } from '@/engine/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface ResultCardProps {
  meta: LevelMeta
  rendering: Rendering
  copiedKey: string | null
  onCopy: (key: string, text: string) => void
  style?: CSSProperties
}

const ACCENT: Record<LevelMeta['id'], string> = {
  diretta: 'border-t-ink-soft/60',
  standard: 'border-t-gold',
  spietata: 'border-t-wine',
}

function CopyButton({
  copied,
  label,
  onClick,
  className,
}: {
  copied: boolean
  label: string
  onClick: () => void
  className?: string
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn('h-7 gap-1 px-2 text-xs text-ink-soft hover:text-ink', className)}
    >
      {copied ? <Check className="text-wine" /> : <Copy />}
      <span>{copied ? 'Copiato' : 'Copia'}</span>
    </Button>
  )
}

export function ResultCard({ meta, rendering, copiedKey, onCopy, style }: ResultCardProps) {
  const keyIt = `${meta.id}:it`
  const keyZh = `${meta.id}:zh`
  const keyBoth = `${meta.id}:both`

  return (
    <Card
      style={style}
      className={cn(
        'animate-in fade-in-0 slide-in-from-bottom-2 h-full gap-3 border-t-4 py-4 duration-500 fill-mode-both',
        ACCENT[meta.id],
      )}
    >
      <CardHeader className="gap-1 px-4 sm:px-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-gold font-display text-xs font-semibold tracking-[0.2em] uppercase">
              Livello {meta.ordinal}
            </p>
            <h3 className="font-display text-ink text-lg leading-tight font-semibold sm:text-xl">{meta.title.it}</h3>
            <p className="font-cjk text-ink-soft text-sm">{meta.title.zh}</p>
          </div>
          <CopyButton
            copied={copiedKey === keyBoth}
            label={`Copia livello ${meta.ordinal} (IT + ZH)`}
            onClick={() => onCopy(keyBoth, `${rendering.it}\n${rendering.zh}`)}
            className="shrink-0"
          />
        </div>
        <p className="text-ink-soft/80 text-xs italic">
          {meta.subtitle.it} <span className="font-cjk not-italic">· {meta.subtitle.zh}</span>
        </p>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 px-4 sm:px-5">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-ink-soft/70 text-[11px] font-medium tracking-[0.18em] uppercase">Italiano</span>
            <CopyButton
              copied={copiedKey === keyIt}
              label={`Copia livello ${meta.ordinal} in italiano`}
              onClick={() => onCopy(keyIt, rendering.it)}
              className="-mr-2"
            />
          </div>
          <p lang="it" className="font-display drop-cap text-ink text-[1.05rem] leading-relaxed sm:text-lg">
            {rendering.it}
          </p>
        </div>

        <Separator className="bg-linear-to-r from-transparent via-border to-transparent" />

        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-ink-soft/70 text-[11px] font-medium tracking-[0.18em] uppercase">
              中文 <span className="normal-case tracking-normal">· Cinese</span>
            </span>
            <CopyButton
              copied={copiedKey === keyZh}
              label={`Copia livello ${meta.ordinal} in cinese`}
              onClick={() => onCopy(keyZh, rendering.zh)}
              className="-mr-2"
            />
          </div>
          <p lang="zh-Hans" className="font-cjk text-ink text-base leading-loose sm:text-[1.05rem]">
            {rendering.zh}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
