import { ReactNode } from 'react'
import { PauseIcon, PlayIcon } from './Icons'

/** Dancing equalizer shown while a song is playing. */
export const Eq = () => (
  <span className="eq" aria-hidden><i /><i /><i /><i /></span>
)

/** Big candy 3D play button: pulses softly while idle, shows a dancing equalizer while playing. */
export default function PlayButton({ playing, onClick, label, color = 'btn-pink', size = 'text-[18px]', round }: { playing: boolean; onClick: () => void; label?: ReactNode; color?: string; size?: string; round?: boolean }) {
  return (
    <span className={`pulse-wrap ${playing ? 'is-playing' : ''} ${round ? 'rounded-full' : ''}`}>
      <button onClick={onClick} aria-label={playing ? 'Pause' : 'Play'} className={`btn3d ${color} ${size} ${round ? 'h-12 w-12 !p-0' : ''}`}>
        {playing ? (round ? <PauseIcon /> : <><Eq /> {label ?? 'Pause'}</>) : <><PlayIcon className={round ? 'ml-0.5 h-5 w-5' : 'h-5 w-5'} />{!round && (label ?? 'Play')}</>}
      </button>
    </span>
  )
}
