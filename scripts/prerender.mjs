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
// Korean texts for songs (blurb + what the song is about) and the synced lyrics with translations
const KO = Object.fromEntries([...fs.readFileSync('src/data/songs_ko.ts', 'utf8').matchAll(/^  '([a-z-]+)': \{ blurb: '([^']+)', story: '([^']+)' \},$/gm)].map(m => [m[1], { blurb: m[2], story: m[3] }]))
const lyrics = slug => { try { return JSON.parse(fs.readFileSync(`public/lyrics/${slug}.json`, 'utf8')).lines.filter(l => l.text && !l.gap) } catch { return [] } }
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const TODAY = new Date().toISOString().slice(0, 10)
const ldTag = o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`
const canon = route => `${SITE}${route === '/' ? '/' : `${route}/`}`
const h1 = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
/** one static page. ko = Korean version (lang="ko"); alt = the same page in the other language (hreflang); body = plain HTML inside #root for search robots (React replaces it on load) */
const page = (route, title, desc, img, extra = '', o = {}) => {
  const enR = o.ko ? o.alt : route, koR = o.ko ? route : o.alt
  const hl = koR ? `<link rel="alternate" hreflang="en" href="${canon(enR)}" /><link rel="alternate" hreflang="ko" href="${canon(koR)}" /><link rel="alternate" hreflang="x-default" href="${canon(enR)}" />` : ''
  let h = html
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(desc)}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(desc)}`)
    .replace(/(<meta property="og:image" content=")[^"]*/, `$1${SITE}${img}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${canon(route)}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${canon(route)}`)
    .replace('</head>', `${hl}${extra}</head>`)
  if (o.ko) h = h.replace('<html lang="en">', '<html lang="ko">').replace(/(<meta property="og:locale" content=")[^"]*/, '$1ko_KR').replace(/(<meta property="og:locale:alternate" content=")[^"]*/, '$1en_US')
  if (o.body) h = h.replace('<div id="root"></div>', `<div id="root"><main style="max-width:760px;margin:0 auto;padding:96px 20px;color:#fff;font-family:system-ui,sans-serif;line-height:1.6">${o.body}</main></div>`)
  fs.mkdirSync(`dist${route}`, { recursive: true })
  fs.writeFileSync(`dist${route}/index.html`, h)
}
const base = ['Mochi Cat 🐾', 'Mochi Cat — a grey cat in Seoul singing about after-work life. 퇴근길에 듣는 위로 노래, 힐링 컬러링북, 무료 웹게임. Cozy songs, coloring books & free web games.', '/media/mochi_hero_poster.jpg']
const HAS_KO = ['/videos', '/games', '/stickers', '/books', '/free-coloring-pages', '/rooms', '/about']
const opt = r => (HAS_KO.includes(r) ? { alt: `/ko${r}` } : {})
for (const [r, t] of [['/videos', 'Music videos'], ['/games', 'Games'], ['/games/catch-the-dot', 'Catch the Dot — game'], ['/stickers', 'Stickers'], ['/about', 'About Mochi'], ['/privacy', 'Privacy — 개인정보 처리방침']])
  page(r, `${t} — ${base[0]}`, base[1], base[2], '', opt(r))
