/**
 * The Rancido Stilnterra noble lexicon.
 *
 * `GLOSSARY` is shown to the user. `SUBSTITUTIONS` and `COLLOQUIAL` are applied
 * only to the topic slot of content-carrying intents (requests, orders,
 * questions, statements…) so that the thing being asked or stated is rendered
 * in the right register; every other intent is a full hand-written paraphrase.
 */

export interface GlossaryEntry {
  term: string
  meaning: { it: string; zh: string }
  zh: string
}

export const GLOSSARY: readonly GlossaryEntry[] = [
  {
    term: 'incedere',
    zh: '缓步而行',
    meaning: { it: 'Procedere con passo solenne e misurato', zh: '以庄重、从容的步伐前行' },
  },
  {
    term: 'magione',
    zh: '府邸',
    meaning: { it: 'Dimora signorile; la casa, ma con stemma', zh: '贵族宅邸；带家徽的“家”' },
  },
  {
    term: 'augusta persona',
    zh: '尊贵之躯',
    meaning: { it: "Modo protocollare di riferirsi all'interlocutore", zh: '对交谈对象的礼制性尊称' },
  },
  {
    term: 'nocumento',
    zh: '损害',
    meaning: { it: 'Danno, pregiudizio, molestia', zh: '损害、妨害、滋扰' },
  },
  {
    term: "vacuità d'ingegno",
    zh: '才智之空乏',
    meaning: { it: 'Stupidità, detta con guanti di velluto', zh: '愚蠢——戴着天鹅绒手套说出' },
  },
  {
    term: 'coatto',
    zh: '粗鄙之徒',
    meaning: { it: 'Individuo rozzo e privo di garbo', zh: '粗俗、缺乏教养之人' },
  },
  {
    term: 'protocollare',
    zh: '合乎礼制',
    meaning: { it: 'Conforme al cerimoniale di corte', zh: '符合宫廷仪典' },
  },
  {
    term: 'solerte',
    zh: '勤勉迅捷',
    meaning: { it: 'Pronto, diligente, sollecito', zh: '敏捷、勤勉、殷切' },
  },
  {
    term: 'celestiale',
    zh: '天界般的',
    meaning: { it: 'Di bellezza o virtù non terrena', zh: '非凡尘所有的美或德' },
  },
  {
    term: 'velleità',
    zh: '空妄之愿',
    meaning: { it: 'Desiderio vano, privo di volontà reale', zh: '徒然的愿望，缺乏真正意志' },
  },
]

interface Substitution {
  pattern: RegExp
  replacement: string
}

const sub = (words: string, replacement: string): Substitution => ({
  pattern: new RegExp(`\\b(?:${words})\\b`, 'giu'),
  replacement,
})

/**
 * Word-level substitutions, applied to the topic slot to build `{noble}`.
 * Ordered from most specific (multi-word) to least specific.
 */
export const SUBSTITUTIONS: readonly Substitution[] = [
  sub('vai via|vattene|sparisci|levati', 'inceda altrove'),
  sub('ho fame', "avverto l'appetito"),
  sub('ho sonno|sono stanco|sono stanca', 'le mie membra reclamano riposo'),
  sub('ti amo', 'nutro per la Sua augusta persona un sentimento celestiale'),
  sub('mi piaci', 'la Sua persona mi è celestialmente grata'),
  sub('non voglio', 'non nutro velleità alcuna di'),
  sub('per favore|per piacere|ti prego', 'se la Sua augusta persona lo consente'),
  sub('va bene|ok|okay|d\'accordo', 'sia come da protocollo'),
  sub('subito|adesso|ora|immediatamente', "nell'istante presente"),
  sub('domani', 'il dì venturo'),
  sub('oggi', 'nel dì presente'),
  sub('ieri', 'nel dì trascorso'),
  sub('casa|appartamento|baracca', 'magione'),
  sub('andare|camminare', 'incedere'),
  sub('vado', 'incedo'),
  sub('vai', 'inceda'),
  sub('andiamo', 'incediamo'),
  sub('vieni', 'si degni di incedere qui'),
  sub('danno|danni|guaio|guai|casino', 'nocumento'),
  sub('stupidità|stupidaggine|stupidaggini|cretinata|cazzata|sciocchezza', "vacuità d'ingegno"),
  sub('stupido|stupida|idiota|cretino|cretina|scemo|scema|imbecille|deficiente|coglione', 'coatto di vacuità d\'ingegno'),
  sub('maleducato|maleducata|cafone|rozzo|zotico|villano', 'coatto'),
  sub('veloce|rapido|rapida|in fretta|presto', 'con solerzia'),
  sub('bello|bella|bellissimo|bellissima|meraviglioso|meravigliosa|stupendo|stupenda|fantastico|fantastica', 'celestiale'),
  sub('bravo|brava|bravissimo|bravissima|in gamba', 'solerte e celestiale'),
  sub('complimenti|congratulazioni', 'i miei protocollari encomi'),
  sub('geniale|genio', "d'ingegno celestiale"),
  sub('regole|regola|procedura|procedure|burocrazia', 'cerimoniale protocollare'),
  sub('sogno|sogni|desiderio|desideri|voglia|capriccio', 'velleità'),
  sub('soldi|denaro|grana|quattrini|euro', 'denari'),
  sub('mangiare|mangio|pranzare|cenare', 'desinare'),
  sub('dormire|dormo', 'riposare le membra'),
  sub('macchina|auto|automobile', 'carrozza'),
  sub('lavoro|ufficio', 'gli uffici'),
  sub('amico|amica', 'sodale'),
  sub('capo|boss|principale', 'signore degli uffici'),
  sub('problema|problemi|rogna|rogne', 'impedimento'),
  sub('brutto|brutta|orrendo|orrenda|schifoso|schifosa', 'sgraziato'),
  sub('grazie', 'la mia gratitudine'),
  sub('ciao|ehi|hey', 'salve'),
  sub('tu|te', 'la Sua persona'),
  sub('lei|lui', "l'augusta persona"),
  sub('gente|persone|tipi', 'astanti'),
  sub('cosa|roba', 'faccenda'),
  sub('tardi', "oltre l'ora protocollare"),
  sub('aspetta|aspettate', 'concedete indugio'),
  sub('cibo|pappa', 'vivande'),
  sub('bere|bevo', 'libare'),
  sub('festa|party', 'ricevimento'),
  sub('telefono|cellulare', 'apparato'),
  sub('vestiti|vestito', 'vesti'),
  sub('bugia|bugie|balla|balle', 'menzogna'),
  sub('paura', 'timore'),
  sub('rabbia|incazzato|incazzata|arrabbiato|arrabbiata', 'sdegno'),
  sub('felice|contento|contenta', 'giubilante'),
  sub('triste', 'mesto'),
  sub('noioso|noiosa|palla|pallosa', 'tedioso'),
  sub('sbrigati|muoviti|forza|dai', 'siate solerte'),
]

