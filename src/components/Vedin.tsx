import { lazy, Suspense, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { Sparkles, MapPin, Loader2, Search, Download, Star, Info, Sigma, FlaskConical, ArrowRight, ScrollText, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Pencil, Cake, X, MousePointerClick } from 'lucide-react'
import { SITE } from '../config/site'
import KundliChart from './KundliChart'
import DiamondChart from './DiamondChart'
import AreaRadar from './AreaRadar'
import TimelineChart from './TimelineChart'
import AshtakavargaView from './AshtakavargaView'
import ShadbalaView from './ShadbalaView'
import CustomerPanel, { type SavedChart, type CustomerPanelHandle } from './CustomerPanel'
import useLang from '../hooks/useLang'
import useGeocode from '../hooks/useGeocode'
import useConsultationChat from '../hooks/useConsultationChat'
import useQuerentProfile from '../hooks/useQuerentProfile'
import useChart from '../hooks/useChart'
import useReadingRequest from '../hooks/useReadingRequest'
import ReadingRequestPanel from './reading/ReadingRequestPanel'
import ChatPanel from './chat/ChatPanel'
import TabBar, { type TabDef } from './TabBar'
import ChartSummaryHero from './ChartSummaryHero'
import ChartSkeleton from './ChartSkeleton'
import WizardProgress from './wizard/WizardProgress'
import TopicExplainer from './TopicExplainer'
import LanguageSwitcher from './LanguageSwitcher'
// Leaflet (~150 kB + CSS) is pulled in only when the Birth-place step renders.
const BirthPlaceMap = lazy(() => import('./BirthPlaceMap'))

// Credential-pill palette — muted, pastel "jewel tones" (never saturated toy colours),
// one distinct hue per pill, each with a light + dark pair for perfect contrast.
const PILL_TONES = [
  'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700/50',
  'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/50',
  'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800/50',
  'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-800/50',
  'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/50',
  'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-300 dark:border-teal-800/50',
] as const
import { loadBirthDraft, draftValue, saveBirthDraft } from '../hooks/useBirthDraft'
import type { BirthChartData, PlanetPosition, TransitPos } from '../types/astrology'
import { JT, type Lang, type Naynan, vargaSign, signLabel, planetName, readingFor, naynan, activeBhukti, activePratyantar, toMmDigits, themeWord, transitNoteText, findPlanet, dignityLabel, currentAreaEffect } from '../lib/vedin'
import {
  PRESETS, browserTz, TZ_OPTIONS, VARGAS, BIO_EN, BIO_MM, BIO_JA, PROFILE_PILLS, VARGA_GUIDE,
  YOGA_INFO, yogaText, deg, field, labelCls,
  type Preset, type Profile, type Tab, type ChartStyle,
} from '../lib/vedin-content'

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
  const { lang } = useLang()   // defaults to Burmese; persisted across routes + refresh
  const t = JT[lang]
  // Trilingual inline helper for the handful of labels not in the JT dictionary.
  const L = (en: string, mm: string, ja: string) => (lang === 'ja' ? ja : lang === 'mm' ? mm : en)

  // A refresh used to wipe every field, including a geocoded city. Rehydrate.
  const draft0 = useRef(loadBirthDraft()).current

  const [name, setName] = useState(() => draftValue(draft0, 'name', ''))
  const [gender, setGender] = useState<'male' | 'female'>(() => draftValue(draft0, 'gender', 'male'))
  const [date, setDate] = useState(() => draftValue(draft0, 'date', '1998-01-01'))
  const [time, setTime] = useState(() => draftValue(draft0, 'time', '12:00'))
  const [lat, setLat] = useState(() => draftValue(draft0, 'lat', '16.8409'))
  const [lon, setLon] = useState(() => draftValue(draft0, 'lon', '96.1735'))
  const [tz, setTz] = useState(() => draftValue(draft0, 'tz', browserTz))

  // Wizard position, and the explicit "I don't know my birth time" path. The
  // form used to silently default to 12:00, which quietly corrupts the Lagna
  // and every house cusp without ever telling the querent.
  const [step, setStep] = useState(() => draftValue(draft0, 'step', 1))
  const [timeUnknown, setTimeUnknown] = useState(() => draftValue(draft0, 'timeUnknown', false))
  const [advancedOpen, setAdvancedOpen] = useState(false)

  // Birth-place search + timezone resolution (shared with the signup modal).
  const geo = useGeocode(({ lat: la, lon: lo, tz: zone }) => {
    setLat(String(la)); setLon(String(lo))
    if (zone) setTz(zone)
  })
  const place = geo.place
  const placeConfirmed = geo.confirmed

  // Dropping / dragging the map pin resolves the timezone from the exact coordinates
  // (tz-lookup, loaded on demand) and confirms the place — so a pin is as valid a
  // birth location as a searched city. The label keeps the searched name if present.
  const pickFromMap = async (la: number, lo: number) => {
    let zone = tz
    try {
      const { default: tzlookup } = await import('tz-lookup')
      zone = tzlookup(la, lo)
    } catch { /* ocean / unmapped → keep the current zone */ }
    const label = place.trim() || (lang === 'ja' ? '地図上にピン留め' : lang === 'mm' ? 'မြေပုံပေါ်တွင် ရွေးချယ်ထားသည်' : 'Pinned on the map')
    geo.apply({ label, lat: la, lon: lo, tz: zone })
  }

  // The geocoded city lives inside useGeocode, so restore it once on mount.
  useEffect(() => {
    if (draft0.placeConfirmed && draft0.place) geo.hydrate(draft0.place)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Chart compute + archive, cached by birth data (see useChart).
  const chart$ = useChart()
  const { data, setData, loading, error } = chart$
  const [querent, setQuerent] = useState<{ name: string; gender: 'male' | 'female'; nn: Naynan | null } | null>(null)
  const [tab, setTab] = useState<Tab>('reading')
  const [chartStyle, setChartStyle] = useState<ChartStyle>('diamond')
  const location = useLocation()

  // Footer / deep-link support: a hash like "/#ashtaka", "/#shadbala" or "/#account"
  // selects the matching tab and scrolls to it. Re-runs when the hash changes or once
  // the chart finishes computing (so a link followed before results exist still lands).
  useEffect(() => {
    const h = location.hash.replace('#', '').toLowerCase()
    if (!h) return
    if (h === 'account' || h === 'dashboard') {
      document.getElementById('vedin-account')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    const hashToTab: Record<string, Tab> = {
      ai: 'ai', reading: 'reading', timeline: 'timeline',
      vargas: 'vargas', charts: 'vargas',
      ashtaka: 'ashtaka', ashtakavarga: 'ashtaka', shadbala: 'shadbala',
    }
    const target = hashToTab[h]
    if (target) {
      setTab(target)
      document.getElementById('vedin-charts')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.hash, data])

  // Scroll the querent up to the birth form (from an explainer's "Cast your chart" CTA).
  const scrollToForm = () =>
    document.getElementById('vedin-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const [vargaN, setVargaN] = useState(9)
  const [ayanamsa, setAyanamsa] = useState(() => draftValue(draft0, 'ayanamsa', 'lahiri'))
  const [consent, setConsent] = useState(() => draftValue(draft0, 'consent', false))

  // Remedy / contact-to-Ko Bhone Min Thike Din form.
  const remedyRef = useRef<HTMLDivElement>(null)

  // Full-reading PDF via the browser's print engine (captures every tab's charts & tables).
  const [printAll, setPrintAll] = useState(false)
  const [pdfBusy, setPdfBusy] = useState(false)

  // Customer account (email-only sign-up); token drives per-account chart saving.
  const [customerToken, setCustomerToken] = useState<string | null>(null)

  // Consultation thread with the Sayar (polling lives in the hook).
  const chat = useConsultationChat(customerToken)

  const readingRef = useRef<HTMLDivElement>(null)   // the rendered reading, for client-side PDF
  const customerPanelRef = useRef<CustomerPanelHandle>(null)
  const [howtoOpen, setHowtoOpen] = useState(false)
  const [verifyToast, setVerifyToast] = useState('')
  const profile$ = useQuerentProfile(customerToken)
  const profile = profile$.profile
  const [otherMode, setOtherMode] = useState(false)   // "calculate for someone else"
  const loadSavedChart = (c: SavedChart) => {
    setName(c.name || ''); setGender(c.gender === 'female' ? 'female' : 'male')
    setDate(c.birthDate || date); setTime(c.birthTime || time)
    setLat(String(c.latitude)); setLon(String(c.longitude))
    if (c.timeZone) setTz(c.timeZone)
    geo.hydrate(c.name ? `${c.name} · saved` : 'Saved location')
    setStep(3)   // a saved chart has already answered steps 1 and 2
  }

  const applyPreset = (p: Preset) => geo.apply(p)

  useEffect(() => {
    saveBirthDraft({ name, gender, date, time, timeUnknown, lat, lon, tz, ayanamsa, place, placeConfirmed, consent, step })
  }, [name, gender, date, time, timeUnknown, lat, lon, tz, ayanamsa, place, placeConfirmed, consent, step])

  // An unknown birth time is answered with a noon solar chart: the Lagna and
  // house cusps are not trustworthy, so the reading leans on the Moon instead.
  const setTimeUnknownSafely = (unknown: boolean) => {
    setTimeUnknown(unknown)
    if (unknown) setTime('12:00')
  }

  const canSubmit = !!name.trim() && placeConfirmed && consent

  // Per-step validation, so a blocker is reported on the screen that caused it
  // rather than as an error list at the very bottom of the form.
  const stepError = (s: number): string => {
    if (s === 1 && !name.trim()) return L('Please enter a name.', 'အမည် ဖြည့်သွင်းပါ။', 'お名前をご入力ください。')
    if (s === 2 && !date) return L('Please enter your date of birth.', 'မွေးသက္ကရာဇ် ဖြည့်ပါ။', '生年月日をご入力ください。')
    if (s === 3 && !placeConfirmed) {
      return L(
        'Search and select your birth city, or drop a pin on the map.',
        'မွေးဖွားရာ မြို့/ဇာတိကို ရှာဖွေ၍ စာရင်းထဲမှ ရွေးချယ်ပါ (သို့) မြေပုံပေါ်တွင် အမှတ်ချပါ။',
        '出生地の都市を検索して選択するか、地図上にピンを置いてください。',
      )
    }
    return ''
  }
  const currentStepError = stepError(step)

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!canSubmit) return   // name + confirmed city + consent are all mandatory
    const [y, mo, d] = date.split('-').map(Number)
    const [h, mi] = time.split(':').map(Number)
    const chart = await chart$.compute({
      year: y, month: mo, day: d, hour: h || 0, minute: mi || 0, second: 0,
      timeZone: tz, latitude: Number(lat), longitude: Number(lon), ayanamsa,
    })
    if (!chart) return

    setQuerent({ name: name.trim(), gender, nn: naynan(date, time) })
    setTab('reading')

    // Archived ONLY with explicit consent (opt-in), plus under the account when
    // signed in, for history and autofill.
    if (consent) {
      chart$.archive({
        name: name.trim(), gender, birthDate: date, birthTime: time, timeZone: tz,
        latitude: Number(lat), longitude: Number(lon), nayNan: naynan(date, time)?.num ?? 0, consent: true,
      }, customerToken)
    }
  }

  // Prefetch-on-intent: as soon as the birth inputs are valid (city confirmed +
  // parseable date/time), warm the chart cache in the background so pressing
  // "calculate" resolves instantly. Debounced against rapid edits; failures are
  // swallowed by prefetch(). Name/consent aren't needed — the chart is a pure
  // function of the birth moment + place.
  useEffect(() => {
    if (!placeConfirmed) return
    const [y, mo, d] = date.split('-').map(Number)
    const [h, mi] = time.split(':').map(Number)
    const la = Number(lat), lo = Number(lon)
    if (!y || !mo || !d || Number.isNaN(la) || Number.isNaN(lo) || !tz) return
    const t = setTimeout(() => chart$.prefetch({
      year: y, month: mo, day: d, hour: h || 0, minute: mi || 0, second: 0,
      timeZone: tz, latitude: la, longitude: lo, ayanamsa,
    }), 400)
    return () => clearTimeout(t)
  }, [placeConfirmed, date, time, lat, lon, tz, ayanamsa]) // eslint-disable-line react-hooks/exhaustive-deps

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
    return lang === 'ja' ? `(${a}歳)` : lang === 'mm' ? `(အသက် ${toMmDigits(a)} နှစ်)` : `(Age ${a})`
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
    geo.hydrate(p.locationName || 'My birth place')
    const [y, mo, d] = p.dob.split('-').map(Number)
    const [h, mi] = bt.split(':').map(Number)
    const chart = await chart$.compute({
      year: y, month: mo, day: d, hour: h || 0, minute: mi || 0, second: 0,
      timeZone: p.timezone || tz, latitude: p.latitude, longitude: p.longitude, ayanamsa,
    })
    if (!chart) return

    setQuerent({ name: (p.username || '').trim(), gender: g, nn: naynan(p.dob, bt) })
    setTab('reading')
  }

  const refreshProfile = () => {
    if (!customerToken) return
    setOtherMode(false)
    profile$.refresh()
  }

  // Registered + has profile + not "someone else" → instantly show their chart.
  const showDashboard = !!(customerToken && profile?.hasProfile && !otherMode)
  useEffect(() => {
    if (showDashboard && profile) computeFromProfile(profile)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDashboard, profile])

  const startCalcForOther = () => {
    setOtherMode(true); setData(null)
    setName(''); setGender('male'); geo.reset()
    reading$.reset()
  }
  const backToDashboard = () => { setOtherMode(false); reading$.reset() }

  // Life-area "get remedy" → pre-fill the consultation chat with that area.
  const openRemedy = (areaLabel: string) => {
    chat.setInput(lang === 'ja' ? `「${areaLabel}」の領域に適した対策・助言をお願いします。` : lang === 'mm' ? `${areaLabel} ကဏ္ဍအတွက် သင့်လျော်သော ယတြာ/အကြံဉာဏ် လိုအပ်ပါသည်။` : `I would like a suitable remedy / advice for: ${areaLabel}.`)
    setTimeout(() => remedyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 40)
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
      language: lang === 'mm' ? 'my' : lang,   // 'my' | 'en' | 'ja' for the backend
      // birthDate / birthTime / location → used only for the 30-day dedup hash
      birthDate: date,
      birthTime: time,
      location: place.trim() || `${lat},${lon}`,
    }
  }

  // The Sayar-approval workflow (status polling + approved modal live in the hook).
  const reading$ = useReadingRequest({
    token: customerToken,
    identity: readingIdentity,
    buildPayload: buildAiPayload,
  })

  // On chart compute (and revisits), check whether a request already exists.
  useEffect(() => {
    if (!data) return
    reading$.setError(''); reading$.setInfo(''); reading$.check()
  }, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * The premium report is a real document rendered by QuestPDF on the server —
   * typeset pages, embedded Burmese fonts, a vector chart plate — and it is built
   * by the same background job that writes the reading, so this is a download of
   * stored bytes rather than a render. Browser print stays as the fallback for the
   * case where the server artifact is not there yet.
   */
  const downloadReadingPdf = async () => {
    if (!customerToken) { openAuth('login'); return }
    setPdfBusy(true)
    try {
      const res = await fetch(`${SITE.apiUrl}/api/customer/download-pdf`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `vedin-reading-${new Date().toISOString().slice(0, 10)}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 4000)
    } catch {
      printReadingFallback()
    } finally {
      setPdfBusy(false)
    }
  }

  // Fallback: client-side PDF via a HIDDEN IFRAME (not a pop-up, so no blocker and
  // no blank-modal crash). We write a clean, self-contained light-theme document into
  // the iframe, wait for the Padauk web-fonts to load, then print just that iframe.
  // Everything is wrapped so a failure shows a friendly toast instead of crashing.
  const printReadingFallback = () => {
    if (!customerToken) { openAuth('login'); return }
    const bodyHtml = readingRef.current?.innerHTML
    if (!bodyHtml) { setVerifyToast(lang === 'ja' ? '鑑定が見つかりません — 再読み込みしてください。' : lang === 'mm' ? 'ဟောစာတမ်း မတွေ့ပါ။ စာမျက်နှာကို ပြန်စစ်ပါ။' : 'Reading not found — please reload.'); return }

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
    <div class="name">${who || (lang === 'ja' ? '詳細な鑑定' : lang === 'mm' ? 'အသေးစိတ် ဟောစာတမ်း' : 'Detailed Reading')}</div>
    <div class="meta">${today}</div></div>
  <div class="md">${bodyHtml}</div>
  <div class="foot">${lang === 'ja' ? '古典的なインド占星術の計算式で算出され、占星術師が直接確認しています。自己省察のための指針です。' : lang === 'mm' ? 'ဤဟောစာတမ်းအား ဂန္ထဝင် ဇျောတိသ သင်္ချာနည်းစနစ်များကိုအသုံးပြုပြီး တွက်ချက်ထားပါသည်။ ရလဒ်များမှာ ဆင်ခြင်သုံးသပ်ရန်အတွက် လမ်းညွှန်ချက်များဖြစ်ပါသည်။' : 'Computed with classical Vedic astrology formulas and personally verified by the Sayar. Guidance for reflection.'}</div>
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
          setVerifyToast(lang === 'ja' ? '印刷ダイアログを開けませんでした — もう一度お試しください。' : lang === 'mm' ? 'Print/PDF ဖွင့်၍မရပါ။ ထပ်စမ်းကြည့်ပါ။' : 'Could not open the print dialog — please try again.')
        } finally { cleanup() }
      }

      const win = iframe.contentWindow as (Window & { onafterprint: (() => void) | null }) | null
      if (win) win.onafterprint = cleanup
      const fonts = (doc as Document & { fonts?: FontFaceSet }).fonts
      if (fonts?.ready) fonts.ready.then(() => window.setTimeout(go, 150)).catch(() => go())
      window.setTimeout(go, 1600)   // hard fallback if fonts.ready never settles
    } catch {
      setVerifyToast(lang === 'ja' ? 'PDFを生成できませんでした — もう一度お試しください。' : lang === 'mm' ? 'PDF ဖန်တီး၍မရပါ။ ထပ်စမ်းကြည့်ပါ။' : 'Could not generate the PDF — please try again.')
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
      setVerifyToast(lang === 'ja' ? 'アカウントが確認されました — 続けるにはログインしてください。' : lang === 'mm' ? 'အကောင့် အတည်ပြုပြီးပါပြီ။ ကျေးဇူးပြု၍ Login ဝင်ပါ။' : 'Account confirmed — please log in to continue.')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!verifyToast) return; const id = setTimeout(() => setVerifyToast(''), 4000); return () => clearTimeout(id) }, [verifyToast])

  const openAuth = (mode: 'login' | 'signup') => customerPanelRef.current?.openAuth(mode)

  const curVarga = VARGAS.find((v) => v.n === vargaN) ?? VARGAS[4]
  const TABS: TabDef[] = [
    { id: 'ai', label: L('Detailed Reading', 'အသေးစိတ် ဟောစာတမ်းများ', '詳細な鑑定'), variant: 'main' },
    { id: 'reading', label: L(t.tabReading, 'မွေးဇာတာစစ်တမ်းများ', t.tabReading) },
    { id: 'timeline', label: t.tabTimeline },
    { id: 'vargas', label: L('Charts', 'ဇာတာခွဲများ', 'チャート') },
    { id: 'ashtaka', label: L('Ashtaka', 'အဋ္ဌကဝဂ်', 'アシュタカ'), variant: 'ashtaka' },
    { id: 'shadbala', label: L('Shadbala', 'ဆဒ္ဗလ', 'シャドバラ'), variant: 'shadbala' },
  ]

  return (
    <section className="section-container vedin-page">
      {/* ── Elegant astrology watermark — a sophisticated, barely-there texture, NOT a
          loud photo. Fixed behind everything; heavily faded (3% light / 10% dark) and
          blended smoothly into the base colour by the gradient overlay below. As the
          first (opacity-bearing) children of the page, both layers paint above the
          page background yet beneath all content. ── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-[0.03] dark:opacity-[0.10]"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1532968961962-8bfc2ac38287?q=80&w=2000&auto=format&fit=crop)' }} />
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-transparent to-[#F8F9FA] dark:to-[#0a0a0a]" />

      {/* ── Grand Astrologer Profile — centered, large photo, bio below ── */}
      {/* print-hide: the photo + bio are omitted from the printed PDF (Phase 4) */}
      <div className="print-hide relative mb-8 overflow-hidden rounded-3xl border border-amber-500/30 bg-[#ffffff] shadow-sm dark:border-amber-500/20 dark:bg-neutral-900/50 p-6 text-center sm:p-10">

        {/* language switcher — pinned top-right */}
        <div className="no-print absolute right-4 top-4 z-10">
          <LanguageSwitcher />
        </div>

        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
          <div className="relative h-36 w-36 shrink-0 rounded-full p-[3px] ring-1 ring-amber-500/30 sm:h-44 sm:w-44"
            style={{ background: 'conic-gradient(from 210deg, #e4c77e, #c9a24b, #8a6d2f, #c9a24b, #e4c77e)', boxShadow: '0 2px 14px -6px rgba(0,0,0,0.7)' }}>
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
              <Sparkles size={11} className="text-amber-500 dark:text-amber-300" /> {lang === 'ja' ? 'インド占星術 愛好家' : lang === 'mm' ? 'ဗေဒင်ပညာ လေ့လာဆည်းပူးသူ' : 'Vedic Astrology Enthusiast'}
            </p>
            <h1 className="mt-2.5 mb-4 pb-2 bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 bg-clip-text font-groovy text-4xl font-bold leading-[1.35] text-transparent sm:text-5xl"
              style={{ filter: 'drop-shadow(0 1px 6px rgba(201,162,75,0.18))' }}>
              {lang === 'mm' ? 'ဘုန်းမင်းသိုက်ဒင်' : 'Bhone Min Thike Din'}
            </h1>
            {/* Credential tags — uniform, monochrome, professional (no rainbow). */}
            <div className="mt-3.5 flex flex-wrap justify-center gap-2">
              {PROFILE_PILLS.map((p, i) => (
                <span key={p.en} className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${PILL_TONES[i % PILL_TONES.length]}`}>
                  {lang === 'ja' ? p.ja : lang === 'mm' ? p.mm : p.en}
                </span>
              ))}
            </div>
          </div>
          <p className="text-[15px] leading-relaxed text-muted">{lang === 'ja' ? BIO_JA : lang === 'mm' ? BIO_MM : BIO_EN}</p>
        </div>
      </div>

      {/* ── Portals: the computation behind the charts ── */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 no-print">
        {/* Portal 1 — The Algorithm */}
        <Link to="/algorithms"
          className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-[#ffffff] shadow-sm transition-colors duration-300 hover:border-slate-300 hover:bg-slate-50 dark:border-white/5 dark:bg-neutral-900/40 dark:shadow-none dark:hover:border-white/10 dark:hover:bg-neutral-800/50 p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40">
          <span aria-hidden className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-accent/20 blur-3xl transition duration-500 group-hover:bg-accent/30" />
          <div className="relative flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-accent/40 bg-accent/15 text-accent-light shadow-inner">
              <Sigma size={22} />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent-light">{lang === 'ja' ? '計算の仕組み' : lang === 'mm' ? 'ကွန်ပျူတာသိပ္ပံဆိုင်ရာ အခြေခံ' : 'The Computation'}</p>
              <h3 className="mt-1 font-groovy text-xl text-fg">{lang === 'ja' ? 'アルゴリズム' : lang === 'mm' ? 'အယ်လဂိုရီသမ်များ' : 'The Algorithm'}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{lang === 'ja' ? 'チャートの背後にある数式とコード — ユリウス日からアシュタカヴァルガまで。' : lang === 'mm' ? 'ဇာတာတွက်ချက်မှုများ၏ နောက်ကွယ်မှကိန်းအောင်းနေသော သင်္ချာဖော်မြူလာများနှင့် ကုဒ်များ — Julian Day မှ Ashtakavarga အထိ။' : 'The math & code behind the charts — from Julian Day to Ashtakavarga.'}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] text-accent-light transition group-hover:gap-2.5">{lang === 'ja' ? '見る' : lang === 'mm' ? 'အသေးစိတ်ကြည့်ရှုရန်' : 'Explore'} <ArrowRight size={13} /></span>
            </div>
          </div>
        </Link>

        {/* Portal 2 — Falsifiable research protocol */}
        <Link to="/research"
          className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-[#ffffff] shadow-sm transition-colors duration-300 hover:border-slate-300 hover:bg-slate-50 dark:border-white/5 dark:bg-neutral-900/40 dark:shadow-none dark:hover:border-white/10 dark:hover:bg-neutral-800/50 p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40">
          <span aria-hidden className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-jade/20 blur-3xl transition duration-500 group-hover:bg-jade/30" />
          <div className="relative flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-jade/40 bg-jade/15 text-jade shadow-inner">
              <FlaskConical size={22} />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-jade">{lang === 'ja' ? '誠実な科学' : lang === 'mm' ? 'သိပ္ပံနည်းကျကျ ရိုးသားမှု' : 'Honest Science'}</p>
              <h3 className="mt-1 font-groovy text-xl text-fg">{lang === 'ja' ? '反証可能な研究' : lang === 'mm' ? 'တိုင်းတာနိုင်သော သုတေသနပြုချက်' : 'Falsifiable Research'}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{lang === 'ja' ? '事前登録、基準率、並べ替え検定 — 主張を誇示するのではなく、検証します。' : lang === 'mm' ? 'ကြိုတင်မှတ်တမ်း၊ base rate၊ permutation test — ဟောကြားချက်ကို တိုင်းတာနိုင်သည်။' : 'Pre-registration, base rates, permutation tests — we measure claims, not boast them.'}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] text-jade transition group-hover:gap-2.5">{lang === 'ja' ? 'プロトコルを見る' : lang === 'mm' ? 'လုပ်ထုံးလုပ်နည်းများ ကြည့်ရန်' : 'View protocol'} <ArrowRight size={13} /></span>
            </div>
          </div>
        </Link>
      </div>

      {/* ── Customer account (sign in / saved charts) ── */}
      <div className="mb-6 scroll-mt-24" id="vedin-account">
        <CustomerPanel ref={customerPanelRef} lang={lang} onAuthChange={setCustomerToken} onLoadChart={loadSavedChart} onProfileSaved={refreshProfile} />
      </div>

      {/* ── Registered dashboard banner (Emerald/Mint + Deep Purple) ── */}
      {showDashboard && profile && (
        <div className="relative mb-6 overflow-hidden rounded-3xl border border-amber-500/30 bg-[#ffffff] shadow-sm dark:border-amber-500/25 dark:bg-neutral-900/60 dark:shadow-none p-6 sm:p-8 no-print">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-40 blur-3xl" style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }} />
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full opacity-40 blur-3xl" style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-emerald-200"><Sparkles size={14} className="text-amber-300" /> {lang === 'ja' ? 'あなた専用の Vedin ダッシュボード' : lang === 'mm' ? 'သင့်ကိုယ်ပိုင် ဇာတာ ဟောစာတမ်းများကို ကြည့်ရှုရန် Dashboard' : 'Your personal Vedin dashboard'}</p>
              <h2 className="mt-2 font-groovy text-2xl text-white sm:text-3xl">
                {lang === 'ja' ? `ようこそ、${profile.username} さん ` : lang === 'mm' ? `ကြိုဆိုပါတယ်၊ ${profile.username} ` : `Welcome to your personal Vedin dashboard, ${profile.username} `}
                {ageLabel(profile.dob) && <span className="text-xl text-amber-300 sm:text-2xl">{ageLabel(profile.dob)}</span>}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2 font-mono text-[11px]">
                {profile.dob && <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-1 text-emerald-100"><Cake size={12} /> {profile.dob}{profile.birthTime ? ` · ${profile.birthTime}` : ''}</span>}
                {profile.locationName && <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/40 bg-violet-500/15 px-2.5 py-1 text-violet-100"><MapPin size={12} /> {profile.locationName}</span>}
                {profile.gender && <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-white/80">{profile.gender === 'female' ? (lang === 'ja' ? '女性' : lang === 'mm' ? 'မ' : 'Female') : (lang === 'ja' ? '男性' : lang === 'mm' ? 'ကျား' : 'Male')}</span>}
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 self-start sm:items-end">
              <button type="button" onClick={() => customerPanelRef.current?.openProfileEdit()}
                className="inline-flex items-center gap-2 rounded-xl border border-jade/40 bg-jade/15 px-4 py-2.5 text-sm font-semibold text-jade transition hover:bg-jade/25">
                <Pencil size={15} /> {lang === 'ja' ? 'プロフィールを編集' : lang === 'mm' ? 'ပရိုဖိုင် ပြင်ရန်' : 'Edit Profile'}
              </button>
              <button type="button" onClick={startCalcForOther}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-fg transition hover:bg-white/20">
                <Search size={15} /> {lang === 'ja' ? '別の人を鑑定する' : lang === 'mm' ? 'အခြားသူအတွက် တွက်ရန်' : 'Calculate for someone else'}
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
            ← {lang === 'ja' ? 'ダッシュボードに戻る' : lang === 'mm' ? 'ကျွန်ုပ်၏ Dashboard သို့ ပြန်သွားရန်' : 'Back to my dashboard'}
          </button>
        )}

        {!showDashboard && (<>
          {/* Fallback prompt — signed in but no saved birth profile */}
          {customerToken && profile && !profile.hasProfile && !otherMode && (
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 rounded-2xl border border-accent/30 bg-accent/10 px-5 py-4 text-sm leading-relaxed text-accent-light no-print sm:flex-row sm:items-center sm:justify-between">
              <span>{lang === 'ja' ? 'アカウントにはまだ出生プロフィールがありません — 追加するか、下のフォームをご利用ください。' : lang === 'mm' ? 'သင့်အကောင့်တွင် မွေးဇာတာ ပရိုဖိုင် မရှိသေးပါ။ ပရိုဖိုင် ထည့်ပါ (သို့) အောက်ရှိ ဖောင်တွင် ဖြည့်ပါ။' : 'Your account has no birth profile yet — add one, or use the form below.'}</span>
              <button type="button" onClick={() => customerPanelRef.current?.openProfileEdit()}
                className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-amber-600 shadow-md px-4 py-2 text-sm font-semibold text-amber-50 transition hover:brightness-110 sm:self-auto">
                <Pencil size={15} /> {lang === 'ja' ? 'プロフィールを追加' : lang === 'mm' ? 'ပရိုဖိုင် ထည့်ရန်' : 'Add Profile'}
              </button>
            </div>
          )}
          {/* ── How to use (accordion) + form title ── */}
          <div className="mx-auto w-full max-w-3xl no-print">
            <div className="overflow-hidden rounded-2xl border border-accent/25 bg-accent/[0.05]">
              <button type="button" onClick={() => setHowtoOpen((o) => !o)} aria-expanded={howtoOpen}
                className="flex w-full items-center justify-between gap-2 px-5 py-3.5 text-left transition hover:bg-accent/[0.08]">
                <span className="flex items-center gap-2 font-groovy text-base text-fg"><Info size={16} className="text-accent" /> {lang === 'ja' ? '使い方' : lang === 'mm' ? 'အသုံးပြုနည်း' : 'How to use'}</span>
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
              {L('Enter your birth details to check your chart', 'မိမိရဲ့ မွေးဇာတာစစ်ဆေးရန် အချက်အလက်များကို အပြည့်အစုံဖြည့်သွင်းပါ', 'ホロスコープを確認するため、出生情報をご入力ください')}
            </h2>
          </div>

          {/* ── Form (centered on top; results span the full page below) ── */}
          <form onSubmit={submit} id="vedin-form" className="glass-card mx-auto w-full max-w-3xl scroll-mt-24 p-6 no-print">
            <WizardProgress lang={lang} step={step} />

            <AnimatePresence mode="wait" initial={false}>
            <m.div key={step}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>

            {step === 1 && (<>
            <div className="mb-3 grid grid-cols-2 gap-3">
              <label><span className={labelCls}>{t.fldName} <span className="text-coral">*</span></span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder={L('Full name', 'အမည်', 'お名前')}
                  className={`${field} ${!name.trim() ? 'border-coral/40' : ''}`} /></label>
              <label><span className={labelCls}>{t.fldGender}</span>
                <select value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female')} className={field}>
                  <option value="male" className="text-black">{t.male}</option>
                  <option value="female" className="text-black">{t.female}</option>
                </select></label>
            </div>
            </>)}

            {step === 3 && (<>
            <label className="relative block">
              <span className={labelCls}>{L('Birth place', 'မွေးဖွားရာ မြို့/ဇာတိ', '出生地')} <span className="text-coral">*</span></span>
              <span className="relative mt-1.5 block">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input value={place} onChange={(e) => geo.search(e.target.value)} placeholder={L('Search a city…', 'မြို့ ရှာရန်…', '都市を検索…')}
                  className={`w-full rounded-xl border bg-white/5 py-2.5 pl-9 pr-8 text-sm text-fg outline-none transition focus:border-accent/50 ${placeConfirmed ? 'border-jade/50' : 'border-coral/40'}`} />
                {geo.searching
                  ? <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted" />
                  : placeConfirmed && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-jade">✓</span>}
              </span>
              {/* A failed lookup used to render identically to "no such city" — say which it is. */}
              {geo.error && (
                <span className="mt-1 block font-mono text-[10px] text-coral">{L('City search is unavailable right now — try again, or pick from the quick locations below.', 'မြို့ရှာဖွေမှု ခေတ္တ ရပ်နားနေပါသည်။ ထပ်စမ်းကြည့်ပါ သို့မဟုတ် အောက်ရှိ မြို့များမှ ရွေးပါ။', '都市検索は現在利用できません。もう一度お試しいただくか、下のクイック選択からお選びください。')}</span>
              )}
              {!placeConfirmed && place.trim().length > 0 && !geo.searching && !geo.error && (
                <span className="mt-1 block font-mono text-[10px] text-coral">{L('Pick a city from the list.', 'စာရင်းထဲမှ မြို့တစ်ခုကို ရွေးချယ်ပါ။', 'リストから都市を選択してください。')}</span>
              )}
              {geo.results.length > 0 && (
                <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-white/15 bg-surface/95 backdrop-blur-md">
                  {geo.results.map((g, i) => (
                    <li key={i}><button type="button" onClick={() => geo.select(g)}
                      className="block w-full px-3 py-2 text-left text-xs text-fg/90 transition hover:bg-accent/15">{g.display_name}</button></li>
                  ))}
                </ul>
              )}
            </label>

            <div className="mt-4">
              <span className={labelCls}>{L('Quick locations', 'မြို့များ အမြန်ရွေးရန်', 'クイック選択')}</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button key={p.label} type="button" onClick={() => applyPreset(p)}
                    className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-muted transition hover:border-accent/40 hover:text-fg">
                    <MapPin size={11} /> {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive map — click or drag the pin to set the exact birth spot */}
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className={labelCls}>{L('Fine-tune on the map', 'မြေပုံပေါ်တွင် အတိအကျ ရွေးရန်', '地図で微調整')}</span>
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted"><MousePointerClick size={11} /> {L('Click or drag the pin', 'နှိပ်၍ (သို့) ဆွဲ၍ ရွှေ့ပါ', 'ピンをクリックまたはドラッグ')}</span>
              </div>
              <Suspense fallback={<div className="flex h-64 w-full items-center justify-center rounded-xl border border-white/12 bg-white/[0.03] text-xs text-muted"><Loader2 size={16} className="mr-2 animate-spin" /> {L('Loading map…', 'မြေပုံ ဖွင့်နေသည်…', '地図を読み込み中…')}</div>}>
                <BirthPlaceMap lat={Number(lat) || 0} lon={Number(lon) || 0} onPick={pickFromMap} />
              </Suspense>
              {placeConfirmed && (
                <p className="mt-1.5 font-mono text-[10px] text-muted">
                  {L('Location', 'နေရာ', '位置')} — {(Number(lat) || 0).toFixed(3)}, {(Number(lon) || 0).toFixed(3)} · {tz}
                </p>
              )}
            </div>

            <details open={advancedOpen} onToggle={(e) => setAdvancedOpen((e.target as HTMLDetailsElement).open)}
              className="mt-3 rounded-xl border border-white/12 bg-white/[0.02] p-3">
              <summary className="cursor-pointer select-none font-mono text-[11px] uppercase tracking-wider text-muted transition hover:text-fg">
                {L('Advanced settings', 'အဆင့်မြင့် ဆက်တင်များ', '詳細設定')}
              </summary>
              <p className="mt-2 font-mono text-[10px] leading-relaxed text-muted">
                {lang === 'ja' ? 'お選びいただいた都市から自動的に取得しています — 必要とわかっている場合のみ変更してください。' : lang === 'mm' ? 'မြို့ရွေးချယ်မှုမှ အလိုအလျောက် ရယူထားပါသည်။ လိုအပ်မှသာ ပြင်ပါ။' : 'Derived automatically from the city you picked — only change these if you know you need to.'}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
              <label><span className={labelCls}>{L('Latitude', 'လတ္တီတွဒ်', '緯度')}</span>
                <input type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} required className={field} /></label>
              <label><span className={labelCls}>{L('Longitude', 'လောင်ဂျီတွဒ်', '経度')}</span>
                <input type="number" step="any" value={lon} onChange={(e) => setLon(e.target.value)} required className={field} /></label>
            </div>
            <label className="mt-3 block"><span className={labelCls}>{L('Time zone', 'အချိန်ဇုန်', 'タイムゾーン')}</span>
              <select value={tz} onChange={(e) => setTz(e.target.value)} className={field}>
                {[...new Set([tz, ...TZ_OPTIONS])].map((z) => <option key={z} value={z} className="text-black">{z}</option>)}
              </select>
            </label>
            <label className="mt-3 block"><span className={labelCls}>{L('Ayanamsa', 'အယနန္သ (Ayanamsa)', 'アヤナムシャ')}</span>
              <select value={ayanamsa} onChange={(e) => setAyanamsa(e.target.value)} className={field}>
                <option value="lahiri" className="text-black">Lahiri (default)</option>
                <option value="raman" className="text-black">Raman</option>
                <option value="kp" className="text-black">KP (Krishnamurti)</option>
                <option value="truechitra" className="text-black">True Chitra</option>
              </select>
            </label>
            </details>

            <label className={`mt-4 flex items-start gap-2 rounded-xl border p-3 text-xs leading-relaxed transition ${consent ? 'border-jade/40 bg-jade/5 text-muted' : 'border-coral/40 bg-coral/5 text-fg/80'}`}>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-accent" />
              <span><span className="text-coral">*</span> {L("I consent to securely storing my birth details to assist the future astrologer's readings.", 'အနာဂါတ်ဟောကိန်းများပိုမိုတိကျမှန်ကန်စွာ အထောက်အကူအတွက် ကျွန်ုပ်၏ မွေးဇာတာ အချက်အလက်ကို လုံခြုံစွာ သိမ်းဆည်းရန် သဘောတူပါသည်။', '今後の鑑定に役立てるため、私の出生情報を安全に保存することに同意します。')}</span>
            </label>

            <button type="submit" disabled={loading || !canSubmit}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 shadow-md px-5 py-3 text-sm font-semibold text-amber-50 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none">
              {loading ? <><Loader2 size={16} className="animate-spin" /> {L('Calculating…', 'တွက်ချက်ပေးနေပါသည်…', '作成中…')}</> : <><Sparkles size={16} /> {L('Generate Chart', 'ဇာတာ တွက်မည်', 'ホロスコープを作成')}</>}
            </button>
            {!canSubmit && (
              <ul className="mt-2 space-y-1">
                {!name.trim() && <li className="flex items-start gap-1.5 font-mono text-[11px] leading-relaxed text-coral"><span>•</span>{L('Please enter a name.', 'အမည် ဖြည့်သွင်းပါ။', 'お名前をご入力ください。')}</li>}
                {!placeConfirmed && <li className="flex items-start gap-1.5 font-mono text-[11px] leading-relaxed text-coral"><span>•</span>{L('Search and select your birth city from the list.', 'မွေးဖွားရာ မြို့/ဇာတိကို ရှာဖွေ၍ စာရင်းထဲမှ ရွေးချယ်ပါ။', '出生地の都市を検索し、リストから選択してください。')}</li>}
                {!consent && <li className="flex items-start gap-1.5 font-mono text-[11px] leading-relaxed text-coral"><span>•</span>{L('Please agree to the data-storage consent.', 'အချက်အလက်သိမ်းဆည်းခွင့်ကို သဘောတူညီပေးပါ။', 'データ保存への同意をお願いします。')}</li>}
              </ul>
            )}
            </>)}

            {step === 2 && (<>
            <div className="grid grid-cols-2 gap-3">
              <label><span className={labelCls}>{L('Date of birth', 'မွေးသက္ကရာဇ်', '生年月日')}</span>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={field} /></label>
              <label><span className={labelCls}>{L('Time (24h)', 'မွေးချိန် (၂၄ နာရီ)', '出生時刻（24時間制）')}</span>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required disabled={timeUnknown}
                  className={`${field} ${timeUnknown ? 'cursor-not-allowed opacity-40' : ''}`} /></label>
            </div>

            <label className={`mt-3 flex items-start gap-2 rounded-xl border p-3 text-xs leading-relaxed transition ${timeUnknown ? 'border-accent/40 bg-accent/5' : 'border-white/12 bg-white/5'}`}>
              <input type="checkbox" checked={timeUnknown} onChange={(e) => setTimeUnknownSafely(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-accent" />
              <span className="text-muted">
                {L("I don't know my exact birth time", 'မွေးချိန် အတိအကျ မသိပါ', '正確な出生時刻がわかりません')}
              </span>
            </label>

            {timeUnknown && (<>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/45 bg-amber-400/10 px-3 py-1 font-mono text-[11px] font-semibold text-amber-300">
                  <Info size={12} /> {L('Confidence — Moon-based', 'ယုံကြည်စိတ်ချမှု — စန်းအခြေခံ', '信頼度 — 月中心')}
                </span>
                <span className="font-mono text-[10px] text-muted">{L('Cast for 12:00 noon', 'မွန်းတည့် ၁၂:၀၀ ဖြင့် တွက်မည်', '正午12:00で作成')}</span>
              </div>
              <p className="mt-2 flex items-start gap-1.5 rounded-xl border border-accent/30 bg-accent/5 px-3 py-2 font-mono text-[11px] leading-relaxed text-muted">
                <Info size={13} className="mt-0.5 shrink-0 text-accent-light" />
                {lang === 'ja' ? 'ラグナ（アセンダント）とハウスの境界がずれる可能性があるため、信頼できません — 月（チャンドラ）を基準とした鑑定をご参照ください。' : lang === 'mm' ? 'လဂ်နှင့် အိမ်ခွဲများ ရွှေ့ပြောင်းသွားနိုင်သဖြင့် တိကျမည် မဟုတ်ပါ — စန်း (Chandra) အခြေခံ ဟောကိန်းကိုသာ အားကိုးပါ။' : 'The Ascendant and house cusps may shift, so they will not be reliable — rely on the Moon-based (Chandra) reading instead.'}
              </p>
            </>)}

            </>)}
            </m.div>
            </AnimatePresence>

            {/* Blockers are reported on the step that caused them, not as a list
                at the bottom of a screen the querent has already scrolled past. */}
            {step < 3 && currentStepError && (
              <p className="mt-3 flex items-start gap-1.5 font-mono text-[11px] leading-relaxed text-coral">
                <span>•</span>{currentStepError}
              </p>
            )}

            <div className="mt-4 flex items-center gap-2">
              {step > 1 && (
                <button type="button" onClick={() => setStep((s) => s - 1)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-muted transition hover:border-accent/40 hover:text-fg">
                  <ChevronLeft size={15} /> {L('Back', 'နောက်သို့', '戻る')}
                </button>
              )}
              {step < 3 && (
                <button type="button" disabled={!!currentStepError} onClick={() => setStep((s) => s + 1)}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-600 shadow-md px-5 py-2.5 text-sm font-semibold text-amber-50 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none">
                  {L('Continue', 'ဆက်လက်', '次へ')} <ChevronRight size={15} />
                </button>
              )}
            </div>

            {error && <p className="mt-3 rounded-xl border border-coral/40 bg-coral/10 px-3 py-2 font-mono text-xs text-coral">{error}</p>}
            <p className="mt-4 font-mono text-[10px] leading-relaxed text-muted">{t.disclaimer}</p>
          </form>
        </>)}

        {/* ── Result ── */}
        <div className="min-w-0">
          {!data && !loading && (
            <div id="vedin-charts" className="scroll-mt-24 no-print">
              {(tab === 'ai' || tab === 'timeline' || tab === 'vargas' || tab === 'ashtaka' || tab === 'shadbala') ? (
                <TopicExplainer topic={tab} lang={lang} onCast={scrollToForm} />
              ) : (
                <div className="glass-card flex min-h-[300px] items-center justify-center p-8 text-center text-sm text-muted">
              {L('Enter birth details to see the reading and the D1 / D9 / D10 / D7 charts.', 'မွေးသက္ကာရာဇ်နှင့်အချက်အလက်ထည့်၍ ဟောစာတမ်း၊ ဇာတာခွင်များ (D1/D9/D10/D7) ကြည့်ရှုပါ။', '出生情報をご入力いただくと、鑑定と D1 / D9 / D10 / D7 のチャートをご覧いただけます。')}
                </div>
              )}
            </div>
          )}

          {loading && !data && <ChartSkeleton lang={lang} />}

          {data && reading && (
            <div className="min-w-0 space-y-5 scroll-mt-24" id="vedin-charts">
              {/* header + full-reading PDF download */}
              <div className="flex flex-col gap-3 no-print sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-groovy text-lg text-fg">{place || t.portalTitle}</h2>
                <button type="button" onClick={downloadPdf}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-600 shadow-md px-4 py-2 text-xs font-semibold text-amber-50 transition hover:brightness-110">
                  <Download size={14} /> {L('Download Full Natal Chart PDF', 'မွေးဇာတာ ဟောစာတမ်း PDF အပြည့်အစုံ ရယူရန်တောင်းဆိုပါ', '出生図の詳細鑑定PDFをダウンロード')}
                </button>
              </div>
              <ChartSummaryHero
                data={data}
                lang={lang}
                mahadashaLord={reading.lord}
                naynan={querent?.nn}
                name={querent?.name}
                timeUnknown={timeUnknown}
              />
              <TabBar
                lang={lang}
                tabs={TABS}
                tab={tab}
                onTab={setTab}
                chartStyle={chartStyle}
                onChartStyle={setChartStyle}
              />

              {/* ── DETAILED READING (manual-approval workflow) ── */}
              {(tab === 'ai' || printAll) && (
                <ReadingRequestPanel
                  ref={readingRef}
                  lang={lang}
                  token={customerToken}
                  status={reading$.status}
                  markdown={reading$.markdown}
                  requestId={reading$.requestId}
                  loading={reading$.loading}
                  error={reading$.error}
                  info={reading$.info}
                  showDashboard={showDashboard}
                  onRequest={reading$.request}
                  onOpenAuth={openAuth}
                  onDownloadPdf={downloadReadingPdf}
                  pdfBusy={pdfBusy}
                />
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
                    <h3 className="mb-3 font-groovy text-lg text-fg">{lang === 'ja' ? '人生の七領域' : lang === 'mm' ? 'ဘဝကဏ္ဍ ၇ ခု' : 'Seven Life Areas'}</h3>
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
                                  <p className={labelCls}>{lang === 'ja' ? 'ハウスの支配星' : lang === 'mm' ? 'အိမ်ရှင်သခင်' : 'House lord'}</p>
                                  <p className="mt-0.5 text-sm text-fg/90">{planetName(lp.name, lang)} · {signLabel(lp.sign, lang)} <span className="text-muted">({lang === 'mm' ? `${lp.house} တန့်` : `H${lp.house}`})</span></p>
                                  {lp.dignity !== '-' && <p className="text-[11px] text-accent-light">{dignityLabel(lp.dignity, lang)}</p>}
                                </div>
                                <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                                  <p className={labelCls}>{lang === 'ja' ? 'D9 ナヴァムシャ' : lang === 'mm' ? 'D9 နဝင်း' : 'D9 Navamsa'}</p>
                                  <p className="mt-0.5 text-sm text-fg/90">{signLabel(lp.navamsaSign, lang)}</p>
                                </div>
                                <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                                  <p className={labelCls}>{lang === 'ja' ? 'D10 ダシャムシャ' : lang === 'mm' ? 'D10 ဒသံသ' : 'D10 Dasamsa'}</p>
                                  <p className="mt-0.5 text-sm text-fg/90">{signLabel(lp.vargas.D10, lang)}</p>
                                </div>
                              </div>
                            )}

                            {a.karakas.length > 0 && (
                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <span className={labelCls}>{lang === 'ja' ? 'カラカ' : lang === 'mm' ? 'ကာရက' : 'Karakas'}:</span>
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
                                <span className="font-semibold">{lang === 'ja' ? '現在の周期' : lang === 'mm' ? 'လက်ရှိကာလ၏ သက်ရောက်မှုများ' : 'Current period'}: </span>{cur.text}
                              </div>
                            )}

                            <ul className="mt-3 space-y-1">
                              {a.points.map((pt, i) => <li key={i} className="text-xs leading-relaxed text-muted">• {pt}</li>)}
                            </ul>

                            {needsRemedy && (
                              <button type="button" onClick={() => openRemedy(a.label)}
                                className="no-print mt-3 inline-flex items-center gap-1.5 self-start rounded-full border border-coral/40 bg-coral/10 px-3 py-1.5 text-xs text-coral transition hover:bg-coral/20">
                                <Sparkles size={12} /> {lang === 'ja' ? 'この領域の対策をリクエスト' : lang === 'mm' ? 'ဤကဏ္ဍအတွက် ယတြာ တောင်းယူရန်' : 'Request a remedy for this area'}
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {data.yogas.length > 0 && (
                    <div className="glass-card p-5">
                      <h3 className="mb-3 font-groovy text-lg text-fg">{lang === 'ja' ? 'あなたのチャートのヨーガ' : lang === 'mm' ? 'ဇာတာတွင် တွေ့ရတတ်သော ယောဂများ' : 'Yogas in your chart'}</h3>
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
                    <h3 className="mb-1 font-groovy text-base text-fg">{lang === 'ja' ? 'ヨーガについて' : lang === 'mm' ? 'ယောဂများ အကြောင်း အသေးစိတ်ဖတ်ရှုရန်' : 'About Yogas'}</h3>
                    <p className="mb-3 text-xs leading-relaxed text-muted">{lang === 'ja' ? 'ヨーガとは、特定の惑星の配置や結びつきによって生じる特別な効果です。主なヨーガを以下に説明します。' : lang === 'mm' ? 'ယောဂဆိုသည်မှာ ဂြိုဟ်များ၏ တည်နေရာ/ဆက်စပ်မှုကြောင့် ဖြစ်ပေါ်လာသော အထူးအကျိုးသက်ရောက်မှုများဖြစ်သည်။ အဓိကယောဂများကို အောက်တွင် ရှင်းပြပေးထားသည်။' : 'A yoga is a special result formed by particular planetary placements or links. The main yogas are explained below.'}</p>
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
                          <h3 className="font-groovy text-lg text-fg">{lang === 'ja' ? '現在のプラティヤンタル' : lang === 'mm' ? 'လက်ရှိ ပစ္စန္တရဒသာ' : 'Current Pratyantar'}</h3>
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
                      <span className="rounded bg-jade/15 px-1.5 py-0.5 text-jade">{lang === 'ja' ? '吉' : lang === 'mm' ? 'ကောင်း' : 'benefic'}</span>
                      <span className="rounded bg-coral/15 px-1.5 py-0.5 text-coral">{lang === 'ja' ? '注意 / サデサティ' : lang === 'mm' ? 'သတိ / သာဓေသတီ' : 'caution / Sade Sati'}</span>
                      <span className="text-muted">{lang === 'ja' ? '· 月から数えたトランジットハウス' : lang === 'mm' ? '· ဂြိုဟ်သွားအိမ်ကို စန်းမှ ရေတွက်သော်' : '· transit house counted from the Moon'}</span>
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
                    <span className={labelCls}>{lang === 'ja' ? '分割図' : lang === 'mm' ? 'ဇာတာခွဲများကို ရွေးချယ်ရန်' : 'Divisional chart'}</span>
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
                    <h3 className="mb-3 font-groovy text-base text-fg">{lang === 'ja' ? '各分割図の意味（D1–D60）' : lang === 'mm' ? 'ဇာတာခွဲများ၏ အဓိပ္ပာယ်များ (D1–D60)' : 'What each Divisional Chart means (D1–D60)'}</h3>
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
              <ChatPanel
                ref={remedyRef}
                lang={lang}
                token={customerToken}
                messages={chat.messages}
                input={chat.input}
                setInput={chat.setInput}
                busy={chat.busy}
                endRef={chat.endRef}
                onSend={chat.send}
                onOpenAuth={openAuth}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom language switcher — mirrors the header so users needn't scroll back up */}
      <div className="mt-12 flex justify-center no-print">
        <LanguageSwitcher />
      </div>

      {/* ── Methodology (a genuine differentiator) + honest disclaimer ── */}
      <footer className="mt-8 border-t border-accent/15 pt-6 text-center">
        <p className="font-mono text-[11px] tracking-wide text-accent-light">
          Sidereal · Lahiri ayanamsa (1955) · Whole-Sign houses · Mean node · Swiss Ephemeris
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-muted">
          {lang === 'ja' ? '免責事項：これらの占星術チャートは、古典的なインド占星術の伝統的原則に従って正確に計算されています。ただし、占星術は科学的に検証された学問ではありません。したがって、これらの鑑定を専門的な医療・法律・財務上の助言の代わりとして用いないでください。人生の重要な決定については、しかるべき専門家にご相談ください。ここに示される結果は、あくまで自己省察・文化的理解・個人的関心のためのものです。' : lang === 'mm' ? 'အသိပေးချက် : ဇာတာများကို ဂန္ထဝင် ဇျောတိသကျမ်းများ၏ နည်းစနစ်များအတိုင်း တိကျစွာ တွက်ချက်ထားပါသည်။ သို့သော် ဗေဒင်ပညာသည် သိပ္ပံနည်းကျ အတည်ပြုထားခြင်း မရှိသဖြင့် — ဆေးဘက်ဆိုင်ရာ၊ ဥပဒေရေးရာ (သို့မဟုတ်) ငွေကြေးဆိုင်ရာ ကိစ္စရပ်များတွင် မျက်စိမှိတ်ယုံကြည်၍ တထစ်ချ ဆုံးဖြတ်ချက် မချသင့်ပါ။ အရေးကြီးသော ကိစ္စရပ်များအတွက် သက်ဆိုင်ရာ ကျွမ်းကျင်ပညာရှင်များနှင့်သာ ဆွေးနွေးတိုင်ပင်ပါ။ ဤတွက်ချက်မှု ရလဒ်များသည် မိမိကိုယ်ကို ပြန်လည်သုံးသပ်ရန်၊ ယဉ်ကျေးမှုအမွေအနှစ်အား လေ့လာရန်နှင့် ပုဂ္ဂိုလ်ရေးစိတ်ဝင်စားမှုအတွက်သာ ရည်ရွယ်တင်ဆက်ခြင်း ဖြစ်ပါသည်။' : 'Disclaimer: These astrological charts are precisely calculated according to the traditional principles of classical Vedic astrology. However, astrology is not a scientifically validated discipline. Therefore, these readings should not be used as a substitute for professional medical, legal, or financial advice. Please consult relevant qualified professionals for major life decisions. The results presented here are strictly for self-reflection, cultural appreciation, and personal interest.'}
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Link to="/algorithms" className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 font-mono text-[11px] text-accent-light transition hover:bg-accent/20">
            <Star size={12} /> {lang === 'ja' ? 'アルゴリズム（CS）→' : lang === 'mm' ? 'algorithm များ (CS) →' : 'The algorithms (CS) →'}
          </Link>
          <Link to="/research" className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 font-mono text-[11px] text-accent-light transition hover:bg-accent/20">
            <Star size={12} /> {lang === 'ja' ? '反証可能な研究プロトコル →' : lang === 'mm' ? 'တိုင်းတာနိုင်သော သုတေသနဆိုင်ရာ လုပ်ထုံးလုပ်နည်းများ →' : 'Falsifiable research protocol →'}
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
      {reading$.showApprovedModal && (
        <div className="no-print fixed inset-0 z-[70] flex items-center justify-center p-4"
          style={{ background: 'rgba(6,5,12,0.72)', backdropFilter: 'blur(6px)' }}
          onClick={reading$.dismissApprovedModal} role="dialog" aria-modal="true">
          <div onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-amber-500/30 bg-[#ffffff] shadow-xl dark:border-amber-500/25 dark:bg-neutral-900/95 p-6 text-center sm:p-8"
            style={{ boxShadow: '0 20px 60px -20px rgba(0,0,0,0.7)' }}>
            <div className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }} />
            <button type="button" onClick={reading$.dismissApprovedModal} aria-label="Close"
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-muted transition hover:bg-fg/10 hover:text-fg">
              <X size={18} />
            </button>
            <div className="relative">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-amber-500/40 bg-amber-500/10">
                <CheckCircle2 size={34} className="text-emerald-500" />
              </span>
              <h3 className="mt-4 font-groovy text-xl text-fg sm:text-2xl">
                {lang === 'ja' ? '成功' : lang === 'mm' ? 'အောင်မြင်ပါသည်။' : 'Success'}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-fg/90">
                {lang === 'ja' ? '占星術師があなたの鑑定を確認・承認しました。' : lang === 'mm' ? 'ဆရာမှ သင့်ဇာတာအား အသေးစိတ် စစ်ဆေးအတည်ပြုပြီးဖြစ်ပါသည်။' : 'The Master has verified and approved your reading.'}
              </p>
              <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm leading-relaxed text-amber-800 dark:text-amber-100">
                {lang === 'ja'
                  ? '下の「詳細な鑑定」タブをクリックしてご覧ください。'
                  : lang === 'mm'
                  ? "အောက်ပါ 'အသေးစိတ် ဟောစာတမ်း' ခလုတ်ကို နှိပ်၍ ဝင်ရောက်ဖတ်ရှုနိုင်ပါပြီ။"
                  : "Please click the 'Detailed Reading' tab below to view it."}
              </p>
              <button type="button" onClick={() => { setTab('ai'); reading$.dismissApprovedModal() }}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-6 py-2.5 text-sm font-bold text-amber-950 shadow-lg shadow-amber-500/40 transition hover:brightness-110">
                <ScrollText size={16} /> {lang === 'ja' ? '閉じる' : lang === 'mm' ? 'ဆက်လက်ရန်' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
