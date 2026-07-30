import { defineConfig } from 'vitest/config'

// Unit / property tests run in a plain Node environment (the code under test —
// e.g. src/lib/stats.ts — is pure and needs no DOM). Kept separate from
// vite.config.ts so the production build config is untouched.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    globals: false,
  },
})
