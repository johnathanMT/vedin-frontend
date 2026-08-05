import { useState, useRef, useEffect, useLayoutEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Copy, Check, FlaskConical } from 'lucide-react'
import useLang from '../hooks/useLang'

/**
 * KaTeX (the library plus its stylesheet and web fonts) is by far the heaviest
 * thing on this page, and every formula needs the same instance. It is imported
 * once, on demand, and shared through this promise so N formulas trigger one load.
 */
let katexPromise: Promise<typeof import('katex').default> | null = null

function loadKatex() {
  if (!katexPromise) {
    katexPromise = Promise.all([
      import('katex'),
      import('katex/dist/katex.min.css'),
    ]).then(([mod]) => mod.default)
  }
  return katexPromise
}


interface Section {
  id: string; num: string
  title: string
  titleJa?: string
  tags: string[]
  complexity?: string
  en: ReactNode
  mm: ReactNode
  ja?: ReactNode
  formula: string[]   // one or more display-mode LaTeX strings
  code: string
}

// ── Copyable code block ──
function Code({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard?.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }).catch(() => { }) }
  return (
    <div className="relative mt-3">
      <button type="button" onClick={copy} aria-label="Copy code"
        className="no-print absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2 py-1 font-mono text-[10px] text-slate-300 transition hover:text-white">
        {copied ? <><Check size={11} className="text-jade" /> copied</> : <><Copy size={11} /> copy</>}
      </button>
      {/* Background is always near-black, so the text colour is fixed light —
          never theme-dependent (a themed `text-fg` turns dark → invisible in light mode). */}
      <pre className="w-full overflow-x-auto overflow-y-hidden overscroll-x-contain scrollbar-hide touch-pan-x rounded-xl border border-accent/15 bg-[rgb(10_10_18)] p-4 text-[12.5px] leading-relaxed" style={{ WebkitOverflowScrolling: 'touch' }}>
        <code className="block min-w-max font-mono text-[rgb(226_232_240)]">{code}</code>
      </pre>
    </div>
  )
}

