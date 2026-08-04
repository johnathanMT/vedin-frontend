import type { Lang } from './vedin'

// ── Static bilingual content + shared types for the Vedin page ───────────────
// Pulled out of Vedin.tsx so the component file holds behaviour, not copy. All
// of this is constant data: no React, no side effects, trivially tree-shaken.

export interface Preset { label: string; lat: number; lon: number; tz: string }
export interface GeoResult { display_name: string; lat: string; lon: string }

export interface Profile {
  id: number; email: string; username: string; emailConfirmed: boolean
  gender?: string; dob?: string; birthTime?: string; locationName?: string
  latitude?: number; longitude?: number; timezone?: string; hasProfile: boolean
}

export interface ChatMsg { id: number; senderRole: string; text: string; createdAt: string }

export type Tab = 'ai' | 'reading' | 'timeline' | 'd1' | 'vargas' | 'ashtaka' | 'shadbala'
export type ChartStyle = 'diamond' | 'grid'

export const PRESETS: Preset[] = [
  { label: 'Yangon', lat: 16.8409, lon: 96.1735, tz: 'Asia/Yangon' },
  { label: 'Mandalay', lat: 21.9588, lon: 96.0891, tz: 'Asia/Yangon' },
  { label: 'Tokyo', lat: 35.6762, lon: 139.6503, tz: 'Asia/Tokyo' },
  { label: 'Bangkok', lat: 13.7563, lon: 100.5018, tz: 'Asia/Bangkok' },
  { label: 'New Delhi', lat: 28.6139, lon: 77.209, tz: 'Asia/Kolkata' },
  { label: 'Singapore', lat: 1.3521, lon: 103.8198, tz: 'Asia/Singapore' },
]

export const browserTz = (() => {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' } catch { return 'UTC' }
})()

export const TZ_OPTIONS = [...new Set([browserTz, ...PRESETS.map((p) => p.tz), 'UTC'])]

export const VARGAS: { n: number; name: string; desc: { en: string; mm: string } }[] = [
  { n: 2, name: 'D2 · Hora', desc: { en: 'Wealth & resources.', mm: 'ဥစ္စာဓန နှင့် အရင်းအမြစ်။' } },
  { n: 3, name: 'D3 · Drekkana', desc: { en: 'Siblings, courage, initiative.', mm: 'မောင်နှမ၊ ရဲစွမ်းသတ္တိ။' } },
  { n: 4, name: 'D4 · Chaturthamsa', desc: { en: 'Property, home, fixed assets & fortune.', mm: 'အိုးအိမ်၊ အခြေပစ္စည်း၊ ကံ။' } },
  { n: 7, name: 'D7 · Saptamsa', desc: { en: 'Children, progeny & legacy.', mm: 'သားသမီး၊ အမွေဆက်ခံမှု။' } },
  { n: 9, name: 'D9 · Navamsa', desc: { en: 'Spouse, dharma — the fruit of the chart.', mm: 'အိမ်ထောင်ဖက်၊ ဓမ္မ — ဇာတာ၏ အသီးအပွင့်။' } },
  { n: 10, name: 'D10 · Dasamsa', desc: { en: 'Career, profession & status.', mm: 'အသက်မွေးဝမ်းကျောင်း၊ ဂုဏ်အဆင့်။' } },
  { n: 12, name: 'D12 · Dwadasamsa', desc: { en: 'Parents & ancestry.', mm: 'မိဘ နှင့် ဘိုးဘွား။' } },
  { n: 16, name: 'D16 · Shodasamsa', desc: { en: 'Vehicles, comforts & luxuries.', mm: 'ယာဉ်၊ အိမ်သုံး အဆင်ပြေမှု။' } },
  { n: 20, name: 'D20 · Vimsamsa', desc: { en: 'Spiritual practice & devotion.', mm: 'ဝိညာဉ်ရေး၊ ဘာသာရေး လေ့ကျင့်မှု။' } },
  { n: 24, name: 'D24 · Chaturvimsamsa', desc: { en: 'Education & learning.', mm: 'ပညာရေး နှင့် သင်ယူမှု။' } },
  { n: 60, name: 'D60 · Shashtiamsa', desc: { en: 'Overall karma — the most refined chart.', mm: 'အလုံးစုံ ကံ — အသိမ်မွေ့ဆုံး ဇာတာ။' } },
]

