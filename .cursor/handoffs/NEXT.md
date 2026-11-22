# NEXT — 2026-11-21 (new kitchen drawing adopted; prep script next, then the test piece)

Read, in this order: **`docs/design/REFERENCE.md`** (what everything looks like and does: the one source of truth), `docs/design/PLAN.md` (what is left), then the issue for the step you're on. Don't read the archives to decide anything.

## Step 0 — finish the drawing in Figma — START HERE

> Follow `design/kitchen-w1/FIGMA-PLAN.md` (status table at the top; update it after every step). The prep script waits for its step 8 export.

## Step 1 — prep script, issue #182

> **First, check the base has the drawing.** `git fetch origin && git ls-tree origin/staging-render design/kitchen-w1/source.svg`. If that prints nothing, stop and tell Ari the `docs/kitchen-wave1` PR isn't merged yet.
>
> **Branch** from `origin/staging-render`. Stay inside #182's owned paths (`design/kitchen-w1/`, `docs/design/REFERENCE.md`).
>
> **Job:** REFERENCE.md "The kitchen drawing (Wave 1 trace)" lists the 7 prep steps. Write `check.cjs` first (the tests in #182), then `prep.cjs`. Everything is found by layer and path **names** in `source.svg`, never by hand-typed positions. Never edit `source.svg`.
>
> **Check by picture:** render `kitchen.svg` and diff it against `source.png`. Show Ari the shots before calling it done.
>
> **Ari is doing one more Figma pass.** Use the newest `source.svg`; skip any prep step its layers already handle. Sunbeam: three drawn layers cross-faded by code, never bent or moved (REFERENCE.md "Answered 2026-11-21").

## Step 2 — test piece, issue #180 (after #182 is merged)

> Build on `design/kitchen-w1/kitchen.svg`. Find objects by `data-obj` and take hit areas from each group's bounding box. Behaviour is REFERENCE.md's object table, nothing more: the v17 page script `design/plate-xii/sections/005-traced.html` is the working example of glow, eclair states, crystal turn and evening, but its coordinates are v17's and don't apply. No `press` class, no movement on point. Don't copy from the local branch `archive/issue-180-v10-attempt`.
>
> Ask Ari REFERENCE.md open questions 1–2 first.

**Rules:** questions first in chat, no subagents, confirm before a bigger run. **Push the branch before the session ends**, then add a session log entry.
