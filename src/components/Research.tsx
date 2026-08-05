import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Lock, Download, FlaskConical, Trash2, Sigma } from 'lucide-react'
import {
  getPredictions, savePredictions, getJournal, saveJournal, hashPrediction, uid, exportCsv,
  isSignedIn, fetchServerData, createPredictionServer, reviewPredictionServer, deletePredictionServer, createJournalServer,
  type Prediction, type JournalEntry, type Valence, type Outcome,
} from '../lib/research'
import { wilsonInterval, binomialNullSamples, permutationPValue, benjaminiHochberg } from '../lib/stats'
import useLang from '../hooks/useLang'

type Lang = 'en' | 'mm'

export default function Research() {
  const { lang, setLang } = useLang()
  const t = (en: string, mm: string) => (lang === 'mm' ? mm : en)

  const [preds, setPreds] = useState<Prediction[]>([])
  const [journal, setJournal] = useState<JournalEntry[]>([])
  const [signedIn] = useState<boolean>(() => isSignedIn())
  const [syncErr, setSyncErr] = useState('')
  useEffect(() => {
    if (signedIn) {
      fetchServerData()
        .then(({ predictions, journal }) => { setPreds(predictions); setJournal(journal) })
        .catch((e) => { setSyncErr(e instanceof Error ? e.message : 'Could not load your saved data.'); setPreds(getPredictions()); setJournal(getJournal()) })
    } else {
      setPreds(getPredictions()); setJournal(getJournal())
    }
  }, [signedIn])

  // ── New prediction (pre-registered before its window opens) ──
  const [claim, setClaim] = useState(''); const [falsifier, setFalsifier] = useState('')
  const [area, setArea] = useState('')
  const [wStart, setWStart] = useState(''); const [wEnd, setWEnd] = useState('')
  const [baseRate, setBaseRate] = useState('0.20'); const [baseRateSource, setBaseRateSource] = useState('')
  const [intensity, setIntensity] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [valence, setValence] = useState<Valence>('mixed')
  const [formErr, setFormErr] = useState('')

  const addPrediction = async (e: FormEvent) => {
    e.preventDefault(); setFormErr('')
    const br = Number(baseRate)
    const today = new Date().toISOString().slice(0, 10)
    if (!claim.trim() || !falsifier.trim()) return setFormErr(t('Claim and falsifier are both required.', 'ဟောကိန်းအချက် (Claim) နှင့် ချေပနိုင်မည့်အချက် (Falsifier) နှစ်ခုလုံး ထည့်သွင်းရန် လိုအပ်ပါသည်။'))
    if (!wStart || !wEnd) return setFormErr(t('Set the prediction window.', 'ဟောကိန်းအတွက် အချိန်ကာလကို သတ်မှတ်ပါ။'))
    if (wStart <= today) return setFormErr(t('The window must start in the future — predict before it happens.', 'အချိန်ကာလသည် အနာဂတ်မှစတင်ရပါမည် — မဖြစ်ပေါ်မီ ကြိုတင်ဟောကိန်းထုတ်ပါ။'))
    if (wEnd < wStart) return setFormErr(t('End date is before start date.', 'ပြီးဆုံးမည့်ရက်သည် စတင်မည့်ရက်ထက် စောနေပါသည်။'))
    if (!(br >= 0 && br <= 1)) return setFormErr(t('Base rate must be between 0 and 1.', 'Base rate တန်ဖိုးသည် ၀ နှင့် ၁ အကြားသာ ဖြစ်ရပါမည်။'))

    const createdAt = new Date().toISOString()
    const locked = { createdAt, windowStart: wStart, windowEnd: wEnd, claim: claim.trim(), falsifier: falsifier.trim(), baseRate: br }
    const hash = await hashPrediction(locked)
    const draft: Prediction = { id: uid(), ...locked, area: area.trim(), baseRateSource: baseRateSource.trim(), intensity, valence, hash, locked: true }

    if (signedIn) {
      try {
        const saved = await createPredictionServer(draft)
        setPreds((prev) => [saved, ...prev]); setSyncErr('')
      } catch (e) { return setFormErr(e instanceof Error ? e.message : t('Could not save to your account.', 'သင့်အကောင့်သို့ သိမ်းဆည်း၍ မရပါ။')) }
    } else {
      const next = [draft, ...preds]; setPreds(next); savePredictions(next)
    }
    setClaim(''); setFalsifier(''); setArea(''); setBaseRateSource('')
  }

  const review = async (id: string, outcome: Outcome) => {
    if (signedIn) {
      try { const updated = await reviewPredictionServer(id, outcome); setPreds((prev) => prev.map((p) => (p.id === id ? updated : p))) }
      catch (e) { setSyncErr(e instanceof Error ? e.message : 'Could not save the score.') }
    } else {
      const next = preds.map((p) => (p.id === id ? { ...p, outcome, reviewedAt: new Date().toISOString() } : p))
      setPreds(next); savePredictions(next)
    }
  }
  const remove = async (id: string) => {
    if (signedIn) {
      try { await deletePredictionServer(id); setPreds((prev) => prev.filter((p) => p.id !== id)) }
      catch (e) { setSyncErr(e instanceof Error ? e.message : 'Could not delete.') }
    } else {
      const next = preds.filter((p) => p.id !== id); setPreds(next); savePredictions(next)
    }
  }

  // ── Dashboard ──
  const scored = preds.filter((p) => p.outcome)
  const hits = scored.filter((p) => p.outcome === 'hit').length
  const partial = scored.filter((p) => p.outcome === 'partial').length
  const miss = scored.filter((p) => p.outcome === 'miss').length
  const wilson = wilsonInterval(hits, scored.length)
  const expectedRate = scored.length ? scored.reduce((a, p) => a + p.baseRate, 0) / scored.length : 0
  const pValue = useMemo(() => {
    if (scored.length < 5) return null
    return permutationPValue(hits, binomialNullSamples(scored.map((p) => p.baseRate), 5000))
  }, [scored.length, hits]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Multiple-comparison correction (Benjamini–Hochberg, FDR q = 0.05) ──
  const FDR_Q = 0.05
  const FDR_MIN = 3
  const family = useMemo(() => {
    const done = preds.filter((p) => p.outcome)
    const groups = new Map<string, Prediction[]>()
    for (const p of done) {
      const key = p.area?.trim() || ''
      const g = groups.get(key); if (g) g.push(p); else groups.set(key, [p])
    }
    const tests = [...groups.entries()]
      .map(([area, ps]) => {
        const n = ps.length
        const h = ps.filter((x) => x.outcome === 'hit').length
        const rates = ps.map((x) => x.baseRate)
        return { area, n, hits: h, rate: h / n, baseMean: rates.reduce((a, b) => a + b, 0) / n, rates }
      })
      .filter((g) => g.n >= FDR_MIN)
      .sort((a, b) => b.n - a.n)
    const pvals = tests.map((g) => permutationPValue(g.hits, binomialNullSamples(g.rates, 4000)))
    const sig = benjaminiHochberg(pvals, FDR_Q)
    return tests.map((g, i) => ({ ...g, p: pvals[i], sig: sig[i] }))
  }, [preds])
  const anyDiscovery = family.some((g) => g.sig)

  const download = (content: string, name: string, type: string) => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type })); a.download = name; a.click(); URL.revokeObjectURL(a.href)
  }

  // ── Blind journal (life events, logged without seeing predictions) ──
  const [jMonth, setJMonth] = useState(''); const [jCat, setJCat] = useState(''); const [jDesc, setJDesc] = useState(''); const [jMag, setJMag] = useState<1 | 2 | 3>(2)
  const addJournal = async (e: FormEvent) => {
    e.preventDefault(); if (!jMonth || !jDesc.trim()) return
    if (signedIn) {
      try {
        const saved = await createJournalServer({ month: jMonth, category: jCat.trim(), description: jDesc.trim(), magnitude: jMag })
        setJournal((prev) => [saved, ...prev]); setSyncErr('')
      } catch (err) { return setSyncErr(err instanceof Error ? err.message : 'Could not save the entry.') }
    } else {
      const j: JournalEntry = { id: uid(), month: jMonth, category: jCat.trim(), description: jDesc.trim(), magnitude: jMag, createdAt: new Date().toISOString() }
      const next = [j, ...journal]; setJournal(next); saveJournal(next)
    }
    setJDesc(''); setJCat('')
  }

  const field = 'mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-fg outline-none focus:border-accent/50'
  const label = 'block font-mono text-[11px] uppercase tracking-wider text-muted'
  const pct = (x: number) => `${(x * 100).toFixed(0)}%`

  return (
    <section className="section-container vedin-page">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-mono text-xs text-muted transition hover:text-fg"><ArrowLeft size={15} /> Vedin</Link>
        <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1">
          {(['en', 'mm'] as Lang[]).map((l) => (
            <button key={l} type="button" onClick={() => setLang(l)} className={`rounded-full px-3 py-1 font-mono text-xs transition ${lang === l ? 'bg-accent/70 text-space' : 'text-muted hover:text-fg'}`}>{l === 'en' ? 'EN' : 'မြန်မာ'}</button>
          ))}
        </div>
      </div>

      {/* Top cross-link to the sibling page */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link to="/algorithms" className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 font-mono text-[11px] text-accent-light transition hover:bg-accent/20">
          <Sigma size={13} /> {t('The algorithms (CS) →', 'အယ်လဂိုရီသမ်များ (CS) →')}
        </Link>
      </div>

      {/* Hero + hypotheses */}
      <div className="glass-card mb-6 p-6">
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-accent-light"><FlaskConical size={14} /> {t('Falsifiable research protocol', 'စစ်ဆေးချေပနိုင်သော သုတေသန လုပ်ထုံးလုပ်နည်း')}</p>
        <h1 className="mt-2 font-groovy text-2xl text-fg sm:text-3xl">{t('Does it beat chance? — a measurement, not a claim', 'တိုက်ဆိုင်မှုသက်သက်ထက် ပိုမှန်သလား? — ယုံကြည်ချက်သက်သက်မဟုတ်ဘဲ လက်တွေ့တိုင်းတာခြင်း')}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
          {t('This tool does not try to prove astrology works. It pre-registers specific, falsifiable predictions before their window opens, hash-locks them, and later scores them against an honestly-stated base rate. A null result is a successful result.',
            'ဤကိရိယာသည် ဗေဒင်မှန်ကန်ကြောင်း သက်သေပြရန် ဖန်တီးထားခြင်းမဟုတ်ပါ။ သတ်မှတ်ကာလ မတိုင်မီ တိကျသောဟောကိန်းများကို ကြိုတင်ရေးသားစေပြီး မပြောင်းလဲနိုင်အောင် Hash-lock ဖြင့် ပိတ်ထားမည်ဖြစ်ပါသည်။ ထို့နောက် ရိုးသားစွာ သတ်မှတ်ထားသော Base rate များနှင့် နှိုင်းယှဉ်၍ အမှတ်ပေးစစ်ဆေးမည် ဖြစ်သည်။ မည်သို့သော ရလဒ်ထွက်ပေါ်လာစေကာမူ ယင်းသည် အောင်မြင်သော သုတေသနရလဒ်တစ်ခုသာ ဖြစ်ပါသည်။')}
        </p>
        <div className="mt-4 rounded-xl border border-accent/25 bg-accent/[0.06] p-4 font-mono text-xs leading-relaxed text-fg/90">
          <p><span className="text-accent-light">H₀</span> : {t('There is no association between chart factors and life events.', 'ဇာတာပါ အချက်အလက်များနှင့် လက်တွေ့ဘဝဖြစ်ရပ်များအကြား ဆက်စပ်မှု မရှိပါ။')}</p>
          <p className="mt-1"><span className="text-accent-light">H₁</span> : {t('There is an association.', 'ဆက်စပ်မှု ရှိပါသည်။')}</p>
          <p className="mt-2 text-muted">{t('This project attempts to reject H₀. If it cannot, that outcome will be reported honestly.', 'ဤသုတေသနသည် အထက်ပါ H₀ ကို ပယ်ဖျက်နိုင်ရန် ကြိုးစားမည်ဖြစ်သည်။ အကယ်၍ မအောင်မြင်ခဲ့ပါကလည်း ထွက်ပေါ်လာသည့်ရလဒ်အတိုင်း ရိုးသားစွာ တင်ပြသွားမည် ဖြစ်သည်။')}</p>
        </div>
      </div>

      {/* Storage status */}
      <div className={`mb-6 flex flex-wrap items-center gap-2 rounded-xl border px-4 py-3 text-xs leading-relaxed ${signedIn ? 'border-jade/30 bg-jade/[0.06] text-fg/90' : 'border-accent/25 bg-accent/[0.05] text-muted'}`}>
        {signedIn
          ? <span>{t('☁️ Signed in — your predictions & journal are saved to your account (any device).', '☁️ အကောင့်ဝင်ထားပါသည် — သင်၏ ဟောကိန်းများနှင့် ဂျာနယ်မှတ်တမ်းများကို သင့်အကောင့်တွင် သိမ်းဆည်းထားပြီး (မည်သည့် Device မှမဆို ဝင်ရောက်ကြည့်ရှုနိုင်ပါသည်)။')}</span>
          : <span>{t('💾 Saved only in this browser. Sign in on the Vedin page to sync your research to your account.', '💾 ဤ Browser အတွင်း၌သာ သိမ်းဆည်းထားပါသည်။ သင်၏ သုတေသနမှတ်တမ်းများကို အကောင့်နှင့် ချိတ်ဆက်ထားရန် Vedin စာမျက်နှာတွင် အကောင့်ဝင်ပါ။')}</span>}
        {syncErr && <span className="text-coral">· {syncErr}</span>}
      </div>

      {/* Live dashboard */}
      <div className="glass-card mb-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-groovy text-lg text-fg">{t('Live results', 'လက်ရှိ ရလဒ်များ')}</h2>
          <div className="flex gap-2">
            <button type="button" onClick={() => download(JSON.stringify({ predictions: preds, journal }, null, 2), 'vedin-research.json', 'application/json')} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-[11px] text-muted transition hover:text-fg"><Download size={12} /> JSON</button>
            <button type="button" onClick={() => download(exportCsv(preds), 'vedin-predictions.csv', 'text/csv;charset=utf-8')} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-[11px] text-muted transition hover:text-fg"><Download size={12} /> CSV</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: t('Predictions', 'ဟောကိန်းများ'), v: preds.length, c: 'text-fg' },
            { k: t('Scored', 'အမှတ်ပေးပြီး'), v: scored.length, c: 'text-fg' },
            { k: t('Hit', 'မှန်ကန်'), v: hits, c: 'text-jade' },
            { k: t('Miss', 'လွဲချော်'), v: miss, c: 'text-coral' },
          ].map((s) => (
            <div key={s.k} className="rounded-xl border border-white/8 bg-white/[0.03] p-3 text-center">
              <div className={`font-groovy text-2xl ${s.c}`}>{s.v}</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted">{s.k}</div>
            </div>
          ))}
        </div>
        {scored.length > 0 && (
          <div className="mt-4 space-y-1.5 text-sm text-muted">
            <p>{t('Hit rate', 'မှန်ကန်မှုနှုန်း')}: <span className="font-semibold text-fg">{pct(wilson.p)}</span> <span className="font-mono text-xs">(95% CI {pct(wilson.low)}–{pct(wilson.high)}, Wilson)</span> · {partial} {t('partial', 'တစ်စိတ်တစ်ပိုင်း')}</p>
            <p>{t('Expected by chance (mean base rate)', 'တိုက်ဆိုင်မှုကြောင့် မှန်နိုင်ခြေ (ပျမ်းမျှ Base rate)')}: <span className="font-semibold text-fg">{pct(expectedRate)}</span></p>
            {pValue !== null
              ? <p>{t('Monte-Carlo p-value vs base-rate null', 'Base-rate Null နှိုင်းယှဉ်ချက် Monte-Carlo p-value')}: <span className={`font-semibold ${pValue < 0.05 ? 'text-jade' : 'text-fg'}`}>{pValue.toFixed(3)}</span> {pValue >= 0.05 && <span className="text-xs">— {t('not distinguishable from chance', 'တိုက်ဆိုင်မှုနှင့် ခွဲခြား၍မရပါ')}</span>}</p>
              : <p className="text-xs">{t('Score at least 5 predictions to compute a p-value.', 'P-value ကို တွက်ချက်ရန် အနည်းဆုံး ဟောကိန်း ၅ ခုအား အမှတ်ပေးရပါမည်။')}</p>}
          </div>
        )}

        {/* Per-area FDR correction */}
        {family.length > 0 && (
          <div className="mt-5 rounded-xl border border-accent/20 bg-accent/[0.04] p-4">
            <p className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-accent-light">{t('Per-area correction — Benjamini–Hochberg (FDR q = 0.05)', 'ကဏ္ဍအလိုက် ပြင်ဆင်ချက် — Benjamini–Hochberg (FDR q = 0.05)')}</span>
              {family.length === 1 && <span className="text-[11px] text-muted">{t('needs ≥ 2 areas to correct across', 'နှိုင်းယှဉ်ပြင်ဆင်ရန် အနည်းဆုံး ကဏ္ဍ ၂ ခု လိုအပ်ပါသည်')}</span>}
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="font-mono text-[10px] uppercase tracking-wider text-muted">
                    <th className="pb-2 pr-3 font-normal">{t('Area', 'ကဏ္ဍ')}</th>
                    <th className="pb-2 pr-3 text-right font-normal">n</th>
                    <th className="pb-2 pr-3 text-right font-normal">{t('hit rate', 'မှန်ကန်မှုနှုန်း')}</th>
                    <th className="pb-2 pr-3 text-right font-normal">{t('expected', 'မှန်နိုင်ခြေ')}</th>
                    <th className="pb-2 pr-3 text-right font-normal">{t('raw p', 'raw p')}</th>
                    <th className="pb-2 text-right font-normal">{t('FDR sig.', 'FDR ရလဒ်')}</th>
                  </tr>
                </thead>
                <tbody className="text-fg/90">
                  {family.map((g) => (
                    <tr key={g.area || '__general__'} className="border-t border-white/8">
                      <td className="py-1.5 pr-3">{g.area || t('General', 'ယေဘုယျ')}</td>
                      <td className="py-1.5 pr-3 text-right font-mono">{g.n}</td>
                      <td className="py-1.5 pr-3 text-right font-mono">{pct(g.rate)}</td>
                      <td className="py-1.5 pr-3 text-right font-mono text-muted">{pct(g.baseMean)}</td>
                      <td className="py-1.5 pr-3 text-right font-mono">{g.p.toFixed(3)}</td>
                      <td className="py-1.5 text-right">
                        <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${g.sig ? 'bg-jade/15 text-jade' : 'bg-white/10 text-muted'}`}>{g.sig ? t('significant', 'ထင်ရှားသည်') : '—'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              {anyDiscovery
                ? t('At least one area survives FDR correction — a genuine candidate signal worth more data, not a proof.', 'အနည်းဆုံး ကဏ္ဍတစ်ခုသည် FDR ပြင်ဆင်ချက်ကို အောင်မြင်စွာ ကျော်ဖြတ်နိုင်သည် — ယင်းသည် သက်သေပြချက် မဟုတ်သေးသော်လည်း၊ ဒေတာများ ဆက်လက်စုဆောင်းရန် တန်ဖိုးရှိသော အလားအလာကောင်းတစ်ခု (Candidate Signal) ဖြစ်ပါသည်။')
                : t('No area survives FDR correction — consistent with chance once multiple comparisons are accounted for.', 'မည်သည့်ကဏ္ဍမှ FDR ပြင်ဆင်ချက်ကို ကျော်ဖြတ်နိုင်ခြင်း မရှိပါ — နှိုင်းယှဉ်မှုများပြားလာသည်နှင့်အမျှ တိုက်ဆိုင်မှုသဘောတရားနှင့်သာ ပိုမိုကိုက်ညီနေပါသည်။')}
            </p>
          </div>
        )}
      </div>

      {/* New prediction */}
      <div className="glass-card mb-6 p-6">
        <h2 className="mb-1 font-groovy text-lg text-fg">{t('Pre-register a prediction', 'ဟောကိန်းတစ်ခုကို ကြိုတင်မှတ်ပုံတင်ရန်')}</h2>
        <p className="mb-4 text-xs leading-relaxed text-muted">{t('Write it before the window opens. The claim + falsifier are SHA-256 hash-locked so they cannot be changed later.', 'ဟောကိန်းကာလ မစတင်မီ ရေးသားပါ။ သင်၏ ဟောချက် (Claim) နှင့် ချေပချက် (Falsifier) ကို SHA-256 Hash-lock ဖြင့် ပိတ်ထားမည်ဖြစ်၍ နောင်တွင် ပြင်ဆင်၍မရနိုင်ပါ။')}</p>
        {formErr && <p className="mb-3 rounded-xl border border-coral/40 bg-coral/10 px-3 py-2 text-xs text-coral">{formErr}</p>}
        <form onSubmit={addPrediction} className="grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2"><span className={label}>{t('Claim (specific + testable)', 'ဟောချက် (တိကျမှုရှိပြီး စစ်ဆေးနိုင်ရမည်)')} <span className="text-coral">*</span></span>
            <input value={claim} onChange={(e) => setClaim(e.target.value)} placeholder={t('e.g. Will change employer or role before 2027-10', 'ဥပမာ — ၂၀၂၇ အောက်တိုဘာလ မတိုင်မီ အလုပ်ပြောင်းမည် (သို့) ရာထူးတိုးမည်')} className={field} /></label>
          <label className="sm:col-span-2"><span className={label}>{t('Falsifier — what would prove it wrong', 'ချေပချက် (Falsifier) — မည်သည့်အခြေအနေတွင် မှားယွင်းသည်ဟု သတ်မှတ်မည်နည်း')} <span className="text-coral">*</span></span>
            <input value={falsifier} onChange={(e) => setFalsifier(e.target.value)} placeholder={t('e.g. Same employer and role at 2027-10-01', 'ဥပမာ — ၂၀၂၇ အောက်တိုဘာလ ၁ ရက်နေ့အထိ လက်ရှိအလုပ်နှင့် ရာထူး၌သာ ဆက်ရှိနေမည်')} className={field} /></label>
          <label><span className={label}>{t('Window start', 'ဟောကိန်းကာလ စတင်မည့်ရက်')} <span className="text-coral">*</span></span><input type="date" value={wStart} onChange={(e) => setWStart(e.target.value)} className={field} /></label>
          <label><span className={label}>{t('Window end', 'ဟောကိန်းကာလ ပြီးဆုံးမည့်ရက်')} <span className="text-coral">*</span></span><input type="date" value={wEnd} onChange={(e) => setWEnd(e.target.value)} className={field} /></label>
          <label><span className={label}>{t('Base rate (0–1)', 'Base rate (0–1)')}</span><input type="number" step="0.01" min="0" max="1" value={baseRate} onChange={(e) => setBaseRate(e.target.value)} className={field} /></label>
          <label><span className={label}>{t('Base rate source', 'Base rate ရင်းမြစ်')}</span><input value={baseRateSource} onChange={(e) => setBaseRateSource(e.target.value)} placeholder="e.g. OECD job tenure 2024" className={field} /></label>
          <label><span className={label}>{t('Area', 'ကဏ္ဍ')}</span><input value={area} onChange={(e) => setArea(e.target.value)} placeholder={t('Career', 'အလုပ်အကိုင်')} className={field} /></label>
          <label><span className={label}>{t('Intensity 1–5', 'အားအင် (၁–၅)')}</span>
            <select value={intensity} onChange={(e) => setIntensity(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)} className={field}>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n} className="text-black">{n}</option>)}</select></label>
          <label className="sm:col-span-2"><span className={label}>{t('Valence', 'သဘာဝ')}</span>
            <select value={valence} onChange={(e) => setValence(e.target.value as Valence)} className={field}>
              {(['supportive', 'demanding', 'mixed', 'neutral'] as Valence[]).map((v) => <option key={v} value={v} className="text-black">{v}</option>)}
            </select></label>
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 shadow-md px-5 py-2.5 text-sm font-semibold text-amber-50 transition hover:brightness-110 sm:col-span-2"><Lock size={15} /> {t('Lock prediction', 'ဟောကိန်းကို Lock ချ၍ သိမ်းမည်')}</button>
        </form>
      </div>

      {/* Predictions list */}
      <div className="glass-card mb-6 p-6">
        <h2 className="mb-3 font-groovy text-lg text-fg">{t('Pre-registered predictions', 'ကြိုတင်မှတ်ပုံတင်ထားသော ဟောကိန်းများ')}</h2>
        {preds.length === 0 ? <p className="text-sm text-muted">{t('None yet.', 'မရှိသေးပါ။')}</p> : (
          <ul className="space-y-3">
            {preds.map((p) => {
              const ended = new Date().toISOString().slice(0, 10) > p.windowEnd
              return (
                <li key={p.id} className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-semibold text-fg">{p.claim}</p>
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted" title={p.hash}><Lock size={10} /> {p.hash.slice(0, 10)}…</span>
                  </div>
                  <p className="mt-1 text-xs text-muted"><span className="text-coral/80">✗ {t('falsifier', 'ချေပချက်')}:</span> {p.falsifier}</p>
                  <p className="mt-1 font-mono text-[11px] text-muted">{p.windowStart} → {p.windowEnd} · base {pct(p.baseRate)}{p.baseRateSource ? ` (${p.baseRateSource})` : ''} · ✦{p.intensity} · {p.valence}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {p.outcome
                      ? <span className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] ${p.outcome === 'hit' ? 'bg-jade/15 text-jade' : p.outcome === 'miss' ? 'bg-coral/15 text-coral' : 'bg-white/10 text-muted'}`}>{p.outcome}</span>
                      : ended
                        ? (['hit', 'partial', 'miss'] as Outcome[]).map((o) => (
                          <button key={o} type="button" onClick={() => review(p.id, o)} className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 font-mono text-[11px] text-muted transition hover:text-fg">{o}</button>
                        ))
                        : <span className="font-mono text-[11px] text-muted">{t('window open — score after it ends', 'ဟောကိန်းကာလ မပြီးဆုံးသေးပါ — ပြီးဆုံးမှသာ အမှတ်ပေးပါ')}</span>}
                    <button type="button" onClick={() => remove(p.id)} title="Delete" className="ml-auto inline-flex items-center rounded-lg border border-coral/25 bg-coral/10 px-2 py-1 text-coral transition hover:bg-coral/20"><Trash2 size={12} /></button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Blind journal */}
      <div className="glass-card mb-6 p-6">
        <h2 className="mb-1 font-groovy text-lg text-fg">{t('Blind life-events journal', 'ကြိုတင်မသိရှိနိုင်သော (Blind) ဘဝဖြစ်ရပ် ဂျာနယ်')}</h2>
        <p className="mb-4 text-xs leading-relaxed text-muted">{t('Log what actually happened WITHOUT looking at the predictions — this keeps the matching honest.', 'မိမိ၏ ဟောကိန်းများကို ပြန်မကြည့်ဘဲ လက်တွေ့ဘဝတွင် အမှန်တကယ် ဖြစ်ပျက်ခဲ့သည်များကိုသာ မှတ်တမ်းတင်ပါ — သို့မှသာ တိုက်ဆိုင်စစ်ဆေးမှုသည် မှန်ကန်ရိုးသားမည် ဖြစ်သည်။')}</p>
        <form onSubmit={addJournal} className="grid gap-3 sm:grid-cols-4">
          <label><span className={label}>{t('Month', 'လ')}</span><input type="month" value={jMonth} onChange={(e) => setJMonth(e.target.value)} className={field} /></label>
          <label><span className={label}>{t('Category', 'ကဏ္ဍ')}</span><input value={jCat} onChange={(e) => setJCat(e.target.value)} placeholder={t('Career', 'အလုပ်အကိုင်')} className={field} /></label>
          <label className="sm:col-span-2"><span className={label}>{t('What happened', 'မည်သို့ဖြစ်ပျက်ခဲ့သနည်း')}</span><input value={jDesc} onChange={(e) => setJDesc(e.target.value)} className={field} /></label>
          <label><span className={label}>{t('Magnitude 1–3', 'အတိုင်းအတာ (၁–၃)')}</span><select value={jMag} onChange={(e) => setJMag(Number(e.target.value) as 1 | 2 | 3)} className={field}>{[1, 2, 3].map((n) => <option key={n} value={n} className="text-black">{n}</option>)}</select></label>
          <button type="submit" className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-sm text-accent-light transition hover:bg-accent/20 sm:col-span-3">{t('Add entry', 'မှတ်တမ်းထည့်ရန်')}</button>
        </form>
        {journal.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {journal.map((j) => (
              <li key={j.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-sm">
                <span className="text-fg/90"><span className="font-mono text-xs text-muted">{j.month}</span> · {j.category && <span className="text-accent-light">{j.category}: </span>}{j.description}</span>
                <span className="font-mono text-[11px] text-muted">✦{j.magnitude}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Limitations */}
      <div className="glass-card mb-6 p-6">
        <h2 className="mb-3 font-groovy text-lg text-fg">{t('Known limitations', 'သိရှိနားလည်ထားရမည့် ကန့်သတ်ချက်များ')}</h2>
        <ul className="space-y-1.5 text-sm leading-relaxed text-muted">
          {[
            t('Barnum / self-report bias — vague statements feel true; keep claims specific.', 'Barnum Effect နှင့် Self-report Bias — မရေရာသော ဟောချက်များသည် မှန်ကန်သယောင် ခံစားရတတ်သဖြင့် ဟောချက်များကို တိကျသေချာအောင် ရေးသားပါ။'),
            t('Selection bias — users are not a random sample.', 'Selection Bias — ဤကိရိယာကို အသုံးပြုသူများသည် အများပြည်သူအား ကိုယ်စားပြုသော (Random Sample) နမူနာများ မဟုတ်ပါ။'),
            t('Multiple comparisons — many rules → some "significant" by pure chance (use FDR correction).', 'တိုက်ဆိုင်စစ်ဆေးမှုများပြားခြင်း — တွက်ရိုးများပြားသည့်အခါ အချို့သော ရလဒ်များသည် တိုက်ဆိုင်မှုသက်သက်ကြောင့် "ထင်ရှားသယောင်" (Significant) ဖြစ်နေတတ်သည် (FDR ပြင်ဆင်ချက်ကို အသုံးပြုပါ)။'),
            t('Small n — a trustworthy signal needs hundreds+ of independent charts.', 'နမူနာနည်းပါးခြင်း (Small n) — ယုံကြည်စိတ်ချရသော ကောက်ချက်ချနိုင်ရန်အတွက် သီးခြားလွတ်လပ်သော ဇာတာရှင် ရာပေါင်းများစွာ လိုအပ်ပါသည်။'),
            t('Astrology is not scientifically validated. This is a measurement tool, offered for reflection and study.', 'ဗေဒင်ပညာသည် သိပ္ပံနည်းကျ အပြည့်အဝ အတည်ပြုထားသော ပညာရပ် မဟုတ်ပါ။ ဤစနစ်သည် ကိုယ်တိုင်ဆင်ခြင်သုံးသပ်မှုနှင့် လေ့လာသုတေသနပြုရန်အတွက်သာ ဖန်တီးထားသော တိုင်းတာရေး ကိရိယာတစ်ခု ဖြစ်ပါသည်။'),
          ].map((x, i) => <li key={i} className="flex gap-2"><span className="mt-0.5 text-accent-light">•</span><span>{x}</span></li>)}
        </ul>
      </div>

      {/* Bottom language toggle — no need to scroll back up */}
      <div className="mb-6 flex justify-center">
        <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1">
          {(['en', 'mm'] as Lang[]).map((l) => (
            <button key={l} type="button" onClick={() => setLang(l)} className={`rounded-full px-4 py-1.5 font-mono text-xs transition ${lang === l ? 'bg-accent/70 text-space' : 'text-muted hover:text-fg'}`}>{l === 'en' ? 'EN' : 'မြန်မာ'}</button>
          ))}
        </div>
      </div>

      <footer className="border-t border-accent/15 pt-6 text-center">
        <p className="font-mono text-[11px] tracking-wide text-accent-light">Sidereal · Lahiri ayanamsa (1955) · Whole-Sign houses · Mean node · Swiss Ephemeris</p>
        <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-muted">{signedIn
          ? t('Signed in — data is saved to your account. Astrology is not scientifically validated.', 'အကောင့်ဝင်ထားပါသည် — သင့်ဒေတာများကို အကောင့်ထဲတွင် သိမ်းဆည်းထားပါသည်။ ဗေဒင်ပညာသည် သိပ္ပံနည်းကျ အပြည့်အဝ အတည်ပြုထားသော ပညာရပ် မဟုတ်ပါ။')
          : t('Anonymous — data stays in this browser (localStorage). Astrology is not scientifically validated.', 'အမည်မဖော်ထားပါ — သင့်ဒေတာများသည် ဤ Browser အတွင်း၌ (localStorage) သာ ရှိနေပါမည်။ ဗေဒင်ပညာသည် သိပ္ပံနည်းကျ အပြည့်အဝ အတည်ပြုထားသော ပညာရပ် မဟုတ်ပါ။')}</p>
      </footer>
    </section>
  )
}