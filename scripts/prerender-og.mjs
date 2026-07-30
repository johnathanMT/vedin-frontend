// scripts/prerender-og.mjs
// Bake Open Graph / title tags for the /vedin route so social crawlers
// (Facebook, Line, Telegram, Messenger) that DON'T execute JavaScript still read
// the correct card. Runs AFTER `vite build` + inject-site: copies dist/index.html
// → dist/vedin.html with the Vedin meta swapped in. vercel.json rewrites
// `/vedin` → `/vedin.html`, so the same JS bundle still loads — browsers get
// the full SPA, crawlers get the right tags.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const dist = resolve('dist')
const src = resolve(dist, 'index.html')
if (!existsSync(src)) { console.error('[prerender-og] dist/index.html not found — skipping'); process.exit(0) }

const SITE = (process.env.VITE_SITE_URL || 'https://myothant.dev').replace(/\/+$/, '')
const OG = {
  title: 'Sayar Bhone Min Thike Din - Professional Vedic Astrology',
  desc: 'Get your accurate Vedic astrology reading, Chandra Lagna, and full Shadbala analysis.',
  url: `${SITE}/vedin`,
  image: `${SITE}/astrology-og.jpg`,
}

let html = readFileSync(src, 'utf8')
const set = (re, val) => { html = html.replace(re, val) }

set(/<title>[\s\S]*?<\/title>/, `<title>${OG.title}</title>`)
set(/<meta name="description"[^>]*>/, `<meta name="description" content="${OG.desc}" />`)
set(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${OG.url}" />`)
set(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${OG.title}" />`)
set(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${OG.desc}" />`)
set(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${OG.url}" />`)
set(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${OG.image}" />`)
set(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${OG.title}" />`)
set(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${OG.desc}" />`)
set(/<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${OG.image}" />`)

writeFileSync(resolve(dist, 'vedin.html'), html)
console.log('[prerender-og] wrote dist/vedin.html with Vedin OG tags')
