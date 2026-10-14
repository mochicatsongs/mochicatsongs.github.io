# Mochi Cat — official site

React + Vite + TypeScript + Tailwind. Deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

## Add a new song
1. `public/audio/<slug>.mp3` (128 kbps), `public/covers/<slug>.jpg` (300×300)
2. Optional lyrics: `public/lyrics/<slug>.json` → `{ "synced": true, "lines": [{ "t": 12.3, "text": "..." }] }`
3. Add one entry to `src/data/songs.ts` (set `lyrics: true` if step 2).

## Dev
npm install · npm run dev · npm run build
