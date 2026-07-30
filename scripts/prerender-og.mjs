// scripts/prerender-og.mjs
// Bake Open Graph / title tags for the Vedin app's ROOT "/" route so social
// crawlers (Facebook, Line, Telegram, Messenger) that DON'T execute JavaScript
// still read the correct card. Runs AFTER `vite build` + inject-site.
//
// Vedin is now the standalone root app, so we rewrite dist/index.html IN PLACE
// (the document actually served at "/"). We also emit dist/vedin.html so the
// legacy /vedin path keeps serving the same correct card.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const dist = resolve('dist')
const src = resolve(dist, 'index.html')
if (!existsSync(src)) { console.error('[prerender-og] dist/index.html not found — skipping'); process.exit(0) }

const SITE = (process.env.VITE_SITE_URL || 'https://myothant.dev').replace(/\/+$/, '')
const OG = {
  title: 'Vedin — Professional Vedic Astrology | Sayar Bhone Min Thike Din',
  desc: 'Get your accurate Vedic astrology reading — Chandra Lagna, D1–D60 divisional charts, Vimśottarī dasha, Shadbala & Ashtakavarga.',
  url: `${SITE}/`,
  image: `${SITE}/sayar.jpg`,
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

// Primary: the root document served at "/".
writeFileSync(src, html)
// Back-compat: the legacy /vedin path (vercel.json rewrites /vedin → /vedin.html).
writeFileSync(resolve(dist, 'vedin.html'), html)
console.log('[prerender-og] baked Vedin OG tags into dist/index.html (root "/") + dist/vedin.html')
