import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { ConfigProvider } from './context/ConfigContext'
import Home from './pages/Home'
import CaseStudy from './pages/CaseStudy'
import CaseStudyFull from './pages/CaseStudyFull'
import Admin from './pages/Admin'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <ConfigProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/work/:projectId" element={<CaseStudy />} />
        <Route path="/work/:projectId/full" element={<CaseStudyFull />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </ConfigProvider>
  )
}