import { useParams, Link, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useConfig } from '../context/ConfigContext'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import PasswordGate from '../components/PasswordGate'

export default function CaseStudy() {
  const { projectId } = useParams()
  const { projects } = useConfig()
  const project = projects.find(p => p.id === projectId)
  const [unlocked, setUnlocked] = useState(false)

  if (!project) {
    return (
      <>
        <Nav />
        <div style={{ padding: '200px 48px', textAlign: 'center', maxWidth: 1440, margin: '0 auto' }}>
          <h2>Project not found</h2>
          <Link to="/" style={{ color: '#3568d4', fontWeight: 600 }}>← Back to Portfolio</Link>
        </div>
      </>
    )
  }

  // If not password-protected, redirect to full project
  if (!project.needsPassword && project.hasFullProject) {
    return <Navigate to={`/work/${project.id}/full`} replace />
  }

  const sessionKey = `portfolio_unlocked_${project.id}`
  const isUnlocked = unlocked || sessionStorage.getItem(sessionKey)

  const handleUnlock = () => {
    sessionStorage.setItem(sessionKey, 'true')
    setUnlocked(true)
  }

  // If unlocked, redirect to full case study
  if (project.needsPassword && isUnlocked) {
    return <Navigate to={`/work/${project.id}/full`} replace />
  }

  // Summary page for NDA projects (like Access Management in reference)
  return (
    <>
      <Nav />
      <div className="case-page">
        {/* Hero */}
        <div className="case-top">
          <div className="case-hero-grid">
            <div className="case-hero-info">
              <div>
                <div className="case-hero-company">{project.company}</div>
                <div className="case-hero-title">{project.title}</div>
              </div>
              <div className="tag-group">
                {project.tags.map(t => <div key={t} className="tag"><span>{t}</span></div>)}
              </div>
            </div>
            <div className="case-hero-image">
              {project.heroImage
                ? <img src={project.heroImage} alt={project.title} />
                : <div className="img-placeholder">[ {project.title} ]</div>}
            </div>
          </div>

          {/* Meta */}
          <div className="case-meta-grid">
            <div className="case-meta-col">
              <div className="case-meta-item">
                <div className="case-meta-label">Role</div>
                <div className="case-meta-value">{project.meta.role}</div>
              </div>
              <div className="case-meta-item">
                <div className="case-meta-label">Stakeholder</div>
                <div className="case-meta-value">{project.meta.stakeholders}</div>
              </div>
              <div className="case-meta-item">
                <div className="case-meta-label">Timeline</div>
                <div className="case-meta-value">{project.meta.timeline}</div>
              </div>
            </div>
            <div className="case-meta-col">
              <div className="case-meta-item">
                <div className="case-meta-label">Project Overview</div>
                <div className="case-meta-value">{project.summaryDesc}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary content */}
        <div className="case-section-full">
          <div className="section-body">
            <p>{project.meta.overview}</p>
          </div>
        </div>

        {/* Delivery metrics */}
        {project.delivery.metrics.length > 0 && (
          <div className="metrics-section">
            <div className="metrics-wrapper">
              {project.delivery.metrics.map((m, i) => (
                <div key={i} className="metric-block">
                  <div className="metric-number">{m.number}<small>{m.unit}</small></div>
                  <div className="metric-label">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary delivery & takeaway */}
        <div className="case-section-full">
          {project.summaryDelivery && (
            <>
              <div className="section-label-sm">Delivery</div>
              <div className="section-body"><p>{project.summaryDelivery}</p></div>
            </>
          )}
          {project.summaryTakeaway && (
            <>
              <div className="section-label-sm">Takeaway</div>
              <div className="section-body"><p>{project.summaryTakeaway}</p></div>
            </>
          )}
        </div>

        {/* NDA notice with password gate link */}
        <div className="case-section-full">
          <div className="nda-notice">
            <p>Interested in the full design process and demo?</p>
            <div className="nda-actions">
              <Link to={`/work/${project.id}/full`} className="nda-btn primary">
                Go to Full Case Study (Password Required)
              </Link>
              <a href="mailto:linnhan.design@gmail.com" className="nda-btn secondary">
                Or schedule a coffee chat with me.
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}