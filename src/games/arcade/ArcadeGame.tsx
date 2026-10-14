import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useT } from '../../i18n'
import { track } from '../../analytics'
import { ARTIST, asset, cover, songBySlug } from '../../data/songs'
import { usePlayer } from '../../player/PlayerContext'
import BackButton from '../../components/BackButton'
import NotFound from '../../pages/NotFound'
import { Api, GameDef, pick, Sprites } from './engine'
import { ARCADE } from './registry'
import { nextGame } from '../../data/games'

/** How each game is played on a phone — shown as a big hint on the start screen. */
const CTRL: Record<string, 'drag' | 'tap' | 'sides' | 'target'> = {
  'shine-like-mochi': 'drag', 'neon-jump': 'drag', 'belly-bounce': 'drag',
  'the-chubby-super-cat': 'tap', 'mochi-obby': 'tap', 'milkshake-shake': 'tap', 'chonky-gym-cat': 'tap',
  'mochi-mochi-challenge': 'sides',
}
const CTRL_TEXT = {
  drag: ['👉', 'Slide your finger left and right', 'Mouse or ← → keys'],
  tap: ['👆', 'Tap anywhere on the screen', 'Click or Space'],
  sides: ['👈👉', 'Tap the left or right side', 'Click or ← → keys'],
  target: ['👆', 'Tap the right things', 'Click with the mouse'],
} as const
const isTouch = () => typeof window !== 'undefined' && !matchMedia('(hover: hover)').matches

type Floater = { x: number; y: number; s: string; c: string; t: number }
type Part = { x: number; y: number; vx: number; vy: number; c: string; t: number }

const bestKey = (slug: string) => `game-best:${slug}`
const loadBest = (slug: string) => { try { return Number(localStorage.getItem(bestKey(slug)) || 0) } catch { return 0 } }
const saveBest = (slug: string, n: number) => { try { localStorage.setItem(bestKey(slug), String(n)) } catch { /* ignore */ } }

let sprites: Sprites | undefined
const getSprites = () => {
  if (!sprites) {
    const im = (n: string) => { const i = new Image(); i.src = asset(`games/mochi_${n}.webp`); return i }
    sprites = { idle: im('idle'), happy: im('happy'), sad: im('sad'), jump: im('jump') }
  }
  return sprites
}

export default function ArcadePage() {
  const { slug } = useParams()
  const def = ARCADE.find(g => g.slug === slug)
  if (!def) return <NotFound />
  return <ArcadeGame key={def.slug} def={def} />
}

