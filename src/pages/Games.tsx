import { Link } from 'react-router-dom'
import { H1, Page } from '../components/Section'

export const GAMES = [
  { slug: 'catch-the-dot', title: 'Catch the Dot', desc: 'Tap the red dot before it escapes. It gets faster!', ready: true },
  { slug: 'neon-jump', title: 'Neon Jump', desc: 'Bounce across neon rooftops.', ready: false },
  { slug: 'freeze', title: 'Freeze!', desc: 'Stop exactly when the music stops.', ready: false },
  { slug: 'snack-or-sport', title: 'Snack or Sport', desc: 'Mochi always chooses sport… mostly.', ready: false },
]

export default function Games() {
  return (
    <Page>
      <H1 color="t3d-lime">Games</H1>
      <div className="grid gap-4 sm:grid-cols-2">
        {GAMES.map(g => g.ready ? (
          <Link key={g.slug} to={`/games/${g.slug}`} className="card3d bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-600 p-7">
            <div className="t3d-sm text-[32px]">{g.title}</div><div className="mt-1 text-white/80">{g.desc}</div>
            <div className="btn3d btn-yellow mt-5 text-[17px]">▶ Play now</div>
          </Link>
        ) : (
          <div key={g.slug} className="card3d bg-white/[.06] p-7">
            <div className="t3d-sm text-[30px] text-white/80">{g.title}</div><div className="mt-1 text-white/55">{g.desc}</div>
            <div className="mt-5 text-sm text-white/40">Coming soon</div>
          </div>
        ))}
      </div>
    </Page>
  )
}
