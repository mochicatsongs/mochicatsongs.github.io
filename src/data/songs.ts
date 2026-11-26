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
  { slug: 'monday-again', title: 'Monday Again', genre: 'K-Pop · Pop Punk', released: '2026-11-27', lyrics: true, blurb: 'Packed train, crooked tie, half a fish bun from a friend. You got up: that\'s already a win.' },
  { slug: 'coffee-run', title: 'Coffee Run', genre: 'K-Pop · Funk Disco', released: '2026-11-27', lyrics: true, blurb: 'Cup one opens my eyes, cup three shakes my hands. Cup four? Tea, and a friend to sit with.' },
  { slug: 'just-one-round', title: 'Just One Round', genre: 'K-Pop · Trot Disco', released: '2026-11-27', lyrics: true, blurb: 'Friday team dinner, tongs in my paw, everyone tired. Just one round, then we all go home on time.' },
  { slug: 'its-okay-lets-go', title: 'It\'s Okay, Let\'s Go', genre: 'K-Pop · Band Ballad', released: '2026-11-27', lyrics: true, blurb: 'Bad report, missed call from home. A neon store, two banana milks and a friend: tonight, that\'s enough.' },
  { slug: 'elevator', title: 'Elevator', genre: 'K-Pop · Swing', released: '2026-11-27', lyrics: true, blurb: 'Thirty silent seconds with the boss, floor by floor. Then one hello, and the silence melts.' },
  { slug: 'just-five-minutes', title: 'Just Five Minutes', genre: 'K-Pop · Pop Rap', released: '2026-11-27', lyrics: true, blurb: 'One cat video, two vlogs, and it\'s 3 a.m. Battery at one percent: look up, the moon is waiting.' },
  { slug: 'long-time-no-see', title: 'Long Time No See', genre: 'K-Pop · Ballad', released: '2026-11-27', lyrics: true, blurb: 'An old photo at midnight, three silent years, one hello. It\'s okay to be the first to call.' },
  { slug: 'stuck-in-traffic', title: 'Stuck in Traffic', genre: 'K-Pop · City Pop', released: '2026-11-27', lyrics: true, blurb: 'Sunset highway, brake lights to the sky. Slow is still moving, and with a friend the road feels short.' },
  { slug: 'birthday-overtime', title: 'Birthday Overtime', genre: 'K-Pop · Surf Rock', released: '2026-11-27', lyrics: true, blurb: 'Ten p.m., empty office, nobody remembered. Then the lights go off, one candle, one off-key song.' },
  { slug: 'left-on-read', title: 'Left on Read', genre: 'K-Pop · Synth Pop', released: '2026-11-27', lyrics: true, blurb: 'The little 1 disappears, no reply comes. Breathe: your worth is not the speed of a reply.' },
  { slug: 'starting-tomorrow', title: 'Starting Tomorrow', genre: 'K-Pop · Ska Pop', released: '2026-11-27', lyrics: true, blurb: 'Gym since January, English book on page one. Skip the giant list: one small step, starting today.' },
  { slug: 'bottom-of-the-ninth', title: 'Bottom of the Ninth', genre: 'K-Pop · Stadium Rock', released: '2026-11-27', lyrics: true, blurb: 'Losing all season, twenty thousand voices still singing. Two outs, but the last chance is still a chance.' },
  { slug: 'everythings-up-but-my-pay', title: 'Everything\'s Up But My Pay', genre: 'K-Pop · Brass Pop', released: '2026-11-27', lyrics: true, blurb: 'Coffee, kimbap, bus fare and rent: everything\'s up but my pay. You\'re not the only one, so let\'s laugh it off.' },
  { slug: 'should-i-quit', title: 'Should I Quit', genre: 'K-Pop · Piano Ballad', released: '2026-11-27', lyrics: true, blurb: 'A resignation letter in the drawer, a sticky note on the monitor. You can go, you can stay: either way, you\'re not alone.' },
  { slug: 'karaoke-night', title: 'Karaoke Night', genre: 'K-Pop · Trot', released: '2026-11-27', lyrics: true, blurb: 'After work, a tiny noraebang, wrong notes everywhere. Score 40, nobody cares: this little room is ours tonight.' },
  { slug: 'me-time', title: 'Me Time', genre: 'K-Pop · Chill House', released: '2026-11-27', lyrics: true, blurb: 'A movie ticket for one, lunch by the window, a walk by the river. Alone is not lonely: it\'s time to breathe.' },
  { slug: 'pretending-im-fine', title: 'Pretending I\'m Fine', genre: 'K-Pop · R&B Soul', released: '2026-11-27', lyrics: true, blurb: 'Smiling all day, crying in the basement parking lot. It\'s okay not to be okay: you can just say it.' },
  { slug: 'upstairs-neighbor', title: 'Upstairs Neighbor', genre: 'K-Pop · Tango Pop', released: '2026-11-27', lyrics: true, blurb: 'Midnight thumps, an angry note in my paw. Then a cookie and a sorry from upstairs: maybe we\'ll be fine.' },
  { slug: 'small-but-mine', title: 'Small But Mine', genre: 'K-Pop · Bedroom Pop', released: '2026-11-27', lyrics: true, blurb: 'First night in a tiny room: ramen on a box, one plant, one star. Big dreams fit in small rooms too.' },
  { slug: 'at-the-summit', title: 'At the Summit', genre: 'K-Pop · Folk Rock', released: '2026-11-27', lyrics: true, blurb: 'Saturday hike, legs shaking, boss out of breath. One more step, and gimbap at the top with the whole world below.' },
  { slug: 'we-made-it-through', title: 'We Made It Through', genre: 'K-Pop · Anthem', released: '2026-11-08', lyrics: true, blurb: 'Not perfect, not on cue, but we made it through.' },
  { slug: 'rainy-day-smile', title: 'Rainy Day Smile', genre: 'K-Pop · Pop', released: '2026-11-08', lyrics: true, blurb: 'Missed the bus, spilled the coffee: splash in the puddle anyway.' },
  { slug: 'small-wins', title: 'Small Wins', genre: 'K-Pop · Pop', released: '2026-11-08', lyrics: true, blurb: 'Got out of bed? That’s a win. Small wins still count.' },
  { slug: 'not-your-fault', title: 'Not Your Fault', genre: 'K-Pop · Ballad', released: '2026-11-08', lyrics: true, blurb: 'You are more than one hard year. It’s not your fault.' },
  { slug: 'brave-enough', title: 'Brave Enough', genre: 'K-Pop · Pop Rock', released: '2026-11-08', lyrics: true, blurb: 'Scared, but I go anyway. You don’t need to see the whole way, just the next step.' },
  { slug: 'call-home', title: 'Call Home', genre: 'K-Pop · Acoustic', released: '2026-11-08', lyrics: true, blurb: '"Did you eat?" means "I love you." Someone’s waiting for your call.' },
  { slug: 'its-okay-to-say-no', title: 'It’s Okay to Say No', genre: 'K-Pop · Pop', released: '2026-11-08', lyrics: true, blurb: 'No is a full sentence. Say it with a smile: it’s okay to say no.' },
  { slug: 'still-dreaming', title: 'Still Dreaming', genre: 'K-Pop · Indie Pop', released: '2026-11-08', lyrics: true, blurb: 'Nine to six can’t take this: fifteen minutes every night, still dreaming.' },
  { slug: 'all-the-way', title: 'All the Way', genre: 'K-Pop · Pop Rock', released: '2026-11-08', lyrics: true, blurb: 'Halfway is not the end. Let’s go all the way.' },
  { slug: 'breathe', title: 'Breathe', genre: 'K-Pop · Chill', released: '2026-11-08', lyrics: true, blurb: 'Breathe in: one, two, three, four. Breathe out. Right here, right now, you’re okay.' },
  { slug: 'last-train', title: 'Last Train', genre: 'K-Pop · City Pop', released: '2026-11-08', lyrics: true, blurb: 'Running for the last train: empty seats, a window glow, Han River shining down below.' },
  { slug: 'just-tired', title: 'Just Tired', genre: 'K-Pop · Ballad', released: '2026-11-08', lyrics: true, blurb: 'I’m okay, I’m just tired. You don’t have to be strong all the time.' },
  { slug: 'first-snow', title: 'First Snow', genre: 'K-Pop · Ballad', released: '2026-11-08', lyrics: true, blurb: 'They say if you’re together when the first snow falls, love will stay.' },
  { slug: 'never-too-late', title: 'Never Too Late', genre: 'K-Pop · Pop', released: '2026-11-08', lyrics: true, blurb: 'Thirty-seven, fifty-five or twenty-two: never too late to start something new.' },
  { slug: 'friday-mode', title: 'Friday Mode', genre: 'K-Pop · Dance', released: '2026-11-08', lyrics: true, blurb: 'Five, four, three, two, one: Friday mode on! From grey to neon, here we go.' },
  { slug: 'payday', title: 'Payday', genre: 'K-Pop · Funk Pop', released: '2026-11-08', lyrics: true, blurb: 'Rich for a minute, then it flies away. Pocket’s empty, the heart’s okay.' },
  { slug: 'mochi-new-year', title: 'Mochi New Year', genre: 'Pop · Party', released: '2026-11-08', lyrics: true, blurb: 'Ten, nine, eight... Happy New Year! Count down and jump into the new year with Mochi.' },
  { slug: 'mochi-christmas', title: 'Mochi Christmas', genre: 'Pop · Christmas', released: '2026-11-08', lyrics: true, blurb: 'Jingle jingle, Mochi mingle! Shake your bell, shake your belly: a Christmas dance party with Mochi.' },
  { slug: 'hwaiting', title: 'Hwaiting!', genre: 'K-Pop · Pop', released: '2026-10-26', youtube: 'YcqXNyxB4yg', premiere: '2026-11-16', lyrics: true, blurb: 'Exam tomorrow, coffee number three — a cheer for everyone studying late tonight. 화이팅!' },
  { slug: 'seoul-is-my-home', title: 'Seoul Is My Home', genre: 'K-Pop · City Pop', released: '2026-10-26', youtube: 'NyajtsKYAUo', premiere: '2026-11-20', lyrics: true, blurb: 'Came with a suitcase and a dream — and found a home. A thank-you song to Seoul.' },
  { slug: 'saranghae', title: 'Saranghae', genre: 'K-Pop · Pop', released: '2026-10-26', youtube: 'R2DVKhwk8aA', premiere: '2026-11-27', lyrics: true, blurb: 'One word, one heart: 사랑해 in every language.' },
  { slug: 'good-morning-seoul', title: 'Good Morning Seoul', genre: 'K-Pop · Pop', released: '2026-10-26', lyrics: true, blurb: 'Alarm, warm coffee, the Han River shining from the bus — 좋은 아침!' },
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
  { slug: 'mochi-dance', title: 'Mochi Dance', genre: 'Pop · Dance', released: '2026-10-10', youtube: '3IA0YawSuU0', premiere: '2026-11-13', lyrics: true, blurb: 'The official Mochi dance. Learn it, film it, tag #MochiCat.' },
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

/** Premiere time (KST): the first two clips went live at 00:00, clips until 13 Nov 2026 at 09:00, from 14 Nov 2026 at 20:00. */
export const premiereTime = (iso: string) => (iso < '2026-10-20' ? '00:00' : iso < '2026-11-14' ? '09:00' : '20:00')
export const isLive = (iso?: string) => !iso || new Date(`${iso}T${premiereTime(iso)}:00+09:00`).getTime() <= Date.now()
export const fmtDate = (iso: string) =>
  new Date(iso + 'T12:00:00+09:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
