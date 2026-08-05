import { useState, type FormEvent } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Loader2, CheckCircle2, Lock } from 'lucide-react'
import { SITE } from '../config/site'

/**
 * ResetPassword — the page the emailed reset link opens (/reset-password?token=…).
 * `scope=admin` targets the admin (/api/auth); otherwise the customer (/api/customer).
 * Submits the token + new password; on success, sends the user to sign in.
 */
export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const isAdmin = (params.get('scope') || '').toLowerCase() === 'admin'
  const endpoint = `${SITE.apiUrl}${isAdmin ? '/api/auth' : '/api/customer'}/reset-password`

  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setErr('')
    if (!token) { setErr('This reset link is missing its token. Please use the link from your email.'); return }
    if (pw.length < 8) { setErr('Password must be at least 8 characters.'); return }
    if (pw !== pw2) { setErr('Passwords do not match.'); return }
    setBusy(true)
    try {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: pw, confirmPassword: pw2 }),
      })
      const j = (await r.json().catch(() => null)) as { success?: boolean; message?: string } | null
      if (!r.ok || j?.success === false) throw new Error(j?.message || `Reset failed (${r.status})`)
      setDone(true)
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Could not reset your password. Please request a new link.')
    } finally { setBusy(false) }
  }

  const signInHref = isAdmin ? '/vedin-admin' : '/'

  return (
    <div className="vedin-page flex min-h-screen items-center justify-center px-4 text-fg" style={{ background: 'rgb(var(--space))' }}>
      <div className="glass-card w-full max-w-sm p-6">
        <h1 className="mb-1 flex items-center gap-2 font-groovy text-xl text-fg"><Lock size={18} className="text-amber-400" /> Reset your password</h1>
        {done ? (
          <div className="mt-4 text-center">
            <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
            <p className="mt-3 text-sm text-fg/90">Your password has been reset. You can now sign in with your new password.</p>
            <Link to={signInHref} className="mt-5 inline-block rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-space transition hover:brightness-110">Go to sign in</Link>
          </div>
        ) : (
          <>
            <p className="mb-4 text-xs leading-relaxed text-muted">Enter a new password for your {isAdmin ? 'admin' : 'Vedin'} account. This link expires 15 minutes after it was sent.</p>
            {err && <p className="mb-3 rounded-xl border border-coral/40 bg-coral/10 px-3 py-2 text-xs text-coral">{err}</p>}
            <form onSubmit={submit} className="space-y-3">
              <label className="block"><span className="font-mono text-[11px] uppercase tracking-wider text-muted">New password</span>
                <input type="password" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-fg outline-none focus:border-accent/50" /></label>
              <label className="block"><span className="font-mono text-[11px] uppercase tracking-wider text-muted">Confirm new password</span>
                <input type="password" required minLength={8} value={pw2} onChange={(e) => setPw2(e.target.value)} className={`mt-1 w-full rounded-xl border bg-white/5 px-3 py-2.5 text-sm text-fg outline-none focus:border-accent/50 ${pw2 && pw !== pw2 ? 'border-coral/50' : 'border-white/15'}`} /></label>
              <button type="submit" disabled={busy} className="w-full rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-space transition hover:brightness-110 disabled:opacity-60">
                {busy ? <Loader2 size={15} className="mx-auto animate-spin" /> : 'Set new password'}
              </button>
            </form>
            <Link to={signInHref} className="mt-3 block text-center font-mono text-[11px] text-muted hover:text-fg">← Back to sign in</Link>
          </>
        )}
      </div>
    </div>
  )
}
