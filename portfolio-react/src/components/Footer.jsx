import { Link } from 'react-router-dom'
import { LogoSvg } from './Nav'
import { useConfig } from '../context/ConfigContext'

export default function Footer() {
  const { config } = useConfig()
  return (
    <footer className="site-footer">
      <div className="footer-cta">
        <h3>{config.footerHeading}</h3>
        <p>{config.footerText}</p>
        <a href={`mailto:${config.email}`} className="email-link">
          {config.email}
        </a>
      </div>
      <div className="footer-bottom">
        <div className="footer-logo">
          <Link to="/"><LogoSvg text={config.logoText} /></Link>
        </div>
        <div className="footer-links-bottom">
          <a href={config.linkedinUrl} target="_blank" rel="noopener noreferrer">Linkedin</a>
          <a href={`mailto:${config.email}`}>Mailbox</a>
        </div>
      </div>
    </footer>
  )
}