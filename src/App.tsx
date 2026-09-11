import { useCallback, useEffect, useRef, useState } from 'react'
import type { LlmStatus } from '@/engine/api'
import { fetchLlmStatus, translate, type Fallback } from '@/engine/translate'
import type { Translation } from '@/engine/types'
import { DemoBanner } from '@/components/DemoBanner'
import { Footer } from '@/components/Footer'
import { Glossary } from '@/components/Glossary'
import { Header } from '@/components/Header'
import { HistoryPanel } from '@/components/HistoryPanel'
import { InputPanel } from '@/components/InputPanel'
import { Results } from '@/components/Results'
import { useHistory } from '@/hooks/useHistory'

export default function App() {
  const [input, setInput] = useState('')
  const [current, setCurrent] = useState<Translation | null>(null)
  const [busy, setBusy] = useState(false)
  const [fallback, setFallback] = useState<Fallback | null>(null)
  // `null` while the probe is in flight, so the header can show "checking" instead of a wrong badge.
  const [llmStatus, setLlmStatus] = useState<LlmStatus | null>(null)
  const history = useHistory()
  const { add: addToHistory } = history
  const inflight = useRef<AbortController | null>(null)

  useEffect(() => () => inflight.current?.abort(), [])

  useEffect(() => {
    const controller = new AbortController()
    fetchLlmStatus({ signal: controller.signal })
      .then((status) => {
        if (!controller.signal.aborted) setLlmStatus(status)
      })
      .catch(() => {})
    return () => controller.abort()
  }, [])

  const run = useCallback(
    async (text: string, variant: number) => {
      const phrase = text.trim()
      if (!phrase) return
      inflight.current?.abort()
      const controller = new AbortController()
      inflight.current = controller
      setBusy(true)
      setFallback(null)
      try {
        const { translation, fallback: reason } = await translate(phrase, {
          variant,
          signal: controller.signal,
        })
        if (controller.signal.aborted) return
        setCurrent(translation)
        setFallback(reason ?? null)
        // A live answer means the key is wired up even if the probe had said otherwise.
        if (translation.source === 'llm') {
          setLlmStatus({ provider: 'minimax', configured: true, model: translation.model ?? null })
        } else if (reason?.kind === 'unconfigured') {
          setLlmStatus({ provider: 'minimax', configured: false, model: null })
        }
        addToHistory(translation)
      } catch (error) {
        if (controller.signal.aborted) return
        setFallback({ kind: 'failed', message: error instanceof Error ? error.message : String(error) })
      } finally {
        if (inflight.current === controller) {
          inflight.current = null
          setBusy(false)
        }
      }
    },
    [addToHistory],
  )

  const onSubmit = useCallback(() => {
    const phrase = input.trim()
    // Re-submitting the same phrase behaves like "regenerate" instead of echoing the same variant.
    const variant = current && current.input === phrase ? current.variant + 1 : 0
    void run(phrase, variant)
  }, [input, current, run])

  const onRegenerate = useCallback(() => {
    if (!current) return
    void run(current.input, current.variant + 1)
  }, [current, run])

  const onClear = useCallback(() => {
    inflight.current?.abort()
    inflight.current = null
    setBusy(false)
    setInput('')
    setCurrent(null)
    setFallback(null)
  }, [])

  const onSelectHistory = useCallback((t: Translation) => {
    setInput(t.input)
    setCurrent(t)
    setFallback(null)
  }, [])

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 sm:px-6">
      <Header status={llmStatus} />

      <main className="flex flex-1 flex-col gap-6 pb-10">
        <DemoBanner status={llmStatus} fallback={fallback} onDismissFallback={() => setFallback(null)} />

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <InputPanel
            value={input}
            onChange={setInput}
            onSubmit={onSubmit}
            onRegenerate={onRegenerate}
            onClear={onClear}
            busy={busy}
            canRegenerate={current !== null}
          />

          <aside className="order-last flex flex-col gap-6 lg:order-none">
            <HistoryPanel
              items={history.items}
              activeId={current?.id ?? null}
              onSelect={onSelectHistory}
              onRemove={history.remove}
              onClear={history.clear}
            />
            <Glossary />
          </aside>

          <div className="lg:col-span-2">
            <Results translation={current} busy={busy} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
