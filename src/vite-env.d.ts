/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** `demo` forces the offline template engine; anything else uses `/api/transmute`. */
  readonly VITE_TRANSLATE_MODE?: string
}
