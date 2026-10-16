# Recipe Box (part of Trial and Eclair)

**Recipe Box is not a separate app.** It is the phone view of Trial and Eclair's home-cook recipe box, built in `frontend/` on the same Django API, database and login ([decision 001](../decisions/001-recipe-box-in-frontend.md)). Guest mode and starter cards come from [decision 002](../decisions/002-guest-mode.md). The phone box's look and behaviour (tabs, wood, menu, fan, dark mode, ingredient text, Card View) are set by [decision 003](../decisions/003-phone-recipe-box-design.md); where this folder disagrees with 003, 003 wins.

| Screen width | `/recipe-box` shows |
| --- | --- |
| Phone (below 768px) | Recipe Box: card in the lid, A–Z tabs, fan, full-screen Card View (#45; redesign per [003](../decisions/003-phone-recipe-box-design.md)) |
| Tablet, monitor | The existing wooden box with index cards |

The rest of Trial and Eclair (notebook, cork board, cookbooks, references) is unchanged.

The files below were copied from the old standalone `wolpino/recipe-box` repo on 2026-10-15. The PRD, spec and prototype were written on 2026-10-14, before the merge.

## What's here

| File | What it is | Still current? |
| --- | --- | --- |
| `prd.md` | Product requirements for the box | Yes: the product and UX parts |
| `spec.md` | Tech spec | Partly: it assumes Supabase. Backend sections are superseded by the Django API; see `gap-list.md` |
| `decisions.md` | Decisions from the spec chat | Superseded where `docs/decisions/` disagrees (D4, D5, D8) |
| `agents.md` | Agent workflow notes | Reference |
| `prototype/` | Look-and-feel prototype (open the HTML on a phone) | Yes, except the Categories toggle (A–Z only, decision 001). Being updated to the published artifact version (decision 003) |
| `original-tasks/` | Task cards written for a standalone Supabase build | Reference only; will be rewritten as tickets after the gap list |
| `original-README.md`, `original-AGENTS.md` | The old repo's root files | Reference only |

## Next

1. ~~Write `gap-list.md`~~ done.
2. ~~Decision records~~ done: [001](../decisions/001-recipe-box-in-frontend.md) (Recipe Box in `frontend/`, A–Z only), [002](../decisions/002-guest-mode.md) (guest mode), [003](../decisions/003-phone-recipe-box-design.md) (phone box design).
3. ~~Pick the starter recipes~~ done: six in `seed/data/starter_recipes.json`; the owner can change them any time.
4. Turn the gap list into 3–5 tickets.
5. Phone box design pass and follow-ups from [003](../decisions/003-phone-recipe-box-design.md).
