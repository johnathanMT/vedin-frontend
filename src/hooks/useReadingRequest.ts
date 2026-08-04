import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/query'

export type ReadingStatus = 'none' | 'pending' | 'generating' | 'approved' | 'rejected' | 'failed'

/**
 * The server distinguishes Queued from Processing, but to the querent both mean
 * "the Sayar approved it and it's being written", so they collapse to one state.
 */
function normalise(raw: string): ReadingStatus {
  switch (raw.toLowerCase()) {
    case 'queued':
    case 'processing': return 'generating'
    case 'pending': return 'pending'
    case 'approved': return 'approved'
    case 'rejected': return 'rejected'
    case 'failed': return 'failed'
    default: return 'none'
  }
}

interface StatusData {
  status: string
  requestId: number
  markdown?: string
  alreadyRequested?: boolean
}

export interface ReadingIdentity {
  name?: string
  birthDate: string
  birthTime: string
  location: string
}

const PENDING_POLL_MS = 20_000
// Generation is already under way and typically lands within a minute, so poll
// tightly rather than on the slow waiting-for-a-human cadence.
const GENERATING_POLL_MS = 4_000
const SEEN_KEY = 'vedinApprovedSeen'

/**
 * The Sayar-approval reading workflow: request → pending → generating → approved.
 *
 * The querent is identified by a hash of name+birth details computed server-side,
 * so `identity()` must return exactly what was sent with the original request.
 * `buildPayload` is a thunk rather than a value because the chart it summarises is
 * only available after the compute finishes.
 *
 * The identity is *frozen* into state by `check()` rather than read during render:
 * it is derived from live form fields, so using it directly as a query key would
 * re-key — and re-fetch — on every keystroke.
 */
export default function useReadingRequest(opts: {
  token: string | null
  identity: () => ReadingIdentity | null
  buildPayload: () => Record<string, unknown> | null
}) {
  const [identity, setIdentity] = useState<ReadingIdentity | null>(null)
  const [override, setOverride] = useState<StatusData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [showApprovedModal, setShowApprovedModal] = useState(false)

  const optsRef = useRef(opts)
  optsRef.current = opts

  const { data: polled, refetch } = useQuery({
    queryKey: ['reading-status', identity],
    queryFn: () => api<StatusData>('/api/astrology/reading-status', { method: 'POST', body: identity }),
    enabled: !!identity,
    staleTime: 0,
    placeholderData: (prev) => prev,
    // Polling stops on a terminal status, and pauses entirely in a hidden tab.
    refetchInterval: (query) => {
      const s = query.state.data?.status ? normalise(query.state.data.status) : 'none'
      if (s === 'generating') return GENERATING_POLL_MS
      if (s === 'pending') return PENDING_POLL_MS
      return false
    },
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  })

  // A just-submitted request is authoritative until the next poll returns.
  const current = override ?? polled ?? null
  const status: ReadingStatus = current?.status ? normalise(current.status) : 'none'
  const markdown = current?.markdown || ''
  const requestId = current?.requestId ?? null

  /** Look the request up for the current form identity (called after a chart compute). */
  const check = useCallback(() => {
    const next = optsRef.current.identity()
    setOverride(null)
    setIdentity((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next))
    if (next) refetch()
  }, [refetch])

  const request = useCallback(async () => {
    const payload = optsRef.current.buildPayload()
    if (!payload || loading) return
    setLoading(true); setError(''); setInfo('')
    try {
      const data = await api<StatusData & { message?: string }>('/api/astrology/request-reading', {
        method: 'POST', token: optsRef.current.token, body: payload,
      })
      setOverride(data)
      setIdentity(optsRef.current.identity())
      if (data.alreadyRequested) setInfo(data.message || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the request.')
    } finally { setLoading(false) }
  }, [loading])

  /** Clear local workflow state — used when switching to "calculate for someone else". */
  const reset = useCallback(() => {
    setIdentity(null); setOverride(null); setError(''); setInfo('')
  }, [])

  // Guidance pop-up, once per browser session.
  useEffect(() => {
    if (status !== 'approved') return
    let dismissed = false
    try { dismissed = sessionStorage.getItem(SEEN_KEY) === '1' } catch { /* private mode */ }
    if (!dismissed) setShowApprovedModal(true)
  }, [status])

  const dismissApprovedModal = useCallback(() => {
    setShowApprovedModal(false)
    try { sessionStorage.setItem(SEEN_KEY, '1') } catch { /* ignore */ }
  }, [])

  return {
    status, markdown, requestId, loading, error, info,
    setError, setInfo,
    check, request, reset,
    showApprovedModal, dismissApprovedModal,
  }
}
