import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/query'
import type { BirthChartData, BirthChartRequest } from '../types/astrology'

export const chartKey = (req: BirthChartRequest) =>
  ['chart', req.year, req.month, req.day, req.hour, req.minute,
    req.timeZone, req.latitude, req.longitude, req.ayanamsa] as const

export interface SaveChartPayload {
  name: string
  gender: string
  birthDate: string
  birthTime: string
  timeZone: string
  latitude: number
  longitude: number
  nayNan: number
  consent: true
}

/**
 * Chart computation, cached by birth data.
 *
 * The chart is a pure function of the birth moment and place, so `fetchQuery`
 * means recomputing the same chart — switching back from "someone else", or
 * reloading a saved chart — resolves from cache without another round trip to the
 * ephemeris. The compute itself stays imperative because it is triggered by form
 * submission, not by render.
 */
export default function useChart() {
  const qc = useQueryClient()
  const [data, setData] = useState<BirthChartData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const compute = useCallback(async (req: BirthChartRequest): Promise<BirthChartData | null> => {
    setError('')
    setLoading(true)
    setData(null)
    try {
      const chart = await qc.fetchQuery({
        queryKey: chartKey(req),
        queryFn: () => api<BirthChartData>('/api/astrology/chart', { method: 'POST', body: req }),
        staleTime: Infinity,   // the sky at a given instant does not change
      })
      setData(chart)
      return chart
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not compute the chart.')
      return null
    } finally {
      setLoading(false)
    }
  }, [qc])

  /**
   * Archive the chart. Fire-and-forget by design: a failed archive must never
   * block or fail the reading the querent is waiting for.
   */
  const archive = useCallback((payload: SaveChartPayload, token: string | null) => {
    api('/api/astrology/save-chart', { method: 'POST', body: payload }).catch(() => { })
    if (token) api('/api/customer/save-chart', { method: 'POST', token, body: payload }).catch(() => { })
  }, [])

  return { data, setData, loading, error, setError, compute, archive }
}
