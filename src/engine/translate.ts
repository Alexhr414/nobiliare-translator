import { demoTranslate } from './demo.ts'
import { llmTranslate, readLlmConfig } from './llm.ts'
import type { Translation } from './types.ts'

export interface TranslateOptions {
  variant?: number
  signal?: AbortSignal
  /** Skip the LLM even if it is configured. */
  forceDemo?: boolean
}

export interface TranslateResult {
  translation: Translation
  /** Set when an LLM was configured but the call failed and demo mode took over. */
  fallbackReason?: string
}

export const llmConfig = readLlmConfig()
export const isLlmEnabled = llmConfig !== null

export async function translate(input: string, options: TranslateOptions = {}): Promise<TranslateResult> {
  const variant = options.variant ?? 0
  if (!llmConfig || options.forceDemo) {
    return { translation: demoTranslate(input, { variant }) }
  }
  try {
    const translation = await llmTranslate(input, llmConfig, { variant, signal: options.signal })
    return { translation }
  } catch (error) {
    if (options.signal?.aborted) throw error
    const reason = error instanceof Error ? error.message : String(error)
    return { translation: demoTranslate(input, { variant }), fallbackReason: reason }
  }
}
