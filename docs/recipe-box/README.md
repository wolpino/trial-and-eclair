# Recipe Box (mobile front end for Trial & Eclair)

Copied from the `recipe-box` repo on 2026-10-15. The PRD, spec and prototype were written on 2026-10-14.

## Direction

One Django API and database, two front ends:

| Front end | Device | Does |
| --- | --- | --- |
| Notebook (existing `frontend/`) | Tablet, monitor | Ideas, versions, test bakes, publish, cookbooks |
| Recipe Box (new) | Phone first | A–Z box, recipe cards, cook mode, quick import |

Recipe Box is served from the same domain as the API so session login works unchanged.

## What's here

| File | What it is | Still current? |
| --- | --- | --- |
| `prd.md` | Product requirements for the box | Yes: the product and UX parts |
| `spec.md` | Tech spec | Partly: it assumes Supabase. Backend sections are superseded by the Django API; see `gap-list.md` |
| `decisions.md` | Decisions from the spec chat | Superseded where `docs/decisions/` disagrees (D4, D5, D8) |
| `agents.md` | Agent workflow notes | Reference |
| `prototype/` | Look-and-feel prototype (open the HTML on a phone) | Yes, except the Categories toggle (A–Z only, decision 001) |
| `original-tasks/` | Task cards written for a standalone Supabase build | Reference only; will be rewritten as tickets after the gap list |
| `original-README.md`, `original-AGENTS.md` | The old repo's root files | Reference only |

## Next

1. ~~Write `gap-list.md`~~ done.
2. ~~Decision records~~ done: [001](../decisions/001-recipe-box-in-frontend.md) (Recipe Box in `frontend/`, A–Z only), [002](../decisions/002-guest-mode.md) (guest mode).
3. Pick the starter recipes (placeholders until then).
4. Turn the gap list into 3–5 tickets.
