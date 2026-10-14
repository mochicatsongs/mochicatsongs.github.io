import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'

export type Lang = 'en' | 'ko'

/** Korean translations, keyed by the English text. Anything missing falls back to English. */
const KO: Record<string, string> = {
  // nav / common
  'Music': '음악', 'Videos': '뮤직비디오', 'Games': '게임', 'Stickers': '스티커', 'Subscribe': '구독하기', 'Back': '뒤로',
  '▶ Subscribe': '▶ 구독하기', '▶ Subscribe on YouTube': '▶ 유튜브 구독하기', 'Subscribe on YouTube': '유튜브 구독하기',
  'Coming soon': '곧 공개', 'All songs →': '전체 노래 →', 'All games →': '전체 게임 →', 'Play': '재생', 'Pause': '일시정지',
  'Play all': '전체 재생', 'Playing': '재생 중', 'Copied! 💖': '복사됨! 💖',
  // hero
  'Hey there, meet': '안녕! 나는', 'the chubbiest pop star on the internet': '인터넷에서 제일 통통한 팝스타',
  'Glad you stopped by. I love snacks, but I always choose the dance floor. So — what are we doing today?':
    '와줘서 고마워! 나는 간식을 좋아하지만, 언제나 댄스 플로어를 선택해. 자 — 오늘은 뭐 할까?',
  '🎵 Listen': '🎵 듣기', '🎬 Watch': '🎬 보기', '🎮 Play': '🎮 게임', '✨ Stickers': '✨ 스티커',
  // home sections
  'Latest music video': '최신 뮤직비디오', '▶ Watch the video': '▶ 영상 보기', 'A new Mochi video every Friday · 21:00 KST': '매주 금요일 새 모치 영상 · 21:00 KST',
  'Premiere on YouTube': '유튜브 최초 공개', 'Songs': '노래', 'New game': '새 게임',
  'Tap the red dot before it escapes. 30 seconds. It gets faster. Beat your friends!': '빨간 점이 도망가기 전에 터치! 30초, 점점 빨라져요. 친구들과 대결해 보세요!',
  '🎮 Play now': '🎮 지금 플레이', 'More games': '더 많은 게임', 'Mochi for': '모든 기분에', 'every mood': '모치 스티커',
  'Hi, love, wow, snack time — send a chubby Mochi in any chat.': '안녕, 사랑해, 대박, 간식 시간 — 어떤 채팅에서도 통통한 모치를 보내세요.',
  '✨ Get the stickers': '✨ 스티커 받기', 'Find Mochi everywhere': '어디서나 모치를 만나요',
  '💃 Dance with Mochi and tag': '💃 모치와 함께 춤추고 태그하세요',
  '— your video might get featured!': '— 여러분의 영상이 소개될 수도 있어요!',
  'Music and visuals are made with AI tools; characters, stories, lyrics and editing by the Mochi Cat team.': '음악과 영상은 AI 도구로 제작되었으며, 캐릭터·스토리·가사·편집은 모치캣 팀이 만들었습니다.',
  // pages
  'Music videos': '뮤직비디오', 'A new Mochi music video every Friday at 00:00 KST.': '매주 금요일 00:00(KST) 새 모치 뮤직비디오가 공개돼요.',
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
