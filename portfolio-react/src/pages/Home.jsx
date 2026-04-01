import Nav from '../components/Nav'
import Hero from '../components/Hero'
import WorkGrid from '../components/WorkGrid'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <>
      <Nav />
      <div className="page-shell">
        <Hero />
        <WorkGrid />
        <Footer />
      </div>
    </>
  )
}