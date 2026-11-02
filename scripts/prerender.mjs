// Copies index.html into every route folder so GitHub Pages answers 200 (not 404)
// and gives each song page its own title / description / preview image for sharing.
import fs from 'node:fs'
const SITE = 'https://mochicatsongs.com'
const html = fs.readFileSync('dist/index.html', 'utf8')
const src = fs.readFileSync('src/data/songs.ts', 'utf8')
const songs = [...src.matchAll(/slug: '([^']+)', title: '([^']+)'[\s\S]*?blurb: '([^']+)'/g)].map(m => {
  const one = m[0], f = k => (one.match(new RegExp(`${k}: '([^']+)'`)) || [])[1]
  return { slug: m[1], title: m[2], blurb: m[3], genre: f('genre'), released: f('released'), youtube: f('youtube'), premiere: f('premiere') }
})
const ARTIST_LD = { '@type': 'MusicGroup', name: 'Mochi Cat', url: `${SITE}/` }
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const TODAY = new Date().toISOString().slice(0, 10)
const ldTag = o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`
const canon = route => `${SITE}${route === '/' ? '/' : `${route}/`}`
const page = (route, title, desc, img, extra = '') => {
  let h = html
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(desc)}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(desc)}`)
    .replace(/(<meta property="og:image" content=")[^"]*/, `$1${SITE}${img}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${canon(route)}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${canon(route)}`)
    .replace('</head>', `${extra}</head>`)
  fs.mkdirSync(`dist${route}`, { recursive: true })
  fs.writeFileSync(`dist${route}/index.html`, h)
}
const base = ['Mochi Cat 🐾', 'Mochi Cat — a grey cat in Seoul singing about after-work life. 퇴근길에 듣는 위로 노래, 힐링 컬러링북, 무료 웹게임. Cozy songs, coloring books & free web games.', '/media/mochi_hero_poster.jpg']
for (const [r, t] of [['/music', 'Music'], ['/videos', 'Music videos'], ['/games', 'Games'], ['/games/catch-the-dot', 'Catch the Dot — game'], ['/stickers', 'Stickers'], ['/about', 'About Mochi'], ['/privacy', 'Privacy — 개인정보 처리방침']])
  page(r, `${t} — ${base[0]}`, base[1], base[2])
page('/books', 'Coloring Books — Mochi Cat 🐾 printable PDFs', 'Cozy Mochi Cat coloring books: a Korea-themed book for adults and bold, easy pages for kids 4–8. Instant printable PDF.', '/books/adult-en.jpg')
page('/rooms', 'Mochi’s Rooms 🐾 Study · Work · Café · Sleep music', 'Long lofi mixes with Mochi Cat: 3-hour study with Pomodoro, 3-hour work music, 2-hour café & coloring, 8-hour sleep piano. Pick a room and stay a while.', '/rooms/study.jpg')
page('/free-coloring-pages', 'Free Cat Coloring Pages — printable PDF | Mochi Cat', 'Free printable cat coloring pages with Mochi, the chubby grey cat: cozy Korea scenes for adults and bold, easy pages for kids. Download the PDF and print.', '/free/adult-29.jpg')
page('/k', 'Color with Mochi! 🐾 Kids zone', 'Songs and free coloring pages from the Mochi Cat kids coloring book.', '/kids/book-cover.jpg')
for (const k of ['food','music','home','travel','dreams']) page(`/k/${k}`, 'Color with Mochi! 🐾 Kids zone', 'Songs and free coloring pages from the Mochi Cat kids coloring book.', '/kids/book-cover.jpg')
// each song page tells Google exactly what it is: a recording by Mochi Cat (+ its YouTube video once it is out)
const live = iso => !iso || iso <= TODAY
for (const s of songs) {
  const url = canon(`/music/${s.slug}`), img = `${SITE}/covers/${s.slug}.jpg`
  const rec = { '@context': 'https://schema.org', '@type': 'MusicRecording', name: s.title, url, image: img, description: s.blurb, byArtist: ARTIST_LD, ...(s.genre ? { genre: s.genre.split(' · ') } : {}), ...(s.released ? { datePublished: s.released } : {}) }
  const vid = s.youtube && live(s.premiere) ? { '@context': 'https://schema.org', '@type': 'VideoObject', name: `${s.title} — Mochi Cat (official music video)`, description: s.blurb, thumbnailUrl: `https://i.ytimg.com/vi/${s.youtube}/hqdefault.jpg`, uploadDate: s.premiere || s.released, embedUrl: `https://www.youtube.com/embed/${s.youtube}`, contentUrl: `https://www.youtube.com/watch?v=${s.youtube}` } : null
  page(`/music/${s.slug}`, `${s.title} — Mochi Cat (lyrics & song)`, s.blurb, `/covers/${s.slug}.jpg`, ldTag(rec) + (vid ? ldTag(vid) : ''))
}
const games = [...fs.readFileSync('src/data/games.ts', 'utf8').matchAll(/'([a-z-]+)': \{ name: '([^']+)', emoji: '[^']*', desc: '([^']+)' \}/g)].map(m => ({ slug: m[1], name: m[2], desc: m[3] }))
for (const g of games) if (g.slug !== 'catch-the-dot') {
  const song = songs.find(s => s.slug === g.slug)
  page(`/games/${g.slug}`, `${g.name} — free Mochi Cat game${song ? ` with “${song.title}”` : ''}`, `${g.desc} Play free in your browser — on phone or computer.`, `/covers/${g.slug}.jpg`)
}
const urls = ['/', '/music', '/videos', '/games', '/stickers', '/books', '/free-coloring-pages', '/rooms', '/about', '/privacy', ...songs.map(s => `/music/${s.slug}`), ...games.map(g => `/games/${g.slug}`)]
// the home page itself: full preview-image address, canonical and og:url
fs.writeFileSync('dist/index.html', html
  .replace(/(<meta property="og:image" content=")\/[^"]*/, `$1${SITE}/media/mochi_hero_poster.jpg`))
const songDate = u => { const s = songs.find(x => `/music/${x.slug}` === u); return s ? [s.released, s.premiere].filter(d => d && d <= TODAY).sort().pop() || TODAY : TODAY }
fs.writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${canon(u)}</loc><lastmod>${songDate(u)}</lastmod></url>`).join('\n')}\n</urlset>\n`)
// RSS feed of the songs (Naver Search Advisor reads it to find new pages fast)
const x = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const feed = songs.filter(s => s.released && s.released <= TODAY).sort((a, b) => b.released.localeCompare(a.released))
fs.writeFileSync('dist/rss.xml', `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>Mochi Cat (모치캣) — cozy songs about life in Seoul</title>
<link>${SITE}/</link>
<description>${x(base[1])}</description>
<language>en</language>
${feed.map(s => `<item><title>${x(s.title)} — Mochi Cat</title><link>${canon(`/music/${s.slug}`)}</link><guid>${canon(`/music/${s.slug}`)}</guid><pubDate>${new Date(s.released + 'T09:00:00+09:00').toUTCString()}</pubDate><description>${x(s.blurb)}</description></item>`).join('\n')}
</channel></rss>
`)
fs.writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`)
console.log(`prerendered ${urls.length} routes`)
