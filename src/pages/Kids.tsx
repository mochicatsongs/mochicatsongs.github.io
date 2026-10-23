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

/* ---- Language: Korean or English, picked from the phone/computer language, switchable, remembered ---- */
type Lang = 'en' | 'ko'
const T = {
  en: {
    docHome: 'Color with Mochi! 🐾 Kids zone', heroTitle: 'Color with Mochi!',
    heroHi: 'Hi! I’m Mochi 🐾 Pick your page, play my song and color with me!',
    whichPart: '🎵 Which part of the book are you coloring?', radioAll: '📻 Mochi Radio — all songs',
    watch: '🎬 Watch Mochi get colored!', watchSub: 'Press play, sing along — then color your own page!',
    free: '🖨️ Free pages to print', print: 'Print ↓',
    tapStart: '🎵 Tap to start the music!', radio: 'Mochi Radio 📻',
    repAll: 'Repeat all', repOne: 'Repeat one', repOff: 'No repeat', shufOn: 'Shuffle on', shufOff: 'Shuffle off',
    keepPlaying: 'Songs keep playing while you color 🎨',
    back: '← All pages', pressPlay: '🎵 Press play and color!', move: '★ Don’t forget your Mochi move on the page! ★', more: 'More from the book',
    bookTitle: 'Mochi Cat Coloring Book', bookDesc: '44 bold & easy pages, fun moves, Korean words and activities · ages 4–8',
    buy: 'For grown-ups: get the book on Amazon', soon: 'Coming soon on Amazon',
    gTitle: 'For grown-ups:', gText: 'this kids page has no ads, no sign-up and no tracking. Songs play right here — no YouTube needed.',
    gAdult: 'There is also a cozy coloring book for adults, Cozy Cat, on the main site.',
    switchTo: '한국어',
  },
  ko: {
    docHome: '모치랑 색칠해요! 🐾 키즈 존', heroTitle: '모치랑 색칠해요!',
    heroHi: '안녕! 나는 모치야 🐾 페이지를 고르고, 노래를 틀고, 나랑 같이 색칠하자!',
    whichPart: '🎵 책의 어느 부분을 색칠하고 있어?', radioAll: '📻 모치 라디오 — 모든 노래',
    watch: '🎬 모치가 색칠되는 걸 봐요!', watchSub: '재생을 누르고 같이 노래해요 — 그다음 내 그림도 색칠해요!',
    free: '🖨️ 무료 색칠 도안', print: '프린트 ↓',
    tapStart: '🎵 눌러서 노래 듣기!', radio: '모치 라디오 📻',
    repAll: '전체 반복', repOne: '한 곡 반복', repOff: '반복 안 함', shufOn: '랜덤 재생', shufOff: '순서대로 재생',
    keepPlaying: '색칠하는 동안 노래가 계속 나와요 🎨',
    back: '← 전체 페이지', pressPlay: '🎵 노래 틀고 색칠해요!', move: '★ 페이지에 있는 모치 동작도 꼭 따라 해요! ★', more: '책 속 다른 페이지',
    bookTitle: '모치 캣 색칠공부 책', bookDesc: '굵은 선의 쉬운 그림 44장, 신나는 동작과 놀이, 영어·한국어 단어 · 4–8세',
    buy: '보호자용: 아마존에서 책 보기', soon: '아마존 출시 예정',
    gTitle: '보호자분께:', gText: '이 어린이 페이지에는 광고, 회원가입, 추적이 없어요. 노래는 여기서 바로 재생돼요 — 유튜브가 필요 없어요.',
    gAdult: '어른을 위한 컬러링북 Cozy Cat도 메인 사이트에 있어요.',
    switchTo: 'English',
  },
} as const
const LANG_KEY = 'mochi-kids-lang'
const detectLang = (): Lang => {
  try { const v = localStorage.getItem(LANG_KEY); if (v === 'en' || v === 'ko') return v } catch { /* storage blocked */ }
  const list = typeof navigator !== 'undefined' ? (navigator.languages?.length ? navigator.languages : [navigator.language]) : []
  return list.some(l => l?.toLowerCase().startsWith('ko')) ? 'ko' : 'en'
}
let LANG: Lang = 'en'
const langSubs = new Set<(l: Lang) => void>()
const setLang = (l: Lang) => {
  LANG = l; try { localStorage.setItem(LANG_KEY, l) } catch { /* ignore */ }
  document.documentElement.lang = l; langSubs.forEach(f => f(l))
}
function useLang() {
  const [l, set] = useState<Lang>(LANG)
  useEffect(() => {
    langSubs.add(set)
    const d = detectLang(); if (d !== LANG) setLang(d); else { set(d); document.documentElement.lang = d }
    return () => { langSubs.delete(set) }
  }, [])
  return { lang: l, t: T[l] }
}
const secTitle = (s: Sec, l: Lang) => (l === 'ko' ? s.ko : s.title)

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
    return () => {
      document.title = prev; document.body.classList.remove('kids-zone')
      document.removeEventListener('play', solo, true)
    }
  }, [title])
}

