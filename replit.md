# Preserve - Receiver Contingency

A DICOM/RIS radiology workflow management app for radiologists to receive DICOM studies, manually match them to RIS worklist items side-by-side, and confirm links.

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
- `components/StagingZoneLayout.tsx` — **main layout**: header, PACS Recebidos | Zona de Vinculação | RIS Worklist columns, linked history strip; exports `OpsLogEntry`
- `components/OperatorDeckLayout.tsx` — previous layout (kept for reference, not used)
- `components/MatchAlignedLayout.tsx` — legacy layout (kept, not used)
- `components/` — SettingsModal, StudyDetails, Login, IntroSplash, Toast, ModalityBadge, Logo
- `hooks/` — useLocalStorage, useSound
- `constants.ts` — mock DICOM study and worklist seed data
- `types.ts` — DicomStudy, WorklistItem, ConnectionStatus, AppSettings, NetworkState
- `users.ts` — user definitions

## Architecture decisions

- **StagingZoneLayout** is the main layout: 3-column PACS Recebidos | Zona de Vinculação | RIS Worklist; user manually selects one study from each side and confirms inline — no auto-match, no modal
- **Inline confirmation**: clicking CONFIRMAR VÍNCULO in the center directly commits the link (no separate confirmation modal); discrepancy warning shown when data fields don't match
- **OPS LOG** is in-memory (max 100 entries) — populated via `addOpsEntry` in App.tsx; not displayed as a visible panel in this layout
- **Session timer** starts at login (`sessionStart` timestamp), displayed live in the header
- All state persisted via localStorage (studies, worklist, settings); OPS log is session-only

## Product

- PACS Recebidos (left): live feed of received DICOM studies; selected study highlighted with cyan left-border
- RIS Worklist (right): scheduled worklist items; selected item highlighted with indigo right-border
- Zona de Vinculação (center): side-by-side PACS + RIS cards, field-by-field verification table (Nome/Nasc/ID/Modal), CONFIRMAR VÍNCULO button
- Linked history strip: scrollable strip at bottom of center panel showing completed links
- Contingency banner: shown when PACS/RIS offline
- Network status LEDs with glow effects in header; session timer, settings, logout

## User preferences

- Staging Zone aesthetic: `bg-[#020617]`, Inter font, cyan for PACS, indigo for RIS, emerald for linked, amber for warnings

## Gotchas

- `index.html` uses importmap for CDN-based React — Vite handles the actual bundling for dev/build
- Tailwind loaded via CDN script tag in index.html (not PostCSS plugin)
- TypeScript errors in `artifacts/mockup-sandbox/` are pre-existing canvas prototype issues — not main app
- `worklist.status === "completed"` is how the app tracks linked items — `studyInstanceUID` is copied from the DICOM study onto the worklist item at confirm time

## Pointers

- Vite config: `vite.config.ts`
- Types: `types.ts`
- Previous layout (for reference): `components/OperatorDeckLayout.tsx`
