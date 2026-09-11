import { Feather } from 'lucide-react'

export function Footer() {
  return (
    <footer className="text-ink-soft flex flex-col items-center gap-2 py-8 text-center text-xs">
      <Feather className="text-gold size-4" strokeWidth={1.5} aria-hidden />
      <p className="font-display text-sm italic">
        Redatto presso la magione di Rancido Stilnterra, con solerzia protocollare e sarcasmo aulico.
      </p>
      <p className="font-cjk">于朗奇多·斯蒂尔恩特拉府邸撰写，勤勉合礼，雅言讥讽。</p>
      <p>
        Le frasi viaggiano solo verso l&apos;API di questo sito (<code>/api/transmute</code>) · la cronologia vive in{' '}
        <code>localStorage</code>.
      </p>
    </footer>
  )
}
