import { Link } from 'react-router-dom'
import { usePlayer } from '../player/PlayerContext'
import { cover } from '../data/songs'
import { NextIcon, PauseIcon, PlayIcon, PrevIcon } from './Icons'

const mmss = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`

export default function MiniPlayer() {
  const p = usePlayer()
  if (!p.current) return null
  const pct = p.duration ? (p.time / p.duration) * 100 : 0
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/90 backdrop-blur-xl">
      <div className="h-[3px] w-full bg-white/10 cursor-pointer" onClick={e => {
        const r = e.currentTarget.getBoundingClientRect(); p.seek(((e.clientX - r.left) / r.width) * p.duration)
      }}><div className="h-full bg-mochired" style={{ width: `${pct}%` }} /></div>
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2.5">
        <Link to={`/music/${p.current.slug}`} className="flex min-w-0 flex-1 items-center gap-3">
          <img src={cover(p.current)} alt="" className={`h-11 w-11 rounded-lg ${p.playing ? 'animate-[spin_12s_linear_infinite] rounded-full' : ''}`} />
          <div className="min-w-0">
            <div className="truncate text-[15px] font-medium">{p.current.title}</div>
            <div className="text-xs text-white/55">Mochi Cat · {mmss(p.time)} / {mmss(p.duration)}</div>
          </div>
        </Link>
        <button aria-label="Previous" onClick={p.prev} className="p-2 opacity-80 hover:opacity-100"><PrevIcon /></button>
        <button aria-label={p.playing ? 'Pause' : 'Play'} onClick={p.toggle} className="grid h-10 w-10 place-items-center rounded-full bg-white text-black">
          {p.playing ? <PauseIcon /> : <PlayIcon className="ml-0.5 h-5 w-5" />}
        </button>
        <button aria-label="Next" onClick={p.next} className="p-2 opacity-80 hover:opacity-100"><NextIcon /></button>
      </div>
    </div>
  )
}
