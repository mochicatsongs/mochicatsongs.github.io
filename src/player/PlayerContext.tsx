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
}

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

  if (!el.current && typeof Audio !== 'undefined') el.current = new Audio()

  const play = useCallback((s: Song) => {
    const a = el.current!
    if (current?.slug !== s.slug) {
      a.src = audio(s)
      setCurrent(s)
      setTime(0)
    }
    a.play().catch(() => {})
  }, [current])

  const step = useCallback((dir: 1 | -1) => {
    const i = current ? SONGS.findIndex(s => s.slug === current.slug) : -1
    play(SONGS[(i + dir + SONGS.length) % SONGS.length])
  }, [current, play])

  useEffect(() => {
    const a = el.current!
    const on = (e: string, f: () => void) => { a.addEventListener(e, f); return () => a.removeEventListener(e, f) }
    const offs = [
      on('play', () => setPlaying(true)),
      on('pause', () => setPlaying(false)),
      on('timeupdate', () => setTime(a.currentTime)),
      on('loadedmetadata', () => setDuration(a.duration || 0)),
      on('ended', () => step(1)),
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
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
