# Preserve - Receiver Contingency

A DICOM/RIS radiology workflow management app that lets radiologists receive studies, link them to worklist items, and manage settings for PACS and RIS connections.

## Run & Operate

- `npm run dev` — start dev server on port 5000
- `npm run build` — production build
- Optional env var: `GEMINI_API_KEY` (for any AI features)

## Stack

- React 19 + TypeScript
- Vite 6 (build tool / dev server)
- Tailwind CSS (via CDN in index.html)
- Lucide React (icons)
- No backend — purely frontend app with localStorage persistence

## Where things live

- `App.tsx` — main application logic and state
- `components/` — all UI components (Header, StudyList, RisWorklist, StudyDetails, Login, etc.)
- `hooks/` — useLocalStorage, useSound
- `constants.ts` — mock DICOM study and worklist data
- `types.ts` — TypeScript type definitions
- `users.ts` — user definitions

## Architecture decisions

- All state persisted via localStorage (no backend required)
- Mock data seeded from `constants.ts` on first load
- Sound notifications supported via `useSound` hook
- App uses an intro splash and login screen before main UI

## Product

- Receive and display incoming DICOM studies
- Manage a RIS worklist and link studies to worklist items
- View study details and images
- Configure PACS/RIS connection settings
- User authentication (local)

## User preferences

_Populate as you build_

## Gotchas

- `index.html` uses importmap for CDN-based React — Vite handles the actual bundling for dev/build
- Tailwind loaded via CDN script tag in index.html (not PostCSS plugin)

## Pointers

- Vite config: `vite.config.ts`
- Types: `types.ts`