export const BIO_EN = 'Bhone Min Thike Din delivers each reading with the rigor of an exact Vedic science. Every chart is decoded through a demanding, multi-layered methodology — the sidereal zodiac fixed by the Lahiri Ayanamsa, Whole-Sign houses anchored on the Chandra Lagna, the complete set of sixteen divisional charts from D1 to D60, the Vimśottarī Dasha timeline of planetary periods, the six-fold Shadbala strength metrics and the Ashtakavarga point system. This is not vague fortune-telling; it is a precise mathematical blueprint of your life, computed to the exacting standard of the classical Vedic astrology śāstras. From that blueprint he delivers clear, strategic life guidance — decisive, practical, and grounded in absolute confidence and professional mastery.'

export const BIO_MM = 'ရှေးဟောင်း ဂဏန်းသင်္ချာနှင့် နက္ခတ်ဗေဒင်သိပ္ပံ (Vedic Astrology) ၏ အဆင့်မြင့် တွက်ကိန်းများကို အခြေခံ၍ — Sidereal Zodiac ကို Lahiri Ayanamsa ဖြင့် တိကျစွာ ချိန်ညှိတွက်ချက်ခြင်း၊ Chandra Lagna (စန္ဒလဂ်) ကို အခြေခံသော Whole-Sign House စနစ်၊ အခြေခံဇာတာမှသည် အနုစိတ်ဇာတာများအထိ ပါဝင်သော ဇာတာခွင် ၁၆ မျိုး (D1 မှ D60 Vargas)၊ ဝိံရှာတ္တရီ (Vimsottari) ဒဿနှင့် အန္တရဒဿ ကာလများ၊ ဂြိုလ်တို့၏ အမြင် (Drishti)၊ ဂြိုလ်စွမ်းအားပြည့်ဝမှုကို တိုင်းတာသည့် ဆုဒ္ဓလ (Shadbala) နှင့် အဋ္ဌကဝဂ် (Ashtakavarga) စသည့် ရှေးဟောင်း နက္ခတ်သင်္ချာနည်းစနစ်များကို အလွှာလိုက် (Layer-by-layer) စေ့စေ့စပ်စပ် စစ်ဆေးခွဲခြမ်းစိတ်ဖြာကာ တိကျသေချာစွာ တွက်ချက်ဖော်ပြပေးပါသည်။'

