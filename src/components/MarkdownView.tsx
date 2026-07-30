import { useMemo } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

marked.setOptions({ gfm: true, breaks: true })

/** Renders trusted-but-sanitised Markdown (e.g. an AI reading) as styled HTML.
 *  marked → HTML, then DOMPurify strips anything unsafe before it hits the DOM. */
export default function MarkdownView({ markdown, className = '' }: { markdown: string; className?: string }) {
  const html = useMemo(() => {
    const raw = marked.parse(markdown ?? '', { async: false }) as string
    return DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } })
  }, [markdown])
  return <div className={`vedin-md ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
}
