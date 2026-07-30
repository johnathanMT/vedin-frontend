import { useEffect, useMemo, useRef, useState } from 'react'
import Globe, { type GlobeMethods } from 'react-globe.gl'
import * as THREE from 'three'
import { feature } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import countriesTopoRaw from 'world-atlas/countries-110m.json'
import { SITE } from '../config/site'
import { useInView } from '../hooks/useInView'
import type { CountryVisits, CountryBreakdown, VisitorStats } from '../types/api'

/**
 * VisitorGlobe — premium 3D world map (react-globe.gl / three.js) shown below
 * the "Highlights in Motion" reel. Country borders + continents are drawn from a
 * bundled, lightweight world GeoJSON (world-atlas 110m). The visitor's whole
 * country is filled/raised with the theme accent glow. Dark theme, auto-spins,
 * and keeps the neon overlay (Total Operators + Current Connection).
 *
 * No network beyond ipapi.co (geo) + the visitor-count API: the GeoJSON is
 * bundled, so there's nothing extra to whitelist in the CSP.
 */

// The world-atlas JSON is untyped at the import boundary; assert it to Topology.
interface CountryProps { name?: string }
type CountryFeature = Feature<Geometry, CountryProps>

const topo = countriesTopoRaw as unknown as Topology
// Bundled world polygons (177 countries). Converted from TopoJSON once.
const COUNTRIES: CountryFeature[] = (
  feature(topo, topo.objects.countries as GeometryCollection) as FeatureCollection<Geometry, CountryProps>
).features

// —— Country matching (ipapi country_name ↔ GeoJSON properties.name) ——————————
const norm = (s: string | null | undefined): string => String(s || '').toLowerCase().replace(/[^a-z]/g, '')
// Aliases for names that differ between ipapi and Natural Earth (world-atlas).
const ALIASES: Record<string, string> = {
  unitedstates: 'unitedstatesofamerica',
  usa: 'unitedstatesofamerica',
  democraticrepublicofthecongo: 'demrepcongo',
  republicofthecongo: 'congo',
  bosniaandherzegovina: 'bosniaandherz',
  dominicanrepublic: 'dominicanrep',
  equatorialguinea: 'eqguinea',
  centralafricanrepublic: 'centralafricanrep',
  southsudan: 'ssudan',
  westernsahara: 'wsahara',
  solomonislands: 'solomonis',
}
function matchCountry(name: string | null | undefined): CountryFeature | null {
  if (!name) return null
  const target = ALIASES[norm(name)] || norm(name)
  // 1) exact normalized match
  let f = COUNTRIES.find((c) => norm(c.properties.name) === target)
  if (f) return f
  // 2) fuzzy: one name contains the other (handles abbreviations)
  f = COUNTRIES.find((c) => {
    const cn = norm(c.properties.name)
    return cn !== '' && (cn.includes(target) || target.includes(cn))
  })
  return f || null
}

interface Rgb { r: number; g: number; b: number }
// Active theme accent ("--accent" = "R G B") → { r, g, b } 0..255.
function readAccent(): Rgb {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
    const [r, g, b] = v.split(/\s+/).map(Number)
    if ([r, g, b].every(Number.isFinite)) return { r, g, b }
  } catch { /* ignore */ }
  return { r: 184, g: 134, b: 11 } // Batman gold
}

type Dict = Record<string, string>
const T: Record<string, Dict> = {
  en: { badge: 'LIVE NETWORK', title: 'Visitors around the globe', sub: 'Every connection, mapped in real time.', ops: 'Total Operators', conn: 'Current Connection', locating: 'Locating…', unknown: 'Unknown location', byCountry: 'Operators by country' },
  mm: { badge: 'တိုက်ရိုက်ကွန်ရက်', title: 'ကမ္ဘာတစ်ဝှမ်းမှ ဧည့်သည်များ', sub: 'ချိတ်ဆက်မှုတိုင်းကို အချိန်နှင့်တပြေးညီ ပြသထားသည်။', ops: 'စုစုပေါင်း ဧည့်သည်', conn: 'လက်ရှိ ချိတ်ဆက်မှု', locating: 'တည်နေရာရှာနေသည်…', unknown: 'တည်နေရာ မသိ', byCountry: 'နိုင်ငံအလိုက် ဧည့်သည်' },
  jp: { badge: 'ライブネットワーク', title: '世界中からの訪問者', sub: 'すべての接続をリアルタイムで可視化。', ops: '総オペレーター数', conn: '現在の接続', locating: '位置情報を取得中…', unknown: '不明な場所', byCountry: '国別オペレーター' },
  vn: { badge: 'MẠNG TRỰC TIẾP', title: 'Khách truy cập toàn cầu', sub: 'Mọi kết nối, hiển thị theo thời gian thực.', ops: 'Tổng người dùng', conn: 'Kết nối hiện tại', locating: 'Đang định vị…', unknown: 'Vị trí không xác định', byCountry: 'Người dùng theo quốc gia' },
  ne: { badge: 'प्रत्यक्ष नेटवर्क', title: 'विश्वभरका आगन्तुकहरू', sub: 'प्रत्येक जडान, वास्तविक समयमा।', ops: 'कुल आगन्तुक', conn: 'हालको जडान', locating: 'स्थान खोज्दै…', unknown: 'अज्ञात स्थान', byCountry: 'देश अनुसार आगन्तुक' },
  id: { badge: 'JARINGAN LANGSUNG', title: 'Pengunjung di seluruh dunia', sub: 'Setiap koneksi, dipetakan secara real-time.', ops: 'Total Operator', conn: 'Koneksi Saat Ini', locating: 'Mencari lokasi…', unknown: 'Lokasi tidak diketahui', byCountry: 'Pengunjung per negara' },
  zh: { badge: '实时网络', title: '来自全球的访客', sub: '每一次连接，实时呈现。', ops: '访客总数', conn: '当前连接', locating: '正在定位…', unknown: '未知位置', byCountry: '各国访客' },
}

