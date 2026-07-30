// ============================================================================
//  inject-site.mjs — post-build token replacement for STATIC files in /public.
//
//  Vite inlines env vars only inside the bundled app (import.meta.env). Files
//  copied verbatim from /public (blog.html, admin.html, the legacy *.html, and
//  public/api.js) are NOT processed, so we replace %TOKENS% in the built dist/
//  output here instead. Runs automatically after `vite build` (see package.json).
//
//  Single source of truth = the same VITE_* env vars the app uses. Change the
//  domain in ONE place (env / CI) and both the bundle and the static files agree.
// ============================================================================
import { readdir, readFile, writeFile, stat } from 'node:fs/promises'
import { join, extname } from 'node:path'

const trim = (s) => String(s || '').replace(/\/+$/, '')

const REPLACEMENTS = {
  '%SITE_URL%':      trim(process.env.VITE_SITE_URL)      || 'https://myothant.dev',
  '%BASE_URL%':      process.env.VITE_BASE                || '/Myweb/',
  '%API_URL%':       trim(process.env.VITE_API_URL)       || 'https://myweb-zqv1.onrender.com',
  '%CONTACT_EMAIL%': process.env.VITE_CONTACT_EMAIL       || 'ai@myothant.dev',
  '%LINE_URL%':      process.env.VITE_LINE_URL            || 'https://lin.ee/s72ayHD',
  '%COFFEE_URL%':    process.env.VITE_COFFEE_URL          || 'https://johnathanmt.github.io/bean-boutique-coffee-shop/',
}

const DIST = join(process.cwd(), 'dist')
const TARGET_EXT = new Set(['.html', '.js', '.json', '.xml', '.webmanifest'])

async function walk(dir) {
  const out = []
  for (const name of await readdir(dir)) {
    const p = join(dir, name)
    const s = await stat(p)
    if (s.isDirectory()) out.push(...await walk(p))
    else if (TARGET_EXT.has(extname(name))) out.push(p)
  }
  return out
}

const tokens = Object.keys(REPLACEMENTS)
let filesTouched = 0, totalHits = 0

try {
  const files = await walk(DIST)
  for (const file of files) {
    let text = await readFile(file, 'utf8')
    let hits = 0
    for (const token of tokens) {
      if (text.includes(token)) {
        hits += text.split(token).length - 1
        text = text.split(token).join(REPLACEMENTS[token])
      }
    }
    if (hits > 0) { await writeFile(file, text); filesTouched++; totalHits += hits }
  }
  console.log(`[inject-site] replaced ${totalHits} token(s) across ${filesTouched} file(s).`)
  console.log(`[inject-site] SITE_URL=${REPLACEMENTS['%SITE_URL%']}  BASE=${REPLACEMENTS['%BASE_URL%']}  API=${REPLACEMENTS['%API_URL%']}`)
} catch (err) {
  if (err.code === 'ENOENT') {
    console.error('[inject-site] dist/ not found — run "vite build" first.')
    process.exit(1)
  }
  throw err
}
