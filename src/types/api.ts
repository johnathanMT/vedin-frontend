/**
 * api.ts — frontend mirror of the .NET 8 backend's public contract.
 *
 * These interfaces are derived from the JSON the app actually consumes today.
 * Where a field is inferred rather than observed, it's marked `// verify vs DTO`
 * so you can reconcile it against the matching C# record (PoemDto, MemoryView,
 * CreateMemoryDto, FarewellView, …).
 *
 * IMPORTANT — two response styles coexist on the backend:
 *   1. Envelope style  → `ApiResponse<T>`  (Articles admin, write endpoints).
 *   2. Plain style      → bare objects like `{ poems }`, `{ totalVisits }`,
 *      `{ countries }`. The public read endpoints currently return these
 *      directly (no envelope). Both are typed below so callers stay honest.
 */

// ── Primitives ────────────────────────────────────────────────────────────────

/** DB identity. Server rows are numeric; bundled fallbacks use string ids. */
export type EntityId = number | string

/** A 3D point as the backend serialises it (System.Text.Json → camelCase). */
export interface Vec3 {
  x: number
  y: number
  z: number
}

/** The 3D client works in tuples; helper for the `{x,y,z}` → `[x,y,z]` mapping. */
export type Vec3Tuple = readonly [x: number, y: number, z: number]

// ── Generic envelope (ApiResponse<T>) ─────────────────────────────────────────

/**
 * Mirrors the C# `ApiResponse<T>` envelope. Adjust the property names here if
 * your record differs — System.Text.Json camelCases C# PascalCase by default,
 * so `Success`→`success`, `Data`→`data`, etc.
 */
export interface ApiResponse<T> {
  success: boolean
  data: T | null
  message?: string | null
  errors?: readonly string[] | null
}

/** Generic page wrapper for list endpoints that paginate (e.g. Articles). */
export interface Paged<T> {
  items: readonly T[]
  page: number
  pageSize: number
  total: number
}

// ── Poetry ────────────────────────────────────────────────────────────────────
// GET /api/poetry  →  { poems: Poem[] }   (plain, not enveloped)

/** Mirrors `PoemDto`. `content` is newline-separated and split into lines client-side. */
export interface Poem {
  id: EntityId
  title: string
  subtitle?: string | null
  content: string
  author?: string | null // verify vs DTO
  order?: number          // verify vs DTO (sort/phase position)
  published?: boolean     // verify vs DTO
  createdAt?: string      // ISO-8601; verify vs DTO
  createdDate?: string    // admin list field; verify vs DTO
}

export interface PoetryResponse {
  poems: Poem[]
}

// ── Sanctuary (Memory World) ──────────────────────────────────────────────────
// GET  /api/sanctuary/memories  →  { memories: Memory[] }   // verify wrapper key
// POST /api/sanctuary/memories  ←  CreateMemoryDto

/** Mirrors `MemoryView`. The 3D scene maps `position` to a `Vec3Tuple`. */
export interface Memory {
  id: EntityId
  author: string
  message: string
  /** Landmark key the tag hangs on, e.g. 'tree' | 'ship' | 'village' | 'castle' | 'plaza'. */
  landmark: string
  position?: Vec3 | null
  color?: string | null   // verify vs DTO
  /** Server timestamp; the UI shows it as `date`. */
  createdAt?: string
  /** True when this memory belongs to the requesting operator (drives edit/read rights). */
  mine?: boolean
}

/** Mirrors `CreateMemoryDto` — exactly the body the form POSTs. */
export interface CreateMemoryDto {
  author: string
  message: string
  landmark: string
}

export interface MemoriesResponse {
  memories: Memory[]
}

// ── Visitors ──────────────────────────────────────────────────────────────────
// GET /api/visitors            →  { totalVisits: number }            (plain)
// GET /api/visitors/countries  →  { countries: CountryVisits[] }     (plain)
// NOTE: the VisitorsController does NOT use the ApiResponse envelope.

export interface VisitorStats {
  totalVisits: number
}

/** One row of the per-country breakdown (descending by `visits`). */
export interface CountryVisits {
  country: string
  visits: number
}

export interface CountryBreakdown {
  countries: CountryVisits[]
}

// ── Farewell RSVP (Digital Monument) ──────────────────────────────────────────
// POST /api/farewell/rsvp  ←  CreateFarewellRsvpDto  →  FarewellRsvp

/** Mirrors `CreateFarewellRsvpDto` — exactly the body the RSVP form POSTs. */
export interface CreateFarewellRsvpDto {
  attending: boolean
  name: string
  datesAvailable: string
  foodPreference: string
  message: string
}

/** Mirrors `FarewellView` — the planted-monument record returned on success. */
export interface FarewellRsvp {
  id: EntityId
  name: string
  attending?: boolean      // verify vs DTO
  message?: string | null  // verify vs DTO
  /** Ring-layout coordinate assigned by the backend (PlotForIndex). */
  position: Vec3
  createdAt?: string       // verify vs DTO
}

// ── Articles (blog) ───────────────────────────────────────────────────────────
// GET /api/Articles?page&pageSize&published  →  paged Article list. // verify shape

export interface Article {
  id: EntityId
  title: string
  excerpt?: string | null
  body?: string | null
  tag?: string | null
  author?: string | null
  imageUrl?: string | null
  imageUrls?: string[] | null
  published?: boolean
  publishedDate?: string | null
  createdAt?: string
  likeCount?: number
  /** reactionKey → count (e.g. { love: 3, fire: 1 }). */
  reactions?: Record<string, number> | null
}
