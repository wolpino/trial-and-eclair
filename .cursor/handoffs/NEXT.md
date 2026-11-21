# NEXT — 2026-11-21 (design final; test piece next)

Read, in this order: **`docs/design/REFERENCE.md`** (what everything looks like and does: the one source of truth), `docs/design/PLAN.md` (what is left), GitHub issue #180 (the task). Don't read the archives to decide anything.

## Prompt for the next agent (test piece, issue #180) — START HERE

> **First, check the base has the final design.** PR #181 (Plate XII v11 to v17, phone v5, this cleanup) must be merged into `staging-render`. Check: `git fetch origin && git ls-tree origin/staging-render docs/design/REFERENCE.md`. If that prints nothing, stop and tell Ari #181 isn't merged yet. Do not build on a base without it: that is how the 2026-11-21 attempt ended up on the v10 kitchen.
>
> **Branch:** `feat/issue-180-kitchen-test-piece`, reset to `origin/staging-render` (it has no commits of its own). Stay inside issue #180's owned paths; `design/plate-xii/` is not one of them, so the drawing is used as it is.
>
> **Build:** `cd design/plate-xii && node traced/clean.cjs`, then copy `traced/kitchen.svg` to `frontend/src/assets/kitchen-traced.svg`. Render it and compare with `design/plate-xii/shots/v17/tk_a.png` before writing any React: they must match.
>
> **What the React piece does:** everything in REFERENCE.md's object table, nothing more. Hit areas, data-var keys (`ecl-0`..`ecl-5`, `sun-am|noon|pm|eve`), the crystal turn and the amber glow are all in `design/plate-xii/sections/005-traced.html`; port that script, don't reinvent it. No `press` class, no movement on point.
>
> **Old attempt:** local branch `archive/issue-180-v10-attempt` has a React wrapper built on the v10 kitchen. Its hit areas, SVG and `add.cjs` edits are wrong for v17; don't copy them.
>
> **Ask Ari first** (REFERENCE.md "Open questions"): should the Trials journals open the notebook; trim the whiteboard hit area off the mixer head?
>
> **Rules:** questions first in chat, no subagents, confirm before a bigger build run, no pointing movement. **Push the branch before the session ends**, then add a session log entry.
