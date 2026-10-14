import SongCard from '../components/SongCard'
import { H1, Page, Pill } from '../components/Section'
import { ARTIST, SONGS } from '../data/songs'
import { usePlayer } from '../player/PlayerContext'
import PlayButton from '../components/PlayButton'

export default function Music() {
  const p = usePlayer()
  return (
    <Page>
      <H1>Music</H1>
      <div className="mb-10 flex flex-wrap items-center gap-3">
        <PlayButton playing={p.playing} onClick={() => (p.current ? p.toggle() : p.play(SONGS[0]))} label={p.playing ? 'Playing' : 'Play all'} size="text-[20px]" />
        <Pill href={ARTIST.spotify}>Spotify</Pill>
        <Pill href={ARTIST.ytMusic} i={1}>YouTube Music</Pill>
      </div>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">{SONGS.map(s => <SongCard key={s.slug} song={s} />)}</div>
    </Page>
  )
}
