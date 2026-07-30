// ============================================================================
//  assets.ts — ONE registry for every image in the app.
//
//  THREE kinds of asset, and when to use each:
//
//  1) BUNDLED  (src/assets/images/*) — `import` the file. Vite fingerprints it
//     (profile.<hash>.jpg) and rewrites the URL with the correct base
//     automatically, so it resolves on ANY domain (/, /Myweb/, custom) with
//     zero path math. ← preferred for app images. Best caching + no 404s.
//     (TS types these imports as `string` via the `vite/client` ambient types.)
//
//  2) PUBLIC   (public/**) — referenced by build-relative path via publicAsset().
//     The file is served verbatim at <base>/<path>. Use only when a STABLE,
//     predictable URL is required (e.g. the OG share image that blog.html also
//     hard-references, or very large media you don't want hashed/bundled).
//
//  3) REMOTE   (https://…) — external URLs. Centralised here so they live in ONE
//     place. Externals (e.g. Unsplash) can rate-limit and 404; to localise one,
//     drop the file in src/assets/images/, `import` it above, and swap the value.
//
//  To change/swap any image: edit ONE line in this file. Components and content
//  never hard-code an image path again.
// ============================================================================

// —— 1) BUNDLED imports (hashed + domain-proof) ——————————————————————————————
import profile from '../assets/images/profile.jpg'
import profileWebp from '../assets/images/profile.webp' // lighter sibling (browsers pick this first)

// —— 2) BUNDLED imports ——————————————————————————————————————————————
import tokyo from '../assets/images/tokyo_night.jpg' // For Travel Chronic Section.

// —— 3) BUNDLED imports ——————————————————————————————————————————————
import kaigo_experience from '../assets/images/diaper_night.png' // For Travel Chronic Section.

// —— 2) PUBLIC helper ————————————————————————————————————————————————————————
// import.meta.env.BASE_URL is whatever you set via VITE_BASE at build time
// ('/' for the apex domain, '/Myweb/' for a github.io project page). Always
// ends with a slash, so paths resolve regardless of domain.
const BASE = import.meta.env.BASE_URL || '/'
export const publicAsset = (p: string): string => BASE + String(p).replace(/^\/+/, '')

// —— 3) REMOTE (centralised; localise by swapping to a bundled import) ————————
const unsplash = (id: string, w = 1200): string => `https://images.unsplash.com/${id}?w=${w}&q=90`

export interface AssetRegistry {
  profile: string
  profileWebp: string
  profilePublic: string
  fallback: string
  months: Record<string, string>
  blog: Record<string, string>
}

export const ASSETS: AssetRegistry = {
  // Profile: bundled (used by the React About section — domain-proof, no 404).
  profile,
  profileWebp,
  // Same photo as a stable PUBLIC url (used by blog.html's OG/share tag).
  profilePublic: publicAsset('Myweb_photo/My_profile2_for_myweb.jpg'),

  // Generic fallback used by media galleries when an article has no image.
  fallback: unsplash('photo-1517694712202-14dd9538aa97', 1200),

  // Seasonal gallery photos, keyed by month name.
  months: {
    JANUARY:   unsplash('photo-1517243426866-c8a2f62e5e16'),
    FEBRUARY:  unsplash('photo-1496861083958-175bb1bd5702'),
    MARCH:     unsplash('photo-1522383225653-ed111181a951'),
    APRIL:     unsplash('photo-1462275646964-a0e3386b89fa'),
    MAY:       unsplash('photo-1465146344425-f00d5f5c8f07'),
    JUNE:      unsplash('photo-1433086966358-54859d0ed716'),
    JULY:      unsplash('photo-1531366936337-7c912a4589a7'),
    AUGUST:    unsplash('photo-1504701954957-2010ec3bcec1'),
    SEPTEMBER: unsplash('photo-1508739773434-c26b3d09e071'),
    OCTOBER:   unsplash('photo-1507003211169-0a1dd7228f2d'),
    NOVEMBER:  unsplash('photo-1477414956199-7da45746f742'),
    DECEMBER:  unsplash('photo-1418985991508-e47386d96a71'),
  },

  // Blog header photos, keyed by post id.
  blog: {
    kyoto:              unsplash('photo-1493976040374-85c8e12f0c0e'),
    osaka:              unsplash('photo-1566073771259-6a8506099945'),
    tokyo:              tokyo, // bundled import
    thoughts:           unsplash('photo-1441974231531-c6227db76b6e'),
    kaigo_experience:   kaigo_experience, // bundled import
  },
}

export default ASSETS
