/**
 * Birth-data draft persistence. The form asks for ~10 fields including a
 * geocoded city; losing all of that to an accidental refresh is the single
 * most expensive failure in the funnel, so every keystroke is mirrored to
 * localStorage and restored on the next visit.
 */
export interface BirthDraft {
  name: string
  gender: 'male' | 'female'
  date: string
  time: string
  timeUnknown: boolean
  lat: string
  lon: string
  tz: string
  ayanamsa: string
  place: string
  placeConfirmed: boolean
  consent: boolean
  step: number
}

const KEY = 'vedin_draft_birth'

export function loadBirthDraft(): Partial<BirthDraft> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Partial<BirthDraft>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}   // private mode, quota, or a draft written by an older schema
  }
}

/** Read one field from the draft with a fallback — for useState lazy initialisers. */
export function draftValue<K extends keyof BirthDraft>(
  draft: Partial<BirthDraft>, key: K, fallback: BirthDraft[K],
): BirthDraft[K] {
  const v = draft[key]
  return v === undefined || v === null ? fallback : (v as BirthDraft[K])
}

export function saveBirthDraft(draft: BirthDraft): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(draft))
  } catch { /* ignore */ }
}

export function clearBirthDraft(): void {
  try {
    localStorage.removeItem(KEY)
  } catch { /* ignore */ }
}
