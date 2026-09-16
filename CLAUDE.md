# Gara tí hon

Read and follow [AGENTS.md](AGENTS.md), the canonical project instructions shared by Codex and Claude.

Use the shared skills when applicable:
- [Create or refine a vehicle](skills/create-vehicle/SKILL.md): geometry, recognizable proportions, semantic parts, explosion and model verification.
- [iPad vehicle interactions](skills/ipad-vehicle-ux/SKILL.md): landscape-first touch UX, responsive layout, gestures, speech and device checks.

User-approved priorities: a six-year-old who may not read yet, using an iPad held horizontally; preserve the existing UI/UX style; white Accent 2021-inspired toy sedan first. Pictures and bundled Vietnamese narration support independent exploration.

Run `npm test` and `npm run build` for relevant code changes. Browser checks must include assembled and separated models. Clearly distinguish desktop viewport checks from physical iPad/Safari verification.

Keep durable project rules in AGENTS.md and reusable workflows in the linked skills instead of duplicating their content here.
