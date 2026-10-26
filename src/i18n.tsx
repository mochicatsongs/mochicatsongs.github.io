import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'

export type Lang = 'en' | 'ko'

/** Korean translations, keyed by the English text. Anything missing falls back to English. */
const KO: Record<string, string> = {
  // nav / common
  'Music': '음악', 'Videos': '뮤직비디오', 'Games': '게임', 'Stickers': '스티커', 'Privacy': '개인정보 처리방침', 'Subscribe': '구독하기', 'Back': '뒤로',
  '▶ Subscribe': '▶ 구독하기', '▶ Subscribe on YouTube': '▶ 유튜브 구독하기', 'Subscribe on YouTube': '유튜브 구독하기',
  'Coming soon': '곧 공개', 'All songs →': '전체 노래 →', 'All games →': '전체 게임 →', 'Play': '재생', 'Pause': '일시정지',
  'Play all': '전체 재생', 'Playing': '재생 중', 'Copied! 💖': '복사됨! 💖',
  // books
  'Free Coloring Pages': '무료 색칠 도안', 'Free PDF': '무료 PDF', '🎁 Try free pages first': '🎁 무료 도안 먼저 받아보기',
  'Print and color Mochi, the chubby grey cat, for free! Tap a page to open the PDF, then print it at “Actual size” on A4 or Letter.': '통통한 회색 고양이 모치를 무료로 인쇄해서 색칠해요! 페이지를 누르면 PDF가 열려요. A4에 \'실제 크기\'로 인쇄하세요.',
  'Cozy Korea · for grown-ups': '힐링 한국 여행 · 어른용', 'Bold & easy · for kids 4–8': '굵고 쉬운 그림 · 4–8세',
  '40 more pages · Cozy Cat PDF $4.99': '40장 전체 · 어른 컬러링 PDF $4.99', '44 more pages + activities · Kids PDF $4.99': '44장 + 놀이 · 어린이 PDF $4.99',
  'Free for personal and classroom use. Please share a link to this page instead of the files.': '개인·교실에서 무료로 사용할 수 있어요. 파일 대신 이 페이지 링크를 공유해 주세요.', 'All coloring books': '컬러링북 전체 보기',
  'Books': '컬러링북', '🎨 Coloring': '🎨 컬러링북', 'Coloring Books': '컬러링북',
  'Color with Mochi! Instant printable PDFs — download right after checkout and print your favorite pages as many times as you like.': '모치랑 색칠해요! 결제 후 바로 받는 인쇄용 PDF — 마음에 드는 페이지를 몇 번이든 다시 인쇄할 수 있어요.',
  'A cozy coloring book for grown-ups': '어른을 위한 힐링 컬러링북',
  '40 calm scenes of everyday Korea — street food, rainy bus stops, hanok villages, Jeju': '편의점 라면, 비 오는 버스 정류장, 한옥마을, 제주까지 한국의 일상 40장면',
  'One scene per page, easy to print on A4 or Letter': '한 장에 한 그림, A4로 쉽게 인쇄',
  'A Korean word and a tiny cultural fact on every page': '페이지마다 감성 한 줄과 오늘의 영어',
  'Color along to Mochi’s music with the QR codes': 'QR 코드로 모치 음악을 들으며 색칠',
  'Bold, easy pages for ages 4–8': '4~8세를 위한 굵고 쉬운 그림',
  '44 big, simple pictures with thick lines': '굵은 선으로 그린 쉬운 그림 44장',
  'A fun move to do on every page': '페이지마다 따라 하는 신나는 동작',
  'Mazes, dot-to-dot, spot the difference and a bingo': '미로 찾기, 점 잇기, 다른 곳 찾기, 빙고',
  'Print your favorite pages again and again': '좋아하는 페이지를 몇 번이든 다시 인쇄',
  '🖨️ PDF in Korean · Naver': '🖨️ 한국어 PDF · 스마트스토어', 'English PDF': '영어판 PDF',
  '🖨️ Printable PDF · $4.99': '🖨️ 인쇄용 PDF · $4.99', 'Korean edition': '한국어판',
  '📖 Paperback: coming soon': '📖 종이책: 곧 출간', '📖 Paperback on Amazon ↗': '📖 아마존 종이책 (영문판) ↗', '📖 Korean PDF & paperback: coming soon': '📖 한국어 PDF · 종이책: 곧 출시',
  'Pictures were made with AI tools and edited for coloring. For personal and home use.': '그림은 AI 도구로 만든 뒤 색칠하기 좋게 다듬었습니다. 개인·가정용으로 사용해 주세요.',
  // hero
  'Hey there, meet': '안녕! 나는', 'the chubbiest pop star on the internet': '인터넷에서 제일 통통한 팝스타',
  'Glad you stopped by. I love snacks, but I always choose the dance floor. So — what are we doing today?':
    '와줘서 고마워! 나는 간식을 좋아하지만, 언제나 댄스 플로어를 선택해. 자 — 오늘은 뭐 할까?',
  '🎵 Listen': '🎵 듣기', '🎬 Watch': '🎬 보기', '🎮 Play': '🎮 게임', '✨ Stickers': '✨ 스티커',
  // home sections
  'Latest music video': '최신 뮤직비디오', '▶ Watch the video': '▶ 영상 보기', 'A new Mochi video every Friday · 09:00 KST': '매주 금요일 새 모치 영상 · 오전 9시 KST',
  'Premiere on YouTube': '유튜브 최초 공개', 'Songs': '노래', 'New game': '새 게임',
  'Tap the red dot before it escapes. 30 seconds. It gets faster. Beat your friends!': '빨간 점이 도망가기 전에 터치! 30초, 점점 빨라져요. 친구들과 대결해 보세요!',
  '🎮 Play now': '🎮 지금 플레이', 'More games': '더 많은 게임', 'Mochi for': '모든 기분에', 'every mood': '모치 스티커',
  'Hi, love, wow, snack time — send a chubby Mochi in any chat.': '안녕, 사랑해, 대박, 간식 시간 — 어떤 채팅에서도 통통한 모치를 보내세요.',
  '✨ Get the stickers': '✨ 스티커 받기', 'Find Mochi everywhere': '어디서나 모치를 만나요',
  '💃 Dance with Mochi and tag': '💃 모치와 함께 춤추고 태그하세요',
  '— your video might get featured!': '— 여러분의 영상이 소개될 수도 있어요!',
  'Music and visuals are made with AI tools; characters, stories, lyrics and editing by the Mochi Cat team.': '음악과 영상은 AI 도구로 제작되었으며, 캐릭터·스토리·가사·편집은 모치캣 팀이 만들었습니다.',
  // pages
  'Music videos': '뮤직비디오', 'A new Mochi music video every Friday at 09:00 KST.': '매주 금요일 오전 9시(KST) 새 모치 뮤직비디오가 공개돼요.',
  'Premiere': '최초 공개', 'set a reminder 🔔': '알림 설정 🔔', 'Music video premiere': '뮤직비디오 최초 공개',
  'Lyrics': '가사', '♪ follows the music': '♪ 음악에 맞춰 표시', 'Next song': '다음 노래',
  'Lyrics are coming soon. Meanwhile — press play and dance! 💃': '가사는 곧 공개돼요. 그동안 재생하고 춤춰요! 💃',
  '▶ Play now': '▶ 지금 플레이', 'About Mochi': '모치 소개',
  'Tap the red dot before it escapes. It gets faster!': '빨간 점이 도망가기 전에 터치! 점점 빨라져요!',
  'Bounce across neon rooftops.': '네온 지붕 위를 통통 뛰어요.', 'Stop exactly when the music stops.': '음악이 멈추면 딱 멈춰요.',
  'Mochi always chooses sport… mostly.': '모치는 언제나 운동을 선택해요… 대체로요.',
  // stickers page
  'Animated 3D Mochi stickers': '움직이는 3D 모치 스티커',
  'Tap a sticker to save it, or find them on GIPHY — search': '스티커를 눌러 저장하거나 GIPHY에서 찾아보세요 — 검색:',
  'in Instagram Stories, TikTok and messengers.': '인스타그램 스토리, 틱톡, 메신저에서 사용할 수 있어요.',
  'Open Mochi on GIPHY': 'GIPHY에서 모치 보기', 'Everyday': '일상', 'Holidays': '기념일',
  'Download': '다운로드',
  // game
  'Score': '점수', 'Best': '최고', '🔁 Play again': '🔁 다시 하기', '📤 Share score': '📤 점수 공유', '▶ Start 🔴': '▶ 시작 🔴',
  'Lyrics & song': '가사 & 노래',
  'Agent Mochi needs your help! Tap the red dot as many times as you can in 30 seconds. It gets faster and smaller…': '요원 모치에게 도움이 필요해요! 30초 동안 빨간 점을 최대한 많이 터치하세요. 점점 빨라지고 작아져요…',
  '🎵 with the song “Catch the Dot”': '🎵 노래 “Catch the Dot”과 함께',
  // player
  'Shuffle': '셔플', 'Repeat one song': '한 곡 반복', 'Repeat all songs': '전체 반복', 'Repeat off': '반복 끔',
  // arcade games
  'Slide your finger left and right': '손가락을 좌우로 움직여요', 'Tap anywhere on the screen': '화면 아무 곳이나 탭해요',
  'Tap the left or right side': '왼쪽 또는 오른쪽을 탭해요', 'Tap the right things': '알맞은 것을 탭해요',
  'Mouse or ← → keys': '마우스 또는 ← → 키', 'Click or Space': '클릭 또는 스페이스', 'Click or ← → keys': '클릭 또는 ← → 키', 'Click with the mouse': '마우스로 클릭',
  'Halloween special': '할로윈 스페셜', 'Neon Halloween Party': '네온 할로윈 파티', 'Glowing pumpkins, lasers and a very chubby dancer. Learn the Neon Jump moves now and freeze on “FREEZE!”': '빛나는 호박, 레이저, 그리고 아주 통통한 댄서! 네온 점프 춤을 미리 배우고 “얼음!”에서 멈춰요', 'The music video is out now!': '뮤직비디오 공개!', 'Video premiere in': '뮤직비디오 공개까지', 'd': '일', 'h': '시', 'm': '분', 's': '초', 'Song & lyrics': '노래 & 가사', 'Play Neon Jump': '네온 점프 게임',
  '▶ Start': '▶ 시작', 'with the song': '노래와 함께', 'Next game': '다음 게임', 'Play the game': '게임 하기', '▶ Play': '▶ 플레이',
  'One game for every Mochi song — with the song playing. Beat your best score!': '모치의 노래마다 게임이 하나씩! 노래를 들으며 최고 기록에 도전하세요!',
  'New record! 🏆': '신기록! 🏆', 'Oops! Try again 🐾': '앗! 다시 해봐요 🐾', 'Nice! One more try?': '좋아요! 한 번 더?', 'Great paws! 🐾': '최고의 발놀림! 🐾',
  'Mochi is proud of you! 💖': '모치가 자랑스러워해요! 💖', 'Copied! Paste it anywhere 📋': '복사됨! 어디든 붙여넣기 📋', 'Paste': '붙여넣기',
  'Your turn!': '네 차례!', 'Watch…': '잘 봐…', 'reps': '회', 'Next': '다음', 'Not for cats!': '고양이는 안 돼!', 'Too late!': '너무 늦었어!', 'Too early!': '너무 일러!',
  'USA': '미국', 'Korea': '한국', 'Japan': '일본', 'France': '프랑스', 'Italy': '이탈리아', 'Spain': '스페인', 'Russia': '러시아', 'China': '중국', 'Germany': '독일', 'Türkiye': '튀르키예',
  'Catch the falling stars and light up the night.': '떨어지는 별을 잡아 밤하늘을 밝혀요.',
  'Move Mochi left and right. Catch ⭐ stars, dodge ⚡ storm clouds!': '모치를 좌우로 움직여 ⭐ 별을 잡고, ⚡ 먹구름은 피하세요!',
  'Bounce up the neon rooftops. How high can Mochi go?': '네온 지붕 위로 통통! 모치는 얼마나 높이 갈 수 있을까요?',
  'Mochi bounces by himself — steer left and right. Grab 🎃 for bonus points. Don’t fall!': '모치는 스스로 점프해요 — 좌우로 조종하세요. 🎃를 잡으면 보너스! 떨어지지 마세요!',
  'Match the meows from around the world.': '세계 곳곳의 “야옹”을 짝지어 보세요.',
  'Flip two cards. Find the same “meow” from the same country. Clear the board for a time bonus!': '카드 두 장을 뒤집어 같은 나라의 “야옹”을 찾으세요. 판을 다 맞히면 보너스!',
  'Super Mochi flies between the towers. Snacks can wait!': '슈퍼 모치가 빌딩 사이를 날아요. 간식은 나중에!',
  'Tap (or press space) to flap up. Fly through the gaps between the towers.': '탭(또는 스페이스)하면 위로 날아요. 빌딩 사이 틈으로 통과하세요.',
  'Hit the arrows on the beat and dance with Mochi.': '박자에 맞춰 화살표를 누르고 모치와 춤춰요.',
  'Tap the lane (or use arrow keys) when an arrow reaches the glowing line. Perfect timing = more points!': '화살표가 빛나는 선에 닿을 때 그 줄을 탭(또는 방향키)! 정확할수록 점수 UP!',
  'Listen to the meows and sing them back.': '야옹 소리를 듣고 똑같이 따라 불러요.',
  'Watch the cats meow in order, then tap them in the same order. Every round adds one more meow!': '고양이들이 우는 순서를 보고 똑같이 탭하세요. 라운드마다 하나씩 늘어나요!',
  'Line-dance down the dusty road. Dodge the cacti!': '먼지 길을 라인댄스로 달려요. 선인장을 피하세요!',
  'Tap left or right (or use arrow keys) to switch lanes. Collect 🤠 hats, dodge 🌵 and 🪨.': '왼쪽/오른쪽을 탭(또는 방향키)해 차선을 바꾸세요. 🤠 모자는 모으고 🌵 🪨은 피하세요.',
  'Stack the tallest milkshake ever!': '세상에서 제일 높은 밀크셰이크를 쌓아요!',
  'Tap to drop the sliding scoop. Whatever hangs over the edge falls off. Perfect drops keep it wide!': '움직이는 스쿱을 탭해서 떨어뜨리세요. 삐져나온 부분은 떨어져요. 딱 맞추면 넓게 유지!',
  'Leg day? Every day. Help Mochi lift!': '하체 운동? 매일매일! 모치의 운동을 도와주세요!',
  'Tap (or space) when the needle is in the green zone. Center = PERFECT. The zone gets smaller!': '바늘이 초록 구간에 있을 때 탭(또는 스페이스)! 가운데면 PERFECT. 구간은 점점 좁아져요!',
  'Feed Mochi — but only cat-safe snacks!': '모치에게 간식을 — 고양이에게 안전한 것만!',
  'Tap 🐟 🍗 🍤 🥚 fast! Never tap 🧅 🍫 🍇 🧄 — they are not for cats.': '🐟 🍗 🍤 🥚를 빨리 탭! 🧅 🍫 🍇 🧄는 절대 안 돼요 — 고양이에게 위험해요.',
  'Rock out! Hit the drums before the ring closes.': '록 스피릿! 링이 닫히기 전에 드럼을 치세요.',
  'When a drum lights up, tap it before its ring shrinks to nothing. It gets faster — rock on!': '드럼에 불이 들어오면 링이 사라지기 전에 탭하세요. 점점 빨라져요 — 록 온!',
  'Keep Mochi bouncing with the trampoline!': '트램펄린으로 모치를 계속 통통 튀게 해요!',
  'Move the trampoline under Mochi. Every bounce = 1 point, every ⭐ = 3. Don’t let him drop!': '트램펄린을 모치 아래로 움직이세요. 튈 때마다 1점, ⭐는 3점. 떨어뜨리지 마세요!',
  'Switch on Mochi Mode: focus and tap in order.': '모치 모드 ON: 집중해서 순서대로 탭!',
  'Tap the numbers in order: 1, 2, 3… as fast as you can. Each board gets bigger!': '숫자를 1, 2, 3… 순서대로 최대한 빨리 탭하세요. 판이 점점 커져요!',
  'Jump, dodge, respawn — the Mochi obstacle course!': '점프, 회피, 리스폰 — 모치 장애물 코스!',
  'Tap (or space) to jump — tap again in the air for a double jump. Grab 🐟, avoid blocks and lava!': '탭(또는 스페이스)으로 점프 — 공중에서 한 번 더 탭하면 더블 점프! 🐟는 먹고 블록과 용암은 피하세요!',
  'Pop the floating hearts for your friends.': '친구들을 위해 떠다니는 하트를 터뜨려요.',
  'Tap 💖 bubbles to pop them, 💛 is worth 3! Avoid 💔. Pop quickly in a row for combos.': '💖 방울을 탭해서 터뜨리세요. 💛는 3점! 💔는 피하세요. 연속으로 빨리 터뜨리면 콤보!',
  'Harvest the veggies exactly when they are ripe.': '채소가 딱 익었을 때 수확하세요.',
  'Plants grow 🌱 → 🌿 → ripe! Tap only ripe veggies. Too early or too late — it’s lost!': '🌱 → 🌿 → 수확! 익은 채소만 탭하세요. 너무 이르거나 늦으면 놓쳐요!',
  'Fiesta time! Whack the swinging piñata.': '피에스타 타임! 흔들리는 피냐타를 쳐요.',
  'Tap the piñata to whack it. Every broken piñata = +5 and a candy shower. They swing faster each time!': '피냐타를 탭해서 치세요. 깨질 때마다 +5와 사탕 비! 점점 빨리 흔들려요!',
}

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: 'en', setLang: () => {} })

function initial(): Lang {
  try {
    const q = new URLSearchParams(location.search).get('lang')
    if (q === 'ko' || q === 'en') return q
    const s = localStorage.getItem('mochi-lang')
    if (s === 'ko' || s === 'en') return s
  } catch { /* ignore */ }
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('ko') ? 'ko' : 'en'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initial)
  const setLang = useCallback((l: Lang) => { setLangState(l); try { localStorage.setItem('mochi-lang', l) } catch { /* ignore */ } }, [])
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>
}

export const useLang = () => useContext(Ctx)
export function useT() {
  const { lang } = useLang()
  return useCallback((s: string) => (lang === 'ko' ? KO[s] ?? s : s), [lang])
}
