# Gara tí hon — project guidance

## Product
- Vietnamese vehicle exploration web app for a six-year-old. Primary device: iPad held in landscape.
- The child may not read yet: recognizable part pictures, direct model tapping and spoken guidance must support the main flow; text is supplementary.
- Preserve the approved cream/green/orange UI, typography, rounded cards and quiet tone. Improve usability within that design.
- First vehicle is a white toy-style sedan inspired by the Vietnam-market Hyundai Accent 2021. It is not an exact CAD replica.
- Core loop: choose vehicle → rotate/zoom → separate parts → tap a part to see/hear its Vietnamese name.
- Keep tap alternatives for gestures, both orientations usable, and controls reachable without hover.

## Workflows
- For creating or reshaping a 3D vehicle, read `skills/create-vehicle/SKILL.md`.
- For touch, viewer controls or tablet layout changes, read `skills/ipad-vehicle-ux/SKILL.md`.
- These shared project skills apply to both Codex and Claude; keep one canonical copy in `skills/`.
- State visual fidelity and verification limits plainly. Desktop viewport testing is not a real iPad/Safari test.

## Code map
- `src/car.js`: geometry, semantic part metadata, independent explosion groups, picking IDs, highlight materials.
- `src/main.js`: routes, renderer, camera, part selection, speech and progress UI.
- `src/tap-tracker.js`: distinguishes intentional taps from drag/pinch/cancel sequences.
- `src/style.css`: approved visual language and responsive layouts.
- `docs/IPAD-UX.md`: researched choices, device test matrix and remaining real-device checks.
- `DECISIONS.md`: accepted product decisions; update it when a decision changes.

## Commands and checks
- `npm install`; `npm run dev -- --port 5173`; `npm run build`; `npm test`.
- For geometry edits, inspect front, side, rear, three-quarter and separated states in the browser.
- For interaction edits, run tap regression tests and try part picking, zoom, separation, reset and navigation.
- Keep generated `dist/` and `node_modules/` out of source control. Do not replace the stack or add a backend for routine model work.
- Use only licensed reference assets; do not claim generated geometry is an official Hyundai model.
- Speech prefers bundled Vietnamese audio in `public/audio/vi/`, then device voices. Add matching pictures/audio for new part IDs; preserve text and an honest failure fallback.

## Current boundaries
- One live vehicle. Routes, copy and progress still contain Accent-specific data; make them vehicle-aware when adding another vehicle.
- No account, tracking, ads, purchases or external deployment are part of the current app. Bundled narration is synthesized with the local Vietnamese Linh voice, not a human recording.
- Do not add gamification, time pressure or a new visual direction without a product request.
