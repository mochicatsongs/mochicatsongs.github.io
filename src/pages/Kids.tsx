import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

/** Kids zone (/k): opened from the QR codes in the Mochi Cat kids coloring book.
 *  No navbar, no YouTube, no outside links except the book (marked for grown-ups), no analytics. */
const B = import.meta.env.BASE_URL
type Sec = { slug: string; emoji: string; title: string; ko: string; color: string; songs: [string, string][] }
export const KID_SECTIONS: Sec[] = [
  { slug: 'food', emoji: '🍕', title: 'Food & Sport', ko: '음식과 운동', color: '#ff8a5c', songs: [['the-chubby-super-cat', 'The Chubby Super Cat'], ['nom-nom-nom', 'Nom Nom Nom'], ['belly-bounce', 'Belly Bounce']] },
  { slug: 'music', emoji: '🎤', title: 'Music Star', ko: '뮤직 스타', color: '#ff5fa2', songs: [['shine-like-mochi', 'Shine Like Mochi'], ['mochi-dance', 'Mochi Dance'], ['meow-meow-mochi-cat', 'Meow Meow (Mochi Cat)'], ['super-paw-rock', 'Super Paw Rock']] },
  { slug: 'home', emoji: '🏠', title: 'Cozy Home', ko: '아늑한 집', color: '#7c6cff', songs: [['mochi-heart', 'Mochi Heart'], ['mochi-mode', 'Mochi Mode'], ['milkshake-shake', 'Milkshake Shake'], ['mochi-mochi-challenge', 'Mochi Mochi Challenge']] },
  { slug: 'travel', emoji: '✈️', title: 'Travel', ko: '여행', color: '#25b4e8', songs: [['meow-in-every-language', 'Meow in Every Language'], ['mochi-fiesta', 'Mochi Fiesta'], ['mochi-farm', 'Mochi Farm'], ['mochi-dance', 'Mochi Dance']] },
  { slug: 'dreams', emoji: '🚀', title: 'Dream Jobs', ko: '꿈의 직업', color: '#2ec27e', songs: [['catch-the-dot', 'Catch the Dot'], ['mochi-obby', 'Mochi Obby'], ['the-chubby-super-cat', 'The Chubby Super Cat'], ['shine-like-mochi', 'Shine Like Mochi']] },
]
const VIDEOS: Record<string, string> = { food: 'food', music: 'music', home: 'home', travel: 'travel', dreams: 'dreams' }
const ALL_SONGS: [string, string][] = [...new Map(KID_SECTIONS.flatMap(x => x.songs).map(x => [x[0], x] as const)).values()]
const BOOK_URL = '' // Amazon link goes here when the book is live

function useKidsPage(title: string) {
  useEffect(() => {
    const prev = document.title
    document.title = title
    document.body.classList.add('kids-zone')
    // only one sound at a time: starting a video pauses the player and vice versa
    const solo = (e: Event) => {
      document.querySelectorAll<HTMLMediaElement>('audio,video').forEach(m => { if (m !== e.target && !m.paused) m.pause() })
    }
    document.addEventListener('play', solo, true)
    return () => { document.title = prev; document.body.classList.remove('kids-zone'); document.removeEventListener('play', solo, true) }
  }, [title])
}

