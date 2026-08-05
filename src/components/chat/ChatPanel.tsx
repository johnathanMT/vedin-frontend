import { forwardRef } from 'react'
import { Sparkles, Lock, Loader2, Send } from 'lucide-react'
import { field } from '../../lib/vedin-content'
import type { Lang } from '../../lib/vedin'
import type { ChatMsg } from '../../lib/vedin-content'

interface Props {
  lang: Lang
  token: string | null
  messages: ChatMsg[]
  input: string
  setInput: (v: string) => void
  busy: boolean
  /** Anchor at the bottom of the thread; the hook scrolls it into view. */
  endRef: React.RefObject<HTMLDivElement | null>
  onSend: () => void
  onOpenAuth: (mode: 'login' | 'signup') => void
}

/** Consultation thread with the Sayar. The outer ref is the scroll target used by
 *  the "get a remedy for this life area" buttons. */
const ChatPanel = forwardRef<HTMLDivElement, Props>(function ChatPanel(
  { lang, token, messages, input, setInput, busy, endRef, onSend, onOpenAuth },
  remedyRef,
) {
  return (
    <div ref={remedyRef} className="no-print glass-card border border-amber-400/25 p-6">
      <h3 className="flex items-center gap-2 font-groovy text-lg text-fg">
        <Sparkles size={16} className="text-amber-500 dark:text-amber-300" />
        {lang === 'ja' ? '対策（ヤントラ）とご相談 — 占星術師とチャット' : lang === 'mm' ? 'ယတြာ အစီအရင်နှင့် အသေးစိတ်မေးမြန်းရန် — ဆရာဘုန်းမင်းသိုက်ဒင်ထံ တိုက်ရိုက် ဆက်သွယ်ရန်' : 'Remedy (Yatra) & Consultation — chat with Saya Phone Myint Thaik Din'}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        {lang === 'ja' ? '占星術師と直接チャットできます。下にご質問や対策のご依頼をご入力ください。' : lang === 'mm' ? 'ဆရာနှင့် တိုက်ရိုက် စကားပြောနိုင်ပါသည်။ သင့် မေးခွန်းများနှင့် ယတြာ တောင်းဆိုမှုများကို အောက်တွင် ရိုက်ထည့်ပါ။' : 'Chat directly with the Sayar. Type your questions and remedy requests below.'}
      </p>

      {!token ? (
        <div className="mt-4 flex flex-col items-start gap-3 rounded-xl border border-accent/30 bg-accent/10 px-5 py-4">
          <p className="text-sm text-accent-light">{lang === 'ja' ? '占星術師とチャットするにはログインしてください。' : lang === 'mm' ? 'ဆရာနှင့် စကားပြောရန် အကောင့်ဝင်ပါ။' : 'Log in to chat with the Sayar.'}</p>
          <button type="button" onClick={() => onOpenAuth('login')}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 shadow-md px-4 py-2 text-sm font-semibold text-amber-50 transition hover:brightness-110">
            <Lock size={15} /> {lang === 'ja' ? 'ログイン' : lang === 'mm' ? 'အကောင့်ဝင်ရန်' : 'Log In'}
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <div className="flex h-80 flex-col gap-2.5 overflow-y-auto rounded-2xl border border-fg/10 bg-fg/[0.03] p-4">
            {messages.length === 0 ? (
              <p className="m-auto max-w-xs text-center text-sm text-muted">{lang === 'ja' ? 'まだメッセージはありません — 下から会話を始めましょう。' : lang === 'mm' ? 'စကားပြောဆိုမှု မရှိသေးပါ — အောက်တွင် စတင်မေးမြန်းပါ။' : 'No messages yet — start the conversation below.'}</p>
            ) : messages.map((m) => {
              const mine = m.senderRole === 'Customer'
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[82%] rounded-2xl border px-3.5 py-2 text-sm leading-relaxed ${mine
                    ? 'rounded-br-md border-amber-300/40 bg-gradient-to-br from-amber-200/30 to-violet-500/25 text-fg'
                    : 'rounded-bl-md border-emerald-400/30 bg-emerald-500/15 text-fg'}`}>
                    {!mine && <div className="mb-0.5 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-300">ဆရာဘုန်းမင်းသိုက်ဒင်</div>}
                    <div className="whitespace-pre-wrap break-words">{m.text}</div>
                    <div className="mt-1 text-right font-mono text-[9px] text-muted">{(m.createdAt || '').slice(5, 16)}</div>
                  </div>
                </div>
              )
            })}
            <div ref={endRef} />
          </div>
          <div className="mt-3 flex items-end gap-2">
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={2}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend() } }}
              placeholder={lang === 'ja' ? 'ご質問をご入力ください…（Enterで送信）' : lang === 'mm' ? 'မေးခွန်း ရိုက်ထည့်ပါ… (Enter = ပို့)' : 'Type your question… (Enter to send)'}
              className={`${field} flex-1 resize-none`} />
            <button type="button" onClick={onSend} disabled={busy || !input.trim()}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-amber-600 shadow-md px-4 py-3 text-sm font-semibold text-amber-50 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} {lang === 'ja' ? '送信' : lang === 'mm' ? 'ပို့မည်' : 'Send'}
            </button>
          </div>
          <p className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-muted">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            {lang === 'ja' ? '自動更新中' : lang === 'mm' ? 'အလိုအလျောက် အသစ်ပြန်ဆွဲနေသည်' : 'Auto-updating live'}
          </p>
        </div>
      )}
    </div>
  )
})

export default ChatPanel
