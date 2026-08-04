import { useCallback, useRef, useState } from 'react'
import { SITE } from '../config/site'

/**
 * Streams an approved reading token-by-token over Server-Sent Events.
 *
 * EventSource can't send an Authorization header, and the reading endpoint is
 * bearer-protected, so we use `fetch` + a ReadableStream reader and parse the SSE
 * frames by hand. Each frame is `data: {"t":"…"}\n\n`; a terminal `event: done`
 * closes the stream. Deltas are accumulated into `text`, which the UI re-renders as
 * markdown as it grows.
 */
export default function useReadingStream(readingId: number | null, token: string | null) {
  const [text, setText] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setStreaming(false)
  }, [])

  /** Abort the stream and jump straight to the full text (the "Skip" affordance). */
  const finish = useCallback((full: string) => {
    stop()
    setText(full)
    setDone(true)
  }, [stop])

  const start = useCallback(async () => {
    if (readingId == null || !token || streaming) return

    const ac = new AbortController()
    abortRef.current = ac
    setText(''); setError(''); setDone(false); setStreaming(true)

    try {
      const res = await fetch(`${SITE.apiUrl}/api/astrology/reading/${readingId}/stream`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' },
        signal: ac.signal,
      })
      if (!res.ok || !res.body) throw new Error(`Stream unavailable (${res.status})`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let acc = ''

      for (;;) {
        const { value, done: readerDone } = await reader.read()
        if (readerDone) break
        buffer += decoder.decode(value, { stream: true })

        // Dispatch every complete SSE frame (terminated by a blank line).
        let sep: number
        while ((sep = buffer.indexOf('\n\n')) !== -1) {
          const frame = buffer.slice(0, sep)
          buffer = buffer.slice(sep + 2)

          let event = 'message'
          const dataLines: string[] = []
          for (const line of frame.split('\n')) {
            if (line.startsWith('event:')) event = line.slice(6).trim()
            else if (line.startsWith('data:')) dataLines.push(line.slice(5).replace(/^ /, ''))
          }
          const data = dataLines.join('\n')

          if (event === 'done') { setDone(true); continue }
          if (event === 'error') throw new Error(data || 'Stream error')
          if (!data) continue

          try {
            const parsed = JSON.parse(data) as { t?: string }
            if (typeof parsed.t === 'string') { acc += parsed.t; setText(acc) }
          } catch { /* a keepalive / partial line — ignore */ }
        }
      }
      setDone(true)
    } catch (err) {
      if ((err as Error).name !== 'AbortError')
        setError(err instanceof Error ? err.message : 'Stream error')
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }, [readingId, token, streaming])

  return { text, streaming, done, error, start, stop, finish }
}
