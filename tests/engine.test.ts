import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { demoTranslate, hashString, variantCount } from '../src/engine/demo.ts'
import { detectIntent, detectScript, parseAddressee, stripCourtesy, stripInterjections } from '../src/engine/intents.ts'
import { GLOSSARY, bare, ennoble, vulgarize } from '../src/engine/lexicon.ts'
import { TEMPLATES } from '../src/engine/templates.ts'
import { LEVELS, SLOT_INTENTS, type IntentId, type Level } from '../src/engine/types.ts'

const CJK = /[\u4e00-\u9fff]/u
const TOPIC_SLOT = /\{(?:orig|noble|Noble|blunt|Blunt|q)\}/
const ANY_SLOT = /\{\w+\}/
const HOUSE_LEXICON =
  /incede|incedere|inceda|magione|augusta|nocumento|vacuità|coatt|protocoll|solerz|solerte|celestial|velleità|cerimoniale|quiete|ingegno/i

/** Intents that must ship as complete hand-written paraphrases (no topic slot). */
const HANDWRITTEN_REQUIRED: IntentId[] = [
  'praise',
  'dismissal',
  'disturbance',
  'insult',
  'silence',
  'refusal',
  'gratitude',
  'apology',
  'disagreement',
  'urgency',
  'affection',
  'boredom',
  'greeting',
  'farewell',
]

const allVariants = (input: string) => [0, 1, 2].map((variant) => demoTranslate(input, { variant, now: 1 }))