// drawn icons: iPhones turn ▶ ⏮ 🔁 into blue emoji boxes, so the buttons use simple shapes instead
const Ico = ({ d, className = 'h-7 w-7' }: { d: string; className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true"><path d={d} /></svg>
)
const I = {
  play: 'M8 5.5v13a1 1 0 0 0 1.5.87l10.4-6.5a1 1 0 0 0 0-1.74L9.5 4.63A1 1 0 0 0 8 5.5z',
  pause: 'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z',
  prev: 'M6 5h2.5v14H6zM20 6.2v11.6a.9.9 0 0 1-1.4.75L10 12.75a.9.9 0 0 1 0-1.5l8.6-5.8A.9.9 0 0 1 20 6.2z',
  next: 'M15.5 5H18v14h-2.5zM4 6.2v11.6a.9.9 0 0 0 1.4.75L14 12.75a.9.9 0 0 0 0-1.5L5.4 5.45A.9.9 0 0 0 4 6.2z',
  repeat: 'M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z',
  shuffle: 'M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z',
  stop: 'M5 11h10.2l-3.6-3.6L13 6l6 6-6 6-1.4-1.4 3.6-3.6H5z',
}
type Rep = 'all' | 'one' | 'off'
// one shared <audio> for the whole kids zone: once a phone has "unlocked" it with a tap,
// every later section can start its own music by itself
let SHARED: HTMLAudioElement | null = null
const sharedAudio = () => {
  if (!SHARED) { SHARED = document.createElement('audio'); SHARED.preload = 'auto'; SHARED.setAttribute('playsinline', ''); document.body.appendChild(SHARED) }
  return SHARED
}
// music paused by a video comes back from the same moment when the video is paused or finished
let RESUME = false
const resumeMusic = () => { if (RESUME && SHARED && SHARED.paused && SHARED.src) void SHARED.play().catch(() => {}); RESUME = false }
function Playlist({ songs, color }: { songs: [string, string][]; color: string }) {
  const { t: tx } = useLang()
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
    RESUME = false
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
  const repLabel = rep === 'all' ? tx.repAll : rep === 'one' ? tx.repOne : tx.repOff
  const fmt = (x: number) => `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, '0')}`
  return (
    <div data-player className="rounded-[2rem] p-4 shadow-xl" style={{ background: `linear-gradient(160deg, ${color}, ${color}cc 55%, #ffffff)` }}>
      <div className="rounded-[1.6rem] bg-white/95 p-4">
        {needTap && !playing && (
          <button onClick={toggle} className="mb-3 w-full animate-pulse rounded-2xl py-3 text-lg font-bold text-white shadow" style={{ background: color }}>{tx.tapStart}</button>
        )}
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <img src={`${B}covers/${songs[cur][0]}.jpg`} alt="" className={`h-44 w-44 rounded-[1.4rem] object-cover shadow-lg ${playing ? 'kid-bop' : ''}`} />
          <div className="w-full min-w-0 flex-1 text-center sm:text-left">
            <div className="text-sm font-semibold uppercase tracking-wider opacity-60">{tx.radio}</div>
            <div className="truncate text-2xl font-bold">{songs[cur][1]}</div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#2b2f6b]/10"><div className="h-full rounded-full transition-[width]" style={{ width: d ? `${(t / d) * 100}%` : '0%', background: color }} /></div>
            <div className="mt-1 text-xs opacity-70">{fmt(t)} / {d ? fmt(d) : '–:––'}</div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <button onClick={() => setRep(rep === 'all' ? 'one' : rep === 'one' ? 'off' : 'all')} aria-label={repLabel} title={repLabel} className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-2xl text-white active:scale-95" style={{ background: rep === 'off' ? '#9aa0b8' : color }}>{rep === 'off' ? <Ico d={I.stop} /> : <span className="relative"><Ico d={I.repeat} />{rep === 'one' && <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-white text-xs font-bold" style={{ color }}>1</span>}</span>}</button>
              <button onClick={() => go((cur - 1 + songs.length) % songs.length)} aria-label="Previous song" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#2b2f6b]/10 text-2xl active:scale-95">{<Ico d={I.prev} />}</button>
              <button onClick={toggle} aria-label={playing ? 'Pause' : 'Play'} className="grid h-16 w-16 shrink-0 place-items-center rounded-full text-4xl text-white shadow-lg active:scale-95" style={{ background: color }}>{playing ? <Ico d={I.pause} className="h-10 w-10" /> : <Ico d={I.play} className="h-10 w-10" />}</button>
              <button onClick={next} aria-label="Next song" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#2b2f6b]/10 text-2xl active:scale-95">{<Ico d={I.next} />}</button>
              <button onClick={() => setShuffle(!shuffle)} aria-label={shuffle ? 'Shuffle on' : 'Shuffle off'} aria-pressed={shuffle} title={shuffle ? 'Shuffle on' : 'Shuffle off'} className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-2xl text-white active:scale-95" style={{ background: shuffle ? color : '#9aa0b8' }}><Ico d={I.shuffle} /></button>
            </div>
            <div className="mt-1 text-center text-xs font-semibold opacity-70">{repLabel} · {shuffle ? tx.shufOn : tx.shufOff}</div>
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
        <p className="mt-3 text-center text-sm opacity-70">{tx.keepPlaying}</p>
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
  const toggle = () => {
    const v = ref.current; if (!v) return
    if (v.paused) {
      if (SHARED && !SHARED.paused) { RESUME = true; SHARED.pause() }
      if (v.ended) v.currentTime = 0; void v.play()
    } else { v.pause(); resumeMusic() }
  }
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = ref.current; if (!v || !v.duration) return
    const r = e.currentTarget.getBoundingClientRect(); v.currentTime = ((e.clientX - r.left) / r.width) * v.duration
  }
  return (
    <div data-player className="relative mx-auto w-full max-w-[320px] overflow-hidden rounded-3xl bg-white shadow-xl">
      <video ref={ref} playsInline preload="none" poster={`${B}kids/videos/${slug}.jpg`} onClick={toggle}
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => { setPlaying(false); resumeMusic() }}
        onTimeUpdate={e => setP(e.currentTarget.duration ? e.currentTarget.currentTime / e.currentTarget.duration : 0)}
        className="block w-full cursor-pointer">
        <source src={`${B}kids/videos/${slug}.mp4`} type="video/mp4" />
      </video>
      {!playing && (
        <button onClick={toggle} aria-label="Play video" className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#e0567a] pl-1 text-4xl text-white shadow-xl ring-4 ring-white active:scale-95"><Ico d={I.play} className="h-10 w-10" /></button>
      )}
      <div onClick={seek} className="absolute inset-x-4 bottom-3 h-3 cursor-pointer overflow-hidden rounded-full bg-[#2b2f6b]/15" role="progressbar" aria-valuenow={Math.round(p * 100)}>
        <div className="h-full rounded-full bg-[#e0567a]" style={{ width: `${p * 100}%` }} />
      </div>
    </div>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  const { lang, t } = useLang()
  return (
    <div className={`min-h-screen bg-gradient-to-b from-[#7fd6ff] via-[#c9efff] to-[#fff6d6] pb-16 text-[#2b2f6b] ${lang === 'ko' ? 'kids-ko' : ''}`}>
      <div className="mx-auto max-w-3xl px-4 pt-4">
        <div className="mb-3 flex justify-end">
          <button onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')} lang={lang === 'ko' ? 'en' : 'ko'}
            className="rounded-full bg-white/90 px-4 py-2 text-sm font-bold shadow active:scale-95">🌐 {t.switchTo}</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Book() {
  const { t } = useLang()
  return (
    <div className="mt-10 flex flex-col items-center gap-5 rounded-3xl bg-white p-5 shadow-lg sm:flex-row">
      <img src={`${B}kids/book-cover.jpg`} alt="Mochi Cat Coloring Book cover" className="w-40 rounded-xl shadow" />
      <div>
        <div className="text-2xl font-bold">{t.bookTitle}</div>
        <p className="mt-1">{t.bookDesc}</p>
        {BOOK_URL
          ? <a href={BOOK_URL} target="_blank" rel="noopener" className="mt-3 inline-block rounded-full bg-[#ff6b8b] px-6 py-2 font-semibold text-white">{t.buy}</a>
          : <span className="mt-3 inline-block rounded-full bg-[#ffd23f] px-6 py-2 font-semibold">{t.soon}</span>}
      </div>
    </div>
  )
}

function Grownups() {
  const { t } = useLang()
  return (
    <p className="mt-10 rounded-2xl bg-white/70 p-4 text-sm">
      <b>{t.gTitle}</b> {t.gText}
      <br />{t.gAdult}
    </p>
  )
}

export function KidsHome() {
  const { lang, t } = useLang()
  useKidsPage(t.docHome)
  return (
    <Shell>
      <div className="flex flex-col items-center gap-4 rounded-[2rem] bg-white/80 p-6 text-center shadow-xl sm:flex-row sm:text-left">
        <img src={`${B}kids/mochi.png`} alt="Mochi the cat" className="w-40 sm:w-48" />
        <div>
          <h1 className="font-heading text-5xl text-[#ff6b8b] sm:text-6xl">{t.heroTitle}</h1>
          <p className="mt-2 text-lg">{t.heroHi}</p>
        </div>
      </div>
      <h2 className="mt-8 text-2xl font-bold">{t.whichPart}</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {KID_SECTIONS.map(s => (
          <Link key={s.slug} to={`/k/${s.slug}`} className="overflow-hidden rounded-3xl bg-white shadow-lg transition hover:-translate-y-1">
            <img src={`${B}kids/${s.slug}.png`} alt="" className="aspect-square w-full object-cover" />
            <div className="p-3 text-center text-lg font-bold text-white" style={{ background: s.color }}>{s.emoji} {secTitle(s, lang)}</div>
          </Link>
        ))}
      </div>
      <h2 className="mt-10 text-2xl font-bold">{t.radioAll}</h2>
      <div className="mt-4"><Playlist songs={ALL_SONGS} color="#ff6b8b" /></div>
      <h2 className="mt-10 text-2xl font-bold">{t.watch}</h2>
      <p className="opacity-80">{t.watchSub}</p>
      <div className="mt-4 flex snap-x gap-4 overflow-x-auto pb-3">
        {KID_SECTIONS.filter(s => VIDEOS[s.slug]).map(s => (
          <div key={s.slug} className="w-56 shrink-0 snap-start"><Video slug={VIDEOS[s.slug]} /><div className="mt-2 text-center font-semibold">{s.emoji} {secTitle(s, lang)}</div></div>
        ))}
      </div>
      <h2 className="mt-10 text-2xl font-bold">{t.free}</h2>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
          <a key={i} href={`${B}kids/free-page-${i}.pdf`} target="_blank" rel="noopener" className="rounded-2xl bg-white p-2 shadow">
            <img src={`${B}kids/free-page-${i}.png`} alt={`Free coloring page ${i}`} className="w-full rounded-lg" />
            <div className="mt-1 text-center text-sm font-semibold">{t.print}</div>
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
  const { lang, t } = useLang()
  useKidsPage(s ? `${secTitle(s, lang)} — ${t.heroTitle}` : t.heroTitle)
  if (!s) return <KidsHome />
  return (
    <Shell>
      <Link to="/k" className="inline-block rounded-full bg-white px-4 py-2 font-semibold shadow">{t.back}</Link>
      <div className="mt-4 overflow-hidden rounded-[2rem] bg-white shadow-xl">
        <div className="p-5 text-center text-white" style={{ background: s.color }}>
          <div className="text-5xl">{s.emoji}</div>
          <h1 className="font-heading text-4xl sm:text-5xl">{secTitle(s, lang)}</h1>
        </div>
        <img src={`${B}kids/${s.slug}.png`} alt="" className="mx-auto w-64" />
      </div>
      {VIDEOS[s.slug] && (<>
        <h2 className="mt-8 text-2xl font-bold">{t.watch}</h2>
        <div className="mt-4"><Video key={s.slug} slug={VIDEOS[s.slug]} /></div>
      </>)}
      <h2 className="mt-8 text-2xl font-bold">{t.pressPlay}</h2>
      <div className="mt-4"><Playlist key={s.slug} songs={s.songs} color={s.color} /></div>
      <p className="mt-4 text-center text-lg">{t.move}</p>
      <h2 className="mt-10 text-xl font-bold">{t.more}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {KID_SECTIONS.filter(x => x.slug !== s.slug).map(x => (
          <Link key={x.slug} to={`/k/${x.slug}`} className="rounded-full px-4 py-2 font-semibold text-white shadow" style={{ background: x.color }}>{x.emoji} {secTitle(x, lang)}</Link>
        ))}
      </div>
      <Book />
      <Grownups />
    </Shell>
  )
}
