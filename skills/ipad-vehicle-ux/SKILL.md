---
name: ipad-vehicle-ux
description: Improves or verifies Gara tí hon's interactive 3D vehicle experience for children using an iPad. Use for tablet layouts, touch selection, pinch/rotation, viewer controls or speech interactions; not for vehicle-only geometry or generic documentation edits.
---

# iPad vehicle UX

The primary user is six years old and holds the iPad horizontally. Preserve the approved cream/green/orange design; improve reachability, readable feedback and reliable touch behavior within it.

The child may not read yet. Recognizable part pictures and action symbols come first; Vietnamese labels remain supplementary. Provide an obvious speaker button with spoken instructions. Check whether the child can enter the car, choose a wheel, separate/reassemble and replay a name without reading labels. Do not replace all parts with one generic car icon or numbered buttons.

## Layout and actions
- Landscape: large model on the left; named part buttons on the right; separation and zoom immediately below the model. Avoid requiring whole-page scrolling for the main controls.
- Fit the actual browser viewport, including Safari toolbar space, safe areas and Split View; use responsive width/height rather than user-agent checks.
- Portrait remains usable. Keep a visible model/selection summary when the part list moves below it. Do not force device rotation or lock page zoom.
- Use at least 44×44 CSS px for essential web touch targets, preferably 48–56 for primary child-facing buttons, with spacing. This is a project choice, not an assertion that native points equal CSS pixels.
- Provide named view buttons as alternatives to dragging, plus zoom and separation buttons as alternatives to pinching/sliding. Avoid hover-only instructions.
- Show a selected part's name and replay action near the model, not only in an off-screen panel. Keep Vietnamese text available when speech fails.

## Touch and motion
- Restrict `touch-action: none` to the 3D canvas. Surrounding content must still scroll and browser zoom must remain enabled.
- Track pointer identity, maximum movement and multi-pointer sessions. Once a gesture becomes a drag/pinch/cancel, releasing fingers must not select a part—even if the last finger ends at the start position.
- Use the existing `src/tap-tracker.js` for this distinction; extend its behavioral tests when changing gesture semantics.
- Keep camera distance and explosion state predictable. Explicit separation controls override automatic zoom separation until the next zoom action; reset restores the assembled vehicle and camera.
- Keep the assembled target still for the child. Respect reduced motion in JavaScript animations as well as CSS.

## Audio and performance
- Start speech from an intentional tap. Cancel the previous utterance before a new name; cancel when muting or leaving the view.
- Prefer bundled Vietnamese M4A files in `public/audio/vi/`, with device speech as fallback. Device voices vary. Do not claim verified sound from a DOM check; verify files decode and playback is triggered, then separately report whether pronunciation was heard/reviewed. If both audio paths fail, text alone does not enable independent use by a non-reading child; state that limitation.
- Clamp render resolution on touch hardware, avoid unnecessary high-resolution shadows, merge appropriate geometry and skip hidden-tab rendering. Measure before promising smoothness on older iPads.

## Verify and hand off
- Try 1024×768 and 1180×820 landscape, reduced-height landscape such as 1024×650, portrait 820×1180, and a narrow phone/Split View layout.
- Check horizontal overflow, essential target sizes, readable long names, full separation framing, reachable list items, reset, replay, rapid part changes and home navigation.
- Test intentional tap, slight finger jitter, drag away-and-back, pinch with staggered release, cancellation and ordinary page scrolling. Avoid tests that merely assert implementation strings.
- Check actual canvas wiring as well as tracker unit tests: all part selection must pass through tap classification; a second click handler must not reintroduce selection after a pinch. Confirm that a fresh tap after a pinch still selects normally.
- Distinguish browser viewport checks, gesture unit tests and physical Safari/iPad testing. Report any unverified category explicitly.
- Record significant interaction choices and device findings in `docs/IPAD-UX.md`; don't turn unresolved ideas into approved features.
