import { useEffect, useRef, useState } from 'react'
import { m } from 'framer-motion'
import { MessageCircleQuestion, Send, Sparkles, AlertTriangle } from 'lucide-react'
import MarkdownView from '../MarkdownView'
import useReadingChat from '../../hooks/useReadingChat'
import type { Lang } from '../../lib/vedin'

interface Props {
  readingId: number | null
  token: string | null
  lang: Lang
}

const STARTERS: Record<Lang, string[]> = {
  mm: [
    'လက်ရှိ ဒသာ ကာလက ဘာကို ဆိုလိုတာလဲ?',
    'ကျွန်ုပ်၏ အလုပ်အကိုင် အလားအလာ ဘယ်လိုရှိလဲ?',
    'အိမ်ထောင်ရေးနှင့် အချစ်ရေး အကြောင်း ပြောပြပါ',
  ],
  en: [
    'What does my current dasha period mean?',
    'How is my career outlook?',
    'What does the chart say about marriage?',
  ],
}

/**
 * A grounded Q&A box under the finished reading: the answers come from the server,
 * strictly grounded in this querent's own chart + reading. Matches the reading card's
 * glass/gold language; the history lives in the hook for this session.
 */
export default function ReadingChatBox({ readingId, token, lang }: Props) {
  const { turns, ask, busy } = useReadingChat(readingId, token)
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [turns, busy])

  if (!token || readingId == null) return null

  const send = () => {
    const q = input.trim()
    if (!q || busy) return
    void ask(q)
    setInput('')
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-accent/25 no-print"
      style={{ background: 'linear-gradient(160deg, rgb(var(--surface)) 0%, rgb(var(--card)) 100%)' }}>
      {/* header */}
      <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-3.5">
        <span className="grid h-9 w-9 place-items-center rounded-full border border-accent/40 bg-accent/15 text-accent-light">
          <MessageCircleQuestion size={18} />
        </span>
        <div>
          <h4 className="font-groovy text-base text-fg">{lang === 'mm' ? 'ဟောစာတမ်းအကြောင်း မေးမြန်းရန်' : 'Ask about your reading'}</h4>
          <p className="font-mono text-[11px] text-muted">{lang === 'mm' ? 'သင့်ဇာတာအပေါ် အခြေခံ၍သာ ဖြေကြားပါမည်' : 'Answered only from your own chart & reading'}</p>
        </div>
      </div>

      {/* history */}
      <div className="max-h-[26rem] space-y-3 overflow-y-auto px-5 py-4">
        {turns.length === 0 && (
          <div className="space-y-3">
            <p className="text-[13px] leading-relaxed text-muted">{lang === 'mm'
              ? 'သင့်ဟောစာတမ်းနှင့် ပတ်သက်၍ လွတ်လပ်စွာ မေးမြန်းနိုင်ပါသည်။ ဥပမာ —'
              : 'Ask anything about your reading. For example —'}</p>
            <div className="flex flex-wrap gap-2">
              {STARTERS[lang].map((s) => (
                <button key={s} type="button" onClick={() => { setInput(''); void ask(s) }} disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/5 px-3 py-1.5 text-left text-[12.5px] text-accent-light transition hover:bg-accent/15 disabled:opacity-50">
                  <Sparkles size={12} /> {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {turns.map((turn, i) => (
          <m.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
            className={turn.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            {turn.role === 'user' ? (
              <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-gradient-to-r from-accent to-violet-500 px-3.5 py-2 text-[13.5px] text-space">
                {turn.text}
              </p>
            ) : (
              <div className={`max-w-[88%] rounded-2xl rounded-bl-sm border px-3.5 py-2.5 text-[13.5px] ${turn.failed
                ? 'border-coral/40 bg-coral/10 text-coral'
                : 'border-white/10 bg-white/[0.04] text-fg/90'}`}>
                {turn.failed
                  ? <span className="flex items-center gap-1.5"><AlertTriangle size={14} /> {turn.text}</span>
                  : <div className="reading-chat-answer"><MarkdownView markdown={turn.text} /></div>}
              </div>
            )}
          </m.div>
        ))}

        {busy && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.04] px-4 py-3">
              {[0, 1, 2].map((i) => (
                <m.span key={i} className="h-1.5 w-1.5 rounded-full bg-accent-light"
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* input */}
      <div className="flex items-end gap-2 border-t border-white/10 px-4 py-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          rows={1}
          placeholder={lang === 'mm' ? 'သင့်မေးခွန်းကို ရိုက်ထည့်ပါ…' : 'Type your question…'}
          className="max-h-28 min-h-[42px] flex-1 resize-none rounded-xl border border-white/12 bg-white/[0.03] px-3.5 py-2.5 text-sm text-fg placeholder:text-muted focus:border-accent/50 focus:outline-none"
        />
        <button type="button" onClick={send} disabled={busy || !input.trim()}
          className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl bg-gradient-to-r from-accent to-violet-500 text-space transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
          <Send size={17} />
        </button>
      </div>
    </div>
  )
}