type Rep = 'all' | 'one' | 'off'
// one shared <audio> for the whole kids zone: once a phone has "unlocked" it with a tap,
// every later section can start its own music by itself
let SHARED: HTMLAudioElement | null = null
const sharedAudio = () => {
  if (!SHARED) { SHARED = document.createElement('audio'); SHARED.preload = 'auto'; SHARED.setAttribute('playsinline', ''); document.body.appendChild(SHARED) }
  return SHARED
}
function Playlist({ songs, color }: { songs: [string, string][]; color: string }) {
  const ref = useRef<HTMLAudioElement | null>(null)
  const [cur, setCur] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [needTap, setNeedTap] = useState(false)
  const [rep, setRep] = useState<Rep>('all')
  const [shuffle, setShuffle] = useState(true)
  const played = useRef<Set<number>>(new Set())
  const [t, setT] = useState(0); const [d, setD] = useState(0)
  const curRef = useRef(0)
  const rnd = () => {
    const c = curRef.current
    if (songs.length < 2) return c
    let left = songs.map((_, i) => i).filter(i => i !== c && !played.current.has(i))
    if (!left.length) { played.current.clear(); left = songs.map((_, i) => i).filter(i => i !== c) }
    return left[Math.floor(Math.random() * left.length)]
  }
  const start = (a: HTMLAudioElement) => a.play().then(() => setNeedTap(false)).catch((e: DOMException) => { if (e?.name === 'NotAllowedError') setNeedTap(true) })
  const go = (i: number, play = true) => {
    const a = ref.current; if (!a) return
    played.current.add(i); curRef.current = i
    setCur(i); setT(0); setD(0); a.src = `${B}audio/${songs[i][0]}.mp3`; a.currentTime = 0
    if (play) void start(a)
  }
  const next = () => go(shuffle ? rnd() : (cur + 1) % songs.length)
  const toggle = () => { const a = ref.current; if (!a) return; if (!a.src) go(cur); else if (a.paused) void start(a); else a.pause() }
  const ended = () => {
    const c = curRef.current
    if (rep === 'one') return go(c)
    if (shuffle) {
      if (rep === 'off' && songs.every((_, i) => played.current.has(i))) { played.current.clear(); return setPlaying(false) }
      return go(rnd())
    }
    if (c + 1 < songs.length) return go(c + 1)
    if (rep === 'all') return go(0)
    setPlaying(false)
  }
  const endedRef = useRef(ended); endedRef.current = ended
  // on entering a page: this page's music starts right away (random song, shuffle is on by default).
  // Browsers block sound before the first tap — then the first tap anywhere starts it.
  useEffect(() => {
    const a = sharedAudio(); ref.current = a
    const on = { play: () => setPlaying(true), pause: () => setPlaying(false), ended: () => endedRef.current(),
      timeupdate: () => setT(a.currentTime), loadedmetadata: () => setD(a.duration) } as Record<string, () => void>
    Object.entries(on).forEach(([k, f]) => a.addEventListener(k, f))
    go(Math.floor(Math.random() * songs.length))
    const kick = (e: Event) => {
      if ((e.target as HTMLElement)?.closest?.('video, [data-player]')) return // player/video buttons handle themselves
      if (a.paused && a.src) void start(a)
    }
    document.addEventListener('pointerdown', kick, { once: true })
    return () => { Object.entries(on).forEach(([k, f]) => a.removeEventListener(k, f)); document.removeEventListener('pointerdown', kick); a.pause() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const repLabel = rep === 'all' ? '🔁 Repeat all' : rep === 'one' ? '🔂 Repeat one' : '➡️ No repeat'
  const fmt = (x: number) => `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, '0')}`
  return (
    <div data-player className="rounded-[2rem] p-4 shadow-xl" style={{ background: `linear-gradient(160deg, ${color}, ${color}cc 55%, #ffffff)` }}>
      <div className="rounded-[1.6rem] bg-white/95 p-4">
        {needTap && !playing && (
          <button onClick={toggle} className="mb-3 w-full animate-pulse rounded-2xl py-3 text-lg font-bold text-white shadow" style={{ background: color }}>🎵 Tap to start the music! · 눌러서 노래 듣기</button>
        )}
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <img src={`${B}covers/${songs[cur][0]}.jpg`} alt="" className={`h-44 w-44 rounded-[1.4rem] object-cover shadow-lg ${playing ? 'kid-bop' : ''}`} />
          <div className="w-full min-w-0 flex-1 text-center sm:text-left">
            <div className="text-sm font-semibold uppercase tracking-wider opacity-60">Mochi Radio 📻</div>
            <div className="truncate text-2xl font-bold">{songs[cur][1]}</div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#2b2f6b]/10"><div className="h-full rounded-full transition-[width]" style={{ width: d ? `${(t / d) * 100}%` : '0%', background: color }} /></div>
            <div className="mt-1 text-xs opacity-70">{fmt(t)} / {d ? fmt(d) : '–:––'}</div>
            <div className="mt-3 flex items-center justify-center gap-3">
              <button onClick={() => setRep(rep === 'all' ? 'one' : rep === 'one' ? 'off' : 'all')} aria-label={repLabel} title={repLabel} className="grid h-14 w-14 place-items-center rounded-full text-2xl text-white active:scale-95" style={{ background: rep === 'off' ? '#9aa0b8' : color }}>{rep === 'one' ? '🔂' : rep === 'all' ? '🔁' : '➡️'}</button>
              <button onClick={() => go((cur - 1 + songs.length) % songs.length)} aria-label="Previous song" className="grid h-14 w-14 place-items-center rounded-full bg-[#2b2f6b]/10 text-2xl active:scale-95">⏮</button>
              <button onClick={toggle} aria-label={playing ? 'Pause' : 'Play'} className="grid h-20 w-20 place-items-center rounded-full text-4xl text-white shadow-lg active:scale-95" style={{ background: color }}>{playing ? '❚❚' : '▶'}</button>
              <button onClick={next} aria-label="Next song" className="grid h-14 w-14 place-items-center rounded-full bg-[#2b2f6b]/10 text-2xl active:scale-95">⏭</button>
              <button onClick={() => setShuffle(!shuffle)} aria-label={shuffle ? 'Shuffle on' : 'Shuffle off'} aria-pressed={shuffle} title={shuffle ? 'Shuffle on' : 'Shuffle off'} className="grid h-14 w-14 place-items-center rounded-full text-2xl text-white active:scale-95" style={{ background: shuffle ? color : '#9aa0b8' }}>🔀</button>
            </div>
            <div className="mt-1 text-center text-xs font-semibold opacity-70">{repLabel} · {shuffle ? '🔀 Shuffle on' : 'Shuffle off'}</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {songs.map(([sl, title], i) => (
            <button key={sl + i} onClick={() => go(i)} className={`overflow-hidden rounded-2xl bg-white text-left shadow transition active:scale-95 ${i === cur ? 'ring-4' : ''}`} style={i === cur ? { ['--tw-ring-color' as string]: color } : undefined}>
              <img src={`${B}covers/${sl}.jpg`} alt="" className="aspect-square w-full object-cover" />
              <div className="truncate px-2 py-1 text-sm font-semibold">{i === cur && playing ? '🎵 ' : ''}{title}</div>
            </button>
          ))}
        </div>
        <p className="mt-3 text-center text-sm opacity-70">Songs keep playing while you color 🎨 · 색칠하는 동안 노래가 계속 나와요</p>
      </div>
    </div>
  )
}

// own simple controls: no dark native overlay on phones, one big friendly button, tap anywhere to play/pause
function Video({ slug }: { slug: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [p, setP] = useState(0)
  useEffect(() => { const v = ref.current; return () => { v?.pause() } }, [])
  const toggle = () => { const v = ref.current; if (!v) return; if (v.paused) { if (v.ended) v.currentTime = 0; void v.play() } else v.pause() }
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = ref.current; if (!v || !v.duration) return
    const r = e.currentTarget.getBoundingClientRect(); v.currentTime = ((e.clientX - r.left) / r.width) * v.duration
  }
  return (
    <div data-player className="relative mx-auto w-full max-w-[320px] overflow-hidden rounded-3xl bg-white shadow-xl">
      <video ref={ref} playsInline preload="none" poster={`${B}kids/videos/${slug}.jpg`} onClick={toggle}
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
        onTimeUpdate={e => setP(e.currentTarget.duration ? e.currentTarget.currentTime / e.currentTarget.duration : 0)}
        className="block w-full cursor-pointer">
        <source src={`${B}kids/videos/${slug}.mp4`} type="video/mp4" />
      </video>
      {!playing && (
        <button onClick={toggle} aria-label="Play video" className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#e0567a] pl-1 text-4xl text-white shadow-xl ring-4 ring-white active:scale-95">▶</button>
      )}
      <div onClick={seek} className="absolute inset-x-4 bottom-3 h-3 cursor-pointer overflow-hidden rounded-full bg-[#2b2f6b]/15" role="progressbar" aria-valuenow={Math.round(p * 100)}>
        <div className="h-full rounded-full bg-[#e0567a]" style={{ width: `${p * 100}%` }} />
      </div>
    </div>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#7fd6ff] via-[#c9efff] to-[#fff6d6] pb-16 text-[#2b2f6b]">
      <div className="mx-auto max-w-3xl px-4 pt-6">{children}</div>
    </div>
  )
}

function Book() {
  return (
    <div className="mt-10 flex flex-col items-center gap-5 rounded-3xl bg-white p-5 shadow-lg sm:flex-row">
      <img src={`${B}kids/book-cover.jpg`} alt="Mochi Cat Coloring Book cover" className="w-40 rounded-xl shadow" />
      <div>
        <div className="text-2xl font-bold">Mochi Cat Coloring Book</div>
        <p className="mt-1">44 bold &amp; easy pages, fun moves, Korean words and activities · ages 4–8</p>
        {BOOK_URL
          ? <a href={BOOK_URL} target="_blank" rel="noopener" className="mt-3 inline-block rounded-full bg-[#ff6b8b] px-6 py-2 font-semibold text-white">For grown-ups: get the book on Amazon</a>
          : <span className="mt-3 inline-block rounded-full bg-[#ffd23f] px-6 py-2 font-semibold">Coming soon on Amazon</span>}
      </div>
    </div>
  )
}

function Grownups() {
  return (
    <p className="mt-10 rounded-2xl bg-white/70 p-4 text-sm">
      <b>For grown-ups:</b> this kids page has no ads, no sign-up and no tracking. Songs play right here — no YouTube needed.
      <br />There is also a cozy coloring book for adults, <i>Cozy Cat</i>, on the main site.
    </p>
  )
}

export function KidsHome() {
  useKidsPage('Color with Mochi! 🐾 Kids zone')
  return (
    <Shell>
      <div className="flex flex-col items-center gap-4 rounded-[2rem] bg-white/80 p-6 text-center shadow-xl sm:flex-row sm:text-left">
        <img src={`${B}kids/mochi.png`} alt="Mochi the cat" className="w-40 sm:w-48" />
        <div>
          <h1 className="font-heading text-5xl text-[#ff6b8b] sm:text-6xl">Color with Mochi!</h1>
          <p className="mt-2 text-lg">Hi! I’m Mochi 🐾 Pick your page, play my song and color with me!</p>
          <p className="text-base opacity-80">안녕! 나는 모치야. 노래를 틀고 같이 색칠하자!</p>
        </div>
      </div>
      <h2 className="mt-8 text-2xl font-bold">🎵 Which part of the book are you coloring?</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {KID_SECTIONS.map(s => (
          <Link key={s.slug} to={`/k/${s.slug}`} className="overflow-hidden rounded-3xl bg-white shadow-lg transition hover:-translate-y-1">
            <img src={`${B}kids/${s.slug}.png`} alt="" className="aspect-square w-full object-cover" />
            <div className="p-3 text-center text-lg font-bold text-white" style={{ background: s.color }}>{s.emoji} {s.title}</div>
          </Link>
        ))}
      </div>
      <h2 className="mt-10 text-2xl font-bold">📻 Mochi Radio — all songs</h2>
      <div className="mt-4"><Playlist songs={ALL_SONGS} color="#ff6b8b" /></div>
      <h2 className="mt-10 text-2xl font-bold">🎬 Watch Mochi get colored!</h2>
      <p className="opacity-80">Press play, sing along — then color your own page!</p>
      <div className="mt-4 flex snap-x gap-4 overflow-x-auto pb-3">
        {KID_SECTIONS.filter(s => VIDEOS[s.slug]).map(s => (
          <div key={s.slug} className="w-56 shrink-0 snap-start"><Video slug={VIDEOS[s.slug]} /><div className="mt-2 text-center font-semibold">{s.emoji} {s.title}</div></div>
        ))}
      </div>
      <h2 className="mt-10 text-2xl font-bold">🖨️ Free pages to print</h2>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
          <a key={i} href={`${B}kids/free-page-${i}.pdf`} target="_blank" rel="noopener" className="rounded-2xl bg-white p-2 shadow">
            <img src={`${B}kids/free-page-${i}.png`} alt={`Free coloring page ${i}`} className="w-full rounded-lg" />
            <div className="mt-1 text-center text-sm font-semibold">Print ⬇</div>
          </a>
        ))}
      </div>
      <Book />
      <Grownups />
    </Shell>
  )
}

