import { Link } from 'react-router-dom'
import { usePlayer } from '../player/PlayerContext'
import { cover } from '../data/songs'
import { NextIcon, PrevIcon, RepeatIcon, ShuffleIcon } from './Icons'
import { useT } from '../i18n'
import PlayButton, { Eq } from './PlayButton'

const mmss = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`

export default function MiniPlayer() {
  const p = usePlayer()
  const t = useT()
  if (!p.current) return null
  const rLabel = p.repeat === 'one' ? t('Repeat one song') : p.repeat === 'all' ? t('Repeat all songs') : t('Repeat off')
  const pct = p.duration ? (p.time / p.duration) * 100 : 0
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/90 backdrop-blur-xl">
      <div className="h-[3px] w-full bg-white/10 cursor-pointer" onClick={e => {
        const r = e.currentTarget.getBoundingClientRect(); p.seek(((e.clientX - r.left) / r.width) * p.duration)
      }}><div className="h-full bg-mochired" style={{ width: `${pct}%` }} /></div>
      <div className="mx-auto flex max-w-5xl items-center gap-1.5 px-3 py-2.5 sm:gap-3 sm:px-4">
        <Link to={`/music/${p.current.slug}`} className="mr-1 flex min-w-0 flex-1 items-center gap-3">
          <img src={cover(p.current)} alt="" className={`h-11 w-11 rounded-lg ${p.playing ? 'animate-[spin_12s_linear_infinite] rounded-full' : ''}`} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 truncate font-heading text-[16px] tracking-wide">{p.playing && <span className="text-cyan-300"><Eq /></span>}{p.current.title}</div>
            <div className="whitespace-nowrap text-xs text-white/55"><span className="hidden sm:inline">Mochi Cat · </span>{mmss(p.time)} / {mmss(p.duration)}</div>
          </div>
        </Link>
        <button aria-label={t('Shuffle')} title={t('Shuffle')} aria-pressed={p.shuffle} onClick={p.toggleShuffle}
          className={`relative rounded-full p-1.5 transition ${p.shuffle ? 'text-lime-300' : 'text-white/45 hover:text-white/80'}`}>
          <ShuffleIcon className="h-[18px] w-[18px]" />{p.shuffle && <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-lime-300" />}
        </button>
        <button aria-label="Previous" onClick={p.prev} className="p-1.5 opacity-80 hover:opacity-100 sm:p-2"><PrevIcon /></button>
        <PlayButton round playing={p.playing} onClick={p.toggle} color={p.playing ? 'btn-cyan' : 'btn-pink'} />
        <button aria-label="Next" onClick={p.next} className="p-1.5 opacity-80 hover:opacity-100 sm:p-2"><NextIcon /></button>
        <button aria-label={rLabel} title={rLabel} onClick={p.cycleRepeat}
          className={`relative rounded-full p-1.5 transition ${p.repeat !== 'off' ? 'text-lime-300' : 'text-white/45 hover:text-white/80'}`}>
          <RepeatIcon className="h-[18px] w-[18px]" />
          {p.repeat === 'one' && <span className="absolute -right-0.5 -top-0.5 grid h-[14px] w-[14px] place-items-center rounded-full bg-lime-300 text-[9px] font-bold leading-none text-ink">1</span>}
          {p.repeat !== 'off' && <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-lime-300" />}
        </button>
      </div>
    </div>
  )
}
