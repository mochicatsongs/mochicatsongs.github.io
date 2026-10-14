/** 3D animated stickers. EN = everyday + USA set, KO = Korean set. Files live in public/stickers/<lang>/<id>.webp */
export type Sticker = { id: string; label: string; group: 'everyday' | 'holiday' }
const E = (id: string, label: string, group: Sticker['group'] = 'everyday'): Sticker => ({ id, label, group })

export const STICKERS_EN: Sticker[] = [
  E('hi', 'HI!'), E('thank_you', 'THANK YOU'), E('love_you', 'LOVE YOU'), E('yay', 'YAY!'), E('lol', 'LOL'), E('hugs', 'HUGS'),
  E('mwah', 'MWAH'), E('omg', 'OMG'), E('im_done', "I'M DONE"), E('sad', 'SAD'), E('good_morning', 'GOOD MORNING'), E('good_night', 'GOOD NIGHT'),
  E('high_five', 'HIGH FIVE!'), E('howdy', 'HOWDY!'), E('lets_gooo', "LET'S GOOO"), E('bruh', 'BRUH'), E('no_way', 'NO WAY!'),
  E('happy_bday', 'HAPPY BIRTHDAY', 'holiday'), E('thanksgiving', 'HAPPY THANKSGIVING', 'holiday'), E('christmas', 'MERRY CHRISTMAS', 'holiday'),
  E('new_year', 'HAPPY NEW YEAR', 'holiday'), E('fourth', 'HAPPY 4TH!', 'holiday'),
]

export const STICKERS_KO: Sticker[] = [
  E('hi', '안녕!'), E('thank_you', '고마워'), E('love_you', '사랑해'), E('yay', '신난다!'), E('lol', 'ㅋㅋㅋ'), E('hugs', '안아줘'),
  E('mwah', '쪽!'), E('omg', '헐!'), E('im_done', '지쳤어…'), E('sad', '슬퍼'), E('good_morning', '좋은 아침'), E('good_night', '잘 자'),
  E('high_five', '하이파이브!'), E('howdy', '반가워!'), E('lets_gooo', '가자!'), E('bruh', '어이없어'), E('no_way', '대박!'), E('thanksgiving', '맛있겠다!'),
  E('happy_bday', '생일 축하해', 'holiday'), E('christmas', '메리 크리스마스', 'holiday'), E('new_year', '새해 복 많이 받아', 'holiday'),
]
