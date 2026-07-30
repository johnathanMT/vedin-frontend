import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` is the path the site is served from:
//   • GitHub Pages project site  → '/Myweb/'  (default)
//   • Custom apex domain (myothant.dev) → '/'
// Override with the VITE_BASE env var at build time so you never edit this file
// when migrating. Example:  VITE_BASE=/ npm run build
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/Myweb/',

  build: {
    // NOTE: we intentionally do NOT use a custom `manualChunks`.
    //
    // A hand-rolled manualChunks that split React / three / @react-three /
    // framer-motion into separate files broke production with:
    //   "ReferenceError: Cannot access 'wh' before initialization"
    // When you force interdependent modules into different chunks, Rollup can no
    // longer guarantee the original module-execution order, so a binding ends up
    // referenced inside its temporal dead zone (before its module ran) → blank
    // white screen.
    //
    // Rollup's DEFAULT chunking already splits vendor code sensibly AND preserves
    // a correct topological init order by construction, so it never produces this
    // class of bug. The app is also already code-split at the route/component
    // level (React.lazy + Suspense), which is where the real first-load win comes
    // from. Raising the warning limit just silences the size notice for our
    // (intentionally lazy-loaded) heavy chunks.
    chunkSizeWarningLimit: 1200,

    // Content-hashed filenames → long-term immutable cache headers work correctly.
    // Vite does this by default, but being explicit makes it clear this is intentional.
    rollupOptions: {
      output: {
        // Keep Vite's default content-hash naming so the Vercel immutable cache rule
        // in vercel.json (/assets/(.*) → max-age=31536000, immutable) applies correctly.
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },

  // Dev server: mirror the production Vercel security headers so local behaviour
  // matches production. The CSP here is intentionally looser (adds 'unsafe-eval'
  // for Vite HMR's eval-based hot-reload) — production always uses vercel.json.
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'X-Permitted-Cross-Domain-Policies': 'none',
    },
  },
})
