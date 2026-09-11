import { useEffect, useMemo, useState } from "react";
import type { Lang, PhrasebookEntry, Register, TranslateResult } from "./types";

const LANG_LABELS: Record<Lang, string> = {
  it: "Italiano",
  zh: "中文",
};

const REGISTERS: { key: Register; label: string; tag: string; hint: string }[] = [
  { key: "comune", label: "Comune", tag: "常用", hint: "Registro quotidiano" },
  { key: "nobiliare", label: "Nobiliare", tag: "雅", hint: "Registro raffinato" },
  { key: "aulico", label: "Aulico", tag: "典雅", hint: "Registro cortese e letterario" },
];

export default function App() {
  const [from, setFrom] = useState<Lang>("it");
  const to: Lang = from === "it" ? "zh" : "it";

  const [text, setText] = useState("Ciao");
  const [result, setResult] = useState<TranslateResult | null>(null);
  const [phrases, setPhrases] = useState<PhrasebookEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthy, setHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => setHealthy(r.ok))
      .catch(() => setHealthy(false));
  }, []);

  useEffect(() => {
    fetch(`/api/phrasebook?lang=${from}`)
      .then((r) => r.json())
      .then((data) => setPhrases(data.phrases ?? []))
      .catch(() => setPhrases([]));
  }, [from]);

  async function doTranslate(input: string, fromLang: Lang, toLang: Lang) {
    const trimmed = input.trim();
    if (!trimmed) {
      setResult(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, from: fromLang, to: toLang }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Errore ${res.status}`);
      }
      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function swap() {
    const next: Lang = to;
    setFrom(next);
    setText("");
    setResult(null);
  }

  const placeholder = useMemo(
    () => (from === "it" ? "Scrivi una frase in italiano…" : "输入中文短语…"),
    [from],
  );

  return (
    <div className="page">
      <header className="hero">
        <div className="crest" aria-hidden>⚜</div>
        <h1>Nobiliare Translator</h1>
        <p className="subtitle">
          Traduttore Italiano · 中文 a tre livelli di registro
        </p>
        <span className={`status ${healthy ? "ok" : healthy === false ? "down" : ""}`}>
          {healthy == null ? "…" : healthy ? "API connessa" : "API non raggiungibile"}
        </span>
      </header>

      <main className="panel">
        <div className="direction">
          <span className="lang">{LANG_LABELS[from]}</span>
          <button className="swap" onClick={swap} title="Inverti lingue" aria-label="Inverti lingue">
            ⇄
          </button>
          <span className="lang">{LANG_LABELS[to]}</span>
        </div>

        <textarea
          className="input"
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") doTranslate(text, from, to);
          }}
          rows={3}
        />

        <div className="actions">
          <button className="translate" onClick={() => doTranslate(text, from, to)} disabled={loading}>
            {loading ? "Traduco…" : "Traduci"}
          </button>
          <span className="hint">⌘/Ctrl + Invio</span>
        </div>

        <div className="chips">
          {phrases.slice(0, 10).map((p) => (
            <button
              key={p.id}
              className="chip"
              onClick={() => {
                setText(p.comune);
                doTranslate(p.comune, from, to);
              }}
              title={p.gloss}
            >
              {p.comune}
            </button>
          ))}
        </div>

        {error && <div className="error">⚠ {error}</div>}

        {result && (
          <section className="results">
            {!result.matched && (
              <div className="note">
                Nessuna corrispondenza nel lessico curato: mostro il testo originale.
                Prova una delle frasi suggerite qui sopra.
              </div>
            )}
            {result.matched && result.gloss && (
              <div className="gloss">Concetto: <em>{result.gloss}</em></div>
            )}
            <div className="cards">
              {REGISTERS.map((r) => (
                <article key={r.key} className={`card card-${r.key}`}>
                  <div className="card-head">
                    <span className="card-title">{r.label}</span>
                    <span className="card-tag">{r.tag}</span>
                  </div>
                  <p className="card-text" lang={to}>
                    {result.translations[r.key]}
                  </p>
                  <span className="card-hint">{r.hint}</span>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="foot">
        Nobiliare · Aulico — lessico curato · {LANG_LABELS.it} ⇄ {LANG_LABELS.zh}
      </footer>
    </div>
  );
}
