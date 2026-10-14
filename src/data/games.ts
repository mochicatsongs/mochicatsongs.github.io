import { SONGS } from './songs'

/** Lightweight game catalogue (no game code) — used by lists, song pages and the prerender. One game per song. */
export const GAME_INFO: Record<string, { name: string; emoji: string; desc: string }> = {
  'catch-the-dot': { name: 'Catch the Dot', emoji: '🔴', desc: 'Tap the red dot before it escapes. It gets faster!' },
  'shine-like-mochi': { name: 'Star Catcher', emoji: '⭐', desc: 'Catch the falling stars and light up the night.' },
  'neon-jump': { name: 'Neon Jump', emoji: '🎃', desc: 'Bounce up the neon rooftops. How high can Mochi go?' },
  'meow-in-every-language': { name: 'Meow Match', emoji: '🌍', desc: 'Match the meows from around the world.' },
  'the-chubby-super-cat': { name: 'Super Cat Flight', emoji: '🦸', desc: 'Super Mochi flies between the towers. Snacks can wait!' },
  'mochi-dance': { name: 'Dance Arrows', emoji: '💃', desc: 'Hit the arrows on the beat and dance with Mochi.' },
  'meow-meow-mochi-cat': { name: 'Meow Says', emoji: '🎶', desc: 'Listen to the meows and sing them back.' },
  'mochi-mochi-challenge': { name: 'Rodeo Run', emoji: '🤠', desc: 'Line-dance down the dusty road. Dodge the cacti!' },
  'milkshake-shake': { name: 'Milkshake Tower', emoji: '🥤', desc: 'Stack the tallest milkshake ever!' },
  'chonky-gym-cat': { name: 'Power Lift', emoji: '🏋️', desc: 'Leg day? Every day. Help Mochi lift!' },
  'nom-nom-nom': { name: 'Nom Nom Snack Time', emoji: '🐟', desc: 'Feed Mochi — but only cat-safe snacks!' },
  'super-paw-rock': { name: 'Paw Drums', emoji: '🥁', desc: 'Rock out! Hit the drums before the ring closes.' },
  'belly-bounce': { name: 'Belly Bounce', emoji: '🤸', desc: 'Keep Mochi bouncing with the trampoline!' },
  'mochi-mode': { name: 'Focus Mode', emoji: '🔢', desc: 'Switch on Mochi Mode: focus and tap in order.' },
  'mochi-obby': { name: 'Mochi Obby', emoji: '🧱', desc: 'Jump, dodge, respawn — the Mochi obstacle course!' },
  'mochi-heart': { name: 'Heart Pop', emoji: '💖', desc: 'Pop the floating hearts for your friends.' },
  'mochi-farm': { name: 'Harvest Time', emoji: '🥕', desc: 'Harvest the veggies exactly when they are ripe.' },
  'mochi-fiesta': { name: 'Piñata Party', emoji: '🪅', desc: 'Fiesta time! Whack the swinging piñata.' },
}
export const GAME_LIST = SONGS.filter(s => GAME_INFO[s.slug]).map(s => ({ slug: s.slug, song: s, ...GAME_INFO[s.slug] }))
export const nextGame = (slug: string) => { const i = GAME_LIST.findIndex(g => g.slug === slug); return GAME_LIST[(i + 1) % GAME_LIST.length] }
