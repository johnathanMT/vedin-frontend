import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, MapPin, Loader2, Search, Download, Star, Info, Sigma, FlaskConical, ArrowRight, ScrollText, Clock, CheckCircle2, ChevronDown, Lock, UserPlus, Pencil, Send, AlertTriangle, Cake, X } from 'lucide-react'
import tzlookup from 'tz-lookup'
import { SITE } from '../config/site'
import KundliChart from './KundliChart'
import DiamondChart from './DiamondChart'
import AreaRadar from './AreaRadar'
import TimelineChart from './TimelineChart'
import AshtakavargaView from './AshtakavargaView'
import ShadbalaView from './ShadbalaView'
import CustomerPanel, { type SavedChart, type CustomerPanelHandle } from './CustomerPanel'
import MarkdownView from './MarkdownView'
import type { BirthChartData, BirthChartRequest, PlanetPosition, TransitPos } from '../types/astrology'
import { JT, type Lang, type Naynan, vargaSign, signLabel, planetName, readingFor, naynan, activeBhukti, activePratyantar, toMmDigits, themeWord, transitNoteText, findPlanet, dignityLabel, currentAreaEffect } from '../lib/vedin'

const CHART_URL = `${SITE.apiUrl}/api/astrology/chart`
const GEO_URL = 'https://nominatim.openstreetmap.org/search'

interface Preset { label: string; lat: number; lon: number; tz: string }
const PRESETS: Preset[] = [
  { label: 'Yangon', lat: 16.8409, lon: 96.1735, tz: 'Asia/Yangon' },
  { label: 'Mandalay', lat: 21.9588, lon: 96.0891, tz: 'Asia/Yangon' },
  { label: 'Tokyo', lat: 35.6762, lon: 139.6503, tz: 'Asia/Tokyo' },
  { label: 'Bangkok', lat: 13.7563, lon: 100.5018, tz: 'Asia/Bangkok' },
  { label: 'New Delhi', lat: 28.6139, lon: 77.209, tz: 'Asia/Kolkata' },
  { label: 'Singapore', lat: 1.3521, lon: 103.8198, tz: 'Asia/Singapore' },
]
const browserTz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' } catch { return 'UTC' } })()
const TZ_OPTIONS = [...new Set([browserTz, ...PRESETS.map((p) => p.tz), 'UTC'])]

interface GeoResult { display_name: string; lat: string; lon: string }
interface Profile {
  id: number; email: string; username: string; emailConfirmed: boolean
  gender?: string; dob?: string; birthTime?: string; locationName?: string
  latitude?: number; longitude?: number; timezone?: string; hasProfile: boolean
}
interface ChatMsg { id: number; senderRole: string; text: string; createdAt: string }
type Tab = 'ai' | 'reading' | 'timeline' | 'd1' | 'vargas' | 'ashtaka' | 'shadbala'


