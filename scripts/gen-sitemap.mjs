// ============================================================================
//  gen-sitemap.mjs — the Vite equivalent of `next-sitemap`.
//
//  Runs BEFORE `vite build` (see package.json), writing public/sitemap.xml and
//  public/robots.txt. Vite then copies public/* into dist/, so the files ship at
//  https://myothant.dev/sitemap.xml on every deploy — auto-updated, never stale.
//
//  It auto-discovers the real, crawlable pages:
//    • the SPA homepage  "/"
//    • every standalone public/*.html page (blog, articles, etc.)
//  HashRouter routes (/#/...) are intentionally EXCLUDED — Google ignores the
//  fragment after "#", so they can't appear as distinct sitemap URLs.
// ============================================================================
import { readdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// Default host MUST match the canonical host used by <Seo> (src/config/site.js →
// SITE.url, default https://myothant.dev). If the sitemap says "www" but the
// canonical tag says non-www, Google sees conflicting signals. Keep them identical.
const SITE = (process.env.VITE_SITE_URL || process.env.SITE_URL || 'https://myothant.dev')
  .replace(/\/+$/, '')

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

// Pages NOT to index (admin tools, redirect shells, etc.).
const EXCLUDE = new Set(['admin.html'])

// SPA routes (now clean URLs under BrowserRouter). These were previously hidden
// behind the hash (/#/python) and uncrawlable; list the PUBLIC ones here.
// Excluded on purpose: /sanctuary-admin (admin) and /farewell (private invite).
const SPA_ROUTES = [
  { path: '/python', priority: '0.8' },
  { path: '/studying', priority: '0.8' },
  { path: '/bibliography', priority: '0.6' },
  { path: '/gallery', priority: '0.7' },
  { path: '/sanctuary', priority: '0.7' },
]

const today = new Date().toISOString().slice(0, 10)

// Build the URL list: homepage + SPA routes + every standalone .html page.
const htmlPages = readdirSync(publicDir)
  .filter((f) => f.endsWith('.html') && !EXCLUDE.has(f))
  .sort()

const urls = [
  { loc: `${SITE}/`, priority: '1.0', changefreq: 'weekly' },
  ...SPA_ROUTES.map((r) => ({ loc: `${SITE}${r.path}`, priority: r.priority, changefreq: 'weekly' })),
  ...htmlPages.map((f) => ({ loc: `${SITE}/${f}`, priority: '0.7', changefreq: 'monthly' })),
]

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls
    .map((u) =>
      `  <url>\n` +
      `    <loc>${u.loc}</loc>\n` +
      `    <lastmod>${today}</lastmod>\n` +
      `    <changefreq>${u.changefreq}</changefreq>\n` +
      `    <priority>${u.priority}</priority>\n` +
      `  </url>`)
    .join('\n') +
  `\n</urlset>\n`

const robots =
  `User-agent: *\n` +
  `Allow: /\n\n` +
  `Sitemap: ${SITE}/sitemap.xml\n`

writeFileSync(join(publicDir, 'sitemap.xml'), xml)
writeFileSync(join(publicDir, 'robots.txt'), robots)

console.log(`[gen-sitemap] wrote ${urls.length} URLs → public/sitemap.xml  (host: ${SITE})`)
