import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { demoTranslate, hashString, variantCount } from '../src/engine/demo.ts'
import { detectIntent, detectScript } from '../src/engine/intents.ts'
import { GLOSSARY, bare, ennoble } from '../src/engine/lexicon.ts'
import { TEMPLATES } from '../src/engine/templates.ts'
import { LEVELS, type IntentId } from '../src/engine/types.ts'

describe('detectIntent', () => {
  const cases: [string, IntentId][] = [
    ['Ciao, come va?', 'greeting'],
    ['Vattene, non ho tempo per te.', 'dismissal'],
    ['Sei stato bravissimo, complimenti!', 'praise'],
    ['Sei un idiota.', 'insult'],
    ['Ho fame, andiamo a mangiare?', 'hunger'],
    ['Sono stanco morto.', 'fatigue'],
    ['Ti amo.', 'affection'],
    ['Grazie mille!', 'gratitude'],
    ['Scusa, ho sbagliato.', 'apology'],
    ['Non voglio venire.', 'refusal'],
    ['Va bene, facciamo così.', 'agreement'],
    ['Mi passi il sale, per favore?', 'request'],
    ['Chiudi la porta subito.', 'command'],
    ['Perché il cielo è blu?', 'question'],
    ['Che palle, di nuovo.', 'complaint'],
    ['Mi devi cento euro.', 'money'],
    ['Sei sempre in ritardo.', 'lateness'],
    ['Te ne pentirai.', 'threat'],
    ['Sono il migliore, e lo sai.', 'boast'],
    ['Domani piove.', 'statement'],
    ['你真是个白痴。', 'insult'],
    ['谢谢你帮我。', 'gratitude'],
    ['我饿了。', 'hunger'],
    ['滚。', 'dismissal'],
  ]
  for (const [phrase, expected] of cases) {
    it(`classifies "${phrase}" as ${expected}`, () => {
      assert.equal(detectIntent(phrase), expected)
    })
  }

  it('falls back to statement for empty input', () => {
    assert.equal(detectIntent('   '), 'statement')
  })
})

describe('detectScript', () => {
  it('recognises CJK', () => assert.equal(detectScript('我爱你'), 'zh'))
  it('recognises Latin', () => assert.equal(detectScript('Ti amo'), 'latin'))
})

describe('lexicon', () => {
  it('ennobles common words while preserving capitalisation', () => {
    assert.equal(ennoble('Vai a casa'), 'Incedete a magione')
    assert.equal(ennoble('sei stupido'), "sei coatto di vacuità d'ingegno")
  })
  it('strips trailing punctuation', () => {
    assert.equal(bare('Ho fame!!! '), 'Ho fame')
    assert.equal(bare('你好。'), '你好')
  })
  it('exposes the full house glossary', () => {
    const terms = GLOSSARY.map((g) => g.term)
    for (const t of [
      'incedere',
      'magione',
      'augusta persona',
      'nocumento',
      "vacuità d'ingegno",
      'coatto',
      'protocollare',
      'solerte',
      'celestiale',
      'velleità',
    ]) {
      assert.ok(terms.includes(t), `missing ${t}`)
    }
  })
})

describe('templates', () => {
  it('cover every intent and level in both languages', () => {
    for (const [intent, set] of Object.entries(TEMPLATES)) {
      for (const level of LEVELS) {
        const pool = set[level]
        assert.ok(pool.length >= 2, `${intent}/${level} needs at least 2 variants`)
        for (const r of pool) {
          assert.ok(r.it.trim().length > 0, `${intent}/${level} empty it`)
          assert.ok(/[\u4e00-\u9fff]/u.test(r.zh), `${intent}/${level} zh lacks CJK`)
          assert.ok(/\{(?:orig|noble|Noble|q)\}/.test(r.it) || /\{(?:orig|noble|Noble|q)\}/.test(r.zh), `${intent}/${level} template ignores the input`)
        }
      }
    }
  })

  it('noble levels use the house lexicon', () => {
    const lexicon = /incede|magione|augusta persona|nocumento|vacuità|coatt|protocoll|solerz|solerte|celestial|velleità/i
    for (const [intent, set] of Object.entries(TEMPLATES)) {
      for (const level of ['standard', 'spietata'] as const) {
        for (const r of set[level]) {
          assert.match(r.it, lexicon, `${intent}/${level}: "${r.it}"`)
        }
      }
    }
  })
})

describe('demoTranslate', () => {
  it('produces all three levels with Italian and Chinese', () => {
    const t = demoTranslate('Vattene, non ho tempo per te.', { now: 1 })
    assert.equal(t.source, 'demo')
    assert.equal(t.intent, 'dismissal')
    for (const level of LEVELS) {
      assert.ok(t.levels[level].it.length > 0)
      assert.ok(/[\u4e00-\u9fff]/u.test(t.levels[level].zh))
      assert.ok(t.levels[level].zh.includes('「Vattene, non ho tempo per te」'))
    }
  })

  it('is deterministic for the same input and variant', () => {
    const a = demoTranslate('Ho fame', { variant: 0, now: 1 })
    const b = demoTranslate('Ho fame', { variant: 0, now: 1 })
    assert.deepEqual(a.levels, b.levels)
  })

  it('changes with the variant', () => {
    const a = demoTranslate('Ho fame', { variant: 0, now: 1 })
    const b = demoTranslate('Ho fame', { variant: 1, now: 1 })
    assert.notDeepEqual(a.levels, b.levels)
    assert.ok(variantCount('Ho fame') >= 3)
  })

  it('keeps question marks on questions', () => {
    const t = demoTranslate('Perché sei in ritardo?', { now: 1 })
    // "in ritardo" wins over the interrogative, but the punctuation is still restored where relevant
    assert.equal(t.intent, 'lateness')
    const q = demoTranslate('Perché il cielo è blu?', { now: 1 })
    assert.equal(q.intent, 'question')
    for (const level of LEVELS) {
      assert.match(q.levels[level].it, /\?$/)
      assert.match(q.levels[level].zh, /？$/)
    }
  })

  it('never leaves unfilled placeholders', () => {
    for (const phrase of ['Ciao', 'Sei un genio', '我爱你', 'Pagami subito!', 'Boh']) {
      const t = demoTranslate(phrase, { now: 1 })
      for (const level of LEVELS) {
        assert.doesNotMatch(t.levels[level].it, /\{\w+\}/)
        assert.doesNotMatch(t.levels[level].zh, /\{\w+\}/)
      }
    }
  })

  it('hashes stably', () => {
    assert.equal(hashString('abc'), hashString('abc'))
    assert.notEqual(hashString('abc'), hashString('abd'))
  })
})
