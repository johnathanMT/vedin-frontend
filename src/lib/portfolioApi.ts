// ESM API client for the React app (the static pages use public/api.js instead).
import { SITE } from '../config/site'
import type { ApiResponse, Article, Paged } from '../types/api'

const BASE_URL = SITE.apiUrl
const VISITOR_KEY = 'mtn_visitor'

// SECURITY: JWT kept in MEMORY only — never localStorage. Not readable by XSS,
// and cleared on refresh / tab close. Set it via api.setToken(...) right after a
// successful login call; it lives only for the current page session.
let _token: string | null = null
const token = (): string | null => _token

// Stable anonymous visitor id (for dedupe of likes/reactions; no login, no PII)
const visitorId = (): string => {
  let v = localStorage.getItem(VISITOR_KEY)
  if (!v) {
    v = crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem(VISITOR_KEY, v)
  }
  return v
}

interface ReqOptions extends RequestInit {
  /** Abort the request after this many ms (default 30s, for Render cold starts). */
  timeout?: number
}

async function req<T = unknown>(path: string, opts: ReqOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'X-Visitor-Id': visitorId(),
    ...(opts.headers as Record<string, string> | undefined),
  }
  const tk = token()
  if (tk) headers.Authorization = `Bearer ${tk}`

  // Abort a hung request (e.g. backend never responds) but allow enough time for
  // Render's free-tier cold start (~30s). Override per-call with opts.timeout.
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), opts.timeout ?? 30000)

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...opts, headers, signal: ctrl.signal })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('The server took too long to respond. Please try again.')
    }
    throw err
  } finally {
    clearTimeout(timer)
  }

  const text = await res.text()
  let json: unknown = null
  if (text) {
    try { json = JSON.parse(text) } catch { /* non-JSON (e.g. 502 HTML) — leave json null */ }
  }
  if (!res.ok) {
    if (res.status === 401) _token = null // drop the dead session token
    const message = (json as { message?: string } | null)?.message
    throw new Error(message || `Request failed (${res.status})`)
  }
  return json as T
}

export interface GetArticlesParams {
  page?: number
  pageSize?: number
  search?: string
}

export const api = {
  BASE_URL,

  // In-memory session controls (call setToken after a successful login).
  setToken: (t: string | null): void => { _token = t },
  clearToken: (): void => { _token = null },
  isLoggedIn: (): boolean => !!_token,

  // The Articles endpoint wraps its page in the ApiResponse envelope → caller reads
  // `r.data.items` (data is the paged payload, null on error).
  getArticles: ({ page = 1, pageSize = 6, search }: GetArticlesParams = {}): Promise<ApiResponse<Paged<Article>>> => {
    const q = new URLSearchParams({ page: String(page), pageSize: String(pageSize), published: 'true' })
    if (search) q.set('search', search)
    return req<ApiResponse<Paged<Article>>>(`/api/Articles?${q.toString()}`)
  },

  getArticle: (id: number | string): Promise<Article> => req<Article>(`/api/Articles/${id}`),

  // NOTE: these interaction endpoints do NOT exist on the backend yet.
  // Add an InteractionsController (+ tables) to make them real; until then the
  // card falls back to optimistic client-side state. All are ANONYMOUS (no auth).
  likeArticle: (id: number | string): Promise<unknown> =>
    req(`/api/Articles/${id}/like`, { method: 'POST' }),

  unlikeArticle: (id: number | string): Promise<unknown> =>
    req(`/api/Articles/${id}/like`, { method: 'DELETE' }),

  // Quick reaction from a fixed server-validated set (e.g. love, clap, fire, idea…)
  reactArticle: (id: number | string, reactionKey: string): Promise<unknown> =>
    req(`/api/Articles/${id}/reactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reaction: reactionKey }),
    }),

  // Wake the free-tier backend (cold start)
  wake: (): Promise<void> => fetch(`${BASE_URL}/`).then(() => undefined).catch(() => undefined),
}
