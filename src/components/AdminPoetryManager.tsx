import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Plus, Pencil, Trash2, Save, X, RefreshCw, BookOpen } from 'lucide-react'
import { SITE } from '../config/site'
import type { EntityId, Poem } from '../types/api'

/**
 * AdminPoetryManager — CRUD for the homepage poems, embedded in the admin
 * dashboard. Reuses the same Admin JWT (passed in as `token`):
 *   GET  /api/poetry          (public read)
 *   POST/PUT/DELETE /api/poetry  → Authorization: Bearer <token>  (Role=Admin)
 */
const API = `${SITE.apiUrl}/api/poetry`

interface PoemForm { id: EntityId | null; title: string; subtitle: string; content: string }
const EMPTY: PoemForm = { id: null, title: '', subtitle: '', content: '' }

export default function AdminPoetryManager({ token }: { token: string }) {
  const [poems, setPoems] = useState<Poem[]>([])
  const [form, setForm] = useState<PoemForm>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const authHeaders: Record<string, string> = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const load = useCallback(async () => {
    setError(''); setLoading(true)
    try {
      const res = await fetch(API)
      const data = (await res.json()) as { poems?: Poem[] }
      if (!res.ok) throw new Error(`Load failed (${res.status})`)
      setPoems(Array.isArray(data?.poems) ? data.poems : [])
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not load poems.') } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const edit = (p: Poem) => { setForm({ id: p.id, title: p.title, subtitle: p.subtitle || '', content: p.content }); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const reset = () => setForm(EMPTY)

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim() || saving) return
    setSaving(true); setError('')
    const isEdit = form.id != null
    try {
      const res = await fetch(isEdit ? `${API}/${form.id}` : API, {
        method: isEdit ? 'PUT' : 'POST',
        headers: authHeaders,
        body: JSON.stringify({ title: form.title.trim(), subtitle: form.subtitle.trim(), content: form.content }),
      })
      if (res.status === 401 || res.status === 403) throw new Error('Session expired or not an Admin — please log in again.')
      const data = (await res.json().catch(() => null)) as { errors?: string[]; message?: string } | null
      if (!res.ok) throw new Error(data?.errors?.[0] || data?.message || `Save failed (${res.status})`)
      reset(); await load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Save failed.') } finally { setSaving(false) }
  }

  const remove = async (id: EntityId) => {
    if (!window.confirm('Delete this poem permanently?')) return
    setError('')
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (res.status === 401 || res.status === 403) throw new Error('Session expired or not an Admin — please log in again.')
      if (!res.ok) throw new Error(`Delete failed (${res.status})`)
      if (form.id === id) reset()
      await load()
    } catch (e) { setError(e instanceof Error ? e.message : 'Delete failed.') }
  }

  const inputCls = 'mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-jade/50'

  return (
    <div>
      {error && <p className="mb-4 rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-2.5 font-mono text-sm text-rose-200">{error}</p>}

      {/* ── editor ── */}
      <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-jade">
          <BookOpen size={14} /> {form.id != null ? 'Edit poem' : 'New poem'}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-wider text-white/50">Title *</span>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={120} required placeholder="e.g. // run: becoming" className={inputCls} />
          </label>
          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-wider text-white/50">Subtitle (optional)</span>
            <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} maxLength={80} placeholder="e.g. log_001 · ai" className={inputCls} />
          </label>
        </div>
        <label className="mt-3 block">
          <span className="font-mono text-[11px] uppercase tracking-wider text-white/50">Content * (one line per line)</span>
          <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} maxLength={4000} required rows={7} placeholder={'At 03:00 the compiler hums,\na small city of logic learning to wake.\n…'} className={`${inputCls} resize-y font-mono leading-relaxed`} />
          <span className="mt-1 block text-right font-mono text-[10px] text-white/40">{form.content.length}/4000</span>
        </label>
        <div className="mt-3 flex gap-2">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-jade to-jade-light px-4 py-2.5 font-mono text-xs font-bold text-emerald-950 transition hover:brightness-105 disabled:opacity-60">
            {form.id != null ? <Save size={14} /> : <Plus size={14} />} {saving ? 'Saving…' : form.id != null ? 'Update' : 'Add poem'}
          </button>
          {form.id != null && (
            <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-mono text-xs text-white/80 transition hover:bg-white/10">
              <X size={14} /> Cancel
            </button>
          )}
          <button type="button" onClick={load} disabled={loading} className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-mono text-xs text-white/80 transition hover:bg-white/10 disabled:opacity-60">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </form>

      {/* ── list ── */}
      <div className="mt-5 space-y-3">
        {poems.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-8 text-center font-mono text-sm text-white/40">{loading ? 'Loading…' : 'No poems yet — add your first above.'}</p>
        ) : poems.map((p) => (
          <div key={p.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-mono text-sm font-semibold text-jade-light">{p.title}</span>
                {p.subtitle && <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">{p.subtitle}</span>}
                <span className="ml-auto font-mono text-[10px] text-white/35">{(p.createdDate || '').slice(0, 10)}</span>
              </div>
              <p className="mt-1.5 whitespace-pre-line font-mono text-[12px] leading-relaxed text-white/60 line-clamp-3">{p.content}</p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <button onClick={() => edit(p)} title="Edit" className="rounded-lg border border-white/15 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"><Pencil size={14} /></button>
              <button onClick={() => remove(p.id)} title="Delete" className="rounded-lg border border-rose-400/30 bg-rose-500/10 p-2 text-rose-300 transition hover:bg-rose-500/20"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
