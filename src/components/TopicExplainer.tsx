import { Sigma, Scale, Sparkles, ArrowUp, ScrollText, LayoutGrid, CalendarClock } from 'lucide-react'
import type { Lang } from '../lib/vedin'

export type ExplainerTopic = 'ai' | 'timeline' | 'vargas' | 'ashtaka' | 'shadbala'

interface Props {
  topic: ExplainerTopic
  lang: Lang
  /** Smooth-scrolls the querent back to the birth form to cast their chart. */
  onCast: () => void
}

type Tri = { en: string; mm: string; ja?: string }

interface Copy {
  Icon: typeof Sigma
  kicker: Tri
  title: Tri
  lede: Tri
  points: Tri[]
}

const COPY: Record<ExplainerTopic, Copy> = {
  ai: {
    Icon: ScrollText,
    kicker: { en: 'Detailed Reading', mm: 'အသေးစိတ် ဟောစာတမ်း' },
    title: { en: 'Your life, read across seven areas', mm: 'ဘဝ ကဏ္ဍ ခုနစ်ရပ်ဖြင့် ဖတ်ရှုခြင်း' },
    lede: {
      en: 'A full written reading — personally reviewed by the Sayar before it reaches you — that weaves your placements, dashas, and yogas into clear guidance across the seven pillars of life: education, career, wealth, marriage, health, community, and dharma. Every line is grounded in your own computed chart, never generic.',
      mm: 'ဆရာ ကိုယ်တိုင် စစ်ဆေးအတည်ပြုပြီးမှ သင့်ထံ ရောက်ရှိသော ဟောစာတမ်းအပြည့်အစုံ — သင့်ဂြိုဟ်တည်နေရာများ၊ ဒသာနှင့် ယောဂများကို ဘဝ၏ အခြေခံ ခုနစ်ရပ် (ပညာရေး၊ အလုပ်အကိုင်၊ ဓန၊ အိမ်ထောင်ရေး၊ ကျန်းမာရေး၊ လူမှုရေးနှင့် ဓမ္မ) တွင် ရှင်းလင်းသော လမ်းညွှန်ချက်အဖြစ် ရက်လုပ်ပေးသည်။ စာကြောင်းတိုင်း သင့်ဇာတာအပေါ်တွင်သာ အခြေခံသည်။',
    },
    points: [
      { en: 'Seven life areas — from education to dharma, each with its own verdict.', mm: 'ဘဝ ကဏ္ဍ ခုနစ်ရပ် — ပညာရေးမှ ဓမ္မအထိ၊ တစ်ခုစီအတွက် သီးခြား သုံးသပ်ချက်။' },
      { en: 'Grounded in your exact placements, dasha, and active yogas.', mm: 'သင့် တိကျသော ဂြိုဟ်တည်နေရာ၊ ဒသာနှင့် ယောဂများအပေါ် အခြေခံသည်။' },
      { en: 'Personally reviewed and approved before it is delivered.', mm: 'ပေးပို့မီ ဆရာ ကိုယ်တိုင် စစ်ဆေး အတည်ပြုသည်။' },
    ],
  },
  vargas: {
    Icon: LayoutGrid,
    kicker: { en: 'Divisional Charts (Vargas)', mm: 'ဇာတာခွဲများ (Vargas)' },
    title: { en: 'Sixteen lenses on a single life', mm: 'ဘဝတစ်ခုကို မှန်ဘီလူး ၁၆ ချက်' },
    lede: {
      en: 'Beyond the birth chart (D1), Vedic astrology divides each sign into finer harmonics — the vargas — and each one magnifies a single domain of life. The D9 refines marriage and the soul, D10 career and status, D7 children, on through to the D60. Together they turn a flat chart into a layered portrait.',
      mm: 'မွေးဇာတာ (D1) ထက်ကျော်၍ ဗေဒင်ပညာသည် ရာသီတစ်ခုစီကို သိမ်မွေ့သော အစိတ်အပိုင်းများ — ဇာတာခွဲများ (vargas) — အဖြစ် ခွဲခြမ်းပြီး၊ တစ်ခုစီက ဘဝ၏ နယ်ပယ်တစ်ခုကို ချဲ့ပြသည်။ D9 က အိမ်ထောင်ရေးနှင့် ဝိညာဉ်၊ D10 က အလုပ်အကိုင်နှင့် ဂုဏ်အဆင့်၊ D7 က သားသမီး — D60 အထိ။ ၎င်းတို့ ပေါင်းစပ်၍ ဇာတာကို အလွှာလိုက် ပုံရိပ်အဖြစ် ပြောင်းလဲပေးသည်။',
    },
    points: [
      { en: 'From D1 (Rasi) through the classical D60 divisional charts.', mm: 'D1 (ရာသီ) မှ ဂန္ထဝင် D60 ဇာတာခွဲများအထိ။' },
      { en: 'D9 Navamsa — the essential marriage and destiny chart.', mm: 'D9 နဝင်း — အိမ်ထောင်ရေးနှင့် ကံကြမ္မာ၏ အဓိက ဇာတာ။' },
      { en: 'View any chart in elegant diamond or grid style.', mm: 'ဇာတာများကို စိန်ပုံ (သို့) ဇယားကွက် ပုံစံဖြင့် ကြည့်ရှုနိုင်သည်။' },
    ],
  },
  timeline: {
    Icon: CalendarClock,
    kicker: { en: 'Dasha Timeline', mm: 'ဒသာ ကာလဇယား' },
    title: { en: 'When the chart comes alive', mm: 'ဇာတာ အသက်ဝင်လာသည့် အချိန်' },
    lede: {
      en: 'A chart shows what is promised; the Vimshottari dasha shows when. The timeline maps the planetary periods and sub-periods that rule your life — past, present, and future — so you can see which chapters carry which planet\'s signature, and when its results are due to unfold.',
      mm: 'ဇာတာက ကတိပေးထားသည်ကို ပြသည်။ ဝိံရှောတ္တရီ ဒသာက ဘယ်အချိန်ကို ပြသည်။ ကာလဇယားသည် သင့်ဘဝကို အုပ်စိုးသော ဂြိုဟ် ကာလကြီးနှင့် ကာလခွဲများ — အတိတ်၊ ပစ္စုပ္ပန်နှင့် အနာဂတ် — ကို ဖော်ပြသဖြင့် မည်သည့်အခန်းက မည်သည့်ဂြိုဟ်၏ လက္ခဏာကို ဆောင်သည်၊ ရလဒ်များ ဘယ်တော့ ပေါ်ပေါက်မည်ကို မြင်နိုင်သည်။',
    },
    points: [
      { en: 'Mahadasha → Antardasha → Pratyantardasha, nested in order.', mm: 'မဟာဒသာ → အန္တရဒသာ → ပြတျန္တရဒသာ — အစဉ်လိုက်။' },
      { en: 'Your current running period highlighted at a glance.', mm: 'လက်ရှိ ပြေးဆွဲနေသော ကာလကို တစ်ချက်တည်းဖြင့် မြင်နိုင်သည်။' },
      { en: 'Sees Sade Sati and the key transits shaping each phase.', mm: 'အဆင့်တစ်ခုစီကို ပုံဖော်နေသော သာဒေသတ်နှင့် အဓိက ဂြိုဟ်သွားများ။' },
    ],
  },
  ashtaka: {
    Icon: Sigma,
    kicker: { en: 'Ashtakavarga', mm: 'အဋ္ဌကဝဂ်' },
    title: { en: 'The bindu map of strength', mm: 'ဗိန္ဒု အင်အား မြေပုံ' },
    lede: {
      en: 'Ashtakavarga distils your whole chart into a single score — the bindu — for every sign of the zodiac, revealing exactly where the planets favour you and where they fall quiet. It is the classical key to timing: a planet transiting a sign rich in bindus delivers its fullest promise, while a sparse sign mutes it.',
      mm: 'အဋ္ဌကဝဂ်သည် သင့်ဇာတာတစ်ခုလုံးကို ရာသီတစ်ခုစီအတွက် ရမှတ် (ဗိန္ဒု) တစ်ခုအဖြစ် ချုံ့ပေးပြီး၊ ဂြိုဟ်များက မည်သည့်နေရာတွင် အားပေးပြီး မည်သည့်နေရာတွင် တိတ်ဆိတ်နေသည်ကို တိကျစွာ ဖော်ပြသည်။ ဗိန္ဒုများသော ရာသီကို ဂြိုဟ်ဖြတ်သန်းသည့်အခါ ရလဒ်အပြည့်ပေးပြီး၊ ဗိန္ဒုနည်းသော ရာသီတွင် အားလျော့သည် — ကာလ တွက်ချက်ရာတွင် အခရာ ဖြစ်သည်။',
    },
    points: [
      { en: 'Sarvashtakavarga — the combined strength of each sign (out of 337).', mm: 'သဗ္ဗ အဋ္ဌကဝဂ် — ရာသီတစ်ခုစီ၏ ပေါင်းစပ် အင်အား (၃၃၇ အနက်)။' },
      { en: 'Bhinnashtakavarga — how each planet individually contributes.', mm: 'ဘိန္န အဋ္ဌကဝဂ် — ဂြိုဟ်တစ်လုံးစီ၏ သီးခြား အထောက်အပံ့။' },
      { en: 'Transit timing — which periods genuinely support your goals.', mm: 'ဂြိုဟ်သွား ကာလ — မည်သည့်အချိန်များက သင့်ပန်းတိုင်ကို အမှန်တကယ် အားပေးသည်။' },
    ],
  },
  shadbala: {
    Icon: Scale,
    kicker: { en: 'Shadbala', mm: 'ဆဒ္ဗလ' },
    title: { en: 'The six-fold strength of every planet', mm: 'ဂြိုဟ်တိုင်း၏ အင်အား ခြောက်ပါး' },
    lede: {
      en: 'Shadbala weighs the true strength of each planet across six independent sources — its position, its direction, the time of birth, its motion, its natural potency, and the aspects it receives. The six are summed into rupas and measured against the strength a planet needs to actually deliver on its promise in your life.',
      mm: 'ဆဒ္ဗလသည် ဂြိုဟ်တစ်လုံးစီ၏ စစ်မှန်သော အင်အားကို အရင်းအမြစ် ခြောက်ပါး — တည်နေရာ၊ အရပ်မျက်နှာ၊ မွေးဖွားချိန်၊ လှုပ်ရှားမှု၊ သဘာဝ စွမ်းအင်နှင့် ရရှိသော အမြင် — ဖြင့် ချိန်တွယ်သည်။ ၎င်းတို့ကို ရူပ အဖြစ် ပေါင်းပြီး ဂြိုဟ်တစ်လုံး ရလဒ်ပေးရန် လိုအပ်သော အင်အားနှင့် နှိုင်းယှဉ်သည်။',
    },
    points: [
      { en: 'Sthana, Dig, Kala, Cheshta, Naisargika & Drik bala — the six sources.', mm: 'ဌာန၊ ဒိဂ်၊ ကာလ၊ စေဋ္ဌ၊ နိသရ္ဂ နှင့် ဒြိဋ် ဗလ — အရင်းအမြစ် ခြောက်ပါး။' },
      { en: 'Total rupas vs the classical required minimum for each planet.', mm: 'စုစုပေါင်း ရူပ နှင့် ဂြိုဟ်တစ်လုံးစီအတွက် လိုအပ်သော အနည်းဆုံး ပမာဏ။' },
      { en: 'A clear verdict — which planets are strong enough to deliver.', mm: 'ရှင်းလင်းသော ဆုံးဖြတ်ချက် — မည်သည့်ဂြိုဟ်များ လုံလောက်စွာ အားကောင်းသည်။' },
    ],
  },
}

