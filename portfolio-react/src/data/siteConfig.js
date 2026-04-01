// Default site configuration — all hardcoded strings centralized here
export const defaultSiteConfig = {
  // Hero section
  greeting: '🎊 Hi there! I am Linn Han',
  bio: "I'm a UI designer focused on B2B and SaaS, passionate about turning complex problems into intuitive solutions.",
  badge1: 'UI Designer with 6+ Years Experience',
  badge2: 'B2B SaaS, Healthcare, Fintech, E-Commerce',

  // Contact
  email: 'linnhan.design@gmail.com',
  linkedinUrl: 'https://linkedin.com',

  // Footer
  footerHeading: 'Want to work together?',
  footerText: 'If you like what you see and want to work together, get in touch!',

  // Page title
  pageTitle: 'Linn Han — UI/UX Designer',

  // Logo initials
  logoText: 'LH',

  // Admin password (same as case study password)
  adminPassword: '123456',
}

const STORAGE_KEY = 'portfolio_site_config'
const PROJECTS_KEY = 'portfolio_projects_override'

export function getSiteConfig() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...defaultSiteConfig, ...JSON.parse(stored) }
  } catch { /* ignore */ }
  return { ...defaultSiteConfig }
}

export function saveSiteConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function getProjectsOverride() {
  try {
    const stored = localStorage.getItem(PROJECTS_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return null
}

export function saveProjectsOverride(projects) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
}

export function clearProjectsOverride() {
  localStorage.removeItem(PROJECTS_KEY)
}

export function exportAllData() {
  return JSON.stringify({
    siteConfig: getSiteConfig(),
    projects: getProjectsOverride(),
  }, null, 2)
}

export function importAllData(jsonStr) {
  const data = JSON.parse(jsonStr)
  if (data.siteConfig) saveSiteConfig(data.siteConfig)
  if (data.projects) saveProjectsOverride(data.projects)
}
