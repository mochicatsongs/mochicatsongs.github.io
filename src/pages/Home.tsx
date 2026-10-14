import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ScrubVideo from '../components/ScrubVideo'
import Reveal from '../components/Reveal'
import ScrollStory from '../components/ScrollStory'
import SongCard from '../components/SongCard'
import { CopyIcon } from '../components/Icons'
import { H2, Pill } from '../components/Section'
import { ARTIST, SONGS, SOCIALS, fmtDate, isLive } from '../data/songs'
import { useTypewriter } from '../hooks/useTypewriter'
import { GAMES } from './Games'

const TEXT = 'Glad you stopped by. I love snacks, but I always choose the dance floor. So — what are we doing today?'

export default function Home() {
  const { displayed, done } = useTypewriter(TEXT)
  const [show, setShow] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sy, setSy] = useState(0)
  useEffect(() => { let r = 0; const f = () => { if (!r) r = requestAnimationFrame(() => { r = 0; setSy(window.scrollY) }) }; window.addEventListener('scroll', f, { passive: true }); return () => { window.removeEventListener('scroll', f); cancelAnimationFrame(r) } }, [])
  const hp = Math.min(1, sy / (typeof window === 'undefined' ? 800 : window.innerHeight))
  useEffect(() => { const t = setTimeout(() => setShow(true), 400); return () => clearTimeout(t) }, [])
  const latest = SONGS.filter(s => s.youtube && isLive(s.premiere))[0]
  const upcoming = SONGS.filter(s => s.premiere && !isLive(s.premiere)).sort((a, b) => a.premiere!.localeCompare(b.premiere!))
  return (
    <>
      <ScrubVideo />
      <section className="relative z-10 flex h-[100svh] flex-col justify-end overflow-hidden px-5 pb-28 sm:px-8 md:justify-center md:px-10 md:pb-0">
        <div className="relative z-10 max-w-xl" style={{ opacity: 1 - hp * 1.2, transform: `translateY(${-hp * 120}px) scale(${1 - hp * 0.12})`, filter: `blur(${hp * 6}px)` }}>
          <div className="mb-1 text-[clamp(16px,3.2vw,22px)] font-semibold text-white/85">Hey there, meet</div>
          <h1 className="anim-popin mb-2 select-none"><span className="wordmark anim-wobble text-[clamp(84px,19vw,190px)]">MOCHI</span></h1>
          <div className="t3d-sm t3d-cyan mb-5 text-[clamp(20px,4.2vw,32px)] leading-tight sm:mb-6">the chubbiest pop star on the internet</div>
          <p className="mb-6 min-h-[54px] text-[clamp(17px,3.6vw,22px)] font-medium leading-[1.4] text-white/90 sm:mb-7">
            {displayed}{!done && <span className="ml-[2px] inline-block h-[1.1em] w-[2px] animate-blink bg-white align-middle" />}
          </p>
          <div className={`flex flex-wrap gap-x-2.5 gap-y-4 transition-all duration-[400ms] ${show ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
            {[['🎵 Listen', '/music', 'btn-pink'], ['🎬 Watch', '/videos', 'btn-cyan'], ['🎮 Play', '/games', 'btn-yellow'], ['✨ Stickers', '/stickers', 'btn-lime']].map(([t, to, c]) => (
              <Link key={to} to={to} className={`btn3d ${c} text-[15px] sm:text-[18px]`}>{t}</Link>
            ))}
            <button onClick={() => { navigator.clipboard?.writeText(ARTIST.handle); setCopied(true); setTimeout(() => setCopied(false), 1200) }}
              className="btn3d btn-white text-[15px] sm:text-[18px]">
              <span>{copied ? 'Copied! 💖' : ARTIST.handle}</span><CopyIcon />
            </button>
          </div>
        </div>
      </section>

      <ScrollStory />
      <div className="bg-party relative z-10">
        <div className="mx-auto max-w-5xl px-5 pb-40 pt-20 sm:px-8">
          <Reveal className="mb-24"><section>
            <H2 color="t3d-yellow">Find Mochi everywhere</H2>
            <div className="flex flex-wrap gap-x-3 gap-y-5">{SOCIALS.map(([t, u], i) => <Pill key={t} href={u} i={i}>{t}</Pill>)}</div>
          </section></Reveal>

          {latest && (
            <Reveal className="mb-24"><section>
              <H2 color="t3d-cyan">Latest music video</H2>
              <div className="card3d relative overflow-hidden bg-black pt-[56.25%] hover:transform-none">
                <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube-nocookie.com/embed/${latest.youtube}`} title={latest.title} loading="lazy"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
              {upcoming.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
                  {upcoming.map(s => (
                    <Link key={s.slug} to={`/music/${s.slug}`} className="card3d bg-gradient-to-br from-violet-600 to-fuchsia-600 p-4">
                      <div className="t3d-sm text-[18px] leading-tight">{s.title}</div><div className="mt-1 text-[13px] font-medium text-white/80">Premiere · {fmtDate(s.premiere!)}</div>
                    </Link>
                  ))}
                </div>
              )}
            </section></Reveal>
          )}

          <Reveal className="mb-24"><section>
            <div className="flex items-end justify-between"><H2>Songs</H2><Link to="/music" className="btn3d btn-purple mb-6 text-[14px]">All songs →</Link></div>
            <div className="grid grid-cols-3 gap-x-3.5 gap-y-6 md:grid-cols-6">{SONGS.slice(0, 6).map((s, i) => <Reveal key={s.slug} delay={i * 80}><SongCard song={s} /></Reveal>)}</div>
          </section></Reveal>

          <Reveal className="mb-24"><section>
            <div className="flex items-end justify-between"><H2 color="t3d-lime">Games</H2><Link to="/games" className="btn3d btn-orange mb-6 text-[14px]">All games →</Link></div>
            <div className="grid gap-5 sm:grid-cols-2">
              {GAMES.map((g, i) => (<Reveal key={g.slug} delay={i * 90}>
                <Link to={g.ready ? `/games/${g.slug}` : '/games'}
                  className={`card3d block p-6 ${g.ready ? 'bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-600' : 'bg-white/[.06]'}`}>
                  <div className="t3d-sm text-[26px]">{g.title}</div>
                  <div className="mt-1 text-sm text-white/75">{g.ready ? g.desc : 'Coming soon'}</div>
                </Link></Reveal>
              ))}
            </div>
          </section></Reveal>

          <footer className="border-t border-white/10 pt-6 text-[13px] leading-relaxed text-white/50">
            💃 Dance with Mochi and tag <b>#MochiCat</b> — your video might get featured!<br />
            Music and visuals are made with AI tools; characters, stories, lyrics and editing by the Mochi Cat team.<br />
            © 2026 Mochi Cat · 모치캣
          </footer>
        </div>
      </div>
    </>
  )
}