// Status strings for the breakdown panel (kept separate so the panel can always
// render a meaningful state — loading / empty / offline — never just vanish).
const STATUS_T: Record<string, Dict> = {
  en: { connecting: 'Connecting to network…', offline: 'Network unavailable — retrying shortly.', empty: 'No operators logged yet.' },
  mm: { connecting: 'ကွန်ရက်နှင့် ချိတ်ဆက်နေသည်…', offline: 'ကွန်ရက် မရနိုင်ပါ — ပြန်ကြိုးစားနေသည်။', empty: 'ဧည့်သည် မှတ်တမ်းမရှိသေးပါ။' },
  jp: { connecting: 'ネットワークに接続中…', offline: 'ネットワークに接続できません — まもなく再試行します。', empty: 'まだ訪問者の記録はありません。' },
  vn: { connecting: 'Đang kết nối mạng…', offline: 'Mạng không khả dụng — đang thử lại.', empty: 'Chưa có người dùng nào được ghi nhận.' },
  ne: { connecting: 'नेटवर्कमा जडान हुँदै…', offline: 'नेटवर्क उपलब्ध छैन — पुनः प्रयास गर्दै।', empty: 'अहिलेसम्म कुनै आगन्तुक छैन।' },
  id: { connecting: 'Menghubungkan ke jaringan…', offline: 'Jaringan tidak tersedia — mencoba lagi.', empty: 'Belum ada operator tercatat.' },
  zh: { connecting: '正在连接网络…', offline: '网络不可用 — 即将重试。', empty: '暂无访客记录。' },
}

interface FetchResult<T> { ok: boolean; status: number; data: T | null; error?: unknown }
interface FetchOptions { method?: string; timeoutMs?: number; retries?: number }

/**
 * Resilient JSON fetch: AbortController timeout + retry on transient failures
 * (network error or 5xx), which is exactly what a Render free-tier COLD START
 * looks like for the first request after the service has spun down.
 */
async function fetchJson<T = unknown>(url: string, { method = 'GET', timeoutMs = 8000, retries = 2 }: FetchOptions = {}): Promise<FetchResult<T>> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await fetch(url, { method, signal: ctrl.signal })
      clearTimeout(timer)
      if (res.status >= 500 && attempt < retries) {
        await new Promise<void>((r) => setTimeout(r, 1200 * (attempt + 1))) // backoff for cold start
        continue
      }
      const text = await res.text()
      let data: T | null = null
      try { data = text ? (JSON.parse(text) as T) : null } catch { /* non-JSON */ }
      return { ok: res.ok, status: res.status, data }
    } catch (err) {
      clearTimeout(timer)
      if (attempt < retries) { await new Promise<void>((r) => setTimeout(r, 1200 * (attempt + 1))); continue }
      return { ok: false, status: 0, data: null, error: err }
    }
  }
  return { ok: false, status: 0, data: null } // unreachable; satisfies the return type
}

interface VisitorGlobeProps { lang?: string }

type GeoStatus = 'loading' | 'done'
interface Geo { status: GeoStatus; lat: number | null; long: number | null; city: string; country: string }
type StatsStatus = 'loading' | 'ready' | 'empty' | 'error'

// Shape of the bits of ipapi.co/json/ we read (the rest is ignored).
interface IpapiResponse { latitude?: number | string; longitude?: number | string; city?: string; country_name?: string }

