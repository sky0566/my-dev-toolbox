import { Link } from 'react-router-dom'
import { useConfig } from '../context/ConfigContext'

export default function WorkGrid() {
  const { projects } = useConfig()
  return (
    <div className="project-container">
      <h2>Selected Work</h2>
      {projects.map((p, i) => {
        const isReverse = i % 2 === 1
        const inner = (
          <div className={`project-item${isReverse ? ' reverse' : ''}`}>
            <div className="project-content">
              <div className="project-title"><strong>{p.title}</strong></div>
              <div className="project-desc">{p.subtitle}</div>
              <div className="tag-group">
                {p.tags.map(t => <div key={t} className="tag"><span>{t}</span></div>)}
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

        if (p.externalLink) {
          return <a key={p.id} href={p.externalLink} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}>{inner}</a>
        }
        if (p.needsPassword) {
          return <Link key={p.id} to={`/work/${p.id}`} style={{textDecoration:'none'}}>{inner}</Link>
        }
        const dest = p.hasFullProject ? `/work/${p.id}/full` : `/work/${p.id}`
        return <Link key={p.id} to={dest} style={{textDecoration:'none'}}>{inner}</Link>
      })}
    </div>
  )
}