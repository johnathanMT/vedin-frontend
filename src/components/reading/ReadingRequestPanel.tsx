import { forwardRef } from 'react'
import { Lock, UserPlus, ScrollText, Sparkles, Loader2, Clock, CheckCircle2, Download, AlertTriangle } from 'lucide-react'
import { Appear } from '../motion/Reveal'
import ReadingReveal from './ReadingReveal'
import type { Lang } from '../../lib/vedin'
import type { ReadingStatus } from '../../hooks/useReadingRequest'

interface Props {
  lang: Lang
  token: string | null
  status: ReadingStatus
  markdown: string
  /** The approved reading's id — powers the grounded follow-up chat + streamed reveal. */
  requestId: number | null
  loading: boolean
  error: string
  info: string
  /** True when the signed-in user is viewing their own profile-derived chart. */
  showDashboard: boolean
  onRequest: () => void
  onOpenAuth: (mode: 'login' | 'signup') => void
  onDownloadPdf: () => void
  /** The report is fetched from the server, so the button needs a pending state. */
  pdfBusy?: boolean
}

// Theme-aware surface via the --card token (white in light mode, near-black in dark),
// with a soft drop shadow for premium depth in light mode and a faint top highlight.
const CARD_BG = 'rgb(var(--card))'
const CARD_GLOW = '0 1px 3px rgb(0 0 0 / 0.06), inset 0 1px 0 rgb(255 255 255 / 0.04)'

/**
 * The "Detailed Reading" tab: auth gate → request card → pending → approved
 * reading + PDF. The ref is forwarded onto the rendered markdown, because the
 * client-side PDF export reads that node's innerHTML.
 */
