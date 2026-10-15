export type Song = {
  slug: string
  title: string
  genre: string
  released: string // ISO date
  youtube?: string // music video id
  premiere?: string // ISO date of YouTube premiere
  blurb: string
  lyrics?: boolean
}

export const ARTIST = {
  name: 'Mochi Cat',
  handle: '@mochicatsongs',
  spotify: 'https://open.spotify.com/artist/5Gcv047fbwLk9ciCDYbnYX',
  youtube: 'https://www.youtube.com/@MochiCatSongs',
  subscribe: 'https://www.youtube.com/@MochiCatSongs?sub_confirmation=1',
  ytMusic: 'https://music.youtube.com/channel/UCQWPYexXj_XBMUsZaw7I-Pg',
  tiktok: 'https://www.tiktok.com/@mochicatsongs',
  instagram: 'https://www.instagram.com/mochicatsongs',
  facebook: 'https://www.facebook.com/mochicatsongs',
  threads: 'https://www.threads.net/@mochicatsongs',
  giphy: 'https://giphy.com/channel/mochicatsongs',
  giphyEn: 'https://giphy.com/channel/mochicatsongs/mochi-3d-stickers-english',
  giphyKo: 'https://giphy.com/channel/mochicatsongs/3d',
  naverBlog: 'https://blog.naver.com/mochicatsongs',
}

export const SOCIALS: [string, string][] = [
  ['YouTube', ARTIST.subscribe],
  ['Spotify', ARTIST.spotify],
  ['YouTube Music', ARTIST.ytMusic],
  ['TikTok', ARTIST.tiktok],
  ['Instagram', ARTIST.instagram],
  ['Facebook', ARTIST.facebook],
  ['Threads', ARTIST.threads],
  ['GIPHY', ARTIST.giphy],
  ['Naver Blog', ARTIST.naverBlog],
]

// Order = order on the site (newest / featured first).
export const SONGS: Song[] = [
  { slug: 'shine-like-mochi', title: 'Shine Like Mochi', genre: 'Pop · Dance', released: '2026-10-10', youtube: 'HIEfLLw4duE', premiere: '2026-11-06', lyrics: true,
    blurb: 'When the night gets dark, Mochi lights it up. Little paws, giant heart — fall down, get up, try again.' },
  { slug: 'neon-jump', title: 'Neon Jump', genre: 'Electronic · Dance', released: '2026-10-10', youtube: 'fKfovXeoBaY', premiere: '2026-10-30', lyrics: true,
    blurb: 'A neon Halloween party with lasers, pumpkins and one very sporty cat. Jump, bounce… FREEZE!' },
  { slug: 'catch-the-dot', title: 'Catch the Dot', genre: 'Pop · Electronic', released: '2026-10-08', youtube: '5pkt0CC_Od4', premiere: '2026-10-23', lyrics: true,
    blurb: 'Agent Mochi is on a mission: lasers, vaults and one tiny red dot. Can you freeze till “Gotcha”?' },
  { slug: 'meow-in-every-language', title: 'Meow in Every Language', genre: 'R&B · Pop', released: '2026-10-10', youtube: '36G9yQnz-JI', premiere: '2026-10-16', lyrics: true,
    blurb: 'Paris, Rome, Tokyo and back home again — how do cats say meow where you live?' },
  { slug: 'the-chubby-super-cat', title: 'The Chubby Super Cat', genre: 'Pop', released: '2026-10-08', youtube: 'Xdu18THnkYE', lyrics: true,
    blurb: 'Mochi loves snacks — but he chooses sport. The song that started it all.' },
  { slug: 'mochi-dance', title: 'Mochi Dance', genre: 'Pop · Dance', released: '2026-10-10', lyrics: true, blurb: 'The official Mochi dance. Learn it, film it, tag #MochiCat.' },
  { slug: 'meow-meow-mochi-cat', title: 'Meow Meow (Mochi Cat)', genre: 'Dance · Pop', released: '2026-10-10', lyrics: true, blurb: 'Two words, one beat, endless meows.' },
  { slug: 'mochi-mochi-challenge', title: 'Mochi Mochi Challenge', genre: 'Country · Hip Hop', released: '2026-10-10', lyrics: true, blurb: 'A line-dance challenge with a chubby twist.' },
  { slug: 'milkshake-shake', title: 'Milkshake Shake', genre: 'Pop · R&B', released: '2026-10-10', lyrics: true, blurb: 'Shake it like a milkshake — but drink water after.' },
  { slug: 'chonky-gym-cat', title: 'Chonky Gym Cat', genre: 'Hip Hop · Electronic', released: '2026-10-10', lyrics: true, blurb: 'Leg day? Every day. The gym anthem of the chonkiest athlete.' },
  { slug: 'nom-nom-nom', title: 'Nom Nom Nom', genre: 'Pop · Dance', released: '2026-10-10', lyrics: true, blurb: 'An ode to snacks (enjoyed responsibly).' },
  { slug: 'super-paw-rock', title: 'Super Paw Rock', genre: 'Rock · Pop', released: '2026-10-10', lyrics: true, blurb: 'Guitars up, paws up — Mochi goes rock.' },
  { slug: 'belly-bounce', title: 'Belly Bounce', genre: 'Dance · Electronic', released: '2026-10-10', lyrics: true, blurb: 'Bounce, bounce, belly bounce — the happiest workout ever.' },
  { slug: 'mochi-mode', title: 'Mochi Mode', genre: 'Electronic · Pop', released: '2026-10-10', lyrics: true, blurb: 'Switch on Mochi Mode: focus, energy, finish what you start.' },
  { slug: 'mochi-obby', title: 'Mochi Obby', genre: 'Hip Hop · Electronic', released: '2026-10-10', lyrics: true, blurb: 'Jump, dodge, respawn — an obstacle course in song form.' },
  { slug: 'mochi-heart', title: 'Mochi Heart', genre: 'Pop · Dance', released: '2026-10-10', lyrics: true, blurb: 'A song for the friends who make your heart glow.' },
  { slug: 'mochi-farm', title: 'Mochi Farm', genre: 'Country · Pop', released: '2026-10-10', lyrics: true, blurb: 'Sunrise, tractors and a cat who does all the chores.' },
  { slug: 'mochi-fiesta', title: 'Mochi Fiesta', genre: 'Latin · Pop', released: '2026-10-10', lyrics: true, blurb: 'Maracas, sunshine and a very happy fiesta cat.' },
]

export const hasLyrics = (_s: Song) => true
export const songBySlug = (slug?: string) => SONGS.find(s => s.slug === slug)
export const cover = (s: Song) => `${import.meta.env.BASE_URL}covers/${s.slug}.jpg`
export const audio = (s: Song) => `${import.meta.env.BASE_URL}audio/${s.slug}.mp3`
export const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`

export const isLive = (iso?: string) => !iso || new Date(iso + 'T00:00:00+09:00').getTime() <= Date.now()
export const fmtDate = (iso: string) =>
  new Date(iso + 'T12:00:00+09:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
