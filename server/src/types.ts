export type Lang = "it" | "zh";

export type Register = "comune" | "nobiliare" | "aulico";

export type RegisterSet = Record<Register, string>;

export interface TranslateRequest {
  text: string;
  from: Lang;
  to: Lang;
}

export interface TranslateResult {
  input: string;
  from: Lang;
  to: Lang;
  matched: boolean;
  conceptId: string | null;
  gloss: string | null;
  translations: RegisterSet;
}
