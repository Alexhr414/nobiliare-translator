import type { IntentId } from './types.ts'

export interface IntentMeta {
  id: IntentId
  label: { it: string; zh: string }
}

export const INTENT_META: Record<IntentId, IntentMeta> = {
  greeting: { id: 'greeting', label: { it: 'Saluto', zh: '问候' } },
  farewell: { id: 'farewell', label: { it: 'Commiato', zh: '告别' } },
  gratitude: { id: 'gratitude', label: { it: 'Gratitudine', zh: '致谢' } },
  apology: { id: 'apology', label: { it: 'Scuse', zh: '致歉' } },
  praise: { id: 'praise', label: { it: 'Lode', zh: '赞美' } },
  insult: { id: 'insult', label: { it: 'Insulto', zh: '辱骂' } },
  dismissal: { id: 'dismissal', label: { it: 'Congedo brusco', zh: '逐客' } },
  refusal: { id: 'refusal', label: { it: 'Rifiuto', zh: '拒绝' } },
  agreement: { id: 'agreement', label: { it: 'Assenso', zh: '同意' } },
  request: { id: 'request', label: { it: 'Richiesta', zh: '请求' } },
  command: { id: 'command', label: { it: 'Ordine', zh: '命令' } },
  question: { id: 'question', label: { it: 'Domanda', zh: '询问' } },
  complaint: { id: 'complaint', label: { it: 'Lagnanza', zh: '抱怨' } },
  hunger: { id: 'hunger', label: { it: 'Appetito', zh: '饥饿' } },
  fatigue: { id: 'fatigue', label: { it: 'Stanchezza', zh: '疲惫' } },
  affection: { id: 'affection', label: { it: 'Affetto', zh: '爱意' } },
  money: { id: 'money', label: { it: 'Denari', zh: '钱财' } },
  lateness: { id: 'lateness', label: { it: 'Ritardo', zh: '迟到' } },
  threat: { id: 'threat', label: { it: 'Minaccia', zh: '威胁' } },
  boast: { id: 'boast', label: { it: 'Vanto', zh: '自夸' } },
  statement: { id: 'statement', label: { it: 'Affermazione', zh: '陈述' } },
}

interface Rule {
  intent: IntentId
  patterns: RegExp[]
}

const it = (words: string) => new RegExp(`(?:^|[^\\p{L}])(?:${words})(?=$|[^\\p{L}])`, 'iu')
const zh = (words: string) => new RegExp(`(?:${words})`, 'u')

/**
 * Ordered detection rules. The first rule whose patterns match wins, so the
 * sharper intents (threats, insults, dismissals) sit above the softer ones.
 */
