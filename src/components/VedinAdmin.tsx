import { useEffect, useState, Fragment, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Lock, RefreshCw, LogOut, Search, Sparkles, Star, FileText, Mail, Trash2, X, Send, ScrollText, Check, UserRound, Eye, BarChart3, type LucideIcon } from 'lucide-react'
import { SITE } from '../config/site'
import KundliChart from './KundliChart'
import { signLabel } from '../lib/vedin'
import type { BirthChartData } from '../types/astrology'

/**
 * VedinAdmin — dedicated Vedic-astrology control dashboard (route /vedin-admin).
 * Reuses the same Admin JWT as SanctuaryAdmin (localStorage key `mtn_admin_jwt`),
 * so signing into either panel signs you into both. Purely the astrology domain:
 * Readings, PDF queue, Saved / Querent charts, registered Users, and Remedy CRM.
 */
const AUTH_URL = `${SITE.apiUrl}/api/auth/login`
const REMEDIES_URL = `${SITE.apiUrl}/api/astrology/admin/remedies`
const CHARTS_URL = `${SITE.apiUrl}/api/customer/admin/saved-charts`
const PDF_URL = `${SITE.apiUrl}/api/astrology/admin/pdf-reading-requests`
const READINGS_BASE = `${SITE.apiUrl}/api/astrology/admin/reading-requests`
const QUERENT_URL = `${SITE.apiUrl}/api/astrology/admin/charts`
const USERS_URL = `${SITE.apiUrl}/api/customer/admin/users`
const MSG_THREADS_URL = `${SITE.apiUrl}/api/customer/admin/message-threads`
const TOKEN_KEY = 'mtn_admin_jwt'

type Tab = 'readings' | 'pdf' | 'charts' | 'querent' | 'users' | 'remedy' | 'messages'

interface AdminRemedy { id: number; name: string; contact: string; area: string; message: string; birthInfo: string; handled: boolean; status: string; notes: string; createdAt: string }
const STATUSES = ['Pending', 'InProgress', 'Completed', 'Cancelled'] as const
const statusColor = (s: string) => s === 'Completed' ? 'text-emerald-300' : s === 'Cancelled' ? 'text-rose-300' : s === 'InProgress' ? 'text-amber-300' : 'text-fg/80'
const ageOf = (dob?: string): string => {
  if (!dob) return ''
  const b = new Date(dob); if (isNaN(b.getTime())) return ''
  const n = new Date(); let a = n.getFullYear() - b.getFullYear()
  const m = n.getMonth() - b.getMonth(); if (m < 0 || (m === 0 && n.getDate() < b.getDate())) a--
  return a >= 0 && a < 200 ? `${a} yrs` : ''
}
interface AdminChart { id: number; name: string; gender: string; birthDate: string; birthTime: string; timeZone: string; location: string; nayNan: number; createdAt: string }
// Natal context attached to a reading request when it came from a registered account.
interface RegisteredInfo {
  isRegistered?: boolean; accountEmail?: string; accountUsername?: string
  gender?: string; dob?: string; birthTime?: string; locationName?: string
  latitude?: number; longitude?: number; timezone?: string
}
interface AdminPdf extends RegisteredInfo { id: number; querentName: string; clientEmail?: string; status: string; createdAt: string }
interface AdminReadingReq extends RegisteredInfo { id: number; querentName: string; clientEmail?: string; status: string; hasMarkdown: boolean; pdfRequested: boolean; createdAt: string; approvedAt?: string }
interface AdminUser extends RegisteredInfo { id: number; username: string; email: string; isSuspended: boolean; emailConfirmed: boolean; hasProfile: boolean; createdAt: string }
interface MessageThread { customerId: number; username: string; email: string; lastMessage: string; lastAt: string; unread: number }
interface ChatMsg { id: number; senderRole: string; text: string; createdAt: string }
type ReadingsFilter = 'Pending' | 'Approved' | 'Rejected'

interface LoginResponse { data?: { token?: string; role?: string }; message?: string }

