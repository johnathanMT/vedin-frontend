import { useCallback, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '../lib/query'

export interface ChatTurn {
  role: 'user' | 'ai'
  text: string
  /** Marks an answer that failed, so the UI can tint it as an error rather than advice. */
  failed?: boolean
}

/**
 * Grounded follow-up chat for ONE finished reading.
 *
 * The server answer is stateless — every call re-grounds on the same chart facts +
 * reading — so the conversation history lives here in component state rather than on
 * the server. useMutation gives us the in-flight state (`busy`) and error plumbing for
 * free; we append the question optimistically and the answer on success.
 */
export default function useReadingChat(readingId: number | null, token: string | null) {
  const [turns, setTurns] = useState<ChatTurn[]>([])

  const { mutateAsync, isPending: busy } = useMutation({
    mutationFn: (question: string) =>
      api<{ answer: string }>(`/api/astrology/reading/${readingId}/ask`, {
        method: 'POST', token, body: { question },
      }),
  })

  const ask = useCallback(async (raw: string) => {
    const question = raw.trim()
    if (!question || readingId == null || !token || busy) return

    setTurns((t) => [...t, { role: 'user', text: question }])
    try {
      const { answer } = await mutateAsync(question)
      setTurns((t) => [...t, { role: 'ai', text: answer }])
    } catch (err) {
      setTurns((t) => [...t, {
        role: 'ai',
        text: err instanceof Error ? err.message : 'Could not answer just now. Please try again.',
        failed: true,
      }])
    }
  }, [readingId, token, busy, mutateAsync])

  const clear = useCallback(() => setTurns([]), [])

  return { turns, ask, busy, clear }
}
