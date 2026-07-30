import { useState, useEffect, useCallback, useImperativeHandle, useRef, forwardRef, type FormEvent } from 'react'
import { LogOut, Loader2, UserRound, X, Search } from 'lucide-react'
import tzlookup from 'tz-lookup'
import { SITE } from '../config/site'
import type { Lang } from '../lib/vedin'

const API = SITE.apiUrl
const CUST_TOKEN = 'mtn_customer_jwt'
const GEO_URL = 'https://nominatim.openstreetmap.org/search'
interface GeoHit { display_name: string; lat: string; lon: string }

export interface SavedChart {
  id: number; name: string; gender: string; birthDate: string; birthTime: string
  timeZone: string; latitude: number; longitude: number; nayNan: number; createdAt: string
}

/**
 * CustomerPanel — querent (customer) accounts on the Vedin page. Email-only
 * sign-up with confirmation, login, editable username, and saved charts that
 * autofill the form. Reports the auth token upward via onAuthChange.
 */
/** Imperative handle so the parent (Vedin) can open the auth modal from the
 *  reading tab's gate button, and inject a token from an email-confirm redirect. */
export interface CustomerPanelHandle {
  openAuth: (mode: 'login' | 'signup') => void
  openProfileEdit: () => void
  ingestToken: (token: string) => void
}

interface MeData {
  id: number; email: string; username: string; emailConfirmed?: boolean
  gender?: string; dob?: string; birthTime?: string; locationName?: string
  latitude?: number; longitude?: number; timezone?: string; hasProfile?: boolean
}