export default function VedinAdmin() {
  const [token, setToken] = useState<string>(() => { try { return localStorage.getItem(TOKEN_KEY) || '' } catch { return '' } })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState<Tab>('readings')
  const [remedies, setRemedies] = useState<AdminRemedy[]>([])
  const [charts, setCharts] = useState<AdminChart[]>([])
  const [querentCharts, setQuerentCharts] = useState<AdminChart[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [userBusy, setUserBusy] = useState<number | null>(null)
  const [threads, setThreads] = useState<MessageThread[]>([])
  const [activeThread, setActiveThread] = useState<{ customerId: number; username: string } | null>(null)
  const [threadMsgs, setThreadMsgs] = useState<ChatMsg[]>([])
  const [chatReply, setChatReply] = useState(''); const [chatReplyBusy, setChatReplyBusy] = useState(false)
  const [pdfs, setPdfs] = useState<AdminPdf[]>([])
  const [readingReqs, setReadingReqs] = useState<AdminReadingReq[]>([])
  const [rowBusy, setRowBusy] = useState<{ id: number; action: 'approve' | 'reject' | 'sent' } | null>(null)
  const [readingsFilter, setReadingsFilter] = useState<ReadingsFilter>('Pending')
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')

  const persist = (tk: string) => { try { tk ? localStorage.setItem(TOKEN_KEY, tk) : localStorage.removeItem(TOKEN_KEY) } catch { /* ignore */ } }
  const showToast = (text: string) => setToast(text)
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2600); return () => clearTimeout(t) }, [toast])

  const login = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await fetch(AUTH_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim(), password }) })
      const data = (await res.json()) as LoginResponse
      const tk = data?.data?.token
      if (!res.ok || !tk) throw new Error(data?.message || `Login failed (${res.status})`)
      if ((data?.data?.role || '').toLowerCase() !== 'admin') throw new Error('This account is not an Admin.')
      setToken(tk); persist(tk); setPassword('')
    } catch (err) { setError(err instanceof Error ? err.message : 'Login failed.') } finally { setLoading(false) }
  }
  const logout = () => { setToken(''); persist(''); setRemedies([]); setCharts([]); setQuerentCharts([]); setUsers([]); setPdfs([]); setReadingReqs([]); setThreads([]); setActiveThread(null); setThreadMsgs([]) }

  const load = async (which: Tab = tab) => {
    if (!token) return
    setError(''); setLoading(true)
    try {
      const url = which === 'remedy' ? REMEDIES_URL : which === 'charts' ? CHARTS_URL : which === 'querent' ? QUERENT_URL : which === 'users' ? USERS_URL : which === 'messages' ? MSG_THREADS_URL : which === 'pdf' ? PDF_URL : `${READINGS_BASE}?status=${readingsFilter}`
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      if (res.status === 401 || res.status === 403) { logout(); throw new Error('Session expired or not an Admin. Please log in again.') }
      if (!res.ok) throw new Error(`Failed to load (${res.status})`)
      const data = (await res.json()) as { data?: AdminRemedy[] | AdminChart[] | AdminPdf[] | AdminReadingReq[] | AdminUser[] | MessageThread[] }
      const arr = Array.isArray(data?.data) ? data.data : []
      if (which === 'remedy') setRemedies(arr as AdminRemedy[])
      else if (which === 'charts') setCharts(arr as AdminChart[])
      else if (which === 'querent') setQuerentCharts(arr as AdminChart[])
      else if (which === 'users') setUsers(arr as AdminUser[])
      else if (which === 'messages') setThreads(arr as MessageThread[])
      else if (which === 'pdf') setPdfs(arr as AdminPdf[])
      else setReadingReqs(arr as AdminReadingReq[])
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not load data.') } finally { setLoading(false) }
  }

  const openThread = async (t: MessageThread) => {
    setActiveThread({ customerId: t.customerId, username: t.username }); setThreadMsgs([])
    try {
      const res = await fetch(`${SITE.apiUrl}/api/customer/admin/messages/${t.customerId}`, { headers: { Authorization: `Bearer ${token}` } })
      const j = (await res.json().catch(() => null)) as { success?: boolean; data?: ChatMsg[] } | null
      if (j?.success && Array.isArray(j.data)) setThreadMsgs(j.data)
      setThreads((ts) => ts.map((x) => (x.customerId === t.customerId ? { ...x, unread: 0 } : x)))
    } catch { setError('Could not open the thread.') }
  }
  const sendChatReply = async () => {
    const text = chatReply.trim()
    if (!text || !activeThread || chatReplyBusy) return
    setChatReplyBusy(true)
    try {
      const res = await fetch(`${SITE.apiUrl}/api/customer/admin/messages/${activeThread.customerId}`, { method: 'POST', headers: authJson, body: JSON.stringify({ text }) })
      const j = (await res.json().catch(() => null)) as { success?: boolean; data?: ChatMsg } | null
      if (j?.success && j.data) { setThreadMsgs((m) => [...m, j.data as ChatMsg]); setChatReply('') }
    } catch { setError('Could not send.') } finally { setChatReplyBusy(false) }
  }

  const authJson = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  // ── Remedy CRM ──────────────────────────────────────────────────────────────
  const setStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${SITE.apiUrl}/api/astrology/admin/remedies/${id}/status`, { method: 'PATCH', headers: authJson, body: JSON.stringify({ status }) })
      if (!res.ok) throw new Error()
      setRemedies((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)))
    } catch { setError('Could not update status.') }
  }
  const saveNotes = async (id: number, notes: string) => {
    try {
      const res = await fetch(`${SITE.apiUrl}/api/astrology/admin/remedies/${id}/notes`, { method: 'PATCH', headers: authJson, body: JSON.stringify({ notes }) })
      if (!res.ok) throw new Error()
      setRemedies((rs) => rs.map((r) => (r.id === id ? { ...r, notes } : r)))
    } catch { setError('Could not save notes.') }
  }
  const deleteRemedy = async (id: number) => {
    if (!window.confirm('Delete this request permanently?')) return
    try {
      const res = await fetch(`${SITE.apiUrl}/api/astrology/admin/remedies/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error()
      setRemedies((rs) => rs.filter((r) => r.id !== id))
    } catch { setError('Could not delete.') }
  }
  const deleteChart = async (id: number) => {
    if (!window.confirm('Delete this saved chart permanently?')) return
    try {
      const res = await fetch(`${SITE.apiUrl}/api/customer/admin/saved-charts/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error()
      setCharts((cs) => cs.filter((c) => c.id !== id)); showToast('Chart deleted.')
    } catch { setError('Could not delete.') }
  }
  const deleteQuerentChart = async (id: number) => {
    if (!window.confirm('Delete this anonymous chart permanently?')) return
    try {
      const res = await fetch(`${SITE.apiUrl}/api/astrology/admin/charts/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error()
      setQuerentCharts((cs) => cs.filter((c) => c.id !== id)); showToast('Chart deleted.')
    } catch { setError('Could not delete.') }
  }

  // ── User management ─────────────────────────────────────────────────────────
  const toggleSuspend = async (u: AdminUser) => {
    setUserBusy(u.id); setError('')
    try {
      const res = await fetch(`${SITE.apiUrl}/api/customer/admin/users/${u.id}/toggle-suspend`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } })
      const j = (await res.json().catch(() => null)) as { success?: boolean; data?: { isSuspended: boolean }; message?: string } | null
      if (res.status === 401 || res.status === 403) { logout(); throw new Error('Session expired.') }
      if (!res.ok || !j?.success) throw new Error(j?.message || `Failed (${res.status})`)
      const nowSuspended = !!j.data?.isSuspended
      setUsers((us) => us.map((x) => (x.id === u.id ? { ...x, isSuspended: nowSuspended } : x)))
      showToast(nowSuspended ? '⛔ User suspended.' : '✅ User activated.')
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not update the user.') } finally { setUserBusy(null) }
  }
  const deleteUser = async (u: AdminUser) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This cannot be undone.')) return
    setUserBusy(u.id); setError('')
    try {
      const res = await fetch(`${SITE.apiUrl}/api/customer/admin/users/${u.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (res.status === 401 || res.status === 403) { logout(); throw new Error('Session expired.') }
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      setUsers((us) => us.filter((x) => x.id !== u.id)); showToast('🗑️ User permanently deleted.')
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not delete the user.') } finally { setUserBusy(null) }
  }

  // ── Reading workflow ────────────────────────────────────────────────────────
  const markPdfSent = async (id: number) => {
    setRowBusy({ id, action: 'sent' }); setError('')
    try {
      const res = await fetch(`${SITE.apiUrl}/api/astrology/admin/reading-requests/${id}/mark-pdf-sent`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      if (res.status === 401 || res.status === 403) { logout(); throw new Error('Session expired. Please log in again.') }
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      setPdfs((ps) => ps.filter((r) => r.id !== id)); showToast('✅ Marked as sent — removed from the queue.')
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not mark as sent.') } finally { setRowBusy(null) }
  }
  const approveReading = async (id: number) => {
    setRowBusy({ id, action: 'approve' }); setError('')
    try {
      const res = await fetch(`${SITE.apiUrl}/api/astrology/admin/reading-requests/${id}/approve`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      const data = (await res.json().catch(() => null)) as { success?: boolean; message?: string } | null
      if (res.status === 401 || res.status === 403) { logout(); throw new Error('Session expired. Please log in again.') }
      if (!res.ok || !data?.success) throw new Error(data?.message || `Failed (${res.status})`)
      setReadingReqs((rs) => rs.filter((r) => r.id !== id)); showToast('✅ Reading approved & generated.')
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not approve the reading.') } finally { setRowBusy(null) }
  }
  const rejectReading = async (id: number) => {
    if (!window.confirm('Reject this reading request? The querent will need to request again next month.')) return
    setRowBusy({ id, action: 'reject' }); setError('')
    try {
      const res = await fetch(`${SITE.apiUrl}/api/astrology/admin/reading-requests/${id}/reject`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      setReadingReqs((rs) => rs.filter((r) => r.id !== id)); showToast('Request rejected.')
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not reject the request.') } finally { setRowBusy(null) }
  }

  // ── Reply / send-reading modal ──────────────────────────────────────────────
  const [reply, setReply] = useState<{ id: number; name: string; contact: string } | null>(null)
  const [replySubject, setReplySubject] = useState('')
  const [replyBody, setReplyBody] = useState('')
  const [replyBusy, setReplyBusy] = useState(false)
  const [replyMsg, setReplyMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const sendReply = async () => {
    if (!reply || !replyBody.trim()) return
    setReplyBusy(true); setReplyMsg(null)
    try {
      const res = await fetch(`${SITE.apiUrl}/api/astrology/admin/remedies/${reply.id}/reply`, { method: 'POST', headers: authJson, body: JSON.stringify({ subject: replySubject.trim(), body: replyBody }) })
      const data = (await res.json().catch(() => null)) as { success?: boolean; message?: string } | null
      if (!res.ok || !data?.success) throw new Error(data?.message || 'Send failed')
      setReplyMsg({ ok: true, text: 'Reading emailed to the client.' })
      setRemedies((rs) => rs.map((r) => (r.id === reply.id ? { ...r, status: 'Completed' } : r)))
      setReplyBody('')
    } catch (err) { setReplyMsg({ ok: false, text: err instanceof Error ? err.message : 'Send failed' }) } finally { setReplyBusy(false) }
  }

  // ── Inline natal chart (reuses the public /chart engine + <KundliChart>) ─────
  const [natalCharts, setNatalCharts] = useState<Record<number, BirthChartData>>({})
  const [chartBusy, setChartBusy] = useState<number | null>(null)
  const [chartErr, setChartErr] = useState<Record<number, string>>({})
  const [chartShown, setChartShown] = useState<Record<number, boolean>>({})
  const loadChart = async (id: number, r: RegisteredInfo) => {
    if (!r.dob || r.latitude == null || r.longitude == null) { setChartErr((e) => ({ ...e, [id]: 'Incomplete birth data for this account.' })); return }
    setChartBusy(id); setChartErr((e) => ({ ...e, [id]: '' }))
    try {
      const [y, mo, d] = r.dob.split('-').map(Number)
      const [h, mi] = (r.birthTime || '12:00').split(':').map(Number)
      const body = { year: y, month: mo, day: d, hour: h || 0, minute: mi || 0, second: 0, timeZone: r.timezone || 'UTC', latitude: r.latitude, longitude: r.longitude, ayanamsa: 'lahiri' }
      const res = await fetch(`${SITE.apiUrl}/api/astrology/chart`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const j = (await res.json().catch(() => null)) as { success?: boolean; data?: BirthChartData; message?: string } | null
      if (!res.ok || !j?.success || !j.data) throw new Error(j?.message || `Failed (${res.status})`)
      setNatalCharts((c) => ({ ...c, [id]: j.data as BirthChartData }))
    } catch (err) { setChartErr((e) => ({ ...e, [id]: err instanceof Error ? err.message : 'Could not compute the chart.' })) }
    finally { setChartBusy(null) }
  }
  const toggleChart = (id: number, r: RegisteredInfo) => {
    const willShow = !chartShown[id]
    setChartShown((s) => ({ ...s, [id]: willShow }))
    if (willShow && !natalCharts[id]) loadChart(id, r)
  }

  useEffect(() => { if (token) { setQ(''); load(tab) } }, [token, tab]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (token && tab === 'readings') load('readings') }, [readingsFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const s = q.trim().toLowerCase()
  const filteredRemedies = remedies.filter((r) => !s || (r.name || '').toLowerCase().includes(s) || (r.contact || '').toLowerCase().includes(s) || (r.area || '').toLowerCase().includes(s) || (r.message || '').toLowerCase().includes(s))
  const filteredCharts = charts.filter((c) => !s || (c.name || '').toLowerCase().includes(s) || (c.gender || '').toLowerCase().includes(s) || (c.timeZone || '').toLowerCase().includes(s))
  const filteredQuerentCharts = querentCharts.filter((c) => !s || (c.name || '').toLowerCase().includes(s) || (c.gender || '').toLowerCase().includes(s) || (c.timeZone || '').toLowerCase().includes(s))
  const filteredUsers = users.filter((u) => !s || (u.username || '').toLowerCase().includes(s) || (u.email || '').toLowerCase().includes(s))
  const filteredPdfs = pdfs.filter((r) => !s || (r.querentName || '').toLowerCase().includes(s) || (r.clientEmail || '').toLowerCase().includes(s))
  const filteredReadingReqs = readingReqs.filter((r) => !s || (r.querentName || '').toLowerCase().includes(s))

  const total = tab === 'remedy' ? remedies.length : tab === 'charts' ? charts.length : tab === 'querent' ? querentCharts.length : tab === 'users' ? users.length : tab === 'messages' ? threads.length : tab === 'pdf' ? pdfs.length : readingReqs.length
  const shown = tab === 'remedy' ? filteredRemedies.length : tab === 'charts' ? filteredCharts.length : tab === 'querent' ? filteredQuerentCharts.length : tab === 'users' ? filteredUsers.length : tab === 'messages' ? threads.length : tab === 'pdf' ? filteredPdfs.length : filteredReadingReqs.length

  const TabBtn = ({ id, icon: Icon, label }: { id: Tab; icon: LucideIcon; label: string }) => (
    <button type="button" onClick={() => setTab(id)}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-xs transition ${tab === id ? 'border-violet-400/60 bg-violet-500/15 text-violet-100' : 'border-fg/15 bg-fg/5 text-fg/70 hover:bg-fg/10'}`}>
      <Icon size={14} /> {label}
    </button>
  )

  const UserBadge = ({ reg }: { reg?: boolean }) => reg
    ? <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/40 bg-gradient-to-r from-violet-500/25 to-emerald-400/20 px-2 py-0.5 font-mono text-[10px] text-violet-100"><UserRound size={10} /> Registered</span>
    : <span className="inline-flex items-center gap-1 rounded-full border border-fg/15 bg-fg/5 px-2 py-0.5 font-mono text-[10px] text-fg/50">Guest</span>

  // Full registered-account context + inline computed natal chart.
  const RegisteredDetail = ({ r, cols }: { r: RegisteredInfo & { id: number }; cols: number }) => {
    const chartShownNow = !!chartShown[r.id]
    const chart = natalCharts[r.id]
    const busy = chartBusy === r.id
    const err = chartErr[r.id]
    const canChart = !!r.dob && r.latitude != null && r.longitude != null
    return (
      <tr className="border-t border-fg/5 bg-violet-500/[0.06]">
        <td colSpan={cols} className="px-4 py-4">
          <div className="rounded-xl border border-violet-400/25 bg-gradient-to-br from-violet-500/[0.08] to-emerald-400/[0.06] p-4">
            <p className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-violet-200"><UserRound size={12} /> Registered account · full natal info</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
              {([
                ['Name', r.accountUsername], ['Email', r.accountEmail], ['Gender', r.gender],
                ['Date of birth', r.dob], ['Age', ageOf(r.dob) || undefined], ['Birth time', r.birthTime], ['Location', r.locationName],
                ['Timezone', r.timezone], ['Lat, Lon', r.latitude != null && r.longitude != null ? `${r.latitude}, ${r.longitude}` : undefined],
              ] as [string, string | undefined][]).map(([k, v]) => (
                <div key={k}>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-fg/40">{k}</div>
                  <div className="text-fg/90">{v || <span className="text-fg/30">—</span>}</div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <button type="button" onClick={() => toggleChart(r.id, r)} disabled={busy || !canChart}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/40 bg-gradient-to-r from-emerald-400/20 to-violet-500/25 px-4 py-2 font-mono text-[12px] font-semibold text-emerald-50 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
                {busy ? <RefreshCw size={13} className="animate-spin" /> : <BarChart3 size={13} />}
                📊 ဇာတာခွင် တွက်ချက်ကြည့်ရှုရန် (View Natal Chart)
              </button>
              {!canChart && <p className="mt-2 font-mono text-[10px] text-fg/40">No stored birth data — chart unavailable.</p>}
            </div>
            {chartShownNow && canChart && (
              <div className="mt-4">
                {err && <p className="mb-2 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">{err}</p>}
                {busy && !chart && <p className="font-mono text-xs text-fg/50">Computing chart…</p>}
                {chart && (
                  <div className="vedin-page grid gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
                    <div className="min-w-0 rounded-xl border border-violet-400/20 bg-space/40 p-3">
                      <KundliChart data={chart} title="Rasi · D1" subtitle={r.accountUsername || undefined} />
                    </div>
                    <div className="min-w-0 overflow-x-auto rounded-xl border border-fg/10">
                      <table className="w-full min-w-[340px] border-collapse text-left text-xs">
                        <thead className="bg-fg/5 font-mono text-[10px] uppercase tracking-wider text-fg/50">
                          <tr><th className="px-3 py-2">Planet</th><th className="px-3 py-2">Sign</th><th className="px-3 py-2">House</th><th className="px-3 py-2">Nakshatra</th><th className="px-3 py-2">R</th></tr>
                        </thead>
                        <tbody>
                          <tr className="border-t border-fg/5">
                            <td className="px-3 py-1.5 font-medium text-violet-200">Lagna</td>
                            <td className="px-3 py-1.5">{signLabel(chart.ascendant.sign, 'en')}</td>
                            <td className="px-3 py-1.5 font-mono">1</td>
                            <td className="px-3 py-1.5 text-fg/50">—</td>
                            <td className="px-3 py-1.5" />
                          </tr>
                          {chart.planets.map((p) => (
                            <tr key={p.name} className="border-t border-fg/5">
                              <td className="px-3 py-1.5 font-medium text-amber-200">{p.name}</td>
                              <td className="px-3 py-1.5">{signLabel(p.sign, 'en')}</td>
                              <td className="px-3 py-1.5 font-mono">{p.house}</td>
                              <td className="px-3 py-1.5 text-fg/70">{p.nakshatraName || '—'}</td>
                              <td className="px-3 py-1.5">{p.retrograde ? <span className="text-rose-300">R</span> : ''}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div className="min-h-screen bg-space px-4 py-6 text-fg sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-fg/15 bg-fg/5 px-4 py-2 font-mono text-xs text-fg/80 transition hover:bg-fg/10"><ArrowLeft size={15} /> Home</Link>
          <h1 className="flex items-center gap-2 font-serif text-xl font-bold sm:text-2xl"><Sparkles size={18} className="text-violet-300" /> Vedin · Control Dashboard</h1>
          {token ? (
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-fg/15 bg-fg/5 px-4 py-2 font-mono text-xs text-fg/80 transition hover:bg-fg/10"><LogOut size={14} /> Log out</button>
          ) : <span className="w-[88px]" />}
        </div>

        {error && <p className="mt-4 rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-2.5 font-mono text-sm text-rose-200">{error}</p>}

        {!token ? (
          <form onSubmit={login} className="mx-auto mt-16 w-full max-w-sm rounded-2xl border border-fg/10 bg-fg/5 p-7">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-violet-500/15"><Lock size={20} /></div>
            <h2 className="text-center font-serif text-lg font-bold">Vedin Admin sign in</h2>
            <label className="mt-5 block">
              <span className="font-mono text-[11px] uppercase tracking-wider text-fg/50">Email</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full rounded-xl border border-fg/15 bg-fg/5 px-4 py-3 text-base outline-none focus:border-violet-400/50 sm:py-2.5 sm:text-sm" />
            </label>
            <label className="mt-4 block">
              <span className="font-mono text-[11px] uppercase tracking-wider text-fg/50">Password</span>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full rounded-xl border border-fg/15 bg-fg/5 px-4 py-3 text-base outline-none focus:border-violet-400/50 sm:py-2.5 sm:text-sm" />
            </label>
            <button type="submit" disabled={loading} className="mt-5 w-full rounded-xl bg-gradient-to-r from-violet-400 to-emerald-400 px-5 py-3 font-serif text-sm font-bold text-[#160f22] transition hover:brightness-105 disabled:opacity-60">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            <Link to="/sanctuary-admin" className="mt-4 block text-center font-mono text-[11px] text-fg/50 hover:text-fg">→ Sanctuary Admin (portfolio)</Link>
          </form>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <TabBtn id="readings" icon={ScrollText} label="Readings" />
              <TabBtn id="pdf" icon={FileText} label="PDF Requests" />
              <TabBtn id="charts" icon={Star} label="Saved Charts" />
              <TabBtn id="querent" icon={Star} label="Querent Charts" />
              <TabBtn id="users" icon={UserRound} label="Users" />
              <TabBtn id="messages" icon={Mail} label="Messages" />
              <TabBtn id="remedy" icon={Sparkles} label="Remedy" />
              <Link to="/sanctuary-admin" className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-2 font-mono text-xs text-amber-100 transition hover:bg-amber-300/20"><ArrowLeft size={13} /> Sanctuary Admin</Link>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg/40" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-full rounded-xl border border-fg/15 bg-fg/5 py-3 pl-9 pr-4 text-base outline-none focus:border-violet-400/50 sm:py-2.5 sm:text-sm" />
              </div>
              <button onClick={() => load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-fg/15 bg-fg/5 px-4 py-2.5 font-mono text-xs text-fg/80 transition hover:bg-fg/10 disabled:opacity-60">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
              <span className="font-mono text-xs text-fg/50">{shown} / {total}</span>
            </div>

            {/* ── READINGS ── */}
            {tab === 'readings' && (
              <>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(['Pending', 'Approved', 'Rejected'] as ReadingsFilter[]).map((f) => (
                    <button key={f} type="button" onClick={() => setReadingsFilter(f)}
                      className={`rounded-full border px-3.5 py-1.5 font-mono text-[11px] transition ${readingsFilter === f ? 'border-violet-400/60 bg-violet-500/15 text-violet-100' : 'border-fg/15 bg-fg/5 text-fg/60 hover:bg-fg/10'}`}>
                      {f}
                    </button>
                  ))}
                </div>
                <div className="mt-3 overflow-x-auto rounded-2xl border border-fg/10">
                  <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                    <thead className="bg-fg/5 font-mono text-[11px] uppercase tracking-wider text-fg/50">
                      <tr>
                        <th className="px-4 py-3">Querent</th>
                        <th className="px-4 py-3 whitespace-nowrap">Requested</th>
                        {readingsFilter !== 'Pending' && <th className="px-4 py-3 whitespace-nowrap">Approved</th>}
                        <th className="px-4 py-3">User</th>
                        <th className="px-4 py-3">{readingsFilter === 'Pending' ? 'Actions' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => { const cols = readingsFilter === 'Pending' ? 4 : 5; return filteredReadingReqs.length === 0 ? (
                        <tr><td colSpan={cols} className="px-4 py-10 text-center font-mono text-sm text-fg/40">{loading ? 'Loading…' : `No ${readingsFilter.toLowerCase()} requests.`}</td></tr>
                      ) : filteredReadingReqs.map((r) => {
                        const busy = rowBusy?.id === r.id
                        return (
                          <Fragment key={r.id}>
                            <tr className="border-t border-fg/5 align-top hover:bg-fg/[0.03]">
                              <td className="px-4 py-3 font-medium text-amber-300">{r.querentName || '—'}</td>
                              <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-fg/50">{(r.createdAt || '').slice(0, 16)}</td>
                              {readingsFilter !== 'Pending' && <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-fg/50">{r.approvedAt || <span className="text-fg/30">—</span>}</td>}
                              <td className="px-4 py-3">
                                <div className="flex flex-col items-start gap-1.5">
                                  <UserBadge reg={r.isRegistered} />
                                  {r.isRegistered && (
                                    <button onClick={() => setExpandedRow(expandedRow === r.id ? null : r.id)}
                                      className="inline-flex items-center gap-1 rounded-lg border border-violet-400/30 bg-violet-500/10 px-2 py-1 font-mono text-[10px] text-violet-100 transition hover:bg-violet-500/20">
                                      <Eye size={11} /> {expandedRow === r.id ? 'Hide' : 'View Info'}
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {readingsFilter === 'Pending' ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    <button onClick={() => approveReading(r.id)} disabled={busy}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/50 bg-emerald-400/20 px-3 py-1.5 font-mono text-[11px] font-semibold text-emerald-100 transition hover:bg-emerald-400/30 disabled:opacity-60">
                                      {busy && rowBusy?.action === 'approve' ? <><RefreshCw size={12} className="animate-spin" /> Generating Reading…</> : <><Check size={12} /> Approve</>}
                                    </button>
                                    <button onClick={() => rejectReading(r.id)} disabled={busy}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 font-mono text-[11px] text-rose-300 transition hover:bg-rose-400/20 disabled:opacity-60">
                                      {busy && rowBusy?.action === 'reject' ? <RefreshCw size={12} className="animate-spin" /> : <X size={12} />} Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] ${r.status === 'Approved' ? 'bg-emerald-400/15 text-emerald-200' : 'bg-rose-400/15 text-rose-200'}`}>{r.status}</span>
                                )}
                              </td>
                            </tr>
                            {expandedRow === r.id && r.isRegistered && <RegisteredDetail r={r} cols={cols} />}
                          </Fragment>
                        )
                      }) })()}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ── PDF REQUESTS ── */}
            {tab === 'pdf' && (
              <div className="mt-4 overflow-x-auto rounded-2xl border border-fg/10">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead className="bg-fg/5 font-mono text-[11px] uppercase tracking-wider text-fg/50">
                    <tr><th className="px-4 py-3">Querent</th><th className="px-4 py-3">Client email</th><th className="px-4 py-3 whitespace-nowrap">Requested</th><th className="px-4 py-3">Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredPdfs.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-10 text-center font-mono text-sm text-fg/40">{loading ? 'Loading…' : 'No PDF requests in the queue.'}</td></tr>
                    ) : filteredPdfs.map((r) => {
                      const busy = rowBusy?.id === r.id
                      return (
                        <tr key={r.id} className="border-t border-fg/5 align-top hover:bg-fg/[0.03]">
                          <td className="px-4 py-3"><div className="flex flex-col items-start gap-1"><span className="font-medium text-amber-300">{r.querentName || '—'}</span><UserBadge reg={r.isRegistered} /></div></td>
                          <td className="px-4 py-3 text-fg/90">{r.clientEmail || <span className="text-fg/30">—</span>}</td>
                          <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-fg/50">{(r.createdAt || '').slice(0, 16)}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1.5">
                              <a href={`mailto:${encodeURIComponent(r.clientEmail || '')}?subject=${encodeURIComponent('Your Vedic Reading PDF')}`}
                                className={`inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-3 py-1.5 font-mono text-[11px] text-accent-light transition hover:bg-accent/20 ${r.clientEmail ? '' : 'pointer-events-none opacity-40'}`}>
                                <Mail size={12} /> 📧 Email ပို့ရန်
                              </a>
                              <button onClick={() => markPdfSent(r.id)} disabled={busy}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/50 bg-emerald-400/20 px-3 py-1.5 font-mono text-[11px] font-semibold text-emerald-100 transition hover:bg-emerald-400/30 disabled:opacity-60">
                                {busy && rowBusy?.action === 'sent' ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />} ✅ ပြီးစီးပြီ
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── SAVED CHARTS (customer accounts) ── */}
            {tab === 'charts' && (
              <div className="mt-4 overflow-x-auto rounded-2xl border border-fg/10">
                <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                  <thead className="bg-fg/5 font-mono text-[11px] uppercase tracking-wider text-fg/50">
                    <tr>
                      <th className="px-4 py-3">Name</th><th className="px-4 py-3">Gender</th><th className="px-4 py-3 whitespace-nowrap">Birth date</th><th className="px-4 py-3 whitespace-nowrap">Time</th>
                      <th className="px-4 py-3">Time zone</th><th className="px-4 py-3 whitespace-nowrap">Lat,Lon</th><th className="px-4 py-3 whitespace-nowrap">Nay-Nan</th><th className="px-4 py-3 whitespace-nowrap">Saved</th><th className="px-4 py-3">Del</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCharts.length === 0 ? (
                      <tr><td colSpan={9} className="px-4 py-10 text-center font-mono text-sm text-fg/40">{loading ? 'Loading…' : 'No saved charts.'}</td></tr>
                    ) : filteredCharts.map((c) => (
                      <tr key={c.id} className="border-t border-fg/5 align-top hover:bg-fg/[0.03]">
                        <td className="px-4 py-3 font-medium text-amber-300">{c.name || '—'}</td>
                        <td className="px-4 py-3 font-mono text-xs capitalize text-fg/70">{c.gender}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-fg/90">{c.birthDate}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-fg/70">{c.birthTime}</td>
                        <td className="px-4 py-3 font-mono text-xs text-fg/60">{c.timeZone}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-fg/60">{c.location}</td>
                        <td className="px-4 py-3 text-fg/80">{c.nayNan}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-fg/50">{(c.createdAt || '').slice(0, 16)}</td>
                        <td className="px-4 py-3"><button onClick={() => deleteChart(c.id)} title="Delete" className="inline-flex items-center rounded-lg border border-rose-400/30 bg-rose-400/10 px-2 py-1 text-rose-300 transition hover:bg-rose-400/20"><Trash2 size={12} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── QUERENT CHARTS (anonymous) ── */}
            {tab === 'querent' && (
              <div className="mt-4 overflow-x-auto rounded-2xl border border-fg/10">
                <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                  <thead className="bg-fg/5 font-mono text-[11px] uppercase tracking-wider text-fg/50">
                    <tr>
                      <th className="px-4 py-3">Name</th><th className="px-4 py-3">Gender</th><th className="px-4 py-3 whitespace-nowrap">Birth date</th><th className="px-4 py-3 whitespace-nowrap">Time</th>
                      <th className="px-4 py-3">Time zone</th><th className="px-4 py-3 whitespace-nowrap">Lat,Lon</th><th className="px-4 py-3 whitespace-nowrap">Nay-Nan</th><th className="px-4 py-3 whitespace-nowrap">Saved</th><th className="px-4 py-3">Del</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuerentCharts.length === 0 ? (
                      <tr><td colSpan={9} className="px-4 py-10 text-center font-mono text-sm text-fg/40">{loading ? 'Loading…' : 'No anonymous charts.'}</td></tr>
                    ) : filteredQuerentCharts.map((c) => (
                      <tr key={c.id} className="border-t border-fg/5 align-top hover:bg-fg/[0.03]">
                        <td className="px-4 py-3 font-medium text-amber-300">{c.name || '—'}</td>
                        <td className="px-4 py-3 font-mono text-xs capitalize text-fg/70">{c.gender}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-fg/90">{c.birthDate}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-fg/70">{c.birthTime}</td>
                        <td className="px-4 py-3 font-mono text-xs text-fg/60">{c.timeZone}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-fg/60">{c.location}</td>
                        <td className="px-4 py-3 text-fg/80">{c.nayNan}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-fg/50">{(c.createdAt || '').slice(0, 16)}</td>
                        <td className="px-4 py-3"><button onClick={() => deleteQuerentChart(c.id)} title="Delete" className="inline-flex items-center rounded-lg border border-rose-400/30 bg-rose-400/10 px-2 py-1 text-rose-300 transition hover:bg-rose-400/20"><Trash2 size={12} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── USERS (view info + inline Kundli + suspend/delete) ── */}
            {tab === 'users' && (
              <div className="mt-4 overflow-x-auto rounded-2xl border border-fg/10">
                <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                  <thead className="bg-fg/5 font-mono text-[11px] uppercase tracking-wider text-fg/50">
                    <tr><th className="px-4 py-3">User</th><th className="px-4 py-3 whitespace-nowrap">Joined</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Info</th><th className="px-4 py-3">Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-10 text-center font-mono text-sm text-fg/40">{loading ? 'Loading…' : 'No registered users.'}</td></tr>
                    ) : filteredUsers.map((u) => {
                      const busy = userBusy === u.id
                      return (
                        <Fragment key={u.id}>
                          <tr className="border-t border-fg/5 align-top hover:bg-fg/[0.03]">
                            <td className="px-4 py-3">
                              <div className="font-medium text-amber-300">{u.username || '—'}</div>
                              <div className="font-mono text-[11px] text-fg/60">{u.email}</div>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {u.hasProfile && <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-1.5 py-0.5 font-mono text-[9px] text-violet-100">natal profile</span>}
                                {!u.emailConfirmed && <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 font-mono text-[9px] text-amber-200">unconfirmed</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-fg/50">{(u.createdAt || '').slice(0, 16)}</td>
                            <td className="px-4 py-3">
                              {u.isSuspended
                                ? <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/40 bg-rose-500/15 px-2.5 py-0.5 font-mono text-[11px] text-rose-200">● Suspended</span>
                                : <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-0.5 font-mono text-[11px] text-emerald-200">● Active</span>}
                            </td>
                            <td className="px-4 py-3">
                              {u.hasProfile
                                ? <button onClick={() => setExpandedRow(expandedRow === u.id ? null : u.id)} className="inline-flex items-center gap-1 rounded-lg border border-violet-400/30 bg-violet-500/10 px-2 py-1 font-mono text-[10px] text-violet-100 transition hover:bg-violet-500/20"><Eye size={11} /> {expandedRow === u.id ? 'Hide' : 'View Info'}</button>
                                : <span className="font-mono text-[10px] text-fg/30">—</span>}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1.5">
                                <button onClick={() => toggleSuspend(u)} disabled={busy}
                                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[11px] font-semibold transition disabled:opacity-60 ${u.isSuspended ? 'border-emerald-300/50 bg-emerald-400/20 text-emerald-100 hover:bg-emerald-400/30' : 'border-amber-300/50 bg-amber-400/20 text-amber-100 hover:bg-amber-400/30'}`}>
                                  {busy ? <RefreshCw size={12} className="animate-spin" /> : u.isSuspended ? <Check size={12} /> : <Lock size={12} />}
                                  {u.isSuspended ? 'Activate' : 'Suspend'}
                                </button>
                                <button onClick={() => deleteUser(u)} disabled={busy}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-1.5 font-mono text-[11px] text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-60">
                                  <Trash2 size={12} /> Delete (အပြီးဖျက်မည်)
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expandedRow === u.id && u.hasProfile && (
                            <RegisteredDetail cols={5} r={{ id: u.id, isRegistered: true, accountUsername: u.username, accountEmail: u.email, gender: u.gender, dob: u.dob, birthTime: u.birthTime, locationName: u.locationName, latitude: u.latitude, longitude: u.longitude, timezone: u.timezone }} />
                          )}
                        </Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── MESSAGES (consultation chat threads) ── */}
            {tab === 'messages' && (
              <div className="mt-4 grid gap-4 md:grid-cols-[300px_1fr]">
                {/* Thread list */}
                <div className="overflow-hidden rounded-2xl border border-fg/10">
                  <div className="border-b border-fg/10 bg-fg/5 px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-fg/50">Threads</div>
                  <div className="max-h-[560px] divide-y divide-fg/5 overflow-y-auto">
                    {threads.length === 0 ? (
                      <div className="px-4 py-10 text-center font-mono text-sm text-fg/40">{loading ? 'Loading…' : 'No conversations yet.'}</div>
                    ) : threads.map((t) => (
                      <button key={t.customerId} type="button" onClick={() => openThread(t)}
                        className={`flex w-full items-start gap-2 px-4 py-3 text-left transition ${activeThread?.customerId === t.customerId ? 'bg-violet-500/15' : 'hover:bg-fg/[0.04]'}`}>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-medium text-amber-300">{t.username || `#${t.customerId}`}</span>
                            {t.unread > 0 && <span className="ml-auto shrink-0 rounded-full bg-rose-500 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white">{t.unread}</span>}
                          </div>
                          <div className="truncate font-mono text-[11px] text-fg/50">{t.lastMessage}</div>
                          <div className="mt-0.5 font-mono text-[10px] text-fg/35">{(t.lastAt || '').slice(0, 16).replace('T', ' ')}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conversation pane */}
                <div className="flex min-h-[560px] flex-col overflow-hidden rounded-2xl border border-fg/10">
                  {!activeThread ? (
                    <div className="flex flex-1 items-center justify-center px-4 py-10 text-center font-mono text-sm text-fg/40">Select a conversation to reply.</div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 border-b border-fg/10 bg-fg/5 px-4 py-2.5">
                        <UserRound size={14} className="text-amber-300" />
                        <span className="font-medium text-amber-300">{activeThread.username || `#${activeThread.customerId}`}</span>
                      </div>
                      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                        {threadMsgs.length === 0 ? (
                          <div className="py-10 text-center font-mono text-sm text-fg/40">No messages.</div>
                        ) : threadMsgs.map((m) => {
                          const isAdmin = (m.senderRole || '').toLowerCase() === 'admin'
                          return (
                            <div key={m.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm ${isAdmin ? 'rounded-br-sm bg-gradient-to-br from-violet-500/30 to-amber-400/20 text-fg' : 'rounded-bl-sm border border-emerald-400/30 bg-emerald-500/10 text-fg'}`}>
                                <div className="mb-0.5 font-mono text-[9px] uppercase tracking-wider text-fg/40">{isAdmin ? 'ဆရာဘုန်းမင်းသိုက်ဒင်' : (activeThread.username || 'Customer')}</div>
                                <div className="whitespace-pre-wrap break-words leading-relaxed">{m.text}</div>
                                <div className="mt-1 text-right font-mono text-[9px] text-fg/35">{(m.createdAt || '').slice(0, 16).replace('T', ' ')}</div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex items-end gap-2 border-t border-fg/10 bg-fg/5 px-3 py-3">
                        <textarea value={chatReply} onChange={(e) => setChatReply(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatReply() } }}
                          rows={2} placeholder="Reply to the customer… (Enter to send)"
                          className="flex-1 resize-none rounded-xl border border-fg/15 bg-space/40 px-3 py-2 text-sm text-fg outline-none focus:border-violet-400/50" />
                        <button type="button" onClick={sendChatReply} disabled={chatReplyBusy || !chatReply.trim()}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-violet-400/50 bg-violet-500/20 px-4 py-2.5 font-mono text-xs font-semibold text-violet-100 transition hover:bg-violet-500/30 disabled:opacity-50">
                          {chatReplyBusy ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />} Send
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ── REMEDY / CONTACT REQUESTS ── */}
            {tab === 'remedy' && (
              <div className="mt-4 overflow-x-auto rounded-2xl border border-fg/10">
                <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
                  <thead className="bg-fg/5 font-mono text-[11px] uppercase tracking-wider text-fg/50">
                    <tr>
                      <th className="px-3 py-3">Name</th><th className="px-3 py-3">Contact</th><th className="px-3 py-3">Area</th>
                      <th className="px-3 py-3">Message / Question</th><th className="px-3 py-3 whitespace-nowrap">Birth</th>
                      <th className="px-3 py-3">Status</th><th className="px-3 py-3">Notes</th><th className="px-3 py-3 whitespace-nowrap">Submitted</th><th className="px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRemedies.length === 0 ? (
                      <tr><td colSpan={9} className="px-4 py-10 text-center font-mono text-sm text-fg/40">{loading ? 'Loading…' : 'No requests.'}</td></tr>
                    ) : filteredRemedies.map((r) => (
                      <tr key={r.id} className="border-t border-fg/5 align-top hover:bg-fg/[0.03]">
                        <td className="px-3 py-3 font-medium text-amber-300">{r.name || '—'}</td>
                        <td className="px-3 py-3 text-fg/90">{r.contact}</td>
                        <td className="px-3 py-3 font-mono text-xs text-fg/60">{r.area || '—'}</td>
                        <td className="max-w-[240px] px-3 py-3 text-fg/90">{r.message}</td>
                        <td className="px-3 py-3 whitespace-nowrap font-mono text-xs text-fg/60">{r.birthInfo}</td>
                        <td className="px-3 py-3">
                          <select value={r.status || 'Pending'} onChange={(e) => setStatus(r.id, e.target.value)} className={`rounded-lg border border-fg/15 bg-space px-2 py-1 font-mono text-[11px] ${statusColor(r.status)}`}>
                            {STATUSES.map((st) => <option key={st} value={st} className="text-black">{st}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-3">
                          <input defaultValue={r.notes} placeholder="—" onBlur={(e) => { if (e.target.value !== r.notes) saveNotes(r.id, e.target.value) }} className="w-32 rounded-lg border border-fg/12 bg-fg/5 px-2 py-1 text-xs text-fg/90 outline-none focus:border-accent/40" />
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap font-mono text-xs text-fg/50">{(r.createdAt || '').slice(0, 16)}</td>
                        <td className="px-3 py-3">
                          <div className="flex gap-1.5">
                            <button onClick={() => { setReply({ id: r.id, name: r.name, contact: r.contact }); setReplySubject(''); setReplyBody(''); setReplyMsg(null) }} className="inline-flex items-center gap-1 rounded-lg border border-accent/30 bg-accent/10 px-2 py-1 font-mono text-[11px] text-accent-light transition hover:bg-accent/20"><Mail size={12} /> Reply</button>
                            <button onClick={() => deleteRemedy(r.id)} title="Delete" className="inline-flex items-center rounded-lg border border-rose-400/30 bg-rose-400/10 px-2 py-1 text-rose-300 transition hover:bg-rose-400/20"><Trash2 size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Reply / Send-reading modal ── */}
      {reply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setReply(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-fg/10 bg-space p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-fg">Send reading to {reply.name || 'client'}</h3>
              <button onClick={() => setReply(null)} className="text-fg/50 hover:text-fg"><X size={18} /></button>
            </div>
            <p className="mb-3 font-mono text-[11px] text-fg/50">To: {reply.contact}</p>
            {replyMsg && <p className={`mb-3 rounded-xl border px-3 py-2 text-xs ${replyMsg.ok ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200' : 'border-rose-400/40 bg-rose-400/10 text-rose-200'}`}>{replyMsg.text}</p>}
            <input value={replySubject} onChange={(e) => setReplySubject(e.target.value)} placeholder="Subject (optional)" className="mb-2 w-full rounded-xl border border-fg/15 bg-fg/5 px-3 py-2 text-sm text-fg outline-none focus:border-accent/50" />
            <textarea value={replyBody} onChange={(e) => setReplyBody(e.target.value)} rows={9} placeholder="Type or paste the horoscope reading / remedy response here…" className="w-full resize-y rounded-xl border border-fg/15 bg-fg/5 px-3 py-2 text-sm text-fg outline-none focus:border-accent/50" />
            <div className="mt-3 flex items-center justify-end gap-2">
              <button onClick={() => setReply(null)} className="rounded-xl border border-fg/15 px-4 py-2 text-xs text-fg/70 transition hover:text-fg">Cancel</button>
              <button onClick={sendReply} disabled={replyBusy || !replyBody.trim()} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-violet-500 px-5 py-2 text-xs font-semibold text-space transition hover:brightness-110 disabled:opacity-50">
                {replyBusy ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />} Send Reading to Client Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success toast ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-5 py-2.5 font-mono text-sm text-emerald-100 shadow-2xl backdrop-blur-md">
            <Check size={15} className="text-emerald-300" /> {toast}
          </div>
        </div>
      )}
    </div>
  )
}