// ── LaTeX (KaTeX) display block ──
// KaTeX glyphs inherit `currentColor`, so the wrapper's `text-fg` makes the math
// readable in BOTH light and dark themes. On narrow screens a wide formula would
// run off the edge, so we measure it and scale-to-fit the container width — the
// WHOLE equation is always visible (as large as will fit), never clipped.
function MathBlock({ tex }: { tex: string }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  // Until KaTeX arrives the raw TeX is shown in monospace: readable, and it keeps
  // the block's height roughly stable so the page does not jump on hydration.
  const [html, setHtml] = useState(() => `<span class="font-mono text-muted">${tex}</span>`)

  useEffect(() => {
    let cancelled = false
    loadKatex()
      .then((katex) => {
        if (cancelled) return
        setHtml(katex.renderToString(tex, { displayMode: true, throwOnError: false, output: 'html' }))
      })
      .catch(() => { if (!cancelled) setHtml(`<span class="font-mono text-coral">${tex}</span>`) })
    return () => { cancelled = true }
  }, [tex])

  // Scale the formula's FONT-SIZE (not a CSS transform) down until it fits the
  // container. Font-size scaling shrinks the real layout box, so `overflow-x-auto`
  // stays honest — no scrollbar when it fits, a smooth horizontal swipe if a wide
  // equation still overflows. Re-runs after paint, on resize, and once KaTeX
  // web-fonts finish loading (the first measure can use fallback-font metrics).
  useLayoutEffect(() => {
    const wrap = wrapRef.current, inner = innerRef.current
    if (!wrap || !inner) return
    const fit = () => {
      inner.style.fontSize = '1em'                 // reset, then measure the intrinsic width
      const avail = wrap.clientWidth
      const natural = inner.scrollWidth
      if (avail > 0 && natural > avail) inner.style.fontSize = `${Math.max(0.45, avail / natural)}em`
    }
    fit()
    const raf = requestAnimationFrame(fit)
    const ro = new ResizeObserver(fit)
    ro.observe(wrap)
    let cancelled = false
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts
    fonts?.ready?.then(() => { if (!cancelled) fit() }).catch(() => { })
    return () => { cancelled = true; cancelAnimationFrame(raf); ro.disconnect() }
  }, [html])

  return (
    // max-w-full → never wider than the parent grid/flex cell (with the section
    // column's min-w-0, this stops displayMode from blowing out the layout).
    // overflow-x-auto → swipe fallback if a formula is still too wide after shrinking.
    <div ref={wrapRef} className="katex-block w-full max-w-full overflow-x-auto overflow-y-hidden overscroll-x-contain pb-2 scrollbar-hide touch-pan-x">
      <div ref={innerRef} className="min-w-max" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}

const Formula = ({ formula }: { formula: string[] }) => (
  <div className="mt-3 max-w-full space-y-3 overflow-hidden rounded-xl border border-accent/20 bg-accent/[0.05] px-4 py-4 text-fg">
    {formula.map((f, i) => <MathBlock key={i} tex={f} />)}
  </div>
)

const SECTIONS: Section[] = [
  {
    id: 'julian', num: 'A', title: 'Julian Day — integer arithmetic',
    tags: ['#integer-division', '#floor', '#epoch', '#edge-cases'],
    en: 'The Fliegel–Van Flandern (1968) algorithm converts a calendar date to a Julian Day Number using only integer floor-division — no floating point, so it is exact. The tricky part is the Gregorian/Julian switch and overflow for far dates.',
    mm: 'Fliegel–Van Flandern (၁၉၆၈) algorithm သည် ပြက္ခဒိန်ရက်စွဲကို Julian Day Number အဖြစ် integer floor-division သီးသန့်ဖြင့် ပြောင်းသည် — floating point မသုံးသဖြင့် အတိအကျ။ ခက်ခဲသည့်အပိုင်းက Gregorian/Julian ကူးပြောင်းမှုနှင့် ရက်ဝေးများ၏ overflow။',
    formula: [
      'a = \\left\\lfloor \\dfrac{M-14}{12} \\right\\rfloor',
      '\\mathrm{JDN} = \\left\\lfloor \\dfrac{1461\\,(Y+4800+a)}{4} \\right\\rfloor + \\left\\lfloor \\dfrac{367\\,(M-2-12a)}{12} \\right\\rfloor - \\left\\lfloor \\dfrac{3\\left\\lfloor (Y+4900+a)/100 \\right\\rfloor}{4} \\right\\rfloor + D - 32075',
    ],
    code: `function julianDayNumber(y: number, m: number, d: number): number {
  const a = Math.floor((m - 14) / 12);           // −1 for Jan/Feb, else 0
  return (
    Math.floor((1461 * (y + 4800 + a)) / 4) +
    Math.floor((367 * (m - 2 - 12 * a)) / 12) -
    Math.floor((3 * Math.floor((y + 4900 + a) / 100)) / 4) +
    d - 32075
  );
}`,
  },
  {
    id: 'ephemeris', num: 'B', title: 'Ephemeris — VSOP87 truncated series',
    tags: ['#numerical-analysis', '#series-truncation', '#error-propagation'],
    complexity: 'O(n) in the number of retained terms — accuracy/size tradeoff.',
    en: 'A planet’s heliocentric longitude is a sum of thousands of periodic terms. VSOP87 truncates the series: keep the largest terms, drop the rest. Fewer terms → smaller tables but larger error. τ is time in Julian millennia from J2000. A ΔT polynomial (Espenak–Meeus) corrects TT vs UT.',
    mm: 'ဂြိုဟ်၏ heliocentric longitude သည် periodic term ထောင်ချီ၏ ပေါင်းလဒ်ဖြစ်သည်။ VSOP87 က series ကို truncate လုပ်သည် — အကြီးဆုံး term များ ထားပြီး ကျန်ကို ဖယ်။ term နည်း → table သေး၊ error ကြီး။ τ သည် J2000 မှ Julian millennia အချိန်။ ΔT polynomial (Espenak–Meeus) က TT/UT ကွာဟမှုကို ပြင်သည်။',
    formula: [
      'L = \\sum_{i} A_i \\cos\\!\\left(B_i + C_i\\,\\tau\\right)',
      '\\tau = \\dfrac{JD - 2451545.0}{365250}',
    ],
    code: `type Term = [A: number, B: number, C: number];
function vsop(series: Term[], jd: number): number {
  const tau = (jd - 2451545.0) / 365250;         // Julian millennia
  let sum = 0;
  for (const [A, B, C] of series) sum += A * Math.cos(B + C * tau);
  return sum;                                     // radians (before scaling)
}`,
  },
  {
    id: 'coords', num: 'C', title: 'Coordinate transform — rotation & Ascendant',
    tags: ['#linear-algebra', '#rotation-matrix', '#spherical-trig', '#atan2'],
    en: 'Ecliptic → equatorial coordinates is a rotation about the x-axis by the obliquity ε. The Ascendant (Lagna) — the rising ecliptic degree — comes from spherical trigonometry using local sidereal time θ and latitude φ. The classic bug is atan2 quadrant handling and φ → ±90°.',
    mm: 'Ecliptic → equatorial ပြောင်းခြင်းသည် obliquity ε ဖြင့် x-ဝင်ရိုးပတ် rotation တစ်ခုပါ။ လဂ်နာ (Ascendant) — ထွက်ပေါ်လာသော ecliptic ဒီဂရီ — ကို local sidereal time θ နှင့် latitude φ သုံး၍ spherical trigonometry ဖြင့် တွက်သည်။ ရိုးရာ bug က atan2 quadrant ကိုင်တွယ်မှုနှင့် φ → ±90° ဖြစ်သည်။',
    formula: [
      '\\begin{bmatrix} x\' \\\\ y\' \\\\ z\' \\end{bmatrix} = \\begin{bmatrix} 1 & 0 & 0 \\\\ 0 & \\cos\\varepsilon & -\\sin\\varepsilon \\\\ 0 & \\sin\\varepsilon & \\cos\\varepsilon \\end{bmatrix} \\begin{bmatrix} x \\\\ y \\\\ z \\end{bmatrix}',
      '\\mathrm{Asc} = \\operatorname{atan2}\\!\\big(\\cos\\theta,\\; -(\\sin\\theta\\cos\\varepsilon + \\tan\\phi\\sin\\varepsilon)\\big)',
    ],
    code: `function ascendant(theta: number, phi: number, eps: number): number {
  // theta = local sidereal time, phi = latitude, eps = obliquity (radians)
  const asc = Math.atan2(Math.cos(theta),
    -(Math.sin(theta) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)));
  return ((asc * 180 / Math.PI) % 360 + 360) % 360;   // normalise 0–360
}`,
  },
  {
    id: 'modular', num: 'D', title: 'Modular arithmetic — the backbone',
    tags: ['#modular-arithmetic', '#group-theory', '#negative-modulo'],
    en: 'The whole of Vedic astrology is stacked cyclic groups: signs ℤ/12, nakshatras ℤ/27, the dasha cycle ℤ/9, padas ℤ/4, all over the circle ℝ/360ℤ. The classic pitfall: in JS, −30 % 360 = −30 (not 330). Always re-normalise with ((x % n) + n) % n.',
    mm: 'ဇျောတိသတစ်ခုလုံးသည် cyclic group အထပ်ထပ်ဖြစ်သည်: ရာသီ ℤ/12၊ နက္ခတ် ℤ/27၊ ဒသာစက်ဝန်း ℤ/9၊ ပါဒ ℤ/4၊ အားလုံး ℝ/360ℤ စက်ဝိုင်းပေါ်တွင်။ ရိုးရာ pitfall — JS မှာ −30 % 360 = −30 (330 မဟုတ်)။ ((x % n) + n) % n ဖြင့် အမြဲ ပြန်ချိန်ပါ။',
    formula: [
      '\\begin{aligned} \\operatorname{sign}(\\lambda) &= \\left\\lfloor \\lambda/30 \\right\\rfloor \\bmod 12 \\\\[2pt] \\operatorname{nak}(\\lambda) &= \\left\\lfloor \\lambda/\\tfrac{40}{3} \\right\\rfloor \\bmod 27 \\quad (\\tfrac{40}{3}=13^\\circ20\') \\\\[2pt] \\operatorname{pada}(\\lambda) &= \\left\\lfloor \\dfrac{\\lambda \\bmod \\tfrac{40}{3}}{\\tfrac{10}{3}} \\right\\rfloor + 1 \\end{aligned}',
      '\\text{safe modulo: } \\; ((x \\bmod n) + n) \\bmod n',
    ],
    code: `const mod = (x: number, n: number) => ((x % n) + n) % n;   // safe modulo
const sign      = (lon: number) => mod(Math.floor(lon / 30), 12);
const nakshatra = (lon: number) => mod(Math.floor(lon / (40 / 3)), 27);
const pada      = (lon: number) => Math.floor((lon % (40 / 3)) / (10 / 3)) + 1;`,
  },
  {
    id: 'varga', num: 'E', title: 'Varga maps — piecewise-linear functions',
    tags: ['#piecewise-function', '#lookup-table', '#generalization'],
    en: 'Each divisional chart is a function f : [0°,360°) → ℤ/12. The Navamsa (D9) divides every sign into 9 parts of 3°20′; the starting sign follows a period-4 pattern by movable/fixed/dual sign. A nice research question: can all 16 vargas share one uniform interface?',
    mm: 'ဇာတာခွဲတစ်ခုစီသည် function f : [0°,360°) → ℤ/12 တစ်ခုပါ။ နဝင်း (D9) က ရာသီတိုင်းကို 3°20′ စီ ၉ ပိုင်း ခွဲသည်; စတင်ရာသီသည် စရ/သ္ထိရ/ဒွိသွဘာဝ အလိုက် period-4 pattern။ စိတ်ဝင်စားစရာ research question — ဝဂ် ၁၆ ခုလုံးကို uniform interface တစ်ခုတည်းဖြင့် ကိုင်တွယ်နိုင်မလား?',
    formula: [
      'D_9(\\lambda) = \\Big( s_{\\text{start}} + \\left\\lfloor \\dfrac{\\lambda \\bmod 30}{10/3} \\right\\rfloor \\Big) \\bmod 12',
      's_{\\text{start}} = [\\,0,\\,9,\\,6,\\,3\\,]\\big[\\operatorname{sign}(\\lambda) \\bmod 4\\big] \\quad (\\text{movable / fixed / dual})',
    ],
    code: `const NAVAMSA_START = [0, 9, 6, 3];             // period-4 pattern
function navamsa(lon: number): number {
  const sign = Math.floor(lon / 30);
  const start = NAVAMSA_START[sign % 4];
  return (start + Math.floor((lon % 30) / (10 / 3))) % 12;
}`,
  },
  {
    id: 'dasha', num: 'F', title: 'Vimśottarī dasha — recursive subdivision',
    tags: ['#recursion', '#tree', '#lazy-eval', '#self-similarity'],
    complexity: 'Naïve full tree O(9ᵈ) — depth 5 = 59,049 nodes. Use lazy expansion + O(d·9) interval search for the active path.',
    en: 'The dasha timeline is self-similar: each period subdivides into 9 sub-periods in the same fixed order, each sized by the sub-lord’s share of 120 years. Fully expanding all levels is O(9ᵈ) — so expand lazily, and binary-search the active branch. Deep levels need rational arithmetic to avoid date drift.',
    mm: 'ဒသာ timeline သည် self-similar ဖြစ်သည်: ကာလတစ်ခုစီ တူညီသော အစီအစဉ်ဖြင့် sub-period ၉ ခု ခွဲ၊ တစ်ခုစီ၏ အရွယ်က sub-lord ၏ ၁၂၀ နှစ်အတွင်း ဝေစုအလိုက်။ အဆင့်အားလုံး အပြည့်ချဲ့ခြင်း O(9ᵈ) — ထို့ကြောင့် lazy ချဲ့ပြီး active branch ကို binary-search။ အဆင့်နက်လျှင် ရက်စွဲ လွဲမှုရှောင်ရန် rational arithmetic လို။',
    formula: [
      'T(p, t_0, \\Delta) = \\Big\\{ \\big(p_i,\\; t_0 + \\textstyle\\sum_{j<i} \\delta_j,\\; \\delta_i\\big) \\Big\\}_{i=0}^{8}',
      '\\delta_i = \\Delta \\cdot \\dfrac{y_{p_i}}{120} \\qquad \\text{full tree: } O(9^{d})',
    ],
    code: `const ORDER = ['Ke','Ve','Su','Mo','Ma','Ra','Ju','Sa','Me'];
const YEARS: Record<string, number> = { Ke:7,Ve:20,Su:6,Mo:10,Ma:7,Ra:18,Ju:16,Sa:19,Me:17 };

function expand(lord: string, start: number, span: number, depth: number): Node {
  if (depth === 0) return { lord, start, span, children: [] };
  const i0 = ORDER.indexOf(lord);
  let t = start;
  const children = ORDER.map((_, k) => {
    const p = ORDER[(i0 + k) % 9];
    const d = span * YEARS[p] / 120;
    const node = expand(p, t, d, depth - 1);      // ★ recursion
    t += d;
    return node;
  });
  return { lord, start, span, children };
}`,
  },
  {
    id: 'ashtakavarga', num: 'G', title: 'Ashtakavarga — combinatorics & bitmasks',
    tags: ['#combinatorics', '#bitmask', '#circular-shift', '#invariant'],
    en: 'For each planet, eight references (7 grahas + the Ascendant) each contribute a benefit bit to certain houses counted from themselves — an 8×12 boolean matrix. Store each reference’s benefic houses as a 12-bit mask and shift. A great unit-test invariant: the Sarvashtakavarga total is always 337.',
    mm: 'ဂြိုဟ်တစ်လုံးအတွက် reference ၈ ခု (ဂြိုဟ် ၇ + လဂ်နာ) စီက သူ့ကနေ ရေတွက်သော အိမ်အချို့သို့ benefit bit ပေးသည် — 8×12 boolean matrix။ reference တစ်ခုစီ၏ benefic အိမ်များကို 12-bit mask အဖြစ်သိမ်း၍ shift။ ကောင်းမွန်သော unit-test invariant — Sarvashtakavarga စုစုပေါင်း အမြဲ ၃၃၇။',
    formula: [
      '\\mathrm{BAV}[P][s] = \\sum_{c} \\big[\\, ((s - \\operatorname{sign}(c)) \\bmod 12 + 1) \\in \\mathcal{B}(P,c) \\,\\big]',
      '\\mathrm{SAV}[s] = \\sum_{P} \\mathrm{BAV}[P][s] \\quad\\Longrightarrow\\quad \\sum_{s=1}^{12} \\mathrm{SAV}[s] = 337',
    ],
    code: `type Mask = number;   // 12 bits, bit i = "i+1 houses away earns a point"
function bav(planet: Planet, chart: Chart): number[] {
  const counts = new Array(12).fill(0);
  for (const c of CONTRIBUTORS[planet]) {          // 7 grahas + Asc
    const from = chart.sign[c];
    const mask: Mask = BENEFIC_PLACES[planet][c];
    for (let i = 0; i < 12; i++)
      if (mask & (1 << i)) counts[(from + i) % 12]++;
  }
  return counts;
}`,
  },
  {
    id: 'repro', num: 'H', title: 'Reproducibility & testing',
    tags: ['#determinism', '#golden-fixtures', '#property-testing', '#rational'],
    en: 'Every calculation is a pure function — no Date.now(), no global state — so the same input always gives the same output. Golden fixtures (tolerance ±0.02°) pin known charts; property-based tests assert invariants (SAV = 337, varga ∈ [0,12), dasha spans sum to the parent). On the critical path, rational arithmetic avoids float drift.',
    mm: 'တွက်ချက်မှုတိုင်းသည် pure function — Date.now() မရှိ၊ global state မရှိ — ထို့ကြောင့် input တူ → output အမြဲတူ။ Golden fixtures (tolerance ±0.02°) က သိထားသော ဇာတာများကို ပုံသေချုပ်; property-based test များက invariant များ (SAV = 337၊ varga ∈ [0,12)၊ dasha span များ ပေါင်းလျှင် parent) ကို အတည်ပြု။ critical path တွင် rational arithmetic က float လွဲမှု ရှောင်သည်။',
    formula: [
      '\\begin{aligned} \\forall\\,\\text{chart}: &\\quad \\textstyle\\sum_{s} \\mathrm{SAV}[s] = 337 \\\\[2pt] \\forall\\,\\lambda: &\\quad \\operatorname{varga}(\\lambda) \\in \\{0,\\dots,11\\} \\\\[2pt] \\forall\\,\\text{node}: &\\quad \\textstyle\\sum \\text{child.span} = \\text{parent.span} \\end{aligned}',
    ],
    code: `import { test } from 'vitest';
import fc from 'fast-check';

test('SAV always totals 337', () => {
  fc.assert(fc.property(arbitraryChart(), (chart) => {
    const sav = sarvashtakavarga(chart);
    return sav.reduce((a, b) => a + b, 0) === 337;   // invariant
  }));
});`,
  },
]

// Japanese (academic tone) merged into SECTIONS at load — keeps the English/Burmese
// section data untouched. title includes " — " so the nav split still works.
const ALGO_JA: Record<string, { title: string; body: string }> = {
  julian: {
    title: 'ユリウス日 — 整数演算',
    body: 'Fliegel–Van Flandern（1968）のアルゴリズムは、暦日をユリウス日番号へ整数の床除算のみで変換します — 浮動小数点を用いないため、厳密です。難所はグレゴリオ暦／ユリウス暦の切り替えと、遠い日付でのオーバーフローです。',
  },
  ephemeris: {
    title: '天体暦 — VSOP87 切り詰め級数',
    body: '惑星の日心黄経は、数千の周期項の総和です。VSOP87はこの級数を切り詰めます — 最大の項を残し、残りを捨てます。項が少ないほど表は小さくなりますが、誤差は大きくなります。τはJ2000からのユリウス千年単位の時間です。ΔT多項式（Espenak–Meeus）がTTとUTの差を補正します。',
  },
  coords: {
    title: '座標変換 — 回転とアセンダント',
    body: '黄道座標から赤道座標への変換は、黄道傾斜角εだけx軸まわりに回転させる操作です。アセンダント（ラグナ） — 上昇する黄道の度数 — は、地方恒星時θと緯度φを用いた球面三角法から求められます。典型的なバグは、atan2の象限処理とφ→±90°の扱いです。',
  },
  modular: {
    title: '合同算術 — 基盤となる仕組み',
    body: 'インド占星術の全体は、巡回群の積み重ねです：星座はℤ/12、ナクシャトラはℤ/27、ダシャー周期はℤ/9、パーダはℤ/4、そしてそのすべてが円周ℝ/360ℤ上にあります。典型的な落とし穴：JavaScriptでは −30 % 360 = −30（330ではありません）。必ず ((x % n) + n) % n で再正規化してください。',
  },
  varga: {
    title: '分割図マップ — 区分線形関数',
    body: '各分割図は関数 f : [0°,360°) → ℤ/12 です。ナヴァムシャ（D9）は各星座を3°20′の9区分に分割し、開始星座は活動宮・不動宮・柔軟宮による周期4のパターンに従います。良い研究課題：16すべてのヴァルガを一つの統一的なインターフェースで表せるか？',
  },
  dasha: {
    title: 'ヴィムショッタリー・ダシャー — 再帰的分割',
    body: 'ダシャーの時間軸は自己相似です：各期間は同じ固定順で9つの下位期間に分割され、それぞれの大きさは下位支配星の120年に対する持ち分で決まります。全階層を完全展開すると O(9ᵈ) となるため、遅延展開し、有効な枝を二分探索します。深い階層では、日付のずれを避けるために有理数演算が必要です。',
  },
  ashtakavarga: {
    title: 'アシュタカヴァルガ — 組合せ論とビットマスク',
    body: '各惑星について、8つの基準（7グラハ＋アセンダント）が、それぞれ自身から数えた特定のハウスに吉のビットを寄与します — 8×12のブール行列です。各基準の吉ハウスを12ビットのマスクとして格納し、シフトします。優れた単体テストの不変条件：サルヴァアシュタカヴァルガの合計は常に337です。',
  },
  repro: {
    title: '再現性とテスト',
    body: 'すべての計算は純粋関数です — Date.now() も、グローバル状態もありません — したがって、同じ入力は常に同じ出力を与えます。ゴールデン・フィクスチャ（許容誤差 ±0.02°）が既知のチャートを固定し、プロパティベーステストが不変条件（SAV = 337、varga ∈ [0,12)、ダシャー期間の合計が親と一致）を検証します。クリティカルパスでは、有理数演算が浮動小数点のずれを防ぎます。',
  },
}
for (const s of SECTIONS) {
  const j = ALGO_JA[s.id]
  if (j) { s.titleJa = j.title; s.ja = j.body }
}

export default function Algorithms() {
  const { lang } = useLang()
  const t = (en: string, mm: string, ja?: string) => (lang === 'ja' && ja ? ja : lang === 'mm' ? mm : en)

  return (
    <section className="section-container vedin-page">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-mono text-xs text-muted transition hover:text-fg"><ArrowLeft size={15} /> Vedin</Link>
      </div>

      {/* Top cross-link to the sibling page */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link to="/research" className="inline-flex items-center gap-1.5 rounded-full border border-jade/30 bg-jade/10 px-4 py-2 font-mono text-[11px] text-jade transition hover:bg-jade/20">
          <FlaskConical size={13} /> {t('Falsifiable research protocol →', 'တိုင်းတာနိုင်သော သုတေသန လုပ်ထုံး →')}
        </Link>
      </div>

      <div className="glass-card mb-6 p-6">
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-accent-light"><FlaskConical size={14} /> {t('Computational reconstruction', 'ကွန်ပျူတာဖြင့် ပြန်တည်ဆောက်ခြင်း')}</p>
        <h1 className="mt-2 font-groovy text-2xl text-fg sm:text-3xl">{t('The algorithms behind the charts', 'ဇာတာများ၏ နောက်ကွယ်မှ algorithm များ', 'チャートの背後にあるアルゴリズム')}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
          {t('A catalog of the classical astronomical & astrological algorithms this engine reconstructs — for the Computer Science "Algorithms and Mathematical Concepts for Computing". Each entry pairs plain-language notes, the mathematics, and the TypeScript that implements it.',
            'ကွန်ပျူတာသိပ္ပံဘာသာရပ် "Algorithms and Mathematical Concepts for Computing" အတွက် ရည်ရွယ်၍ ဤစနစ် (Engine) မှ ပြန်လည်ဖော်ထုတ်ရေးသားထားသော ရှေးဟောင်း နက္ခတ္တဗေဒနှင့် ဗေဒင်ပညာ တွက်ရိုး (Algorithms) များ၏ စာရင်းမှတ်တမ်း။ အပိုင်းတစ်ခုချင်းစီတိုင်း၌ သာမန်နားလည်လွယ်သော ရှင်းလင်းချက်များ၊ သင်္ချာသီအိုရီများနှင့် ၎င်းတို့ကို အသက်သွင်းရေးသားထားသော TypeScript ကုဒ်များကိုပါ အချိတ်အဆက်မိမိ တွဲဖက်ပြသထားပါသည်။',
            'このエンジンが再構築する、古典的な天文学・占星術アルゴリズムのカタログです — 計算機科学「Algorithms and Mathematical Concepts for Computing」を念頭に置いています。各項目では、平易な解説・数式・それを実装するTypeScriptを対にして示します。')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">
        {/* Sticky TOC */}
        <nav aria-label="Contents" className="no-print h-fit lg:sticky lg:top-16">
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto whitespace-nowrap rounded-2xl border border-fg/10 bg-fg/[0.02] p-2 lg:flex-col lg:whitespace-normal">
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="shrink-0 rounded-lg px-3 py-1.5 font-mono text-xs text-muted transition hover:bg-accent/10 hover:text-accent-light focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
                <span className="text-accent-light">{s.num}</span> · {(lang === 'ja' && s.titleJa ? s.titleJa : s.title).split(' — ')[0]}
              </a>
            ))}
          </div>
        </nav>

        {/* Sections */}
        <div className="min-w-0 space-y-6">
          {SECTIONS.map((s) => (
            <article key={s.id} id={s.id} className="glass-card scroll-mt-20 p-6">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-groovy text-2xl text-accent-light">{s.num}</span>
                <h2 className="font-groovy text-lg text-fg">{lang === 'ja' && s.titleJa ? s.titleJa : s.title}</h2>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {s.tags.map((tag) => <span key={tag} className="rounded-full border border-accent/25 bg-accent/[0.06] px-2 py-0.5 font-mono text-[10px] text-accent-light">{tag}</span>)}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{lang === 'ja' && s.ja ? s.ja : lang === 'mm' ? s.mm : s.en}</p>
              <Formula formula={s.formula} />
              {s.complexity && <p className="mt-3 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2 font-mono text-[11px] text-muted"><span className="text-accent-light">Complexity:</span> {s.complexity}</p>}
              <Code code={s.code} />
            </article>
          ))}
        </div>
      </div>


      <footer className="mt-8 border-t border-accent/15 pt-6 text-center">
        <p className="font-mono text-[11px] tracking-wide text-accent-light">Sidereal · Lahiri ayanamsa (1955) · Whole-Sign houses · Mean node · Swiss Ephemeris</p>
        <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-muted">{t('Documenting the computation, not claiming the outcome. Astrology is not scientifically validated.', 'တွက်ချက်မှုကို မှတ်တမ်းတင်ခြင်းသာ — ရလဒ်ကို ကြေညာခြင်း မဟုတ်။ ဗေဒင်သည် သိပ္ပံနည်းကျ အတည်ပြုထားခြင်း မရှိပါ။')}</p>
        <Link to="/research" className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 font-mono text-[11px] text-accent-light transition hover:bg-accent/20">{t('Falsifiable research protocol →', 'တိုင်းတာနိုင်သော သုတေသန လုပ်ထုံး →')}</Link>
      </footer>
    </section>
  )
}
