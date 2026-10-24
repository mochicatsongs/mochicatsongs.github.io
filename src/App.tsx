import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import { Route, Routes, useLocation, useNavigationType } from 'react-router-dom'
import Navbar from './components/Navbar'
import MiniPlayer from './components/MiniPlayer'
import Home from './pages/Home'
import Music from './pages/Music'
import SongPage from './pages/SongPage'
import Videos from './pages/Videos'
import Games from './pages/Games'
import Stickers from './pages/Stickers'
import Books from './pages/Books'
import FreePages from './pages/FreePages'
import About from './pages/About'
import NotFound from './pages/NotFound'
import CatchTheDot from './games/CatchTheDot'
import { KidsHome, KidsSection } from './pages/Kids'
const Arcade = lazy(() => import('./games/arcade/ArcadeGame'))
const Privacy = lazy(() => import('./pages/Privacy'))

/** Remembers where you were on every page: Back returns to the same spot, new pages start at the top. */
const KEY = (k: string) => `mochi-scroll:${k}`
function ScrollMemory() {
  const loc = useLocation()
  const nav = useNavigationType()
  const keyRef = useRef(loc.key)
  const first = useRef(true)
  useEffect(() => {
    try { history.scrollRestoration = 'manual' } catch { /* ignore */ }
    let raf = 0
    const save = () => {
      if (raf) return
      raf = requestAnimationFrame(() => { raf = 0; try { sessionStorage.setItem(KEY(keyRef.current), String(window.scrollY)) } catch { /* ignore */ } })
    }
    window.addEventListener('scroll', save, { passive: true })
    return () => window.removeEventListener('scroll', save)
  }, [])
  useLayoutEffect(() => {
    keyRef.current = loc.key
    const isFirst = first.current; first.current = false
    if (nav !== 'POP' || isFirst) { if (!isFirst) window.scrollTo(0, 0); return }
    let y = 0
    try { y = Number(sessionStorage.getItem(KEY(loc.key)) || 0) } catch { /* ignore */ }
    if (!y) { window.scrollTo(0, 0); return }
    // the page may still be growing (images, sections) — keep trying for a moment
    let tries = 0
    const go = () => { window.scrollTo(0, y); if (Math.abs(window.scrollY - y) > 4 && tries++ < 40) setTimeout(go, 50) }
    go()
  }, [loc.key, nav])
  return null
}

export default function App() {
  const kids = useLocation().pathname.replace(import.meta.env.BASE_URL, '/').startsWith('/k')
  return (
    <>
      <ScrollMemory />
      {!kids && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/music" element={<Music />} />
        <Route path="/music/:slug" element={<SongPage />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/catch-the-dot" element={<CatchTheDot />} />
        <Route path="/games/:slug" element={<Suspense fallback={<div className="min-h-screen" />}><Arcade /></Suspense>} />
        <Route path="/stickers" element={<Stickers />} />
        <Route path="/books" element={<Books />} />
        <Route path="/free-coloring-pages" element={<FreePages />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Suspense fallback={<div className="min-h-screen" />}><Privacy /></Suspense>} />
        <Route path="/k" element={<KidsHome />} />
        <Route path="/k/:slug" element={<KidsSection />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!kids && <MiniPlayer />}
    </>
  )
}