// Astrologer credential pills — readable in BOTH light and dark (dark shades on
// light bg, light shades on dark bg), each with a distinct colour + soft glow.
export const PROFILE_PILLS: { mm: string; en: string; cls: string }[] = [
  { mm: 'နက္ခတ်ဗေဒင်', en: 'Sidereal Vedic Astrology', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-400/40 shadow-emerald-500/20' },
  { mm: 'လာဟိရီ အယနံသ', en: 'Lahiri Ayanamsa', cls: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-200 dark:border-red-400/40 shadow-red-500/20' },
  { mm: 'ဝိံရှောတ္တရီ ဒသာ', en: 'Vimśottarī Dasha', cls: 'bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-900/40 dark:text-violet-200 dark:border-violet-400/40 shadow-violet-500/25' },
  { mm: 'ဇာတာခွဲ D1–D60', en: 'D1–D60 Vargas', cls: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-400/50 shadow-amber-500/25' },
  { mm: 'ဆဒ္ဗလ', en: 'Shadbala', cls: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-400/40 shadow-rose-500/20' },
  { mm: 'အဋ္ဌကဝဂ်', en: 'Ashtakavarga', cls: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-200 dark:border-indigo-400/40 shadow-indigo-500/20' },
]

// D1–D60 educational meanings (simple, bilingual).
export const VARGA_GUIDE: { code: string; en: string; mm: string }[] = [
  { code: 'D1 · Rasi', en: 'Physical body, general life path, and baseline karma.', mm: 'ခန္ဓာကိုယ်၊ ဘဝလမ်းကြောင်း အထွေထွေနှင့် အခြေခံကံ။' },
  { code: 'D2 · Hora', en: 'Wealth, assets, and financial prosperity.', mm: 'ဥစ္စာဓန၊ ပိုင်ဆိုင်မှုနှင့် ငွေကြေး ကြွယ်ဝမှု။' },
  { code: 'D3 · Drekkana', en: 'Siblings, courage, and inner strength.', mm: 'မောင်နှမ၊ ရဲစွမ်းသတ္တိနှင့် စိတ်ဓာတ်ခွန်အား။' },
  { code: 'D4 · Chaturthamsha', en: 'Real estate, properties, and overall fortune.', mm: 'အိမ်ခြံမြေ၊ ပိုင်ဆိုင်မှုနှင့် အထွေထွေကံကြမ္မာ။' },
  { code: 'D7 · Saptamsha', en: 'Children, progeny, and legacy.', mm: 'သားသမီး၊ သားစဉ်မြေးဆက်နှင့် အမွေအနှစ်။' },
  { code: 'D9 · Navamsa', en: "Marriage, the soul's true purpose, and hidden strengths — the most important sub-chart.", mm: 'အိမ်ထောင်ရေး၊ ဝိညာဉ်၏ စစ်မှန်သော ရည်ရွယ်ချက်နှင့် ကွယ်ဝှက်နေသော အင်အား — အရေးအကြီးဆုံး ဇာတာခွဲ။' },
  { code: 'D10 · Dasamsha', en: 'Career, professional success, and public status.', mm: 'အသက်မွေးဝမ်းကျောင်း၊ အလုပ်အောင်မြင်မှုနှင့် လူသိဂုဏ်အဆင့်။' },
  { code: 'D12 · Dwadasamsha', en: 'Parents, ancestral karma, and heritage.', mm: 'မိဘ၊ ဘိုးဘွား ကံနှင့် အမွေအနှစ်။' },
  { code: 'D16 · Shodashamsha', en: 'Vehicles, inner happiness, and comforts.', mm: 'ယာဉ်၊ စိတ်တွင်း ပျော်ရွှင်မှုနှင့် သက်သာချမ်းသာမှု။' },
  { code: 'D20 · Vimsamsha', en: 'Spiritual progress and religious dedication.', mm: 'ဝိညာဉ်ရေး တိုးတက်မှုနှင့် ဘာသာရေး ဆက်ကပ်မှု။' },
  { code: 'D24 · Chaturvimsamsha', en: 'Education, learning, and intellect.', mm: 'ပညာရေး၊ သင်ယူမှုနှင့် ဉာဏ်ရည်။' },
  { code: 'D60 · Shashtiamsha', en: 'Past-life karma and deep-rooted destiny.', mm: 'အတိတ်ဘဝ ကံနှင့် အမြစ်တွယ်နေသော ကံကြမ္မာ။' },
]

// Yoga meanings — bilingual. Keyed by the exact backend yoga name; also used as
// an educational guide (incl. Neecha Bhanga Raja Yoga).
export const YOGA_INFO: Record<string, { en: string; mm: string }> = {
  'Gaja Kesari Yoga': {
    en: 'Jupiter in a kendra (1/4/7/10) from the Moon. Grants wisdom, virtue, prosperity and a respected, well-liked nature.',
    mm: 'ကြာသပတေးသည် စန်း (လ) မှ ကေန္ဒြ (၁/၄/၇/၁၀) တွင် တည်ရှိသောအခါ ဖြစ်သည်။ ပညာဉာဏ်၊ ဂုဏ်သိက္ခာ၊ ကြီးပွားချမ်းသာမှုနှင့် လူချစ်လူခင်ပေါများပြီး လေးစားခံရသော သဘာဝကို ပေးသည်။',
  },
  'Budha-Aditya Yoga': {
    en: 'Sun and Mercury conjunct in one sign. Sharp intellect, eloquence, skill in learning and business.',
    mm: 'နေနှင့် ဗုဒ္ဓဟူး တစ်ရာသီတည်း ပူးယှဉ်သောအခါ ဖြစ်သည်။ ဉာဏ်ရည်ထက်မြက်မှု၊ ဟောပြောဆက်သွယ်စွမ်း၊ ပညာနှင့် စီးပွားရေးကျွမ်းကျင်မှုကို ပေးသည်။',
  },
  'Chandra-Mangala Yoga': {
    en: 'Moon and Mars conjunct. Wealth through drive, enterprise and bold initiative.',
    mm: 'စန်းနှင့် အင်္ဂါ ပူးယှဉ်သောအခါ ဖြစ်သည်။ ဇွဲလုံ့လ၊ လုပ်ငန်းစွန့်ဦးတီထွင်မှုနှင့် ရဲရင့်သောဆုံးဖြတ်ချက်ဖြင့် ဥစ္စာဓန ရရှိမှုကို ပေးသည်။',
  },
  'Ruchaka Yoga': {
    en: 'Mars in its own/exaltation sign in a kendra (a Pancha Mahapurusha yoga). Courage, leadership and physical strength.',
    mm: 'အင်္ဂါသည် ကိုယ်ပိုင်/ဥစ်ရာသီ ကေန္ဒြတွင် တည်ရှိသော ပဉ္စမဟာပုရုဿယောဂ။ ရဲစွမ်းသတ္တိ၊ ခေါင်းဆောင်နိုင်စွမ်းနှင့် ကာယခွန်အားကို ပေးသည်။',
  },
  'Bhadra Yoga': {
    en: 'Mercury in its own/exaltation sign in a kendra. Intelligence, communication and business acumen.',
    mm: 'ဗုဒ္ဓဟူးသည် ကိုယ်ပိုင်/ဥစ်ရာသီ ကေန္ဒြတွင် တည်ရှိသော ပဉ္စမဟာပုရုဿယောဂ။ ဉာဏ်ရည်၊ ဟောပြောရေးသားစွမ်းနှင့် စီးပွားရေးဉာဏ်ကို ပေးသည်။',
  },
  'Hamsa Yoga': {
    en: 'Jupiter in its own/exaltation sign in a kendra. Virtue, wisdom, spirituality and honour.',
    mm: 'ကြာသပတေးသည် ကိုယ်ပိုင်/ဥစ်ရာသီ ကေန္ဒြတွင် တည်ရှိသော ပဉ္စမဟာပုရုဿယောဂ။ ကုသိုလ်တရား၊ ပညာ၊ ဝိညာဉ်ရေးနှင့် ဂုဏ်သိက္ခာကို ပေးသည်။',
  },
  'Malavya Yoga': {
    en: 'Venus in its own/exaltation sign in a kendra. Beauty, comfort, art and refined luxury.',
    mm: 'သောကြာသည် ကိုယ်ပိုင်/ဥစ်ရာသီ ကေန္ဒြတွင် တည်ရှိသော ပဉ္စမဟာပုရုဿယောဂ။ အလှ၊ သက်သာချမ်းသာမှု၊ အနုပညာနှင့် ဇိမ်ခံမှုကို ပေးသည်။',
  },
  'Sasa Yoga': {
    en: 'Saturn in its own/exaltation sign in a kendra. Discipline, authority, endurance and lasting success.',
    mm: 'စနေသည် ကိုယ်ပိုင်/ဥစ်ရာသီ ကေန္ဒြတွင် တည်ရှိသော ပဉ္စမဟာပုရုဿယောဂ။ စည်းကမ်း၊ အာဏာ၊ ခံနိုင်ရည်နှင့် ရေရှည်တည်တံ့သော အောင်မြင်မှုကို ပေးသည်။',
  },
  'Neecha Bhanga Raja Yoga': {
    en: 'A "debilitation-cancellation" raja yoga: a planet is debilitated (neecha), but its weakness is cancelled — e.g. the lord of its sign, or the planet that would be exalted there, sits in a kendra. Early struggles turn into great, hard-won success.',
    mm: 'ဂြိုဟ်တစ်လုံးသည် နိစ် (ကျဆင်း) ဖြစ်နေသော်လည်း ထိုနိစ်ဖြစ်မှုကို ပယ်ဖျက်ပေးသည့် အခြေအနေ (ဥပမာ — နိစ်ရာသီ၏ သခင် သို့မဟုတ် ထိုနေရာတွင် ဥစ်ဖြစ်မည့်ဂြိုဟ်သည် ကေန္ဒြတွင် တည်ရှိ) ရှိသောအခါ ဖြစ်သည်။ အစပိုင်း အခက်အခဲများမှတစ်ဆင့် နောက်ပိုင်း ကြီးကျယ်သော အောင်မြင်မှု (ရာဇယောဂ) ကို ပေးသည် — "ကျရှုံးရာမှ ကြီးပွား" ဆိုသည့်သဘော။',
  },
  'Raja Yoga': {
    en: 'A link (conjunction/aspect/exchange) between a kendra lord (1/4/7/10) and a trikona lord (1/5/9). Power, status and success.',
    mm: 'ကေန္ဒြသခင် (၁/၄/၇/၁၀) နှင့် တြိကုဏသခင် (၁/၅/၉) တို့ ဆက်စပ် (ပူးယှဉ်/အမြင်/ဖလှယ်) သောအခါ ဖြစ်သည်။ အာဏာ၊ ဂုဏ်အဆင့်နှင့် အောင်မြင်မှုကို ပေးသည်။',
  },
  'Dhana Yoga': {
    en: 'A link between the lords of wealth houses (2/11) and other benefic-house lords. Accumulation of wealth.',
    mm: 'ဓနအိမ် (၂/၁၁) သခင်များနှင့် အခြားအကျိုးပေးအိမ်သခင်များ ဆက်စပ်သောအခါ ဖြစ်သည်။ ဥစ္စာဓန စုဆောင်းနိုင်မှုကို ပေးသည်။',
  },
}

export const yogaText = (name: string, lang: Lang) => (YOGA_INFO[name] ? YOGA_INFO[name][lang] : '')

export const deg = (d: number) => `${Math.floor(d)}°${String(Math.floor((d % 1) * 60)).padStart(2, '0')}'`

// Shared form control classes.
export const field = 'mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-fg outline-none transition focus:border-accent/50'
export const labelCls = 'block font-mono text-[11px] uppercase tracking-wider text-muted'
