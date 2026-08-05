import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { SITE } from '../config/site'

/**
 * Terms of Service — plain-language terms for using Vedin. Theme-aware via .vedin-page
 * and rendered inside VedinShell (top bar + footer). Boilerplate, not legal advice.
 */
export default function Terms() {
  const updated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  return (
    <section className="section-container vedin-page">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent-light">
          <ArrowLeft size={15} /> Back to Vedin
        </Link>
        <h1 className="font-groovy text-3xl text-fg sm:text-4xl">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted">Last updated: {updated}</p>

        <div className="vedin-md mt-8 space-y-6">
          <p>By using Vedin, you agree to these terms. Please read them alongside our Privacy Policy.</p>

          <div>
            <h3>The service</h3>
            <p>
              Vedin computes Vedic astrology charts and generates readings from the birth details you
              provide. Charts are calculated with classical astronomical and astrological methods;
              readings are drafted with the assistance of a language model and, where noted, reviewed
              before delivery.
            </p>
          </div>

          <div>
            <h3>Guidance, not professional advice</h3>
            <p>
              Astrological readings are offered for reflection, cultural study, and entertainment.
              They are <strong>not</strong> a substitute for professional medical, legal, financial,
              or psychological advice, and you should not make important decisions based solely on
              them. For significant matters, consult a qualified professional.
            </p>
          </div>

          <div>
            <h3>Your account</h3>
            <p>
              You are responsible for keeping your login credentials secure and for the accuracy of
              the details you submit. You may request deletion of your account and saved data at any
              time.
            </p>
          </div>

          <div>
            <h3>Acceptable use</h3>
            <p>
              Do not misuse the service — including attempting to disrupt it, access other users'
              data, or use it for unlawful purposes. We may rate-limit or suspend access to protect
              the service.
            </p>
          </div>

          <div>
            <h3>Intellectual property</h3>
            <p>
              The Vedin name, design, and generated report format belong to their owner. Your birth
              data and the readings produced for you remain yours to keep, download, or delete.
            </p>
          </div>

          <div>
            <h3>Disclaimer &amp; liability</h3>
            <p>
              The service is provided “as is”, without warranties of any kind. To the fullest extent
              permitted by law, we are not liable for any decision made, or loss incurred, in reliance
              on a reading.
            </p>
          </div>

          <div>
            <h3>Changes &amp; contact</h3>
            <p>
              We may update these terms; material changes will be reflected by the date above.
              Questions? Contact <a href={SITE.mailto}>{SITE.email}</a>.
            </p>
          </div>

          <p className="text-sm text-muted">This summary is provided for transparency and is not legal advice.</p>
        </div>
      </div>
    </section>
  )
}
