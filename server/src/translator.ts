import { CONCEPTS, type Concept } from "./dictionary.js";
import type { Lang, Register, RegisterSet, TranslateResult } from "./types.js";

export const REGISTERS: Register[] = ["comune", "nobiliare", "aulico"];

/**
 * Normalize a string for matching: trim, lowercase, collapse whitespace,
 * and strip trailing punctuation. Chinese text is unaffected by casing.
 */
function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.!?;:,，。！？；：、]+$/g, "")
    .trim();
}

function findConcept(text: string, from: Lang): Concept | null {
  const needle = normalize(text);
  if (!needle) return null;
  for (const concept of CONCEPTS) {
    const variants = concept[from];
    for (const register of REGISTERS) {
      if (normalize(variants[register]) === needle) {
        return concept;
      }
    }
  }
  return null;
}

/**
 * Translate a phrase from one language to the other, returning all three
 * registers (comune, nobiliare, aulico) in the target language.
 *
 * When no curated concept matches, the input is echoed across all registers
 * and `matched` is false, so callers can flag an untranslated phrase.
 */
export function translate(text: string, from: Lang, to: Lang): TranslateResult {
  const concept = findConcept(text, from);

  if (!concept) {
    const echo: RegisterSet = { comune: text, nobiliare: text, aulico: text };
    return {
      input: text,
      from,
      to,
      matched: false,
      conceptId: null,
      gloss: null,
      translations: echo,
    };
  }

  return {
    input: text,
    from,
    to,
    matched: true,
    conceptId: concept.id,
    gloss: concept.gloss,
    translations: { ...concept[to] },
  };
}

/** All curated phrases in a language, useful for suggestions in the UI. */
export function phrasebook(lang: Lang): Array<{ id: string; gloss: string; comune: string }> {
  return CONCEPTS.map((c) => ({ id: c.id, gloss: c.gloss, comune: c[lang].comune }));
}
