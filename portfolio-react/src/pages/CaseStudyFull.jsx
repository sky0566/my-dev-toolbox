import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useConfig } from '../context/ConfigContext'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import PasswordGate from '../components/PasswordGate'

export default function CaseStudyFull() {
  const { projectId } = useParams()
  const { projects } = useConfig()
  const project = projects.find(p => p.id === projectId)
  const [unlocked, setUnlocked] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const sectionRefs = useRef({})

  const assignRef = useCallback((id) => (el) => { sectionRefs.current[id] = el }, [])

  // Scroll spy
  useEffect(() => {
    if (!project) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id) })
      },
      { rootMargin: '-80px 0px -50% 0px', threshold: 0.1 }
    )
    // Small delay to let refs populate after render
    const timer = setTimeout(() => {
      Object.values(sectionRefs.current).forEach(el => { if (el) observer.observe(el) })
    }, 200)
    return () => { clearTimeout(timer); observer.disconnect() }
  }, [project, unlocked])

  if (!project) {
    return (
      <>
        <Nav />
        <div style={{ padding: '200px 48px', textAlign: 'center' }}>
          <h2>Project not found</h2>
          <Link to="/" style={{ color: '#3568d4', fontWeight: 600 }}>← Back to Portfolio</Link>
        </div>
      </>
    )
  }

  // Password check for protected projects
  const sessionKey = `portfolio_unlocked_${project.id}`
  const isUnlocked = !project.needsPassword || unlocked || sessionStorage.getItem(sessionKey)

  const handleUnlock = () => {
    sessionStorage.setItem(sessionKey, 'true')
    setUnlocked(true)
  }

  if (!isUnlocked) {
    return (
      <>
        <Nav />
        <PasswordGate onUnlock={handleUnlock} />
        <Footer />
      </>
    )
  }

  // Build sidebar links from project data
  const sidebarIds = []
  if (project.discovery?.sections?.length) sidebarIds.push('Discovery')
  project.challenges?.forEach((_, i) => {
    sidebarIds.push(`Design ${i + 1}`)
  })
  if (project.delivery?.metrics?.length) sidebarIds.push('Result')

  // Helper to render an image or placeholder
  const Img = ({ src, alt, className }) => {
    if (src) return <img src={src} alt={alt || ''} loading="lazy" className={className} />
    return <div className={`img-placeholder ${className || ''}`}>[ {alt} ]</div>
  }

  return (
    <>
      <Nav />

      {/* Left sidebar */}
      {sidebarIds.length > 0 && (
        <div className="leftbar">
          <div className="leftbar-links">
            {(project.sidebarLinks || sidebarIds).map(label => (
              <a
                key={label}
                href={`#${label.replace(/\s+/g, '-')}`}
                className={activeSection === label.replace(/\s+/g, '-') ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault()
                  sectionRefs.current[label.replace(/\s+/g, '-')]?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="case-page has-sidebar">
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
              <Img src={project.heroImage} alt={project.title} />
            </div>
          </div>

          {/* Meta grid */}
          <div className="case-meta-grid">
            <div className="case-meta-col">
              <div className="case-meta-item">
                <div className="case-meta-label">Overview</div>
                <div className="case-meta-value">{project.meta.overview}</div>
              </div>
              {project.meta.impact && (
                <div className="case-meta-item">
                  <div className="case-meta-label">Impact</div>
                  <div className="case-meta-value">
                    {project.meta.impact.map((item, i) => <div key={i}>{item}</div>)}
                  </div>
                </div>
              )}
            </div>
            <div className="case-meta-col">
              <div className="case-meta-item">
                <div className="case-meta-label">Role</div>
                <div className="case-meta-value">{project.meta.role}</div>
              </div>
              <div className="case-meta-item">
                <div className="case-meta-label">Stakeholders</div>
                <div className="case-meta-value">{project.meta.stakeholders}</div>
              </div>
              <div className="case-meta-item">
                <div className="case-meta-label">Timeline</div>
                <div className="case-meta-value">{project.meta.timeline}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="divider"><hr className="divider-line" /></div>

        {/* Content sections (background, context, problem, goal) — before challenges */}
        {project.sections.filter(s => s.type !== 'solution-row').map((section) => {
          switch (section.type) {
            case 'content-section':
            case 'content-subsection':
              return (
                <div key={section.id} className="case-section-full">
                  <div className="section-label-sm">{section.label}</div>
                  <div className="section-title-lg">{section.title}</div>
                  <div className="section-body"><p>{section.body}</p></div>
                </div>
              )
            case 'problem-banner':
              return (
                <div key={section.id} className="problem-banner">
                  <div className="problem-label">{section.label}</div>
                  <div className="problem-text">{section.text}</div>
                </div>
              )
            case 'goal':
              return (
                <div key={section.id || 'goal'} className="goal-section">
                  <div className="goal-col-label">
                    <div className="section-label-sm">Goal</div>
                  </div>
                  <div className="goal-col-content">
                    {section.items.map((g, i) => (
                      <div key={i} className="goal-item-block">
                        <div className="goal-item-title">{g.title}</div>
                        <div className="goal-item-desc">{g.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            default:
              return null
          }
        })}

        {/* Discovery section */}
        {project.discovery?.sections?.length > 0 && (
          <>
            <div
              id="Discovery"
              ref={assignRef('Discovery')}
              className="challenge-banner section-anchor"
            >
              <div className="challenge-banner-inner">
                <div className="challenge-label" style={{ fontSize: 28, color: '#fff' }}>
                  Discovery
                </div>
              </div>
            </div>

            <div className="case-content-padded">
              {project.discovery.sections.map((ds, i) => (
                <div key={i} className="content-slide">
                  <div className="slide-text">
                    <div className="slide-label">{ds.label}</div>
                    <div className="slide-title"><strong>{ds.title}</strong></div>
                    <div className="slide-body"><p>{ds.body}</p></div>
                  </div>
                  <div className="slide-image">
                    <Img src={ds.image} alt={ds.title} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Challenge banners, each followed by its solution-row */}
        {project.challenges?.map((challenge, cIdx) => {
          const designId = `Design-${cIdx + 1}`
          const solution = project.sections.find(s => s.id === `solution-${cIdx + 1}`)

          return (
            <div key={cIdx}>
              <div
                id={designId}
                ref={assignRef(designId)}
                className="challenge-banner section-anchor"
              >
                <div className="challenge-banner-inner">
                  <div className="challenge-label">{challenge.label}</div>
                  <div className="challenge-title">{challenge.title}</div>
                </div>
              </div>

              {/* Solution for this challenge */}
              {solution && (
                <div className={`solution-row${solution.reverse ? ' reverse' : ''}`}>
                  <div className="solution-image">
                    <Img src={solution.image} alt={solution.title} />
                  </div>
                  <div className="solution-text">
                    <div className="solution-tag">{solution.tag}</div>
                    <div className="solution-title">{solution.title}</div>
                    <div className="solution-desc">{solution.desc}</div>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Delivery section */}
        {project.delivery?.metrics?.length > 0 && (
          <>
            <div
              id="Result"
              ref={assignRef('Result')}
              className="challenge-banner section-anchor"
            >
              <div className="challenge-banner-inner">
                <div className="challenge-label" style={{ fontSize: 28, color: '#fff' }}>
                  Delivery
                </div>
              </div>
            </div>

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
          </>
        )}
      </div>

      <Footer />
    </>
  )
}