page('/books', 'Coloring Books — Mochi Cat 🐾 printable PDFs', 'Cozy Mochi Cat coloring books: a Korea-themed book for adults and bold, easy pages for kids 4–8. Instant printable PDF.', '/books/adult-en.jpg', '', opt('/books'))
page('/rooms', 'Mochi’s Rooms 🐾 Study · Work · Café · Sleep music', 'Long lofi mixes with Mochi Cat: 3-hour study with Pomodoro, 3-hour work music, 2-hour café & coloring, 8-hour sleep piano. Pick a room and stay a while.', '/rooms/study.jpg', '', opt('/rooms'))
page('/free-coloring-pages', 'Free Cat Coloring Pages — printable PDF | Mochi Cat', 'Free printable cat coloring pages with Mochi, the chubby grey cat: cozy Korea scenes for adults and bold, easy pages for kids. Download the PDF and print.', '/free/adult-29.jpg', '', opt('/free-coloring-pages'))
page('/k', 'Color with Mochi! 🐾 Kids zone', 'Songs and free coloring pages from the Mochi Cat kids coloring book.', '/kids/book-cover.jpg')
for (const k of ['food','music','home','travel','dreams']) page(`/k/${k}`, 'Color with Mochi! 🐾 Kids zone', 'Songs and free coloring pages from the Mochi Cat kids coloring book.', '/kids/book-cover.jpg')
// each song page tells Google exactly what it is: a recording by Mochi Cat (+ its YouTube video once it is out)
const live = iso => !iso || iso <= TODAY
for (const s of songs) {
  const url = canon(`/music/${s.slug}`), img = `${SITE}/covers/${s.slug}.jpg`
  const rec = { '@context': 'https://schema.org', '@type': 'MusicRecording', name: s.title, url, image: img, description: s.blurb, byArtist: ARTIST_LD, ...(s.genre ? { genre: s.genre.split(' · ') } : {}), ...(s.released ? { datePublished: s.released } : {}) }
  const vid = s.youtube && live(s.premiere) ? { '@context': 'https://schema.org', '@type': 'VideoObject', name: `${s.title} — Mochi Cat (official music video)`, description: s.blurb, thumbnailUrl: `https://i.ytimg.com/vi/${s.youtube}/hqdefault.jpg`, uploadDate: s.premiere || s.released, embedUrl: `https://www.youtube.com/embed/${s.youtube}`, contentUrl: `https://www.youtube.com/watch?v=${s.youtube}` } : null
  const L = lyrics(s.slug), k = KO[s.slug]
  const lyr = L.map(l => (l.tag ? `<h3>${h1(l.text)}</h3>` : `<p>${h1(l.text)}${l.tr ? `<br><small>${h1(l.tr)}</small>` : ''}</p>`)).join('')
  page(`/music/${s.slug}`, `${s.title} — Mochi Cat (lyrics & song)`, s.blurb, `/covers/${s.slug}.jpg`, ldTag(rec) + (vid ? ldTag(vid) : ''), { alt: k && `/ko/music/${s.slug}`,
    body: `<h1>${h1(s.title)} — Mochi Cat</h1><p>${h1(s.blurb)}</p>${L.length ? `<h2>${h1(s.title)} lyrics</h2>${lyr}` : ''}<p><a href="/music/">All Mochi Cat songs</a> · <a href="/ko/music/${s.slug}/">한국어</a></p>` })
  if (k) {
    const recKo = { ...rec, url: canon(`/music/${s.slug}`.replace(/^/, '/ko')), description: k.blurb, inLanguage: 'ko' }
    page(`/ko/music/${s.slug}`, `${s.title} 가사 · 뜻 — 모치캣 (Mochi Cat)`, `${k.blurb} ${s.title} 가사와 한국어 번역, 곡 이야기.`, `/covers/${s.slug}.jpg`, ldTag(recKo) + (vid ? ldTag(vid) : ''), { ko: true, alt: `/music/${s.slug}`,
      body: `<h1>${h1(s.title)} 가사 · 뜻 — 모치캣</h1><p>${h1(k.blurb)}</p><h2>곡 이야기 · 가사 뜻</h2><p>${h1(k.story)}</p>${L.length ? `<h2>${h1(s.title)} 가사 · 한국어 번역</h2>${lyr}` : ''}<p><a href="/ko/music/">모치캣 노래 전체 보기</a> · <a href="/music/${s.slug}/">English</a></p>` })
  }
}
// Korean versions of the main pages (own addresses for Naver / Daum / Google)
const songList = ko => `<ul>${songs.map(s => `<li><a href="${ko ? '/ko' : ''}/music/${s.slug}/">${h1(s.title)}</a> — ${h1(ko && KO[s.slug] ? KO[s.slug].blurb : s.blurb)}</li>`).join('')}</ul>`
const KO_HOME = ['모치캣 (Mochi Cat) — 퇴근길에 듣는 위로 노래 · 힐링 컬러링북 · 무료 웹게임', '서울에 사는 회색 고양이 모치캣의 노래. 퇴근길과 공부할 때 듣는 위로 노래, 가사와 한국어 번역, 힐링 컬러링북, 무료 웹게임까지.']
page('/ko', KO_HOME[0], KO_HOME[1], base[2], '', { ko: true, alt: '/', body: `<h1>모치캣 (Mochi Cat)</h1><p>${KO_HOME[1]}</p><h2>모치캣 노래 · 가사</h2>${songList(true)}<p><a href="/ko/games/">무료 웹게임</a> · <a href="/ko/books/">컬러링북</a> · <a href="/ko/stickers/">스티커</a> · <a href="/">English</a></p>` })
for (const [r, t, d] of [
  ['/music', '모치캣 노래 · 가사 — 모치캣 (Mochi Cat)', '모치캣의 모든 노래와 가사, 한국어 번역. 퇴근길·공부할 때 듣는 힐링 K-팝.'],
  ['/videos', '모치캣 뮤직비디오 — 모치캣 (Mochi Cat)', '모치캣 뮤직비디오 모음. 매주 금요일 새 영상 공개!'],
  ['/games', '모치캣 무료 웹게임 — 모치캣 (Mochi Cat)', '설치 없이 브라우저에서 바로 하는 모치캣 무료 게임. 노래마다 미니게임이 있어요.'],
  ['/stickers', '모치캣 스티커 · 이모티콘 — 모치캣 (Mochi Cat)', '귀여운 모치캣 3D 스티커와 움짤. 메신저에서 무료로 써 보세요.'],
  ['/books', '모치캣 컬러링북 — 힐링 색칠 PDF', '모치캣 컬러링북: 어른을 위한 한국 감성 힐링 컬러링북과 아이들을 위한 쉬운 색칠 페이지. 바로 인쇄 가능한 PDF.'],
  ['/free-coloring-pages', '무료 고양이 색칠공부 도안 PDF — 모치캣', '모치캣 무료 색칠공부 도안: 어른용 한국 풍경, 아이용 쉬운 도안. PDF로 내려받아 바로 인쇄하세요.'],
  ['/rooms', '모치의 방 — 공부 · 작업 · 카페 · 수면 음악', '모치캣과 함께하는 긴 로파이 음악: 3시간 공부(뽀모도로), 3시간 작업, 2시간 카페, 8시간 수면 피아노.'],
  ['/about', '모치캣 소개 — 모치캣 (Mochi Cat)', '서울에 사는 통통한 회색 고양이 모치캣. 빨간 반다나를 두르고 퇴근길의 위로를 노래해요.'],
]) page(`/ko${r}`, t, d, r === '/books' ? '/books/adult-en.jpg' : base[2], '', { ko: true, alt: r, body: `<h1>${h1(t)}</h1><p>${h1(d)}</p>${r === '/music' ? songList(true) : ''}<p><a href="/ko/">모치캣 홈</a> · <a href="${r}/">English</a></p>` })
// English main pages get the hreflang link to their Korean twin and a crawlable song list
page('/music', `Music — ${base[0]}`, base[1], base[2], '', { alt: '/ko/music', body: `<h1>Mochi Cat songs & lyrics</h1>${songList(false)}` })
const games = [...fs.readFileSync('src/data/games.ts', 'utf8').matchAll(/'([a-z-]+)': \{ name: '([^']+)', emoji: '[^']*', desc: '([^']+)' \}/g)].map(m => ({ slug: m[1], name: m[2], desc: m[3] }))
for (const g of games) if (g.slug !== 'catch-the-dot') {
  const song = songs.find(s => s.slug === g.slug)
  page(`/games/${g.slug}`, `${g.name} — free Mochi Cat game${song ? ` with “${song.title}”` : ''}`, `${g.desc} Play free in your browser — on phone or computer.`, `/covers/${g.slug}.jpg`)
}
const urls = ['/', '/pocha', '/music', '/videos', '/games', '/stickers', '/books', '/free-coloring-pages', '/rooms', '/about', '/privacy', ...songs.map(s => `/music/${s.slug}`), ...games.map(g => `/games/${g.slug}`),
  '/ko', ...['/music', ...HAS_KO].map(r => `/ko${r}`), ...songs.filter(s => KO[s.slug]).map(s => `/ko/music/${s.slug}`)]
