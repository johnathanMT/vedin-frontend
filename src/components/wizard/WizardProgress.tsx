import { Check } from 'lucide-react'
import type { Lang } from '../../lib/vedin'

export interface StepDef {
  id: number
  title: { mm: string; en: string; ja: string }
  hint: { mm: string; en: string; ja: string }
}

/**
 * Three steps, one question per screen. The old form put ten inputs plus a
 * latitude field on a single dense screen; this states where the querent is
 * and how much is left.
 */
export const WIZARD_STEPS: StepDef[] = [
  {
    id: 1,
    title: { mm: 'သင့်အကြောင်း', en: 'About you', ja: 'あなたについて' },
    hint: { mm: 'အမည်နှင့် ကျား/မ ကို ဖြည့်ပါ။', en: 'Your name and gender.', ja: 'お名前と性別をご入力ください。' },
  },
  {
    id: 2,
    title: { mm: 'မွေးသက္ကရာဇ်နှင့် အချိန်', en: 'Date & time', ja: '生年月日と時刻' },
    hint: { mm: 'မွေးသက္ကရာဇ်နှင့် မွေးချိန်ကို တိကျစွာ ဖြည့်ပါ။', en: 'Your exact date and time of birth.', ja: '正確な生年月日と出生時刻をご入力ください。' },
  },
  {
    id: 3,
    title: { mm: 'မွေးဖွားရာ အရပ်', en: 'Birth place', ja: '出生地' },
    hint: { mm: 'မြို့ကို ရှာပါ (သို့) မြေပုံပေါ်တွင် အမှတ်ချပါ။', en: 'Search a city or drop a pin on the map.', ja: '都市を検索するか、地図上にピンを置いてください。' },
  },
]

export default function WizardProgress({ lang, step }: { lang: Lang; step: number }) {
  const mm = lang === 'mm'
  const pct = (step / WIZARD_STEPS.length) * 100

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2">
        {WIZARD_STEPS.map((s, i) => {
          const done = step > s.id
          const active = step === s.id
          return (
            <div key={s.id} className="flex flex-1 items-center gap-2">
              <span
                aria-current={active ? 'step' : undefined}
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border font-mono text-[11px] font-semibold transition ${
                  done ? 'border-jade/50 bg-jade/20 text-jade-light'
                    : active ? 'border-accent bg-accent/20 text-accent-light shadow-[0_0_18px_-4px_rgb(var(--accent)/0.7)]'
                      : 'border-white/15 bg-white/5 text-muted'}`}>
                {done ? <Check size={13} /> : s.id}
              </span>
              <span className={`hidden truncate text-xs sm:block ${active ? 'text-fg' : 'text-muted'}`}>
                {lang === 'ja' ? s.title.ja : mm ? s.title.mm : s.title.en}
              </span>
              {i < WIZARD_STEPS.length - 1 && <span className="h-px flex-1 bg-white/10" />}
            </div>
          )
        })}
      </div>

      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/8">
        <div className="h-full rounded-full bg-amber-600 shadow-md transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }} />
      </div>

      <p className="mt-2 font-mono text-[10px] text-muted">
        {lang === 'ja'
          ? `ステップ ${step} / ${WIZARD_STEPS.length} — ${WIZARD_STEPS[step - 1].hint.ja}`
          : mm
          ? `အဆင့် ${step} / ${WIZARD_STEPS.length} — ${WIZARD_STEPS[step - 1].hint.mm}`
          : `Step ${step} of ${WIZARD_STEPS.length} — ${WIZARD_STEPS[step - 1].hint.en}`}
      </p>
    </div>
  )
}
