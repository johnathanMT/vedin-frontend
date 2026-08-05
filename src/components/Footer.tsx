import { Link } from 'react-router-dom'
import useLang from '../hooks/useLang'

/**
 * Footer — grounded, premium, fully theme-aware. Readable in both modes: slate-700
 * links and slate-800 headings on the light surface, neutral-300 on dark. The gold
 * wordmark uses a darker gradient in light mode (so it stays legible on white) and a
 * brighter one in dark mode. Links deep-link into the app via hash anchors handled in
 * Vedin (#ashtaka / #shadbala / #account).
 */
const linkCls =
  'font-medium text-slate-900 dark:text-neutral-100 hover:text-amber-700 dark:hover:text-amber-400 transition-colors'
const headingCls =
  'mb-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-slate-700 dark:text-neutral-300'

export default function Footer() {
  const { lang } = useLang()
  const t = (en: string, mm: string, ja?: string) => (lang === 'ja' && ja ? ja : lang === 'mm' ? mm : en)
  const year = new Date().getFullYear()

  return (
    <footer className="antialiased border-t border-amber-600 dark:border-amber-500/60 bg-slate-50 dark:bg-[#0a0a0a]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand & tagline */}
          <div>
            <span className="bg-gradient-to-b from-amber-600 to-amber-800 bg-clip-text font-groovy text-2xl font-bold tracking-wide text-transparent dark:from-amber-300 dark:to-amber-500">
              Vedin
            </span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-700 dark:text-neutral-300">
              {t(
                'Timeless Vedic wisdom, decoded for the modern era.',
                'ခေတ်သစ်အတွက် ပြန်လည်ဖော်ထုတ်ထားသော ထာဝရ ဗေဒင်ပညာ။',
                '時を超えたヴェーダの叡智を、現代のために紐解く。',
              )}
            </p>
          </div>

          {/* Quick links — deep-link into the app */}
          <nav aria-label={t('Quick links', 'အမြန်လမ်းညွှန်', 'クイックリンク')}>
            <h4 className={headingCls}>{t('Explore', 'လေ့လာရန်', '探索')}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className={linkCls}>{t('Home', 'ပင်မ', 'ホーム')}</Link></li>
              <li><Link to="/#ashtaka" className={linkCls}>Ashtakavarga</Link></li>
              <li><Link to="/#shadbala" className={linkCls}>Shadbala</Link></li>
              <li><Link to="/#account" className={linkCls}>{t('Dashboard', 'ကိုယ်ပိုင် Dashboard', 'ダッシュボード')}</Link></li>
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label={t('Legal', 'ဥပဒေရေးရာ', '規約')}>
            <h4 className={headingCls}>{t('Legal', 'ဥပဒေရေးရာ', '規約')}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/privacy" className={linkCls}>{t('Privacy Policy', 'ကိုယ်ရေးအချက်အလက် မူဝါဒ', 'プライバシーポリシー')}</Link></li>
              <li><Link to="/terms" className={linkCls}>{t('Terms of Service', 'ဝန်ဆောင်မှု စည်းမျဉ်းများ', '利用規約')}</Link></li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Disclaimer & copyright */}
      <div className="border-t border-slate-200 dark:border-neutral-800">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-neutral-300">
            {t(
              'Disclaimer: Astrological readings are for entertainment and spiritual guidance purposes only and should not replace professional medical, legal, or financial advice.',
              'အသိပေးချက် — ဗေဒင်ဟောစာတမ်းများသည် ဖျော်ဖြေရေးနှင့် စိတ်ဓာတ်ရေးရာ လမ်းညွှန်မှုအတွက်သာ ဖြစ်ပြီး ကျွမ်းကျင်သော ဆေးဘက်ဆိုင်ရာ၊ ဥပဒေရေးရာ (သို့) ငွေကြေးဆိုင်ရာ အကြံဉာဏ်များကို အစားထိုးခြင်း မပြုသင့်ပါ။',
              '免責事項 — 占星術の鑑定は娯楽および精神的な指針を目的としたものであり、専門的な医療・法律・財務上の助言に代わるものではありません。',
            )}
          </p>
          <p className="mt-3 text-sm font-medium text-slate-900 dark:text-neutral-100">
            © {year} Myo Thant Naing. {t('All rights reserved.', 'မူပိုင်ခွင့် အားလုံး လက်ဝယ်ရှိသည်။', '無断転載を禁じます。')}
          </p>
        </div>
      </div>
    </footer>
  )
}
