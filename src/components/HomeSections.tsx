import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ARTIST, SONGS, SOCIALS, asset, cover, fmtDate, isLive } from '../data/songs'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { usePlayer } from '../player/PlayerContext'
import LoopVideo from './LoopVideo'
import VideoModal from './VideoModal'
import Reveal from './Reveal'
import { PauseIcon, PlayIcon } from './Icons'

const clamp = (x: number) => Math.min(1, Math.max(0, x))
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a))
const LOOP: Record<string, string> = { 'the-chubby-super-cat': 'chubby', 'catch-the-dot': 'ctd', 'neon-jump': 'neon', 'meow-in-every-language': 'meow', 'shine-like-mochi': 'shine' }
const BTN = ['btn-pink', 'btn-cyan', 'btn-yellow', 'btn-lime', 'btn-purple', 'btn-orange']

/* 1 ─ Latest video: small card grows into a full-screen cinema while you scroll */
export function LatestVideo() {
  const ref = useRef<HTMLElement>(null)
  const p = useScrollProgress(ref)
  const [open, setOpen] = useState<string | null>(null)
  const latest = SONGS.filter(s => s.youtube && isLive(s.premiere))[0]
  if (!latest) return null
  const g = seg(p, 0, 0.55), t = seg(p, 0.45, 0.75)
  return (
    <section ref={ref} className="relative z-10 h-[260vh]">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <div className="absolute left-0 right-0 top-[12vh] text-center" style={{ opacity: 1 - g * 1.4, transform: `translateY(${-g * 60}px)` }}>
          <div className="t3d t3d-cyan text-[clamp(40px,8vw,96px)]">Latest music video</div>
        </div>
        <div className="relative overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,.6)]"
          style={{ width: `${62 + g * 38}vw`, height: `${42 + g * 58}svh`, borderRadius: `${36 - g * 36}px`, transform: `translateY(${(1 - g) * 12}vh)` }}>
          <LoopVideo name={LOOP[latest.slug] ?? 'chubby'} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" style={{ opacity: t }} />
          <div className="absolute bottom-[10%] left-0 right-0 flex flex-col items-center px-6 text-center" style={{ opacity: t, transform: `translateY(${(1 - t) * 50}px) scale(${0.9 + t * 0.1})` }}>
            <div className="t3d t3d-yellow text-[clamp(40px,8vw,110px)]">{latest.title}</div>
            <button onClick={() => setOpen(latest.youtube!)} className="btn3d btn-pink mt-7 text-[clamp(18px,2.4vw,24px)]">▶ Watch the video</button>
          </div>
        </div>
      </div>
      <VideoModal id={open} title={latest.title} onClose={() => setOpen(null)} />
    </section>
  )
}

