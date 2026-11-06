import { useLang, useT } from '../i18n'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ARTIST, SONGS, SOCIALS, asset, cover, fmtDate, isLive } from '../data/songs'
import { useScrollProgress } from '../hooks/useScrollProgress'
import { usePlayer } from '../player/PlayerContext'
import LoopVideo from './LoopVideo'
import VideoModal from './VideoModal'
import Reveal from './Reveal'
import { PlayIcon } from './Icons'
import { Eq } from './PlayButton'

const clamp = (x: number) => Math.min(1, Math.max(0, x))
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a))
const LOOP: Record<string, string> = { 'the-chubby-super-cat': 'chubby', 'catch-the-dot': 'ctd', 'neon-jump': 'neon', 'meow-in-every-language': 'meow', 'shine-like-mochi': 'shine' }
const BTN = ['btn-pink', 'btn-cyan', 'btn-yellow', 'btn-lime', 'btn-purple', 'btn-orange']

/* 1 ─ Latest video: small card grows into a full-screen cinema while you scroll */
export function LatestVideo() {
  const t = useT()
  const ref = useRef<HTMLElement>(null)
  const p = useScrollProgress(ref)
  const [open, setOpen] = useState<string | null>(null)
  const latest = SONGS.filter(s => s.youtube && isLive(s.premiere))[0]
  if (!latest) return null
  const g = seg(p, 0, 0.55), tv = seg(p, 0.45, 0.75)
  return (
    <section ref={ref} className="relative z-10 h-[260vh]">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <div className="absolute left-0 right-0 top-[12vh] text-center" style={{ opacity: 1 - g * 1.4, transform: `translateY(${-g * 60}px)` }}>
          <div className="t3d t3d-cyan text-[clamp(40px,8vw,96px)]">{t('Latest music video')}</div>
        </div>
        <div className="relative overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,.6)]"
          style={{ width: `${62 + g * 38}vw`, height: `${42 + g * 58}svh`, borderRadius: `${36 - g * 36}px`, transform: `translateY(${(1 - g) * 12}vh)` }}>
          <LoopVideo name={LOOP[latest.slug] ?? 'chubby'} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" style={{ opacity: tv }} />
          <div className="absolute bottom-[10%] left-0 right-0 flex flex-col items-center px-6 text-center" style={{ opacity: tv, transform: `translateY(${(1 - tv) * 50}px) scale(${0.9 + tv * 0.1})` }}>
            <div className="t3d t3d-yellow text-[clamp(40px,8vw,110px)]">{latest.title}</div>
            <button onClick={() => setOpen(latest.youtube!)} className="btn3d btn-pink mt-7 text-[clamp(18px,2.4vw,24px)]">{t('▶ Watch the video')}</button>
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
  const t = useT()
  const { lang } = useLang()
  // only what is already scheduled and not out yet; the layout grows with the number of clips
  const up = SONGS.filter(s => s.premiere && !isLive(s.premiere)).sort((a, b) => a.premiere!.localeCompare(b.premiere!))
  if (!up.length) return null
  const n = up.length
  const grid = n === 1 ? 'mx-auto max-w-3xl grid-cols-1' : n === 2 ? 'grid-cols-1 sm:grid-cols-2' : n === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  const day = (iso: string) => lang === 'ko'
    ? new Date(iso + 'T12:00:00+09:00').toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
    : fmtDate(iso)
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <div className="mb-10"><SectionHead icon="📺" label="YouTube" title={t('Coming soon')} color="t3d-yellow" sub={t('A new Mochi video every Friday · 09:00 KST')} /></div>
      <div className={`grid gap-6 ${grid}`}>
        {up.map((s, i) => (
          <Reveal key={s.slug} delay={i * 100}>
            <TiltCard>
              <Link to={`/music/${s.slug}`} className="card3d group relative block aspect-video overflow-hidden bg-black hover:transform-none">
                {LOOP[s.slug] ? <LoopVideo name={LOOP[s.slug]} className="transition-transform duration-700 group-hover:scale-110" /> : <img src={cover(s)} alt="" className="h-full w-full object-cover" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                <div className={`btn3d ${BTN[i % BTN.length]} absolute left-4 top-4 !py-1.5 text-[14px]`}>{day(s.premiere!)}</div>
                <div className="absolute bottom-4 left-5 right-5">
                  <div className="t3d-sm text-[clamp(24px,3vw,40px)] leading-none">{s.title}</div>
                  <div className="mt-2 text-sm font-medium text-white/75">{s.genre} · {t('Premiere on YouTube')}</div>
                </div>
              </Link>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* 3 ─ Songs: swipeable carousel (doesn't hijack vertical scroll) */
export function SongsRail() {
  const t = useT()
  const pl = usePlayer()
  const rail = useRef<HTMLDivElement>(null)
  const go = (d: number) => rail.current?.scrollBy({ left: d * rail.current.clientWidth * 0.8, behavior: 'smooth' })
  return (
    <section className="relative z-10 py-20">
      <div className="mb-8 flex items-end justify-between gap-4 px-5 sm:px-10">
        <Reveal><div className="mb-2 text-[clamp(14px,2.2vw,20px)] font-semibold uppercase tracking-[.3em] text-white/80">🎵 {t('Music')}</div><h2 className="t3d text-[clamp(40px,7vw,84px)] leading-[1.05]">{t('Songs')}</h2></Reveal>
        <div className="mb-3 flex items-center gap-3">
          <button aria-label="Previous" onClick={() => go(-1)} className="btn3d btn-white hidden h-12 w-12 !p-0 text-xl md:inline-flex">‹</button>
          <button aria-label="Next" onClick={() => go(1)} className="btn3d btn-white hidden h-12 w-12 !p-0 text-xl md:inline-flex">›</button>
          <Link to="/music" className="btn3d btn-purple text-[16px]">{t('All songs →')}</Link>
        </div>
      </div>
      <div ref={rail} className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-10 pt-4 sm:gap-7 sm:px-10">
        {SONGS.map((s, i) => {
          const active = pl.current?.slug === s.slug
          return (
            <div key={s.slug} className="group w-[62vw] shrink-0 snap-start sm:w-[260px]">
              <TiltCard>
                <div className="card3d relative overflow-hidden">
                  <Link to={`/music/${s.slug}`}><img src={cover(s)} alt={s.title} loading="lazy" className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110" /></Link>
                  <button aria-label={`Play ${s.title}`} onClick={() => (active ? pl.toggle() : pl.play(s))} className={`btn3d ${BTN[i % BTN.length]} absolute bottom-3 right-3 h-14 w-14 !p-0`}>
                    {active && pl.playing ? <Eq /> : <PlayIcon className="ml-0.5 h-6 w-6" />}
                  </button>
                </div>
              </TiltCard>
              <Link to={`/music/${s.slug}`} className="t3d-sm mt-4 block text-[20px] leading-tight">{s.title}</Link>
              <div className="mt-1 text-sm font-medium text-white/55">{s.genre}</div>
            </div>
          )
        })}
        <Link to="/music" className="card3d grid w-[62vw] shrink-0 snap-start place-items-center bg-gradient-to-br from-violet-600 to-fuchsia-600 sm:w-[260px]" style={{ aspectRatio: '1' }}>
          <span className="t3d-sm text-center text-[28px]">{t('All songs →')} ({SONGS.length})</span>
        </Link>
      </div>
    </section>
  )
}

/** one look for every section title on the home page: small label, big 3D title, optional line under it */
function SectionHead({ icon, label, title, color, sub, align = 'center' }: { icon: string; label: string; title: string; color: string; sub?: string; align?: 'center' | 'left' }) {
  const c = align === 'center' ? 'text-center' : 'text-left'
  return (
    <Reveal>
      <div className={`mb-2 ${c} text-[clamp(14px,2.2vw,20px)] font-semibold uppercase tracking-[.3em] text-white/80`}>{icon} {label}</div>
      <h2 className={`t3d ${color} ${c} text-[clamp(40px,7vw,84px)] leading-[1.05]`}>{title}</h2>
      {sub && <p className={`mt-3 ${c} text-[clamp(15px,2.2vw,20px)] font-medium text-white/75`}>{sub}</p>}
    </Reveal>
  )
}

/* 4a ─ section title between the latest video and the game banner */
export function GameTitle() {
  const t = useT()
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-5 pb-6 pt-24 sm:px-8">
      <SectionHead icon="🎮" label={t('Games')} title={t('New game')} color="t3d-cyan" sub={t('Our first big Mochi game is here — play free')} />
    </section>
  )
}

/* 4 ─ Game: our new game Mochi's Pocha — coming soon. Living banner: crossfading art with slow zoom, falling snow,
   warm bokeh lights, floating food/coin icons, a phone that flips through real gameplay, shimmering badge and a bouncing title */
const PC_BG = ['images/pocha_banner.webp', 'images/pocha_banner2.webp']
const PC_SHOTS = ['main', 'kitchen', 'market', 'busking', 'train', 'ride']
const PC_ICONS = ['coin', 'm_ramen2', 'ui_heart2', 'star', 'm_tteok3', 'm_egg3', 'coin', 'star']
const rnd = (i: number, k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x) }
const PC_SNOW = Array.from({ length: 36 }, (_, i) => ({ x: rnd(i, 1) * 100, d: 6 + rnd(i, 2) * 8, delay: -rnd(i, 3) * 14, s: 3 + rnd(i, 4) * 6, drift: (rnd(i, 5) - 0.5) * 60 }))
const PC_BOKEH = Array.from({ length: 12 }, (_, i) => ({ x: rnd(i, 6) * 100, y: 8 + rnd(i, 7) * 50, s: 30 + rnd(i, 8) * 70, c: ['#ffd27a', '#ff9a5a', '#ff6f91', '#ffe9a8'][i % 4], delay: -rnd(i, 9) * 4 }))
export function GameBanner() {
  const t = useT()
  const ref = useRef<HTMLElement>(null)
  const p = useScrollProgress(ref)
  const z = seg(p, 0.1, 0.5)
  const title = t("Mochi's Pocha")
  return (
    <section ref={ref} id="pocha-soon" className="relative z-10 h-[200vh]">
      <style>{`
@keyframes pcKen{0%{transform:scale(1.08) translate(0,0)}100%{transform:scale(1.22) translate(-2%,-3%)}}
@keyframes pcFade{0%,45%{opacity:1}50%,95%{opacity:0}100%{opacity:1}}
@keyframes pcSnow{from{transform:translate(0,-10vh)}to{transform:translate(var(--dx),110vh)}}
@keyframes pcGlow{0%,100%{opacity:.25;transform:scale(.85)}50%{opacity:.75;transform:scale(1.1)}}
@keyframes pcFloat{0%{transform:translateY(0) rotate(-8deg)}50%{transform:translateY(-18px) rotate(8deg)}100%{transform:translateY(0) rotate(-8deg)}}
@keyframes pcShine{0%{transform:translateX(-120%) skewX(-20deg)}60%,100%{transform:translateX(260%) skewX(-20deg)}}
@keyframes pcWave{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-.12em)}}
@keyframes pcShot{0%{opacity:0;transform:scale(1.04)}4%,16.6%{opacity:1;transform:scale(1)}20.6%,100%{opacity:0}}
@keyframes pcBob{0%,100%{transform:rotate(-6deg) translateY(0)}50%{transform:rotate(-3deg) translateY(-10px)}}
@keyframes pcSteam{0%{transform:translate(-50%,0) scale(.6);opacity:0}20%{opacity:.55}100%{transform:translate(-50%,-90px) scale(1.6);opacity:0}}
.pc-letter{display:inline-block;animation:pcWave 2.4s ease-in-out infinite}
@media (prefers-reduced-motion: reduce){.pc-anim,.pc-anim *{animation:none!important}}
`}</style>
      <div className="sticky top-0 h-[100svh] overflow-hidden pc-anim">
        {/* art: two pictures crossfading, each slowly zooming */}
        <div className="absolute inset-0" style={{ transform: `scale(${1.15 - p * 0.15})` }}>
          {PC_BG.map((b, i) => (
            <img key={b} src={asset(b)} alt="" className="absolute inset-0 h-full w-full object-cover object-[50%_40%]"
              style={{ animation: `pcKen 14s ease-in-out ${-i * 7}s infinite alternate, pcFade 14s linear ${-i * 7}s infinite` }} />
          ))}
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(closest-side,rgba(0,0,0,.1),rgba(11,7,24,.85))]" />
        {/* warm bokeh lights */}
        {PC_BOKEH.map((b, i) => <span key={i} className="pointer-events-none absolute rounded-full" style={{ left: `${b.x}%`, top: `${b.y}%`, width: b.s, height: b.s, background: `radial-gradient(circle, ${b.c}, transparent 70%)`, filter: 'blur(6px)', animation: `pcGlow ${3 + (i % 3)}s ease-in-out ${b.delay}s infinite`, mixBlendMode: 'screen' }} />)}
        {/* floating dishes, coins, hearts — they drift with the scroll */}
        {PC_ICONS.map((n, i) => (
          <div key={i} className="pointer-events-none absolute" style={{ left: `${[6, 84, 12, 78, 4, 90, 26, 68][i]}%`, top: `${[18, 22, 70, 72, 46, 50, 86, 88][i]}%`, width: `clamp(34px, ${5 + (i % 3) * 1.5}vw, 84px)`, transform: `translateY(${(0.5 - p) * (60 + i * 25)}px)`, opacity: 0.35 + z * 0.65 }}>
            <img src={asset(`images/pocha_ic_${n}.webp`)} alt="" className="w-full drop-shadow-[0_8px_10px_rgba(0,0,0,.45)]" style={{ animation: `pcFloat ${3 + (i % 3)}s ease-in-out ${-i * 0.4}s infinite` }} />
          </div>
        ))}
        {/* falling snow */}
        {PC_SNOW.map((f, i) => <span key={i} className="pointer-events-none absolute top-0 rounded-full bg-white" style={{ left: `${f.x}%`, width: f.s, height: f.s, opacity: 0.8, boxShadow: '0 0 6px #fff', ['--dx' as string]: `${f.drift}px`, animation: `pcSnow ${f.d}s linear ${f.delay}s infinite` }} />)}
        <div className="relative flex h-full flex-col items-center justify-center gap-4 px-6 text-center md:flex-row md:gap-16" style={{ opacity: z, transform: `scale(${0.6 + z * 0.4})` }}>
          {/* a phone that flips through real gameplay */}
          <div className="relative order-1 shrink-0 md:order-2" style={{ animation: 'pcBob 4s ease-in-out infinite' }}>
            <div className="relative overflow-hidden rounded-[28px] border-[6px] border-white/90 bg-black shadow-[0_24px_60px_rgba(0,0,0,.6),0_0_40px_rgba(255,140,90,.45)]" style={{ width: 'clamp(118px, 18vw, 250px)', aspectRatio: '1 / 2.05' }}>
              {PC_SHOTS.map((n, i) => <img key={n} src={asset(`images/pocha_shot_${n}.webp`)} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ opacity: 0, animation: `pcShot 15s linear ${i * 2.5}s infinite` }} />)}
            </div>
            <span className="pointer-events-none absolute left-1/2 top-[18%] h-10 w-10 rounded-full bg-white/60 blur-md" style={{ animation: 'pcSteam 2.6s ease-out infinite' }} />
            <span className="pointer-events-none absolute left-[40%] top-[18%] h-8 w-8 rounded-full bg-white/50 blur-md" style={{ animation: 'pcSteam 2.6s ease-out 1.3s infinite' }} />
          </div>
          <div className="order-2 flex flex-col items-center md:order-1">
            <div className="relative mb-3 overflow-hidden rounded-full border-2 border-white/80 bg-gradient-to-r from-pink-500 to-orange-400 px-6 py-2 text-[clamp(14px,2.2vw,22px)] font-bold uppercase tracking-[.25em] text-white shadow-[0_0_24px_rgba(255,120,80,.7)]">
              {t('New game')}
              <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent" style={{ animation: 'pcShine 2.8s ease-in-out infinite' }} />
            </div>
            <div className="t3d t3d-yellow text-[clamp(44px,10vw,150px)] leading-[1.05]" aria-label={title}>
              {[...title].map((ch, i) => <span key={i} className="pc-letter" style={{ animationDelay: `${i * 0.08}s` }}>{ch === ' ' ? ' ' : ch}</span>)}
            </div>
            <p className="mt-4 max-w-xl text-[clamp(15px,2.2vw,22px)] font-medium text-white/90 [text-shadow:0_2px_8px_rgba(0,0,0,.6)]">{t('Merge food, serve the neighbours and decorate a cozy Seoul street-food tent — plus 8 mini-games with Mochi’s songs.')}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <a href="/pocha/" className="btn3d btn-yellow text-[clamp(18px,2.6vw,28px)]">{t('🏮 Play free')}</a>
              <Link to="/games" className="btn3d btn-white text-[clamp(15px,2vw,20px)]">{t('More games')}</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* 5 ─ Stickers: floating Mochis drifting at different speeds */
const STICKERS = ['hi', 'love_you', 'yay', 'lol', 'omg', 'mwah', 'high_five', 'hugs']
const SPOTS = [[6, 8, 1.4], [74, 4, 0.8], [84, 52, 1.6], [4, 60, 1.1], [60, 74, 0.7], [30, 2, 0.6], [22, 78, 1.3], [46, 40, 0]]
export function StickerParade() {
  const t = useT()
  const { lang } = useLang()
  const ref = useRef<HTMLElement>(null)
  const p = useScrollProgress(ref)
  return (
    <section ref={ref} className="relative z-10 h-[170vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {STICKERS.map((n, i) => {
          const [x, y, sp] = SPOTS[i]
          if (!sp) return null
          return <img key={n} src={asset(`stickers/${lang}/${n}.webp`)} alt="" loading="lazy" className="absolute w-[28vw] max-w-[230px] drop-shadow-[0_14px_20px_rgba(0,0,0,.45)]"
            style={{ left: `${x}%`, top: `${y}%`, transform: `translateY(${(0.5 - p) * sp * 320}px) rotate(${(p - 0.5) * sp * 40}deg) scale(${0.8 + seg(p, 0, 0.3) * 0.2})`, opacity: seg(p, 0, 0.2) }} />
        })}
        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center" style={{ transform: `scale(${0.85 + seg(p, 0.1, 0.45) * 0.15})`, opacity: seg(p, 0.08, 0.35) }}>
          <div className="t3d t3d-lime text-[clamp(48px,10vw,140px)]">{t('Mochi for')}<br />{t('every mood')}</div>
          <p className="mt-6 max-w-md text-[clamp(16px,2.4vw,22px)] font-medium text-white/85">{t('Hi, love, wow, snack time — send a chubby Mochi in any chat.')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href={lang==='ko'?ARTIST.giphyKo:ARTIST.giphyEn} target="_blank" rel="noopener" className="btn3d btn-lime text-[clamp(18px,2.4vw,24px)]">{t('✨ Get the stickers')}</a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* 6 ─ Socials: candy buttons pop in one by one and gently float */
export function Everywhere() {
  const t = useT()
  return (
    <section className="relative z-10 px-5 py-28">
      <Reveal><h2 className="t3d t3d-yellow mb-12 text-center text-[clamp(40px,7vw,90px)]">{t('Find Mochi everywhere')}</h2></Reveal>
      <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-x-4 gap-y-6">
        {SOCIALS.map(([t, u], i) => (
          <Reveal key={t} delay={i * 70}>
            <a href={u} target="_blank" rel="noopener" className={`btn3d ${BTN[i % BTN.length]} anim-float text-[clamp(18px,2.4vw,24px)]`} style={{ animationDelay: `${i * 0.3}s` }}>{t}</a>
          </Reveal>
        ))}
      </div>
      <div className="mt-16 flex justify-center"><a href={ARTIST.subscribe} target="_blank" rel="noopener" className="btn3d btn-pink text-[clamp(20px,2.6vw,28px)]">{t('▶ Subscribe on YouTube')}</a></div>
    </section>
  )
}
