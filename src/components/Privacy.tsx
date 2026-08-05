import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { SITE } from '../config/site'

/**
 * Privacy Policy — a concise, honest summary of what Vedin collects and how it is
 * handled. Theme-aware via .vedin-page; rendered inside VedinShell so it inherits the
 * top bar + footer. This is plain-language boilerplate, not legal advice.
 */
export default function Privacy() {
  const updated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  return (
    <section className="section-container vedin-page">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent-light">
          <ArrowLeft size={15} /> Back to Vedin
        </Link>
        <h1 className="font-groovy text-3xl text-fg sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted">Last updated: {updated}</p>

        <div className="vedin-md mt-8 space-y-6">
          <p>
            Vedin computes Vedic astrology charts and readings from the birth details you provide.
            This policy explains what we collect, why, and the choices you have. We keep it short
            because we collect little.
          </p>

          <div>
            <h3>What we collect</h3>
            <ul>
              <li><strong>Birth details</strong> — date, time, and place (latitude/longitude, timezone) used to compute your chart.</li>
              <li><strong>Account data</strong> — if you sign up, your email address and a chosen display name.</li>
              <li><strong>Saved charts &amp; readings</strong> — stored under your account so you can revisit them.</li>
            </ul>
          </div>

          <div>
            <h3>How we use it</h3>
            <p>
              Your birth details are used solely to calculate your chart and generate readings.
              Your email is used for sign-in, email confirmation, and password reset. We do not sell
              your data or use it for advertising.
            </p>
          </div>

          <div>
            <h3>Storage &amp; security</h3>
            <p>
              Personal chart details and readings are encrypted at rest. Access is protected by
              authenticated, rate-limited endpoints. No storage is perfectly secure, but we apply
              industry-standard safeguards.
            </p>
          </div>

          <div>
            <h3>Third-party services</h3>
            <ul>
              <li><strong>OpenStreetMap / Nominatim</strong> — city search &amp; geocoding when you look up a birth place.</li>
              <li><strong>AI provider</strong> — the chart facts and reading text are sent to our language-model provider to draft readings; birth date/time are not sent as raw identifiers.</li>
            </ul>
          </div>

          <div>
            <h3>Your choices</h3>
            <p>
              You can view, download, or delete your saved charts and readings from your account,
              and you can request deletion of your account at any time. The birth form also stores a
              local draft in your browser for convenience, which you can clear by clearing site data.
            </p>
          </div>

          <div>
            <h3>Contact</h3>
            <p>Questions about this policy? Reach us at <a href={SITE.mailto}>{SITE.email}</a>.</p>
          </div>

          <p className="text-sm text-muted">
            This summary is provided for transparency and is not legal advice.
          </p>
        </div>
      </div>
    </section>
  )
}
