import { QueryClient } from '@tanstack/react-query'
import { SITE } from '../config/site'

/**
 * Shared query client.
 *
 * Defaults are tuned for a chart app rather than a dashboard: a computed natal
 * chart is a pure function of birth data and never changes, so cached data is
 * treated as fresh for a long time and refetch-on-focus is off — remounting a tab
 * should not re-hit the API. The chat thread opts back into polling explicitly.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      gcTime: 30 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // A 401/403/404 will not fix itself; only transient failures are worth retrying.
        const status = (error as ApiError)?.status
        if (status !== undefined && status < 500) return false
        return failureCount < 2
      },
    },
  },
})

/** An API failure that carries the HTTP status, so retry/UI can branch on it. */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** The envelope every endpoint in this API returns. */
interface Envelope<T> {
  success?: boolean
  message?: string
  data?: T
}

export interface ApiOptions extends Omit<RequestInit, 'body'> {
  token?: string | null
  body?: unknown
}

/**
 * One place that knows the base URL, the bearer header, the JSON envelope and how
 * a failure becomes an Error — instead of that being re-derived at each of the
 * ~30 call sites, each with its own slightly different error handling.
 */
export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token, body, headers, ...rest } = options

  const res = await fetch(`${SITE.apiUrl}${path}`, {
    ...rest,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })

  const json = (await res.json().catch(() => null)) as Envelope<T> | null

  if (!res.ok || json?.success === false)
    throw new ApiError(res.status, json?.message || `Request failed (${res.status})`)

  return (json?.data ?? json) as T
}
