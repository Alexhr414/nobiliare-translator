import assert from "node:assert/strict";
import { test } from "node:test";
import { translate, phrasebook, REGISTERS } from "./translator.js";

test("translates a common Italian greeting into all three Chinese registers", () => {
  const result = translate("Ciao", "it", "zh");
  assert.equal(result.matched, true);
  assert.equal(result.conceptId, "greeting");
  assert.equal(result.translations.comune, "你好");
  assert.equal(result.translations.nobiliare, "您好");
  assert.equal(result.translations.aulico, "敬颂台安");
});

test("matches on a non-common register variant of the source", () => {
  // "敬颂台安" is the aulico Chinese form; it should still resolve the concept.
  const result = translate("敬颂台安", "zh", "it");
  assert.equal(result.matched, true);
  assert.equal(result.conceptId, "greeting");
  assert.equal(result.translations.comune, "Ciao");
});

test("is case- and punctuation-insensitive", () => {
  const result = translate("  GRAZIE! ", "it", "zh");
  assert.equal(result.matched, true);
  assert.equal(result.conceptId, "thanks");
  assert.equal(result.translations.aulico, "感激不尽");
});

test("returns matched=false and echoes input when no concept is found", () => {
  const result = translate("supercalifragilistic", "it", "zh");
  assert.equal(result.matched, false);
  assert.equal(result.conceptId, null);
  for (const r of REGISTERS) {
    assert.equal(result.translations[r], "supercalifragilistic");
  }
});

test("phrasebook returns a common-register entry per concept", () => {
  const book = phrasebook("it");
  assert.ok(book.length > 0);
  const greeting = book.find((p) => p.id === "greeting");
  assert.equal(greeting?.comune, "Ciao");
});