describe('detectIntent', () => {
  const cases: [string, IntentId][] = [
    ['Ciao, come va?', 'greeting'],
    ['Vattene, non ho tempo per te.', 'dismissal'],
    ['Sei stato bravissimo, complimenti!', 'praise'],
    ['Ale, hai delle idee della madonna!', 'praise'],
    ['Sei un idiota.', 'insult'],
    ['Sei un genio!', 'praise'],
    ['Sei un fallito.', 'insult'],
    ['Ho fame, andiamo a mangiare?', 'hunger'],
    ['Sono stanco morto.', 'fatigue'],
    ['Ti amo.', 'affection'],
    ['Grazie mille!', 'gratitude'],
    ['Scusa, ho sbagliato.', 'apology'],
    ['Non voglio venire.', 'refusal'],
    ['Va bene, facciamo così.', 'agreement'],
    ["Non sono d'accordo.", 'disagreement'],
    ['Ti sbagli di grosso.', 'disagreement'],
    ['Mi passi il sale, per favore?', 'request'],
    ['Chiudi la porta subito.', 'command'],
    ['Perché il cielo è blu?', 'question'],
    ['Che palle, di nuovo.', 'complaint'],
    ['Che noia mortale.', 'boredom'],
    ['Sbrigati, è urgente!', 'urgency'],
    ['Mi devi cento euro.', 'money'],
    ['Sei sempre in ritardo.', 'lateness'],
    ['Arrivo tardi, non aspettarmi.', 'delay'],
    ['Te ne pentirai.', 'threat'],
    ['Sono il migliore, e lo sai.', 'boast'],
    ['Mi stai disturbando.', 'disturbance'],
    ['Lasciami in pace.', 'disturbance'],
    ['Stai zitto.', 'silence'],
    ['Domani piove.', 'statement'],
    ['你真是个白痴。', 'insult'],
    ['谢谢你帮我。', 'gratitude'],
    ['我饿了。', 'hunger'],
    ['滚。', 'dismissal'],
    ['Ale，你这想法也太牛逼了吧！', 'praise'],
    ['你在打扰我。', 'disturbance'],
    ['别烦我。', 'disturbance'],
    ['闭嘴。', 'silence'],
    ['你错了。', 'disagreement'],
    ['快点！', 'urgency'],
    ['好无聊。', 'boredom'],
    ['我会晚到。', 'delay'],
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

describe('parseAddressee', () => {
  it('splits a leading vocative', () => {
    assert.deepEqual(parseAddressee('Ale, hai delle idee della madonna!'), {
      addressee: 'Ale',
      body: 'hai delle idee della madonna!',
    })
    assert.deepEqual(parseAddressee('Ale，你这想法也太牛逼了吧！'), { addressee: 'Ale', body: '你这想法也太牛逼了吧！' })
    assert.deepEqual(parseAddressee('老王，我饿了'), { addressee: '老王', body: '我饿了' })
  })
  it('does not mistake interjections for names', () => {
    for (const phrase of ['Ciao, come va?', 'Scusa, ho sbagliato.', 'No, non voglio.', 'Grazie, davvero.']) {
      assert.equal(parseAddressee(phrase).addressee, null, phrase)
    }
  })
})

describe('detectScript', () => {
  it('recognises CJK', () => assert.equal(detectScript('我爱你'), 'zh'))
  it('recognises Latin', () => assert.equal(detectScript('Ti amo'), 'latin'))
})

describe('lexicon', () => {
  it('ennobles common words while preserving capitalisation', () => {
    assert.equal(ennoble('Vai a casa'), 'Inceda a magione')
    assert.equal(ennoble('sei stupido'), "sei coatto di vacuità d'ingegno")
  })
  it('vulgarizes common words for the blunt level', () => {
    assert.equal(vulgarize('Chiudi la porta subito'), 'Chiudi la porta al volo')
    assert.equal(vulgarize('sono molto stanco'), 'sono un casino cotto')
  })
  it('strips trailing punctuation', () => {
    assert.equal(bare('Ho fame!!! '), 'Ho fame')
    assert.equal(bare('你好。'), '你好')
  })
  it('strips courtesy and exclamation markers from topic slots', () => {
    assert.equal(stripCourtesy('Per favore, mi passi il sale'), 'mi passi il sale')
    assert.equal(stripCourtesy('mi passi il sale, per favore'), 'mi passi il sale')
    assert.equal(stripCourtesy('per favore'), '')
    assert.equal(stripInterjections('Uffa, non funziona il wifi'), 'non funziona il wifi')
    assert.equal(stripInterjections('Che palle, di nuovo'), '')
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
  it('cover every intent and level with at least 3 bilingual variants', () => {
    for (const [intent, set] of Object.entries(TEMPLATES)) {
      for (const level of LEVELS) {
        const pool = set[level]
        assert.ok(pool.length >= 3, `${intent}/${level} needs at least 3 variants`)
        for (const r of pool) {
          assert.ok(r.it.replace(ANY_SLOT, '').trim().length > 0, `${intent}/${level} empty it`)
          assert.ok(CJK.test(r.zh), `${intent}/${level} zh lacks CJK`)
        }
      }
    }
  })

  it('hand-written intents never echo the input through a topic slot', () => {
    for (const [intent, set] of Object.entries(TEMPLATES)) {
      if (SLOT_INTENTS.includes(intent as IntentId)) continue
      for (const level of LEVELS) {
        for (const r of set[level]) {
          assert.doesNotMatch(r.it, TOPIC_SLOT, `${intent}/${level}: "${r.it}"`)
          assert.doesNotMatch(r.zh, TOPIC_SLOT, `${intent}/${level}: "${r.zh}"`)
        }
      }
    }
    for (const intent of HANDWRITTEN_REQUIRED) {
      assert.ok(!SLOT_INTENTS.includes(intent), `${intent} must be a hand-written set`)
    }
  })

  it('slot intents embed the topic in every variant of every level', () => {
    for (const intent of SLOT_INTENTS) {
      for (const level of LEVELS) {
        for (const r of TEMPLATES[intent][level]) {
          assert.match(r.it, TOPIC_SLOT, `${intent}/${level}: "${r.it}"`)
          assert.match(r.zh, TOPIC_SLOT, `${intent}/${level}: "${r.zh}"`)
        }
      }
    }
  })

  it('noble levels use the house lexicon and the Lei form; the blunt level does not', () => {
    for (const [intent, set] of Object.entries(TEMPLATES)) {
      for (const level of ['standard', 'spietata'] as const) {
        for (const r of set[level]) {
          assert.match(r.it, HOUSE_LEXICON, `${intent}/${level}: "${r.it}"`)
          assert.doesNotMatch(r.it, /\b(?:Vostr[aeio]|Voi)\b/u, `${intent}/${level} still uses the Voi form: "${r.it}"`)
        }
      }
      for (const r of set.diretta) {
        assert.doesNotMatch(r.it, /magione|nocumento|protocollare|solerzia|velleità|augusta/i, `${intent}/diretta too noble: "${r.it}"`)
      }
    }
  })

  it('contain the golden renderings', () => {
    const flat = (intent: IntentId, level: Level) => TEMPLATES[intent][level].map((r) => `${r.it}\n${r.zh}`).join('\n')
    assert.match(flat('praise', 'diretta'), /hai delle idee della madonna!/)
    assert.match(flat('praise', 'diretta'), /你这想法也太牛逼了吧！/)
    assert.match(flat('praise', 'spietata'), /fecondità del Suo ingegno[\s\S]*consessi[\s\S]*augusta genialità/)
    assert.match(flat('disturbance', 'standard'), /La prego di non arrecare ulteriore nocumento alla mia quiete\./)
    assert.match(flat('disturbance', 'spietata'), /Sarei infinitamente lieto di bearmi della Sua assenza/i)
    assert.match(flat('disturbance', 'diretta'), /Hai rotto/i)
  })
})

describe('demoTranslate', () => {
  it('produces all three levels with Italian and Chinese, without echoing the input', () => {
    const input = 'Vattene, non ho tempo per te.'
    const t = demoTranslate(input, { now: 1 })
    assert.equal(t.source, 'demo')
    assert.equal(t.intent, 'dismissal')
    for (const level of LEVELS) {
      assert.ok(t.levels[level].it.length > 0)
      assert.ok(CJK.test(t.levels[level].zh))
      assert.ok(!t.levels[level].zh.includes('Vattene'), `${level} zh echoes the input`)
      assert.ok(!t.levels[level].it.includes(bare(input)), `${level} it echoes the input`)
    }
  })

  describe('golden: praise for Ale', () => {
    for (const input of ['Ale, hai delle idee della madonna!', 'Ale，你这想法也太牛逼了吧！']) {
      for (const t of allVariants(input)) {
        it(`"${input}" variant ${t.variant}`, () => {
          assert.equal(t.intent, 'praise')
          for (const level of LEVELS) {
            assert.ok(t.levels[level].it.startsWith('Ale, '), `${level} it should address Ale: ${t.levels[level].it}`)
            assert.ok(t.levels[level].zh.startsWith('Ale，'), `${level} zh should address Ale: ${t.levels[level].zh}`)
            assert.ok(!/[「」«»]/u.test(t.levels[level].it + t.levels[level].zh), `${level} quotes the input`)
          }
          // Volgare: colloquial, enthusiastic.
          assert.match(t.levels.diretta.it, /della madonna|mostro|spaccato|grande/i)
          assert.match(t.levels.diretta.zh, /牛|绝了|服气|厉害/)
          // Standard: formal praise with the house lexicon, no colloquial echo.
          assert.match(t.levels.standard.it, /ingegno|celestiale|encomi|lustro/i)
          assert.doesNotMatch(t.levels.standard.it, /madonna|牛逼/i)
          assert.doesNotMatch(t.levels.standard.zh, /牛逼|madonna/i)
          assert.match(t.levels.standard.zh, /才智|府邸|阁下|尊贵/)
          // Spietata: aulic sarcastic praise.
          assert.match(t.levels.spietata.it, /ingegno|inceduto|solerzia|genialità|celestiale/i)
          assert.match(t.levels.spietata.it, /Su[ao]\b/)
          assert.match(t.levels.spietata.zh, /尊贵之躯|阁下/)
          // Each level is its own text.
          assert.notEqual(t.levels.diretta.it, t.levels.standard.it)
          assert.notEqual(t.levels.standard.it, t.levels.spietata.it)
        })
      }
    }

    it('opens on the golden variant for the Italian phrase', () => {
      const texts = allVariants('Ale, hai delle idee della madonna!')
      assert.ok(texts.some((t) => t.levels.diretta.it === 'Ale, hai delle idee della madonna!'))
      assert.ok(texts.some((t) => t.levels.diretta.zh === 'Ale，你这想法也太牛逼了吧！'))
      assert.ok(texts.some((t) => /fecondità del Suo ingegno/.test(t.levels.spietata.it)))
    })
  })

  describe('golden: "Mi stai disturbando"', () => {
    for (const input of ['Mi stai disturbando.', '你在打扰我。', 'Lasciami in pace!']) {
      for (const t of allVariants(input)) {
        it(`"${input}" variant ${t.variant}`, () => {
          assert.equal(t.intent, 'disturbance')
          for (const level of LEVELS) {
            assert.ok(!/disturbando|打扰我|Lasciami/u.test(t.levels[level].it + t.levels[level].zh), `${level} echoes the input`)
            assert.ok(!/[「」«»]/u.test(t.levels[level].it + t.levels[level].zh), `${level} quotes the input`)
          }
          assert.match(t.levels.diretta.it, /rotto|rompendo|disturbo ambulante|levati|piantala|sparisci/i)
          assert.match(t.levels.diretta.zh, /烦|滚|噪音|消失/)
          assert.match(t.levels.standard.it, /nocumento|quiete|silenzio|molestia|raccoglimento/i)
          assert.match(t.levels.standard.it, /La prego|Le segnalo|Sua augusta persona/)
          assert.match(t.levels.standard.zh, /阁下|尊贵之躯/)
          assert.match(t.levels.spietata.it, /assenza|disturbare|interrompermi|vacuità|nocumento|magione/i)
        })
      }
    }

    it('contains the golden standard and spietata renderings', () => {
      const texts = allVariants('Mi stai disturbando.')
      assert.ok(texts.some((t) => t.levels.standard.it === 'La prego di non arrecare ulteriore nocumento alla mia quiete.'))
      assert.ok(texts.some((t) => t.levels.spietata.it.startsWith('Sarei infinitamente lieto di bearmi della Sua assenza')))
      assert.ok(texts.some((t) => /Hai rotto/.test(t.levels.diretta.it)))
    })
  })

  it('generic fallback produces three distinct paraphrases, never a bare echo', () => {
    for (const input of ['Domani piove.', 'Boh', 'Il gatto dorme sul divano.']) {
      for (const t of allVariants(input)) {
        assert.equal(t.intent, 'statement')
        const its = LEVELS.map((l) => t.levels[l].it)
        assert.equal(new Set(its).size, 3, `${input}: levels must differ`)
        for (const level of LEVELS) {
          const { it: itText, zh } = t.levels[level]
          assert.ok(!/^Ciao\b/i.test(itText), `${input}/${level} starts with a greeting: ${itText}`)
          assert.notEqual(itText, input)
          assert.notEqual(itText, bare(input))
          assert.notEqual(itText, `${bare(input)}.`)
          assert.ok(itText.length > bare(input).length + 10, `${input}/${level} adds nothing: ${itText}`)
          assert.ok(CJK.test(zh))
        }
        assert.doesNotMatch(t.levels.standard.it, /magione\.$|^Ciao/)
        assert.match(t.levels.standard.it + t.levels.spietata.it, HOUSE_LEXICON)
      }
    }
    const rain = demoTranslate('Domani piove.', { now: 1 })
    assert.match(rain.levels.standard.it, /il dì venturo piove/)
  })

  it('addresses a named person in every level', () => {
    const t = demoTranslate('Marco, grazie mille!', { now: 1 })
    assert.equal(t.intent, 'gratitude')
    for (const level of LEVELS) {
      assert.ok(t.levels[level].it.startsWith('Marco, '))
      assert.ok(t.levels[level].zh.startsWith('Marco，'))
    }
    const zh = demoTranslate('老王，我饿了', { now: 1 })
    assert.equal(zh.intent, 'hunger')
    assert.ok(zh.levels.standard.zh.startsWith('老王，'))
  })

  it('keeps the requested object in a request without its courtesy marker', () => {
    const t = demoTranslate('Mi passi il sale, per favore?', { now: 1 })
    assert.equal(t.intent, 'request')
    for (const level of LEVELS) {
      assert.match(t.levels[level].it, /mi passi il sale/i)
      assert.doesNotMatch(t.levels[level].it, /per favore.*per favore/i)
      assert.match(t.levels[level].zh, /「Mi passi il sale」/)
    }
  })

  it('does not echo a pure exclamation as its own topic', () => {
    for (const t of allVariants('Che palle, di nuovo.')) {
      for (const level of LEVELS) {
        assert.doesNotMatch(t.levels[level].it, /che palle, di nuovo/i)
        assert.doesNotMatch(t.levels[level].zh, /「/)
      }
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

  it('never leaves unfilled placeholders and always starts with a capital', () => {
    const phrases = ['Ciao', 'Sei un genio', '我爱你', 'Pagami subito!', 'Boh', 'Ale, ti amo', 'Per favore', '又来了']
    for (const phrase of phrases) {
      for (const t of allVariants(phrase)) {
        for (const level of LEVELS) {
          assert.doesNotMatch(t.levels[level].it, ANY_SLOT)
          assert.doesNotMatch(t.levels[level].zh, ANY_SLOT)
          assert.doesNotMatch(t.levels[level].it, /^\p{Ll}/u, `${phrase}/${level}: ${t.levels[level].it}`)
        }
      }
    }
  })

  it('hashes stably', () => {
    assert.equal(hashString('abc'), hashString('abc'))
    assert.notEqual(hashString('abc'), hashString('abd'))
  })
})