export default function VisitorGlobe({ lang = 'en' }: VisitorGlobeProps) {
  const t = T[lang] || T.en
  const globeEl = useRef<GlobeMethods | undefined>(undefined)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(0) // square px
  // Pause the globe's render loop + spin when it scrolls out of view (saves GPU/battery).
  const [viewRef, inView] = useInView<HTMLElement>({ threshold: 0.05 })

  const [geo, setGeo] = useState<Geo>({ status: 'loading', lat: null, long: null, city: '', country: '' })
  const [visits, setVisits] = useState<number | null>(null)
  const [display, setDisplay] = useState(0)
  const [countries, setCountries] = useState<CountryVisits[]>([])
  const [statsStatus, setStatsStatus] = useState<StatsStatus>('loading')
  const st = STATUS_T[lang] || STATUS_T.en

  const ac = useMemo(readAccent, [])
  const userCountry = useMemo<CountryFeature | null>(() => matchCountry(geo.country), [geo.country])
  const globeMaterial = useMemo(() => new THREE.MeshPhongMaterial({ color: '#0b0b14' }), [])

  // 1) VISIT COUNT + COUNTRY BREAKDOWN — runs once geolocation has settled, so
  //    the hit can be attributed to the visitor's country. Resilient to Render
  //    cold starts (fetchJson retries) and verbosely logged for diagnosis.
  useEffect(() => {
    if (geo.status !== 'done') return
    const base = SITE.apiUrl
    let cancelled = false
    setStatsStatus('loading')
    ;(async () => {
      // a) count this visit once per browser session (with country), else read.
      let counted = false
      try { counted = sessionStorage.getItem('mtn_visit_counted') === '1' } catch { /* ignore */ }
      const countUrl = counted
        ? `${base}/api/visitors`
        : `${base}/api/visitors/hit?country=${encodeURIComponent(geo.country || '')}`
      const countRes = await fetchJson<VisitorStats>(countUrl, { method: counted ? 'GET' : 'POST' })
      if (!cancelled && countRes.ok && typeof countRes.data?.totalVisits === 'number') {
        setVisits(countRes.data.totalVisits)
        try { sessionStorage.setItem('mtn_visit_counted', '1') } catch { /* ignore */ }
      }

      // b) country breakdown — drives the always-visible panel's state.
      const cRes = await fetchJson<CountryBreakdown>(`${base}/api/visitors/countries`)
      if (cancelled) return
      if (cRes.ok && Array.isArray(cRes.data?.countries)) {
        setCountries(cRes.data.countries)
        setStatsStatus(cRes.data.countries.length ? 'ready' : 'empty')
      } else {
        console.error('[VisitorGlobe] breakdown unavailable — is /api/visitors deployed on the backend?')
        setStatsStatus('error')
      }
    })()
    return () => { cancelled = true }
  }, [geo.status, geo.country])

  // 2) GEOLOCATION — coarse, IP-based, free.
  useEffect(() => {
    let done = false
    const finish = (partial: Partial<Geo>) => {
      if (done) return
      done = true
      setGeo({ status: 'done', lat: null, long: null, city: '', country: '', ...partial })
    }
    const timer = setTimeout(() => finish({}), 2500)
    fetch('https://ipapi.co/json/')
      .then((r) => r.json() as Promise<IpapiResponse>)
      .then((d) => {
        const lat = Number(d?.latitude)
        const long = Number(d?.longitude)
        const valid = Number.isFinite(lat) && Number.isFinite(long) && Math.abs(lat) <= 90 && Math.abs(long) <= 180
        finish({
          lat: valid ? lat : null,
          long: valid ? long : null,
          city: d?.city || '',
          country: d?.country_name || '',
        })
      })
      .catch(() => finish({}))
    return () => clearTimeout(timer)
  }, [])

  // 3) COUNTER ANIMATION.
  useEffect(() => {
    if (visits == null) return
    let raf = 0
    const start = performance.now()
    const dur = 1400
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur)
      setDisplay(Math.round(visits * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [visits])

  // 4) RESPONSIVE SQUARE SIZE.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setSize(el.clientWidth))
    ro.observe(el)
    setSize(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  // 5) AUTO-SPIN once mounted — and PAUSE the whole render loop when off-screen.
  //    react-globe.gl's pauseAnimation() stops its internal requestAnimationFrame,
  //    so zero GPU/CPU is spent while the globe isn't visible.
  useEffect(() => {
    const g = globeEl.current
    if (!g || !size) return
    const controls = g.controls()
    controls.autoRotateSpeed = 0.6
    controls.enableZoom = false
    controls.autoRotate = inView
    if (inView) g.resumeAnimation()
    else g.pauseAnimation()
  }, [size, inView])

  // 6) FLY the camera to the visitor's coordinates when known.
  useEffect(() => {
    if (globeEl.current && geo.lat != null && geo.long != null) {
      globeEl.current.pointOfView({ lat: geo.lat, lng: geo.long, altitude: 2.2 }, 1200)
    }
  }, [geo.lat, geo.long])

  const accentRgb = `rgb(${ac.r}, ${ac.g}, ${ac.b})`
  const capColor = (d: object): string =>
    d === userCountry ? `rgba(${ac.r}, ${ac.g}, ${ac.b}, 0.92)` : 'rgba(255, 255, 255, 0.07)'
  const sideColor = (d: object): string =>
    d === userCountry ? `rgba(${ac.r}, ${ac.g}, ${ac.b}, 0.35)` : 'rgba(0, 0, 0, 0.12)'

  const connectionText =
    geo.status === 'loading'
      ? t.locating
      : ([geo.city, geo.country].filter(Boolean).join(', ') || t.unknown)

  return (
    <section id="network" ref={viewRef} className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/10 blur-[160px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent/90">{t.badge}</p>
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold leading-[1.1] text-white sm:text-4xl lg:text-5xl">
          {t.title}
        </h2>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-gray-400">{t.sub}</p>

        <div className="relative mx-auto mt-12 w-full max-w-[520px]">
          {/* the globe (square, responsive) */}
          <div ref={wrapRef} className="relative aspect-square w-full">
            {size > 0 && (
              <Globe
                ref={globeEl}
                width={size}
                height={size}
                backgroundColor="rgba(0,0,0,0)"
                globeMaterial={globeMaterial}
                showAtmosphere
                atmosphereColor={accentRgb}
                atmosphereAltitude={0.18}
                polygonsData={COUNTRIES}
                polygonCapColor={capColor}
                polygonSideColor={sideColor}
                polygonStrokeColor={() => 'rgba(255, 255, 255, 0.22)'}
                polygonAltitude={(d: object) => (d === userCountry ? 0.07 : 0.012)}
                polygonsTransitionDuration={800}
              />
            )}
          </div>

          {/* neon overlay — Total Operators + Current Connection */}
          <div className="neon-overlay pointer-events-none mt-6 grid w-full grid-cols-1 gap-3 sm:absolute sm:bottom-2 sm:left-0 sm:mt-0 sm:w-auto sm:grid-cols-2 sm:gap-4">
            <div className="rounded-2xl border border-accent/30 bg-black/50 px-5 py-3 text-left shadow-[0_0_24px_-6px_rgb(var(--accent)/0.6)] backdrop-blur-md">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent/80">{t.ops}</p>
              <p className="mt-1 font-mono text-2xl font-bold text-white [text-shadow:0_0_12px_rgb(var(--accent)/0.7)]">
                {visits == null ? '——' : display.toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-accent/30 bg-black/50 px-5 py-3 text-left shadow-[0_0_24px_-6px_rgb(var(--accent)/0.6)] backdrop-blur-md">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent/80">{t.conn}</p>
              <p className="mt-1 flex items-center gap-2 font-mono text-sm font-medium text-white">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent shadow-[0_0_8px_2px_rgb(var(--accent)/0.8)]" />
                {connectionText}
              </p>
            </div>
          </div>
        </div>

        {/* ── VISITOR BREAKDOWN BY COUNTRY (neon, scrollable) — ALWAYS rendered,
              with explicit loading / empty / error states so it never silently
              disappears. ── */}
        <div className="mx-auto mt-12 w-full max-w-md rounded-2xl border border-accent/25 bg-black/40 p-5 text-left shadow-[0_0_30px_-10px_rgb(var(--accent)/0.5)] backdrop-blur-md">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent/80">{t.byCountry}</p>

          {statsStatus === 'loading' && (
            <p className="mt-3 flex items-center gap-2 font-mono text-xs text-muted">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent" />
              {st.connecting}
            </p>
          )}

          {statsStatus === 'error' && (
            <p className="mt-3 font-mono text-xs text-amber-300/80">{st.offline}</p>
          )}

          {statsStatus === 'empty' && (
            <p className="mt-3 font-mono text-xs text-muted">{st.empty}</p>
          )}

          {statsStatus === 'ready' && (
            <ul className="mt-3 max-h-56 space-y-2.5 overflow-y-auto overscroll-contain pr-1">
              {countries.map((c) => {
                const max = countries[0]?.visits || 1
                const pct = Math.max(6, Math.round((c.visits / max) * 100))
                return (
                  <li key={c.country}>
                    <div className="flex items-center justify-between font-mono text-xs text-gray-200">
                      <span className="truncate">{c.country}</span>
                      <span className="ml-3 tabular-nums text-accent-light">{Number(c.visits).toLocaleString()}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-accent/80 shadow-[0_0_8px_rgb(var(--accent)/0.7)] transition-[width] duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
