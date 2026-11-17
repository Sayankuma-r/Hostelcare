import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUpRight, Check, CheckCircle2, CircleHelp, Clock3, ShieldAlert, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import BrandMark from '../../components/BrandMark'
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
      <div className="landing-shell">
        <header className="landing-nav">
          <Link className="landing-brand" to="/" aria-label="HostelCare home">
            <BrandMark />
            <span>HostelCare</span>
          </Link>
          <nav className="landing-nav-links" aria-label="Main navigation">
            <a href="#how-it-works">How it works</a>
            <Link to="/login">Sign in <ArrowUpRight size={15} /></Link>
          </nav>
        </header>

        <section className="landing-hero">
          <div className="landing-copy">
            <div className="landing-eyebrow"><span /> A better hostel, one fix at a time</div>
            <h1>Small problems deserve <em>real attention.</em></h1>
            <p className="landing-description">
              A dripping tap, a broken light, a door that won&apos;t lock. Let your hostel team know
              and follow every repair from report to resolution.
            </p>
            <div className="landing-actions">
              <Link className="landing-button landing-button-primary" to="/register">
                Report an issue <ArrowUpRight size={17} />
              </Link>
              <Link className="landing-button landing-button-secondary" to="/login">
                Sign in to your account
              </Link>
            </div>
            <div className="landing-reassurance">
              <span className="reassurance-check"><Check size={14} /></span>
              <span>For students, hostel staff and administrators</span>
            </div>
          </div>

          <div className="landing-visual" aria-label="Illustration of a complaint being resolved">
            <div className="visual-orbit visual-orbit-one" />
            <div className="visual-orbit visual-orbit-two" />
            <div className="floating-note floating-note-top">
              <span className="floating-note-icon"><Check size={15} /></span>
              <span><strong>Update received</strong><small>Your request is moving</small></span>
            </div>
            <div className="complaint-preview">
              <div className="preview-topline">
                <span>YOUR REQUEST</span>
                <span className="preview-reference">#HC-0248</span>
              </div>
              <div className="preview-title-row">
                <div className="preview-tool-icon"><Wrench size={20} /></div>
                <div>
                  <h2>Leaking tap</h2>
                  <p>Block C <span>·</span> Room 204</p>
                </div>
              </div>
              <div className="preview-status-row">
                <span className="preview-status-dot" />
                <span>Assigned to maintenance</span>
                <span className="preview-time"><Clock3 size={13} /> Today</span>
              </div>
              <div className="preview-divider" />
              <div className="preview-progress-label">
                <span>Progress</span>
                <span>2 of 3 steps</span>
              </div>
              <div className="preview-progress-track"><span /></div>
              <div className="preview-timeline">
                <div className="timeline-step is-complete">
                  <span className="timeline-marker"><Check size={12} /></span>
                  <span><strong>Issue reported</strong><small>Request sent to hostel team</small></span>
                </div>
                <div className="timeline-step is-current">
                  <span className="timeline-marker"><span /></span>
                  <span><strong>Repair in progress</strong><small>Maintenance team is on it</small></span>
                </div>
                <div className="timeline-step">
                  <span className="timeline-marker" />
                  <span><strong>Ready for review</strong><small>You&apos;ll be notified when it&apos;s done</small></span>
                </div>
              </div>
              <div className="preview-footer"><span /> Updates stay together, from start to finish</div>
            </div>
            <div className="floating-note floating-note-bottom">
              <div className="mini-avatars"><span>S</span><span>M</span></div>
              <span><strong>People in the loop</strong><small>Student &amp; maintenance</small></span>
            </div>
          </div>
        </section>

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
