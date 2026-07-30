import { Helmet } from 'react-helmet-async'
import { SITE } from '../config/site'

/**
 * Seo — per-page <head> tags via react-helmet-async. Drop one into (or beside)
 * each route so every page gets a unique title, description, canonical URL, and
 * Open Graph / Twitter cards. Google renders the JS, reads these, and shows a
 * distinct snippet per indexed page.
 *
 *   <Seo title="Python Automation" description="…" path="/python" />
 */
interface SeoProps {
  /** Page title; composed as `${title} — ${SITE_NAME}`. Omit on the homepage. */
  title?: string
  /** Meta description / OG + Twitter description. Falls back to the site default. */
  description?: string
  /** Path appended to the canonical origin, e.g. "/python". Empty = homepage. */
  path?: string
  /** Absolute OG/Twitter image URL. Falls back to the profile image. */
  image?: string
  /** When true, emits `robots: noindex, nofollow` (private/admin routes). */
  noindex?: boolean
}

const SITE_NAME = 'Myo Thant Naing'
const DEFAULT_TITLE = 'Myo Thant Naing — Computer Science Student & Aspiring Software Engineer & AI Enthusiast | Portfolio'
const DEFAULT_DESC =
  'Computer Science student & Software Engineer in Japan, building full-stack apps (C#/.NET, React, Three.js) and Agentic AI systems. From caring to coding.'
const DEFAULT_IMAGE = `${SITE.url}/Myweb_photo/My_profile2_for_myweb.jpg`

export default function Seo({ title, description, path = '', image, noindex = false }: SeoProps) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE
  const desc = description || DEFAULT_DESC
  const url = `${SITE.url}${path}` // canonical (one host — see SITE.url)
  const img = image ? (image.startsWith('http') ? image : `${SITE.url}${image}`) : DEFAULT_IMAGE

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
    </Helmet>
  )
}
