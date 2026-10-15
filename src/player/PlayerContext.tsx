import { track } from '../analytics'
import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import { SONGS, Song, audio } from '../data/songs'

type Player = {
  current?: Song
  playing: boolean
  time: number
  duration: number
  play: (s: Song) => void
  toggle: () => void
  next: () => void
  prev: () => void
  seek: (t: number) => void
  repeat: Repeat
  shuffle: boolean
  cycleRepeat: () => void
  toggleShuffle: () => void
  /** While a game is open its song plays on a loop, whatever the repeat setting. */
  setGameLoop: (on: boolean) => void
}
export type Repeat = 'all' | 'one' | 'off'
const load = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v) } catch { return d } }
const save = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* ignore */ } }

const Ctx = createContext<Player | null>(null)
export const usePlayer = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('usePlayer outside provider')
  return c
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const el = useRef<HTMLAudioElement | null>(null)
  const [current, setCurrent] = useState<Song>()
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [repeat, setRepeat] = useState<Repeat>(() => load('mochi-repeat', 'all'))
  const [shuffle, setShuffle] = useState<boolean>(() => load('mochi-shuffle', false))
  const [gameLoop, setGameLoop] = useState(false)
  const history = useRef<string[]>([])

  if (!el.current && typeof Audio !== 'undefined') el.current = new Audio()

  const play = useCallback((s: Song) => {
    track('play_song', { song: s.slug })
    const a = el.current!
    if (current?.slug !== s.slug) {
      if (current) history.current = [...history.current.slice(-50), current.slug]
      a.src = audio(s)
      setCurrent(s)
      setTime(0)
    }
    a.play().catch(() => {})
  }, [current])

  const step = useCallback((dir: 1 | -1, auto = false) => {
    const a = el.current!
    const i = current ? SONGS.findIndex(s => s.slug === current.slug) : -1
    if (dir < 0 && a.currentTime > 3) { a.currentTime = 0; return }
    if (dir < 0 && shuffle && history.current.length) {
      const prevSlug = history.current.pop()!; const s = SONGS.find(x => x.slug === prevSlug)
      if (s) { const a2 = el.current!; a2.src = audio(s); setCurrent(s); setTime(0); a2.play().catch(() => {}); return }
    }
    if (shuffle && dir > 0) {
      const others = SONGS.filter(s => s.slug !== current?.slug)
      return play(others[Math.floor(Math.random() * others.length)])
    }
    const j = i + dir
    if (auto && repeat === 'off' && j >= SONGS.length) { a.pause(); a.currentTime = 0; return }
    play(SONGS[(j + SONGS.length) % SONGS.length])
  }, [current, play, shuffle, repeat])

  // Repeat-one, or an open game: the audio element loops by itself.
  useEffect(() => { if (el.current) el.current.loop = gameLoop || repeat === 'one' }, [gameLoop, repeat])
  useEffect(() => save('mochi-repeat', repeat), [repeat])
  useEffect(() => save('mochi-shuffle', shuffle), [shuffle])

  useEffect(() => {
    const a = el.current!
    const on = (e: string, f: () => void) => { a.addEventListener(e, f); return () => a.removeEventListener(e, f) }
    const offs = [
      on('play', () => setPlaying(true)),
      on('pause', () => setPlaying(false)),
      on('timeupdate', () => setTime(a.currentTime)),
      on('loadedmetadata', () => setDuration(a.duration || 0)),
      on('ended', () => step(1, true)),
    ]
    return () => offs.forEach(f => f())
  }, [step])

  // Lock-screen / headphone controls
  useEffect(() => {
    if (!current || !('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.title, artist: 'Mochi Cat',
      artwork: [{ src: `${import.meta.env.BASE_URL}covers/${current.slug}.jpg`, sizes: '300x300', type: 'image/jpeg' }],
    })
    navigator.mediaSession.setActionHandler('nexttrack', () => step(1))
    navigator.mediaSession.setActionHandler('previoustrack', () => step(-1))
  }, [current, step])

  const value: Player = {
    current, playing, time, duration, play,
    toggle: () => { const a = el.current!; if (!current) return play(SONGS[0]); a.paused ? a.play() : a.pause() },
    next: () => step(1),
    prev: () => step(-1),
    seek: (t: number) => { el.current!.currentTime = t; setTime(t) },
    repeat, shuffle, setGameLoop,
    cycleRepeat: () => setRepeat(r => (r === 'all' ? 'one' : r === 'one' ? 'off' : 'all')),
    toggleShuffle: () => setShuffle(v => !v),
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
