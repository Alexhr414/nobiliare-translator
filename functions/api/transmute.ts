/**
 * Cloudflare Pages Function: POST /api/transmute
 *
 * Server-side proxy in front of the OpenAI-compatible API so the key never
 * reaches the browser. Configure with Pages secrets/vars:
 *   OPENAI_API_KEY   (required)  wrangler pages secret put OPENAI_API_KEY
 *   OPENAI_BASE_URL  (optional)  default https://api.openai.com/v1
 *   OPENAI_MODEL     (optional)  default gpt-4o-mini
 */
import type { LlmEnv } from '../../src/engine/llm.ts'
import { handleTransmute } from '../../src/server/transmute.ts'

export const onRequest: PagesFunction<LlmEnv> = (context) => handleTransmute(context.request, context.env)
