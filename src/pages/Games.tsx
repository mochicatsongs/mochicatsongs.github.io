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
      <H1>Games</H1>
      <div className="grid gap-4 sm:grid-cols-2">
        {GAMES.map(g => g.ready ? (
          <Link key={g.slug} to={`/games/${g.slug}`} className="rounded-3xl bg-gradient-to-br from-mochired to-fuchsia-600 p-7 transition-transform hover:-translate-y-1">
            <div className="text-2xl font-medium">{g.title}</div><div className="mt-1 text-white/80">{g.desc}</div>
            <div className="mt-5 inline-block rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black">Play now →</div>
          </Link>
        ) : (
          <div key={g.slug} className="rounded-3xl border border-dashed border-white/25 p-7">
            <div className="text-2xl font-medium">{g.title}</div><div className="mt-1 text-white/55">{g.desc}</div>
            <div className="mt-5 text-sm text-white/40">Coming soon</div>
          </div>
        ))}
      </div>
    </Page>
  )
}
