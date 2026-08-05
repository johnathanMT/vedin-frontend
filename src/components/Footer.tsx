import { Link } from 'react-router-dom'
import useLang from '../hooks/useLang'

/**
 * Footer — a grounded, premium sitewide footer for the Vedin app. Fully theme-aware
 * (crisp slate-50 in light, deep charcoal in dark) with an elegant gold hairline on
 * top, a three-column brand/links/legal grid that stacks on mobile, and a
 * disclaimer + copyright band. Rendered once in VedinShell so it appears beneath
 * every main page.
 */
const linkCls =
  'text-slate-600 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors'
const headingCls =
  'mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-neutral-500'

export default function Footer() {
  const { lang } = useLang()
  const t = (en: string, mm: string) => (lang === 'mm' ? mm : en)
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-amber-600/20 dark:border-amber-500/20 bg-slate-50 dark:bg-[#0a0a0a]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand & tagline */}
          <div>
            <span className="bg-gradient-to-b from-amber-300 to-amber-600 bg-clip-text font-groovy text-2xl font-bold tracking-wide text-transparent">
              Vedin
            </span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-neutral-500">
              {t(
                'Timeless Vedic wisdom, decoded for the modern era.',
                'ခေတ်သစ်အတွက် ပြန်လည်ဖော်ထုတ်ထားသော ထာဝရ ဗေဒင်ပညာ။',
              )}
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label={t('Quick links', 'အမြန်လမ်းညွှန်')}>
            <h4 className={headingCls}>{t('Explore', 'လေ့လာရန်')}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className={linkCls}>{t('Home', 'ပင်မ')}</Link></li>
              <li><Link to="/" className={linkCls}>Ashtakavarga</Link></li>
              <li><Link to="/" className={linkCls}>Shadbala</Link></li>
              <li><Link to="/" className={linkCls}>{t('Dashboard', 'ကိုယ်ပိုင် Dashboard')}</Link></li>
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label={t('Legal', 'ဥပဒေရေးရာ')}>
            <h4 className={headingCls}>{t('Legal', 'ဥပဒေရေးရာ')}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/privacy" className={linkCls}>{t('Privacy Policy', 'ကိုယ်ရေးအချက်အလက် မူဝါဒ')}</Link></li>
              <li><Link to="/terms" className={linkCls}>{t('Terms of Service', 'ဝန်ဆောင်မှု စည်းမျဉ်းများ')}</Link></li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Disclaimer & copyright */}
      <div className="border-t border-slate-200 dark:border-neutral-800">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <p className="text-xs leading-relaxed text-slate-500 dark:text-neutral-500">
            {t(
              'Disclaimer: Astrological readings are for entertainment and spiritual guidance purposes only and should not replace professional medical, legal, or financial advice.',
              'အသိပေးချက် — ဗေဒင်ဟောစာတမ်းများသည် ဖျော်ဖြေရေးနှင့် စိတ်ဓာတ်ရေးရာ လမ်းညွှန်မှုအတွက်သာ ဖြစ်ပြီး ကျွမ်းကျင်သော ဆေးဘက်ဆိုင်ရာ၊ ဥပဒေရေးရာ (သို့) ငွေကြေးဆိုင်ရာ အကြံဉာဏ်များကို အစားထိုးခြင်း မပြုသင့်ပါ။',
            )}
          </p>
          <p className="mt-3 text-xs text-slate-500 dark:text-neutral-500">
            © {year} Myo Thant Naing. {t('All rights reserved.', 'မူပိုင်ခွင့် အားလုံး လက်ဝယ်ရှိသည်။')}
          </p>
        </div>
      </div>
    </footer>
  )
}
