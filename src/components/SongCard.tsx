import { Link } from 'react-router-dom'
import { Song, cover } from '../data/songs'
import { usePlayer } from '../player/PlayerContext'
import { PauseIcon, PlayIcon } from './Icons'

export default function SongCard({ song }: { song: Song }) {
  const p = usePlayer()
  const active = p.current?.slug === song.slug
  return (
    <div className="group text-[13px] leading-tight">
      <div className="relative">
        <Link to={`/music/${song.slug}`}><img src={cover(song)} alt={song.title} loading="lazy" className="card3d aspect-square w-full object-cover group-hover:-translate-y-1.5 group-hover:rotate-[-1.5deg]" /></Link>
        <button aria-label={`Play ${song.title}`} onClick={() => (active ? p.toggle() : p.play(song))}
          className={`absolute bottom-2 right-2 btn3d btn-pink !p-0 h-11 w-11 transition-all ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 max-md:opacity-100'}`}>
          {active && p.playing ? <PauseIcon /> : <PlayIcon className="ml-0.5 h-5 w-5" />}
        </button>
      </div>
      <Link to={`/music/${song.slug}`} className="mt-3 block font-heading text-[16px] tracking-wide">{song.title}</Link>
      <div className="mt-0.5 text-white/50">{song.genre}</div>
    </div>
  )
}
