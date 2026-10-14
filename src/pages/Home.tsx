import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ScrubVideo from '../components/ScrubVideo'
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
  useEffect(() => { const t = setTimeout(() => setShow(true), 400); return () => clearTimeout(t) }, [])
  const latest = SONGS.filter(s => s.youtube && isLive(s.premiere))[0]
  const upcoming = SONGS.filter(s => s.premiere && !isLive(s.premiere)).sort((a, b) => a.premiere!.localeCompare(b.premiere!))
  const pill = 'inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] text-[13px] sm:text-[15px] transition-colors duration-200'
  return (
    <>
      <ScrubVideo />
      <section className="relative z-10 flex h-[100svh] flex-col justify-end overflow-hidden px-5 pb-28 sm:px-8 md:justify-center md:px-10 md:pb-0">
        <div className="relative z-10 max-w-xl">
          <div className="pointer-events-none mb-5 select-none text-[clamp(18px,4vw,26px)] leading-[1.3] blur-[4px] sm:mb-6">
            Hey there, meet MOCHI,<br />the chubbiest pop star on the internet
          </div>
          <p className="mb-5 min-h-[54px] text-[clamp(18px,4vw,26px)] leading-[1.35] sm:mb-6">
            {displayed}{!done && <span className="ml-[2px] inline-block h-[1.1em] w-[2px] animate-blink bg-white align-middle" />}
          </p>
          <div className={`flex flex-wrap gap-y-1 transition-all duration-[400ms] ${show ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
            {[['Listen to the songs', '/music'], ['Watch the music videos', '/videos'], ['Play with Mochi', '/games'], ['Get the stickers', '/stickers']].map(([t, to]) => (
              <Link key={to} to={to} className={`${pill} border border-black/10 bg-white text-black hover:bg-black hover:text-white`}>{t}</Link>
            ))}
            <button onClick={() => { navigator.clipboard?.writeText(ARTIST.handle); setCopied(true); setTimeout(() => setCopied(false), 1200) }}
              className={`${pill} gap-2 border border-white bg-transparent text-white hover:bg-white hover:text-black sm:gap-3`}>
              <span>Follow us: <u className="underline-offset-1">{copied ? 'copied!' : ARTIST.handle}</u></span><CopyIcon />
            </button>
          </div>
        </div>
      </section>

      <div className="relative z-10 bg-ink">
        <div className="mx-auto max-w-5xl px-5 pb-40 pt-20 sm:px-8">
          <section className="mb-20">
            <H2>Find Mochi everywhere</H2>
            <div className="flex flex-wrap gap-2.5">{SOCIALS.map(([t, u]) => <Pill key={t} href={u}>{t}</Pill>)}</div>
          </section>

          {latest && (
            <section className="mb-20">
              <H2>Latest music video</H2>
              <div className="relative overflow-hidden rounded-2xl bg-black pt-[56.25%]">
                <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube-nocookie.com/embed/${latest.youtube}`} title={latest.title} loading="lazy"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
              {upcoming.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
                  {upcoming.map(s => (
                    <Link key={s.slug} to={`/music/${s.slug}`} className="rounded-2xl border border-white/15 p-3.5 transition-colors hover:bg-white/5">
                      <div className="text-[15px]">{s.title}</div><div className="text-[13px] text-white/50">Premiere · {fmtDate(s.premiere!)}</div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}

          <section className="mb-20">
            <div className="flex items-end justify-between"><H2>Songs</H2><Link to="/music" className="mb-5 underline underline-offset-4 hover:opacity-60">All songs →</Link></div>
            <div className="grid grid-cols-3 gap-3.5 md:grid-cols-6">{SONGS.slice(0, 6).map(s => <SongCard key={s.slug} song={s} />)}</div>
          </section>

          <section className="mb-20">
            <div className="flex items-end justify-between"><H2>Games</H2><Link to="/games" className="mb-5 underline underline-offset-4 hover:opacity-60">All games →</Link></div>
            <div className="grid gap-3 sm:grid-cols-2">
              {GAMES.map(g => (
                <Link key={g.slug} to={g.ready ? `/games/${g.slug}` : '/games'}
                  className={`rounded-3xl p-6 transition-transform hover:-translate-y-0.5 ${g.ready ? 'bg-gradient-to-br from-mochired to-fuchsia-600' : 'border border-dashed border-white/25'}`}>
                  <div className="text-xl font-medium">{g.title}</div>
                  <div className="mt-1 text-sm text-white/75">{g.ready ? g.desc : 'Coming soon'}</div>
                </Link>
              ))}
            </div>
          </section>

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
