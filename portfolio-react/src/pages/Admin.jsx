rt { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useConfig } from '../context/ConfigContext'
import { exportAllData, importAllData } from '../data/siteConfig'
import Hero from '../components/Hero'
import Footer from '../components/Footer'
import Nav from '../components/Nav'

export default function Admin() {
  const { config, updateConfig, projects, updateProjects, resetProjects, resetConfig, defaultProjects } = useConfig()
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)
  const [tab, setTab] = useState('site')
  const [editIdx, setEditIdx] = useState(null)
  const [editorSubTab, setEditorSubTab] = useState('basic')
  const [toast, setToast] = useState('')

  const fileRef = useRef()

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2000) }

  // ── Auth gate ──
  if (!authed) {
    return (
      <div className="admin-wrap">
        <div className="admin-login">
          <h2>🔐 Admin Panel</h2>
          <p>Enter the admin password to continue.</p>
          <form onSubmit={e => { e.preventDefault(); if (pw === config.adminPassword) { setAuthed(true) } else { setPwError(true) } }}>
            <input type="password" value={pw} onChange={e => { setPw(e.target.value); setPwError(false) }}
              placeholder="Password" autoFocus className={pwError ? 'error' : ''} />
            <button type="submit">Enter</button>
          </form>
          {pwError && <div className="admin-error">Incorrect password</div>}
          <Link to="/" className="admin-back">← Back to portfolio</Link>
        </div>
      </div>
    )
  }

  // ── Handlers ──
  const handleConfigChange = (key, value) => updateConfig({ ...config, [key]: value })

  const handleProjectField = (idx, key, value) => {
    const copy = projects.map((p, i) => i === idx ? { ...p, [key]: value } : p)
    updateProjects(copy)
  }

  const handleMetaField = (idx, key, value) => {
    const copy = projects.map((p, i) => i === idx ? { ...p, meta: { ...p.meta, [key]: value } } : p)
    updateProjects(copy)
  }

  const handleExport = () => {
    const blob = new Blob([exportAllData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'portfolio-config.json'; a.click()
    URL.revokeObjectURL(url)
    showToast('Exported!')
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        importAllData(ev.target.result)
        window.location.reload()
      } catch { showToast('Invalid JSON file') }
    }
    reader.readAsText(file)
  }

  const moveProject = (idx, dir) => {
    const copy = [...projects]
    const target = idx + dir
    if (target < 0 || target >= copy.length) return
    ;[copy[idx], copy[target]] = [copy[target], copy[idx]]
    updateProjects(copy)
    setEditIdx(target)
  }

  const deleteProject = (idx) => {
    updateProjects(projects.filter((_, i) => i !== idx))
    setEditIdx(null)
    showToast('Deleted')
  }

  const addProject = () => {
    const newP = {
      id: 'new-project-' + Date.now(),
      title: 'New Project',
      company: 'Company Name',
      subtitle: 'Project description...',
      tags: ['Tag'],
      cardImage: '',
      cardBg: 'bg-blue',
      ctaStyle: 'purple',
      ctaText: 'View Project',
      needsPassword: false,
      hasFullProject: false,
      sidebarLinks: [],
      heroImage: '',
      meta: { overview: '', impact: [], role: '', stakeholders: '', timeline: '' },
      sections: [],
      discovery: { sections: [] },
      challenges: [],
      delivery: { metrics: [] },
    }
    updateProjects([...projects, newP])
    setEditIdx(projects.length)
    showToast('Project added')
  }

  // ── Render ──

  // Build preview content based on current tab + editor sub-tab
  const buildPreview = () => {
    if (tab === 'site') {
      return (
        <div className="admin-preview-scale">
          <Nav />
          <div className="page-shell" style={{ maxWidth: '100%' }}>
            <Hero />
          </div>
          <Footer />
        </div>
      )
    }

    // Projects tab — no project selected: show card list
    if (editIdx === null || editIdx >= projects.length) {
      return (
        <div className="admin-preview-scale">
          <div className="project-container" style={{ padding: '24px' }}>
            {projects.map((p, i) => {
              const isReverse = i % 2 === 1
              return (
                <div key={p.id} className={`project-item${isReverse ? ' reverse' : ''}`}>
                  <div className="project-content">
                    <div className="project-title"><strong>{p.title}</strong></div>
                    <div className="project-desc">{p.subtitle}</div>
                    <div className="tag-group">
                      {(p.tags || []).map(t => <div key={t} className="tag"><span>{t}</span></div>)}
                    </div>
                    <span className={`project-cta ${p.ctaStyle}`}>{p.ctaText}</span>
                  </div>
                  <div className={`project-image ${p.cardBg}`}>
                    {p.cardImage
                      ? <img src={p.cardImage} alt={p.title} loading="lazy" />
                      : <div className="img-placeholder">[ {p.title} ]</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    // A project is selected — show contextual preview based on editor sub-tab
    const p = projects[editIdx]
    const Img = ({ src, alt }) => src ? <img src={src} alt={alt || ''} loading="lazy" /> : <div className="img-placeholder">[ {alt} ]</div>

    // Basic tab: card + hero + meta
    if (editorSubTab === 'basic') {
      return (
        <div className="admin-preview-scale">
          <div className="project-container" style={{ padding: '24px' }}>
            <div className={`project-item`} style={{ outline: '3px solid #5f63b1', outlineOffset: 2 }}>
              <div className="project-content">
                <div className="project-title"><strong>{p.title}</strong></div>
                <div className="project-desc">{p.subtitle}</div>
                <div className="tag-group">
                  {(p.tags || []).map(t => <div key={t} className="tag"><span>{t}</span></div>)}
                </div>
                <span className={`project-cta ${p.ctaStyle}`}>{p.ctaText}</span>
              </div>
              <div className={`project-image ${p.cardBg}`}>
                {p.cardImage ? <img src={p.cardImage} alt={p.title} loading="lazy" /> : <div className="img-placeholder">[ {p.title} ]</div>}
              </div>
            </div>
          </div>
          <div className="case-top" style={{ padding: '40px 30px 30px' }}>
            <div className="case-hero-grid">
              <div className="case-hero-info">
                <div>
                  <div className="case-hero-company">{p.company}</div>
                  <div className="case-hero-title">{p.title}</div>
                </div>
                <div className="tag-group">
                  {(p.tags || []).map(t => <div key={t} className="tag"><span>{t}</span></div>)}
                </div>
              </div>
              <div className="case-hero-image"><Img src={p.heroImage} alt={p.title} /></div>
            </div>
            <div className="case-meta-grid">
              <div className="case-meta-col">
                <div className="case-meta-item"><div className="case-meta-label">Overview</div><div className="case-meta-value">{p.meta?.overview}</div></div>
              </div>
              <div className="case-meta-col">
                <div className="case-meta-item"><div className="case-meta-label">Role</div><div className="case-meta-value">{p.meta?.role}</div></div>
                <div className="case-meta-item"><div className="case-meta-label">Timeline</div><div className="case-meta-value">{p.meta?.timeline}</div></div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Sections tab: show all content sections
    if (editorSubTab === 'sections') {
      return (
        <div className="admin-preview-scale">
          <div style={{ padding: '24px', maxWidth: 1440, margin: '0 auto' }}>
            {(p.sections || []).filter(s => s.type !== 'solution-row').map((sec) => {
              if (sec.type === 'content-section' || sec.type === 'content-subsection') {
                return (
                  <div key={sec.id} className="case-section-full">
                    <div className="section-label-sm">{sec.label}</div>
                    <div className="section-title-lg">{sec.title}</div>
                    <div className="section-body"><p>{sec.body}</p></div>
                  </div>
                )
              }
              if (sec.type === 'problem-banner') {
                return (
                  <div key={sec.id} className="problem-banner">
                    <div className="problem-label">{sec.label}</div>
                    <div className="problem-text">{sec.text}</div>
                  </div>
                )
              }
              if (sec.type === 'goal') {
                return (
                  <div key={sec.id || 'goal'} className="goal-section">
                    <div className="goal-col-label"><div className="section-label-sm">Goal</div></div>
                    <div className="goal-col-content">
                      {(sec.items || []).map((g, i) => (
                        <div key={i} className="goal-item-block">
                          <div className="goal-item-title">{g.title}</div>
                          <div className="goal-item-desc">{g.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }
              return null
            })}
            {(p.sections || []).filter(s => s.type === 'solution-row').map((sol) => (
              <div key={sol.id} className={`solution-row${sol.reverse ? ' reverse' : ''}`}>
                <div className="solution-image"><Img src={sol.image} alt={sol.title} /></div>
                <div className="solution-text">
                  <div className="solution-tag">{sol.tag}</div>
                  <div className="solution-title">{sol.title}</div>
                  <div className="solution-desc">{sol.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    // Discovery tab
    if (editorSubTab === 'discovery') {
      return (
        <div className="admin-preview-scale">
          <div style={{ padding: '24px', maxWidth: 1440, margin: '0 auto' }}>
            <div className="challenge-banner">
              <div className="challenge-banner-inner">
                <div className="challenge-label" style={{ fontSize: 28, color: '#fff' }}>Discovery</div>
              </div>
            </div>
            <div className="case-content-padded">
              {(p.discovery?.sections || []).map((ds, i) => (
                <div key={i} className="content-slide">
                  <div className="slide-text">
                    <div className="slide-label">{ds.label}</div>
                    <div className="slide-title"><strong>{ds.title}</strong></div>
                    <div className="slide-body"><p>{ds.body}</p></div>
                  </div>
                  <div className="slide-image"><Img src={ds.image} alt={ds.title} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    // Challenges tab
    if (editorSubTab === 'challenges') {
      return (
        <div className="admin-preview-scale">
          <div style={{ padding: '24px', maxWidth: 1440, margin: '0 auto' }}>
            {(p.challenges || []).map((ch, cIdx) => {
              const sol = (p.sections || []).find(s => s.id === `solution-${cIdx + 1}`)
              return (
                <div key={cIdx}>
                  <div className="challenge-banner">
                    <div className="challenge-banner-inner">
                      <div className="challenge-label">{ch.label}</div>
                      <div className="challenge-title">{ch.title}</div>
                    </div>
                  </div>
                  {sol && (
                    <div className={`solution-row${sol.reverse ? ' reverse' : ''}`}>
                      <div className="solution-image"><Img src={sol.image} alt={sol.title} /></div>
                      <div className="solution-text">
                        <div className="solution-tag">{sol.tag}</div>
                        <div className="solution-title">{sol.title}</div>
                        <div className="solution-desc">{sol.desc}</div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    // Delivery tab
    if (editorSubTab === 'delivery') {
      return (
        <div className="admin-preview-scale">
          <div style={{ maxWidth: 1440, margin: '0 auto' }}>
            <div className="challenge-banner">
              <div className="challenge-banner-inner">
                <div className="challenge-label" style={{ fontSize: 28, color: '#fff' }}>Delivery</div>
              </div>
            </div>
            {(p.delivery?.metrics || []).length > 0 && (
              <div className="metrics-section">
                <div className="metrics-wrapper">
                  {p.delivery.metrics.map((m, mi) => (
                    <div key={mi} className="metric-block">
                      <div className="metric-number">{m.number}<small>{m.unit}</small></div>
                      <div className="metric-label">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }

    return null
  }

  const previewContent = buildPreview()

  return (
    <div className="admin-wrap">
      <div className="admin-header">
        <Link to="/" className="admin-back">← Back to portfolio</Link>
        <h1>Admin Panel</h1>
        <div className="admin-actions">
          <button className="btn-secondary" onClick={handleExport}>Export JSON</button>
          <button className="btn-secondary" onClick={() => fileRef.current?.click()}>Import JSON</button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} hidden />
        </div>
      </div>

      {toast && <div className="admin-toast">{toast}</div>}

      <div className="admin-tabs">
        <button className={tab === 'site' ? 'active' : ''} onClick={() => setTab('site')}>Site Settings</button>
        <button className={tab === 'projects' ? 'active' : ''} onClick={() => setTab('projects')}>Projects</button>
      </div>

      <div className="admin-split">
        {/* ═══ Left: Editor ═══ */}
        <div className="admin-split-editor">

          {/* Site Settings Tab */}
          {tab === 'site' && (
            <>
              <SectionTitle title="Hero Section" />
              <Field label="Greeting" value={config.greeting} onChange={v => handleConfigChange('greeting', v)} />
              <Field label="Bio / Description" value={config.bio} onChange={v => handleConfigChange('bio', v)} multiline />
              <Field label="Badge 1 Text" value={config.badge1} onChange={v => handleConfigChange('badge1', v)} />
              <Field label="Badge 2 Text" value={config.badge2} onChange={v => handleConfigChange('badge2', v)} />

              <SectionTitle title="Contact & Links" />
              <Field label="Email" value={config.email} onChange={v => handleConfigChange('email', v)} />
              <Field label="LinkedIn URL" value={config.linkedinUrl} onChange={v => handleConfigChange('linkedinUrl', v)} />

              <SectionTitle title="Footer" />
              <Field label="Footer Heading" value={config.footerHeading} onChange={v => handleConfigChange('footerHeading', v)} />
              <Field label="Footer Text" value={config.footerText} onChange={v => handleConfigChange('footerText', v)} multiline />

              <SectionTitle title="Branding" />
              <Field label="Logo Text (2 chars)" value={config.logoText} onChange={v => handleConfigChange('logoText', v)} />
              <Field label="Page Title" value={config.pageTitle} onChange={v => handleConfigChange('pageTitle', v)} />

              <SectionTitle title="Security" />
              <Field label="Admin / Case Study Password" value={config.adminPassword} onChange={v => handleConfigChange('adminPassword', v)} />

              <div className="admin-row">
                <button className="btn-danger" onClick={() => { resetConfig(); showToast('Reset to defaults') }}>Reset Site Settings</button>
              </div>
            </>
          )}

          {/* Projects Tab */}
          {tab === 'projects' && (
            <>
              <div className="admin-project-list">
                {projects.map((p, i) => (
                  <div key={p.id} className={`admin-project-card${editIdx === i ? ' editing' : ''}`} onClick={() => setEditIdx(editIdx === i ? null : i)}>
                    <div className="admin-project-card-header">
                      <strong>{p.title}</strong>
                      <span className="admin-project-company">{p.company}</span>
                    </div>
                    <div className="admin-project-badges">
                      {p.needsPassword && <span className="badge-pw">🔒</span>}
                      {p.hasFullProject && <span className="badge-full">Full</span>}
                    </div>
                  </div>
                ))}
                <button className="btn-primary admin-add-btn" onClick={addProject}>+ Add Project</button>
              </div>

              {editIdx !== null && editIdx < projects.length && (
                <ProjectEditor
                  project={projects[editIdx]}
                  idx={editIdx}
                  total={projects.length}
                  onChange={handleProjectField}
                  onMetaChange={handleMetaField}
                  onMove={moveProject}
                  onDelete={deleteProject}
                  onUpdateProjects={updateProjects}
                  projects={projects}
                  editorTab={editorSubTab}
                  onEditorTabChange={setEditorSubTab}
                />
              )}

              <div className="admin-row" style={{ marginTop: 24 }}>
                <button className="btn-danger" onClick={() => { resetProjects(); setEditIdx(null); showToast('Reset to defaults') }}>
                  Reset All Projects
                </button>
              </div>
            </>
          )}
        </div>

        {/* ═══ Right: Preview ═══ */}
        <div className="admin-split-preview">
          <div className="admin-preview-label">Live Preview</div>
          <div className="admin-preview-frame">
            {previewContent}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Reusable field component ──
function Field({ label, value, onChange, multiline, placeholder }) {
  return (
    <div className="admin-field">
      <label>{label}</label>
      {multiline
        ? <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} />
        : <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      }
    </div>
  )
}

function SectionTitle({ title }) {
  return <h3 className="admin-section-title">{title}</h3>
}

// ── Project Editor ──
function ProjectEditor({ project, idx, total, onChange, onMetaChange, onMove, onDelete, onUpdateProjects, projects, editorTab, onEditorTabChange }) {
  const tab = editorTab || 'basic'
  const setTab = onEditorTabChange

  const handleTagsChange = (val) => {
    onChange(idx, 'tags', val.split(',').map(t => t.trim()).filter(Boolean))
  }

  const handleImpactChange = (val) => {
    onMetaChange(idx, 'impact', val.split('\n').filter(Boolean))
  }

  const handleSidebarChange = (val) => {
    onChange(idx, 'sidebarLinks', val.split(',').map(t => t.trim()).filter(Boolean))
  }

  // Generic deep updater
  const updateProject = (patch) => {
    const copy = projects.map((p, i) => i === idx ? { ...p, ...patch } : p)
    onUpdateProjects(copy)
  }

  // ─ Metrics ─
  const handleMetricField = (mIdx, key, val) => {
    const metrics = [...(project.delivery?.metrics || [])]
    metrics[mIdx] = { ...metrics[mIdx], [key]: val }
    updateProject({ delivery: { ...project.delivery, metrics } })
  }
  const addMetric = () => {
    const metrics = [...(project.delivery?.metrics || []), { number: '0', unit: '%', label: 'New Metric' }]
    updateProject({ delivery: { ...project.delivery, metrics } })
  }
  const removeMetric = (mIdx) => {
    const metrics = (project.delivery?.metrics || []).filter((_, i) => i !== mIdx)
    updateProject({ delivery: { ...project.delivery, metrics } })
  }

  // ─ Sections ─
  const updateSection = (sIdx, patch) => {
    const sections = project.sections.map((s, i) => i === sIdx ? { ...s, ...patch } : s)
    updateProject({ sections })
  }
  const addSection = (type) => {
    const id = type + '-' + Date.now()
    let newSec
    if (type === 'content-section' || type === 'content-subsection') {
      newSec = { id, type, label: 'Label', title: 'Title', body: 'Body text...' }
    } else if (type === 'problem-banner') {
      newSec = { id, type, label: 'Problem', text: 'Problem statement...' }
    } else if (type === 'goal') {
      newSec = { id, type, items: [{ title: 'Goal', desc: 'Description' }] }
    } else if (type === 'solution-row') {
      newSec = { id, type, tag: 'Solution', title: 'Title', desc: 'Description', reverse: false, image: '' }
    }
    updateProject({ sections: [...(project.sections || []), newSec] })
  }
  const removeSection = (sIdx) => {
    updateProject({ sections: project.sections.filter((_, i) => i !== sIdx) })
  }
  const moveSection = (sIdx, dir) => {
    const arr = [...project.sections]
    const t = sIdx + dir
    if (t < 0 || t >= arr.length) return
    ;[arr[sIdx], arr[t]] = [arr[t], arr[sIdx]]
    updateProject({ sections: arr })
  }

  // ─ Discovery ─
  const updateDiscovery = (dIdx, patch) => {
    const sections = (project.discovery?.sections || []).map((s, i) => i === dIdx ? { ...s, ...patch } : s)
    updateProject({ discovery: { ...project.discovery, sections } })
  }
  const addDiscovery = () => {
    const sections = [...(project.discovery?.sections || []), { label: 'Discovery', title: 'Title', body: 'Body...', image: '' }]
    updateProject({ discovery: { ...project.discovery, sections } })
  }
  const removeDiscovery = (dIdx) => {
    const sections = (project.discovery?.sections || []).filter((_, i) => i !== dIdx)
    updateProject({ discovery: { ...project.discovery, sections } })
  }

  // ─ Challenges ─
  const updateChallenge = (cIdx, patch) => {
    const challenges = (project.challenges || []).map((c, i) => i === cIdx ? { ...c, ...patch } : c)
    updateProject({ challenges })
  }
  const addChallenge = () => {
    updateProject({ challenges: [...(project.challenges || []), { label: 'Challenge', title: 'How might we...?' }] })
  }
  const removeChallenge = (cIdx) => {
    updateProject({ challenges: (project.challenges || []).filter((_, i) => i !== cIdx) })
  }

  // ─ Goal items ─
  const updateGoalItem = (sIdx, gIdx, patch) => {
    const sec = project.sections[sIdx]
    const items = sec.items.map((g, i) => i === gIdx ? { ...g, ...patch } : g)
    updateSection(sIdx, { items })
  }
  const addGoalItem = (sIdx) => {
    const sec = project.sections[sIdx]
    updateSection(sIdx, { items: [...sec.items, { title: 'New Goal', desc: 'Description' }] })
  }
  const removeGoalItem = (sIdx, gIdx) => {
    const sec = project.sections[sIdx]
    updateSection(sIdx, { items: sec.items.filter((_, i) => i !== gIdx) })
  }

  const editorTabs = [
    { key: 'basic', label: 'Basic' },
    { key: 'sections', label: `Sections (${(project.sections || []).length})` },
    { key: 'discovery', label: `Discovery (${(project.discovery?.sections || []).length})` },
    { key: 'challenges', label: `Challenges (${(project.challenges || []).length})` },
    { key: 'delivery', label: 'Delivery' },
  ]

  return (
    <div className="admin-project-editor">
      <div className="admin-editor-toolbar">
        <h3>Editing: {project.title}</h3>
        <div>
          <button className="btn-sm" onClick={() => onMove(idx, -1)} disabled={idx === 0}>↑</button>
          <button className="btn-sm" onClick={() => onMove(idx, 1)} disabled={idx === total - 1}>↓</button>
          <button className="btn-sm btn-danger" onClick={() => onDelete(idx)}>Delete</button>
        </div>
      </div>

      {/* Sub-tabs within editor */}
      <div className="admin-editor-tabs">
        {editorTabs.map(t => (
          <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {/* ── Basic Tab ── */}
      {tab === 'basic' && (
        <>
          <SectionTitle title="Basic Info" />
          <Field label="ID (URL slug)" value={project.id} onChange={v => onChange(idx, 'id', v)} />
          <Field label="Title" value={project.title} onChange={v => onChange(idx, 'title', v)} />
          <Field label="Company" value={project.company} onChange={v => onChange(idx, 'company', v)} />
          <Field label="Subtitle" value={project.subtitle} onChange={v => onChange(idx, 'subtitle', v)} multiline />
          <Field label="Tags (comma-separated)" value={(project.tags || []).join(', ')} onChange={handleTagsChange} />

          <SectionTitle title="Display" />
          <div className="admin-field">
            <label>Card Background</label>
            <select value={project.cardBg || 'bg-blue'} onChange={e => onChange(idx, 'cardBg', e.target.value)}>
              <option value="bg-blue">Blue</option>
              <option value="bg-indigo">Indigo</option>
              <option value="bg-teal">Teal</option>
              <option value="bg-peach">Peach</option>
            </select>
          </div>
          <div className="admin-field">
            <label>CTA Style</label>
            <select value={project.ctaStyle || 'purple'} onChange={e => onChange(idx, 'ctaStyle', e.target.value)}>
              <option value="purple">Purple Button</option>
              <option value="blue">Blue Button</option>
              <option value="text-link">Text Link</option>
            </select>
          </div>
          <Field label="CTA Text" value={project.ctaText} onChange={v => onChange(idx, 'ctaText', v)} />
          <Field label="Card Image URL" value={project.cardImage} onChange={v => onChange(idx, 'cardImage', v)} />
          <Field label="Hero Image URL" value={project.heroImage} onChange={v => onChange(idx, 'heroImage', v)} />

          <SectionTitle title="Access" />
          <div className="admin-field">
            <label>
              <input type="checkbox" checked={project.needsPassword || false} onChange={e => onChange(idx, 'needsPassword', e.target.checked)} />
              {' '}Password Protected
            </label>
          </div>
          <div className="admin-field">
            <label>
              <input type="checkbox" checked={project.hasFullProject || false} onChange={e => onChange(idx, 'hasFullProject', e.target.checked)} />
              {' '}Has Full Case Study
            </label>
          </div>
          <Field label="External Link (optional)" value={project.externalLink} onChange={v => onChange(idx, 'externalLink', v)} />

          <SectionTitle title="Meta / Summary" />
          <Field label="Overview" value={project.meta?.overview} onChange={v => onMetaChange(idx, 'overview', v)} multiline />
          <Field label="Role" value={project.meta?.role} onChange={v => onMetaChange(idx, 'role', v)} />
          <Field label="Stakeholders" value={project.meta?.stakeholders} onChange={v => onMetaChange(idx, 'stakeholders', v)} />
          <Field label="Timeline" value={project.meta?.timeline} onChange={v => onMetaChange(idx, 'timeline', v)} />
          <Field label="Impact (one per line)" value={(project.meta?.impact || []).join('\n')} onChange={handleImpactChange} multiline />

          <SectionTitle title="NDA Summary Page" />
          <p className="admin-hint">These fields appear on the summary page for password-protected projects.</p>
          <Field label="Summary Description" value={project.summaryDesc} onChange={v => onChange(idx, 'summaryDesc', v)} multiline />
          <Field label="Summary Delivery" value={project.summaryDelivery} onChange={v => onChange(idx, 'summaryDelivery', v)} multiline />
          <Field label="Summary Takeaway" value={project.summaryTakeaway} onChange={v => onChange(idx, 'summaryTakeaway', v)} multiline />

          <SectionTitle title="Navigation" />
          <Field label="Sidebar Links (comma-separated, leave empty for auto)" value={(project.sidebarLinks || []).join(', ')} onChange={handleSidebarChange} placeholder="Discovery, Design 1, Design 2, Result" />
        </>
      )}

      {/* ── Sections Tab ── */}
      {tab === 'sections' && (
        <>
          <p className="admin-hint">Content sections shown on the full case study page (background, context, problem banners, goals, solutions).</p>
          {(project.sections || []).map((sec, sIdx) => (
            <div key={sIdx} className="admin-card">
              <div className="admin-card-header">
                <span className="admin-card-type">{sec.type}</span>
                <div>
                  <button className="btn-sm" onClick={() => moveSection(sIdx, -1)} disabled={sIdx === 0}>↑</button>
                  <button className="btn-sm" onClick={() => moveSection(sIdx, 1)} disabled={sIdx === (project.sections || []).length - 1}>↓</button>
                  <button className="btn-sm btn-danger" onClick={() => removeSection(sIdx)}>×</button>
                </div>
              </div>

              {(sec.type === 'content-section' || sec.type === 'content-subsection') && (
                <>
                  <Field label="Label" value={sec.label} onChange={v => updateSection(sIdx, { label: v })} />
                  <Field label="Title" value={sec.title} onChange={v => updateSection(sIdx, { title: v })} />
                  <Field label="Body" value={sec.body} onChange={v => updateSection(sIdx, { body: v })} multiline />
                </>
              )}

              {sec.type === 'problem-banner' && (
                <>
                  <Field label="Label" value={sec.label} onChange={v => updateSection(sIdx, { label: v })} />
                  <Field label="Text" value={sec.text} onChange={v => updateSection(sIdx, { text: v })} multiline />
                </>
              )}

              {sec.type === 'goal' && (
                <>
                  {(sec.items || []).map((g, gIdx) => (
                    <div key={gIdx} className="admin-card-nested">
                      <div className="admin-card-header">
                        <span>Goal {gIdx + 1}</span>
                        <button className="btn-sm btn-danger" onClick={() => removeGoalItem(sIdx, gIdx)}>×</button>
                      </div>
                      <Field label="Title" value={g.title} onChange={v => updateGoalItem(sIdx, gIdx, { title: v })} />
                      <Field label="Description" value={g.desc} onChange={v => updateGoalItem(sIdx, gIdx, { desc: v })} multiline />
                    </div>
                  ))}
                  <button className="btn-sm" onClick={() => addGoalItem(sIdx)}>+ Add Goal</button>
                </>
              )}

              {sec.type === 'solution-row' && (
                <>
                  <Field label="ID" value={sec.id} onChange={v => updateSection(sIdx, { id: v })} placeholder="solution-1" />
                  <Field label="Tag" value={sec.tag} onChange={v => updateSection(sIdx, { tag: v })} />
                  <Field label="Title" value={sec.title} onChange={v => updateSection(sIdx, { title: v })} />
                  <Field label="Description" value={sec.desc} onChange={v => updateSection(sIdx, { desc: v })} multiline />
                  <Field label="Image URL" value={sec.image} onChange={v => updateSection(sIdx, { image: v })} />
                  <div className="admin-field">
                    <label>
                      <input type="checkbox" checked={sec.reverse || false} onChange={e => updateSection(sIdx, { reverse: e.target.checked })} />
                      {' '}Reverse Layout
                    </label>
                  </div>
                </>
              )}
            </div>
          ))}

          <div className="admin-add-section-row">
            <button className="btn-sm" onClick={() => addSection('content-section')}>+ Content</button>
            <button className="btn-sm" onClick={() => addSection('problem-banner')}>+ Problem</button>
            <button className="btn-sm" onClick={() => addSection('goal')}>+ Goal</button>
            <button className="btn-sm" onClick={() => addSection('solution-row')}>+ Solution</button>
          </div>
        </>
      )}

      {/* ── Discovery Tab ── */}
      {tab === 'discovery' && (
        <>
          <p className="admin-hint">Discovery slides shown after the content sections. Each has a text block + image.</p>
          {(project.discovery?.sections || []).map((ds, dIdx) => (
            <div key={dIdx} className="admin-card">
              <div className="admin-card-header">
                <span>Discovery {dIdx + 1}</span>
                <button className="btn-sm btn-danger" onClick={() => removeDiscovery(dIdx)}>×</button>
              </div>
              <Field label="Label" value={ds.label} onChange={v => updateDiscovery(dIdx, { label: v })} />
              <Field label="Title" value={ds.title} onChange={v => updateDiscovery(dIdx, { title: v })} />
              <Field label="Body" value={ds.body} onChange={v => updateDiscovery(dIdx, { body: v })} multiline />
              <Field label="Image URL" value={ds.image} onChange={v => updateDiscovery(dIdx, { image: v })} />
            </div>
          ))}
          <button className="btn-sm" onClick={addDiscovery}>+ Add Discovery Slide</button>
        </>
      )}

      {/* ── Challenges Tab ── */}
      {tab === 'challenges' && (
        <>
          <p className="admin-hint">Challenge banners shown as full-width sections. Each challenge pairs with a solution-row section (matching id: solution-1, solution-2, etc).</p>
          {(project.challenges || []).map((ch, cIdx) => (
            <div key={cIdx} className="admin-card">
              <div className="admin-card-header">
                <span>Challenge {cIdx + 1}</span>
                <button className="btn-sm btn-danger" onClick={() => removeChallenge(cIdx)}>×</button>
              </div>
              <Field label="Label" value={ch.label} onChange={v => updateChallenge(cIdx, { label: v })} />
              <Field label="Title" value={ch.title} onChange={v => updateChallenge(cIdx, { title: v })} multiline />
            </div>
          ))}
          <button className="btn-sm" onClick={addChallenge}>+ Add Challenge</button>
        </>
      )}

      {/* ── Delivery Tab ── */}
      {tab === 'delivery' && (
        <>
          <SectionTitle title="Delivery Metrics" />
          {(project.delivery?.metrics || []).map((m, mIdx) => (
            <div key={mIdx} className="admin-metric-row">
              <input value={m.number} onChange={e => handleMetricField(mIdx, 'number', e.target.value)} placeholder="Number" style={{ width: 80 }} />
              <input value={m.unit} onChange={e => handleMetricField(mIdx, 'unit', e.target.value)} placeholder="Unit" style={{ width: 60 }} />
              <input value={m.label} onChange={e => handleMetricField(mIdx, 'label', e.target.value)} placeholder="Label" style={{ flex: 1 }} />
              <button className="btn-sm btn-danger" onClick={() => removeMetric(mIdx)}>×</button>
            </div>
          ))}
          <button className="btn-sm" onClick={addMetric}>+ Add Metric</button>
        </>
      )}
    </div>
  )
}