export function KidsSection() {
  const { slug } = useParams()
  const s = KID_SECTIONS.find(x => x.slug === slug)
  useKidsPage(s ? `${s.title} — Color with Mochi!` : 'Color with Mochi!')
  if (!s) return <KidsHome />
  return (
    <Shell>
      <Link to="/k" className="inline-block rounded-full bg-white px-4 py-2 font-semibold shadow">← All pages</Link>
      <div className="mt-4 overflow-hidden rounded-[2rem] bg-white shadow-xl">
        <div className="p-5 text-center text-white" style={{ background: s.color }}>
          <div className="text-5xl">{s.emoji}</div>
          <h1 className="font-heading text-4xl sm:text-5xl">{s.title}</h1>
          <div className="opacity-90">{s.ko}</div>
        </div>
        <img src={`${B}kids/${s.slug}.png`} alt="" className="mx-auto w-64" />
      </div>
      {VIDEOS[s.slug] && (<>
        <h2 className="mt-8 text-2xl font-bold">🎬 Watch Mochi get colored!</h2>
        <div className="mt-4"><Video key={s.slug} slug={VIDEOS[s.slug]} /></div>
      </>)}
      <h2 className="mt-8 text-2xl font-bold">🎵 Press play and color!</h2>
      <div className="mt-4"><Playlist key={s.slug} songs={s.songs} color={s.color} /></div>
      <p className="mt-4 text-center text-lg">★ Don’t forget your Mochi move on the page! ★</p>
      <h2 className="mt-10 text-xl font-bold">More from the book</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {KID_SECTIONS.filter(x => x.slug !== s.slug).map(x => (
          <Link key={x.slug} to={`/k/${x.slug}`} className="rounded-full px-4 py-2 font-semibold text-white shadow" style={{ background: x.color }}>{x.emoji} {x.title}</Link>
        ))}
      </div>
      <Book />
      <Grownups />
    </Shell>
  )
}
