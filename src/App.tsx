import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import MiniPlayer from './components/MiniPlayer'
import Home from './pages/Home'
import Music from './pages/Music'
import SongPage from './pages/SongPage'
import Videos from './pages/Videos'
import Games from './pages/Games'
import Stickers from './pages/Stickers'
import About from './pages/About'
import NotFound from './pages/NotFound'
import CatchTheDot from './games/CatchTheDot'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/music" element={<Music />} />
        <Route path="/music/:slug" element={<SongPage />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/catch-the-dot" element={<CatchTheDot />} />
        <Route path="/stickers" element={<Stickers />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <MiniPlayer />
    </>
  )
}