const ReadingRequestPanel = forwardRef<HTMLDivElement, Props>(function ReadingRequestPanel(
  { lang, token, status, markdown, requestId, loading, error, info, showDashboard, onRequest, onOpenAuth, onDownloadPdf, pdfBusy = false },
  readingRef,
) {
  const idle = status === 'none' || status === 'rejected'

  return (
    <div className="space-y-5">
      {/* Auth gate — a reading can only be requested by a signed-in account */}
      {!token && idle && (
        <Appear className="relative overflow-hidden rounded-2xl border border-accent/35 p-6 sm:p-8 no-print text-center"
          style={{ background: CARD_BG, boxShadow: CARD_GLOW }}>
          <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full opacity-25 blur-3xl" style={{ background: 'radial-gradient(circle, rgb(var(--accent)) 0%, transparent 70%)' }} />
          <div className="relative flex flex-col items-center gap-3">
            <span className="grid h-14 w-14 place-items-center rounded-full border border-accent/40 bg-accent/15 text-accent-light"><Lock size={24} /></span>
            <h3 className="font-groovy text-xl text-fg">{lang === 'ja' ? 'アカウントが必要です' : lang === 'mm' ? 'အကောင့် ဖွင့်ထားရန် လိုအပ်ပါသည်' : 'An account is required'}</h3>
            <p className="max-w-xl text-sm leading-relaxed text-muted">{lang === 'ja' ? '鑑定全文の取得とチャートの保存には、アカウントが必要です。' : lang === 'mm' ? 'ဟောစာတမ်းအပြည့်အစုံကို ရယူရန်နှင့် သင့်ဇာတာများ မှတ်သားထားရန် အကောင့် (Account) ဖွင့်ထားရန် လိုအပ်ပါသည်။' : 'To get the full reading and to save your charts, you need to have an account.'}</p>
            <button type="button" onClick={() => onOpenAuth('signup')}
              className="mt-1 inline-flex items-center gap-2 rounded-xl bg-amber-600 shadow-md px-5 py-3 text-sm font-semibold text-amber-50 transition hover:brightness-110">
              <UserPlus size={16} /> {lang === 'ja' ? '新規登録 / ログイン' : lang === 'mm' ? 'အကောင့်ဖွင့် / ဝင်ရန်' : 'Sign Up / Log In'}
            </button>
          </div>
        </Appear>
      )}

      {/* Request card — signed-in, no active/approved request */}
      {token && idle && (
        <div className="relative overflow-hidden rounded-2xl border border-accent/30 p-6 no-print"
          style={{ background: CARD_BG, boxShadow: CARD_GLOW }}>
          <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, rgb(var(--accent)) 0%, transparent 70%)' }} />
          <div className="relative">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-accent-light"><ScrollText size={15} /> {lang === 'ja' ? '詳細な鑑定' : lang === 'mm' ? 'အသေးစိတ် ဟောစာတမ်း' : 'Detailed Reading'}</p>
            <h3 className="mt-2 font-groovy text-xl text-fg">{lang === 'ja' ? '占星術師が直接確認する鑑定' : lang === 'mm' ? 'သင့်ဇာတာအတွက် ဆရာ ကိုယ်တိုင် စစ်ဆေးသော ဟောစာတမ်း' : 'A reading personally reviewed by the Sayar'}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{lang === 'ja' ? 'あなたのチャートは古典的なインド占星術の計算式で正確に算出され、確認・承認を経たうえで、人生七領域の鑑定全文が作成されます。' : lang === 'mm' ? 'သင့်ဇာတာအား ဂန္ထဝင် ဇျောတိသ သင်္ချာနည်းစနစ်များဖြင့် တိကျစွာ တွက်ချက်ပြီးနောက်၊ ဘဝကဏ္ဍ ၇ ရပ် အပြည့်အစုံ ဟောစာတမ်းအပြည့်အစုံကို ရေးသားပေးပါမည်။' : 'Your chart is computed precisely with classical Vedic astrology formulas, verified and approved to get full details before your full 7-life-area reading is written.'}</p>
            <button type="button" onClick={onRequest} disabled={loading}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-600 shadow-md px-5 py-3 text-sm font-semibold text-amber-50 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading
                ? (lang === 'ja' ? '送信中…' : lang === 'mm' ? 'ပေးပို့နေသည်…' : 'Sending…')
                : showDashboard
                  ? (lang === 'ja' ? '自分のプロフィールで鑑定をリクエスト' : lang === 'mm' ? 'ကျွန်ုပ်၏ ပရိုဖိုင်ဖြင့် ဟောစာတမ်း တောင်းဆိုရန်' : 'Request Reading based on my profile')
                  : (lang === 'ja' ? '占星術師に鑑定全文をリクエスト' : lang === 'mm' ? 'ဆရာ ကိုဘုန်းမင်းသိုက်ဒင်ထံမှ ဟောစာတမ်းအပြည့်အစုံ တောင်းဆိုရန်' : 'Request Full Reading from the Sayar')}
            </button>
            <p className="mt-2 font-mono text-[11px] text-muted">{lang === 'ja' ? 'リクエストは月に1回までです。' : lang === 'mm' ? 'တစ်လလျှင် တစ်ကြိမ် တောင်းဆိုနိုင်ပါသည်။' : 'One request per month.'}</p>
          </div>
        </div>
      )}

      {error && <div className="rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral no-print">{error}</div>}
      {info && <div className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent-light no-print">{info}</div>}

      {/* Pending — awaiting the Sayar's approval */}
      {status === 'pending' && (
        <div className="relative overflow-hidden rounded-2xl border border-accent/30 p-6 sm:p-8 no-print"
          style={{ background: CARD_BG, boxShadow: CARD_GLOW }}>
          <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full opacity-25 blur-3xl" style={{ background: 'radial-gradient(circle, rgb(var(--accent)) 0%, transparent 70%)' }} />
          <div className="relative flex flex-col items-center gap-3 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full border border-accent/40 bg-accent/15 text-accent-light">
              <Clock size={26} className="animate-pulse" />
            </span>
            <h3 className="font-groovy text-xl text-fg">{lang === 'ja' ? '占星術師の確認をお待ちください' : lang === 'mm' ? 'ဆရာမှ စစ်ဆေးနေပါသည်' : 'Awaiting the Sayar’s review'}</h3>
            <p className="max-w-xl text-sm leading-relaxed text-muted">{lang === 'ja' ? '占星術師があなたのチャートを直接確認しています。承認されると、鑑定全文がここに自動的に表示されます。' : lang === 'mm' ? 'ဆရာမှ သင့်ဇာတာအား အသေးစိတ် စစ်ဆေးနေပါသည်။ အတည်ပြုပြီးပါက ဟောစာတမ်းအပြည့်အစုံသည် ဤနေရာတွင် အလိုအလျောက် ပေါ်လာပါမည်။' : 'The Sayar is personally reviewing your chart. Your full reading will appear here automatically once it is approved.'}</p>
            <span className="mt-1 rounded-full bg-accent/15 px-3 py-1 font-mono text-[11px] text-accent-light">{lang === 'ja' ? 'ステータス — 確認待ち' : lang === 'mm' ? 'အခြေအနေ — စစ်ဆေးဆဲ' : 'Status — Pending'}</span>
          </div>
        </div>
      )}

      {/* Approved by the Sayar, now being written by the background worker. */}
      {status === 'generating' && (
        <div className="relative overflow-hidden rounded-2xl border border-jade/35 p-6 sm:p-8 no-print"
          style={{ background: CARD_BG, boxShadow: CARD_GLOW }}>
          <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full opacity-25 blur-3xl" style={{ background: 'radial-gradient(circle, rgb(var(--jade)) 0%, transparent 70%)' }} />
          <div className="relative flex flex-col items-center gap-3 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full border border-jade/40 bg-jade/15 text-jade-light">
              <Loader2 size={26} className="animate-spin" />
            </span>
            <h3 className="font-groovy text-xl text-fg">
              {lang === 'ja' ? '鑑定を作成しています' : lang === 'mm' ? 'ဟောစာတမ်း ရေးသားနေပါသည်' : 'Writing your reading'}
            </h3>
            <p className="max-w-xl text-sm leading-relaxed text-muted">{lang === 'ja' ? '占星術師が承認し、鑑定を準備しています。1〜2分以内にここに自動的に表示されます。' : lang === 'mm' ? 'ဆရာမှ အတည်ပြုပြီးဖြစ်၍ ဟောစာတမ်းကို ပြင်ဆင်နေပါသည်။ မိနစ်အနည်းငယ်အတွင်း ဤနေရာတွင် အလိုအလျောက် ပေါ်လာပါမည်။' : 'The Sayar has approved it and your reading is being prepared. It will appear here automatically within a minute or two.'}</p>
            <span className="mt-1 rounded-full bg-jade/15 px-3 py-1 font-mono text-[11px] text-jade-light">
              {lang === 'ja' ? 'ステータス — 作成中' : lang === 'mm' ? 'အခြေအနေ — ရေးသားဆဲ' : 'Status — Generating'}
            </span>
          </div>
        </div>
      )}

      {/* Generation exhausted its retries — the Sayar can re-approve. */}
      {status === 'failed' && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-coral/40 bg-coral/5 px-4 py-3.5 text-sm leading-relaxed text-muted no-print">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-coral" />
          {lang === 'ja' ? '鑑定の作成中に問題が発生しました。占星術師に通知され、再試行されます。' : lang === 'mm' ? 'ဟောစာတမ်း ရေးသားရာတွင် အခက်အခဲ ဖြစ်ပွားခဲ့ပါသည်။ ဆရာထံ အကြောင်းကြားပြီးဖြစ်၍ ပြန်လည် ကြိုးစားပေးပါမည်။' : 'Something went wrong while generating your reading. The Sayar has been notified and will retry it.'}
        </div>
      )}

      {/* Approved — success banner */}
      {status === 'approved' && (
        <div className="no-print">
          <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400/60 p-4 text-center sm:p-5"
            style={{ background: 'rgb(var(--card))', boxShadow: '0 1px 3px rgb(0 0 0 / 0.06), inset 0 1px 0 rgb(255 255 255 / 0.04)' }}>
            <p className="flex flex-wrap items-center justify-center gap-2 font-groovy text-lg text-fg sm:text-xl">
              <CheckCircle2 size={22} className="text-emerald-500" />
              {lang === 'ja' ? '占星術師があなたの鑑定を承認しました。' : lang === 'mm' ? 'ဆရာမှ သင့်ဟောစာတမ်းကို အတည်ပြုပြီးပါပြီ။' : 'The Sayar has approved your reading.'}
            </p>
          </div>
        </div>
      )}

      {/* Approved but the markdown hasn't arrived yet — the poll will fill it in. */}
      {status === 'approved' && !markdown && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-muted no-print">
          <Loader2 size={15} className="animate-spin" />
          {lang === 'ja' ? '鑑定を読み込み中…' : lang === 'mm' ? 'ဟောစာတမ်းကို ခေါ်ယူနေပါသည်…' : 'Loading your reading…'}
        </div>
      )}

      {/* Approved — the finished reading (printable) */}
      {status === 'approved' && markdown && (
        <div className="relative overflow-hidden rounded-2xl border border-accent/35 p-6 sm:p-8"
          style={{ background: 'rgb(var(--card))', boxShadow: '0 1px 3px rgb(0 0 0 / 0.06), inset 0 1px 0 rgb(255 255 255 / 0.05)' }}>
          <div className="pointer-events-none absolute -left-16 -bottom-20 h-56 w-56 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, rgb(var(--jade)) 0%, transparent 70%)' }} />
          <div className="relative">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-accent-light"><ScrollText size={14} /> {lang === 'ja' ? '詳細な鑑定' : lang === 'mm' ? 'အသေးစိတ် ဟောစာတမ်း' : 'Detailed Reading'}</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-jade/15 px-2.5 py-0.5 font-mono text-[10px] text-jade no-print"><CheckCircle2 size={11} /> {lang === 'ja' ? '占星術師が承認済み' : lang === 'mm' ? 'ဆရာ အတည်ပြုပြီး' : 'Approved by the Sayar'}</span>
            </div>
            <ReadingReveal ref={readingRef} markdown={markdown} readingId={requestId} token={token} lang={lang} />
            <p className="mt-5 border-t border-white/10 pt-3 text-[11px] leading-relaxed text-muted">{lang === 'ja' ? 'この鑑定は古典的なインド占星術の計算式に基づいて作成されています。解釈は自己省察のための指針としてご活用ください。' : lang === 'mm' ? 'ဤဟောစာတမ်းအား ဂန္ထဝင် ဇျောတိသ သင်္ချာနည်းစနစ်များဖြင့် တိကျစွာ တွက်ချက်ထားပါသည်။သို့သော်လည်း ရလဒ်များမှာ မိမိကိုယ်တိုင် ပြန်လည်ဆင်ခြင်သုံးသပ်ရန်အတွက် လမ်းညွှန်ချက်များသာဖြစ်ပါသည်။' : 'This reading was computed with classical Vedic astrology formulas and personally according to system.But The interpretations are guidance for self-reflection.'}</p>

            {/* Direct client-side PDF download (logged-in users only) */}
            <div className="mt-5 no-print">
              {token ? (
                <button type="button" onClick={onDownloadPdf} disabled={pdfBusy}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-600 shadow-md px-5 py-3 text-sm font-semibold text-amber-50 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
                  {pdfBusy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  {lang === 'ja' ? '鑑定全文PDFをダウンロード' : lang === 'mm' ? 'မွေးဇာတာ ဟောစာတမ်း PDF အပြည့်အစုံ Download ဆွဲရန်' : 'Download Full Reading PDF'}
                </button>
              ) : (
                <div className="flex flex-col items-start gap-2">
                  <p className="text-[13px] leading-relaxed text-muted">{lang === 'ja' ? 'PDFをダウンロードするにはログインしてください。' : lang === 'mm' ? 'PDF ဒေါင်းလုဒ်ရယူရန် အကောင့်ဝင်ရန် လိုအပ်ပါသည်။' : 'Log in to download the PDF.'}</p>
                  <button type="button" onClick={() => onOpenAuth('login')}
                    className="inline-flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent-light transition hover:bg-accent/20">
                    <Lock size={15} /> {lang === 'ja' ? 'ログイン' : lang === 'mm' ? 'အကောင့်ဝင်ရန်' : 'Log In'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

export default ReadingRequestPanel
