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
- `src/vehicle-catalog.js`: all seven vehicles, exact IDs, factories and per-vehicle parts. `src/vehicle-kit.js` shares primitives; `src/work-vehicles.js` builds the six working vehicles.
- `src/part-illustrations.js`, `src/vehicle-pictures.js`, `public/audio/vi/`: picture choices and Vietnamese narration. New IDs need matching images and audio.
- `src/camera-fit.js`: camera-space framing of assembled/separated bounds, including tall cranes and long trailers.
- `src/main.js`: routes, renderer, camera, part selection, speech and progress UI.
- `src/tap-tracker.js`: distinguishes intentional taps from drag/pinch/cancel sequences.
- `src/style.css`: approved visual language and responsive layouts.
- `docs/IPAD-UX.md`: researched choices, device test matrix and remaining real-device checks.
- `DECISIONS.md`: accepted product decisions; update it when a decision changes.
- `Dockerfile`, `docker-compose.yml`, `deploy/`, `Jenkinsfile`: static nginx image on 127.0.0.1:6666 behind Nginx UI at vehicle.hoha.dev; setup and verification limits in `docs/DEPLOY.md`.

## Commands and checks
- `npm install`; `npm run dev -- --port 5173`; `npm run build`; `npm test`.
- Image: `IMAGE_TAG=local docker compose build` (runs `npm test` and the build inside); `sh deploy/deploy.sh local`. Keep the app static: no backend in the container.
- For geometry edits, inspect front, side, rear, three-quarter and separated states in the browser.
- For interaction edits, run tap regression tests and try part picking, zoom, separation, reset and navigation.
- Keep generated `dist/` and `node_modules/` out of source control. Do not replace the stack or add a backend for routine model work.
- Use only licensed reference assets; do not claim generated geometry is an official Hyundai model.
- Speech prefers bundled Vietnamese audio in `public/audio/vi/`, then device voices. Add matching pictures/audio for new part IDs; preserve text and an honest failure fallback.

## Current boundaries
- Seven live vehicles. Register new ones in the catalog; keep exact route matching, per-vehicle progress and resource disposal on model switches.
- Driving controls must match the vehicle: road vehicles have steering wheels; the tracked excavator has joysticks. Check crane hook/cabin clearance through the full separation range.
- No account, tracking, ads or purchases are part of the current app. Deployment is a self-hosted static site (Jenkins → Docker → Nginx UI). Bundled narration is synthesized with the local Vietnamese Linh voice, not a human recording.
- Do not add gamification, time pressure or a new visual direction without a product request.