/**
 * Colloquial substitutions for the Volgare topic slot (`{blunt}`), so the
 * blunt level does not simply repeat the user's wording.
 */
export const COLLOQUIAL: readonly Substitution[] = [
  sub('per favore|per piacere|per cortesia|ti prego', 'dai'),
  sub('molto|tanto|assai|parecchio|moltissimo', 'un casino'),
  sub('velocemente|in fretta|rapidamente|presto', 'alla svelta'),
  sub('subito|immediatamente', 'al volo'),
  sub('davvero|veramente', 'sul serio'),
  sub('problema|guaio|pasticcio', 'casino'),
  sub('problemi|guai|pasticci', 'casini'),
  sub('soldi|denaro|quattrini', 'grana'),
  sub('persona|individuo', 'tipo'),
  sub('ragazzo', 'tipo'),
  sub('ragazza', 'tipa'),
  sub('amico', 'compare'),
  sub('arrabbiato', 'incazzato'),
  sub('arrabbiata', 'incazzata'),
  sub('stanco|esausto|sfinito', 'cotto'),
  sub('stanca|esausta|sfinita', 'cotta'),
  sub('mangiare', 'sbafare'),
  sub('noioso|tedioso', 'palloso'),
  sub('noiosa|tediosa', 'pallosa'),
  sub('stupido|sciocco|imbecille', 'scemo'),
  sub('stupida|sciocca', 'scema'),
  sub('bello|bellissimo|meraviglioso|fantastico', 'figo'),
  sub('cosa', 'roba'),
]

const upperFirst = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

function substitute(text: string, table: readonly Substitution[]): string {
  let out = text.trim()
  for (const { pattern, replacement } of table) {
    out = out.replace(pattern, (match) =>
      match.charAt(0) === match.charAt(0).toUpperCase() && match.charAt(0) !== match.charAt(0).toLowerCase()
        ? upperFirst(replacement)
        : replacement,
    )
  }
  return out
}

/**
 * Applies the noble lexicon to a phrase. Capitalisation of the first letter of
 * a replaced word is preserved so sentence starts remain tidy.
 */
export function ennoble(text: string): string {
  return substitute(text, SUBSTITUTIONS)
}

/** Applies the colloquial lexicon to a phrase for the Volgare level. */
export function vulgarize(text: string): string {
  return substitute(text, COLLOQUIAL)
}

/** Strips trailing punctuation so a phrase can be embedded mid-sentence. */
export function bare(text: string): string {
  return text
    .trim()
    .replace(/[\s.!?…,;:。！？，；：]+$/u, '')
    .trim()
}

/** Lowercases the first character unless the phrase starts with a proper-noun-ish capital sequence. */
export function lowerFirst(text: string): string {
  if (!text) return text
  const first = text.charAt(0)
  const second = text.charAt(1)
  if (second && second === second.toUpperCase() && second !== second.toLowerCase()) return text
  return first.toLowerCase() + text.slice(1)
}
