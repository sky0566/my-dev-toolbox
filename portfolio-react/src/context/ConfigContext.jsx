import { createContext, useContext, useState, useCallback } from 'react'
import { defaultSiteConfig, getSiteConfig, saveSiteConfig, getProjectsOverride, saveProjectsOverride } from '../data/siteConfig'
import { projects as defaultProjects } from '../data/projects'

const ConfigContext = createContext()

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(getSiteConfig)
  const [projectsData, setProjectsData] = useState(() => getProjectsOverride() || defaultProjects)

  const updateConfig = useCallback((newConfig) => {
    setConfig(newConfig)
    saveSiteConfig(newConfig)
  }, [])

  const updateProjects = useCallback((newProjects) => {
    setProjectsData(newProjects)
    saveProjectsOverride(newProjects)
  }, [])

  const resetProjects = useCallback(() => {
    setProjectsData(defaultProjects)
    localStorage.removeItem('portfolio_projects_override')
  }, [])

  const resetConfig = useCallback(() => {
    setConfig({ ...defaultSiteConfig })
    localStorage.removeItem('portfolio_site_config')
  }, [])

  return (
    <ConfigContext.Provider value={{ config, updateConfig, projects: projectsData, updateProjects, resetProjects, resetConfig, defaultProjects }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  return useContext(ConfigContext)
}