const VARGAS: { n: number; name: string; desc: { en: string; mm: string } }[] = [
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

const BIO_EN = 'Bhone Min Thike Din delivers each reading with the rigor of an exact Vedic science. Every chart is decoded through a demanding, multi-layered methodology — the sidereal zodiac fixed by the Lahiri Ayanamsa, Whole-Sign houses anchored on the Chandra Lagna, the complete set of sixteen divisional charts from D1 to D60, the Vimśottarī Dasha timeline of planetary periods, the six-fold Shadbala strength metrics and the Ashtakavarga point system. This is not vague fortune-telling; it is a precise mathematical blueprint of your life, computed to the exacting standard of the classical Vedic astrology śāstras. From that blueprint he delivers clear, strategic life guidance — decisive, practical, and grounded in absolute confidence and professional mastery.'
// Astrologer credential pills — readable in BOTH light and dark (dark shades on
// light bg, light shades on dark bg), each with a distinct colour + soft glow.
const PROFILE_PILLS: { mm: string; en: string; cls: string }[] = [
  { mm: 'နက္ခတ်ဗေဒင်', en: 'Sidereal Vedic Astrology', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-400/40 shadow-emerald-500/20' },
  { mm: 'လာဟိရီ အယနံသ', en: 'Lahiri Ayanamsa', cls: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-200 dark:border-red-400/40 shadow-red-500/20' },
  { mm: 'ဝိံရှောတ္တရီ ဒသာ', en: 'Vimśottarī Dasha', cls: 'bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-900/40 dark:text-violet-200 dark:border-violet-400/40 shadow-violet-500/25' },
  { mm: 'ဇာတာခွဲ D1–D60', en: 'D1–D60 Vargas', cls: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-400/50 shadow-amber-500/25' },
  { mm: 'ဆဒ္ဗလ', en: 'Shadbala', cls: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-200 dark:border-rose-400/40 shadow-rose-500/20' },
  { mm: 'အဋ္ဌကဝဂ်', en: 'Ashtakavarga', cls: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-200 dark:border-indigo-400/40 shadow-indigo-500/20' },
]

const BIO_MM = 'ရှေးဟောင်း ဂဏန်းသင်္ချာနှင့် နက္ခတ်ဗေဒင်သိပ္ပံ (Vedic Astrology) ၏ အဆင့်မြင့် တွက်ကိန်းများကို အခြေခံ၍ — Sidereal Zodiac ကို Lahiri Ayanamsa ဖြင့် တိကျစွာ ချိန်ညှိတွက်ချက်ခြင်း၊ Chandra Lagna (စန္ဒလဂ်) ကို အခြေခံသော Whole-Sign House စနစ်၊ အခြေခံဇာတာမှသည် အနုစိတ်ဇာတာများအထိ ပါဝင်သော ဇာတာခွင် ၁၆ မျိုး (D1 မှ D60 Vargas)၊ ဝိံရှာတ္တရီ (Vimsottari) ဒဿနှင့် အန္တရဒဿ ကာလများ၊ ဂြိုလ်တို့၏ အမြင် (Drishti)၊ ဂြိုလ်စွမ်းအားပြည့်ဝမှုကို တိုင်းတာသည့် ဆုဒ္ဓလ (Shadbala) နှင့် အဋ္ဌကဝဂ် (Ashtakavarga) စသည့် ရှေးဟောင်း နက္ခတ်သင်္ချာနည်းစနစ်များကို အလွှာလိုက် (Layer-by-layer) စေ့စေ့စပ်စပ် စစ်ဆေးခွဲခြမ်းစိတ်ဖြာကာ တိကျသေချာစွာ တွက်ချက်ဖော်ပြပေးပါသည်။'

// D1–D60 educational meanings (simple, bilingual).
const VARGA_GUIDE: { code: string; en: string; mm: string }[] = [
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
const YOGA_INFO: Record<string, { en: string; mm: string }> = {
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
const yogaText = (name: string, lang: Lang) => (YOGA_INFO[name] ? YOGA_INFO[name][lang] : '')

const deg = (d: number) => `${Math.floor(d)}°${String(Math.floor((d % 1) * 60)).padStart(2, '0')}'`
const field = 'mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-fg outline-none transition focus:border-accent/50'
const labelCls = 'block font-mono text-[11px] uppercase tracking-wider text-muted'

type ChartStyle = 'diamond' | 'grid'
// Switch between North-Indian diamond (encyclopedia) and South-Indian grid.
function ChartView({ style, ...rest }: {
  style: ChartStyle; data: BirthChartData; lagnaSign?: number
  signFor?: (p: PlanetPosition) => number; title?: string; subtitle?: string
}) {
  return style === 'diamond' ? <DiamondChart {...rest} /> : <KundliChart {...rest} />
}

// Small varga panel: chart + description + planets-in-this-varga table.
function VargaPanel({ data, lang, signOf, lagnaSign, title, subtitle, desc, chartStyle }: {
  data: BirthChartData; lang: Lang; signOf: (p: PlanetPosition) => number; lagnaSign: number
  title: string; subtitle: string; desc: string; chartStyle: ChartStyle
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="glass-card p-5"><ChartView style={chartStyle} data={data} signFor={signOf} lagnaSign={lagnaSign} title={title} subtitle={subtitle} /></div>
      <div className="glass-card p-5">
        <p className="mb-3 text-sm leading-relaxed text-muted">{desc}</p>
        <p className={labelCls}>{JT[lang].planetsIn}</p>
        <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {data.planets.map((p) => (
            <li key={p.name} className="flex justify-between gap-2">
              <span className="text-fg/90">{planetName(p.name, lang)}</span>
              <span className="text-accent-light">{signLabel(signOf(p), lang)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function Vedin() {
  const [lang, setLang] = useState<Lang>('mm')   // default to Burmese; toggle switches to English
  const t = JT[lang]

  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [date, setDate] = useState('1998-01-01')
  const [time, setTime] = useState('12:00')
  const [lat, setLat] = useState('16.8409')
  const [lon, setLon] = useState('96.1735')
  const [tz, setTz] = useState(browserTz)
  const [place, setPlace] = useState('')
  const [placeConfirmed, setPlaceConfirmed] = useState(false)   // true only after a city is picked/preset
  const [results, setResults] = useState<GeoResult[]>([])
  const [searching, setSearching] = useState(false)
  const debTimer = useRef<number | undefined>(undefined)

  const [data, setData] = useState<BirthChartData | null>(null)
  const [querent, setQuerent] = useState<{ name: string; gender: 'male' | 'female'; nn: Naynan | null } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('reading')
  const [chartStyle, setChartStyle] = useState<ChartStyle>('diamond')
  const [vargaN, setVargaN] = useState(9)
  const [ayanamsa, setAyanamsa] = useState('lahiri')
  const [consent, setConsent] = useState(false)

  // Remedy / contact-to-Ko Bhone Min Thike Din form.
  const remedyRef = useRef<HTMLDivElement>(null)
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatBusy, setChatBusy] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Full-reading PDF via the browser's print engine (captures every tab's charts & tables).
  const [printAll, setPrintAll] = useState(false)

  // Customer account (email-only sign-up); token drives per-account chart saving.
  const [customerToken, setCustomerToken] = useState<string | null>(null)

  // AI reading
  // Manual-approval reading workflow: request → pending → (Sayar approves) → approved.
  const [reqStatus, setReqStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none')
  const [reqMarkdown, setReqMarkdown] = useState('')
  const [, setReqId] = useState<number | null>(null)   // tracked on status load; value unused since PDF is client-side now
  const [reqLoading, setReqLoading] = useState(false)
  const [reqError, setReqError] = useState('')
  const [reqInfo, setReqInfo] = useState('')
  const [showApprovedModal, setShowApprovedModal] = useState(false)   // guidance pop-up when a reading is approved
  const readingRef = useRef<HTMLDivElement>(null)   // the rendered reading, for client-side PDF
  const customerPanelRef = useRef<CustomerPanelHandle>(null)
  const [howtoOpen, setHowtoOpen] = useState(false)
  const [verifyToast, setVerifyToast] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [otherMode, setOtherMode] = useState(false)   // "calculate for someone else"
  const loadSavedChart = (c: SavedChart) => {
    setName(c.name || ''); setGender(c.gender === 'female' ? 'female' : 'male')
    setDate(c.birthDate || date); setTime(c.birthTime || time)
    setLat(String(c.latitude)); setLon(String(c.longitude))
    if (c.timeZone) setTz(c.timeZone)
    setPlace(c.name ? `${c.name} · saved` : 'Saved location'); setPlaceConfirmed(true)
  }

  const onPlaceChange = (v: string) => {
    setPlace(v)
    setPlaceConfirmed(false)   // typing invalidates until a result is chosen
    window.clearTimeout(debTimer.current)
    if (v.trim().length < 3) { setResults([]); return }
    debTimer.current = window.setTimeout(async () => {
      setSearching(true)
      try {
        const r = await fetch(`${GEO_URL}?format=json&limit=5&q=${encodeURIComponent(v)}`, { headers: { Accept: 'application/json' } })
        const j = (await r.json()) as GeoResult[]
        setResults(Array.isArray(j) ? j : [])
      } catch { setResults([]) } finally { setSearching(false) }
    }, 450)
  }
  const selectPlace = (g: GeoResult) => {
    const la = Number(g.lat), lo = Number(g.lon)
    setLat(String(la)); setLon(String(lo)); setPlace(g.display_name.split(',').slice(0, 2).join(',').trim()); setResults([]); setPlaceConfirmed(true)
    try { setTz(tzlookup(la, lo)) } catch { /* keep */ }
  }
  const applyPreset = (p: Preset) => { setLat(String(p.lat)); setLon(String(p.lon)); setTz(p.tz); setPlace(p.label); setResults([]); setPlaceConfirmed(true) }

  const canSubmit = !!name.trim() && placeConfirmed && consent

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!canSubmit) return   // name + confirmed city + consent are all mandatory
    setError(''); setLoading(true); setData(null)
    try {
      const [y, mo, d] = date.split('-').map(Number)
      const [h, mi] = time.split(':').map(Number)
      const body: BirthChartRequest = {
        year: y, month: mo, day: d, hour: h || 0, minute: mi || 0, second: 0,
        timeZone: tz, latitude: Number(lat), longitude: Number(lon), ayanamsa,
      }
      const res = await fetch(CHART_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const json = (await res.json().catch(() => null)) as { success?: boolean; data?: BirthChartData; message?: string } | null
      if (!res.ok || !json?.success || !json.data) throw new Error(json?.message || `Failed (${res.status})`)
      setData(json.data); setQuerent({ name: name.trim(), gender, nn: naynan(date, time) }); setTab('reading')
      // Persist the querent's chart ONLY with explicit consent (opt-in).
      if (consent) {
        fetch(`${SITE.apiUrl}/api/astrology/save-chart`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(), gender, birthDate: date, birthTime: time, timeZone: tz,
            latitude: Number(lat), longitude: Number(lon), nayNan: naynan(date, time)?.num ?? 0, consent: true,
          }),
        }).catch(() => { })
      }
      // Logged-in customers: also save under their account (history + autofill).
      if (customerToken) {
        fetch(`${SITE.apiUrl}/api/customer/save-chart`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
          body: JSON.stringify({
            name: name.trim(), gender, birthDate: date, birthTime: time, timeZone: tz,
            latitude: Number(lat), longitude: Number(lon), nayNan: naynan(date, time)?.num ?? 0, consent: true,
          }),
        }).catch(() => { })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not compute the chart.')
    } finally { setLoading(false) }
  }

  // Current age from a yyyy-mm-dd date of birth.
  const ageFromDob = (dob?: string): number | null => {
    if (!dob) return null
    const b = new Date(dob)
    if (isNaN(b.getTime())) return null
    const now = new Date()
    let age = now.getFullYear() - b.getFullYear()
    const m = now.getMonth() - b.getMonth()
    if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--
    return age >= 0 && age < 200 ? age : null
  }
  const ageLabel = (dob?: string): string => {
    const a = ageFromDob(dob)
    if (a == null) return ''
    return lang === 'mm' ? `(အသက် ${toMmDigits(a)} နှစ်)` : `(Age ${a})`
  }

  // ── Registered dashboard: compute the account's own chart from its profile.
  // Also syncs the form state so the reading payload / status use this identity. ──
  const computeFromProfile = async (p: Profile) => {
    if (!p.dob || p.latitude == null || p.longitude == null) return
    const g: 'male' | 'female' = p.gender === 'female' ? 'female' : 'male'
    const bt = p.birthTime || '12:00'
    setName(p.username || ''); setGender(g)
    setDate(p.dob); setTime(bt)
    setLat(String(p.latitude)); setLon(String(p.longitude))
    if (p.timezone) setTz(p.timezone)
    setPlace(p.locationName || 'My birth place'); setPlaceConfirmed(true)
    setError(''); setLoading(true); setData(null)
    try {
      const [y, mo, d] = p.dob.split('-').map(Number)
      const [h, mi] = bt.split(':').map(Number)
      const body: BirthChartRequest = {
        year: y, month: mo, day: d, hour: h || 0, minute: mi || 0, second: 0,
        timeZone: p.timezone || tz, latitude: p.latitude, longitude: p.longitude, ayanamsa,
      }
      const res = await fetch(CHART_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const json = (await res.json().catch(() => null)) as { success?: boolean; data?: BirthChartData; message?: string } | null
      if (!res.ok || !json?.success || !json.data) throw new Error(json?.message || `Failed (${res.status})`)
      setData(json.data); setQuerent({ name: (p.username || '').trim(), gender: g, nn: naynan(p.dob, bt) }); setTab('reading')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not compute your chart.')
    } finally { setLoading(false) }
  }

  // Fetch the profile whenever the auth token changes.
  useEffect(() => {
    if (!customerToken) { setProfile(null); setOtherMode(false); return }
    let cancelled = false
    fetch(`${SITE.apiUrl}/api/customer/me`, { headers: { Authorization: `Bearer ${customerToken}` } })
      .then((r) => r.json()).then((j) => { if (!cancelled && j?.success && j.data) setProfile(j.data as Profile) })
      .catch(() => { /* ignore */ })
    return () => { cancelled = true }
  }, [customerToken])

  const refreshProfile = () => {
    if (!customerToken) return
    fetch(`${SITE.apiUrl}/api/customer/me`, { headers: { Authorization: `Bearer ${customerToken}` } })
      .then((r) => r.json()).then((j) => { if (j?.success && j.data) { setProfile(j.data as Profile); setOtherMode(false) } })
      .catch(() => { /* ignore */ })
  }

  // Registered + has profile + not "someone else" → instantly show their chart.
  const showDashboard = !!(customerToken && profile?.hasProfile && !otherMode)
  useEffect(() => {
    if (showDashboard && profile) computeFromProfile(profile)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDashboard, profile])

  const startCalcForOther = () => {
    setOtherMode(true); setData(null)
    setName(''); setGender('male'); setPlace(''); setPlaceConfirmed(false); setResults([])
    setReqStatus('none'); setReqMarkdown(''); setReqId(null); setReqError(''); setReqInfo('')
  }
  const backToDashboard = () => { setOtherMode(false); setReqStatus('none'); setReqMarkdown(''); setReqId(null) }

  // Life-area "get remedy" → pre-fill the consultation chat with that area.
  const openRemedy = (areaLabel: string) => {
    setChatInput(lang === 'mm' ? `${areaLabel} ကဏ္ဍအတွက် သင့်လျော်သော ယတြာ/အကြံဉာဏ် လိုအပ်ပါသည်။` : `I would like a suitable remedy / advice for: ${areaLabel}.`)
    setTimeout(() => remedyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 40)
  }
  const loadMessages = async () => {
    if (!customerToken) return
    try {
      const res = await fetch(`${SITE.apiUrl}/api/customer/messages`, { headers: { Authorization: `Bearer ${customerToken}` } })
      const j = (await res.json().catch(() => null)) as { success?: boolean; data?: ChatMsg[] } | null
      if (j?.success && Array.isArray(j.data)) {
        // Only replace state when the thread actually changed (new/removed message),
        // so silent 5s polls don't trigger needless re-renders or scroll jumps.
        const next = j.data
        setChatMsgs((prev) =>
          (prev.length === next.length && prev[prev.length - 1]?.id === next[next.length - 1]?.id)
            ? prev
            : next)
      }
    } catch { /* ignore — silent background poll */ }
  }
  const sendMessage = async () => {
    const text = chatInput.trim()
    if (!text || !customerToken || chatBusy) return
    setChatBusy(true)
    try {
      const res = await fetch(`${SITE.apiUrl}/api/customer/messages`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` }, body: JSON.stringify({ text }),
      })
      const j = (await res.json().catch(() => null)) as { success?: boolean; data?: ChatMsg } | null
      if (j?.success && j.data) { setChatMsgs((m) => [...m, j.data as ChatMsg]); setChatInput('') }
    } catch { /* ignore */ } finally { setChatBusy(false) }
  }
  // Real-time chat: load immediately on login, then silently poll every 5s.
  // The interval is cleared on unmount / logout so there's no memory leak or
  // background work once the user leaves — keeps mobile completely smooth.
  useEffect(() => {
    if (!customerToken) return
    loadMessages()
    const id = window.setInterval(loadMessages, 5000)
    return () => window.clearInterval(id)
  }, [customerToken]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }, [chatMsgs])

  // Approved-reading guidance pop-up: show once per browser session when the
  // reading turns 'approved', unless the user has already dismissed it.
  useEffect(() => {
    if (reqStatus !== 'approved') return
    let dismissed = false
    try { dismissed = sessionStorage.getItem('vedinApprovedSeen') === '1' } catch { /* private mode */ }
    if (!dismissed) setShowApprovedModal(true)
  }, [reqStatus])
  const dismissApprovedModal = () => {
    setShowApprovedModal(false)
    try { sessionStorage.setItem('vedinApprovedSeen', '1') } catch { /* ignore */ }
  }

  // Render every tab, switch to the light (print-friendly) theme, then open the
  // browser's Save-as-PDF dialog. The full reading — charts, tables, timeline —
  // is captured because printAll forces all sections into the DOM.
  const downloadPdf = () => {
    const html = document.documentElement
    const prevTheme = html.getAttribute('data-theme') || 'dark'
    setPrintAll(true)
    html.setAttribute('data-theme', 'light')
    const restore = () => { html.setAttribute('data-theme', prevTheme); setPrintAll(false); window.removeEventListener('afterprint', restore) }
    window.addEventListener('afterprint', restore)
    setTimeout(() => window.print(), 180)
  }

  const moon = data?.planets.find((p) => p.name === 'Moon')
  const now = Date.now()
  const thisYear = new Date().getFullYear()
  const barColor = (tone: string) => tone === 'favorable' ? 'rgb(var(--jade))' : tone === 'testing' ? 'rgb(var(--coral))' : 'rgb(var(--accent))'
  // Memoized so these (non-trivial) dasha/reading derivations only recompute when
  // the chart or language actually changes — not on every keystroke in the chat/geo
  // inputs, which would otherwise re-run them on each render.
  const reading = useMemo(() => (data ? readingFor(data, lang) : null), [data, lang])
  const bhukti = useMemo(() => (data ? activeBhukti(data) : undefined), [data])
  const prat = useMemo(() => (data ? activePratyantar(data) : undefined), [data])

  // ── Detailed reading: summarise the computed chart → request → Sayar approves ─
  // Identity used for the 30-day dedup hash on the backend (must match the payload).
  const readingIdentity = () => ({
    name: querent?.name || name.trim() || undefined,
    birthDate: date,
    birthTime: time,
    location: place.trim() || `${lat},${lon}`,
  })

  const buildAiPayload = () => {
    if (!data) return null
    const en: Lang = 'en'
    const moonP = data.planets.find((p) => p.name === 'Moon')
    const sunP = data.planets.find((p) => p.name === 'Sun')
    const dig = (d: string) => (d && d !== '-' ? dignityLabel(d, en) : undefined)
    const sav = data.ashtakavarga?.sav ?? []
    let ashNotes: string | undefined
    if (sav.length === 12) {
      let hi = 0, lo = 0
      for (let i = 1; i < 12; i++) { if (sav[i] > sav[hi]) hi = i; if (sav[i] < sav[lo]) lo = i }
      ashNotes = `Strongest ${signLabel(hi, en)} (${sav[hi]}); weakest ${signLabel(lo, en)} (${sav[lo]})`
    }
    const yr = data.timeline?.find((y) => y.year === thisYear)
    return {
      name: querent?.name || name.trim() || undefined,
      gender: querent?.gender || gender,
      nayNan: querent?.nn ? `${querent.nn.enDay} (No. ${querent.nn.num}, ${querent.nn.planet})` : undefined,
      ascendant: signLabel(data.ascendant.sign, en),
      moonSign: moonP ? signLabel(moonP.sign, en) : undefined,
      sunSign: sunP ? signLabel(sunP.sign, en) : undefined,
      placements: data.planets.slice(0, 20).map((p) => ({
        planet: planetName(p.name, en), sign: signLabel(p.sign, en), house: p.house,
        nakshatra: p.nakshatraName, retrograde: p.retrograde, dignity: dig(p.dignity),
      })),
      mahadasha: reading ? planetName(reading.lord, en) : undefined,
      antardasha: bhukti ? planetName(bhukti.lord, en) : undefined,
      pratyantardasha: prat ? planetName(prat.lord, en) : undefined,
      dashaWindow: bhukti ? `${bhukti.startUtc} → ${bhukti.endUtc}` : undefined,
      sadeSatiStatus: yr?.sadeSati ? 'Active this year' : 'Not active this year',
      sarvashtakavargaBySign: sav.length === 12 ? sav : undefined,
      ashtakavargaNotes: ashNotes,
      yogas: (data.yogas ?? []).map((y) => y.name).slice(0, 30),
      language: lang === 'mm' ? 'my' : 'en',
      // birthDate / birthTime / location → used only for the 30-day dedup hash
      birthDate: date,
      birthTime: time,
      location: place.trim() || `${lat},${lon}`,
    }
  }

  type StatusData = { status: string; requestId: number; markdown?: string; alreadyRequested?: boolean }
  const applyStatus = (d: StatusData | null | undefined) => {
    if (d && d.status && d.status.toLowerCase() !== 'none') {
      setReqStatus(d.status.toLowerCase() as 'pending' | 'approved' | 'rejected')
      setReqId(d.requestId ?? null)
      setReqMarkdown(d.markdown || '')
    } else {
      setReqStatus('none'); setReqId(null); setReqMarkdown('')
    }
  }

  // On chart compute (and revisits), check whether a request already exists / is approved.
  const checkReadingStatus = async () => {
    try {
      const res = await fetch(`${SITE.apiUrl}/api/astrology/reading-status`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(readingIdentity()),
      })
      const json = (await res.json().catch(() => null)) as { data?: StatusData } | null
      applyStatus(json?.data)
    } catch { /* ignore */ }
  }
  useEffect(() => { if (data) { setReqError(''); setReqInfo(''); checkReadingStatus() } }, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  // Submit a request — NO AI call; the Sayar reviews and approves later.
  const requestReading = async () => {
    if (!data || reqLoading) return
    const payload = buildAiPayload()
    if (!payload) return
    setReqLoading(true); setReqError(''); setReqInfo('')
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (customerToken) headers.Authorization = `Bearer ${customerToken}`
      const res = await fetch(`${SITE.apiUrl}/api/astrology/request-reading`, {
        method: 'POST', headers, body: JSON.stringify(payload),
      })
      const json = (await res.json().catch(() => null)) as { success?: boolean; message?: string; data?: StatusData } | null
      if (!res.ok || !json?.data) throw new Error(json?.message || `Failed (${res.status})`)
      applyStatus(json.data)
      if (json.data.alreadyRequested) setReqInfo(json.message || '')
    } catch (err) {
      setReqError(err instanceof Error ? err.message : 'Could not send the request.')
    } finally { setReqLoading(false) }
  }

  // Direct client-side PDF via a HIDDEN IFRAME (not a pop-up, so no blocker and no
  // blank-modal crash). We write a clean, self-contained light-theme document into
  // the iframe, wait for the Padauk web-fonts to load, then print just that iframe.
  // Everything is wrapped so a failure shows a friendly toast instead of crashing.
  const downloadReadingPdf = () => {
    if (!customerToken) { openAuth('login'); return }
    const bodyHtml = readingRef.current?.innerHTML
    if (!bodyHtml) { setVerifyToast(lang === 'mm' ? 'ဟောစာတမ်း မတွေ့ပါ။ စာမျက်နှာကို ပြန်စစ်ပါ။' : 'Reading not found — please reload.'); return }

    try {
      const who = (querent?.name || '').trim()
      const today = new Date().toISOString().slice(0, 10)
      const docHtml = `<!doctype html><html lang="my"><head><meta charset="utf-8">
<title>${who ? `${who} — Vedin Reading` : 'Vedin Detailed Reading'}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Padauk:wght@400;700&family=Noto+Sans+Myanmar:wght@400;600&display=swap" rel="stylesheet">
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin:0; background:#fff; color:#1a1730; font-family:'Padauk','Noto Sans Myanmar',system-ui,Segoe UI,sans-serif; line-height:1.95; }
  .page { max-width:720px; margin:0 auto; padding:40px 34px; }
  .head { border-bottom:2px solid #7c3aed; padding-bottom:14px; margin-bottom:22px; }
  .brand { font:700 12px 'Segoe UI'; letter-spacing:.28em; text-transform:uppercase; color:#a16207; }
  .name { font-size:22px; font-weight:700; margin:6px 0 2px; }
  .meta { font:12px 'Segoe UI'; color:#6b7280; }
  .md h1,.md h2,.md h3,.md h4 { color:#4c1d95; font-weight:700; margin:1.2em 0 .4em; line-height:1.4; }
  .md h1{font-size:1.4rem} .md h2{font-size:1.2rem} .md h3{font-size:1.08rem} .md h4{font-size:1rem}
  .md p { margin:.6em 0; } .md strong { color:#047857; font-weight:700; } .md em { color:#7c3aed; font-style:normal; }
  .md ul,.md ol { margin:.5em 0; padding-left:1.4em; } .md li { margin:.3em 0; }
  .md hr { border:0; border-top:1px solid #e5e7eb; margin:1.2em 0; }
  .foot { margin-top:26px; border-top:1px solid #e5e7eb; padding-top:12px; font:11px 'Segoe UI'; color:#8b8b8b; line-height:1.7; }
  @media print { .page { padding:0; } }
</style></head>
<body><div class="page">
  <div class="head"><div class="brand">Vedin · Sayar Bhone Min Thike Din</div>
    <div class="name">${who || (lang === 'mm' ? 'အသေးစိတ် ဟောစာတမ်း' : 'Detailed Reading')}</div>
    <div class="meta">${today}</div></div>
  <div class="md">${bodyHtml}</div>
  <div class="foot">${lang === 'mm'
          ? 'ဤဟောစာတမ်းအား ဂန္ထဝင် ဇျောတိသ သင်္ချာနည်းစနစ်များကိုအသုံးပြုပြီး တွက်ချက်ထားပါသည်။ ရလဒ်များမှာ ဆင်ခြင်သုံးသပ်ရန်အတွက် လမ်းညွှန်ချက်များဖြစ်ပါသည်။'
          : 'Computed with classical Vedic astrology formulas and personally verified by the Sayar. Guidance for reflection.'}</div>
</div></body></html>`

      const iframe = document.createElement('iframe')
      iframe.setAttribute('aria-hidden', 'true')
      iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;'
      document.body.appendChild(iframe)

      const cleanup = () => { window.setTimeout(() => { try { iframe.remove() } catch { /* already gone */ } }, 800) }
      const doc = iframe.contentWindow?.document
      if (!doc) { iframe.remove(); throw new Error('iframe document unavailable') }
      doc.open(); doc.write(docHtml); doc.close()

      let printed = false
      const go = () => {
        if (printed) return
        printed = true
        try {
          const w = iframe.contentWindow
          if (!w) throw new Error('no window')
          w.focus()
          w.print()
        } catch {
          setVerifyToast(lang === 'mm' ? 'Print/PDF ဖွင့်၍မရပါ။ ထပ်စမ်းကြည့်ပါ။' : 'Could not open the print dialog — please try again.')
        } finally { cleanup() }
      }

      const win = iframe.contentWindow as (Window & { onafterprint: (() => void) | null }) | null
      if (win) win.onafterprint = cleanup
      const fonts = (doc as Document & { fonts?: FontFaceSet }).fonts
      if (fonts?.ready) fonts.ready.then(() => window.setTimeout(go, 150)).catch(() => go())
      window.setTimeout(go, 1600)   // hard fallback if fonts.ready never settles
    } catch {
      setVerifyToast(lang === 'mm' ? 'PDF ဖန်တီး၍မရပါ။ ထပ်စမ်းကြည့်ပါ။' : 'Could not generate the PDF — please try again.')
    }
  }

  // SECURITY: email verification NEVER auto-logs-in. A verification link may be
  // opened on a different device than the one that signed up, so we must not turn
  // it into a session. If a legacy "?verified=true" (and/or token) lands here, we
  // ignore any token entirely, scrub the URL, and simply prompt the user to log in.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('verified') === 'true') {
      params.delete('token'); params.delete('verified')
      const qs = params.toString()
      window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : ''))
      setVerifyToast(lang === 'mm'
        ? 'အကောင့် အတည်ပြုပြီးပါပြီ။ ကျေးဇူးပြု၍ Login ဝင်ပါ။'
        : 'Account confirmed — please log in to continue.')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!verifyToast) return; const id = setTimeout(() => setVerifyToast(''), 4000); return () => clearTimeout(id) }, [verifyToast])

  const openAuth = (mode: 'login' | 'signup') => customerPanelRef.current?.openAuth(mode)

  const curVarga = VARGAS.find((v) => v.n === vargaN) ?? VARGAS[4]
  const TABS: { id: Tab; label: string; variant?: 'main' | 'ashtaka' | 'shadbala' }[] = [
    { id: 'ai', label: lang === 'mm' ? 'အသေးစိတ် ဟောစာတမ်းများ' : 'Detailed Reading', variant: 'main' },
    { id: 'reading', label: lang === 'mm' ? 'မွေးဇာတာစစ်တမ်းများ' : t.tabReading },
    { id: 'timeline', label: t.tabTimeline },
    { id: 'vargas', label: lang === 'mm' ? 'ဇာတာခွဲများ' : 'Charts' },
    { id: 'ashtaka', label: lang === 'mm' ? 'အဋ္ဌကဝဂ်' : 'Ashtaka', variant: 'ashtaka' },
    { id: 'shadbala', label: lang === 'mm' ? 'ဆဒ္ဗလ' : 'Shadbala', variant: 'shadbala' },
  ]

  return (
    <section className="section-container vedin-page">
      {/* ── Grand Astrologer Profile — centered, large photo, bio below ── */}
      {/* print-hide: the photo + bio are omitted from the printed PDF (Phase 4) */}
      <div className="print-hide relative mb-8 overflow-hidden rounded-3xl border border-amber-400/30 p-6 text-center sm:p-10"
        style={{ background: 'linear-gradient(135deg, rgb(var(--card)) 0%, rgb(var(--surface)) 100%)', boxShadow: '0 0 64px -22px rgba(234,179,8,0.42), 0 0 44px -18px rgb(var(--accent) / 0.35)' }}>
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, rgb(var(--accent)) 0%, transparent 70%)' }} />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />

        {/* language toggle — pinned top-right */}
        <div className="no-print absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1 backdrop-blur">
          {(['en', 'mm'] as Lang[]).map((l) => (
            <button key={l} type="button" onClick={() => setLang(l)}
              className={`rounded-full px-3 py-1 font-mono text-xs transition ${lang === l ? 'bg-accent/70 text-space' : 'text-muted hover:text-fg'}`}>
              {l === 'en' ? 'EN' : 'မြန်မာစာ'}
            </button>
          ))}
        </div>

        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
          <div className="relative h-36 w-36 shrink-0 rounded-full p-[4px] ring-2 ring-amber-400/40 sm:h-44 sm:w-44"
            style={{ background: 'conic-gradient(from 210deg, #fef3c7, #eab308, #b45309, #f59e0b, #fde68a, #eab308)', boxShadow: '0 0 48px -4px rgba(234,179,8,0.72), 0 0 32px -8px rgba(180,83,9,0.55)' }}>
            <div className="relative h-full w-full overflow-hidden rounded-full bg-card">
              <span className="absolute inset-0 flex items-center justify-center font-groovy text-5xl text-amber-500">ဘ</span>
              <picture className="block h-full w-full">
                <source srcSet="/sayar.webp" type="image/webp" />
                <img src="/sayar.jpg" alt="Bhone Min Thike Din" className="relative h-full w-full object-cover" loading="lazy" decoding="async"
                  onError={(e) => { e.currentTarget.style.visibility = 'hidden' }} />
              </picture>
            </div>
          </div>
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.28em] text-amber-700 dark:text-amber-200">
              <Sparkles size={11} className="text-amber-500 dark:text-amber-300" /> {lang === 'mm' ? 'ဗေဒင်ပညာ လေ့လာဆည်းပူးသူ' : 'Vedic Astrology Enthusiast'}
            </p>
            <h1 className="mt-2.5 mb-4 pb-2 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 bg-clip-text font-groovy text-4xl font-bold leading-[1.35] text-transparent sm:text-5xl"
              style={{ filter: 'drop-shadow(0 1px 12px rgba(234,179,8,0.4))' }}>
              {lang === 'mm' ? 'ဘုန်းမင်းသိုက်ဒင်' : 'Bhone Min Thike Din'}
            </h1>
            {/* colourful credential pills — readable in light & dark */}
            <div className="mt-3.5 flex flex-wrap justify-center gap-2">
              {PROFILE_PILLS.map((p) => (
                <span key={p.en} className={`inline-flex items-center rounded-full border px-3 py-1 font-mono text-[11px] font-semibold shadow-md transition hover:brightness-105 ${p.cls}`}>
                  {lang === 'mm' ? p.mm : p.en}
                </span>
              ))}
            </div>
          </div>
          <p className="text-[15px] leading-relaxed text-muted">{lang === 'mm' ? BIO_MM : BIO_EN}</p>
        </div>
      </div>

      {/* ── Portals: the computation behind the charts ── */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 no-print">
        {/* Portal 1 — The Algorithm */}
        <Link to="/algorithms"
          className="group relative overflow-hidden rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/[0.12] via-card to-jade/[0.06] p-6 transition duration-300 hover:border-accent/50 hover:shadow-[0_0_44px_-10px_rgba(168,85,247,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60">
          <span aria-hidden className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-accent/20 blur-3xl transition duration-500 group-hover:bg-accent/30" />
          <div className="relative flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-accent/40 bg-accent/15 text-accent-light shadow-inner">
              <Sigma size={22} />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent-light">{lang === 'mm' ? 'ကွန်ပျူတာသိပ္ပံဆိုင်ရာ အခြေခံ' : 'The Computation'}</p>
              <h3 className="mt-1 font-groovy text-xl text-fg">{lang === 'mm' ? 'အယ်လဂိုရီသမ်များ' : 'The Algorithm'}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{lang === 'mm' ? 'ဇာတာတွက်ချက်မှုများ၏ နောက်ကွယ်မှကိန်းအောင်းနေသော သင်္ချာဖော်မြူလာများနှင့် ကုဒ်များ — Julian Day မှ Ashtakavarga အထိ။' : 'The math & code behind the charts — from Julian Day to Ashtakavarga.'}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] text-accent-light transition group-hover:gap-2.5">{lang === 'mm' ? 'အသေးစိတ်ကြည့်ရှုရန်' : 'Explore'} <ArrowRight size={13} /></span>
            </div>
          </div>
        </Link>

        {/* Portal 2 — Falsifiable research protocol */}
        <Link to="/research"
          className="group relative overflow-hidden rounded-2xl border border-jade/25 bg-gradient-to-br from-jade/[0.12] via-card to-accent/[0.06] p-6 transition duration-300 hover:border-jade/50 hover:shadow-[0_0_44px_-10px_rgba(52,211,153,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-jade/60">
          <span aria-hidden className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-jade/20 blur-3xl transition duration-500 group-hover:bg-jade/30" />
          <div className="relative flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-jade/40 bg-jade/15 text-jade shadow-inner">
              <FlaskConical size={22} />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-jade">{lang === 'mm' ? 'သိပ္ပံနည်းကျကျ ရိုးသားမှု' : 'Honest Science'}</p>
              <h3 className="mt-1 font-groovy text-xl text-fg">{lang === 'mm' ? 'တိုင်းတာနိုင်သော သုတေသနပြုချက်' : 'Falsifiable Research'}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{lang === 'mm' ? 'ကြိုတင်မှတ်တမ်း၊ base rate၊ permutation test — ဟောကြားချက်ကို တိုင်းတာနိုင်သည်။' : 'Pre-registration, base rates, permutation tests — we measure claims, not boast them.'}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] text-jade transition group-hover:gap-2.5">{lang === 'mm' ? 'လုပ်ထုံးလုပ်နည်းများ ကြည့်ရန်' : 'View protocol'} <ArrowRight size={13} /></span>
            </div>
          </div>
        </Link>
      </div>

      {/* ── Customer account (sign in / saved charts) ── */}
      <div className="mb-6">
        <CustomerPanel ref={customerPanelRef} lang={lang} onAuthChange={setCustomerToken} onLoadChart={loadSavedChart} onProfileSaved={refreshProfile} />
      </div>

      {/* ── Registered dashboard banner (Emerald/Mint + Deep Purple) ── */}
      {showDashboard && profile && (
        <div className="relative mb-6 overflow-hidden rounded-3xl border p-6 sm:p-8 no-print"
          style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.34) 0%, rgba(15,12,26,0.94) 46%, rgba(124,58,237,0.44) 100%)', borderColor: 'rgba(234,179,8,0.4)', boxShadow: '0 0 70px -20px rgba(16,185,129,0.4), 0 0 60px -22px rgba(234,179,8,0.35)' }}>
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-40 blur-3xl" style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }} />
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full opacity-40 blur-3xl" style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-emerald-200"><Sparkles size={14} className="text-amber-300" /> {lang === 'mm' ? 'သင့်ကိုယ်ပိုင် ဇာတာ ဟောစာတမ်းများကို ကြည့်ရှုရန် Dashboard' : 'Your personal Vedin dashboard'}</p>
              <h2 className="mt-2 font-groovy text-2xl text-white sm:text-3xl">
                {lang === 'mm' ? `ကြိုဆိုပါတယ်၊ ${profile.username} ` : `Welcome to your personal Vedin dashboard, ${profile.username} `}
                {ageLabel(profile.dob) && <span className="text-xl text-amber-300 sm:text-2xl">{ageLabel(profile.dob)}</span>}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2 font-mono text-[11px]">
                {profile.dob && <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-1 text-emerald-100"><Cake size={12} /> {profile.dob}{profile.birthTime ? ` · ${profile.birthTime}` : ''}</span>}
                {profile.locationName && <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/40 bg-violet-500/15 px-2.5 py-1 text-violet-100"><MapPin size={12} /> {profile.locationName}</span>}
                {profile.gender && <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-white/80">{profile.gender === 'female' ? (lang === 'mm' ? 'မ' : 'Female') : (lang === 'mm' ? 'ကျား' : 'Male')}</span>}
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 self-start sm:items-end">
              <button type="button" onClick={() => customerPanelRef.current?.openProfileEdit()}
                className="inline-flex items-center gap-2 rounded-xl border border-jade/40 bg-jade/15 px-4 py-2.5 text-sm font-semibold text-jade transition hover:bg-jade/25">
                <Pencil size={15} /> {lang === 'mm' ? 'ပရိုဖိုင် ပြင်ရန်' : 'Edit Profile'}
              </button>
              <button type="button" onClick={startCalcForOther}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-fg transition hover:bg-white/20">
                <Search size={15} /> {lang === 'mm' ? 'အခြားသူအတွက် တွက်ရန်' : 'Calculate for someone else'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Intro: Chandra Lagna + Instructions ── */}
      {!showDashboard && (
        <div className="mb-6 grid gap-4 md:grid-cols-2 no-print">
          <div className="glass-card p-5">
            <h2 className="mb-2 flex items-center gap-2 font-groovy text-base text-fg"><Star size={16} className="text-accent" /> {t.chandraTitle}</h2>
            <p className="text-sm leading-relaxed text-muted">{t.chandra}</p>
          </div>
          <div className="glass-card p-5">
            <h2 className="mb-2 flex items-center gap-2 font-groovy text-base text-fg"><Info size={16} className="text-accent" /> {t.instrTitle}</h2>
            <ul className="space-y-1.5 text-sm text-muted">
              {[t.instr1, t.instr2, t.instr3].map((s, i) => (
                <li key={i} className="flex gap-2"><span className="mt-0.5 text-accent-light">•</span><span className="leading-relaxed">{s}</span></li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Back to dashboard (while calculating for someone else) */}
        {customerToken && profile?.hasProfile && otherMode && (
          <button type="button" onClick={backToDashboard}
            className="no-print inline-flex items-center gap-1.5 rounded-full border border-jade/30 bg-jade/10 px-4 py-2 font-mono text-xs text-jade transition hover:bg-jade/20">
            ← {lang === 'mm' ? 'ကျွန်ုပ်၏ Dashboard သို့ ပြန်သွားရန်' : 'Back to my dashboard'}
          </button>
        )}

        {!showDashboard && (<>
          {/* Fallback prompt — signed in but no saved birth profile */}
          {customerToken && profile && !profile.hasProfile && !otherMode && (
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 rounded-2xl border border-accent/30 bg-accent/10 px-5 py-4 text-sm leading-relaxed text-accent-light no-print sm:flex-row sm:items-center sm:justify-between">
              <span>{lang === 'mm' ? 'သင့်အကောင့်တွင် မွေးဇာတာ ပရိုဖိုင် မရှိသေးပါ။ ပရိုဖိုင် ထည့်ပါ (သို့) အောက်ရှိ ဖောင်တွင် ဖြည့်ပါ။' : 'Your account has no birth profile yet — add one, or use the form below.'}</span>
              <button type="button" onClick={() => customerPanelRef.current?.openProfileEdit()}
                className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-gradient-to-r from-accent to-violet-500 px-4 py-2 text-sm font-semibold text-space transition hover:brightness-110 sm:self-auto">
                <Pencil size={15} /> {lang === 'mm' ? 'ပရိုဖိုင် ထည့်ရန်' : 'Add Profile'}
              </button>
            </div>
          )}
          {/* ── How to use (accordion) + form title ── */}
          <div className="mx-auto w-full max-w-3xl no-print">
            <div className="overflow-hidden rounded-2xl border border-accent/25 bg-accent/[0.05]">
              <button type="button" onClick={() => setHowtoOpen((o) => !o)} aria-expanded={howtoOpen}
                className="flex w-full items-center justify-between gap-2 px-5 py-3.5 text-left transition hover:bg-accent/[0.08]">
                <span className="flex items-center gap-2 font-groovy text-base text-fg"><Info size={16} className="text-accent" /> {lang === 'mm' ? 'အသုံးပြုနည်း' : 'How to use'}</span>
                <ChevronDown size={18} className={`shrink-0 text-accent-light transition-transform ${howtoOpen ? 'rotate-180' : ''}`} />
              </button>
              {howtoOpen && (
                <ol className={`space-y-3.5 border-t border-accent/15 px-4 py-4 text-sm text-muted sm:px-5 ${lang === 'mm' ? 'leading-loose' : 'leading-relaxed'}`}>
                  {(lang === 'mm'
                    ? [
                      'ဇာတာအသေးစိတ် တွက်ချက်ရန် အတွက် အရင်ဦးစွာ ကိုယ်ပိုင်အကောင့်ဖွင့်ပါ။',
                      'အသေးစိတ်ဟောစာတမ်းကို တွက်ချက်နိုင်ရန် မွေးသက္ကရာဇ် နှင့် သက်ဆိုင်ရာ အချက်အလက်များကို ဖြည့်သွင်းပါ။',
                      '"အသေးစိတ် ဟောစာတမ်းများ" နေရာမှတစ်ဆင့် ဆရာ့ထံသို့ တောင်းဆိုမှု ပြုလုပ်ပါ။',
                      'ဆရာမှ အတည်ပြု (Approve) ပြီးပါက ဟောစာတမ်းဖတ်ရှုနိုင်ပြီး PDF ရယူနိုင်ပါသည်။',
                    ]
                    : [
                      'First, create your own account.',
                      'Fill in your birth date and related details to calculate your detailed reading.',
                      'Submit a request to the Sayar from the “Detailed Reading” tab.',
                      'Once the Sayar approves, you can read the reading and get the PDF.',
                    ]
                  ).map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/20 font-mono text-[11px] font-semibold text-accent-light">{i + 1}</span>
                      <span className="min-w-0 flex-1 break-words">{step}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
            <h2 className="mt-6 text-center font-groovy text-lg text-fg sm:text-xl">
              {lang === 'mm' ? 'မိမိရဲ့ မွေးဇာတာစစ်ဆေးရန် အချက်အလက်များကို အပြည့်အစုံဖြည့်သွင်းပါ' : 'Enter your birth details to check your chart'}
            </h2>
          </div>

          {/* ── Form (centered on top; results span the full page below) ── */}
          <form onSubmit={submit} className="glass-card mx-auto w-full max-w-3xl p-6 no-print">
            <div className="mb-3 grid grid-cols-2 gap-3">
              <label><span className={labelCls}>{t.fldName} <span className="text-coral">*</span></span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder={lang === 'mm' ? 'အမည်' : 'Full name'}
                  className={`${field} ${!name.trim() ? 'border-coral/40' : ''}`} /></label>
              <label><span className={labelCls}>{t.fldGender}</span>
                <select value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female')} className={field}>
                  <option value="male" className="text-black">{t.male}</option>
                  <option value="female" className="text-black">{t.female}</option>
                </select></label>
            </div>
            <label className="relative block">
              <span className={labelCls}>{lang === 'mm' ? 'မွေးဖွားရာ မြို့/ဇာတိ' : 'Birth place'} <span className="text-coral">*</span></span>
              <span className="relative mt-1.5 block">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input value={place} onChange={(e) => onPlaceChange(e.target.value)} placeholder={lang === 'mm' ? 'မြို့ ရှာရန်…' : 'Search a city…'}
                  className={`w-full rounded-xl border bg-white/5 py-2.5 pl-9 pr-8 text-sm text-fg outline-none transition focus:border-accent/50 ${placeConfirmed ? 'border-jade/50' : 'border-coral/40'}`} />
                {searching
                  ? <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted" />
                  : placeConfirmed && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-jade">✓</span>}
              </span>
              {!placeConfirmed && place.trim().length > 0 && !searching && (
                <span className="mt-1 block font-mono text-[10px] text-coral">{lang === 'mm' ? 'စာရင်းထဲမှ မြို့တစ်ခုကို ရွေးချယ်ပါ။' : 'Pick a city from the list.'}</span>
              )}
              {results.length > 0 && (
                <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-white/15 bg-surface/95 backdrop-blur-md">
                  {results.map((g, i) => (
                    <li key={i}><button type="button" onClick={() => selectPlace(g)}
                      className="block w-full px-3 py-2 text-left text-xs text-fg/90 transition hover:bg-accent/15">{g.display_name}</button></li>
                  ))}
                </ul>
              )}
            </label>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <label><span className={labelCls}>Date of birth</span>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={field} /></label>
              <label><span className={labelCls}>Time (24h)</span>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className={field} /></label>
              <label><span className={labelCls}>Latitude</span>
                <input type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} required className={field} /></label>
              <label><span className={labelCls}>Longitude</span>
                <input type="number" step="any" value={lon} onChange={(e) => setLon(e.target.value)} required className={field} /></label>
            </div>
            <label className="mt-3 block"><span className={labelCls}>Time zone</span>
              <select value={tz} onChange={(e) => setTz(e.target.value)} className={field}>
                {[...new Set([tz, ...TZ_OPTIONS])].map((z) => <option key={z} value={z} className="text-black">{z}</option>)}
              </select>
            </label>
            <label className="mt-3 block"><span className={labelCls}>{lang === 'mm' ? 'အယနန္သ (Ayanamsa)' : 'Ayanamsa'}</span>
              <select value={ayanamsa} onChange={(e) => setAyanamsa(e.target.value)} className={field}>
                <option value="lahiri" className="text-black">Lahiri (default)</option>
                <option value="raman" className="text-black">Raman</option>
                <option value="kp" className="text-black">KP (Krishnamurti)</option>
                <option value="truechitra" className="text-black">True Chitra</option>
              </select>
            </label>

            <div className="mt-4">
              <span className={labelCls}>Quick locations</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button key={p.label} type="button" onClick={() => applyPreset(p)}
                    className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-muted transition hover:border-accent/40 hover:text-fg">
                    <MapPin size={11} /> {p.label}
                  </button>
                ))}
              </div>
            </div>

            <label className={`mt-4 flex items-start gap-2 rounded-xl border p-3 text-xs leading-relaxed transition ${consent ? 'border-jade/40 bg-jade/5 text-muted' : 'border-coral/40 bg-coral/5 text-fg/80'}`}>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-accent" />
              <span><span className="text-coral">*</span> {lang === 'mm' ? 'အနာဂါတ်ဟောကိန်းများပိုမိုတိကျမှန်ကန်စွာ အထောက်အကူအတွက် ကျွန်ုပ်၏ မွေးဇာတာ အချက်အလက်ကို လုံခြုံစွာ သိမ်းဆည်းရန် သဘောတူပါသည်။' : "I consent to securely storing my birth details to assist the future astrologer's readings."}</span>
            </label>

            <button type="submit" disabled={loading || !canSubmit}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-violet-500 px-5 py-3 text-sm font-semibold text-space shadow-lg shadow-accent/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none">
              {loading ? <><Loader2 size={16} className="animate-spin" /> {lang === 'mm' ? 'တွက်ချက်ပေးနေပါသည်…' : 'Calculating…'}</> : <><Sparkles size={16} /> {lang === 'mm' ? 'ဇာတာ တွက်မည်' : 'Generate Chart'}</>}
            </button>
            {!canSubmit && (
              <ul className="mt-2 space-y-1">
                {!name.trim() && <li className="flex items-start gap-1.5 font-mono text-[11px] leading-relaxed text-coral"><span>•</span>{lang === 'mm' ? 'အမည် ဖြည့်သွင်းပါ။' : 'Please enter a name.'}</li>}
                {!placeConfirmed && <li className="flex items-start gap-1.5 font-mono text-[11px] leading-relaxed text-coral"><span>•</span>{lang === 'mm' ? 'မွေးဖွားရာ မြို့/ဇာတိကို ရှာဖွေ၍ စာရင်းထဲမှ ရွေးချယ်ပါ။' : 'Search and select your birth city from the list.'}</li>}
                {!consent && <li className="flex items-start gap-1.5 font-mono text-[11px] leading-relaxed text-coral"><span>•</span>{lang === 'mm' ? 'အချက်အလက်သိမ်းဆည်းခွင့်ကို သဘောတူညီပေးပါ။' : 'Please agree to the data-storage consent.'}</li>}
              </ul>
            )}
            {error && <p className="mt-3 rounded-xl border border-coral/40 bg-coral/10 px-3 py-2 font-mono text-xs text-coral">{error}</p>}
            <p className="mt-4 font-mono text-[10px] leading-relaxed text-muted">{t.disclaimer}</p>
          </form>
        </>)}

        {/* ── Result ── */}
        <div className="min-w-0">
          {!data && !loading && (
            <div className="glass-card flex min-h-[300px] items-center justify-center p-8 text-center text-sm text-muted no-print">
              {lang === 'mm' ? 'မွေးသက္ကာရာဇ်နှင့်အချက်အလက်ထည့်၍ ဟောစာတမ်း၊ ဇာတာခွင်များ (D1/D9/D10/D7) ကြည့်ရှုပါ။' : 'Enter birth details to see the reading and the D1 / D9 / D10 / D7 charts.'}
            </div>
          )}

          {data && reading && (
            <div className="min-w-0 space-y-5">
              {/* header + full-reading PDF download */}
              <div className="flex flex-col gap-3 no-print sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-groovy text-lg text-fg">{place || t.portalTitle}</h2>
                <button type="button" onClick={downloadPdf}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-violet-500 px-4 py-2 text-xs font-semibold text-space shadow-lg shadow-accent/25 transition hover:brightness-110">
                  <Download size={14} /> {lang === 'mm' ? 'မွေးဇာတာ ဟောစာတမ်း PDF အပြည့်အစုံ ရယူရန်တောင်းဆိုပါ' : 'Download Full Natal Chart PDF'}
                </button>
              </div>
              <div className="no-print sticky top-14 z-30 -mx-1 border-b border-accent/20 px-1 py-2.5 backdrop-blur-md sm:top-16"
                style={{ background: 'rgb(var(--space) / 0.85)' }}>
                <div className="flex items-center gap-2">
                  <div className="no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto whitespace-nowrap py-0.5">
                    {TABS.map((tb) => {
                      const active = tab === tb.id
                      // Active tabs are unmistakable: larger, bold, raised, strongly
                      // coloured, scaled up. Inactive tabs are faded to maximise contrast.
                      if (tb.variant === 'main') return (
                        <button key={tb.id} type="button" onClick={() => setTab(tb.id)}
                          className={`flex shrink-0 items-center gap-1.5 rounded-full border-2 font-groovy transition-all duration-200 ${active
                            ? 'scale-105 border-amber-300 bg-gradient-to-r from-amber-500 to-yellow-400 px-6 py-2.5 text-lg font-bold text-white shadow-lg shadow-amber-500/40 dark:text-amber-950'
                            : 'border-amber-400/40 bg-amber-400/5 px-5 py-2 text-sm font-medium text-amber-700/70 opacity-70 hover:opacity-100 dark:text-amber-200/70'}`}>
                          <ScrollText size={active ? 18 : 15} /> {tb.label}
                        </button>
                      )
                      if (tb.variant === 'ashtaka' || tb.variant === 'shadbala') {
                        const grad = tb.variant === 'ashtaka'
                          ? (active ? 'from-indigo-500 to-blue-600 shadow-indigo-500/40' : 'from-indigo-400/20 to-blue-500/10')
                          : (active ? 'from-rose-500 to-pink-600 shadow-rose-500/40' : 'from-rose-400/20 to-pink-500/10')
                        const faded = tb.variant === 'ashtaka' ? 'text-indigo-700/70 dark:text-indigo-200/70' : 'text-rose-700/70 dark:text-rose-200/70'
                        return (
                          <button key={tb.id} type="button" onClick={() => setTab(tb.id)}
                            className={`shrink-0 rounded-full border bg-gradient-to-r font-groovy transition-all duration-200 ${active
                              ? `scale-105 border-white/25 px-6 py-2.5 text-lg font-bold text-white shadow-lg ${grad}`
                              : `border-white/10 px-5 py-2 text-sm font-medium opacity-70 hover:opacity-100 ${grad} ${faded}`}`}>
                            {tb.label}
                          </button>
                        )
                      }
                      return (
                        <button key={tb.id} type="button" onClick={() => setTab(tb.id)}
                          className={`shrink-0 rounded-full border font-groovy transition-all duration-200 ${active
                            ? 'scale-105 border-amber-300 bg-gradient-to-r from-amber-500 to-yellow-400 px-6 py-2.5 text-lg font-bold text-white shadow-lg shadow-amber-500/40 dark:text-amber-950'
                            : 'border-white/12 bg-white/5 px-5 py-2 text-sm font-medium text-muted opacity-70 hover:opacity-100 hover:text-fg'}`}>
                          {tb.label}
                        </button>
                      )
                    })}
                  </div>
                  {(tab === 'd1' || tab === 'vargas') && (
                    <div className="flex shrink-0 items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1">
                      {(['diamond', 'grid'] as ChartStyle[]).map((s) => (
                        <button key={s} type="button" onClick={() => setChartStyle(s)}
                          className={`rounded-full px-2.5 py-1 font-mono text-[11px] transition ${chartStyle === s ? 'bg-accent/70 text-space' : 'text-muted hover:text-fg'}`}>
                          {s === 'diamond' ? (lang === 'mm' ? 'စိန်ပုံစံ' : 'Diamond') : (lang === 'mm' ? 'ဇယားကွက်ပုံစံ' : 'Grid')}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── DETAILED READING (manual-approval workflow) ── */}
              {(tab === 'ai' || printAll) && (
                <div className="space-y-5">
                  {/* Auth gate — a reading can only be requested by a signed-in account */}
                  {!customerToken && (reqStatus === 'none' || reqStatus === 'rejected') && (
                    <div className="relative overflow-hidden rounded-2xl border border-accent/35 p-6 sm:p-8 no-print text-center"
                      style={{ background: 'linear-gradient(135deg, rgb(var(--card)), rgb(var(--surface)))', boxShadow: '0 0 50px -20px rgb(var(--accent) / 0.5)' }}>
                      <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full opacity-25 blur-3xl" style={{ background: 'radial-gradient(circle, rgb(var(--accent)) 0%, transparent 70%)' }} />
                      <div className="relative flex flex-col items-center gap-3">
                        <span className="grid h-14 w-14 place-items-center rounded-full border border-accent/40 bg-accent/15 text-accent-light"><Lock size={24} /></span>
                        <h3 className="font-groovy text-xl text-fg">{lang === 'mm' ? 'အကောင့် ဖွင့်ထားရန် လိုအပ်ပါသည်' : 'An account is required'}</h3>
                        <p className="max-w-xl text-sm leading-relaxed text-muted">{lang === 'mm'
                          ? 'ဟောစာတမ်းအပြည့်အစုံကို ရယူရန်နှင့် သင့်ဇာတာများ မှတ်သားထားရန် အကောင့် (Account) ဖွင့်ထားရန် လိုအပ်ပါသည်။'
                          : 'To get the full reading and to save your charts, you need to have an account.'}</p>
                        <button type="button" onClick={() => openAuth('signup')}
                          className="mt-1 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent via-violet-500 to-jade px-5 py-3 text-sm font-semibold text-space shadow-lg shadow-accent/30 transition hover:brightness-110">
                          <UserPlus size={16} /> {lang === 'mm' ? 'အကောင့်ဖွင့် / ဝင်ရန်' : 'Sign Up / Log In'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Request card — signed-in, no active/approved request */}
                  {customerToken && (reqStatus === 'none' || reqStatus === 'rejected') && (
                    <div className="relative overflow-hidden rounded-2xl border border-accent/30 p-6 no-print"
                      style={{ background: 'linear-gradient(135deg, rgb(var(--card)), rgb(var(--surface)))', boxShadow: '0 0 50px -18px rgb(var(--accent) / 0.5)' }}>
                      <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, rgb(var(--accent)) 0%, transparent 70%)' }} />
                      <div className="relative">
                        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-accent-light"><ScrollText size={15} /> {lang === 'mm' ? 'အသေးစိတ် ဟောစာတမ်း' : 'Detailed Reading'}</p>
                        <h3 className="mt-2 font-groovy text-xl text-fg">{lang === 'mm' ? 'သင့်ဇာတာအတွက် ဆရာ ကိုယ်တိုင် စစ်ဆေးသော ဟောစာတမ်း' : 'A reading personally reviewed by the Sayar'}</h3>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{lang === 'mm'
                          ? 'သင့်ဇာတာအား ဂန္ထဝင် ဇျောတိသ သင်္ချာနည်းစနစ်များဖြင့် တိကျစွာ တွက်ချက်ပြီးနောက်၊ ဘဝကဏ္ဍ ၇ ရပ် အပြည့်အစုံ ဟောစာတမ်းအပြည့်အစုံကို ရေးသားပေးပါမည်။'
                          : 'Your chart is computed precisely with classical Vedic astrology formulas, verified and approved to get full details before your full 7-life-area reading is written.'}</p>
                        <button type="button" onClick={requestReading} disabled={reqLoading}
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent via-violet-500 to-jade px-5 py-3 text-sm font-semibold text-space shadow-lg shadow-accent/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
                          {reqLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                          {reqLoading
                            ? (lang === 'mm' ? 'ပေးပို့နေသည်…' : 'Sending…')
                            : showDashboard
                              ? (lang === 'mm' ? 'ကျွန်ုပ်၏ ပရိုဖိုင်ဖြင့် ဟောစာတမ်း တောင်းဆိုရန်' : 'Request Reading based on my profile')
                              : (lang === 'mm' ? 'ဆရာ ကိုဘုန်းမင်းသိုက်ဒင်ထံမှ ဟောစာတမ်းအပြည့်အစုံ တောင်းဆိုရန်' : 'Request Full Reading from the Sayar')}
                        </button>
                        <p className="mt-2 font-mono text-[11px] text-muted">{lang === 'mm' ? 'တစ်လလျှင် တစ်ကြိမ် တောင်းဆိုနိုင်ပါသည်။' : 'One request per month.'}</p>
                      </div>
                    </div>
                  )}

                  {reqError && <div className="rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral no-print">{reqError}</div>}
                  {reqInfo && <div className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent-light no-print">{reqInfo}</div>}

                  {/* Pending — awaiting the Sayar's approval */}
                  {reqStatus === 'pending' && (
                    <div className="relative overflow-hidden rounded-2xl border border-accent/30 p-6 sm:p-8 no-print"
                      style={{ background: 'linear-gradient(135deg, rgb(var(--card)), rgb(var(--surface)))', boxShadow: '0 0 50px -20px rgb(var(--accent) / 0.5)' }}>
                      <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full opacity-25 blur-3xl" style={{ background: 'radial-gradient(circle, rgb(var(--accent)) 0%, transparent 70%)' }} />
                      <div className="relative flex flex-col items-center gap-3 text-center">
                        <span className="grid h-14 w-14 place-items-center rounded-full border border-accent/40 bg-accent/15 text-accent-light">
                          <Clock size={26} className="animate-pulse" />
                        </span>
                        <h3 className="font-groovy text-xl text-fg">{lang === 'mm' ? 'ဆရာမှ စစ်ဆေးနေပါသည်' : 'Awaiting the Sayar’s review'}</h3>
                        <p className="max-w-xl text-sm leading-relaxed text-muted">{lang === 'mm'
                          ? 'ဆရာမှ သင့်ဇာတာအား အသေးစိတ် စစ်ဆေးနေပါသည်။ အတည်ပြုပြီးပါက ဟောစာတမ်းအပြည့်အစုံကို ဤနေရာတွင် ပြန်လည် ဝင်ရောက်ကြည့်ရှုနိုင်ပါသည်။ ခဏ စောင့်ဆိုင်းပေးပါ။'
                          : 'The Sayar is personally reviewing your chart. Once approved, your full reading will appear here — please check back shortly.'}</p>
                        <span className="mt-1 rounded-full bg-accent/15 px-3 py-1 font-mono text-[11px] text-accent-light">{lang === 'mm' ? 'အခြေအနေ — စစ်ဆေးဆဲ' : 'Status — Pending'}</span>
                      </div>
                    </div>
                  )}

                  {/* Approved — majestic success banner + critical refresh warning */}
                  {reqStatus === 'approved' && (
                    <div className="no-print space-y-2.5">
                      <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400/60 p-4 text-center sm:p-5"
                        style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.24) 0%, rgba(234,179,8,0.24) 100%)', boxShadow: '0 0 46px -10px rgba(234,179,8,0.55)' }}>
                        <p className="flex flex-wrap items-center justify-center gap-2 font-groovy text-lg text-fg sm:text-xl">
                          <CheckCircle2 size={22} className="text-emerald-500" />
                          {lang === 'mm' ? 'ဆရာမှ သင့်ဟောစာတမ်းကို အတည်ပြုပြီးပါပြီ။' : 'The Sayar has approved your reading.'}
                        </p>
                      </div>
                      <p className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-rose-400/50 bg-rose-500/10 px-4 py-2.5 text-center text-sm font-bold text-rose-600 dark:text-rose-300">
                        <AlertTriangle size={16} className="shrink-0" /> ဟောစာတမ်း အပြည့်အစုံကို ဖတ်ရှုရန် Page ကို Refresh (ပြန်လည်ဆွဲချ) လုပ်ပေးပါရန်။
                      </p>
                    </div>
                  )}

                  {/* Approved — the finished reading (printable) */}
                  {reqStatus === 'approved' && reqMarkdown && (
                    <div className="relative overflow-hidden rounded-2xl border border-accent/35 p-6 sm:p-8"
                      style={{ background: 'linear-gradient(160deg, rgb(var(--card)) 0%, rgb(var(--surface)) 100%)', boxShadow: '0 0 60px -20px rgb(var(--accent) / 0.55), inset 0 1px 0 rgb(255 255 255 / 0.05)' }}>
                      <div className="pointer-events-none absolute -left-16 -bottom-20 h-56 w-56 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, rgb(var(--jade)) 0%, transparent 70%)' }} />
                      <div className="relative">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-accent-light"><ScrollText size={14} /> {lang === 'mm' ? 'အသေးစိတ် ဟောစာတမ်း' : 'Detailed Reading'}</p>
                          <span className="inline-flex items-center gap-1 rounded-full bg-jade/15 px-2.5 py-0.5 font-mono text-[10px] text-jade no-print"><CheckCircle2 size={11} /> {lang === 'mm' ? 'ဆရာ အတည်ပြုပြီး' : 'Approved by the Sayar'}</span>
                        </div>
                        <div ref={readingRef}><MarkdownView markdown={reqMarkdown} /></div>
                        <p className="mt-5 border-t border-white/10 pt-3 text-[11px] leading-relaxed text-muted">{lang === 'mm'
                          ? 'ဤဟောစာတမ်းအား ဂန္ထဝင် ဇျောတိသ သင်္ချာနည်းစနစ်များဖြင့် တိကျစွာ တွက်ချက်ထားပါသည်။သို့သော်လည်း ရလဒ်များမှာ မိမိကိုယ်တိုင် ပြန်လည်ဆင်ခြင်သုံးသပ်ရန်အတွက် လမ်းညွှန်ချက်များသာဖြစ်ပါသည်။'
                          : 'This reading was computed with classical Vedic astrology formulas and personally according to system.But The interpretations are guidance for self-reflection.'}</p>

                        {/* Direct client-side PDF download (logged-in users only) */}
                        <div className="mt-5 no-print">
                          {customerToken ? (
                            <button type="button" onClick={downloadReadingPdf}
                              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent via-violet-500 to-jade px-5 py-3 text-sm font-semibold text-space shadow-lg shadow-accent/30 transition hover:brightness-110">
                              <Download size={16} /> {lang === 'mm' ? 'မွေးဇာတာ ဟောစာတမ်း PDF အပြည့်အစုံ Download ဆွဲရန်' : 'Download Full Reading PDF'}
                            </button>
                          ) : (
                            <div className="flex flex-col items-start gap-2">
                              <p className="text-[13px] leading-relaxed text-muted">{lang === 'mm' ? 'PDF ဒေါင်းလုဒ်ရယူရန် အကောင့်ဝင်ရန် လိုအပ်ပါသည်။' : 'Log in to download the PDF.'}</p>
                              <button type="button" onClick={() => openAuth('login')}
                                className="inline-flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent-light transition hover:bg-accent/20">
                                <Lock size={15} /> {lang === 'mm' ? 'အကောင့်ဝင်ရန်' : 'Log In'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── READING ── */}
              {(tab === 'reading' || printAll) && (
                <div className="space-y-5">
                  {querent && (querent.name || querent.nn) && (
                    <div className="glass-card p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className={labelCls}>{t.querentFor}</p>
                          <h3 className="font-groovy text-lg text-fg">
                            {querent.name || '—'}
                            {querent.name && <span className="ml-2 font-mono text-xs text-accent-light">{t[querent.gender]}</span>}
                          </h3>
                        </div>
                        {querent.nn && (
                          <div className="text-right">
                            <p className={labelCls}>{t.naynanLabel}</p>
                            <p className="text-lg font-semibold text-accent-light">
                              {lang === 'mm' ? `${querent.nn.mmDay} · နံ ${toMmDigits(querent.nn.num)}` : `${querent.nn.enDay} · No. ${querent.nn.num}`}
                              <span className="ml-2 font-mono text-xs text-muted">{planetName(querent.nn.planet, lang)}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="glass-card p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-groovy text-lg text-fg">{t.currentDasha}</h3>
                      <span className="rounded-full bg-accent/15 px-3 py-1 text-sm font-semibold text-accent-light">{planetName(reading.lord, lang)}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted">{t.readingNote}</p>
                  </div>

                  {/* Seven-area overview: radar chart + score bars */}
                  <div className="glass-card p-5">
                    <h3 className="mb-3 font-groovy text-lg text-fg">{lang === 'mm' ? 'ဘဝကဏ္ဍ ၇ ခု' : 'Seven Life Areas'}</h3>
                    <div className="grid gap-5 md:grid-cols-2 md:items-center">
                      <AreaRadar areas={reading.areas} />
                      <ul className="space-y-2.5">
                        {reading.areas.map((a, i) => (
                          <li key={a.key} className="flex items-center gap-2.5">
                            <span className="w-4 shrink-0 font-mono text-[10px] text-muted">{i + 1}</span>
                            <span className="w-24 shrink-0 truncate text-xs text-fg/90 sm:w-32" title={a.label}>{a.label}</span>
                            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                              <span className="block h-full rounded-full" style={{ width: `${Math.max(a.score, 4)}%`, background: barColor(a.tone) }} />
                            </span>
                            <span className="w-6 shrink-0 text-right font-mono text-[10px] text-muted">{a.score}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Per-area deep-dive — three across (natal + current transits) */}
                  <div className="space-y-3">
                    <h3 className="font-groovy text-lg text-fg">{t.lifeAreas}</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {reading.areas.map((a) => {
                        const lp = a.lord ? findPlanet(data, a.lord) : undefined
                        const cur = currentAreaEffect(data, a.key, lang)
                        const needsRemedy = a.tone === 'testing' || cur?.tone === 'warn'
                        return (
                          <div key={a.key} className={`glass-card flex flex-col border-l-4 p-5 ${a.tone === 'favorable' ? 'border-l-jade' : a.tone === 'testing' ? 'border-l-coral' : 'border-l-white/20'}`}>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h4 className="font-groovy text-base text-fg">{a.label}</h4>
                              <span className="font-mono text-xs"><span className="text-accent-light">{'★'.repeat(a.stars)}</span><span className="text-muted">{'☆'.repeat(5 - a.stars)}</span> <span className="text-muted">{a.score}/100</span></span>
                            </div>
                            <span className="mt-2 block h-1.5 w-full overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full" style={{ width: `${Math.max(a.score, 4)}%`, background: barColor(a.tone) }} /></span>

                            {lp && (
                              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                                  <p className={labelCls}>{lang === 'mm' ? 'အိမ်ရှင်သခင်' : 'House lord'}</p>
                                  <p className="mt-0.5 text-sm text-fg/90">{planetName(lp.name, lang)} · {signLabel(lp.sign, lang)} <span className="text-muted">({lang === 'mm' ? `${lp.house} တန့်` : `H${lp.house}`})</span></p>
                                  {lp.dignity !== '-' && <p className="text-[11px] text-accent-light">{dignityLabel(lp.dignity, lang)}</p>}
                                </div>
                                <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                                  <p className={labelCls}>{lang === 'mm' ? 'D9 နဝင်း' : 'D9 Navamsa'}</p>
                                  <p className="mt-0.5 text-sm text-fg/90">{signLabel(lp.navamsaSign, lang)}</p>
                                </div>
                                <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                                  <p className={labelCls}>{lang === 'mm' ? 'D10 ဒသံသ' : 'D10 Dasamsa'}</p>
                                  <p className="mt-0.5 text-sm text-fg/90">{signLabel(lp.vargas.D10, lang)}</p>
                                </div>
                              </div>
                            )}

                            {a.karakas.length > 0 && (
                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <span className={labelCls}>{lang === 'mm' ? 'ကာရက' : 'Karakas'}:</span>
                                {a.karakas.map((k) => {
                                  const kp = findPlanet(data, k)
                                  return kp ? (
                                    <span key={k} className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-fg/80">
                                      {planetName(kp.name, lang)} · {signLabel(kp.sign, lang)}{kp.dignity !== '-' && <span className="text-accent-light"> · {dignityLabel(kp.dignity, lang)}</span>}
                                    </span>
                                  ) : null
                                })}
                              </div>
                            )}

                            {cur && (
                              <div className={`mt-3 rounded-lg border px-3 py-2 text-xs leading-relaxed ${cur.tone === 'good' ? 'border-jade/40 bg-jade/10 text-jade' : cur.tone === 'warn' ? 'border-coral/40 bg-coral/10 text-coral' : 'border-white/10 bg-white/[0.03] text-muted'}`}>
                                <span className="font-semibold">{lang === 'mm' ? 'လက်ရှိကာလ၏ သက်ရောက်မှုများ' : 'Current period'}: </span>{cur.text}
                              </div>
                            )}

                            <ul className="mt-3 space-y-1">
                              {a.points.map((pt, i) => <li key={i} className="text-xs leading-relaxed text-muted">• {pt}</li>)}
                            </ul>

                            {needsRemedy && (
                              <button type="button" onClick={() => openRemedy(a.label)}
                                className="no-print mt-3 inline-flex items-center gap-1.5 self-start rounded-full border border-coral/40 bg-coral/10 px-3 py-1.5 text-xs text-coral transition hover:bg-coral/20">
                                <Sparkles size={12} /> {lang === 'mm' ? 'ဤကဏ္ဍအတွက် ယတြာ တောင်းယူရန်' : 'Request a remedy for this area'}
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {data.yogas.length > 0 && (
                    <div className="glass-card p-5">
                      <h3 className="mb-3 font-groovy text-lg text-fg">{lang === 'mm' ? 'ဇာတာတွင် တွေ့ရတတ်သော ယောဂများ' : 'Yogas in your chart'}</h3>
                      <ul className="space-y-2.5">
                        {data.yogas.map((y) => (
                          <li key={y.name} className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                            <div className="flex items-center gap-2"><span className="font-semibold text-accent-light">{y.name}</span>
                              <span className="font-mono text-[10px] text-muted">{y.planets.map((n) => planetName(n, lang)).join(' · ')}</span></div>
                            <p className="mt-1 text-xs leading-relaxed text-muted">{yogaText(y.name, lang) || y.description}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Educational: what the yogas mean (incl. Neecha Bhanga Raja Yoga) */}
                  <div className="glass-card p-5">
                    <h3 className="mb-1 font-groovy text-base text-fg">{lang === 'mm' ? 'ယောဂများ အကြောင်း အသေးစိတ်ဖတ်ရှုရန်' : 'About Yogas'}</h3>
                    <p className="mb-3 text-xs leading-relaxed text-muted">{lang === 'mm' ? 'ယောဂဆိုသည်မှာ ဂြိုဟ်များ၏ တည်နေရာ/ဆက်စပ်မှုကြောင့် ဖြစ်ပေါ်လာသော အထူးအကျိုးသက်ရောက်မှုများဖြစ်သည်။ အဓိကယောဂများကို အောက်တွင် ရှင်းပြပေးထားသည်။' : 'A yoga is a special result formed by particular planetary placements or links. The main yogas are explained below.'}</p>
                    <div className="space-y-1.5">
                      {Object.entries(YOGA_INFO).map(([name, info]) => (
                        <details key={name} className="group rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 transition hover:border-accent/30 open:border-accent/30 open:bg-accent/[0.04]">
                          <summary className="flex cursor-pointer list-none items-center justify-between text-sm text-fg/90">
                            <span className="font-semibold">{name}</span>
                            <span className="text-muted transition group-open:rotate-180">▾</span>
                          </summary>
                          <p className="mt-2 text-xs leading-relaxed text-muted">{lang === 'mm' ? info.mm : info.en}</p>
                        </details>
                      ))}
                    </div>
                  </div>

                  {/* Dasha periods — two across, full page width */}
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="glass-card p-5">
                      <h3 className="mb-3 font-groovy text-lg text-fg">Vimshottari Dasha</h3>
                      <ol className="space-y-1.5">
                        {data.dashas.map((d) => {
                          const active = new Date(d.startUtc).getTime() <= now && now < new Date(d.endUtc).getTime()
                          return (
                            <li key={d.startUtc + d.lord} className={`flex items-center justify-between gap-3 rounded-xl px-4 py-2 ${active ? 'border border-accent/40 bg-accent/10' : 'bg-white/[0.03]'}`}>
                              <span className={`font-semibold ${active ? 'text-accent-light' : 'text-fg'}`}>{planetName(d.lord, lang)}</span>
                              <span className="font-mono text-xs text-muted">{d.startUtc} → {d.endUtc}</span>
                            </li>
                          )
                        })}
                      </ol>
                    </div>

                    {/* Antardasha (bhukti) sub-periods of the current mahadasha */}
                    {data.antardashas && data.antardashas.length > 0 && (
                      <div className="glass-card p-5">
                        <div className="flex items-center justify-between">
                          <h3 className="font-groovy text-lg text-fg">{t.currentBhukti}</h3>
                          {bhukti && <span className="rounded-full bg-accent/15 px-3 py-1 text-sm font-semibold text-accent-light">{planetName(reading.lord, lang)} – {planetName(bhukti.lord, lang)}</span>}
                        </div>
                        <ol className="mt-3 space-y-1.5">
                          {data.antardashas.map((d) => {
                            const active = new Date(d.startUtc).getTime() <= now && now < new Date(d.endUtc).getTime()
                            return (
                              <li key={d.startUtc + d.lord} className={`flex items-center justify-between gap-3 rounded-xl px-4 py-2 ${active ? 'border border-accent/40 bg-accent/10' : 'bg-white/[0.03]'}`}>
                                <span className={`font-semibold ${active ? 'text-accent-light' : 'text-fg'}`}>{planetName(reading.lord, lang)} – {planetName(d.lord, lang)}</span>
                                <span className="font-mono text-xs text-muted">{d.startUtc} → {d.endUtc}</span>
                              </li>
                            )
                          })}
                        </ol>
                      </div>
                    )}

                    {/* Pratyantar dasha (3rd level) of the current bhukti */}
                    {data.pratyantardashas && data.pratyantardashas.length > 0 && (
                      <div className="glass-card p-5">
                        <div className="flex items-center justify-between">
                          <h3 className="font-groovy text-lg text-fg">{lang === 'mm' ? 'လက်ရှိ ပစ္စန္တရဒသာ' : 'Current Pratyantar'}</h3>
                          {prat && <span className="rounded-full bg-accent/15 px-3 py-1 text-sm font-semibold text-accent-light">{planetName(bhukti?.lord ?? reading.lord, lang)} – {planetName(prat.lord, lang)}</span>}
                        </div>
                        <ol className="mt-3 space-y-1.5">
                          {data.pratyantardashas.map((d) => {
                            const active = new Date(d.startUtc).getTime() <= now && now < new Date(d.endUtc).getTime()
                            return (
                              <li key={d.startUtc + d.lord} className={`flex items-center justify-between gap-3 rounded-xl px-4 py-2 ${active ? 'border border-accent/40 bg-accent/10' : 'bg-white/[0.03]'}`}>
                                <span className={`font-semibold ${active ? 'text-accent-light' : 'text-fg'}`}>{planetName(bhukti?.lord ?? reading.lord, lang)} – {planetName(d.lord, lang)}</span>
                                <span className="font-mono text-xs text-muted">{d.startUtc} → {d.endUtc}</span>
                              </li>
                            )
                          })}
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── TIMELINE (age → effects) ── */}
              {(tab === 'timeline' || printAll) && (
                <div className="space-y-5">
                  <div className="glass-card p-5">
                    <h3 className="mb-1 font-groovy text-lg text-fg">{t.timelineTitle}</h3>
                    <p className="text-sm leading-relaxed text-muted">{t.timelineDesc}</p>
                    <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px]">
                      <span className="rounded bg-jade/15 px-1.5 py-0.5 text-jade">{lang === 'mm' ? 'ကောင်း' : 'benefic'}</span>
                      <span className="rounded bg-coral/15 px-1.5 py-0.5 text-coral">{lang === 'mm' ? 'သတိ / သာဓေသတီ' : 'caution / Sade Sati'}</span>
                      <span className="text-muted">{lang === 'mm' ? '· ဂြိုဟ်သွားအိမ်ကို စန်းမှ ရေတွက်သော်' : '· transit house counted from the Moon'}</span>
                    </div>
                  </div>
                  <div className="glass-card p-5">
                    <TimelineChart timeline={data.timeline} currentAge={data.timeline.find((yy) => yy.year === thisYear)?.age ?? -1} lang={lang} />
                  </div>
                  <div className="glass-card w-full overflow-x-auto overflow-y-hidden overscroll-x-contain pb-2 scrollbar-hide touch-pan-x p-1" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <table className="w-full min-w-[760px] border-collapse text-left text-xs">
                      <thead className="font-mono text-[10px] uppercase tracking-wider text-muted">
                        <tr>
                          {[t.colYear, t.colAge, t.colPeriod, t.colStars, t.colTheme, t.colJup, t.colSat, t.colRahu, t.colNotes].map((h) => (
                            <th key={h} className="px-2.5 py-2.5 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.timeline.map((y) => {
                          const cur = y.year === thisYear
                          const cell = (tp?: TransitPos) => tp
                            ? <>{signLabel(tp.sign, lang)} <span className="text-muted">·{lang === 'mm' ? toMmDigits(tp.houseFromMoon) : tp.houseFromMoon}</span></>
                            : <span className="text-muted">—</span>
                          const jup = y.transits.find((x) => x.planet === 'Jupiter')
                          const sat = y.transits.find((x) => x.planet === 'Saturn')
                          const rah = y.transits.find((x) => x.planet === 'Rahu')
                          return (
                            <tr key={y.age} className={`border-t border-white/5 ${cur ? 'bg-accent/10' : y.sadeSati ? 'bg-coral/[0.06]' : 'hover:bg-white/[0.03]'}`}>
                              <td className="px-2.5 py-2 font-mono text-muted whitespace-nowrap">{y.year}{cur && <span className="ml-1 rounded bg-accent/20 px-1 text-[9px] text-accent-light">{t.nowRow}</span>}</td>
                              <td className="px-2.5 py-2 font-mono text-fg/90">{lang === 'mm' ? toMmDigits(y.age) : y.age}</td>
                              <td className="px-2.5 py-2 whitespace-nowrap text-fg/90">{planetName(y.maha, lang)}<span className="text-muted"> – {planetName(y.bhukti, lang)}</span></td>
                              <td className="px-2.5 py-2 whitespace-nowrap" title={`${y.stars}/5`}><span className="text-accent-light">{'★'.repeat(y.stars)}</span><span className="text-muted">{'☆'.repeat(5 - y.stars)}</span></td>
                              <td className="px-2.5 py-2 text-fg/80 whitespace-nowrap">{themeWord(y.bhukti || y.maha, lang)}</td>
                              <td className="px-2.5 py-2 font-mono text-fg/80 whitespace-nowrap">{cell(jup)}</td>
                              <td className={`px-2.5 py-2 font-mono whitespace-nowrap ${y.sadeSati ? 'text-coral' : 'text-fg/80'}`}>{cell(sat)}</td>
                              <td className="px-2.5 py-2 font-mono text-fg/80 whitespace-nowrap">{cell(rah)}</td>
                              <td className="px-2.5 py-2">
                                <div className="flex flex-wrap gap-1">
                                  {y.notes.map((n, i) => (
                                    <span key={i} className={`rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap ${n.tone === 'good' ? 'bg-jade/15 text-jade' : n.tone === 'warn' ? 'bg-coral/15 text-coral' : 'bg-white/10 text-muted'}`}>{transitNoteText(n, lang)}</span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── ASHTAKAVARGA ── */}
              {(tab === 'ashtaka' || printAll) && <AshtakavargaView data={data} lang={lang} />}

              {/* ── SHADBALA ── */}
              {(tab === 'shadbala' || printAll) && <ShadbalaView data={data} lang={lang} />}

              {/* ── D1 (now shown under the merged "ဇာတာခွဲများ" tab) ── */}
              {(tab === 'vargas' || printAll) && (
                <div className="space-y-5">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="glass-card p-5"><ChartView style={chartStyle} data={data} /></div>
                    {moon && <div className="glass-card p-5"><ChartView style={chartStyle} data={data} lagnaSign={moon.sign} title="Chandra · D1" subtitle={`Moon: ${moon.signName}`} /></div>}
                  </div>
                  <div className="glass-card p-5"><p className="text-sm leading-relaxed text-muted">{t.d1Desc}</p></div>
                  <div className="glass-card my-2 w-full overflow-x-auto overflow-y-hidden overscroll-x-contain pb-2 scrollbar-hide touch-pan-x rounded-lg border border-accent/20 p-1" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <table className="w-full min-w-[650px] border-collapse text-left text-sm">
                      <thead className="font-mono text-[11px] uppercase tracking-wider text-muted">
                        <tr>{['Planet', 'Sign', 'Degree', 'Nakshatra (pada)', 'House', 'Dignity'].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {data.planets.map((p) => (
                          <tr key={p.name} className="border-t border-white/5 hover:bg-white/[0.03]">
                            <td className="px-4 py-2.5 font-medium text-fg">{planetName(p.name, lang)}{p.retrograde && <span className="ml-1 text-jade" title="Retrograde">℞</span>}{p.combust && <span className="ml-1 text-coral" title="Combust (asta)">☀</span>}</td>
                            <td className="px-4 py-2.5 text-fg/90">{signLabel(p.sign, lang)}</td>
                            <td className="px-4 py-2.5 font-mono text-xs text-muted">{deg(p.degreeInSign)}</td>
                            <td className="px-4 py-2.5 text-fg/90">{p.nakshatraName} <span className="text-muted">({p.pada})</span></td>
                            <td className="px-4 py-2.5 font-mono text-xs text-muted">{p.house}</td>
                            <td className="px-4 py-2.5">{p.dignity !== '-' ? <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] text-accent-light">{p.dignity}</span> : <span className="text-muted">—</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {(tab === 'vargas' || printAll) && (
                <div className="space-y-4">
                  <div className="no-print flex flex-wrap items-center gap-2">
                    <span className={labelCls}>{lang === 'mm' ? 'ဇာတာခွဲများကို ရွေးချယ်ရန်' : 'Divisional chart'}</span>
                    <select value={vargaN} onChange={(e) => setVargaN(Number(e.target.value))}
                      className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-fg outline-none focus:border-accent/50">
                      {VARGAS.map((v) => <option key={v.n} value={v.n} className="text-black">{v.name}</option>)}
                    </select>
                  </div>
                  <VargaPanel data={data} lang={lang} signOf={(p) => p.vargas['D' + vargaN] ?? p.sign} lagnaSign={vargaSign(data.ascendant.longitude, vargaN)}
                    title={curVarga.name} subtitle={`Lagna: ${signLabel(vargaSign(data.ascendant.longitude, vargaN), lang)}`}
                    desc={lang === 'mm' ? curVarga.desc.mm : curVarga.desc.en} chartStyle={chartStyle} />

                  {/* D1–D60 educational accordion */}
                  <div className="glass-card p-5">
                    <h3 className="mb-3 font-groovy text-base text-fg">{lang === 'mm' ? 'ဇာတာခွဲများ၏ အဓိပ္ပာယ်များ (D1–D60)' : 'What each Divisional Chart means (D1–D60)'}</h3>
                    <div className="space-y-1.5">
                      {VARGA_GUIDE.map((v) => (
                        <details key={v.code} className="group rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 transition hover:border-accent/30 open:border-accent/30 open:bg-accent/[0.04]">
                          <summary className="flex cursor-pointer list-none items-center justify-between font-mono text-sm text-fg/90">
                            <span>{v.code}</span>
                            <span className="text-muted transition group-open:rotate-180">▾</span>
                          </summary>
                          <p className="mt-2 text-xs leading-relaxed text-muted">{lang === 'mm' ? v.mm : v.en}</p>
                        </details>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── In-app consultation chat with the Sayar ── */}
              <div ref={remedyRef} className="no-print glass-card border border-amber-400/25 p-6">
                <h3 className="flex items-center gap-2 font-groovy text-lg text-fg"><Sparkles size={16} className="text-amber-500 dark:text-amber-300" /> {lang === 'mm' ? 'ယတြာ အစီအရင်နှင့် အသေးစိတ်မေးမြန်းရန် — ဆရာဘုန်းမင်းသိုက်ဒင်ထံ တိုက်ရိုက် ဆက်သွယ်ရန်' : 'Remedy (Yatra) & Consultation — chat with Saya Phone Myint Thaik Din'}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {lang === 'mm' ? 'ဆရာနှင့် တိုက်ရိုက် စကားပြောနိုင်ပါသည်။ သင့် မေးခွန်းများနှင့် ယတြာ တောင်းဆိုမှုများကို အောက်တွင် ရိုက်ထည့်ပါ။' : 'Chat directly with the Sayar. Type your questions and remedy requests below.'}
                </p>

                {!customerToken ? (
                  <div className="mt-4 flex flex-col items-start gap-3 rounded-xl border border-accent/30 bg-accent/10 px-5 py-4">
                    <p className="text-sm text-accent-light">{lang === 'mm' ? 'ဆရာနှင့် စကားပြောရန် အကောင့်ဝင်ပါ။' : 'Log in to chat with the Sayar.'}</p>
                    <button type="button" onClick={() => openAuth('login')} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-violet-500 px-4 py-2 text-sm font-semibold text-space transition hover:brightness-110"><Lock size={15} /> {lang === 'mm' ? 'အကောင့်ဝင်ရန်' : 'Log In'}</button>
                  </div>
                ) : (
                  <div className="mt-4">
                    <div className="flex h-80 flex-col gap-2.5 overflow-y-auto rounded-2xl border border-fg/10 bg-fg/[0.03] p-4">
                      {chatMsgs.length === 0 ? (
                        <p className="m-auto max-w-xs text-center text-sm text-muted">{lang === 'mm' ? 'စကားပြောဆိုမှု မရှိသေးပါ — အောက်တွင် စတင်မေးမြန်းပါ။' : 'No messages yet — start the conversation below.'}</p>
                      ) : chatMsgs.map((m) => {
                        const mine = m.senderRole === 'Customer'
                        return (
                          <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[82%] rounded-2xl border px-3.5 py-2 text-sm leading-relaxed ${mine
                              ? 'rounded-br-md border-amber-300/40 bg-gradient-to-br from-amber-200/30 to-violet-500/25 text-fg'
                              : 'rounded-bl-md border-emerald-400/30 bg-emerald-500/15 text-fg'}`}>
                              {!mine && <div className="mb-0.5 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-300">ဆရာဘုန်းမင်းသိုက်ဒင်</div>}
                              <div className="whitespace-pre-wrap break-words">{m.text}</div>
                              <div className="mt-1 text-right font-mono text-[9px] text-muted">{(m.createdAt || '').slice(5, 16)}</div>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="mt-3 flex items-end gap-2">
                      <textarea value={chatInput} onChange={(e) => setChatInput(e.target.value)} rows={2}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                        placeholder={lang === 'mm' ? 'မေးခွန်း ရိုက်ထည့်ပါ… (Enter = ပို့)' : 'Type your question… (Enter to send)'}
                        className={`${field} flex-1 resize-none`} />
                      <button type="button" onClick={sendMessage} disabled={chatBusy || !chatInput.trim()}
                        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-violet-500 px-4 py-3 text-sm font-semibold text-space transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
                        {chatBusy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} {lang === 'mm' ? 'ပို့မည်' : 'Send'}
                      </button>
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-muted">
                      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                      {lang === 'mm' ? 'အလိုအလျောက် အသစ်ပြန်ဆွဲနေသည်' : 'Auto-updating live'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom language toggle — mirrors the top one so users needn't scroll back up */}
      <div className="mt-12 flex justify-center no-print">
        <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1">
          {(['en', 'mm'] as const).map((l) => (
            <button key={l} type="button" onClick={() => setLang(l)} className={`rounded-full px-4 py-1.5 font-mono text-xs transition ${lang === l ? 'bg-accent/70 text-space' : 'text-muted hover:text-fg'}`}>{l === 'en' ? 'EN' : 'မြန်မာ'}</button>
          ))}
        </div>
      </div>

      {/* ── Methodology (a genuine differentiator) + honest disclaimer ── */}
      <footer className="mt-8 border-t border-accent/15 pt-6 text-center">
        <p className="font-mono text-[11px] tracking-wide text-accent-light">
          Sidereal · Lahiri ayanamsa (1955) · Whole-Sign houses · Mean node · Swiss Ephemeris
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-muted">
          {lang === 'mm'
            ? 'အသိပေးချက် : ဇာတာများကို ဂန္ထဝင် ဇျောတိသကျမ်းများ၏ နည်းစနစ်များအတိုင်း တိကျစွာ တွက်ချက်ထားပါသည်။ သို့သော် ဗေဒင်ပညာသည် သိပ္ပံနည်းကျ အတည်ပြုထားခြင်း မရှိသဖြင့် — ဆေးဘက်ဆိုင်ရာ၊ ဥပဒေရေးရာ (သို့မဟုတ်) ငွေကြေးဆိုင်ရာ ကိစ္စရပ်များတွင် မျက်စိမှိတ်ယုံကြည်၍ တထစ်ချ ဆုံးဖြတ်ချက် မချသင့်ပါ။ အရေးကြီးသော ကိစ္စရပ်များအတွက် သက်ဆိုင်ရာ ကျွမ်းကျင်ပညာရှင်များနှင့်သာ ဆွေးနွေးတိုင်ပင်ပါ။ ဤတွက်ချက်မှု ရလဒ်များသည် မိမိကိုယ်ကို ပြန်လည်သုံးသပ်ရန်၊ ယဉ်ကျေးမှုအမွေအနှစ်အား လေ့လာရန်နှင့် ပုဂ္ဂိုလ်ရေးစိတ်ဝင်စားမှုအတွက်သာ ရည်ရွယ်တင်ဆက်ခြင်း ဖြစ်ပါသည်။'
            : 'Disclaimer: These astrological charts are precisely calculated according to the traditional principles of classical Vedic astrology. However, astrology is not a scientifically validated discipline. Therefore, these readings should not be used as a substitute for professional medical, legal, or financial advice. Please consult relevant qualified professionals for major life decisions. The results presented here are strictly for self-reflection, cultural appreciation, and personal interest.'}
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Link to="/algorithms" className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 font-mono text-[11px] text-accent-light transition hover:bg-accent/20">
            <Star size={12} /> {lang === 'mm' ? 'algorithm များ (CS) →' : 'The algorithms (CS) →'}
          </Link>
          <Link to="/research" className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 font-mono text-[11px] text-accent-light transition hover:bg-accent/20">
            <Star size={12} /> {lang === 'mm' ? 'တိုင်းတာနိုင်သော သုတေသနဆိုင်ရာ လုပ်ထုံးလုပ်နည်းများ →' : 'Falsifiable research protocol →'}
          </Link>
        </div>
      </footer>

      {/* Email-confirm success toast (Task 3) */}
      {verifyToast && (
        <div className="no-print fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 px-4">
          <div className="flex items-center gap-2 rounded-full border border-jade/40 bg-jade/15 px-5 py-2.5 text-sm text-fg shadow-2xl backdrop-blur-md">
            <CheckCircle2 size={16} className="text-jade" /> {verifyToast}
          </div>
        </div>
      )}

      {/* Approved-reading guidance modal (Phase 5) */}
      {showApprovedModal && (
        <div className="no-print fixed inset-0 z-[70] flex items-center justify-center p-4"
          style={{ background: 'rgba(6,5,12,0.72)', backdropFilter: 'blur(6px)' }}
          onClick={dismissApprovedModal} role="dialog" aria-modal="true">
          <div onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border-2 border-amber-400/50 p-6 text-center sm:p-8"
            style={{ background: 'linear-gradient(155deg, rgb(var(--card)) 0%, rgb(var(--surface)) 100%)', boxShadow: '0 0 70px -18px rgba(234,179,8,0.6)' }}>
            <div className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }} />
            <button type="button" onClick={dismissApprovedModal} aria-label="Close"
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-muted transition hover:bg-fg/10 hover:text-fg">
              <X size={18} />
            </button>
            <div className="relative">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-amber-400/50 bg-gradient-to-br from-emerald-400/25 to-amber-400/25">
                <CheckCircle2 size={34} className="text-emerald-500" />
              </span>
              <h3 className="mt-4 font-groovy text-xl text-fg sm:text-2xl">
                {lang === 'mm' ? 'အောင်မြင်ပါသည်။' : 'Success'}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-fg/90">
                {lang === 'mm'
                  ? 'ဆရာမှ သင့်ဇာတာအား အသေးစိတ် စစ်ဆေးအတည်ပြုပြီးဖြစ်ပါသည်။'
                  : 'The Master has verified and approved your reading.'}
              </p>
              <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm leading-relaxed text-amber-800 dark:text-amber-100">
                {lang === 'mm'
                  ? "အောက်ပါ 'အသေးစိတ် ဟောစာတမ်း' ခလုတ်ကို နှိပ်၍ ဝင်ရောက်ဖတ်ရှုနိုင်ပါပြီ။"
                  : "Please click the 'Detailed Reading' tab below to view it."}
              </p>
              <button type="button" onClick={() => { setTab('ai'); dismissApprovedModal() }}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-6 py-2.5 text-sm font-bold text-amber-950 shadow-lg shadow-amber-500/40 transition hover:brightness-110">
                <ScrollText size={16} /> {lang === 'mm' ? 'ဆက်လက်ရန်' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
