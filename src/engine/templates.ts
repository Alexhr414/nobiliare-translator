import type { IntentId, Level, Rendering } from './types.ts'

/**
 * Template placeholders:
 *   {orig}   the user's phrase, trailing punctuation stripped
 *   {noble}  the phrase run through the noble lexicon, lower-cased first letter
 *   {Noble}  same, capitalised
 *   {q}      the original phrase wrapped in CJK quotation marks
 */
export type TemplateSet = Record<Level, readonly Rendering[]>

export const TEMPLATES: Record<IntentId, TemplateSet> = {
  greeting: {
    diretta: [
      { it: 'Ciao. {Noble}.', zh: '嗨。{q}。' },
      { it: 'Ehi, eccomi. {Noble}.', zh: '喂，我来了。{q}。' },
      { it: 'Salve, gente. {Noble}.', zh: '各位好。{q}。' },
    ],
    standard: [
      {
        it: 'Porgo alla Vostra augusta persona il mio più protocollare saluto, incedendo nella Vostra magione con animo solerte: {noble}.',
        zh: '谨以最合乎礼制的问候，敬献于尊贵之躯前；我怀着勤勉之心，缓步踏入您的府邸：{q}。',
      },
      {
        it: "Che il dì Vi sia celestiale: la mia persona incede al Vostro cospetto per rendere omaggio, come vuole il cerimoniale. {Noble}.",
        zh: '愿今日于您如天界一般：我缓步至您面前致以敬意，一如仪典所求。{q}。',
      },
      {
        it: 'Sia concesso alla mia umile persona di salutare la Vostra, con la solerzia che il protocollo esige e il garbo che la magione richiede. {Noble}.',
        zh: '请允许卑微的我向尊贵的您致意，带着礼制所要求的勤勉，与府邸所需的雅度。{q}。',
      },
    ],
    spietata: [
      {
        it: "Vedo che la Vostra augusta persona ha infine trovato la via della magione; il cerimoniale prevedeva un saluto, ed eccolo, protocollare quanto basta: {noble}.",
        zh: '看来尊贵之躯终于寻得了府邸的门径；仪典规定须有一声问候，那便在此，恰好合乎礼制：{q}。',
      },
      {
        it: 'Salve. Non lo dico con slancio celestiale, ma il protocollo lo esige, e io sono solerte nel protocollo più che nella simpatia. {Noble}.',
        zh: '您好。此言并非出于天界般的热忱，只因礼制如此要求，而我于礼制之勤勉，远胜于对您的好感。{q}。',
      },
      {
        it: "Incedete pure oltre la soglia; la magione ha visto ospiti di ben altra statura, ma il saluto Vi è comunque dovuto: {noble}.",
        zh: '请缓步跨过门槛吧；这座府邸曾迎接过气度远胜于您的宾客，但这声问候仍是您应得的：{q}。',
      },
    ],
  },

  farewell: {
    diretta: [
      { it: 'Me ne vado. {Noble}.', zh: '我走了。{q}。' },
      { it: 'Ciao, ci si vede. {Noble}.', zh: '拜，回见。{q}。' },
      { it: 'Basta, tolgo il disturbo. {Noble}.', zh: '行了，我不打扰了。{q}。' },
    ],
    standard: [
      {
        it: 'La mia persona si accinge a incedere altrove; lascio la Vostra magione con animo grato e passo protocollare. {Noble}.',
        zh: '我即将缓步他往；怀着感激之心与合乎礼制的步伐，辞别您的府邸。{q}。',
      },
      {
        it: 'Il cerimoniale mi chiama in altra magione. Vi lascio, augusta persona, con un commiato celestiale e nessun nocumento. {Noble}.',
        zh: '仪典召我前往另一座府邸。尊贵之躯，我以天界般的告别辞行，不留一丝损害。{q}。',
      },
      {
        it: "Concedete che io mi ritiri con solerzia: il dì volge al termine e le mie membra reclamano la via della magione. {Noble}.",
        zh: '请允许我勤勉迅捷地退下：白日将尽，我的四肢已呼唤归府之路。{q}。',
      },
    ],
    spietata: [
      {
        it: 'Mi ritiro, e con me si ritira anche l\'unico ingegno presente in questa magione. Che il Vostro dì prosegua nella consueta vacuità. {Noble}.',
        zh: '我退下了，随我一同退下的，是这府邸中仅存的才智。愿您的白日在惯常的空乏中延续。{q}。',
      },
      {
        it: 'Incedo altrove con solerzia insolita: non per fretta, ma per la celestiale gioia di non dover più ascoltare. {Noble}.',
        zh: '我以异乎寻常的迅捷缓步他往：并非匆忙，而是出于无需再听您言语的天界般喜悦。{q}。',
      },
      {
        it: 'Il protocollo mi impone di salutare prima di uscire. Ho ottemperato. Ogni ulteriore indugio sarebbe nocumento a entrambi. {Noble}.',
        zh: '礼制命我离去前须行告别。我已照办。任何进一步的逗留，于你我皆是损害。{q}。',
      },
    ],
  },

  gratitude: {
    diretta: [
      { it: 'Grazie, davvero. {Noble}.', zh: '谢了，真心的。{q}。' },
      { it: 'Grazie mille. {Noble}.', zh: '多谢。{q}。' },
      { it: 'Ti devo un favore. {Noble}.', zh: '我欠你一个人情。{q}。' },
    ],
    standard: [
      {
        it: 'La mia gratitudine incede verso la Vostra augusta persona con passo solerte e cuore protocollare: {noble}.',
        zh: '我的感激之情，以勤勉迅捷之步、合乎礼制之心，缓步趋向尊贵之躯：{q}。',
      },
      {
        it: 'Che la Vostra magione sia benedetta da grazia celestiale per il favore concesso; la mia persona ne conserverà memoria. {Noble}.',
        zh: '愿您的府邸因所赐之恩而蒙天界般的福泽；我将铭记于心。{q}。',
      },
      {
        it: 'Non è velleità ma dovere protocollare rendere grazie alla Vostra persona: senza il Vostro solerte intervento avrei patito nocumento. {Noble}.',
        zh: '向您致谢并非空妄之愿，而是礼制之责：若无您勤勉的援手，我必已受损害。{q}。',
      },
    ],
    spietata: [
      {
        it: 'Vi ringrazio, e lo faccio con sincero stupore: non credevo la Vostra persona capace di tanta solerzia. Il protocollo mi impone di dirlo, la cortesia di non aggiungere altro. {Noble}.',
        zh: '我向您致谢，且怀着真诚的惊讶：我从未料到您竟能如此勤勉。礼制命我道谢，礼貌则命我就此打住。{q}。',
      },
      {
        it: 'Gratitudine celestiale per un gesto che, in qualunque altra magione, sarebbe stato il minimo. Qui è quasi un prodigio. {Noble}.',
        zh: '对这一举动致以天界般的感激——在其他任何府邸，此举不过是最低限度；在此处却近乎奇迹。{q}。',
      },
      {
        it: 'Grazie. Annoto il fatto negli annali della magione, tra le rare occasioni in cui la Vostra persona non ha arrecato nocumento. {Noble}.',
        zh: '谢谢。我已将此事载入府邸编年史，列于您未曾造成损害的少数场合之中。{q}。',
      },
    ],
  },

  apology: {
    diretta: [
      { it: 'Scusa, ho sbagliato. {Noble}.', zh: '对不起，我错了。{q}。' },
      { it: 'Colpa mia, scusami. {Noble}.', zh: '我的错，抱歉。{q}。' },
      { it: 'Ok, mi dispiace. {Noble}.', zh: '好吧，我很抱歉。{q}。' },
    ],
    standard: [
      {
        it: 'La mia persona china il capo davanti alla Vostra, augusta persona, e chiede protocollare perdono per il nocumento arrecato: {noble}.',
        zh: '尊贵之躯，我在您面前俯首，为所造成的损害恳求合乎礼制的宽恕：{q}。',
      },
      {
        it: 'Riconosco con solerzia il mio errore e Vi prego di non serbarne memoria nella Vostra magione; non fu malizia, fu vacuità momentanea. {Noble}.',
        zh: '我勤勉迅捷地承认过失，恳请您勿在府邸中留下记忆；那并非恶意，只是一时的空乏。{q}。',
      },
      {
        it: 'Sia concessa alla mia persona la grazia celestiale del Vostro perdono; il cerimoniale prevede la penitenza, e io la accolgo. {Noble}.',
        zh: '愿您以天界般的恩典赐我宽恕；仪典规定须行忏悔，我欣然领受。{q}。',
      },
    ],
    spietata: [
      {
        it: "Chiedo perdono, come il protocollo esige. Che la colpa sia mia è opinabile, ma la Vostra augusta persona pare tenerci, e io sono magnanimo. {Noble}.",
        zh: '我依礼制请求宽恕。过错是否在我尚可商榷，但尊贵之躯似乎颇为在意，而我向来宽宏大量。{q}。',
      },
      {
        it: 'Mi scuso per il nocumento; non immaginavo che la Vostra persona fosse tanto delicata da patirne. Ne terrò conto, protocollarmente. {Noble}.',
        zh: '我为所造成的损害致歉；未曾想到您竟如此纤弱以至于受伤。我会依礼制记下这一点。{q}。',
      },
      {
        it: "Perdonatemi: ho sbagliato a presumere che nella Vostra magione l'ingegno bastasse a comprendere il mio intento. {Noble}.",
        zh: '请宽恕我：我错在以为您府邸中的才智足以领会我的本意。{q}。',
      },
    ],
  },

  praise: {
    diretta: [
      { it: 'Sei bravo, punto. {Noble}.', zh: '你很棒，就这样。{q}。' },
      { it: 'Grande, davvero ben fatto. {Noble}.', zh: '厉害，干得漂亮。{q}。' },
      { it: 'Complimenti, niente da dire. {Noble}.', zh: '佩服，无可挑剔。{q}。' },
    ],
    standard: [
      {
        it: 'La Vostra augusta persona incede con solerzia e grazia celestiale; la magione intera ne trae lustro. {Noble}.',
        zh: '尊贵之躯以勤勉迅捷与天界般的优雅缓步而行；整座府邸因之增辉。{q}。',
      },
      {
        it: "Sia detto secondo protocollo: raramente ingegno tanto solerte ha onorato queste sale. {Noble}.",
        zh: '谨依礼制而言：如此勤勉迅捷之才智，鲜少光临此厅堂。{q}。',
      },
      {
        it: 'Non è velleità di cortigiano ma verità protocollare: la Vostra opera reca alla magione beneficio e nessun nocumento. {Noble}.',
        zh: '这并非廷臣的空妄之言，而是合乎礼制的真言：您的功业为府邸带来裨益，未有丝毫损害。{q}。',
      },
    ],
    spietata: [
      {
        it: "Devo ammetterlo: per una volta la Vostra augusta persona ha inceduto senza inciampare. La magione ne prende atto con stupore protocollare. {Noble}.",
        zh: '我必须承认：这一次，尊贵之躯缓步而行竟未跌倒。府邸怀着合乎礼制的惊讶记录在案。{q}。',
      },
      {
        it: "Celestiale, davvero. Se la Vostra solerzia fosse costante e non un evento astronomico, la magione non saprebbe come contenere tanta grazia. {Noble}.",
        zh: '天界般的，确实。若您的勤勉能持之以恒而非如天文奇观般偶现，府邸恐将无处安放如此优雅。{q}。',
      },
      {
        it: 'Lodo la Vostra opera, come il protocollo impone; lodo anche il caso, che stavolta si è mostrato più solerte della Vostra vacuità. {Noble}.',
        zh: '我依礼制称颂您的功业；也称颂运气——这一次它比您的空乏更为勤勉。{q}。',
      },
    ],
  },

  insult: {
    diretta: [
      { it: 'Sei un idiota, ecco. {Noble}.', zh: '你就是个白痴。{q}。' },
      { it: 'Ma quanto sei scemo. {Noble}.', zh: '你可真够蠢的。{q}。' },
      { it: 'Fai pena. {Noble}.', zh: '你真可悲。{q}。' },
    ],
    standard: [
      {
        it: "La Vostra augusta persona manifesta una vacuità d'ingegno che il protocollo mi vieta di nominare, ma che la magione intera ha notato. {Noble}.",
        zh: '尊贵之躯所显露的才智之空乏，礼制禁止我直呼其名，然整座府邸皆已察觉。{q}。',
      },
      {
        it: 'Con garbo protocollare Vi segnalo che il Vostro incedere in questa faccenda è quello di un coatto, non di un nobile. {Noble}.',
        zh: '谨以合乎礼制的雅度提醒您：您在此事中的缓步姿态，属粗鄙之徒而非贵族。{q}。',
      },
      {
        it: "Non è nocumento che Vi arreco, bensì constatazione: la Vostra persona è solerte soltanto nell'errare. {Noble}.",
        zh: '我并非向您施加损害，只是陈述事实：您唯有在犯错一事上勤勉迅捷。{q}。',
      },
    ],
    spietata: [
      {
        it: "Vi definirei coatto, ma sarebbe offesa ai coatti, i quali almeno incedono senza pretese celestiali. La Vostra vacuità d'ingegno, invece, ha ambizioni. {Noble}.",
        zh: '我本欲称您为粗鄙之徒，但这对粗鄙之徒是种冒犯——他们至少行走时不带天界般的自负。而您的才智之空乏，却颇有雄心。{q}。',
      },
      {
        it: "Osservare la Vostra augusta persona ragionare è come osservare una magione bruciare: spettacolo tragico, ma di una solerzia ammirevole nel rovinarsi. {Noble}.",
        zh: '观看尊贵之躯思考，如同观看一座府邸焚毁：悲剧一场，却在自毁之路上勤勉得令人赞叹。{q}。',
      },
      {
        it: "Il protocollo mi impone rispetto per la Vostra persona; l'ingegno, purtroppo, mi impone di notare che non ve n'è alcuno nella Vostra. {Noble}.",
        zh: '礼制命我尊重您的人格；而才智，可惜，命我注意到您身上并无才智可言。{q}。',
      },
    ],
  },

  dismissal: {
    diretta: [
      { it: 'Vattene, non ho tempo. {Noble}.', zh: '走开，我没时间。{q}。' },
      { it: 'Basta, sparisci. {Noble}.', zh: '够了，滚吧。{q}。' },
      { it: 'Non mi interessa. Fuori. {Noble}.', zh: '我不感兴趣。出去。{q}。' },
    ],
    standard: [
      {
        it: 'La Vostra augusta persona è invitata a incedere altrove: la magione non dispone al momento di indugio da concederVi. {Noble}.',
        zh: '敬请尊贵之躯缓步他往：府邸此刻并无可赐予您的片刻停留。{q}。',
      },
      {
        it: 'Il protocollo mi impone garbo, la ragione mi impone di congedarVi: incedete pure, e senza nocumento. {Noble}.',
        zh: '礼制命我持雅度，理智命我送客：请缓步离去，勿留损害。{q}。',
      },
      {
        it: 'Ritengo la faccenda conclusa. Vi prego di lasciare la magione con la stessa solerzia con cui vi siete introdotto. {Noble}.',
        zh: '我认为此事已了。请以您进入时的同等勤勉迅捷，离开这座府邸。{q}。',
      },
    ],
    spietata: [
      {
        it: 'Incedete altrove, augusta persona; la magione ha già sofferto abbastanza nocumento per un solo dì, e la porta è stata concepita anche per uscire. {Noble}.',
        zh: '尊贵之躯，请缓步他往；这座府邸一日之内所受的损害已足够，而那扇门，设计之初也是为了出去。{q}。',
      },
      {
        it: 'Vi congedo con la solerzia che riservo alle faccende inutili. Il Vostro incedere sarà rimpianto da nessuno, protocollarmente parlando. {Noble}.',
        zh: '我以专为无用之事保留的勤勉迅捷送您离去。依礼制而言，您的缓步离场无人惋惜。{q}。',
      },
      {
        it: "La Vostra presenza è una velleità che la magione non ha mai coltivato. Uscite; il silenzio che lascerete sarà celestiale. {Noble}.",
        zh: '您的在场是一桩府邸从未培育的空妄之愿。请出去；您留下的寂静将如天界一般。{q}。',
      },
    ],
  },

  refusal: {
    diretta: [
      { it: 'No. Scordatelo. {Noble}.', zh: '不。别想了。{q}。' },
      { it: 'Non se ne parla. {Noble}.', zh: '免谈。{q}。' },
      { it: 'No, e non insistere. {Noble}.', zh: '不行，别再坚持了。{q}。' },
    ],
    standard: [
      {
        it: 'La mia persona non nutre velleità alcuna di accondiscendere: la richiesta è declinata secondo protocollo. {Noble}.',
        zh: '我并无任何应允的空妄之愿：此请求依礼制予以谢绝。{q}。',
      },
      {
        it: 'Con protocollare fermezza Vi comunico che la magione non concederà quanto chiesto; sia detto senza nocumento. {Noble}.',
        zh: '谨以合乎礼制的坚定告知：府邸不会应允所求；此言不含损害之意。{q}。',
      },
      {
        it: 'Il diniego è celestiale nella sua chiarezza: no. La Vostra augusta persona vorrà comprenderne le ragioni senza che io le esponga. {Noble}.',
        zh: '此拒绝清晰得如天界一般：不。尊贵之躯当能领会缘由，无需我一一陈明。{q}。',
      },
    ],
    spietata: [
      {
        it: 'No. Lo dico con la solerzia che merita una velleità tanto ardita, e con il garbo protocollare che la Vostra persona non ricambierebbe. {Noble}.',
        zh: '不。我以如此大胆的空妄之愿所配得的勤勉迅捷说出此字，并带着您绝不会回报的合乎礼制的雅度。{q}。',
      },
      {
        it: "Declino. Che la Vostra augusta persona abbia osato chiederlo dice molto sul Vostro ingegno; che io risponda con garbo dice molto sul mio. {Noble}.",
        zh: '我谢绝。尊贵之躯竟敢提出此求，足以说明您的才智；我竟以雅度回应，足以说明我的。{q}。',
      },
      {
        it: 'La magione rifiuta, e con essa rifiuto io. Se cercate un sì, incedete verso una magione con standard più modesti. {Noble}.',
        zh: '府邸拒绝，我亦随之拒绝。若您寻求一声“好”，请缓步前往一座标准更为寒微的府邸。{q}。',
      },
    ],
  },

  agreement: {
    diretta: [
      { it: 'Ok, va bene. {Noble}.', zh: '好，行。{q}。' },
      { it: 'Sì, ci sto. {Noble}.', zh: '嗯，我加入。{q}。' },
      { it: 'D\'accordo, facciamo così. {Noble}.', zh: '同意，就这么办。{q}。' },
    ],
    standard: [
      {
        it: 'Sia come da protocollo: la mia persona accorda con solerzia quanto la Vostra augusta persona propone. {Noble}.',
        zh: '一切依礼制而行：我勤勉迅捷地应允尊贵之躯所提之议。{q}。',
      },
      {
        it: 'La magione concorda: la proposta è celestiale nel disegno e priva di nocumento nella sostanza. {Noble}.',
        zh: '府邸表示同意：此议在构想上如天界一般，在实质上不含损害。{q}。',
      },
      {
        it: 'Accolgo la Vostra proposta con il garbo protocollare che essa merita; si proceda dunque. {Noble}.',
        zh: '我以此议所配得的合乎礼制的雅度予以接纳；那么，请进行吧。{q}。',
      },
    ],
    spietata: [
      {
        it: 'Acconsento, e lo faccio senza stupore: era la sola proposta sensata che la Vostra augusta persona potesse formulare, e con insolita solerzia ci siete arrivato. {Noble}.',
        zh: '我同意，且毫不惊讶：这是尊贵之躯所能提出的唯一合理之议，而您竟以罕见的勤勉想到了。{q}。',
      },
      {
        it: "Sì. Lo dico con solerzia, prima che la Vostra augusta persona trovi il modo di rovinare anche un'idea buona. {Noble}.",
        zh: '好。我勤勉迅捷地说出此字，趁尊贵之躯尚未找到把一个好主意也毁掉的方法。{q}。',
      },
      {
        it: "Concordo. Segnate il dì negli annali della magione: la Vostra velleità e la ragione, per una volta, incedono nella stessa direzione. {Noble}.",
        zh: '我赞同。请将今日载入府邸编年史：您的空妄之愿与理性，这一次竟朝同一方向缓步而行。{q}。',
      },
    ],
  },

  request: {
    diretta: [
      { it: 'Mi serve una cosa: {noble}.', zh: '我需要一件事：{q}。' },
      { it: 'Dai, fammi questo favore: {noble}.', zh: '来，帮我这个忙：{q}。' },
      { it: 'Per favore: {noble}.', zh: '拜托了：{q}。' },
    ],
    standard: [
      {
        it: 'Se la Vostra augusta persona lo consente, la mia avanza con garbo protocollare una supplica: {noble}.',
        zh: '若尊贵之躯允准，我谨以合乎礼制的雅度呈上一请：{q}。',
      },
      {
        it: 'Oso rivolgere alla Vostra magione una richiesta, confidando nella Vostra solerzia e nella Vostra grazia celestiale: {noble}.',
        zh: '我冒昧向您的府邸提出一请，仰赖您的勤勉迅捷与天界般的恩典：{q}。',
      },
      {
        it: "Non è velleità ma necessità ciò che mi spinge a chiedere, senza nocumento per la Vostra persona: {noble}.",
        zh: '驱使我开口的并非空妄之愿而是必需，且不致于您有任何损害：{q}。',
      },
    ],
    spietata: [
      {
        it: 'Vi chiedo un favore, e già so che la Vostra solerzia sarà quella di sempre: leggendaria per assenza. Comunque: {noble}.',
        zh: '我向您求一个人情，且已知您的勤勉一如往常：以缺席而闻名。无论如何：{q}。',
      },
      {
        it: "Mi rivolgo alla Vostra augusta persona con una richiesta semplice, calibrata sull'ingegno disponibile nella magione: {noble}.",
        zh: '我向尊贵之躯提出一个简单的请求，其难度已依府邸内可用的才智作了校准：{q}。',
      },
      {
        it: 'Il protocollo vuole che io chieda con garbo. Lo faccio. Che poi la Vostra persona comprenda, è velleità mia: {noble}.',
        zh: '礼制要求我以雅度相求。我照办了。至于您能否理解，那是我的空妄之愿：{q}。',
      },
    ],
  },

  command: {
    diretta: [
      { it: 'Fallo. Subito: {noble}.', zh: '去做。马上：{q}。' },
      { it: 'Muoviti: {noble}.', zh: '动起来：{q}。' },
      { it: 'Niente discussioni: {noble}.', zh: '不许讨论：{q}。' },
    ],
    standard: [
      {
        it: "La magione dispone, e la Vostra augusta persona vorrà eseguire con solerzia protocollare: {noble}.",
        zh: '府邸有令，尊贵之躯当以合乎礼制的勤勉迅捷执行：{q}。',
      },
      {
        it: "Sia fatto nell'istante presente, senza indugio né velleità di dissenso: {noble}.",
        zh: '于此刻即行，不得延宕，亦不得怀有异议的空妄之愿：{q}。',
      },
      {
        it: 'Il cerimoniale non ammette repliche: incedete e provvedete, con la solerzia che il caso richiede. {Noble}.',
        zh: '仪典不容置辩：请缓步前去办理，带着此事所需的勤勉迅捷。{q}。',
      },
    ],
    spietata: [
      {
        it: 'Eseguite, e fatelo con solerzia: so che è una parola nuova per la Vostra persona, ma la magione ha fede nei prodigi. {Noble}.',
        zh: '去执行，且要勤勉迅捷：我知这对您是个新词，但府邸对奇迹尚存信心。{q}。',
      },
      {
        it: "Vi ordino quanto segue, e lo ripeterò lentamente, affinché la Vostra vacuità d'ingegno non sia d'ostacolo: {noble}.",
        zh: '我命您如下，并将缓慢重复，以免您的才智之空乏成为阻碍：{q}。',
      },
      {
        it: "Provvedete. È un ordine, non una velleità, e non è negoziabile nemmeno nella Vostra magione immaginaria. {Noble}.",
        zh: '去办。这是命令，不是空妄之愿，即便在您想象中的府邸里也没有商量余地。{q}。',
      },
    ],
  },

  question: {
    diretta: [
      { it: 'Domanda secca: {noble}', zh: '直接问：{q}' },
      { it: 'Dimmi una cosa: {noble}', zh: '告诉我一件事：{q}' },
      { it: 'Voglio saperlo: {noble}', zh: '我想知道：{q}' },
    ],
    standard: [
      {
        it: 'La mia persona osa porre alla Vostra augusta persona un quesito, con garbo protocollare e sincera curiosità: {noble}',
        zh: '我冒昧向尊贵之躯呈上一问，带着合乎礼制的雅度与真诚的好奇：{q}',
      },
      {
        it: 'Sia concesso alla mia ignoranza di chiedere lume alla Vostra magione: {noble}',
        zh: '请允许我的无知向您的府邸求教：{q}',
      },
      {
        it: 'Un dubbio incede nel mio animo e soltanto la Vostra solerzia potrà dissiparlo: {noble}',
        zh: '一丝疑虑在我心中缓步徘徊，唯有您的勤勉迅捷方能驱散：{q}',
      },
    ],
    spietata: [
      {
        it: "Pongo alla Vostra augusta persona un quesito, pur sapendo che la risposta, se verrà, incederà con la solerzia di un ghiacciaio: {noble}",
        zh: '我向尊贵之躯提出一问，尽管深知答案——若它会来——将以冰川般的勤勉缓步而至：{q}',
      },
      {
        it: "Domando, e attendo con protocollare pazienza che la Vostra vacuità d'ingegno produca qualcosa di somigliante a una risposta: {noble}",
        zh: '我问了，并以合乎礼制的耐心等待您的才智之空乏产出某种近似答案的东西：{q}',
      },
      {
        it: 'Ecco la domanda. È semplice; l\'ho semplificata apposta, in considerazione della magione a cui è rivolta: {noble}',
        zh: '这就是问题。它很简单；我特意简化了，考虑到它所面向的那座府邸：{q}',
      },
    ],
  },

  complaint: {
    diretta: [
      { it: 'Che palle. {Noble}.', zh: '烦死了。{q}。' },
      { it: 'Non ne posso più: {noble}.', zh: '我受不了了：{q}。' },
      { it: 'Uffa, di nuovo. {Noble}.', zh: '唉，又来了。{q}。' },
    ],
    standard: [
      {
        it: 'Con protocollare mestizia segnalo alla Vostra augusta persona un nocumento che affligge la magione: {noble}.',
        zh: '谨以合乎礼制的哀愁向尊贵之躯禀报一桩困扰府邸的损害：{q}。',
      },
      {
        it: 'La mia persona patisce, e lo dice senza velleità di lagnanza ma per dovere di cronaca: {noble}.',
        zh: '我正在受苦，此言并非出于抱怨的空妄之愿，而是出于记述之责：{q}。',
      },
      {
        it: 'Il cerimoniale mi impone compostezza, ma la faccenda è tediosa oltre ogni solerzia di sopportazione: {noble}.',
        zh: '仪典命我保持端庄，然此事之乏味，已超出一切勤勉忍耐的限度：{q}。',
      },
    ],
    spietata: [
      {
        it: 'Mi lagno, e lo faccio con eleganza celestiale: {noble}. Se la magione fosse retta da ingegno e non da vacuità, non sarei qui a dirlo. {Noble}.',
        zh: '我抱怨，且以天界般的优雅抱怨：{q}。若这座府邸由才智而非空乏治理，我便不必站在此处诉说。',
      },
      {
        it: 'Il nocumento è questo: {noble}. Ne informo la Vostra augusta persona con solerzia, certo che la Vostra reazione sarà, come sempre, un elegante nulla. {Noble}.',
        zh: '损害如下：{q}。我勤勉迅捷地禀报尊贵之躯，并确信您的反应将一如既往：一场优雅的虚无。',
      },
      {
        it: "Ancora una volta: {noble}. La costanza con cui questa magione produce tedio sarebbe ammirevole, se fosse rivolta a qualcosa di utile. {Noble}.",
        zh: '又一次：{q}。这座府邸制造乏味的恒心本堪称可敬，若它能用于某件有用之事的话。',
      },
    ],
  },

  hunger: {
    diretta: [
      { it: 'Ho fame. Si mangia? {Noble}.', zh: '我饿了。开饭吗？{q}。' },
      { it: 'Muoio di fame. {Noble}.', zh: '饿死了。{q}。' },
      { it: 'Dammi qualcosa da mangiare. {Noble}.', zh: '给我点吃的。{q}。' },
    ],
    standard: [
      {
        it: "La mia persona avverte l'appetito e chiede, con protocollare urgenza, che la magione disponga le vivande: {noble}.",
        zh: '我感到食欲来袭，谨以合乎礼制的急切请求府邸备下佳肴：{q}。',
      },
      {
        it: 'Le mie membra reclamano il desinare; che la Vostra augusta persona voglia incedere con me verso la tavola. {Noble}.',
        zh: '我的身躯呼唤着正餐；愿尊贵之躯与我一同缓步走向餐桌。{q}。',
      },
      {
        it: "Non è velleità ma necessità celestiale: l'ora del desinare è giunta e la solerzia della cucina è attesa. {Noble}.",
        zh: '这并非空妄之愿，而是天界般的必需：正餐之时已至，厨房的勤勉迅捷正被期待。{q}。',
      },
    ],
    spietata: [
      {
        it: "Avverto l'appetito, e noto con protocollare stupore che la magione, pur ricca di vacuità, è povera di vivande. Si provveda. {Noble}.",
        zh: '我感到食欲来袭，并以合乎礼制的惊讶注意到：这座府邸虽富于空乏，却贫于佳肴。请着手解决。{q}。',
      },
      {
        it: "Desinerei, se la solerzia della cucina non fosse pari a quella dell'ingegno che la dirige. Attendo, con lo stomaco e la pazienza vuoti. {Noble}.",
        zh: '我本欲用餐，若厨房的勤勉不与掌管它的才智一样匮乏。我等着，胃与耐心皆空。{q}。',
      },
      {
        it: 'Chiedo vivande; una richiesta modesta persino per questa magione, dove ogni cosa incede tardi tranne il tedio. {Noble}.',
        zh: '我要求膳食；即便对这座府邸而言也算是个谦逊的请求——在这里除了乏味，一切都来得迟缓。{q}。',
      },
    ],
  },

  fatigue: {
    diretta: [
      { it: 'Sono stanco morto. {Noble}.', zh: '我累死了。{q}。' },
      { it: 'Non ce la faccio più, vado a dormire. {Noble}.', zh: '撑不住了，我去睡了。{q}。' },
      { it: 'Ho sonno, lasciatemi in pace. {Noble}.', zh: '我困了，别烦我。{q}。' },
    ],
    standard: [
      {
        it: 'Le mie membra reclamano riposo e la mia persona si ritira nella magione; il dì è stato solerte oltre misura. {Noble}.',
        zh: '我的四肢呼唤着休憩，我将退回府邸；今日之勤勉已远超限度。{q}。',
      },
      {
        it: 'Con protocollare stanchezza chiedo licenza di riposare: il cerimoniale attenderà il dì venturo. {Noble}.',
        zh: '谨以合乎礼制的疲惫请求告退休息：仪典可待来日再续。{q}。',
      },
      {
        it: "La fatica incede nel mio corpo con passo celestiale ma inesorabile; concedete che io mi ritiri senza nocumento. {Noble}.",
        zh: '疲惫以天界般却不可阻挡的步伐在我体内缓步而行；请允许我告退，不留损害。{q}。',
      },
    ],
    spietata: [
      {
        it: 'Sono esausto: sostenere la conversazione con la Vostra augusta persona richiede una solerzia che nessuna magione potrebbe fornire a lungo. {Noble}.',
        zh: '我筋疲力尽：与尊贵之躯维系交谈所需的勤勉，没有任何府邸能长久供给。{q}。',
      },
      {
        it: "Mi ritiro a riposare. Le mie membra sono stanche, il mio ingegno di più: ha dovuto compensare la vacuità di quello altrui per l'intero dì. {Noble}.",
        zh: '我退下休息。我的四肢疲乏，我的才智更甚：它整日都在补偿他人的空乏。{q}。',
      },
      {
        it: "Vado a dormire, e con protocollare franchezza Vi dico che il sonno, a differenza di questa magione, non mi arreca nocumento. {Noble}.",
        zh: '我去睡了，并以合乎礼制的坦率告知：睡眠——不同于这座府邸——不会给我造成损害。{q}。',
      },
    ],
  },

  affection: {
    diretta: [
      { it: 'Ti amo, punto e basta. {Noble}.', zh: '我爱你，就这么简单。{q}。' },
      { it: 'Mi piaci un sacco. {Noble}.', zh: '我特别喜欢你。{q}。' },
      { it: 'Mi manchi. {Noble}.', zh: '我想你。{q}。' },
    ],
    standard: [
      {
        it: 'Nutro per la Vostra augusta persona un sentimento celestiale che nessun protocollo saprebbe contenere: {noble}.',
        zh: '我对尊贵之躯怀有一种天界般的情感，任何礼制皆无法容纳：{q}。',
      },
      {
        it: "La mia persona incede verso la Vostra con passo solerte e cuore senza velleità: soltanto affetto, e magione aperta. {Noble}.",
        zh: '我以勤勉迅捷之步、不含空妄之愿的心，缓步趋向您：唯有爱意，与敞开的府邸。{q}。',
      },
      {
        it: "Sia detto senza cerimoniale, per una volta: la Vostra presenza è per me la sola cosa celestiale di questo dì. {Noble}.",
        zh: '就这一次，抛开仪典直言：您的在场，是我今日唯一如天界般的事物。{q}。',
      },
    ],
    spietata: [
      {
        it: "Vi amo, e lo dico con stupore protocollare: la Vostra vacuità d'ingegno non è bastata a dissuadermi. Ci ha provato, ma non è bastata. {Noble}.",
        zh: '我爱您，且带着合乎礼制的惊讶说出此言：您的才智之空乏竟未能劝退我。它尝试过，但没能成功。{q}。',
      },
      {
        it: 'La mia persona Vi è affezionata contro ogni ragione e contro il parere della magione intera. Consideratelo un sentimento celestiale, o una velleità. {Noble}.',
        zh: '我倾心于您，违背一切理性，亦违背整座府邸的意见。请将其视为天界般的情感，或是一桩空妄之愿。{q}。',
      },
      {
        it: "Mi mancate. È un nocumento che sopporto con solerzia, e che preferisco alla Vostra presenza soltanto nei giorni pari. {Noble}.",
        zh: '我想您。这是我勤勉忍受的一桩损害，且仅在双日里，我才更愿意想您而非见您。{q}。',
      },
    ],
  },

  money: {
    diretta: [
      { it: 'Parliamo di soldi: {noble}.', zh: '说钱的事：{q}。' },
      { it: 'Pagami, punto. {Noble}.', zh: '把钱付了。{q}。' },
      { it: 'Costa troppo. {Noble}.', zh: '太贵了。{q}。' },
    ],
    standard: [
      {
        it: 'La faccenda dei denari incede con protocollare urgenza e richiede la Vostra solerte attenzione: {noble}.',
        zh: '钱财之事以合乎礼制的急切缓步而来，需要您勤勉迅捷的关注：{q}。',
      },
      {
        it: 'La magione tiene registro dei denari con celestiale precisione, e il registro dice: {noble}.',
        zh: '府邸以天界般的精确记录着钱财，而账簿如是说：{q}。',
      },
      {
        it: 'Sia detto senza nocumento e con garbo: i denari sono faccenda protocollare, e il protocollo attende. {Noble}.',
        zh: '谨以不含损害的雅度直言：钱财乃合乎礼制之事，而礼制正在等待。{q}。',
      },
    ],
    spietata: [
      {
        it: 'I denari: la sola faccenda in cui la Vostra augusta persona mostra solerzia, purché si tratti di riceverli e non di renderli. {Noble}.',
        zh: '钱财：尊贵之躯唯一显露勤勉的事项——只要是收取而非归还。{q}。',
      },
      {
        it: "Parliamo di denari, argomento che la Vostra vacuità d'ingegno comprende sorprendentemente bene quando è a Vostro vantaggio. {Noble}.",
        zh: '我们谈谈钱财吧——一个您的才智之空乏在于己有利时理解得出奇透彻的话题。{q}。',
      },
      {
        it: "Il conto della magione è celestiale nella sua chiarezza e la Vostra memoria coatta nel dimenticarlo. Rimedio: {noble}.",
        zh: '府邸的账目清晰得如天界一般，而您的记忆在遗忘它时粗鄙得毫不含糊。补救如下：{q}。',
      },
    ],
  },

  lateness: {
    diretta: [
      { it: 'Sei in ritardo. Di nuovo. {Noble}.', zh: '你迟到了。又一次。{q}。' },
      { it: 'Arrivo tardi, non aspettarmi. {Noble}.', zh: '我会晚到，别等我。{q}。' },
      { it: 'Ti aspetto da un\'ora. {Noble}.', zh: '我等了你一个小时。{q}。' },
    ],
    standard: [
      {
        it: "L'ora protocollare è trascorsa e la Vostra augusta persona non ha ancora inceduto oltre la soglia; la magione attende con solerzia. {Noble}.",
        zh: '合乎礼制的时辰已过，尊贵之躯尚未缓步跨过门槛；府邸勤勉迅捷地等待着。{q}。',
      },
      {
        it: "La mia persona incede con ritardo e ne chiede protocollare perdono; il nocumento non fu voluto. {Noble}.",
        zh: '我缓步迟至，谨依礼制请求宽恕；此损害并非本意。{q}。',
      },
      {
        it: "Il tempo, celestiale e inesorabile, ha superato l'ora convenuta; se ne prenda atto senza velleità di scuse. {Noble}.",
        zh: '时光，如天界般不可阻挡，已越过约定之时；请如实记录，勿怀致歉的空妄之愿。{q}。',
      },
    ],
    spietata: [
      {
        it: "La Vostra augusta persona incede con la solerzia di un ghiacciaio: la magione ha visto sorgere e tramontare il sole nell'attesa. {Noble}.",
        zh: '尊贵之躯以冰川般的勤勉缓步而来：府邸在等候中看过了日升日落。{q}。',
      },
      {
        it: "Il ritardo non è più nocumento: è tradizione. Vi si attende come si attende la pioggia, senza stima ma con rassegnazione protocollare. {Noble}.",
        zh: '迟到已不再是损害，而是传统。人们等您如等雨——不带敬意，唯有合乎礼制的顺从。{q}。',
      },
      {
        it: "Siete in ritardo. Nella Vostra magione l'orologio è evidentemente una velleità decorativa. {Noble}.",
        zh: '您迟到了。在您的府邸里，时钟显然只是一件装饰性的空妄之愿。{q}。',
      },
    ],
  },

  threat: {
    diretta: [
      { it: 'Te ne pentirai. {Noble}.', zh: '你会后悔的。{q}。' },
      { it: 'Stai attento a come parli. {Noble}.', zh: '说话小心点。{q}。' },
      { it: 'Non provocarmi. {Noble}.', zh: '别惹我。{q}。' },
    ],
    standard: [
      {
        it: "La Vostra augusta persona vorrà ponderare con solerzia: la magione non dimentica il nocumento, e il protocollo prevede conseguenze. {Noble}.",
        zh: '尊贵之躯当勤勉迅捷地斟酌：府邸不会忘却损害，而礼制早有后果之规。{q}。',
      },
      {
        it: 'Vi avverto con protocollare garbo: proseguite su questa via, e il Vostro incedere troverà ostacoli non celestiali. {Noble}.',
        zh: '谨以合乎礼制的雅度警示您：若继续此路，您的缓步前行将遭遇并非天界赐予的阻碍。{q}。',
      },
      {
        it: 'Non è velleità mia, ma promessa della magione: ogni nocumento arrecato sarà restituito con misura e cerimoniale. {Noble}.',
        zh: '这并非我的空妄之愿，而是府邸的承诺：所造成的每一分损害，皆将依度、依仪典奉还。{q}。',
      },
    ],
    spietata: [
      {
        it: "Continuate pure. La magione ha una lunga memoria e una pazienza breve, e la Vostra vacuità d'ingegno non sarà attenuante quando il protocollo chiederà il conto. {Noble}.",
        zh: '请继续吧。府邸记忆悠长而耐心短促；待礼制清算之日，您的才智之空乏不会成为减罚的理由。{q}。',
      },
      {
        it: "Vi consiglio solerzia nel ritirarvi: sarebbe nocumento per me sporcare il cerimoniale con la Vostra persona, ma non un nocumento che mi turberebbe. {Noble}.",
        zh: '我建议您勤勉迅捷地退下：以您之躯玷污仪典于我是一种损害，却并非会令我不安的那种。{q}。',
      },
      {
        it: 'Incedete con cautela, augusta persona: il velluto di questa magione copre lame, e le lame non hanno protocollo. {Noble}.',
        zh: '尊贵之躯，请谨慎缓步：这座府邸的天鹅绒之下藏着利刃，而利刃不讲礼制。{q}。',
      },
    ],
  },

  boast: {
    diretta: [
      { it: 'Sono il migliore, e lo sai. {Noble}.', zh: '我最厉害，你知道的。{q}。' },
      { it: 'Ce l\'ho fatta, come sempre. {Noble}.', zh: '我又成功了，一如往常。{q}。' },
      { it: 'Nessuno è al mio livello. {Noble}.', zh: '没人能到我这个水平。{q}。' },
    ],
    standard: [
      {
        it: 'Sia detto con protocollare modestia: la mia persona ha inceduto ove altri hanno inciampato, e la magione ne dà testimonianza. {Noble}.',
        zh: '谨以合乎礼制的谦逊而言：我缓步走过他人跌倒之处，府邸可为之作证。{q}。',
      },
      {
        it: "L'impresa è compiuta con solerzia celestiale e senza nocumento; il cerimoniale consente un istante di legittima soddisfazione. {Noble}.",
        zh: '功业以天界般的勤勉迅捷完成，且无损害；仪典允许片刻正当的满足。{q}。',
      },
      {
        it: 'Non è velleità ma constatazione: il mio ingegno ha reso alla magione un servizio che pochi avrebbero saputo rendere. {Noble}.',
        zh: '这并非空妄之愿而是事实陈述：我的才智为府邸效力，鲜有人能及。{q}。',
      },
    ],
    spietata: [
      {
        it: "Ho trionfato. Non è un vanto: è il naturale esito quando l'ingegno incede in una magione dove la concorrenza è tutta vacuità. {Noble}.",
        zh: '我胜了。这不是自夸：当才智缓步于一座对手尽皆空乏的府邸，这是自然的结局。{q}。',
      },
      {
        it: 'La mia solerzia ha fatto ciò che la Vostra velleità sognava. Non serbate rancore: il protocollo prevede che qualcuno vinca, e prevede chi. {Noble}.',
        zh: '我的勤勉完成了您的空妄之愿所梦想的事。莫要怀恨：礼制规定总有人胜出，并且规定了是谁。{q}。',
      },
      {
        it: "Sono il migliore, e dirlo non è nocumento alla modestia: è nocumento soltanto a chi sperava il contrario. {Noble}.",
        zh: '我是最出色的；说出这话并不损害谦逊，只损害那些曾期望相反结果的人。{q}。',
      },
    ],
  },

  statement: {
    diretta: [
      { it: 'Detto chiaro: {noble}.', zh: '直说了：{q}。' },
      { it: 'In parole povere: {noble}.', zh: '简单说：{q}。' },
      { it: 'Punto e basta: {noble}.', zh: '就是这样：{q}。' },
    ],
    standard: [
      {
        it: 'La mia persona espone alla Vostra augusta persona, con garbo protocollare, quanto segue: {noble}.',
        zh: '我谨以合乎礼制的雅度，向尊贵之躯陈述如下：{q}。',
      },
      {
        it: 'Sia messo agli atti della magione, con solerzia e senza nocumento: {noble}.',
        zh: '请以勤勉迅捷、不含损害之态，载入府邸案卷：{q}。',
      },
      {
        it: 'Il cerimoniale mi consente una dichiarazione, e io la rendo con animo celestiale: {noble}.',
        zh: '仪典允许我作一声明，我以天界般的心境宣之：{q}。',
      },
    ],
    spietata: [
      {
        it: "Dichiaro quanto segue, e lo dichiaro lentamente, affinché incida anche nella Vostra magione: {noble}.",
        zh: '我宣告如下，且缓缓宣告，以便它也能刻入您的府邸：{q}。',
      },
      {
        it: 'Constato, con la solerzia che la Vostra persona non conosce: {noble}. Il protocollo mi vieta di aggiungere ciò che penso.',
        zh: '我以您所不知的勤勉迅捷陈述：{q}。礼制禁止我补充心中所想。',
      },
      {
        it: "Ecco la faccenda, ridotta a misura della vacuità d'ingegno disponibile: {noble}. Non vi è altro da comprendere, per fortuna Vostra.",
        zh: '事情如下，已缩减至可用才智之空乏的尺度：{q}。所幸于您，再无更多需要理解之处。',
      },
    ],
  },
}
