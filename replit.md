# Preserve - Receiver Contingency

A DICOM/RIS radiology workflow management app with a terminal/mission-control aesthetic for radiologists to receive DICOM studies, auto-match them to RIS worklist items, and confirm links.

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

- `App.tsx` — main app logic, all state, WebSocket, OPS log, session timer
- `components/OperatorDeckLayout.tsx` — **main layout**: terminal header, metrics ribbon, INCOMING | WORKSTATION | OPS LOG columns, footer bar
- `components/MatchAlignedLayout.tsx` — legacy layout (kept, not used in main app)
- `components/Header.tsx` — legacy header (kept, not used in main app)
- `components/` — LinkConfirmationModal, SettingsModal, StudyDetails, Login, IntroSplash, Toast, ModalityBadge
- `hooks/` — useLocalStorage, useSound
- `constants.ts` — mock DICOM study and worklist seed data
- `types.ts` — DicomStudy, WorklistItem, ConnectionStatus, AppSettings, NetworkState
- `users.ts` — user definitions

## Architecture decisions

- **Operator Deck layout** replaces both the Header component and MatchAlignedLayout; it owns the header, metrics ribbon, three-column body, and status footer
- **Auto-match** in the Workstation: when a study is selected from INCOMING, the best RIS worklist match (≥60% confidence) is shown automatically; operator reviews and confirms
- **OPS LOG** is an in-memory append-only list (max 100 entries) of link events, network events, and RIS sync events — reset on logout
- **Session timer** starts at login (`sessionStart` timestamp), displayed live in the header
- All state persisted via localStorage (studies, worklist, settings); OPS log is session-only

## Product

- INCOMING panel: live feed of received DICOM studies with status badges (NEW / ACTIVE / DONE)
- WORKSTATION: auto-matched pair view with field-by-field verification (NAME, DOB, ID, MODALITY) and CONFIRMAR VÍNCULO button
- OPS LOG: timestamped audit trail for the session (LINKED, UNMATCHED, SYSTEM EVENTS)
- Metrics ribbon: RECEBIDOS, VINCULADOS, PENDENTES, SEM MATCH, STATUS, TAXA
- Contingency mode: bottom bar shows "CONTINGÊNCIA ATIVA" when PACS/RIS offline
- PACS/RIS network status LEDs with glow effects in header
- Settings, study details, link confirmation modal as overlays

## User preferences

- Operator Deck (V3) aesthetic: `bg-[#020817]`, monospace fonts, cyan for PACS/incoming, emerald for linked, amber for warnings, rose for errors

## Gotchas

- `index.html` uses importmap for CDN-based React — Vite handles the actual bundling for dev/build
- Tailwind loaded via CDN script tag in index.html (not PostCSS plugin)
- TypeScript errors in `artifacts/mockup-sandbox/` are pre-existing canvas prototype issues — not main app

## Pointers

- Vite config: `vite.config.ts`
- Types: `types.ts`
- Legacy layout (for reference): `components/MatchAlignedLayout.tsx`
