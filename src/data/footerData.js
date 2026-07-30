// ============================================================================
//  footerData.js — SINGLE SOURCE OF TRUTH for the MegaFooter.
//  Edit columns, links, socials, certs and the tech stack here — never touch
//  the JSX. The component just maps over this data.
// ============================================================================
import { Github, Linkedin, Twitter } from 'lucide-react'
import { SITE } from '../config/site'

// Tiny inline SVG badge placeholder (swap for real PNG/SVG files in /public).
const badge = (text) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="44">
    <rect width="120" height="44" rx="8" fill="#10160f" stroke="#3a2f1c"/>
    <text x="60" y="27" font-family="monospace" font-size="12" fill="#d4a04a"
      text-anchor="middle" font-weight="700">${text}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export const footerData = {
  brand: {
    name: 'myothant.dev',
    tagline: 'I Can Care , Cook and also Code ! — building software that solves real problems.',
  },

  socials: [
    { label: 'GitHub',   href: 'https://github.com/johnathanMT',           Icon: Github },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/johnathanmt/', Icon: Linkedin },
    { label: 'X',        href: 'https://x.com/',                           Icon: Twitter },
  ],

  // 4 link columns. `icon` (emoji) is optional — shown next to highlighted links.
  columns: [
    {
      title: 'Product',
      links: [
        { label: 'Projects',     href: '#projects' },
        { label: 'Gallery',      href: '#gallery' },
        { label: 'Immersive 3D', href: 'https://immersive.myothant.dev', icon: '🌌', external: true },
        { label: 'Blog',         href: `${SITE.url}/blog.html`, external: true },
      ],
    },
    {
      title: 'Solutions',
      links: [
        { label: 'Web Apps',        href: '#projects' },
        { label: 'AI & Automation', href: '#projects', icon: '🤖' },
        { label: 'IoT (M5Stack)',   href: '#projects' },
        { label: 'UI / UX Design',  href: '#projects' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About',     href: '#about' },
        { label: 'Story',     href: '#about' },
        { label: 'Exploring', href: '#exploring' },
        { label: 'Contact',   href: SITE.mailto },
      ],
    },
    {
      title: 'Connect',
      links: [
        { label: 'LINE Bot',  href: SITE.lineUrl, icon: '💬', external: true },
        { label: 'GitHub',    href: 'https://github.com/johnathanMT', external: true },
        { label: 'LinkedIn',  href: 'https://www.linkedin.com/in/johnathanmt/', external: true },
        { label: 'Email',     href: SITE.mailto },
      ],
    },
  ],

  certifications: [
    { label: 'AICPA SOC 2',          src: badge('SOC 2') },
    { label: 'Best Developer Award', src: badge('AWARD') },
  ],
}

// ── "Powered By" tech stack ──────────────────────────────────────────────────
// Logos are pulled as clean SVGs from Simple Icons' CDN (brand colours). Add a
// `color` (hex, no #) to override — used for dark-on-dark logos like GitHub.
// To self-host later: drop SVGs in /public and point `logo` at them instead.
const SI = 'https://cdn.simpleicons.org'

export const techStack = [
  { name: 'React',        slug: 'react',        caption: 'UI Library' },
  { name: 'Vite',         slug: 'vite',         caption: 'Build Tool' },
  { name: 'Tailwind CSS', slug: 'tailwindcss',  caption: 'Styling' },
  { name: 'Three.js',     slug: 'threedotjs',   caption: '3D / WebGL', color: 'd6c3a5' },
  { name: 'C# / .NET 8',  slug: 'dotnet',       caption: 'Backend API' },
  { name: 'MySQL',        slug: 'mysql',        caption: 'Database · Aiven' },
  { name: 'Vercel',       slug: 'vercel',       caption: 'Frontend Host', color: 'd6c3a5' },
  { name: 'Render',       slug: 'render',       caption: 'Backend Host', color: 'd6c3a5' },
]

export const techLogo = (t) => `${SI}/${t.slug}${t.color ? `/${t.color}` : ''}`