// the home page itself: full preview-image address, canonical and og:url
fs.writeFileSync('dist/index.html', html
  .replace(/(<meta property="og:image" content=")\/[^"]*/, `$1${SITE}/media/mochi_hero_poster.jpg`)
  .replace('</head>', `<link rel="alternate" hreflang="en" href="${SITE}/" /><link rel="alternate" hreflang="ko" href="${SITE}/ko/" /><link rel="alternate" hreflang="x-default" href="${SITE}/" /></head>`)
  .replace('<div id="root"></div>', `<div id="root"><main style="max-width:760px;margin:0 auto;padding:96px 20px;color:#fff;font-family:system-ui,sans-serif;line-height:1.6"><h1>Mochi Cat (모치캣)</h1><p>${h1(base[1])}</p><h2>Songs</h2>${songList(false)}<p><a href="/ko/">한국어</a></p></main></div>`))
const songDate = u => { const s = songs.find(x => `/music/${x.slug}` === u.replace(/^\/ko/, '')); return s ? [s.released, s.premiere].filter(d => d && d <= TODAY).sort().pop() || TODAY : TODAY }
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
fs.writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n\n#DaumWebMasterTool:5c035982f523bfb0311e35eba09bac76816aa32892679dd3916693283a4060ae:y9pY72z5HH+w9gPPOcRKdg==\n`)
console.log(`prerendered ${urls.length} routes`)
