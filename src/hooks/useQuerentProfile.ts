import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/query'
import type { Profile } from '../lib/vedin-content'

export const profileKey = (token: string | null) => ['querent-profile', token] as const

/**
 * The signed-in querent's saved natal profile.
 *
 * Cached per token, so the several places that need it (dashboard gate, chart
 * autocompute, account panel) share one request instead of each firing their own
 * on mount. `refresh` invalidates rather than refetching by hand, so a profile
 * edit updates every consumer at once.
 */
export default function useQuerentProfile(token: string | null) {
  const qc = useQueryClient()

  const { data = null, isLoading } = useQuery({
    queryKey: profileKey(token),
    queryFn: () => api<Profile>('/api/customer/me', { token }),
    enabled: !!token,
  })

  const refresh = useCallback(
    () => qc.invalidateQueries({ queryKey: profileKey(token) }),
    [qc, token],
  )

  return { profile: data, loading: isLoading, refresh }
}