const CustomerPanel = forwardRef<CustomerPanelHandle, {
  lang: Lang
  onLoadChart: (c: SavedChart) => void
  onAuthChange: (token: string | null) => void
  onProfileSaved?: () => void
}>(function CustomerPanel({ lang, onLoadChart, onAuthChange, onProfileSaved }, ref) {
  const [token, setToken] = useState<string>(() => { try { return localStorage.getItem(CUST_TOKEN) || '' } catch { return '' } })
  const [me, setMe] = useState<MeData | null>(null)
  const meRef = useRef<MeData | null>(null)
  useEffect(() => { meRef.current = me }, [me])
  const [modal, setModal] = useState<null | 'login' | 'signup' | 'profile'>(null)
  const [email, setEmail] = useState(''); const [username, setUsername] = useState('')
  const [pw, setPw] = useState(''); const [pw2, setPw2] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [charts, setCharts] = useState<SavedChart[]>([])
  const [needsVerify, setNeedsVerify] = useState(false); const [cooldown, setCooldown] = useState(0)

  // ── Natal profile fields (signup only) ──────────────────────────────────────
  const [sGender, setSGender] = useState<'male' | 'female'>('male')
  const [sDob, setSDob] = useState('1998-01-01')
  const [sTime, setSTime] = useState('12:00')
  const [sPlace, setSPlace] = useState(''); const [sPlaceOk, setSPlaceOk] = useState(false)
  const [sLat, setSLat] = useState(''); const [sLon, setSLon] = useState(''); const [sTz, setSTz] = useState('')
  const [sHits, setSHits] = useState<GeoHit[]>([]); const [sSearching, setSSearching] = useState(false)
  const sDeb = useRef<number | undefined>(undefined)
  const onSPlaceChange = (v: string) => {
    setSPlace(v); setSPlaceOk(false)
    window.clearTimeout(sDeb.current)
    if (v.trim().length < 3) { setSHits([]); return }
    sDeb.current = window.setTimeout(async () => {
      setSSearching(true)
      try {
        const r = await fetch(`${GEO_URL}?format=json&limit=5&q=${encodeURIComponent(v)}`, { headers: { Accept: 'application/json' } })
        const j = (await r.json()) as GeoHit[]
        setSHits(Array.isArray(j) ? j : [])
      } catch { setSHits([]) } finally { setSSearching(false) }
    }, 450)
  }
  const selectSPlace = (g: GeoHit) => {
    const la = Number(g.lat), lo = Number(g.lon)
    setSLat(String(la)); setSLon(String(lo)); setSPlace(g.display_name.split(',').slice(0, 2).join(',').trim()); setSHits([]); setSPlaceOk(true)
    try { setSTz(tzlookup(la, lo)) } catch { /* keep */ }
  }

  useEffect(() => {
    if (cooldown <= 0) return
    const id = window.setInterval(() => setCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000)
    return () => window.clearInterval(id)
  }, [cooldown])
  const resendConfirm = async () => {
    if (cooldown > 0) return
    try {
      await fetch(`${API}/api/customer/resend-confirmation`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim() }) })
      setMsg({ ok: true, text: t('Confirmation email sent — check your inbox (and spam).', 'အတည်ပြု email ပို့ပြီးပါပြီ — inbox (နှင့် spam) ကို စစ်ပါ။') })
      setCooldown(60)
    } catch { setMsg({ ok: false, text: t('Could not send — try again.', 'ပို့၍မရပါ — ပြန်ကြိုးစားပါ။') }) }
  }

  const t = (en: string, mm: string) => (lang === 'mm' ? mm : en)
  const persist = (tk: string) => { try { tk ? localStorage.setItem(CUST_TOKEN, tk) : localStorage.removeItem(CUST_TOKEN) } catch { /* ignore */ } }

  useEffect(() => { onAuthChange(token || null) }, [token, onAuthChange])

  // Parent-driven controls: open the auth modal, or ingest a token from the
  // email-confirmation redirect (?token=…).
  useImperativeHandle(ref, () => ({
    openAuth: (mode) => { setModal(mode); setMsg(null); setNeedsVerify(false) },
    openProfileEdit: () => {
      const m = meRef.current
      setUsername(m?.username || '')
      setSGender(m?.gender === 'female' ? 'female' : 'male')
      setSDob(m?.dob || '1998-01-01')
      setSTime(m?.birthTime || '12:00')
      setSPlace(m?.locationName || '')
      setSLat(m?.latitude != null ? String(m.latitude) : '')
      setSLon(m?.longitude != null ? String(m.longitude) : '')
      setSTz(m?.timezone || '')
      setSPlaceOk(m?.latitude != null && m?.longitude != null)
      setSHits([]); setMsg(null); setModal('profile')
    },
    ingestToken: (tk) => { if (!tk) return; setToken(tk); persist(tk); setModal(null) },
  }), [])

  const loadMe = useCallback(async (tk: string) => {
    try {
      const r = await fetch(`${API}/api/customer/me`, { headers: { Authorization: `Bearer ${tk}` } })
      if (!r.ok) { setToken(''); persist(''); return }
      const j = await r.json(); setMe(j.data)
    } catch { /* ignore */ }
  }, [])
  const loadCharts = useCallback(async (tk: string) => {
    try {
      const r = await fetch(`${API}/api/customer/my-charts`, { headers: { Authorization: `Bearer ${tk}` } })
      const j = await r.json(); setCharts(Array.isArray(j.data) ? j.data : [])
    } catch { /* ignore */ }
  }, [])
  useEffect(() => { if (token) { loadMe(token); loadCharts(token) } else { setMe(null); setCharts([]) } }, [token, loadMe, loadCharts])

  // ── Auto-advance while awaiting email verification ──────────────────────────
  // While the user sits on the "check your email" screen, silently poll their
  // verification status every 4s. The moment the account is confirmed (on THIS or
  // ANY other device), we exchange the credentials still held in memory for a real
  // session token and drop them straight into the dashboard — no "I've verified"
  // button, no manual refresh. The interval is torn down on unmount and the instant
  // we succeed; network blips are swallowed and simply retried on the next tick.
  useEffect(() => {
    if (!(modal === 'login' && needsVerify)) return
    const em = email.trim()
    const password = pw
    if (!em || !password) return

    let stopped = false
    const tick = async () => {
      if (stopped) return
      try {
        const sr = await fetch(`${API}/api/customer/verification-status?email=${encodeURIComponent(em)}`)
        if (!sr.ok) return
        const sj = (await sr.json().catch(() => null)) as { data?: { verified?: boolean } } | null
        if (stopped || !sj?.data?.verified) return

        // Verified → do ONE real (password-checked) login to obtain the session.
        const lr = await fetch(`${API}/api/customer/login`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: em, password }),
        })
        const lj = (await lr.json().catch(() => null)) as { data?: { token?: string } } | null
        if (stopped) return
        if (lr.ok && lj?.data?.token) {
          setToken(lj.data.token); persist(lj.data.token)
          setModal(null); setNeedsVerify(false); setPw(''); setPw2(''); setMsg(null)
        }
      } catch { /* silent — a dropped tick just retries on the next interval */ }
    }

    const id = window.setInterval(tick, 4000)
    return () => { stopped = true; window.clearInterval(id) }
  }, [modal, needsVerify, email, pw])

  const login = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg(null)
    try {
      const r = await fetch(`${API}/api/customer/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim(), password: pw }) })
      const j = await r.json()
      if (!r.ok || !j?.data?.token) throw new Error(j?.message || 'Login failed')
      setToken(j.data.token); persist(j.data.token); setModal(null); setPw(''); setPw2(''); setNeedsVerify(false)
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Login failed'
      setMsg({ ok: false, text })
      if (/confirm/i.test(text)) setNeedsVerify(true)   // unverified email → offer resend
    } finally { setBusy(false) }
  }
  const signup = async (e: FormEvent) => {
    e.preventDefault()
    if (pw !== pw2) { setMsg({ ok: false, text: t('Passwords do not match.', 'Password နှစ်ခု မတူပါ။') }); return }
    setBusy(true); setMsg(null)
    try {
      const natal = sPlaceOk && sLat && sLon
        ? { gender: sGender, dob: sDob, birthTime: sTime, locationName: sPlace.trim(), latitude: Number(sLat), longitude: Number(sLon), timezone: sTz }
        : {}
      const r = await fetch(`${API}/api/customer/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim(), username: username.trim(), password: pw, confirmPassword: pw2, ...natal }) })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.message || 'Sign up failed')
      setMsg({ ok: true, text: t('Account created — open the email we sent and confirm. This device will sign you in automatically once verified.', 'အကောင့်ဖန်တီးပြီး — ပို့လိုက်သည့် အီးမေးလ်ကို ဖွင့်၍ အတည်ပြုပါ။ အတည်ပြုပြီးသည်နှင့် ဤစက်တွင် အလိုအလျောက် ဝင်ရောက်ပေးပါမည်။') })
      // Keep the password in memory (clear only the confirm field) and enter the
      // "awaiting verification" state so the auto-advance poll below can silently
      // log this device in the instant the email is confirmed — on ANY device.
      setModal('login'); setPw2(''); setNeedsVerify(true)
    } catch (err) { setMsg({ ok: false, text: err instanceof Error ? err.message : 'Sign up failed' }) } finally { setBusy(false) }
  }
  const saveProfile = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true); setMsg(null)
    try {
      const body = {
        username: username.trim(),
        gender: sGender, dob: sDob, birthTime: sTime, locationName: sPlace.trim(),
        latitude: sLat ? Number(sLat) : null, longitude: sLon ? Number(sLon) : null, timezone: sTz,
      }
      const r = await fetch(`${API}/api/customer/profile`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body),
      })
      // Parse defensively — a 400 (e.g. the 90-day cooldown) still returns JSON we
      // want to surface; only a true network failure lands in catch below.
      const j = (await r.json().catch(() => null)) as { success?: boolean; message?: string; data?: MeData } | null
      if (!r.ok || !j?.success) throw new Error(j?.message || `Update failed (${r.status})`)
      setMe(j.data ?? null); setModal(null); onProfileSaved?.()
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Update failed'
      const networky = /load failed|failed to fetch|networkerror|network request failed/i.test(raw)
      setMsg({ ok: false, text: networky ? t('Could not reach the server. Please check your connection and try again.', 'ဆာဗာနှင့် ဆက်သွယ်၍မရပါ။ အင်တာနက် ချိတ်ဆက်မှုကို စစ်ပြီး ထပ်စမ်းကြည့်ပါ။') : raw })
    } finally { setBusy(false) }
  }
  const logout = () => { setToken(''); persist(''); setMe(null); setCharts([]) }
  const inputCls = 'mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-fg outline-none focus:border-accent/50'

  return (
    <div className="no-print">
      {/* ── Auth bar ── */}
      {!token ? (
        <div className="glass-card flex flex-wrap items-center justify-between gap-3 p-4">
          <span className="text-sm text-muted">{t('Sign in to save your charts and download your reading PDF.', 'အကောင့်ဝင်၍ ဇာတာများ သိမ်းပြီး PDF ဟောစာတမ်း ရယူနိုင်ပါသည်။')}</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setModal('login'); setMsg(null) }} className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs text-fg transition hover:border-accent/40">{t('Sign in', 'အကောင့်ဝင်')}</button>
            <button type="button" onClick={() => { setModal('signup'); setMsg(null) }} className="rounded-xl bg-gradient-to-r from-accent to-violet-500 px-4 py-2 text-xs font-semibold text-space transition hover:brightness-110">{t('Sign up', 'အကောင့်ဖွင့်')}</button>
          </div>
        </div>
      ) : (
        <div className="glass-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-accent-light"><UserRound size={16} /></span>
              <span className="text-sm font-semibold text-fg">{me?.username}</span>
              <span className="font-mono text-[11px] text-muted">· {me?.email}</span>
            </div>
            <button type="button" onClick={logout} className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-muted transition hover:text-fg"><LogOut size={13} /> {t('Log out', 'ထွက်')}</button>
          </div>

          {charts.length > 0 && (
            <div className="mt-3 border-t border-white/8 pt-3">
              <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted">{t('Your saved charts', 'သိမ်းထားသော ဇာတာများ')}</p>
              <ul className="space-y-1.5">
                {charts.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/[0.03] px-3 py-2">
                    <span className="text-xs text-fg/90">{c.name || t('(unnamed)', '(အမည်မဲ့)')} <span className="font-mono text-muted">· {c.birthDate} {c.birthTime}</span></span>
                    <button type="button" onClick={() => onLoadChart(c)} className="rounded-full border border-accent/30 bg-accent/10 px-3 py-0.5 text-[11px] text-accent-light transition hover:bg-accent/20">{t('Load & view', 'ဖွင့်ကြည့်')}</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── Auth modal ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className={`glass-card w-full ${modal === 'signup' ? 'max-w-md' : 'max-w-sm'} max-h-[90vh] overflow-y-auto p-6`} onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-groovy text-lg text-fg">{modal === 'login' ? t('Sign in', 'အကောင့်ဝင်') : modal === 'profile' ? t('Edit your natal profile', 'မွေးဇာတာ ပရိုဖိုင် ပြင်ရန်') : t('Create account', 'အကောင့်ဖွင့်')}</h3>
              <button type="button" onClick={() => setModal(null)} className="text-muted hover:text-fg"><X size={18} /></button>
            </div>
            {msg && <p className={`mb-3 rounded-xl border px-3 py-2 text-xs ${msg.ok ? 'border-emerald-400/40 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200' : 'border-coral/40 bg-coral/10 text-coral'}`}>{msg.text}</p>}
            <form onSubmit={modal === 'login' ? login : modal === 'signup' ? signup : saveProfile} className="space-y-3">
              {modal !== 'profile' && (
                <label className="block"><span className="font-mono text-[11px] uppercase tracking-wider text-muted">{t('Email', 'အီးမေးလ်')}</span>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} /></label>
              )}
              {(modal === 'signup' || modal === 'profile') && (
                <label className="block"><span className="font-mono text-[11px] uppercase tracking-wider text-muted">{modal === 'profile' ? t('Name', 'အမည်') : t('Username', 'အသုံးပြုသူအမည်')}</span>
                  <input required value={username} onChange={(e) => setUsername(e.target.value)} className={inputCls} /></label>
              )}
              {modal !== 'profile' && (
                <label className="block"><span className="font-mono text-[11px] uppercase tracking-wider text-muted">{t('Password', 'စကားဝှက်')}</span>
                  <input type="password" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} className={inputCls} /></label>
              )}
              {modal === 'signup' && (
                <label className="block"><span className="font-mono text-[11px] uppercase tracking-wider text-muted">{t('Confirm password', 'စကားဝှက် အတည်ပြု')}</span>
                  <input type="password" required minLength={8} value={pw2} onChange={(e) => setPw2(e.target.value)} className={`${inputCls} ${pw2 && pw !== pw2 ? 'border-coral/50' : ''}`} /></label>
              )}

              {/* Natal profile — makes the account render its own chart instantly */}
              {(modal === 'signup' || modal === 'profile') && (
                <div className="space-y-3 rounded-xl border border-jade/25 bg-jade/[0.05] p-3">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300">{modal === 'profile' ? t('Your birth details', 'သင့်မွေးဖွားချက်') : t('Your birth details (optional — unlocks your dashboard)', 'သင့်မွေးဖွားချက် (ရွေးချယ်နိုင် — Dashboard ဖွင့်ပေးသည်)')}</p>
                  {modal === 'profile' && (
                    <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 py-2 text-[11px] leading-relaxed text-amber-200">⚠️ မွေးဇာတာ အချက်အလက်များကို ရက်ပေါင်း 90 မှ တစ်ကြိမ်သာ ပြောင်းလဲနိုင်ပါသည်။</p>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block"><span className="font-mono text-[10px] uppercase tracking-wider text-muted">{t('Gender', 'ကျား/မ')}</span>
                      <select value={sGender} onChange={(e) => setSGender(e.target.value as 'male' | 'female')} className={inputCls}>
                        <option value="male" className="text-black">{t('Male', 'ကျား')}</option>
                        <option value="female" className="text-black">{t('Female', 'မ')}</option>
                      </select></label>
                    <label className="block"><span className="font-mono text-[10px] uppercase tracking-wider text-muted">{t('Birth time', 'မွေးချိန်')}</span>
                      <input type="time" value={sTime} onChange={(e) => setSTime(e.target.value)} className={inputCls} /></label>
                  </div>
                  <label className="block"><span className="font-mono text-[10px] uppercase tracking-wider text-muted">{t('Date of birth', 'မွေးသက္ကရာဇ်')}</span>
                    <input type="date" value={sDob} onChange={(e) => setSDob(e.target.value)} className={inputCls} /></label>
                  <label className="relative block"><span className="font-mono text-[10px] uppercase tracking-wider text-muted">{t('Birth place (search)', 'မွေးရပ် (ရှာဖွေ)')}</span>
                    <div className="relative">
                      <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                      <input value={sPlace} onChange={(e) => onSPlaceChange(e.target.value)} placeholder={t('e.g. Yangon', 'ဥပမာ — ရန်ကုန်')} className={`${inputCls} pl-8 ${sPlaceOk ? 'border-jade/50' : ''}`} />
                      {sSearching && <Loader2 size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-muted" />}
                    </div>
                    {sHits.length > 0 && (
                      <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-xl border border-white/15 bg-space/95 backdrop-blur">
                        {sHits.map((g, i) => (
                          <li key={i}><button type="button" onClick={() => selectSPlace(g)} className="block w-full truncate px-3 py-2 text-left text-xs text-fg/90 hover:bg-accent/15">{g.display_name}</button></li>
                        ))}
                      </ul>
                    )}
                  </label>
                  {sPlaceOk && <p className="font-mono text-[10px] text-emerald-700 dark:text-emerald-300">✓ {sPlace} · {sTz}</p>}
                </div>
              )}

              <button type="submit" disabled={busy} className="w-full rounded-xl bg-gradient-to-r from-accent to-violet-500 px-5 py-2.5 text-sm font-semibold text-space transition hover:brightness-110 disabled:opacity-60">
                {busy ? <Loader2 size={15} className="mx-auto animate-spin" /> : modal === 'login' ? t('Sign in', 'ဝင်မည်') : modal === 'profile' ? t('Save profile', 'ပရိုဖိုင် သိမ်းမည်') : t('Create account', 'အကောင့်ဖွင့်မည်')}
              </button>
            </form>
            {modal === 'login' && needsVerify && (
              <>
                <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-center text-xs text-emerald-700 dark:text-emerald-200">
                  <Loader2 size={14} className="animate-spin" />
                  {t('Waiting for verification — this device will sign you in automatically.', 'အတည်ပြုချက်ကို စောင့်နေသည် — အတည်ပြုပြီးသည်နှင့် ဤစက်တွင် အလိုအလျောက် ဝင်ရောက်ပေးပါမည်။')}
                </div>
                <button type="button" onClick={resendConfirm} disabled={cooldown > 0}
                  className="mt-2 w-full rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-xs text-accent-light transition hover:bg-accent/20 disabled:opacity-50">
                  {cooldown > 0 ? t(`Resend in ${cooldown}s`, `${cooldown} စက္ကန့်အကြာ ပြန်ပို့`) : t('Resend confirmation email', 'အတည်ပြု email ပြန်ပို့ရန်')}
                </button>
              </>
            )}
            {modal !== 'profile' && (
              <button type="button" onClick={() => { setModal(modal === 'login' ? 'signup' : 'login'); setMsg(null); setNeedsVerify(false) }} className="mt-3 w-full text-center font-mono text-[11px] text-muted hover:text-fg">
                {modal === 'login' ? t("No account? Sign up", 'အကောင့်မရှိသေးဘူးလား? ဖွင့်မည်') : t('Have an account? Sign in', 'အကောင့်ရှိပြီးသားလား? ဝင်မည်')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
})

export default CustomerPanel
