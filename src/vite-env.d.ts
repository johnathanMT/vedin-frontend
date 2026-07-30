/// <reference types="vite/client" />

// Strongly-typed environment variables. Vite exposes only keys prefixed VITE_
// (plus the built-ins on ImportMetaEnv: BASE_URL, MODE, DEV, PROD, SSR).
// All are optional because each has a runtime fallback in src/config/site.js.
interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string
  readonly VITE_API_URL?: string
  readonly VITE_CONTACT_EMAIL?: string
  readonly VITE_LINE_URL?: string
  readonly VITE_COFFEE_URL?: string
  readonly VITE_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
