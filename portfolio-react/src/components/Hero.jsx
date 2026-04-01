import { useConfig } from '../context/ConfigContext'

export default function Hero() {
  const { config } = useConfig()
  return (
    <section className="hero">
      <div className="hero-greeting">
        <span>{config.greeting}</span>
      </div>
      <div className="hero-desc">
        {config.bio}
      </div>
      <div className="hero-badges">
        <div className="hero-badge">
          <div className="hero-badge-icon">
            <svg viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="14" rx="3" stroke="#304578" strokeWidth="1.5"/><path d="M6 9h6M9 6v6" stroke="#304578" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div className="hero-badge-text">{config.badge1}</div>
        </div>
        <div className="hero-badge">
          <div className="hero-badge-icon">
            <svg viewBox="0 0 18 18" fill="none"><circle cx="9" cy="7" r="3" stroke="#304578" strokeWidth="1.5"/><path d="M3 16c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#304578" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div className="hero-badge-text">{config.badge2}</div>
        </div>
      </div>
    </section>
  )
}