/* 2 ─ Premieres: cards with live video loops that tilt toward the mouse */
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const move = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5
    ref.current!.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateY(-6px)`
  }
  const leave = () => { ref.current!.style.transform = '' }
  return <div ref={ref} onMouseMove={move} onMouseLeave={leave} className={`transition-transform duration-200 ease-out will-change-transform ${className}`}>{children}</div>
}

export function Premieres() {
  const up = SONGS.filter(s => s.premiere && !isLive(s.premiere)).sort((a, b) => a.premiere!.localeCompare(b.premiere!))
  if (!up.length) return null
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-5 py-24 sm:px-8">
      <Reveal><h2 className="t3d t3d-yellow mb-3 text-center text-[clamp(40px,7vw,84px)]">Coming soon</h2>
        <p className="mb-12 text-center text-[clamp(16px,2.2vw,20px)] font-medium text-white/75">A new Mochi video every Friday · 21:00 KST</p></Reveal>
      <div className="grid gap-6 sm:grid-cols-2">
        {up.map((s, i) => (
          <Reveal key={s.slug} delay={i * 100}>
            <TiltCard>
              <Link to={`/music/${s.slug}`} className="card3d group relative block aspect-video overflow-hidden bg-black hover:transform-none">
                {LOOP[s.slug] ? <LoopVideo name={LOOP[s.slug]} className="transition-transform duration-700 group-hover:scale-110" /> : <img src={cover(s)} alt="" className="h-full w-full object-cover" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                <div className={`btn3d ${BTN[i % BTN.length]} absolute left-4 top-4 !py-1.5 text-[14px]`}>{fmtDate(s.premiere!)}</div>
                <div className="absolute bottom-4 left-5 right-5">
                  <div className="t3d-sm text-[clamp(26px,3.4vw,40px)] leading-none">{s.title}</div>
                  <div className="mt-2 text-sm font-medium text-white/75">{s.genre} · Premiere on YouTube</div>
                </div>
              </Link>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* 3 ─ Songs: pinned rail that slides sideways as you scroll down */
export function SongsRail() {
  const ref = useRef<HTMLElement>(null)
  const p = useScrollProgress(ref)
  const pl = usePlayer()
  return (
    <section ref={ref} className="relative z-10 h-[300vh]">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div className="mb-8 flex items-end justify-between px-5 sm:px-10">
          <h2 className="t3d text-[clamp(44px,8vw,100px)]">Songs</h2>
          <Link to="/music" className="btn3d btn-purple mb-3 text-[16px]">All songs →</Link>
        </div>
        <div className="flex w-max gap-5 pl-5 sm:gap-8 sm:pl-10" style={{ transform: `translateX(calc(${-p} * (100% - 100vw + 80px)))` }}>
          {SONGS.map((s, i) => {
            const active = pl.current?.slug === s.slug
            return (
              <div key={s.slug} className="group w-[62vw] shrink-0 sm:w-[300px]" style={{ transform: `translateY(${Math.sin(p * 8 + i * 0.9) * 18}px) rotate(${Math.sin(p * 6 + i) * 2.5}deg)` }}>
                <div className="card3d relative overflow-hidden">
                  <Link to={`/music/${s.slug}`}><img src={cover(s)} alt={s.title} loading="lazy" className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110" /></Link>
                  <button aria-label={`Play ${s.title}`} onClick={() => (active ? pl.toggle() : pl.play(s))} className={`btn3d ${BTN[i % BTN.length]} absolute bottom-3 right-3 h-14 w-14 !p-0`}>
                    {active && pl.playing ? <PauseIcon /> : <PlayIcon className="ml-0.5 h-6 w-6" />}
                  </button>
                </div>
                <Link to={`/music/${s.slug}`} className="t3d-sm mt-4 block text-[22px] leading-tight">{s.title}</Link>
                <div className="mt-1 text-sm font-medium text-white/55">{s.genre}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* 4 ─ Game: full-screen neon video with parallax + zooming title */
export function GameBanner() {
  const ref = useRef<HTMLElement>(null)
  const p = useScrollProgress(ref)
  const z = seg(p, 0.1, 0.5)
  return (
    <section ref={ref} className="relative z-10 h-[200vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0" style={{ transform: `scale(${1.25 - p * 0.25})` }}><LoopVideo name="ctd" /></div>
        <div className="absolute inset-0 bg-[radial-gradient(closest-side,rgba(0,0,0,.25),rgba(11,7,24,.9))]" />
        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center" style={{ opacity: z, transform: `scale(${0.6 + z * 0.4})` }}>
          <div className="mb-3 text-[clamp(16px,2.4vw,22px)] font-semibold uppercase tracking-[.3em] text-cyan-200">New game</div>
          <div className="t3d t3d-cyan text-[clamp(56px,12vw,170px)]">Catch the Dot</div>
          <p className="mt-5 max-w-lg text-[clamp(16px,2.4vw,22px)] font-medium text-white/85">Tap the red dot before it escapes. 30 seconds. It gets faster. Beat your friends!</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/games/catch-the-dot" className="btn3d btn-yellow text-[clamp(20px,2.6vw,28px)]">🎮 Play now</Link>
            <Link to="/games" className="btn3d btn-white text-[clamp(16px,2vw,20px)]">More games</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* 5 ─ Stickers: floating Mochis drifting at different speeds */
const STICKERS = ['01_hi', '02_love', '05_workout', '08_wow', '14_sing', '15_cool', '17_eat', '18_mochimochi']
const SPOTS = [[6, 8, 1.4], [74, 4, 0.8], [84, 52, 1.6], [4, 60, 1.1], [60, 74, 0.7], [30, 2, 0.6], [22, 78, 1.3], [46, 40, 0]]
export function StickerParade() {
  const ref = useRef<HTMLElement>(null)
  const p = useScrollProgress(ref)
  return (
    <section ref={ref} className="relative z-10 h-[170vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {STICKERS.map((n, i) => {
          const [x, y, sp] = SPOTS[i]
          if (!sp) return null
          return <img key={n} src={asset(`loops/st_${n}.png`)} alt="" loading="lazy" className="absolute w-[28vw] max-w-[230px] drop-shadow-[0_14px_20px_rgba(0,0,0,.45)]"
            style={{ left: `${x}%`, top: `${y}%`, transform: `translateY(${(0.5 - p) * sp * 320}px) rotate(${(p - 0.5) * sp * 40}deg) scale(${0.8 + seg(p, 0, 0.3) * 0.2})`, opacity: seg(p, 0, 0.2) }} />
        })}
        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center" style={{ transform: `scale(${0.85 + seg(p, 0.1, 0.45) * 0.15})`, opacity: seg(p, 0.08, 0.35) }}>
          <div className="t3d t3d-lime text-[clamp(48px,10vw,140px)]">Mochi for<br />every mood</div>
          <p className="mt-6 max-w-md text-[clamp(16px,2.4vw,22px)] font-medium text-white/85">Hi, love, wow, snack time — send a chubby Mochi in any chat.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href={ARTIST.giphy} target="_blank" rel="noopener" className="btn3d btn-lime text-[clamp(18px,2.4vw,24px)]">✨ Get the stickers</a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* 6 ─ Socials: two marquees of candy buttons moving opposite ways */
export function Everywhere() {
  const ref = useRef<HTMLElement>(null)
  const p = useScrollProgress(ref)
  const row = (dir: number) => (
    <div className="flex w-max gap-4 whitespace-nowrap py-4" style={{ transform: `translateX(calc(${dir < 0 ? -15 : -45}% + ${dir * (p - 0.5) * 30}%))` }}>
      {[...SOCIALS, ...SOCIALS, ...SOCIALS].map(([t, u], i) => (
        <a key={i} href={u} target="_blank" rel="noopener" className={`btn3d ${BTN[i % BTN.length]} shrink-0 text-[clamp(18px,2.4vw,26px)]`}>{t}</a>
      ))}
    </div>
  )
  return (
    <section ref={ref} className="relative z-10 overflow-hidden py-28">
      <Reveal><h2 className="t3d t3d-yellow mb-12 px-5 text-center text-[clamp(40px,7vw,90px)]">Find Mochi everywhere</h2></Reveal>
      <div className="-rotate-3">{row(-1)}{row(1)}</div>
      <div className="mt-14 flex justify-center"><a href={ARTIST.subscribe} target="_blank" rel="noopener" className="btn3d btn-pink text-[clamp(20px,2.6vw,28px)]">▶ Subscribe on YouTube</a></div>
    </section>
  )
}