// Japanese, kept as a separate block and merged into COPY at module load — so the
// long English/Burmese entries above stay untouched. Professional, polite Japanese.
const JA: Record<ExplainerTopic, { kicker: string; title: string; lede: string; points: [string, string, string] }> = {
  ai: {
    kicker: '詳細な鑑定',
    title: '人生を七つの領域から読み解く',
    lede: '占星術師が確認・承認したうえでお届けする、完全な鑑定書です。あなたの惑星配置・ダシャー・ヨーガを踏まえ、人生の七つの柱（学業、仕事、財、結婚、健康、人間関係、天命）にわたって明確な指針をお示しします。すべての記述はあなた自身のチャートに基づいており、定型文ではありません。',
    points: [
      '七つの領域 — 学業から天命まで、それぞれに個別の見解を。',
      'あなたの正確な惑星配置・ダシャー・作用中のヨーガに基づきます。',
      'お届け前に占星術師が確認・承認します。',
    ],
  },
  vargas: {
    kicker: '分割図（ヴァルガ）',
    title: '一つの人生を映す十六の視点',
    lede: '出生図（D1）を超えて、インド占星術は各星座をさらに細かな分割図（ヴァルガ）へと分け、それぞれが人生の一領域を拡大して映します。D9は結婚と魂を、D10は仕事と地位を、D7は子孫を、そしてD60まで。これらが重なり合い、平面的なチャートを重層的な肖像へと変えます。',
    points: [
      'D1（ラーシ）から古典的なD60分割図まで。',
      'D9ナヴァムシャ — 結婚と運命を映す最重要の図。',
      '各チャートをダイヤ型またはグリッド型で表示。',
    ],
  },
  timeline: {
    kicker: 'ダシャー・タイムライン',
    title: 'チャートが動き出す時',
    lede: 'チャートは「何が約束されているか」を示し、ヴィムショッタリ・ダシャーは「いつ」を示します。タイムラインは、あなたの人生を司る惑星の大周期と小周期を過去・現在・未来にわたって描き出し、どの章がどの惑星の性質を帯び、その成果がいつ現れるのかを見渡せます。',
    points: [
      'マハーダシャー → アンタルダシャー → プラティヤンタルダシャーを順に。',
      '現在進行中の周期を一目で確認。',
      '各段階を形づくるサデサティと主要なトランジット。',
    ],
  },
  ashtaka: {
    kicker: 'アシュタカヴァルガ',
    title: '強さを示すビンドゥの地図',
    lede: 'アシュタカヴァルガは、あなたのチャート全体を星座ごとの点数（ビンドゥ）に凝縮し、惑星がどこであなたを後押しし、どこで静かになるのかを正確に示します。これはタイミングを読む古典の鍵です。ビンドゥの多い星座を惑星が通過するとき、その約束は最大限に発揮され、少ない星座では弱まります。',
    points: [
      'サルヴァアシュタカヴァルガ — 各星座の総合的な強さ（337点満点）。',
      'ビンナアシュタカヴァルガ — 各惑星が個別にどう寄与するか。',
      'トランジットのタイミング — どの時期が目標を真に後押しするか。',
    ],
  },
  shadbala: {
    kicker: 'シャドバラ',
    title: '全惑星の六種の強さ',
    lede: 'シャドバラは、各惑星の真の強さを六つの独立した要素 — 位置、方角、出生の時刻、運動、本来の力、そして受ける視（アスペクト） — から測ります。六つはルパに合算され、その惑星が人生で約束を果たすために必要な強さと比較されます。',
    points: [
      'スターナ・ディグ・カーラ・チェーシュタ・ナイサルギカ・ドリク — 六つの源。',
      '各惑星の合計ルパと古典的な必要最低値の比較。',
      '明確な結論 — どの惑星が十分に強いか。',
    ],
  },
}

