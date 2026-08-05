import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { SITE } from '../config/site'

const CUST_TOKEN = 'mtn_customer_jwt'   // must match CustomerPanel

/**
 * ConfirmEmail — the page the confirmation link opens (/confirm?token=…).
 * POSTs the token WITH credentials so the HttpOnly device-binding cookie is sent.
 * • Same device (cookie matches)  → backend returns a JWT → we store it + redirect
 *   to the dashboard (auto-login, no manual sign-in).
 * • Different device (no cookie)  → email is still confirmed, but we ask the user to
 *   return to their original device and sign in (no cross-device session hand-off).
 */
export default function ConfirmEmail() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') || ''
  const [state, setState] = useState<'working' | 'autologin' | 'confirmed' | 'error'>('working')
  const [msg, setMsg] = useState('')
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    ;(async () => {
      if (!token) { setState('error'); setMsg('This confirmation link is missing its token.'); return }
      try {
        const r = await fetch(`${SITE.apiUrl}/api/customer/confirm-email`, {
          method: 'POST',
          credentials: 'include',                    // send the device-binding cookie
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const j = (await r.json().catch(() => null)) as
          | { success?: boolean; message?: string; data?: { confirmed?: boolean; sameDevice?: boolean; token?: string } }
          | null
        if (!r.ok || !j?.data?.confirmed) throw new Error(j?.message || 'This confirmation link is invalid or has expired.')

        if (j.data.sameDevice && j.data.token) {
          try { localStorage.setItem(CUST_TOKEN, j.data.token) } catch { /* ignore */ }
          setState('autologin')
          setTimeout(() => navigate('/', { replace: true }), 1200)   // land on the dashboard, logged in
        } else {
          setState('confirmed')
        }
      } catch (e) {
        setState('error')
        setMsg(e instanceof Error ? e.message : 'Could not confirm your email.')
      }
    })()
  }, [token, navigate])

  return (
    <div className="vedin-page flex min-h-screen items-center justify-center px-4 text-fg" style={{ background: 'rgb(var(--space))' }}>
      <div className="glass-card w-full max-w-sm p-8 text-center">
        {state === 'working' && (
          <><Loader2 size={40} className="mx-auto animate-spin text-accent-light" />
            <p className="mt-4 text-sm text-muted">Confirming your email…</p></>
        )}
        {state === 'autologin' && (
          <><CheckCircle2 size={44} className="mx-auto text-emerald-500" />
            <h1 className="mt-3 font-groovy text-xl text-fg">Email confirmed</h1>
            <p className="mt-2 text-sm text-fg/90">You're signed in — taking you to your dashboard…</p></>
        )}
        {state === 'confirmed' && (
          <><CheckCircle2 size={44} className="mx-auto text-emerald-500" />
            <h1 className="mt-3 font-groovy text-xl text-fg">Email confirmed</h1>
            <p className="mt-2 text-sm leading-relaxed text-fg/90">For your security, please return to the device/browser you signed up on and sign in there.</p>
            <Link to="/" className="mt-5 inline-block rounded-xl bg-amber-600 shadow-md px-5 py-2.5 text-sm font-semibold text-amber-50 transition hover:brightness-110">Go to Vedin</Link></>
        )}
        {state === 'error' && (
          <><AlertTriangle size={40} className="mx-auto text-rose-400" />
            <h1 className="mt-3 font-groovy text-lg text-fg">Confirmation failed</h1>
            <p className="mt-2 text-sm text-rose-300">{msg}</p>
            <Link to="/" className="mt-5 inline-block rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm text-fg transition hover:bg-white/10">Back to Vedin</Link></>
        )}
      </div>
    </div>
  )
}
