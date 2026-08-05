import { memo } from 'react'
import { Sunrise, Moon, Timer, CalendarDays, AlertTriangle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Appear } from './motion/Reveal'
import { signLabel, planetName, toMmDigits, findPlanet, tri, type Lang, type Naynan } from '../lib/vedin'
import type { BirthChartData } from '../types/astrology'

/**
 * The six result tabs all carry equal weight, so the querent has to go hunting
 * for the four facts they actually came for. This hero states them up front:
 * Lagna, Moon sign, running Mahadasha and Nay Nan.
 */
interface Stat {
  icon: LucideIcon
  label: string
  value: string
  note?: string
  tone: 'accent' | 'jade' | 'coral'
}

const TONE: Record<Stat['tone'], { text: string; ring: string; glow: string }> = {
  accent: { text: 'text-accent-light', ring: 'border-accent/25', glow: 'bg-accent/10' },
  jade: { text: 'text-jade-light', ring: 'border-jade/25', glow: 'bg-jade/10' },
  coral: { text: 'text-coral', ring: 'border-coral/25', glow: 'bg-coral/10' },
}

function ChartSummaryHero({
  data, lang, mahadashaLord, naynan, name, timeUnknown = false,
}: {
  data: BirthChartData
  lang: Lang
  mahadashaLord?: string
  naynan?: Naynan | null
  name?: string
  timeUnknown?: boolean
}) {
  const mm = lang === 'mm'
  const L = tri(lang)
  const moon = findPlanet(data, 'Moon')

  const stats: Stat[] = [
    {
      icon: Sunrise,
      label: L('Lagna', 'လဂ်', 'ラグナ'),
      value: signLabel(data.ascendant.sign, lang),
      note: `${Math.floor(data.ascendant.degreeInSign)}° · ${data.ascendant.nakshatraName}`,
      tone: 'accent',
    },
    {
      icon: Moon,
      label: L('Moon sign', 'စန်းရာသီ', '月星座'),
      value: moon ? signLabel(moon.sign, lang) : '—',
      note: moon ? `${Math.floor(moon.degreeInSign)}° · ${moon.nakshatraName}` : undefined,
      tone: 'jade',
    },
    {
      icon: Timer,
      label: L('Current Mahadasha', 'လက်ရှိ မဟာဒသာ', '現在のマハーダシャー'),
      value: mahadashaLord ? planetName(mahadashaLord, lang) : '—',
      tone: 'coral',
    },
    {
      icon: CalendarDays,
      label: L('Nay Nan', 'နေ့နံ', '誕生曜日'),
      value: naynan ? (mm ? naynan.mmDay : naynan.enDay) : '—',
      note: naynan ? (mm ? `နံ ${toMmDigits(naynan.num)} · ${planetName(naynan.planet, lang)}` : `No. ${naynan.num} · ${naynan.planet}`) : undefined,
      tone: 'accent',
    },
  ]

  return (
    <Appear className="glass-card relative overflow-hidden p-5 sm:p-6">
      {/* a barely-there monochrome vignette — grounds the hero without a coloured aurora */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(120% 90% at 0% 0%, rgb(255 255 255 / 0.02), transparent 60%)' }} />

      <div className="relative">
        {name && (
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
            {L('Reading for', 'ဟောကိန်းအတွက်', '鑑定対象')} · <span className="text-fg/80">{name}</span>
          </p>
        )}

        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s, i) => {
            const tone = TONE[s.tone]
            const Icon = s.icon
            return (
              <Appear key={s.label} delay={0.06 * i} y={10}
                className={`rounded-2xl border ${tone.ring} bg-white/[0.03] p-3.5 transition hover:border-accent/40`}>
                <div className="flex items-center gap-1.5">
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-lg ${tone.glow} ${tone.text}`}>
                    <Icon size={13} />
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{s.label}</span>
                </div>
                <p className={`mt-2 truncate font-groovy text-xl font-bold ${tone.text}`} title={s.value}>{s.value}</p>
                {s.note && <p className="mt-0.5 truncate font-mono text-[10px] text-muted" title={s.note}>{s.note}</p>}
              </Appear>
            )
          })}
        </div>

        {timeUnknown && (
          <p className="mt-3 flex items-start gap-1.5 rounded-xl border border-coral/30 bg-coral/5 px-3 py-2 font-mono text-[11px] leading-relaxed text-muted">
            <AlertTriangle size={13} className="mt-0.5 shrink-0 text-coral" />
            {mm
              ? 'မွေးချိန် အတိအကျ မသိသဖြင့် မွန်းတည့် ၁၂:၀၀ ဖြင့် တွက်ထားပါသည် — လဂ်နှင့် အိမ်ခွဲများ မတိကျပါ။'
              : 'Cast for 12:00 noon because the birth time is unknown — the Lagna and house cusps are not reliable.'}
          </p>
        )}
      </div>
    </Appear>
  )
}

export default memo(ChartSummaryHero)
