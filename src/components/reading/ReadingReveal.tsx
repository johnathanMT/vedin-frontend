import { forwardRef, useEffect, useRef, useState } from 'react'
import { FastForward } from 'lucide-react'
import MarkdownView from '../MarkdownView'
import useReadingStream from '../../hooks/useReadingStream'
import type { Lang } from '../../lib/vedin'

interface Props {
  markdown: string
  readingId: number | null
  token: string | null
  lang: Lang
}

const seenKey = (id: number) => `vedinReadingReveal:${id}`

/**
 * Renders the approved reading, typing it in token-by-token the FIRST time it is seen
 * this session (via the SSE stream), then showing it whole on every later view. The
 * forwarded ref wraps the markdown node so the client-side PDF export keeps working; a
 * "Show all" control skips the animation. If streaming can't run (no token) or fails,
 * it silently falls back to the full text the poll already delivered — never a blank.
 */
const ReadingReveal = forwardRef<HTMLDivElement, Props>(function ReadingReveal(
  { markdown, readingId, token, lang }, ref,
) {
  const stream = useReadingStream(readingId, token)
  const [revealed, setRevealed] = useState(() => {
    if (readingId == null) return true
    try { return sessionStorage.getItem(seenKey(readingId)) === '1' } catch { return true }
  })
  const started = useRef(false)

  // Kick off the type-in once, only when it hasn't been seen and we can authenticate.
  useEffect(() => {
    if (revealed || started.current || readingId == null || !token) return
    started.current = true
    void stream.start()
  }, [revealed, readingId, token, stream])

  // When the stream completes, freeze to the full text and remember it for the session.
  useEffect(() => {
    if (!stream.done || revealed) return
    setRevealed(true)
    try { if (readingId != null) sessionStorage.setItem(seenKey(readingId), '1') } catch { /* private mode */ }
  }, [stream.done, revealed, readingId])

  const active = !revealed && !stream.error && (stream.streaming || stream.text.length > 0)
  const body = active ? stream.text : markdown

  const skip = () => {
    stream.finish(markdown)
    setRevealed(true)
    try { if (readingId != null) sessionStorage.setItem(seenKey(readingId), '1') } catch { /* ignore */ }
  }

  return (
    <div>
      <div ref={ref}>
        <MarkdownView markdown={body} />
        {active && <span className="reading-caret" aria-hidden="true">▌</span>}
      </div>
      {active && (
        <button type="button" onClick={skip}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[11px] text-muted transition hover:text-fg no-print">
          <FastForward size={12} /> {lang === 'ja' ? 'すべて表示' : lang === 'mm' ? 'အားလုံး ချက်ချင်း ပြရန်' : 'Show all'}
        </button>
      )}
    </div>
  )
})

export default ReadingReveal