function ArcadeGame({ def }: { def: GameDef }) {
  const t = useT()
  const p = usePlayer()
  const song = songBySlug(def.slug)
  const cv = useRef<HTMLCanvasElement>(null)
  const [state, setState] = useState<'ready' | 'play' | 'over'>('ready')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(def.lives ?? 0)
  const [left, setLeft] = useState(def.seconds ?? 0)
  const [best, setBest] = useState(() => loadBest(def.slug))
  const [msg, setMsg] = useState('')
  const next = useMemo(() => nextGame(def.slug), [def.slug])

  const audio = useRef<AudioContext>()
  const tone = useCallback((f: number, d = 0.08, type: OscillatorType = 'triangle') => {
    const ac = audio.current; if (!ac) return
    const o = ac.createOscillator(), gn = ac.createGain(), now = ac.currentTime
    o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(0.0001, now); gn.gain.exponentialRampToValueAtTime(0.09, now + 0.01); gn.gain.exponentialRampToValueAtTime(0.0001, now + d)
    o.connect(gn).connect(ac.destination); o.start(now); o.stop(now + d + 0.02)
  }, [])

  // mutable game world (kept outside React state for 60 fps)
  const w = useRef<{ a: Api; s: unknown; fl: Floater[]; pt: Part[]; lives: number }>()
  const tr = useRef(t); tr.current = t

  const makeApi = useCallback((W: number, H: number): Api => {
    const a: Api = {
      W, H, U: Math.min(W, H) / 100, t: 0, dt: 0, ptr: { x: W / 2, y: H / 2, down: false, used: false }, keys: new Set(), sp: getSprites(), score: 0, playing: false,
      add(n, x, y, label) { a.score += n; if (x != null && y != null) a.pop(x, y, label ?? `+${n}`, '#fff7a8'); if (n > 0 && x != null) a.sfx('hit') },
      miss(x, y, label) {
        const W_ = w.current!; navigator.vibrate?.(40); a.sfx('miss')
        if (def.mode === 'lives') { W_.lives--; if (x != null && y != null) a.pop(x, y, label ?? '💔', '#ff6b6b'); if (W_.lives <= 0) a.over() }
        else { a.score = Math.max(0, a.score - 1); if (x != null && y != null) a.pop(x, y, `${label ? label + ' ' : ''}-1`, '#ff6b6b') }
      },
      over() { if (!a.playing) return; a.playing = false; finish() },
      pop(x, y, s, c = '#fff') { w.current?.fl.push({ x, y, s, c, t: 0 }) },
      burst(x, y, c, n = 10) { for (let i = 0; i < n; i++) { const an = Math.random() * 7, sp = a.U * (20 + Math.random() * 40); w.current?.pt.push({ x, y, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp, c, t: 0 }) } },
      sfx(kind, f) { if (kind === 'hit') tone(f ?? 660, 0.06); else if (kind === 'miss') tone(150, 0.2, 'sawtooth'); else { tone(523, 0.1); setTimeout(() => tone(659, 0.1), 80); setTimeout(() => tone(784, 0.16), 160) } },
      tone, tr: (s: string) => tr.current(s),
    }
    return a
  }, [def, tone]) // eslint-disable-line react-hooks/exhaustive-deps

  const finish = () => {
    const W_ = w.current!; const s = W_.a.score
    setScore(s); setLives(Math.max(0, W_.lives)); setState('over')
    const old = loadBest(def.slug)
    if (s > old) { saveBest(def.slug, s); setBest(s) }
    setMsg(s > old && old > 0 ? 'New record! 🏆' : s === 0 ? 'Oops! Try again 🐾' : pick(['Nice! One more try?', 'Great paws! 🐾', 'Mochi is proud of you! 💖']))
    track('game_over', { game: def.slug, score: s })
  }

  const size = () => { const r = cv.current!.getBoundingClientRect(); return [r.width, r.height] as const }

  const start = () => {
    if (!audio.current) { try { audio.current = new AudioContext() } catch { /* no audio */ } }
    audio.current?.resume?.()
    const [W, H] = size(); const a = makeApi(W, H); a.playing = true
    w.current = { a, s: def.init(a), fl: [], pt: [], lives: def.lives ?? 0 }
    setScore(0); setLives(def.lives ?? 0); setLeft(def.seconds ?? 0); setMsg(''); setState('play')
    track('game_start', { game: def.slug })
    if (song) { if (p.current?.slug !== song.slug) p.play(song); else if (!p.playing) p.toggle() }
  }

  // preview world for the start screen
  useEffect(() => { const [W, H] = size(); const a = makeApi(W, H); w.current = { a, s: def.init(a), fl: [], pt: [], lives: def.lives ?? 0 } }, [def, makeApi])

  // main loop
  useEffect(() => {
    const c = cv.current!, g = c.getContext('2d')!
    let raf = 0, last = performance.now(), hud = { sc: -1, lv: -1, lf: -1 }
    const fit = () => {
      const [W, H] = size(), dpr = Math.min(2.5, devicePixelRatio || 1)
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); g.setTransform(dpr, 0, 0, dpr, 0, 0)
      const a = w.current?.a; if (a && (Math.abs(a.W - W) > 1 || Math.abs(a.H - H) > 1)) { a.W = W; a.H = H; a.U = Math.min(W, H) / 100; if (!a.playing) w.current!.s = def.init(a) }
    }
    fit(); const ro = new ResizeObserver(fit); ro.observe(c)
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now
      const W_ = w.current
      if (W_) {
        const a = W_.a; a.dt = dt
        if (a.playing) {
          a.t += dt; def.update(W_.s, a)
          if (def.mode === 'time' && a.playing) { const l = Math.max(0, Math.ceil((def.seconds ?? 30) - a.t)); if (l !== hud.lf) { hud.lf = l; setLeft(l) } if (a.t >= (def.seconds ?? 30)) a.over() }
          if (a.score !== hud.sc) { hud.sc = a.score; setScore(a.score) }
          if (W_.lives !== hud.lv) { hud.lv = W_.lives; setLives(Math.max(0, W_.lives)) }
        }
        // draw
        const bg = g.createLinearGradient(0, 0, 0, a.H); bg.addColorStop(0, def.bg[0]); bg.addColorStop(1, def.bg[1])
        g.fillStyle = bg; g.fillRect(0, 0, a.W, a.H)
        g.save(); def.draw(W_.s, g, a); g.restore()
        W_.pt = W_.pt.filter(q => (q.t += dt) < 0.6)
        for (const q of W_.pt) { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += a.U * 80 * dt; g.globalAlpha = 1 - q.t / 0.6; g.fillStyle = q.c; g.beginPath(); g.arc(q.x, q.y, a.U * 1.2, 0, 7); g.fill() }
        W_.fl = W_.fl.filter(f => (f.t += dt) < 0.9)
        for (const f of W_.fl) {
          g.globalAlpha = Math.min(1, 2 * (1 - f.t / 0.9)); const sz = a.U * 5.5 * (1 + Math.min(0.3, f.t * 2) - f.t * 0.2)
          g.font = `${sz}px "Lilita One","Jua",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = sz * 0.2; g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineJoin = 'round'
          g.strokeText(f.s, f.x, f.y - f.t * a.U * 14); g.fillStyle = f.c; g.fillText(f.s, f.x, f.y - f.t * a.U * 14)
        }
        g.globalAlpha = 1
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [def])

  // keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const W_ = w.current; if (!W_?.a.playing) return
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) e.preventDefault()
      if (!W_.a.keys.has(e.key)) def.key?.(W_.s, e.key, W_.a)
      W_.a.keys.add(e.key)
    }
    const up = (e: KeyboardEvent) => { w.current?.a.keys.delete(e.key) }
    window.addEventListener('keydown', down); window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [def])

  const pos = (e: React.PointerEvent) => { const r = cv.current!.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] as const }
  const onDown = (e: React.PointerEvent) => {
    const W_ = w.current; if (!W_?.a.playing) return
    const [x, y] = pos(e); Object.assign(W_.a.ptr, { x, y, down: true, used: true })
    def.tap?.(W_.s, x, y, W_.a)
  }
  const onMove = (e: React.PointerEvent) => { const W_ = w.current; if (!W_?.a.playing) return; const [x, y] = pos(e); Object.assign(W_.a.ptr, { x, y, used: true }) }
  const onUp = () => { if (w.current) w.current.a.ptr.down = false }

  const share = async () => {
    const text = `I scored ${score} in “${def.name}” with Mochi Cat! 🐾 Can you beat me? #MochiCat`
    try { if (navigator.share) await navigator.share({ title: `${def.name} — Mochi Cat`, text, url: location.href }); else { await navigator.clipboard.writeText(`${text} ${location.href}`); setMsg('Copied! Paste it anywhere 📋') } } catch { /* cancelled */ }
  }

  return (
    <main className="relative z-10 mx-auto max-w-xl px-4 pb-36 pt-24">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0"><BackButton className="!mb-3" /><h1 className={`t3d t3d-cyan leading-none ${def.name.length > 14 ? 'text-[26px] sm:text-4xl' : 'text-[34px] sm:text-5xl'}`}>{def.name}</h1></div>
        <div className="shrink-0 text-right text-sm text-white/70">
          <div>{t('Score')} <b className="text-2xl text-white">{score}</b></div>
          <div>{t('Best')} {best} · {def.mode === 'lives' ? ('❤️'.repeat(lives) || '💔') : `⏱ ${left}s`}</div>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
        <canvas ref={cv} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
          className="block h-[clamp(340px,calc(100svh-300px),620px)] w-full touch-none select-none" />
        {state !== 'play' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/50 p-6 text-center backdrop-blur-[3px]">
            {state === 'over' ? (<>
              <div className="t3d text-7xl">{score}</div>
              <div className="text-lg">{t(msg)}</div>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="pulse-wrap"><button onClick={start} className="btn3d btn-yellow text-[18px]">{t('🔁 Play again')}</button></span>
                <button onClick={share} className="btn3d btn-cyan text-[18px]">{t('📤 Share score')}</button>
              </div>
              <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-sm">
                {song && <><Link to={`/music/${song.slug}`} className="underline">{t('Lyrics & song')}</Link>·</>}
                <Link to={`/games/${next.slug}`} className="underline">{t('Next game')}: {next.name} →</Link>·
                <a href={ARTIST.subscribe} target="_blank" rel="noopener" className="underline">{t('Subscribe')}</a>
              </div>
            </>) : (<>
              {song && <img src={cover(song)} alt="" className="anim-float h-24 w-24 rounded-2xl object-cover shadow-xl ring-4 ring-white/20" />}
              {(() => { const c = CTRL_TEXT[CTRL[def.slug] ?? 'target']; return (
                <div className="flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-2.5 text-left ring-1 ring-white/25">
                  <span className="anim-wobble text-[30px] leading-none">{c[0]}</span>
                  <span className="t3d-sm text-[18px] leading-tight">{t(isTouch() ? c[1] : c[2])}</span>
                </div>) })()}
              <div className="max-w-sm text-[16px] leading-snug text-white/90">{t(def.how)}</div>
              <span className="pulse-wrap"><button onClick={start} className="btn3d btn-pink text-[24px]">{t('▶ Start')} {def.emoji}</button></span>
              {song && <div className="text-sm text-white/60">🎵 {t('with the song')} “{song.title}”</div>}
            </>)}
          </div>
        )}
      </div>
      <p className="mt-4 text-center text-sm text-white/55">{t(def.desc)}</p>
    </main>
  )
}
