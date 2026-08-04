import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/query'
import type { ChatMsg } from '../lib/vedin-content'

const POLL_MS = 5000

export const chatKey = (token: string | null) => ['consultation', token] as const

/**
 * Customer <-> Sayar consultation thread.
 *
 * Polling is React Query's `refetchInterval`, which is paused while the document
 * is hidden. The previous hand-rolled interval kept firing in background tabs
 * until a visibilitychange listener tore it down, and every mount started its own
 * copy — two panels on screen meant two polls of the same thread.
 */
export default function useConsultationChat(token: string | null) {
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const qc = useQueryClient()

  const { data: messages = [] } = useQuery({
    queryKey: chatKey(token),
    queryFn: () => api<ChatMsg[]>('/api/customer/messages', { token }),
    enabled: !!token,
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: false,
    // The thread is a live conversation: never serve it from cache without a check.
    staleTime: 0,
    // A poll that fails should leave the visible thread alone, not blank it.
    placeholderData: (prev) => prev,
  })

  const { mutateAsync, isPending: busy } = useMutation({
    mutationFn: (text: string) =>
      api<ChatMsg>('/api/customer/messages', { method: 'POST', token, body: { text } }),
    onSuccess: (msg) => {
      qc.setQueryData<ChatMsg[]>(chatKey(token), (prev) => [...(prev ?? []), msg])
    },
  })

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || !token || busy) return
    try {
      await mutateAsync(text)
      setInput('')
    } catch { /* the thread stays as-is; the user can retry */ }
  }, [input, token, busy, mutateAsync])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }, [messages])

  return { messages, input, setInput, busy, endRef, send }
}
