import { Sigma, Scale, Sparkles, ArrowUp } from 'lucide-react'
import type { Lang } from '../lib/vedin'

export type ExplainerTopic = 'ashtaka' | 'shadbala'

interface Props {
  topic: ExplainerTopic
  lang: Lang
  /** Smooth-scrolls the querent back to the birth form to cast their chart. */
  onCast: () => void
}

interface Copy {
  Icon: typeof Sigma
  kicker: { en: string; mm: string }
  title: { en: string; mm: string }
  lede: { en: string; mm: string }
  points: { en: string; mm: string }[]
}

const COPY: Record<ExplainerTopic, Copy> = {
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

/**
 * Educational placeholder shown for the Ashtakavarga / Shadbala tabs when no chart has
 * been cast yet — so a footer deep-link lands on something meaningful and premium
 * instead of an empty panel. Explains the technique, then invites the querent to cast
 * their chart (smooth-scrolls up to the birth form).
 */
export default function TopicExplainer({ topic, lang, onCast }: Props) {
  const c = COPY[topic]
  const mm = lang === 'mm'
  const { Icon } = c

  return (
    <div className="glass-card relative overflow-hidden p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Icon size={24} />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-amber-600 dark:text-amber-400">{mm ? c.kicker.mm : c.kicker.en}</p>
          <h3 className="mt-1 font-groovy text-xl text-fg sm:text-2xl">{mm ? c.title.mm : c.title.en}</h3>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted sm:text-[15px]">{mm ? c.lede.mm : c.lede.en}</p>

      <ul className="mt-5 space-y-2.5">
        {c.points.map((p, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-fg/90">
            <Sparkles size={15} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>{mm ? p.mm : p.en}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7 border-t border-black/5 pt-5 dark:border-white/5">
        <button type="button" onClick={onCast}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-600 shadow-md px-5 py-3 text-sm font-semibold text-amber-50 transition hover:brightness-110">
          <ArrowUp size={16} /> {mm ? 'ရလဒ်များ ကြည့်ရန် သင့်ဇာတာ တွက်ပါ' : 'Cast Your Chart to See Results'}
        </button>
        <p className="mt-2 font-mono text-[11px] text-muted">
          {mm ? 'အထက်ရှိ မွေးဖွားချက် ဖောင်တွင် အချက်အလက်ဖြည့်ပါ။' : 'Fill in your birth details in the form above.'}
        </p>
      </div>
    </div>
  )
}
