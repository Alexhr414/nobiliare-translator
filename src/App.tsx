import { useCallback, useEffect, useRef, useState } from 'react'
import { isLlmEnabled, llmConfig, translate } from '@/engine/translate'
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
  const [fallbackReason, setFallbackReason] = useState<string | null>(null)
  const history = useHistory()
  const { add: addToHistory } = history
  const inflight = useRef<AbortController | null>(null)

  useEffect(() => () => inflight.current?.abort(), [])

  const run = useCallback(
    async (text: string, variant: number) => {
      const phrase = text.trim()
      if (!phrase) return
      inflight.current?.abort()
      const controller = new AbortController()
      inflight.current = controller
      setBusy(true)
      setFallbackReason(null)
      try {
        const { translation, fallbackReason: reason } = await translate(phrase, {
          variant,
          signal: controller.signal,
        })
        if (controller.signal.aborted) return
        setCurrent(translation)
        setFallbackReason(reason ?? null)
        addToHistory(translation)
      } catch (error) {
        if (controller.signal.aborted) return
        setFallbackReason(error instanceof Error ? error.message : String(error))
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
    setFallbackReason(null)
  }, [])

  const onSelectHistory = useCallback((t: Translation) => {
    setInput(t.input)
    setCurrent(t)
    setFallbackReason(null)
  }, [])

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 sm:px-6">
      <Header llmEnabled={isLlmEnabled} model={llmConfig?.model} />

      <main className="flex flex-1 flex-col gap-6 pb-10">
        <DemoBanner
          llmEnabled={isLlmEnabled}
          fallbackReason={fallbackReason}
          onDismissFallback={() => setFallbackReason(null)}
        />

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
