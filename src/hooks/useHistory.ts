import { useCallback, useEffect, useState } from 'react'
import { LEVELS, type Translation } from '@/engine/types'

export const HISTORY_KEY = 'nobiliare-translator:history:v1'
export const HISTORY_LIMIT = 30

function isTranslation(value: unknown): value is Translation {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  if (typeof v.id !== 'string' || typeof v.input !== 'string' || typeof v.levels !== 'object' || v.levels === null) {
    return false
  }
  const levels = v.levels as Record<string, unknown>
  return LEVELS.every((l) => {
    const r = levels[l] as Record<string, unknown> | undefined
    return r && typeof r.it === 'string' && typeof r.zh === 'string'
  })
}

function load(): Translation[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isTranslation) : []
  } catch {
    return []
  }
}

function persist(items: Translation[]) {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(items))
  } catch {
    // Storage may be full or disabled (private mode); history simply stays in memory.
  }
}

export function useHistory() {
  const [items, setItems] = useState<Translation[]>(load)

  useEffect(() => {
    persist(items)
  }, [items])

  const add = useCallback((t: Translation) => {
    setItems((prev) => {
      const withoutDupes = prev.filter((p) => !(p.input === t.input && p.variant === t.variant && p.source === t.source))
      return [t, ...withoutDupes].slice(0, HISTORY_LIMIT)
    })
  }, [])

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  return { items, add, remove, clear }
}