for (const key of Object.keys(JA) as ExplainerTopic[]) {
  const c = COPY[key]
  const j = JA[key]
  c.kicker.ja = j.kicker
  c.title.ja = j.title
  c.lede.ja = j.lede
  c.points.forEach((p, i) => { p.ja = j.points[i] })
}

/**
 * Educational placeholder shown for the Ashtakavarga / Shadbala tabs when no chart has
 * been cast yet — so a footer deep-link lands on something meaningful and premium
 * instead of an empty panel. Explains the technique, then invites the querent to cast
 * their chart (smooth-scrolls up to the birth form).
 */
export default function TopicExplainer({ topic, lang, onCast }: Props) {
  const c = COPY[topic]
  const pick = (f: Tri) => (lang === 'ja' ? (f.ja ?? f.en) : lang === 'mm' ? f.mm : f.en)
  const { Icon } = c

  return (
    <div className="glass-card relative overflow-hidden p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Icon size={24} />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-amber-600 dark:text-amber-400">{pick(c.kicker)}</p>
          <h3 className="mt-1 font-groovy text-xl text-fg sm:text-2xl">{pick(c.title)}</h3>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted sm:text-[15px]">{pick(c.lede)}</p>

      <ul className="mt-5 space-y-2.5">
        {c.points.map((p, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-fg/90">
            <Sparkles size={15} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>{pick(p)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7 border-t border-black/5 pt-5 dark:border-white/5">
        <button type="button" onClick={onCast}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-600 shadow-md px-5 py-3 text-sm font-semibold text-amber-50 transition hover:brightness-110">
          <ArrowUp size={16} /> {lang === 'ja' ? 'ホロスコープを作成して結果を見る' : lang === 'mm' ? 'ရလဒ်များ ကြည့်ရန် သင့်ဇာတာ တွက်ပါ' : 'Cast Your Chart to See Results'}
        </button>
        <p className="mt-2 font-mono text-[11px] text-muted">
          {lang === 'ja' ? '上の入力欄に出生情報をご記入ください。' : lang === 'mm' ? 'အထက်ရှိ မွေးဖွားချက် ဖောင်တွင် အချက်အလက်ဖြည့်ပါ။' : 'Fill in your birth details in the form above.'}
        </p>
      </div>
    </div>
  )
}
