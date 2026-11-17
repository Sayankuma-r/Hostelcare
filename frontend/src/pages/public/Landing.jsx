import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUpRight, Check, CheckCircle2, CircleHelp, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import BrandMark from '../../components/BrandMark'
import HeroSection from '../../components/ui/glassmorphism-trust-hero'
import api from '../../services/api'

export default function Landing() {
  const [apiStatus, setApiStatus] = useState('checking')

  useEffect(() => {
    api
      .get('/health')
      .then(() => setApiStatus('online'))
      .catch(() => setApiStatus('offline'))
  }, [])

  return (
    <main className="landing-page" id="top">
      <header className="landing-nav landing-shell">
        <Link className="landing-brand" to="/" aria-label="HostelCare home">
          <BrandMark />
          <span>HostelCare</span>
        </Link>
        <nav className="landing-nav-links" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <Link to="/login">Sign in <ArrowUpRight size={15} /></Link>
        </nav>
      </header>

      <HeroSection />

      <div className="landing-shell">
        <section className="landing-how" id="how-it-works">
          <div className="how-heading">
            <div>
              <span className="section-kicker">LESS CHASING, MORE FIXING</span>
              <h2>Know what happens next.</h2>
            </div>
            <a href="#top" className="back-to-top" onClick={(event) => {
              event.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}>
              Back to top <ArrowDown size={14} className="back-to-top-arrow" />
            </a>
          </div>
          <div className="how-steps">
            <article className="how-step">
              <span className="step-number">01</span>
              <h3>Tell us what needs fixing</h3>
              <p>Share the details and location so the right people can pick it up.</p>
            </article>
            <article className="how-step">
              <span className="step-number">02</span>
              <h3>Follow the progress</h3>
              <p>See who is handling it and get updates as the work moves along.</p>
            </article>
            <article className="how-step">
              <span className="step-number">03</span>
              <h3>Close the loop</h3>
              <p>Review the fix and share feedback with your hostel team.</p>
            </article>
          </div>
        </section>

        <footer className="landing-footer">
          <Link className="landing-brand footer-brand" to="/">
            <BrandMark />
            <span>HostelCare</span>
          </Link>
          <span className="footer-tagline">Report. Track. Resolve.</span>
          <div className={`api-indicator api-${apiStatus}`} data-testid="api-status" aria-live="polite">
            {apiStatus === 'online' ? <CheckCircle2 size={15} /> : apiStatus === 'offline' ? <ShieldAlert size={15} /> : <CircleHelp size={15} />}
            <span>API: {apiStatus}</span>
          </div>
        </footer>
      </div>
    </main>
  )
}
