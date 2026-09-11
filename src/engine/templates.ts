import type { IntentId, Level, Rendering } from './types.ts'

/**
 * Every level is a complete paraphrase of the intent, written by hand in
 * Italian and Chinese. The only placeholders most templates use are the
 * addressee slots, which vanish when the phrase has no vocative:
 *
 *   {Voc}    sentence-opening vocative: "Ale, " / "Ale，" (or nothing)
 *   {voc}    mid-sentence vocative: ", Ale" / "，Ale" (or nothing)
 *
 * Content-carrying intents (request, command, question, complaint, money,
 * statement — see SLOT_INTENTS) additionally embed the thing being asked or
 * stated, run through the matching lexicon:
 *
 *   {blunt} / {Blunt}   the topic in colloquial wording (Volgare level)
 *   {noble} / {Noble}   the topic run through the noble lexicon (noble levels)
 *   {q}                 the topic in quotation marks («…» in Italian, 「…」 in Chinese)
 *
 * Noble levels address the interlocutor in the Lei form (La, Le, Sua, Suo) in
 * Italian and as 阁下 / 尊贵之躯 in Chinese.
 */
export type TemplateSet = Record<Level, readonly Rendering[]>

export const TEMPLATES: Record<IntentId, TemplateSet> = {
  greeting: {
    diretta: [
      { it: '{Voc}ciao, come butta?', zh: '{Voc}嗨，最近咋样？' },
      { it: '{Voc}ehi, eccomi. Tutto a posto?', zh: '{Voc}喂，我来了。都还好吧？' },
      { it: "{Voc}salve, gente. Ci sono anch'io.", zh: '{Voc}各位好，我也到了。' },
    ],
    standard: [
      {
        it: '{Voc}porgo alla Sua augusta persona il più protocollare dei saluti, e Le auguro un dì celestiale sotto il tetto di questa magione.',
        zh: '{Voc}谨向尊贵之躯敬献最合乎礼制的问候，并祝阁下在此府邸屋檐之下度过天界般的一日。',
      },
      {
        it: '{Voc}che il dì Le sia propizio: la mia persona incede al Suo cospetto per rendere omaggio, come il cerimoniale della casata esige.',
        zh: '{Voc}愿今日于阁下诸事顺遂：我缓步至您面前致以敬意，一如家族仪典所要求。',
      },
      {
        it: '{Voc}mi sia concesso di salutarLa con la solerzia che il protocollo impone e il garbo che la magione richiede; la Sua presenza onora queste sale.',
        zh: '{Voc}请允许我以礼制所要求的勤勉、府邸所需的雅度向阁下致意；您的莅临令这厅堂生辉。',
      },
    ],
    spietata: [
      {
        it: '{Voc}vedo che la Sua augusta persona ha infine trovato la via della magione; il cerimoniale prevedeva un saluto, ed eccolo, protocollare quanto basta e non un grammo di più.',
        zh: '{Voc}看来尊贵之躯终于寻得了府邸的门径；仪典规定须有一声问候，那便在此——恰好合乎礼制，一分不多。',
      },
      {
        it: '{Voc}salve. Non lo dico con slancio celestiale, ma il protocollo lo esige, e io sono più solerte nel protocollo che nella simpatia.',
        zh: '{Voc}您好。此言并非出于天界般的热忱，只因礼制如此要求，而我于礼制之勤勉，远胜于对您的好感。',
      },
      {
        it: '{Voc}inceda pure oltre la soglia: la magione ha accolto ospiti di ben altra statura, ma il saluto Le è comunque dovuto, e io sono uomo di parola.',
        zh: '{Voc}请缓步跨过门槛吧：这座府邸曾迎接过气度远胜于您的宾客，但这声问候仍是您应得的，而我向来言出必行。',
      },
    ],
  },

  farewell: {
    diretta: [
      { it: '{Voc}me ne vado, ci si becca.', zh: '{Voc}我走了，回见。' },
      { it: '{Voc}ciao, ci vediamo in giro.', zh: '{Voc}拜了，江湖再见。' },
      { it: '{Voc}ok, tolgo il disturbo. Alla prossima.', zh: '{Voc}行了，我不打扰了，下回见。' },
    ],
    standard: [
      {
        it: '{Voc}la mia persona si accinge a incedere altrove: lascio la Sua magione con animo grato e passo protocollare.',
        zh: '{Voc}我即将缓步他往：怀着感激之心与合乎礼制的步伐，辞别阁下的府邸。',
      },
      {
        it: '{Voc}il cerimoniale mi chiama sotto altro tetto. Prendo congedo dalla Sua augusta persona con un commiato celestiale e senza nocumento alcuno.',
        zh: '{Voc}仪典召我前往另一处屋檐之下。我以天界般的告别辞别尊贵之躯，不留一丝损害。',
      },
      {
        it: '{Voc}mi conceda di ritirarmi con solerzia: il dì volge al termine e le mie membra reclamano la via della magione. A rivederLa.',
        zh: '{Voc}请允许我勤勉迅捷地退下：白日将尽，我的四肢已呼唤归府之路。他日再会。',
      },
    ],
    spietata: [
      {
        it: "{Voc}mi ritiro, e con me si ritira anche l'unico ingegno presente in questa magione. Che il Suo dì prosegua nella consueta vacuità.",
        zh: '{Voc}我退下了，随我一同退下的，是这府邸中仅存的才智。愿阁下的白日在惯常的空乏中延续。',
      },
      {
        it: '{Voc}incedo altrove con solerzia insolita: non per fretta, ma per la celestiale gioia di non doverLa più ascoltare.',
        zh: '{Voc}我以异乎寻常的迅捷缓步他往：并非匆忙，而是出于无需再聆听阁下言语的天界般喜悦。',
      },
      {
        it: '{Voc}il protocollo mi impone di salutare prima di uscire. Ho ottemperato. Ogni ulteriore indugio sarebbe nocumento per entrambi, e soprattutto per me.',
        zh: '{Voc}礼制命我离去前须行告别。我已照办。任何进一步的逗留，于你我皆是损害——尤其于我。',
      },
    ],
  },

  gratitude: {
    diretta: [
      { it: '{Voc}grazie, davvero. Mi hai salvato.', zh: '{Voc}谢了，真心的。你救了我一命。' },
      { it: '{Voc}grazie mille, sei un grande.', zh: '{Voc}多谢啊，你真够意思。' },
      { it: '{Voc}ti devo un favore, e pure grosso.', zh: '{Voc}我欠你一个人情，还是个大人情。' },
    ],
    standard: [
      {
        it: '{Voc}la mia gratitudine incede verso la Sua augusta persona con passo solerte e cuore protocollare: senza il Suo intervento avrei patito grave nocumento.',
        zh: '{Voc}我的感激之情，以勤勉迅捷之步、合乎礼制之心，缓步趋向尊贵之躯：若无阁下援手，我必已蒙受重大损害。',
      },
      {
        it: '{Voc}che la Sua magione sia benedetta da grazia celestiale per il favore concesso; la mia persona ne conserverà memoria imperitura.',
        zh: '{Voc}愿阁下的府邸因所赐之恩而蒙天界般的福泽；我将永志不忘。',
      },
      {
        it: '{Voc}non è velleità di cortigiano ma dovere protocollare renderLe grazie: la Sua solerzia mi ha risparmiato un dì di pena.',
        zh: '{Voc}向阁下致谢并非廷臣的空妄之愿，而是礼制之责：您的勤勉迅捷使我免于一日之苦。',
      },
    ],
    spietata: [
      {
        it: '{Voc}La ringrazio, e lo faccio con sincero stupore: non credevo la Sua persona capace di tanta solerzia. Il protocollo mi impone di dirlo, la cortesia di non aggiungere altro.',
        zh: '{Voc}我向阁下致谢，且怀着真诚的惊讶：我从未料到您竟能如此勤勉。礼制命我道谢，礼貌则命我就此打住。',
      },
      {
        it: '{Voc}gratitudine celestiale per un gesto che, in qualunque altra magione, sarebbe stato il minimo. Qui è quasi un prodigio, e io annoto i prodigi.',
        zh: '{Voc}对这一举动致以天界般的感激——在其他任何府邸，此举不过是最低限度；在此处却近乎奇迹，而我向来记录奇迹。',
      },
      {
        it: '{Voc}grazie. Segno il fatto negli annali della magione, tra le rare occasioni in cui la Sua augusta persona non ha arrecato nocumento.',
        zh: '{Voc}谢谢。我已将此事载入府邸编年史，列于尊贵之躯未曾造成损害的少数场合之中。',
      },
    ],
  },

  apology: {
    diretta: [
      { it: '{Voc}scusa, ho fatto una cavolata.', zh: '{Voc}对不起，我搞砸了。' },
      { it: '{Voc}colpa mia, non succede più.', zh: '{Voc}我的错，下次不会了。' },
      { it: '{Voc}ok, mi dispiace. Davvero.', zh: '{Voc}好吧，我很抱歉。真的。' },
    ],
    standard: [
      {
        it: '{Voc}la mia persona china il capo davanti alla Sua augusta persona e chiede protocollare perdono per il nocumento arrecato.',
        zh: '{Voc}我在尊贵之躯面前俯首，为所造成的损害恳求合乎礼制的宽恕。',
      },
      {
        it: '{Voc}riconosco con solerzia il mio errore e La prego di non serbarne memoria nella Sua magione: non fu malizia, fu vacuità momentanea.',
        zh: '{Voc}我勤勉迅捷地承认过失，恳请阁下勿在府邸中留下记忆：那并非恶意，只是一时的空乏。',
      },
      {
        it: '{Voc}mi sia concessa la grazia celestiale del Suo perdono; il cerimoniale prevede la penitenza, e io la accolgo con animo contrito.',
        zh: '{Voc}愿阁下以天界般的恩典赐我宽恕；仪典规定须行忏悔，我怀着悔悟之心欣然领受。',
      },
    ],
    spietata: [
      {
        it: '{Voc}chiedo perdono, come il protocollo esige. Che la colpa sia mia è opinabile, ma la Sua augusta persona pare tenerci, e io sono magnanimo.',
        zh: '{Voc}我依礼制请求宽恕。过错是否在我尚可商榷，但尊贵之躯似乎颇为在意，而我向来宽宏大量。',
      },
      {
        it: '{Voc}mi scuso per il nocumento; non immaginavo che la Sua persona fosse tanto delicata da patirne. Ne terrò conto, protocollarmente.',
        zh: '{Voc}我为所造成的损害致歉；未曾想到阁下竟如此纤弱以至于受伤。我会依礼制记下这一点。',
      },
      {
        it: "{Voc}mi perdoni: ho sbagliato a presumere che nella Sua magione l'ingegno bastasse a comprendere il mio intento.",
        zh: '{Voc}请阁下宽恕：我错在以为您府邸中的才智足以领会我的本意。',
      },
    ],
  },

  praise: {
    diretta: [
      { it: '{Voc}hai delle idee della madonna!', zh: '{Voc}你这想法也太牛逼了吧！' },
      { it: '{Voc}sei un mostro, davvero. Chapeau.', zh: '{Voc}你太牛了，真的，服气。' },
      { it: '{Voc}grande, hai spaccato di brutto.', zh: '{Voc}厉害啊，干得漂亮，绝了。' },
    ],
    standard: [
      {
        it: '{Voc}la Sua augusta persona ha dato prova di un ingegno tanto solerte quanto raro; la magione intera ne trae lustro e Le porge i più protocollari encomi.',
        zh: '{Voc}尊贵之躯所展露的才智，既勤勉迅捷又世所罕见；整座府邸因之增辉，并向阁下敬献最合乎礼制的褒扬。',
      },
      {
        it: '{Voc}sia detto secondo protocollo: raramente un pensiero così celestiale nella forma e così fecondo nella sostanza ha onorato queste sale.',
        zh: '{Voc}谨依礼制而言：阁下的思想形式上如天界一般，实质上丰饶充盈；如此才智，鲜少光临此厅堂。',
      },
      {
        it: '{Voc}non è velleità di cortigiano ma verità protocollare: le Sue idee recano alla magione beneficio, lustro e nessun nocumento.',
        zh: '{Voc}这并非廷臣的空妄之言，而是合乎礼制的真言：阁下的构想为府邸带来裨益与荣光，未有丝毫损害。',
      },
    ],
    spietata: [
      {
        it: '{Voc}la fecondità del Suo ingegno lascia attoniti i consessi più illustri; la magione si inchina, con protocollare stupore, a tanta augusta genialità.',
        zh: '{Voc}阁下才思之丰饶，令最显赫的议席为之愕然；府邸怀着合乎礼制的惊讶，向如此尊贵的天纵之才俯首。',
      },
      {
        it: '{Voc}devo ammetterlo: per una volta la Sua augusta persona ha inceduto senza inciampare. La magione ne prende atto con stupore protocollare e una punta di sollievo.',
        zh: '{Voc}我必须承认：这一次，尊贵之躯缓步而行竟未跌倒。府邸怀着合乎礼制的惊讶——以及一丝宽慰——记录在案。',
      },
      {
        it: '{Voc}celestiale, davvero. Se la Sua solerzia fosse costante e non un evento astronomico, la magione non saprebbe come contenere tanta grazia.',
        zh: '{Voc}天界般的，确实。若阁下的勤勉能持之以恒而非如天文奇观般偶现，府邸恐将无处安放如此优雅。',
      },
    ],
  },

  insult: {
    diretta: [
      { it: "{Voc}sei proprio un idiota, non c'è niente da fare.", zh: '{Voc}你就是个白痴，没救了。' },
      { it: '{Voc}ma quanto sei scemo? Fai pena.', zh: '{Voc}你可真够蠢的，看着都可怜。' },
      { it: '{Voc}sei una nullità, mettitelo in testa.', zh: '{Voc}你就是个废物，记住了。' },
    ],
    standard: [
      {
        it: "{Voc}la Sua augusta persona manifesta una vacuità d'ingegno che il protocollo mi vieta di nominare, ma che la magione intera ha già notato.",
        zh: '{Voc}尊贵之躯所显露的才智之空乏，礼制禁止我直呼其名，然整座府邸皆已察觉。',
      },
      {
        it: '{Voc}con garbo protocollare Le segnalo che il Suo incedere in questa faccenda è quello di un coatto, non di un nobile.',
        zh: '{Voc}谨以合乎礼制的雅度提醒阁下：您在此事中的缓步姿态，属粗鄙之徒而非贵族。',
      },
      {
        it: "{Voc}non è nocumento che Le arreco, bensì constatazione: la Sua persona è solerte soltanto nell'errare.",
        zh: '{Voc}我并非向阁下施加损害，只是陈述事实：您唯有在犯错一事上勤勉迅捷。',
      },
    ],
    spietata: [
      {
        it: "{Voc}La definirei coatto, ma sarebbe offesa ai coatti, i quali almeno incedono senza pretese celestiali. La Sua vacuità d'ingegno, invece, ha ambizioni.",
        zh: '{Voc}我本欲称阁下为粗鄙之徒，但这对粗鄙之徒是种冒犯——他们至少行走时不带天界般的自负。而您的才智之空乏，却颇有雄心。',
      },
      {
        it: '{Voc}osservare la Sua augusta persona ragionare è come osservare una magione bruciare: spettacolo tragico, ma di una solerzia ammirevole nel rovinarsi.',
        zh: '{Voc}观看尊贵之躯思考，如同观看一座府邸焚毁：悲剧一场，却在自毁之路上勤勉得令人赞叹。',
      },
      {
        it: "{Voc}il protocollo mi impone rispetto per la Sua persona; l'ingegno, purtroppo, mi impone di notare che nella Sua non ve n'è alcuno.",
        zh: '{Voc}礼制命我尊重阁下的人格；而才智，可惜，命我注意到您身上并无才智可言。',
      },
    ],
  },

  dismissal: {
    diretta: [
      { it: '{Voc}vattene, non ho tempo da perdere con te.', zh: '{Voc}走开，我没时间跟你耗。' },
      { it: '{Voc}basta, sparisci dalla mia vista.', zh: '{Voc}够了，从我眼前消失。' },
      { it: '{Voc}non mi interessa. Fuori.', zh: '{Voc}我不感兴趣。出去。' },
    ],
    standard: [
      {
        it: '{Voc}la Sua augusta persona è invitata a incedere altrove: la magione non dispone al momento di indugio da concederLe.',
        zh: '{Voc}敬请尊贵之躯缓步他往：府邸此刻并无可赐予阁下的片刻停留。',
      },
      {
        it: '{Voc}il protocollo mi impone garbo, la ragione mi impone di congedarLa: inceda pure, e senza nocumento.',
        zh: '{Voc}礼制命我持雅度，理智命我送客：请阁下缓步离去，勿留损害。',
      },
      {
        it: '{Voc}ritengo la faccenda conclusa. La prego di lasciare la magione con la stessa solerzia con cui vi si è introdotta.',
        zh: '{Voc}我认为此事已了。请阁下以进入时的同等勤勉迅捷，离开这座府邸。',
      },
    ],
    spietata: [
      {
        it: '{Voc}inceda altrove, augusta persona: la magione ha già sofferto abbastanza nocumento per un solo dì, e la porta è stata concepita anche per uscire.',
        zh: '{Voc}尊贵之躯，请缓步他往：这座府邸一日之内所受的损害已足够，而那扇门，设计之初也是为了出去。',
      },
      {
        it: '{Voc}La congedo con la solerzia che riservo alle faccende inutili. Il Suo allontanarsi non sarà rimpianto da nessuno, protocollarmente parlando.',
        zh: '{Voc}我以专为无用之事保留的勤勉迅捷送阁下离去。依礼制而言，您的离场无人惋惜。',
      },
      {
        it: '{Voc}la Sua presenza è una velleità che la magione non ha mai coltivato. Esca; il silenzio che lascerà sarà celestiale.',
        zh: '{Voc}阁下的在场是一桩府邸从未培育的空妄之愿。请出去；您留下的寂静将如天界一般。',
      },
    ],
  },

  disturbance: {
    diretta: [
      { it: '{Voc}hai rotto il c***o, levati di torno.', zh: '{Voc}你烦死了，滚一边去。' },
      { it: '{Voc}mi stai rompendo le p***e, piantala.', zh: '{Voc}别再烦我了，闹够了没？' },
      { it: '{Voc}sei un disturbo ambulante. Sparisci un attimo.', zh: '{Voc}你就是个移动的噪音，消失一会儿。' },
    ],
    standard: [
      {
        it: '{Voc}La prego di non arrecare ulteriore nocumento alla mia quiete.',
        zh: '{Voc}恳请阁下勿再对我的清静施加更多损害。',
      },
      {
        it: '{Voc}la Sua augusta persona vorrà concedere alla mia un istante di raccoglimento: la magione ha bisogno di silenzio, e io di solerzia indisturbata.',
        zh: '{Voc}愿尊贵之躯赐我片刻静思：府邸需要安宁，而我需要不受扰的勤勉。',
      },
      {
        it: '{Voc}con garbo protocollare Le segnalo che la Sua presenza, in questo istante, incede in territorio di molestia. La invito a ritirarsi.',
        zh: '{Voc}谨以合乎礼制的雅度提醒阁下：您此刻的在场，已缓步踏入滋扰之境。敬请退下。',
      },
    ],
    spietata: [
      {
        it: '{Voc}sarei infinitamente lieto di bearmi della Sua assenza; la magione ne trarrebbe una quiete celestiale.',
        zh: '{Voc}若能沉醉于阁下的缺席，我将感到无限欣慰；府邸亦将由此获得天界般的宁静。',
      },
      {
        it: '{Voc}la Sua solerzia nel disturbare è ammirevole; se la rivolgesse ad altra magione, sarebbe persino utile.',
        zh: '{Voc}阁下在扰人一事上的勤勉令人赞叹；若能将其施于另一座府邸，甚至还算有用。',
      },
      {
        it: '{Voc}continui pure a interrompermi: il nocumento è lieve, la vacuità che lo produce è invece notevole.',
        zh: '{Voc}请继续打断我吧：损害虽轻，制造它的空乏却颇为可观。',
      },
    ],
  },

  silence: {
    diretta: [
      { it: '{Voc}stai zitto, per favore. Basta parlare.', zh: '{Voc}闭嘴，拜托了，别再说了。' },
      { it: '{Voc}chiudi il becco un secondo.', zh: '{Voc}把嘴闭上一秒钟行不行。' },
      { it: '{Voc}silenzio. Non voglio sentire più una parola.', zh: '{Voc}安静。我一个字都不想再听。' },
    ],
    standard: [
      {
        it: '{Voc}La prego di concedere al silenzio il posto che il protocollo gli riserva: la magione ne ha bisogno, e io con essa.',
        zh: '{Voc}恳请阁下将礼制所预留的位置让与寂静：府邸需要它，我亦然。',
      },
      {
        it: '{Voc}la Sua augusta persona vorrà trattenere la parola: in questo istante la solerzia richiesta è quella del tacere.',
        zh: '{Voc}愿尊贵之躯敛口不言：此刻所需的勤勉，是沉默的勤勉。',
      },
      {
        it: '{Voc}il cerimoniale prevede momenti di quiete, e questo è uno di quelli. Le chiedo, con garbo, di onorarlo.',
        zh: '{Voc}仪典设有静默之时，而此刻正是其一。我以雅度请阁下予以尊奉。',
      },
    ],
    spietata: [
      {
        it: "{Voc}il silenzio Le si addice: è l'unico ornamento che la Sua vacuità d'ingegno non riesce a rovinare.",
        zh: '{Voc}沉默与阁下十分相称：它是您的才智之空乏唯一无法毁掉的装饰。',
      },
      {
        it: '{Voc}taccia, La prego. La magione ha già ascoltato abbastanza per stabilire che la Sua voce e il Suo ingegno incedono su strade separate.',
        zh: '{Voc}请阁下住口。府邸所闻已足以断定：您的声音与您的才智，缓步行于两条互不相交的道路。',
      },
      {
        it: '{Voc}ogni Sua parola è un piccolo nocumento; La invito, per protocollare misericordia verso i presenti, a non produrne altre.',
        zh: '{Voc}阁下的每一句话都是一桩小小的损害；出于对在场诸人合乎礼制的怜悯，我请您勿再制造。',
      },
    ],
  },

  refusal: {
    diretta: [
      { it: '{Voc}no. Scordatelo.', zh: '{Voc}不。别想了。' },
      { it: '{Voc}non se ne parla proprio.', zh: '{Voc}免谈，想都别想。' },
      { it: '{Voc}no, e non insistere che tanto non cambio idea.', zh: '{Voc}不行，别再坚持了，我不会改主意的。' },
    ],
    standard: [
      {
        it: '{Voc}la mia persona non nutre velleità alcuna di accondiscendere: la richiesta è declinata secondo protocollo, e senza nocumento.',
        zh: '{Voc}我并无任何应允的空妄之愿：此请求依礼制予以谢绝，不含损害之意。',
      },
      {
        it: '{Voc}con protocollare fermezza Le comunico che la magione non concederà quanto chiesto; La prego di non insistere oltre.',
        zh: '{Voc}谨以合乎礼制的坚定告知阁下：府邸不会应允所求；请勿再坚持。',
      },
      {
        it: '{Voc}il diniego è celestiale nella sua chiarezza: no. La Sua augusta persona vorrà comprenderne le ragioni senza che io le esponga.',
        zh: '{Voc}此拒绝清晰得如天界一般：不。尊贵之躯当能领会缘由，无需我一一陈明。',
      },
    ],
    spietata: [
      {
        it: '{Voc}no. Lo dico con la solerzia che merita una velleità tanto ardita, e con il garbo protocollare che la Sua persona non ricambierebbe.',
        zh: '{Voc}不。我以如此大胆的空妄之愿所配得的勤勉迅捷说出此字，并带着阁下绝不会回报的合乎礼制的雅度。',
      },
      {
        it: '{Voc}declino. Che la Sua augusta persona abbia osato chiederlo dice molto sul Suo ingegno; che io risponda con garbo dice molto sul mio.',
        zh: '{Voc}我谢绝。尊贵之躯竟敢提出此求，足以说明您的才智；我竟以雅度回应，足以说明我的。',
      },
      {
        it: '{Voc}la magione rifiuta, e con essa rifiuto io. Se cerca un sì, inceda verso una magione con standard più modesti.',
        zh: '{Voc}府邸拒绝，我亦随之拒绝。若阁下寻求一声“好”，请缓步前往一座标准更为寒微的府邸。',
      },
    ],
  },

  agreement: {
    diretta: [
      { it: '{Voc}ok, ci sto.', zh: '{Voc}行，我加入。' },
      { it: '{Voc}sì, va benissimo così.', zh: '{Voc}嗯，这样就挺好。' },
      { it: "{Voc}d'accordo, facciamo come dici tu.", zh: '{Voc}同意，就按你说的办。' },
    ],
    standard: [
      {
        it: '{Voc}sia come da protocollo: la mia persona accorda con solerzia quanto la Sua augusta persona propone.',
        zh: '{Voc}一切依礼制而行：我勤勉迅捷地应允尊贵之躯所提之议。',
      },
      {
        it: '{Voc}la magione concorda: la proposta è celestiale nel disegno e priva di nocumento nella sostanza.',
        zh: '{Voc}府邸表示同意：此议在构想上如天界一般，在实质上不含损害。',
      },
      {
        it: '{Voc}accolgo la Sua proposta con il garbo protocollare che essa merita; si proceda dunque senza indugio.',
        zh: '{Voc}我以此议所配得的合乎礼制的雅度予以接纳；那么，请即刻进行，勿再迟延。',
      },
    ],
    spietata: [
      {
        it: '{Voc}acconsento, e lo faccio senza stupore: era la sola proposta sensata che la Sua augusta persona potesse formulare, e con insolita solerzia vi è arrivata.',
        zh: '{Voc}我同意，且毫不惊讶：这是尊贵之躯所能提出的唯一合理之议，而您竟以罕见的勤勉想到了。',
      },
      {
        it: "{Voc}sì. Lo dico con solerzia, prima che la Sua augusta persona trovi il modo di rovinare anche un'idea buona.",
        zh: '{Voc}好。我勤勉迅捷地说出此字，趁尊贵之躯尚未找到把一个好主意也毁掉的方法。',
      },
      {
        it: '{Voc}concordo. Segni il dì negli annali della magione: la Sua velleità e la ragione, per una volta, incedono nella stessa direzione.',
        zh: '{Voc}我赞同。请将今日载入府邸编年史：阁下的空妄之愿与理性，这一次竟朝同一方向缓步而行。',
      },
    ],
  },

  disagreement: {
    diretta: [
      { it: '{Voc}no, ti sbagli di grosso.', zh: '{Voc}不，你大错特错。' },
      { it: "{Voc}non sono d'accordo per niente.", zh: '{Voc}我一点都不同意。' },
      { it: '{Voc}guarda che non è così, proprio no.', zh: '{Voc}事情不是这样的，真不是。' },
    ],
    standard: [
      {
        it: '{Voc}con protocollare franchezza Le comunico che la mia persona dissente: la tesi da Lei sostenuta non trova albergo in questa magione.',
        zh: '{Voc}谨以合乎礼制的坦率告知阁下：我持异议——您所主张的论点，在此府邸中无处安身。',
      },
      {
        it: "{Voc}mi sia concesso di incedere su una via diversa dalla Sua: senza nocumento per la Sua augusta persona, ritengo che l'errore sia dalla Sua parte.",
        zh: '{Voc}请允许我缓步行于与阁下不同的道路：无意损害尊贵之躯，但我认为错在您方。',
      },
      {
        it: '{Voc}la Sua augusta persona vorrà perdonare il mio dissenso; il cerimoniale mi consente di esprimerlo, e la ragione mi impone di farlo.',
        zh: '{Voc}愿尊贵之躯宽恕我的异议；仪典允许我表达它，理性则命我这样做。',
      },
    ],
    spietata: [
      {
        it: '{Voc}dissento, e lo faccio con solerzia: la Sua tesi incede con la sicurezza di chi non ha mai incontrato un fatto.',
        zh: '{Voc}我持异议，且勤勉迅捷：阁下的论点，迈着从未与事实相遇之人的自信步伐。',
      },
      {
        it: '{Voc}la Sua augusta persona ha torto, e lo dico con garbo protocollare, perché dirlo con precisione sarebbe nocumento troppo grande.',
        zh: '{Voc}尊贵之躯错了。我以合乎礼制的雅度说出此言，因为若说得精确，损害就太大了。',
      },
      {
        it: '{Voc}non concordo. Se la magione ragionasse come Lei, avremmo già venduto il tetto per comprare la pioggia.',
        zh: '{Voc}我不赞同。若府邸如阁下这般思考，我们早已卖掉屋顶去买雨水了。',
      },
    ],
  },

  request: {
    diretta: [
      { it: '{Voc}senti, mi serve una cosa: {blunt}. Dai, non farmi pregare.', zh: '{Voc}听着，我需要一件事：{q}。别让我求你。' },
      { it: "{Voc}fammi 'sto favore: {blunt}. Te lo ricambio.", zh: '{Voc}帮我个忙：{q}。我会还你的。' },
      { it: '{Voc}per favore, {blunt}. Ci tengo davvero.', zh: '{Voc}拜托了，{q}。我是真的很在意。' },
    ],
    standard: [
      {
        it: '{Voc}se la Sua augusta persona lo consente, la mia avanza con garbo protocollare una supplica: {noble}. Le sarei debitore.',
        zh: '{Voc}若尊贵之躯允准，我谨以合乎礼制的雅度呈上一请：{q}。我将感念不忘。',
      },
      {
        it: '{Voc}oso rivolgere alla Sua magione una richiesta, confidando nella Sua solerzia e nella Sua grazia celestiale: {noble}.',
        zh: '{Voc}我冒昧向阁下的府邸提出一请，仰赖您的勤勉迅捷与天界般的恩典：{q}。',
      },
      {
        it: '{Voc}non è velleità ma necessità ciò che mi spinge a chiedere, senza nocumento per la Sua persona: {noble}.',
        zh: '{Voc}驱使我开口的并非空妄之愿而是必需，且不致于阁下有任何损害：{q}。',
      },
    ],
    spietata: [
      {
        it: '{Voc}Le chiedo un favore, e già so che la Sua solerzia sarà quella di sempre: leggendaria per assenza. Comunque: {noble}.',
        zh: '{Voc}我向阁下求一个人情，且已知您的勤勉一如往常：以缺席而闻名。无论如何：{q}。',
      },
      {
        it: "{Voc}mi rivolgo alla Sua augusta persona con una richiesta semplice, calibrata sull'ingegno disponibile nella magione: {noble}.",
        zh: '{Voc}我向尊贵之躯提出一个简单的请求，其难度已依府邸内可用的才智作了校准：{q}。',
      },
      {
        it: '{Voc}il protocollo vuole che io chieda con garbo. Lo faccio: {noble}. Che poi la Sua persona comprenda, è velleità mia.',
        zh: '{Voc}礼制要求我以雅度相求。我照办：{q}。至于阁下能否理解，那是我的空妄之愿。',
      },
    ],
  },

  command: {
    diretta: [
      { it: '{Voc}{Blunt}. Subito, e senza discutere.', zh: '{Voc}{q}。马上，别废话。' },
      { it: '{Voc}muoviti: {blunt}. Non te lo ripeto.', zh: '{Voc}动起来：{q}。我不说第二遍。' },
      { it: '{Voc}fallo e basta: {blunt}.', zh: '{Voc}照做就是了：{q}。' },
    ],
    standard: [
      {
        it: '{Voc}la magione dispone, e la Sua augusta persona vorrà eseguire con solerzia protocollare: {noble}.',
        zh: '{Voc}府邸有令，尊贵之躯当以合乎礼制的勤勉迅捷执行：{q}。',
      },
      {
        it: "{Voc}sia fatto nell'istante presente, senza indugio né velleità di dissenso: {noble}.",
        zh: '{Voc}于此刻即行，不得延宕，亦不得怀有异议的空妄之愿：{q}。',
      },
      {
        it: '{Voc}il cerimoniale non ammette repliche; La prego dunque di provvedere, con la solerzia che il caso richiede: {noble}.',
        zh: '{Voc}仪典不容置辩；故请阁下着手办理，带着此事所需的勤勉迅捷：{q}。',
      },
    ],
    spietata: [
      {
        it: '{Voc}esegua, e lo faccia con solerzia: so che è una parola nuova per la Sua persona, ma la magione ha fede nei prodigi. Dunque: {noble}.',
        zh: '{Voc}请执行，且要勤勉迅捷：我知这对阁下是个新词，但府邸对奇迹尚存信心。那么：{q}。',
      },
      {
        it: "{Voc}Le ordino quanto segue, e lo ripeterò lentamente, affinché la Sua vacuità d'ingegno non sia d'ostacolo: {noble}.",
        zh: '{Voc}我命阁下如下，并将缓慢重复，以免您的才智之空乏成为阻碍：{q}。',
      },
      {
        it: '{Voc}provveda: {noble}. È un ordine, non una velleità, e non è negoziabile nemmeno nella Sua magione immaginaria.',
        zh: '{Voc}请办理：{q}。这是命令，不是空妄之愿，即便在阁下想象中的府邸里也没有商量余地。',
      },
    ],
  },

  question: {
    diretta: [
      { it: '{Voc}domanda secca: {blunt}', zh: '{Voc}直接问：{q}' },
      { it: '{Voc}dimmi una cosa, senza giri di parole: {blunt}', zh: '{Voc}跟我说句实话，别绕弯子：{q}' },
      { it: '{Voc}voglio saperlo adesso: {blunt}', zh: '{Voc}我现在就想知道：{q}' },
    ],
    standard: [
      {
        it: '{Voc}la mia persona osa porre alla Sua augusta persona un quesito, con garbo protocollare e sincera curiosità: {noble}',
        zh: '{Voc}我冒昧向尊贵之躯呈上一问，带着合乎礼制的雅度与真诚的好奇：{q}',
      },
      {
        it: '{Voc}sia concesso alla mia ignoranza di chiedere lume alla Sua magione: {noble}',
        zh: '{Voc}请允许我的无知向阁下的府邸求教：{q}',
      },
      {
        it: '{Voc}un dubbio incede nel mio animo e soltanto la Sua solerzia potrà dissiparlo: {noble}',
        zh: '{Voc}一丝疑虑在我心中缓步徘徊，唯有阁下的勤勉迅捷方能驱散：{q}',
      },
    ],
    spietata: [
      {
        it: '{Voc}pongo alla Sua augusta persona un quesito, pur sapendo che la risposta, se verrà, incederà con la solerzia di un ghiacciaio: {noble}',
        zh: '{Voc}我向尊贵之躯提出一问，尽管深知答案——若它会来——将以冰川般的勤勉缓步而至：{q}',
      },
      {
        it: "{Voc}domando, e attendo con protocollare pazienza che la Sua vacuità d'ingegno produca qualcosa di somigliante a una risposta: {noble}",
        zh: '{Voc}我问了，并以合乎礼制的耐心等待阁下的才智之空乏产出某种近似答案的东西：{q}',
      },
      {
        it: "{Voc}ecco la domanda. È semplice; l'ho semplificata apposta, in considerazione della magione a cui è rivolta: {noble}",
        zh: '{Voc}这就是问题。它很简单；我特意简化了，考虑到它所面向的那座府邸：{q}',
      },
    ],
  },

  complaint: {
    diretta: [
      { it: '{Voc}che palle: {blunt}. Non se ne può più.', zh: '{Voc}烦死了：{q}。受不了了。' },
      { it: '{Voc}basta, sono stufo: {blunt}. Sempre la stessa solfa.', zh: '{Voc}够了，我受够了：{q}。老是这一套。' },
      { it: '{Voc}uffa. {Blunt}. Ma è possibile?', zh: '{Voc}唉。{q}。这怎么可能啊？' },
    ],
    standard: [
      {
        it: '{Voc}con protocollare mestizia segnalo alla Sua augusta persona un nocumento che affligge la magione: {noble}.',
        zh: '{Voc}谨以合乎礼制的哀愁向尊贵之躯禀报一桩困扰府邸的损害：{q}。',
      },
      {
        it: '{Voc}la mia persona patisce, e lo dice senza velleità di lagnanza ma per dovere di cronaca: {noble}.',
        zh: '{Voc}我正在受苦，此言并非出于抱怨的空妄之愿，而是出于记述之责：{q}。',
      },
      {
        it: '{Voc}il cerimoniale mi impone compostezza, ma la faccenda è tediosa oltre ogni solerzia di sopportazione: {noble}.',
        zh: '{Voc}仪典命我保持端庄，然此事之乏味，已超出一切勤勉忍耐的限度：{q}。',
      },
    ],
    spietata: [
      {
        it: '{Voc}mi lagno, e lo faccio con eleganza celestiale: {noble}. Se la magione fosse retta da ingegno e non da vacuità, non sarei qui a dirlo.',
        zh: '{Voc}我抱怨，且以天界般的优雅抱怨：{q}。若这座府邸由才智而非空乏治理，我便不必站在此处诉说。',
      },
      {
        it: '{Voc}il nocumento è questo: {noble}. Ne informo la Sua augusta persona con solerzia, certo che la Sua reazione sarà, come sempre, un elegante nulla.',
        zh: '{Voc}损害如下：{q}。我勤勉迅捷地禀报尊贵之躯，并确信您的反应将一如既往：一场优雅的虚无。',
      },
      {
        it: '{Voc}la cronaca del dì recita: {noble}. La costanza con cui questa magione produce tedio sarebbe ammirevole, se fosse rivolta a qualcosa di utile.',
        zh: '{Voc}今日的记事如是写道：{q}。这座府邸制造乏味的恒心本堪称可敬，若它能用于某件有用之事的话。',
      },
    ],
  },

  boredom: {
    diretta: [
      { it: '{Voc}che noia mortale, mi sto addormentando in piedi.', zh: '{Voc}无聊死了，我站着都要睡着了。' },
      { it: '{Voc}mi annoio da morire. Facciamo qualcosa, qualsiasi cosa.', zh: '{Voc}闷得要死。咱干点啥吧，啥都行。' },
      { it: '{Voc}uffa, che palle. Non succede mai niente.', zh: '{Voc}唉，太没劲了，什么事都没有。' },
    ],
    standard: [
      {
        it: '{Voc}il tedio incede nella magione con passo lento e protocollare; la mia persona ne patisce e chiede, con garbo, un diversivo.',
        zh: '{Voc}乏味以缓慢而合乎礼制的步伐在府邸中徘徊；我为之所苦，谨以雅度请求一桩消遣。',
      },
      {
        it: '{Voc}confesso alla Sua augusta persona una noia celestiale nella sua perfezione: nulla accade, e nulla pare volere accadere.',
        zh: '{Voc}我向尊贵之躯坦承一种完美到如天界一般的无聊：无事发生，亦无事似有发生之意。',
      },
      {
        it: '{Voc}le ore trascorrono senza nocumento ma anche senza scopo; la solerzia che mi resta è tutta impiegata nel restare sveglio.',
        zh: '{Voc}时光流逝，无损害亦无目的；我仅存的勤勉，全都用于保持清醒。',
      },
    ],
    spietata: [
      {
        it: '{Voc}mi annoio, e la Sua conversazione, lungi dal rimediare, è la causa principale: un tedio così solerte meriterebbe un titolo nobiliare.',
        zh: '{Voc}我感到无聊，而阁下的谈话非但无以补救，反是主因：如此勤勉的乏味，理当获封一个贵族头衔。',
      },
      {
        it: '{Voc}la magione è immersa in una quiete che chiamerei celestiale, se non fosse semplicemente il suono della Sua vacuità che riempie la stanza.',
        zh: '{Voc}府邸沉浸在一种我本愿称之为天界般的静谧中——若那不只是阁下的空乏充满房间的声音。',
      },
      {
        it: '{Voc}che noia. Persino il protocollo, che è lento per vocazione, si è addormentato mentre La ascoltava.',
        zh: '{Voc}真无聊。连以缓慢为天职的礼制，也在聆听阁下时睡着了。',
      },
    ],
  },

  urgency: {
    diretta: [
      { it: "{Voc}sbrigati, non c'è un secondo da perdere!", zh: '{Voc}快点，一秒钟都不能耽误！' },
      { it: '{Voc}muoviti, è urgente. Adesso, non tra cinque minuti.', zh: '{Voc}赶紧的，很急。现在，不是五分钟后。' },
      { it: '{Voc}dai, corri! Stiamo facendo tardi!', zh: '{Voc}快跑！要来不及了！' },
    ],
    standard: [
      {
        it: '{Voc}la faccenda incede con protocollare urgenza e non ammette indugio: La prego di provvedere con la massima solerzia.',
        zh: '{Voc}此事以合乎礼制的急切缓步逼近，不容迟延：恳请阁下以最高的勤勉迅捷着手办理。',
      },
      {
        it: '{Voc}il tempo, celestiale e inesorabile, ci sfugge; la magione richiede alla Sua augusta persona passo svelto e mano pronta.',
        zh: '{Voc}时光如天界般不可阻挡地流逝；府邸请求尊贵之躯步伐迅捷、手脚利落。',
      },
      {
        it: '{Voc}sia detto senza nocumento ma con fermezza: ogni istante perduto è un istante che il cerimoniale non ci restituirà.',
        zh: '{Voc}谨以不含损害却坚定的言辞直言：每一个失去的瞬间，仪典都不会归还我们。',
      },
    ],
    spietata: [
      {
        it: '{Voc}solerzia, La prego: so che nella Sua magione la parola è sconosciuta, ma il resto del mondo la pratica da secoli.',
        zh: '{Voc}请阁下勤勉迅捷些：我知道在您的府邸中此词无人识得，但世界其余之地已实践了数个世纪。',
      },
      {
        it: '{Voc}si affretti. Il passo da ghiacciaio con cui la Sua augusta persona incede di solito sarebbe, oggi, un nocumento imperdonabile.',
        zh: '{Voc}请加快脚步。尊贵之躯素来缓步如冰川，今日这将是一桩不可饶恕的损害。',
      },
      {
        it: "{Voc}è urgente, e lo dico lentamente perché la Sua vacuità d'ingegno afferri almeno il concetto, se non il ritmo.",
        zh: '{Voc}事情紧急——我缓缓道来，好让阁下的才智之空乏至少抓住概念，哪怕抓不住节奏。',
      },
    ],
  },

  hunger: {
    diretta: [
      { it: '{Voc}ho una fame da lupi. Si mangia o no?', zh: '{Voc}我饿得像头狼，开饭不开饭？' },
      { it: '{Voc}muoio di fame, dammi qualcosa da mettere sotto i denti.', zh: '{Voc}饿死了，随便给我点吃的。' },
      { it: '{Voc}basta chiacchiere, andiamo a mangiare.', zh: '{Voc}别聊了，走，吃饭去。' },
    ],
    standard: [
      {
        it: "{Voc}la mia persona avverte l'appetito e chiede, con protocollare urgenza, che la magione disponga le vivande.",
        zh: '{Voc}我感到食欲来袭，谨以合乎礼制的急切请求府邸备下佳肴。',
      },
      {
        it: '{Voc}le mie membra reclamano il desinare; che la Sua augusta persona voglia incedere con me verso la tavola.',
        zh: '{Voc}我的身躯呼唤着正餐；愿尊贵之躯与我一同缓步走向餐桌。',
      },
      {
        it: "{Voc}non è velleità ma necessità celestiale: l'ora del desinare è giunta e la solerzia della cucina è attesa con fiducia.",
        zh: '{Voc}这并非空妄之愿，而是天界般的必需：正餐之时已至，厨房的勤勉迅捷正被满怀信心地期待。',
      },
    ],
    spietata: [
      {
        it: "{Voc}avverto l'appetito, e noto con protocollare stupore che la magione, pur ricca di vacuità, è povera di vivande. Si provveda.",
        zh: '{Voc}我感到食欲来袭，并以合乎礼制的惊讶注意到：这座府邸虽富于空乏，却贫于佳肴。请着手解决。',
      },
      {
        it: "{Voc}desinerei, se la solerzia della cucina non fosse pari a quella dell'ingegno che la dirige. Attendo, con lo stomaco e la pazienza vuoti.",
        zh: '{Voc}我本欲用餐，若厨房的勤勉不与掌管它的才智一样匮乏。我等着，胃与耐心皆空。',
      },
      {
        it: '{Voc}chiedo vivande: una richiesta modesta persino per questa magione, dove ogni cosa incede tardi tranne il tedio.',
        zh: '{Voc}我要求膳食：即便对这座府邸而言也算是个谦逊的请求——在这里除了乏味，一切都来得迟缓。',
      },
    ],
  },

  fatigue: {
    diretta: [
      { it: '{Voc}sono stanco morto, non ce la faccio più.', zh: '{Voc}我累死了，撑不住了。' },
      { it: '{Voc}sono cotto. Vado a dormire, non svegliarmi.', zh: '{Voc}我累瘫了。我去睡了，别叫我。' },
      { it: '{Voc}ho un sonno pazzesco, lasciatemi in pace.', zh: '{Voc}我困得不行，别烦我。' },
    ],
    standard: [
      {
        it: '{Voc}le mie membra reclamano riposo e la mia persona si ritira nella magione; il dì è stato solerte oltre misura.',
        zh: '{Voc}我的四肢呼唤着休憩，我将退回府邸；今日之勤勉已远超限度。',
      },
      {
        it: '{Voc}con protocollare stanchezza chiedo licenza di riposare: il cerimoniale attenderà il dì venturo.',
        zh: '{Voc}谨以合乎礼制的疲惫请求告退休息：仪典可待来日再续。',
      },
      {
        it: '{Voc}la fatica incede nel mio corpo con passo celestiale ma inesorabile; mi conceda di ritirarmi senza nocumento.',
        zh: '{Voc}疲惫以天界般却不可阻挡的步伐在我体内缓步而行；请阁下允许我告退，不留损害。',
      },
    ],
    spietata: [
      {
        it: '{Voc}sono esausto: sostenere la conversazione con la Sua augusta persona richiede una solerzia che nessuna magione potrebbe fornire a lungo.',
        zh: '{Voc}我筋疲力尽：与尊贵之躯维系交谈所需的勤勉，没有任何府邸能长久供给。',
      },
      {
        it: "{Voc}mi ritiro a riposare. Le mie membra sono stanche, il mio ingegno di più: ha dovuto compensare la vacuità di quello altrui per l'intero dì.",
        zh: '{Voc}我退下休息。我的四肢疲乏，我的才智更甚：它整日都在补偿他人的空乏。',
      },
      {
        it: '{Voc}vado a dormire, e con protocollare franchezza Le dico che il sonno, a differenza di questa magione, non mi arreca nocumento.',
        zh: '{Voc}我去睡了，并以合乎礼制的坦率告知阁下：睡眠——不同于这座府邸——不会给我造成损害。',
      },
    ],
  },

  affection: {
    diretta: [
      { it: '{Voc}ti amo, punto e basta.', zh: '{Voc}我爱你，就这么简单。' },
      { it: '{Voc}mi piaci da impazzire, lo sai?', zh: '{Voc}我喜欢你喜欢得要疯了，你知道吗？' },
      { it: '{Voc}mi manchi un casino.', zh: '{Voc}我想你想得不行。' },
    ],
    standard: [
      {
        it: '{Voc}nutro per la Sua augusta persona un sentimento celestiale che nessun protocollo saprebbe contenere né alcun cerimoniale descrivere.',
        zh: '{Voc}我对尊贵之躯怀有一种天界般的情感，任何礼制皆无法容纳，任何仪典皆无法描述。',
      },
      {
        it: '{Voc}la mia persona incede verso la Sua con passo solerte e cuore senza velleità: soltanto affetto, e la magione spalancata.',
        zh: '{Voc}我以勤勉迅捷之步、不含空妄之愿的心，缓步趋向阁下：唯有爱意，与敞开的府邸。',
      },
      {
        it: '{Voc}sia detto senza cerimoniale, per una volta: la Sua presenza è per me la sola cosa celestiale di questo dì, e la Sua assenza il solo nocumento.',
        zh: '{Voc}就这一次，抛开仪典直言：阁下的在场，是我今日唯一如天界般的事物；阁下的缺席，则是唯一的损害。',
      },
    ],
    spietata: [
      {
        it: "{Voc}La amo, e lo dico con stupore protocollare: la Sua vacuità d'ingegno non è bastata a dissuadermi. Ci ha provato, ma non è bastata.",
        zh: '{Voc}我爱阁下，且带着合乎礼制的惊讶说出此言：您的才智之空乏竟未能劝退我。它尝试过，但没能成功。',
      },
      {
        it: '{Voc}la mia persona Le è affezionata contro ogni ragione e contro il parere della magione intera. Lo consideri un sentimento celestiale, o una velleità.',
        zh: '{Voc}我倾心于阁下，违背一切理性，亦违背整座府邸的意见。请将其视为天界般的情感，或是一桩空妄之愿。',
      },
      {
        it: '{Voc}mi manca. È un nocumento che sopporto con solerzia, e che preferisco alla Sua presenza soltanto nei giorni pari.',
        zh: '{Voc}我想您。这是我勤勉忍受的一桩损害，且仅在双日里，我才更愿意想您而非见您。',
      },
    ],
  },

  money: {
    diretta: [
      { it: '{Voc}parliamo di soldi, e parliamone chiaro: {blunt}.', zh: '{Voc}说钱的事，直说了：{q}。' },
      { it: '{Voc}la grana non cresce sugli alberi: {blunt}. Punto.', zh: '{Voc}钱不是树上长的：{q}。就这样。' },
      { it: '{Voc}senti, sui soldi non scherzo: {blunt}.', zh: '{Voc}听着，钱的事我不开玩笑：{q}。' },
    ],
    standard: [
      {
        it: '{Voc}la faccenda dei denari incede con protocollare urgenza e richiede la Sua solerte attenzione: {noble}.',
        zh: '{Voc}钱财之事以合乎礼制的急切缓步而来，需要阁下勤勉迅捷的关注：{q}。',
      },
      {
        it: '{Voc}la magione tiene registro dei denari con celestiale precisione, e il registro recita: {noble}.',
        zh: '{Voc}府邸以天界般的精确记录着钱财，而账簿如是说：{q}。',
      },
      {
        it: '{Voc}sia detto senza nocumento e con garbo: i denari sono faccenda protocollare, e il protocollo attende: {noble}.',
        zh: '{Voc}谨以不含损害的雅度直言：钱财乃合乎礼制之事，而礼制正在等待：{q}。',
      },
    ],
    spietata: [
      {
        it: '{Voc}i denari: la sola faccenda in cui la Sua augusta persona mostra solerzia, purché si tratti di riceverli e non di renderli. Dunque: {noble}.',
        zh: '{Voc}钱财：尊贵之躯唯一显露勤勉的事项——只要是收取而非归还。那么：{q}。',
      },
      {
        it: "{Voc}parliamo di denari, argomento che la Sua vacuità d'ingegno comprende sorprendentemente bene quando è a Suo vantaggio: {noble}.",
        zh: '{Voc}我们谈谈钱财吧——一个阁下的才智之空乏在于己有利时理解得出奇透彻的话题：{q}。',
      },
      {
        it: '{Voc}il conto della magione è celestiale nella sua chiarezza e la Sua memoria coatta nel dimenticarlo. Le rammento: {noble}.',
        zh: '{Voc}府邸的账目清晰得如天界一般，而阁下的记忆在遗忘它时粗鄙得毫不含糊。谨此提醒：{q}。',
      },
    ],
  },

  lateness: {
    diretta: [
      { it: '{Voc}sei in ritardo. Di nuovo. Ma ti pare normale?', zh: '{Voc}你迟到了。又一次。你觉得这正常吗？' },
      { it: "{Voc}ti aspetto da un'ora, dove diavolo eri?", zh: '{Voc}我等了你一个小时，你到底跑哪儿去了？' },
      { it: '{Voc}sempre in ritardo, sempre. Comprati un orologio.', zh: '{Voc}老是迟到，回回都是。去买块表吧。' },
    ],
    standard: [
      {
        it: "{Voc}l'ora protocollare è trascorsa e la Sua augusta persona non ha ancora inceduto oltre la soglia; la magione attende con solerzia e con pazienza decrescente.",
        zh: '{Voc}合乎礼制的时辰已过，尊贵之躯尚未缓步跨过门槛；府邸勤勉迅捷地等待着，耐心却与时递减。',
      },
      {
        it: '{Voc}Le rammento, con garbo, che il tempo convenuto è celestiale e inesorabile, e che il Suo ritardo arreca nocumento al cerimoniale.',
        zh: '{Voc}谨以雅度提醒阁下：约定之时如天界般不可阻挡，而您的迟到已对仪典造成损害。',
      },
      {
        it: '{Voc}la puntualità è virtù protocollare; la Sua persona vorrà coltivarla con più solerzia nel dì venturo.',
        zh: '{Voc}准时乃合乎礼制的美德；愿阁下在来日以更多勤勉培育之。',
      },
    ],
    spietata: [
      {
        it: "{Voc}la Sua augusta persona incede con la solerzia di un ghiacciaio: la magione ha visto sorgere e tramontare il sole nell'attesa.",
        zh: '{Voc}尊贵之躯以冰川般的勤勉缓步而来：府邸在等候中看过了日升日落。',
      },
      {
        it: '{Voc}il ritardo non è più nocumento: è tradizione. La si attende come si attende la pioggia, senza stima ma con rassegnazione protocollare.',
        zh: '{Voc}迟到已不再是损害，而是传统。人们等您如等雨——不带敬意，唯有合乎礼制的顺从。',
      },
      {
        it: "{Voc}è in ritardo. Nella Sua magione l'orologio è evidentemente una velleità decorativa.",
        zh: '{Voc}阁下迟到了。在您的府邸里，时钟显然只是一件装饰性的空妄之愿。',
      },
    ],
  },

  delay: {
    diretta: [
      { it: '{Voc}arrivo tardi, non aspettarmi.', zh: '{Voc}我会晚到，别等我。' },
      { it: '{Voc}sono in ritardo, scusa, dammi dieci minuti.', zh: '{Voc}我迟到了，抱歉，再给我十分钟。' },
      { it: "{Voc}faccio tardi, c'è un casino di traffico.", zh: '{Voc}我要晚了，路上堵得一团糟。' },
    ],
    standard: [
      {
        it: '{Voc}la mia persona incede con ritardo e ne chiede protocollare perdono alla Sua augusta persona; il nocumento non fu voluto.',
        zh: '{Voc}我缓步迟至，谨依礼制向尊贵之躯请求宽恕；此损害并非本意。',
      },
      {
        it: "{Voc}il tempo, celestiale e inesorabile, mi ha superato: giungerò alla magione oltre l'ora convenuta, e Le chiedo indulgenza.",
        zh: '{Voc}时光如天界般不可阻挡，已将我超越：我将迟于约定之时抵达府邸，恳请阁下宽宥。',
      },
      {
        it: '{Voc}con solerzia La avverto che il mio arrivo subirà indugio; il cerimoniale vorrà attendermi, e io ne sarò grato.',
        zh: '{Voc}我勤勉迅捷地告知阁下：我的到来将有所延误；愿仪典稍候，我将为此感念。',
      },
    ],
    spietata: [
      {
        it: "{Voc}arriverò tardi. Consideri l'attesa un dono: sono i soli minuti del dì in cui la Sua magione godrà di un ingegno assente ma superiore.",
        zh: '{Voc}我会迟到。请将等待视为一份礼物：那是今日阁下的府邸得以享有一份虽缺席却更为高明的才智的唯一时刻。',
      },
      {
        it: '{Voc}incedo con ritardo, e senza fretta: la puntualità è virtù che riservo a chi la merita, e il protocollo tace sul Suo caso.',
        zh: '{Voc}我缓步迟至，且并不匆忙：准时是我留给配得之人的美德，而礼制对阁下的情形未置一词。',
      },
      {
        it: '{Voc}sarò in ritardo, ma la Sua augusta persona non subirà nocumento: ciò che avrebbe da dirmi può attendere, come attende da sempre di diventare interessante.',
        zh: '{Voc}我会迟到，但尊贵之躯不会因此受损：您想对我说的话可以等——正如它一直在等着变得有趣。',
      },
    ],
  },

  threat: {
    diretta: [
      { it: '{Voc}te ne pentirai, te lo giuro.', zh: '{Voc}你会后悔的，我发誓。' },
      { it: '{Voc}stai attento a come parli, che finisce male.', zh: '{Voc}说话小心点，不然没好下场。' },
      { it: '{Voc}non provocarmi. Non te lo ripeto.', zh: '{Voc}别惹我。我不说第二遍。' },
    ],
    standard: [
      {
        it: '{Voc}la Sua augusta persona vorrà ponderare con solerzia: la magione non dimentica il nocumento, e il protocollo prevede conseguenze.',
        zh: '{Voc}尊贵之躯当勤勉迅捷地斟酌：府邸不会忘却损害，而礼制早有后果之规。',
      },
      {
        it: '{Voc}La avverto con protocollare garbo: prosegua su questa via, e il Suo incedere troverà ostacoli non celestiali.',
        zh: '{Voc}谨以合乎礼制的雅度警示阁下：若继续此路，您的缓步前行将遭遇并非天界赐予的阻碍。',
      },
      {
        it: '{Voc}non è velleità mia, ma promessa della magione: ogni nocumento arrecato sarà restituito con misura e cerimoniale.',
        zh: '{Voc}这并非我的空妄之愿，而是府邸的承诺：所造成的每一分损害，皆将依度、依仪典奉还。',
      },
    ],
    spietata: [
      {
        it: "{Voc}continui pure. La magione ha una lunga memoria e una pazienza breve, e la Sua vacuità d'ingegno non sarà attenuante quando il protocollo chiederà il conto.",
        zh: '{Voc}请继续吧。府邸记忆悠长而耐心短促；待礼制清算之日，阁下的才智之空乏不会成为减罚的理由。',
      },
      {
        it: '{Voc}Le consiglio solerzia nel ritirarsi: sarebbe nocumento per me sporcare il cerimoniale con la Sua persona, ma non un nocumento che mi turberebbe.',
        zh: '{Voc}我建议阁下勤勉迅捷地退下：以您之躯玷污仪典于我是一种损害，却并非会令我不安的那种。',
      },
      {
        it: '{Voc}inceda con cautela, augusta persona: il velluto di questa magione copre lame, e le lame non hanno protocollo.',
        zh: '{Voc}尊贵之躯，请谨慎缓步：这座府邸的天鹅绒之下藏着利刃，而利刃不讲礼制。',
      },
    ],
  },

  boast: {
    diretta: [
      { it: '{Voc}sono il migliore, e lo sai pure tu.', zh: '{Voc}我最厉害，你自己也知道。' },
      { it: "{Voc}ce l'ho fatta, come sempre. Applausi.", zh: '{Voc}我又成功了，一如往常。鼓掌吧。' },
      { it: '{Voc}nessuno è al mio livello, mettetevi in fila.', zh: '{Voc}没人能到我这个水平，排队去。' },
    ],
    standard: [
      {
        it: '{Voc}sia detto con protocollare modestia: la mia persona ha inceduto ove altri hanno inciampato, e la magione ne dà testimonianza.',
        zh: '{Voc}谨以合乎礼制的谦逊而言：我缓步走过他人跌倒之处，府邸可为之作证。',
      },
      {
        it: "{Voc}l'impresa è compiuta con solerzia celestiale e senza nocumento; il cerimoniale consente un istante di legittima soddisfazione.",
        zh: '{Voc}功业以天界般的勤勉迅捷完成，且无损害；仪典允许片刻正当的满足。',
      },
      {
        it: '{Voc}non è velleità ma constatazione: il mio ingegno ha reso alla magione un servizio che pochi avrebbero saputo rendere.',
        zh: '{Voc}这并非空妄之愿而是事实陈述：我的才智为府邸效力，鲜有人能及。',
      },
    ],
    spietata: [
      {
        it: "{Voc}ho trionfato. Non è un vanto: è il naturale esito quando l'ingegno incede in una magione dove la concorrenza è tutta vacuità.",
        zh: '{Voc}我胜了。这不是自夸：当才智缓步于一座对手尽皆空乏的府邸，这是自然的结局。',
      },
      {
        it: '{Voc}la mia solerzia ha fatto ciò che la Sua velleità sognava. Non serbi rancore: il protocollo prevede che qualcuno vinca, e prevede chi.',
        zh: '{Voc}我的勤勉完成了阁下的空妄之愿所梦想的事。莫要怀恨：礼制规定总有人胜出，并且规定了是谁。',
      },
      {
        it: '{Voc}sono il migliore, e dirlo non è nocumento alla modestia: è nocumento soltanto a chi sperava il contrario.',
        zh: '{Voc}我是最出色的；说出这话并不损害谦逊，只损害那些曾期望相反结果的人。',
      },
    ],
  },

  statement: {
    diretta: [
      { it: '{Voc}te lo dico papale papale: {blunt}. Fine della storia.', zh: '{Voc}我跟你直说了：{q}。就这么回事。' },
      { it: '{Voc}in parole povere, {blunt}. Punto e basta.', zh: '{Voc}简单说，{q}。就这样。' },
      { it: '{Voc}senti, la faccenda è semplice: {blunt}. Prendere o lasciare.', zh: '{Voc}听着，事情很简单：{q}。要不要随你。' },
    ],
    standard: [
      {
        it: '{Voc}la mia persona espone alla Sua augusta persona, con garbo protocollare, quanto segue: {noble}. Voglia prenderne atto.',
        zh: '{Voc}我谨以合乎礼制的雅度，向尊贵之躯陈述如下：{q}。请阁下知悉。',
      },
      {
        it: '{Voc}sia messo agli atti della magione, con solerzia e senza nocumento: {noble}.',
        zh: '{Voc}请以勤勉迅捷、不含损害之态，载入府邸案卷：{q}。',
      },
      {
        it: '{Voc}il cerimoniale mi consente una dichiarazione, e io la rendo con animo celestiale: {noble}.',
        zh: '{Voc}仪典允许我作一声明，我以天界般的心境宣之：{q}。',
      },
    ],
    spietata: [
      {
        it: '{Voc}dichiaro quanto segue, e lo dichiaro lentamente, affinché incida anche nella Sua magione: {noble}.',
        zh: '{Voc}我宣告如下，且缓缓宣告，以便它也能刻入阁下的府邸：{q}。',
      },
      {
        it: '{Voc}constato, con la solerzia che la Sua persona non conosce: {noble}. Il protocollo mi vieta di aggiungere ciò che penso.',
        zh: '{Voc}我以阁下所不知的勤勉迅捷陈述：{q}。礼制禁止我补充心中所想。',
      },
      {
        it: "{Voc}ecco la faccenda, ridotta a misura della vacuità d'ingegno disponibile: {noble}. Non vi è altro da comprendere, per fortuna Sua.",
        zh: '{Voc}事情如下，已缩减至可用才智之空乏的尺度：{q}。所幸于阁下，再无更多需要理解之处。',
      },
    ],
  },
}
