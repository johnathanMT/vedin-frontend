import { useMemo } from 'react'
import { GALLERY } from '../data/galleryData'

/**
 * useGallery — single source of truth for gallery data.
 *
 *  TWO DISTINCT FOLDERS (foolproof photo management — no overlap, no flags):
 *    • src/assets/images/highlights/  → the HOMEPAGE HEXAGON grid.
 *    • src/assets/images/gallery/     → the dedicated /gallery PAGE.
 *
 *  galleryData.js is an OPTIONAL metadata layer matched by filename, adding
 *  i18n caption/alt plus the date / moment fields (used for sorting + grouping).
 */
type I18nText = Record<string, string>
interface GalleryMeta {
  file: string
  caption?: I18nText
  alt?: I18nText
  date?: string
  moment?: string
}
export interface GalleryItem {
  id: string
  file: string
  url: string
  meta: GalleryMeta | null
}
export type GallerySection = [title: string, items: GalleryItem[]]

// Two separate, explicit globs — the ONLY place the folders are referenced.
const HIGHLIGHT_IMAGES = import.meta.glob<string>('../assets/images/highlights/*.{jpg,jpeg,png,webp,avif}', { eager: true, import: 'default', query: '?url' })
const GALLERY_IMAGES   = import.meta.glob<string>('../assets/images/gallery/*.{jpg,jpeg,png,webp,avif}', { eager: true, import: 'default', query: '?url' })

// Optional metadata, keyed by filename for quick lookup (shared by both folders).
const META: Record<string, GalleryMeta> = Object.fromEntries((GALLERY as GalleryMeta[]).map((g) => [g.file, g]))

// Turn a filename into a clean label: 'new-photo_02.jpg' → 'New Photo 02'.
const labelFromFile = (file: string): string =>
  file.replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())

// Parse a strict 'YYYY-MM-DD' string into a local Date (no timezone drift).
const parseDate = (s: string | undefined): Date | null => {
  if (typeof s !== 'string') return null
  const [y, m, d] = s.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}
const timeOf = (it: GalleryItem): number => {
  const d = parseDate(it.meta?.date)
  return d ? d.getTime() : -Infinity // undated → sorts to the end
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

const sectionLabel = (it: GalleryItem): string => {
  const d = parseDate(it.meta?.date)
  const moment = it.meta?.moment || 'Moments'
  return d ? `${MONTHS[d.getMonth()]} ${d.getFullYear()} — ${moment}` : `Undated — ${moment}`
}

// Build a sorted item list (newest-first by date, filename as tiebreaker).
const buildItems = (images: Record<string, string>): GalleryItem[] =>
  Object.entries(images)
    .map(([path, url]): GalleryItem => {
      const file = path.split('/').pop() ?? path
      return { id: file, file, url, meta: META[file] || null }
    })
    .sort((a, b) => (timeOf(b) - timeOf(a)) || a.file.localeCompare(b.file))

// HIGHLIGHTS: everything in the highlights/ folder (the folder is the curation).
const HIGHLIGHTS = buildItems(HIGHLIGHT_IMAGES)

// FULL GALLERY ITEMS + SECTIONS (grouped, newest-first via insertion order).
const GALLERY_ITEMS = buildItems(GALLERY_IMAGES)
const SECTIONS: GallerySection[] = (() => {
  const map = new Map<string, GalleryItem[]>()
  for (const it of GALLERY_ITEMS) {
    const key = sectionLabel(it)
    let arr = map.get(key)
    if (!arr) { arr = []; map.set(key, arr) }
    arr.push(it)
  }
  return [...map.entries()]
})()

export function useGallery(lang = 'en') {
  const pick = (obj: I18nText | undefined) => (obj && (obj[lang] || obj.en)) || ''
  const captionOf = (it: GalleryItem): string => (it.meta && pick(it.meta.caption)) || labelFromFile(it.file)
  const altOf = (it: GalleryItem): string => (it.meta && pick(it.meta.alt)) || captionOf(it)

  const highlights = useMemo(() => HIGHLIGHTS, [])
  const sections = useMemo(() => SECTIONS, [])

  return { highlights, sections, captionOf, altOf }
}
