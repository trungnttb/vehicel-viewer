---
name: create-vehicle
description: Builds or refines recognizable, separable toy-style 3D vehicles in Gara tí hon. Use for adding a vehicle, changing vehicle proportions or appearance, or preparing tappable vehicle parts; not for UI-only changes or adding a static vehicle picture.
---

# Create a vehicle for Gara tí hon

Deliver a recognizable toy vehicle with independently selectable educational parts, working separation and an accurate handoff. The audience is six years old; the primary device is a landscape iPad. Preserve the existing cream/green/orange interface.

## Establish shape before detail
- Use the requested model, year, market and color. If unspecified, infer reasonable choices and state assumptions; don't block on routine styling decisions.
- For a named real vehicle, inspect reliable front, side and rear references. Record source links and the features actually used. Source photos are references, not automatically licensed distributable assets.
- Start with length/width/height, wheelbase, wheel radius, overhangs, hood/cabin/trunk silhouette. A sedan must not become an SUV because its cabin is tall.
- Check the silhouette in a side view before spending effort on grille mesh, tread or badges. Keep wheels circular when reshaping the body; never flatten the entire vehicle with a Y scale.
- Choose a few identity cues that survive toy styling: e.g. sloped sedan windshield, tapered grille, swept lamps. Avoid claiming exact or official reproduction.

## Geometry and parts
- Current coordinates: X length, front toward −X; Y up; Z across the vehicle; ground near Y=0. Side profiles extrude toward +Z, including on the negative side.
- Current factory returns `{ root, bounds, explode(amount), select(id) }`. `bounds` is assembled geometry. Recompute it after changing shape.
- Each part has a stable ID, Vietnamese name, short child-friendly description, English label and color. Every selectable mesh has a matching `userData.part`.
- Multiple physical objects may share a name (four wheels) while living in different moving groups. Never combine their explosion transforms.
- Current groups start at the origin, with geometry in assembled coordinates. `explode()` writes `delta × clamp(amount,0,1)` to their positions. If you introduce nonzero group origins, preserve their base transforms explicitly.
- Model appropriate openings: wheel arches around tires, an engine cavity where applicable, and separated roof/doors exposing interior parts. Do not impose sedan hood/trunk parts on buses or other vehicle types. Check seams and collisions from both sides.
- Keep initial emissive values so selecting another part or resetting restores every material, including lights.

## Integrate only the requested scope
- For a refinement, preserve routes, part IDs and existing actions unless the shape requires a change.
- For a second vehicle, make the catalog, exact route lookup, title, preview, canvas label, metadata, total part count and progress vehicle-aware. Current `main.js` is still Accent-specific; do not assume that adding a factory automatically registers a vehicle.
- Keep discovery progress separate per vehicle; switching vehicles cancels speech and clears stale selection.
- Detach and dispose unused model resources, or use a deliberate cache. Do not accumulate render loops/listeners when navigating.
- Keep Vietnamese voice fallback and part-list selection available even when a tiny mesh is hard to tap.
- The child may not read: add recognizable pictures in `src/part-illustrations.js` for new parts and matching `/audio/vi/{id}.m4a` narration. Existing narration plays bundled files before device speech. Never silently reuse a shared ID with a different spoken meaning.
- `scripts/generate-audio.mjs` generates current narration with a local macOS voice; it is optional for runtime. Extend its source data or use reviewed audio assets for new vehicles. Do not promise generated audio before files exist and play.

## Performance and verification
- Favor silhouette quality over imperceptible geometry. Merge static meshes only within the same moving group and material; preserve picking IDs and per-part highlight isolation.
- Measure mesh/triangle counts after edits. The current sedan is the reference budget, not a universal fixed cap; investigate large increases and validate on the target hardware before claiming frame rate.
- Run model checks and build. Inspect front, side, rear, three-quarter, assembled, half-separated and fully separated views; check all parts stay in frame at minimum zoom and narrow layouts.
- Try the model directly, not just its part buttons: selection, drag without selection, zoom, separation, reset and home→detail navigation.
- Run `npm test`; include repeated explode/reset cycles to catch transform drift and verify every illustrated part has matching playable audio. For tablet UI changes, also apply `skills/ipad-vehicle-ux/SKILL.md`.
- Report changes, sources used, checks performed and fidelity/device limits. Do not call it finished based solely on a successful build.

## Examples of scope
- “Thêm xe buýt cho bé, giữ UI”: build a recognizable bus, add its catalog/route/parts/progress, keep the visual shell.
- “Xe trắng đang giống SUV, sửa cho giống Accent”: adjust silhouette and characteristic geometry, preserve working interactions.
- “Đổi màu nút chọn xe”: ordinary UI work; this vehicle-building workflow is unnecessary.