const RULES: readonly Rule[] = [
  {
    intent: 'threat',
    patterns: [
      it('ti ammazzo|ti uccido|ti distruggo|ti rovino|te ne pentirai|te la faccio pagare|ti faccio (?:vedere|male)|ti spacco|ti meno|giuro che|stai attento|attento a te|ti denuncio|ti avverto|guai a te|i\'ll kill you|you\'ll regret'),
      zh('我杀了你|你等着|你会后悔|给你好看|我警告你|小心点|弄死你|你死定了'),
    ],
  },
  {
    intent: 'insult',
    patterns: [
      it('stupid[oa]|idiot[ai]?|cretin[oa]|scem[oa]|imbecille|deficiente|coglion[ei]|stronz[oa]|cazzo|merda|vaffanculo|fanculo|cafone|zotico|ignorante|incapace|inutile|patetic[oa]|ridicol[oa]|schif[oa]|fai schifo|sei un|sei una|mi fai pena|stupid|idiot|moron|loser'),
      zh('白痴|笨蛋|傻逼|蠢货|废物|垃圾|智障|真笨|讨厌你|混蛋|王八蛋|愚蠢'),
    ],
  },
  {
    intent: 'dismissal',
    patterns: [
      it('vai via|vattene|sparisci|levati|togliti|fuori di qui|fuori dai piedi|lasciami (?:stare|in pace)|non mi interessa|non me ne frega|chi se ne frega|basta|smettila|piantala|taci|zitto|zitta|chiudi il becco|non ho tempo|go away|get out|shut up|leave me alone|whatever'),
      zh('滚|走开|出去|别烦我|别烦|闭嘴|别说了|懒得理|不想理你|随便你|无所谓|离我远点|别打扰'),
    ],
  },
  {
    intent: 'refusal',
    patterns: [
      it('no|non voglio|non posso|non se ne parla|neanche per sogno|scordatelo|assolutamente no|nemmeno|mai|non ci penso|non lo faccio|non vengo|rifiuto|no way|i won\'t|i don\'t want'),
      zh('不要|不行|不想|不可能|不干|别想|免谈|拒绝|不去|不会'),
    ],
  },
  {
    intent: 'apology',
    patterns: [
      it('scusa|scusami|scusate|mi dispiace|perdono|perdonami|chiedo scusa|colpa mia|ho sbagliato|sorry|my bad|apologize'),
      zh('对不起|抱歉|不好意思|原谅|我的错|请见谅'),
    ],
  },
  {
    intent: 'gratitude',
    patterns: [
      it('grazie|ti ringrazio|vi ringrazio|grato|grata|riconoscente|thank|thanks'),
      zh('谢谢|感谢|多谢|感激|谢了'),
    ],
  },
  {
    intent: 'farewell',
    patterns: [
      it('addio|arrivederci|a presto|a dopo|ci vediamo|buonanotte|buona notte|me ne vado|devo andare|vado via|bye|goodbye|see you|good night'),
      zh('再见|拜拜|晚安|走了|告辞|下次见|回见'),
    ],
  },
  {
    intent: 'greeting',
    patterns: [
      it('ciao|salve|buongiorno|buon giorno|buonasera|buona sera|buon pomeriggio|ehi|hey|hello|hi|good morning|come stai|come va|tutto bene'),
      zh('你好|您好|早上好|早安|晚上好|下午好|嗨|哈喽|最近怎么样|好久不见'),
    ],
  },
  {
    intent: 'affection',
    patterns: [
      it('ti amo|ti voglio bene|mi manchi|ti adoro|mi piaci|innamorat[oa]|amore mio|tesoro|cuore mio|i love you|i miss you|i like you'),
      zh('我爱你|爱你|想你|喜欢你|亲爱的|宝贝|我的心'),
    ],
  },
  {
    intent: 'lateness',
    patterns: [
      it('in ritardo|sono tardi|è tardi|arrivo tardi|faccio tardi|ritardo|puntual[ei]|aspetto da|ti aspetto|late|running late'),
      zh('迟到|晚了|来晚|等你很久|久等|太晚了'),
    ],
  },
  {
    intent: 'hunger',
    patterns: [
      it('ho fame|fame|mangiare|mangiamo|pranzo|cena|colazione|affamat[oa]|ho sete|sete|pizza|panino|hungry|starving|food|lunch|dinner'),
      zh('饿|吃饭|吃点|想吃|饥饿|午饭|晚饭|早饭|渴了'),
    ],
  },
  {
    intent: 'fatigue',
    patterns: [
      it('ho sonno|sonno|stanc[oa]|stanchissim[oa]|sfinit[oa]|esaust[oa]|distrutt[oa]|dormire|riposare|non ce la faccio|tired|exhausted|sleepy'),
      zh('累|困|疲惫|好累|想睡|睡觉|撑不住|没力气'),
    ],
  },
  {
    intent: 'money',
    patterns: [
      it('soldi|denaro|denari|quattrini|grana|euro|pagare|pagami|mi devi|debito|stipendio|costa|prezzo|caro|costoso|gratis|money|pay|cash|expensive'),
      zh('钱|付钱|还钱|欠我|工资|太贵|多少钱|免费|价格'),
    ],
  },
  {
    intent: 'boast',
    patterns: [
      it('sono il migliore|sono la migliore|sono bravissim[oa]|sono un genio|sono fort[ei]|nessuno (?:è|e) come me|ho vinto|ce l\'ho fatta|sono il numero uno|sono grande|i\'m the best|i won'),
      zh('我最厉害|我最棒|我是天才|我赢了|我最强|没人比得上我|我成功了'),
    ],
  },
  {
    intent: 'praise',
    patterns: [
      it('brav[oa]|bravissim[oa]|grande|geniale|fantastic[oa]|meraviglios[oa]|stupend[oa]|bellissim[oa]|bell[oa]|complimenti|ottimo|eccellente|perfetto|sei fort[ei]|sei il migliore|sei la migliore|ben fatto|great|awesome|amazing|well done|beautiful|brilliant'),
      zh('太棒|真棒|厉害|漂亮|优秀|完美|真好|好美|了不起|牛|绝了|干得好|佩服'),
    ],
  },
  {
    intent: 'complaint',
    patterns: [
      it('che palle|che noia|uffa|non ne posso più|sono stufo|sono stufa|basta con|fa caldo|fa freddo|non funziona|è rotto|è sbagliato|schifo|orribile|terribile|pessim[oa]|non mi piace|odio|mi lamento|il peggior|sempre così|ancora|di nuovo|ugh|this sucks|i hate|annoying|boring'),
      zh('烦|无聊|受不了|烦死了|讨厌|好热|好冷|坏了|不好用|糟糕|太差|又来了|没完没了'),
    ],
  },
  {
    intent: 'command',
    patterns: [
      it('fai|fate|porta|portami|dammi|datemi|vieni|venite|chiudi|apri|smetti|muoviti|sbrigati|sbrigatevi|siediti|alzati|prendi|metti|togli|lascia|fermo|fermati|ascolta|ascoltami|guarda|rispondi|scrivi|leggi|parla|vai a|devi|dovete|subito|adesso|ora|immediatamente|do it|hurry|listen|stop|come here|sit down'),
      zh('快点|马上|立刻|给我|过来|坐下|站起来|听我说|闭上|去做|必须|拿来|快去|别动'),
    ],
  },
  {
    intent: 'request',
    patterns: [
      it('per favore|per piacere|per cortesia|ti prego|vi prego|potresti|potreste|puoi|potete|mi passi|mi passeresti|vorrei|mi servirebbe|ho bisogno|avrei bisogno|ti chiedo|vi chiedo|mi fai|mi faresti|please|could you|can you|would you|i need|i\'d like'),
      zh('请|麻烦|能不能|可以吗|帮我|拜托|想要|需要|能否|可否'),
    ],
  },
  {
    intent: 'agreement',
    patterns: [
      it('sì|certo|certamente|ok|okay|va bene|d\'accordo|esatto|giusto|perfetto|volentieri|senz\'altro|assolutamente|concordo|hai ragione|yes|sure|agreed|of course'),
      zh('好的|好啊|行|可以|同意|没问题|当然|对|是的|没错|说得对|成交'),
    ],
  },
  {
    intent: 'question',
    patterns: [
      /[?？]\s*$/u,
      it('perché|perche|come mai|quando|dove|chi|cosa|che cosa|quale|quali|quanto|quanti|davvero|sul serio|why|when|where|who|what|which|how'),
      zh('吗|呢|为什么|什么|怎么|哪里|哪儿|谁|几点|多少|真的'),
    ],
  },
]

const testRule = (text: string, rule: Rule) => rule.patterns.some((p) => p.test(text))

export function detectIntent(text: string): IntentId {
  const normalized = text.trim().replace(/\s+/g, ' ')
  if (!normalized) return 'statement'
  for (const rule of RULES) {
    if (testRule(normalized, rule)) return rule.intent
  }
  return 'statement'
}

/** Rough script sniffing so templates can quote the user in the right voice. */
export function detectScript(text: string): 'zh' | 'latin' {
  const cjk = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/gu) ?? []).length
  const letters = (text.match(/\p{L}/gu) ?? []).length
  return letters > 0 && cjk / letters > 0.3 ? 'zh' : 'latin'
}
