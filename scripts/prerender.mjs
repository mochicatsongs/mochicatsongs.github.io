// Copies index.html into every route folder so GitHub Pages answers 200 (not 404)
// and gives each song page its own title / description / preview image for sharing.
import fs from 'node:fs'
const SITE = 'https://mochicatsongs.com'
const html = fs.readFileSync('dist/index.html', 'utf8')
const src = fs.readFileSync('src/data/songs.ts', 'utf8')
const songs = [...src.matchAll(/slug: '([^']+)', title: '([^']+)'[\s\S]*?blurb: '([^']+)'/g)].map(m => ({ slug: m[1], title: m[2], blurb: m[3] }))
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const page = (route, title, desc, img) => {
  let h = html
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(desc)}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(desc)}`)
    .replace(/(<meta property="og:image" content=")[^"]*/, `$1${SITE}${img}`)
  fs.mkdirSync(`dist${route}`, { recursive: true })
  fs.writeFileSync(`dist${route}/index.html`, h)
}
const base = ['Mochi Cat 🐾', 'Feel-good dance-pop songs by a chubby grey cat. New music video every Friday!', '/media/mochi_hero_poster.jpg']
for (const [r, t] of [['/music', 'Music'], ['/videos', 'Music videos'], ['/games', 'Games'], ['/games/catch-the-dot', 'Catch the Dot — game'], ['/stickers', 'Stickers'], ['/about', 'About Mochi'], ['/privacy', 'Privacy — 개인정보 처리방침']])
  page(r, `${t} — ${base[0]}`, base[1], base[2])
page('/books', 'Coloring Books — Mochi Cat 🐾 printable PDFs', 'Cozy Mochi Cat coloring books: a Korea-themed book for adults and bold, easy pages for kids 4–8. Instant printable PDF.', '/books/adult-en.jpg')
page('/k', 'Color with Mochi! 🐾 Kids zone', 'Songs and free coloring pages from the Mochi Cat kids coloring book.', '/kids/book-cover.jpg')
for (const k of ['food','music','home','travel','dreams']) page(`/k/${k}`, 'Color with Mochi! 🐾 Kids zone', 'Songs and free coloring pages from the Mochi Cat kids coloring book.', '/kids/book-cover.jpg')
for (const s of songs) page(`/music/${s.slug}`, `${s.title} — Mochi Cat (lyrics & song)`, s.blurb, `/covers/${s.slug}.jpg`)
const games = [...fs.readFileSync('src/data/games.ts', 'utf8').matchAll(/'([a-z-]+)': \{ name: '([^']+)', emoji: '[^']*', desc: '([^']+)' \}/g)].map(m => ({ slug: m[1], name: m[2], desc: m[3] }))
for (const g of games) if (g.slug !== 'catch-the-dot') {
  const song = songs.find(s => s.slug === g.slug)
  page(`/games/${g.slug}`, `${g.name} — free Mochi Cat game${song ? ` with “${song.title}”` : ''}`, `${g.desc} Play free in your browser — on phone or computer.`, `/covers/${g.slug}.jpg`)
}
const urls = ['/', '/music', '/videos', '/games', '/stickers', '/books', '/about', '/privacy', ...songs.map(s => `/music/${s.slug}`), ...games.map(g => `/games/${g.slug}`)]
fs.writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${SITE}${u}</loc></url>`).join('\n')}\n</urlset>\n`)
fs.writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`)
console.log(`prerendered ${urls.length} routes`)
