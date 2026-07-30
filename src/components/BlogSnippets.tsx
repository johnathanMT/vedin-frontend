import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { api } from '../lib/portfolioApi'
import type { Article } from '../types/api'

/**
 * BlogSnippets — a compact list of recent blog posts linking to the full blog.
 */
export default function BlogSnippets() {
  const [items, setItems] = useState<Article[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const r = await api.getArticles({ pageSize: 4 })
        setItems([...(r?.data?.items ?? [])])
      } catch { /* keep section empty on error */ }
    })()
  }, [])

  if (items.length === 0) return null

  return (
    <section id="blog" className="relative bg-transparent py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.25em] text-accent-light">// blog</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Recent Writing</h2>
          </div>
          <a href="/Myweb/blog.html" className="font-mono text-sm text-accent-light hover:text-accent">
            All posts →
          </a>
        </div>

        <ul className="divide-y divide-white/10">
          {items.map((a) => {
            const date = a.publishedDate
              ? new Date(a.publishedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
              : ''
            return (
              <li key={a.id}>
                <a
                  href={`/Myweb/blog.html#${a.id}`}
                  className="group flex items-center justify-between gap-4 py-4 transition-colors hover:bg-white/[0.03]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white group-hover:text-accent-light">{a.title}</p>
                    <p className="truncate text-sm text-muted">
                      {date}{a.author ? ` · ${a.author}` : ''}
                    </p>
                  </div>
                  <ArrowUpRight size={18} className="shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:text-accent-light" />
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
