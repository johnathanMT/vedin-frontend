// ============================================================================
//  research.ts — pre-registered, falsifiable prediction store.
//  A prediction is written BEFORE its window opens, then cryptographically
//  hash-locked so it cannot be silently edited afterwards. Outcomes are scored
//  later and compared against a stated base rate.
//
//  Storage is two-tier:
//   • Signed-in customers → persisted to the backend DB (survives devices/clears).
//   • Anonymous visitors  → localStorage fallback (this browser only).
// ============================================================================

import { SITE } from '../config/site'

export type Valence = 'supportive' | 'demanding' | 'mixed' | 'neutral'
export type Outcome = 'hit' | 'partial' | 'miss'

export interface Prediction {
  id: string
  createdAt: string            // MUST precede windowStart
  windowStart: string          // yyyy-mm-dd
  windowEnd: string
  area: string
  claim: string                // specific + testable
  falsifier: string            // REQUIRED — what would disprove it
  baseRate: number             // 0–1: chance without astrology
  baseRateSource: string
  intensity: 1 | 2 | 3 | 4 | 5
  valence: Valence
  hash: string                 // SHA-256 of the locked fields
  locked: boolean
  outcome?: Outcome
  reviewedAt?: string
  note?: string
}

export interface JournalEntry {
  id: string
  month: string                // yyyy-mm — written WITHOUT looking at predictions
  category: string
  description: string
  magnitude: 1 | 2 | 3
  createdAt: string
}

const PRED_KEY = 'vedin_predictions'
const JOURN_KEY = 'vedin_journal'

function read<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]') as T[] } catch { return [] }
}
function write<T>(key: string, rows: T[]) {
  try { localStorage.setItem(key, JSON.stringify(rows)) } catch { /* quota / private mode */ }
}

export const getPredictions = () => read<Prediction>(PRED_KEY)
export const getJournal = () => read<JournalEntry>(JOURN_KEY)
export const savePredictions = (rows: Prediction[]) => write(PRED_KEY, rows)
export const saveJournal = (rows: JournalEntry[]) => write(JOURN_KEY, rows)

export const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

/** SHA-256 of the immutable fields — proves the claim wasn't changed after locking. */
export async function hashPrediction(p: Pick<Prediction, 'createdAt' | 'windowStart' | 'windowEnd' | 'claim' | 'falsifier' | 'baseRate'>): Promise<string> {
  const payload = `${p.createdAt}|${p.windowStart}|${p.windowEnd}|${p.claim}|${p.falsifier}|${p.baseRate}`
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload))
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return 'hash-unavailable'
  }
}

// ── Server-backed store (signed-in customers) ───────────────────────────────
// Reuses the same customer JWT the Vedin account panel stores.
const CUST_TOKEN = 'mtn_customer_jwt'
export const getCustomerToken = (): string => { try { return localStorage.getItem(CUST_TOKEN) || '' } catch { return '' } }
export const isSignedIn = (): boolean => !!getCustomerToken()

const api = (path: string) => `${SITE.apiUrl}/api/research${path}`
const authHeaders = (json = false): Record<string, string> => {
  const h: Record<string, string> = { Authorization: `Bearer ${getCustomerToken()}` }
  if (json) h['Content-Type'] = 'application/json'
  return h
}

async function unwrap<T>(res: Response): Promise<T> {
  const j = (await res.json().catch(() => null)) as { success?: boolean; data?: T; message?: string } | null
  if (!res.ok || !j?.success) throw new Error(j?.message || `Request failed (${res.status})`)
  return j.data as T
}

/** Load the whole dataset for the signed-in account. */
export async function fetchServerData(): Promise<{ predictions: Prediction[]; journal: JournalEntry[] }> {
  const data = await unwrap<{ predictions: Prediction[]; journal: JournalEntry[] }>(
    await fetch(api('/data'), { headers: authHeaders() }),
  )
  return { predictions: data.predictions ?? [], journal: data.journal ?? [] }
}

/** Persist a pre-registered prediction; returns the stored row (with server id). */
export async function createPredictionServer(p: Omit<Prediction, 'id' | 'locked'>): Promise<Prediction> {
  const body = {
    createdAt: p.createdAt, windowStart: p.windowStart, windowEnd: p.windowEnd,
    area: p.area, claim: p.claim, falsifier: p.falsifier, baseRate: p.baseRate,
    baseRateSource: p.baseRateSource, intensity: p.intensity, valence: p.valence, hash: p.hash,
  }
  return unwrap<Prediction>(await fetch(api('/predictions'), { method: 'POST', headers: authHeaders(true), body: JSON.stringify(body) }))
}

export async function reviewPredictionServer(id: string, outcome: Outcome): Promise<Prediction> {
  return unwrap<Prediction>(await fetch(api(`/predictions/${id}/outcome`), { method: 'PATCH', headers: authHeaders(true), body: JSON.stringify({ outcome }) }))
}

export async function deletePredictionServer(id: string): Promise<void> {
  const res = await fetch(api(`/predictions/${id}`), { method: 'DELETE', headers: authHeaders() })
  if (!res.ok) throw new Error(`Delete failed (${res.status})`)
}

export async function createJournalServer(j: Omit<JournalEntry, 'id' | 'createdAt'>): Promise<JournalEntry> {
  const body = { month: j.month, category: j.category, description: j.description, magnitude: j.magnitude }
  return unwrap<JournalEntry>(await fetch(api('/journal'), { method: 'POST', headers: authHeaders(true), body: JSON.stringify(body) }))
}

export async function deleteJournalServer(id: string): Promise<void> {
  const res = await fetch(api(`/journal/${id}`), { method: 'DELETE', headers: authHeaders() })
  if (!res.ok) throw new Error(`Delete failed (${res.status})`)
}

/** Export the full dataset for independent re-analysis (reproducibility). */
export function exportCsv(preds: Prediction[]): string {
  const head = ['id', 'createdAt', 'windowStart', 'windowEnd', 'area', 'claim', 'falsifier', 'baseRate', 'baseRateSource', 'intensity', 'valence', 'outcome', 'hash']
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const rows = preds.map((p) => [p.id, p.createdAt, p.windowStart, p.windowEnd, p.area, p.claim, p.falsifier, p.baseRate, p.baseRateSource, p.intensity, p.valence, p.outcome ?? '', p.hash].map(esc).join(','))
  return '﻿' + [head.map(esc).join(','), ...rows].join('\r\n')
}
