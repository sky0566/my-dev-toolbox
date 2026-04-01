import { Link } from 'react-router-dom'
import { useConfig } from '../context/ConfigContext'

export function LogoSvg({ text }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:36,height:36}}>
      <rect width="36" height="36" rx="8" fill="#6065d7"/>
      <text x="6" y="25" fill="#fff" fontFamily="'Plus Jakarta Sans',sans-serif" fontSize="16" fontWeight="700">{text || 'LH'}</text>
    </svg>
  )
}

export default function Nav() {
  const { config, projects } = useConfig()
  const navProjects = projects.filter(p => p.hasFullProject)
  return (
    <nav className="nav">
      <Link to="/" className="nav-logo"><LogoSvg text={config.logoText} /></Link>
      <div className="nav-links">
        <Link to="/">Home</Link>
        {navProjects.slice(0, 3).map(p => (
          <Link key={p.id} to={p.needsPassword ? `/work/${p.id}` : `/work/${p.id}/full`}>{p.title}</Link>
        ))}
        <a href={`mailto:${config.email}`}>Contact</a>
      </div>
    </nav>
  )
}