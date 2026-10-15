import { useT } from '../i18n'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ARTIST, SONGS, cover, fmtDate, isLive, songBySlug, asset } from '../data/songs'
import { usePlayer } from '../player/PlayerContext'
import PlayButton from '../components/PlayButton'
import { GAME_INFO } from '../data/games'
import { Page, Pill } from '../components/Section'
import NotFound from './NotFound'

type Word = { w: string; t: number; e?: number }
type Line = { t?: number; text: string; tag?: boolean; gap?: boolean; words?: Word[] }

/** One karaoke line: every word fills left-to-right exactly while it is sung (per-frame, no React re-render). */
function KaraokeLine({ words, end, getTime }: { words: Word[]; end: number; getTime: () => number }) {
  const refs = useRef<(HTMLSpanElement | null)[]>([])
  const clock = useRef(getTime)
  clock.current = getTime
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const now = clock.current()
      words.forEach((w, j) => {
        const el = refs.current[j]
        if (!el) return
        const next = words[j + 1]?.t ?? end
        const e = Math.max(w.t + 0.12, Math.min(w.e ?? next, next, w.t + 1.6))
        const pr = Math.min(1, Math.max(0, (now - w.t) / (e - w.t)))
        el.style.setProperty('--p', `${(pr * 100).toFixed(1)}%`)
        el.dataset.on = pr > 0 && pr < 1 ? '1' : pr >= 1 ? '2' : ''
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [words, end])
  return <>{words.map((w, j) => (
    <Fragment key={j}><span ref={el => { refs.current[j] = el }} className="kw">{w.w}</span>{j < words.length - 1 ? ' ' : ''}</Fragment>
  ))}</>
}

export default function SongPage() {
  const { slug } = useParams()
  const song = songBySlug(slug)
  const p = usePlayer()
  const t = useT()
  const [lines, setLines] = useState<Line[] | null>(null)
  const [synced, setSynced] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLines(null)
    if (!song) return
    fetch(asset(`lyrics/${song.slug}.json`)).then(r => r.json()).then(d => { setLines(d.lines); setSynced(d.synced) }).catch(() => {})
    document.title = `${song.title} — Mochi Cat`
    return () => { document.title = 'Mochi Cat 🐾 — the chubbiest pop star' }
  }, [song])

  const active = p.current?.slug === song?.slug
  const idx = useMemo(() => {
    if (!active || !synced || !lines) return -1
    let i = -1
    lines.forEach((l, k) => { if (!l.tag && l.t !== undefined && l.t <= p.time + 0.3) i = k })
    return i
  }, [active, synced, lines, p.time])

  useEffect(() => {
    if (idx < 0 || !box.current) return
    const el = box.current.querySelector<HTMLElement>(`[data-i="${idx}"]`)
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [idx])

  if (!song) return <NotFound />
  const i = SONGS.findIndex(s => s.slug === song.slug)
  const next = SONGS[(i + 1) % SONGS.length]

  return (
    <Page>
      <div className="grid gap-10 md:grid-cols-[minmax(0,380px)_1fr]">
        <div>
          <img src={cover(song)} alt={song.title} className="card3d w-full" />
          <h1 className="t3d mt-7 text-[clamp(36px,6vw,58px)]">{song.title}</h1>
          <div className="mt-2 text-white/55">Mochi Cat · {song.genre}</div>
          <p className="mt-4 text-[17px] leading-relaxed text-white/85">{song.blurb}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3"><PlayButton playing={active && p.playing} onClick={() => (active ? p.toggle() : p.play(song))} label={active && p.playing ? t('Pause') : t('Play')} size="text-[22px]" />
            {GAME_INFO[song.slug] && <Link to={`/games/${song.slug}`} className="btn3d btn-yellow text-[18px]">🎮 {t('Play the game')}: {GAME_INFO[song.slug].name}</Link>}</div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Pill href={ARTIST.spotify}>Spotify</Pill>
            <Pill href={ARTIST.ytMusic} i={1}>YouTube Music</Pill>
            <Pill href={`https://music.apple.com/search?term=${encodeURIComponent('Mochi Cat ' + song.title)}`} i={2}>Apple Music</Pill>
          </div>
        </div>

        <div className="min-w-0">
          {song.youtube && (
            <div className="mb-8">
              {isLive(song.premiere) ? (
                <div className="relative overflow-hidden rounded-2xl bg-black pt-[56.25%]">
                  <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube-nocookie.com/embed/${song.youtube}`} title={song.title} loading="lazy"
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
              ) : (
                <a href={`https://youtu.be/${song.youtube}`} target="_blank" rel="noopener" className="block rounded-2xl border border-white/15 p-5 hover:bg-white/5">
                  <div className="text-sm text-white/55">{t('Music video premiere')}</div>
                  <div className="text-xl">{fmtDate(song.premiere!)} · 00:00 KST — {t('set a reminder 🔔')}</div>
                </a>
              )}
            </div>
          )}
          <h2 className="mb-4 text-2xl font-medium">{t('Lyrics')} {synced && <span className="ml-2 align-middle text-xs font-normal text-white/45">{t('♪ follows the music')}</span>}</h2>
          {lines ? (
            <div ref={box} className="max-h-[60vh] overflow-y-auto rounded-2xl bg-white/[0.04] p-6 [scrollbar-width:thin]">
              {lines.map((l, k) => l.gap ? <div key={k} className="h-4" /> : l.tag ? (
                <div key={k} data-i={k} className="mt-4 text-xs uppercase tracking-widest text-white/35">{l.text}</div>
              ) : (
                <p key={k} data-i={k}
                  onClick={() => { if (synced && l.t !== undefined) { if (!active) p.play(song); setTimeout(() => p.seek(l.t!), active ? 0 : 300) } }}
                  className={`py-1 text-[clamp(18px,2.4vw,24px)] leading-snug transition-all duration-300 ${synced ? 'cursor-pointer' : ''} ${
                    idx === -1 ? 'text-white/85' : k === idx ? 'scale-[1.04] origin-left font-semibold' : k < idx ? 'text-white/35' : 'text-white/55'}`}>
                  {k === idx && l.words?.length ? <KaraokeLine words={l.words} end={lines.slice(k + 1).find(n => n.t !== undefined)?.t ?? l.words[l.words.length - 1].t + 2} getTime={p.getTime} /> : l.text}
                </p>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white/[0.04] p-6 text-white/55">{t('Lyrics are coming soon. Meanwhile — press play and dance! 💃')}</div>
          )}
          <Link to={`/music/${next.slug}`} className="mt-10 flex items-center gap-4 rounded-2xl border border-white/10 p-3 hover:bg-white/5">
            <img src={cover(next)} alt="" className="h-14 w-14 rounded-lg" />
            <div><div className="text-xs text-white/50">{t('Next song')}</div><div className="text-lg">{next.title}</div></div>
          </Link>
        </div>
      </div>
    </Page>
  )
}
