# What is left: from design to build

Rewritten 2026-11-21. The design is finished; what it looks like and does is in **`docs/design/REFERENCE.md`** (the one source of truth). This file is only what is left to do. The plate-by-plate history is archived in `docs/design/archive/PLAN-2026-11-21-plates.md`; don't build from it.

## The rule for new ideas
- **A new idea goes on the Later list** at the bottom, unless Ari says "this round".
- When something moves (a Later item comes back, or something is dropped), edit this file in the same commit.

## The path
```
plates ✅ → Plate XII v17 ✅ → product changes ✅ → phone v5 ✅ → Wave 1 drawing adopted ✅ → prep script ⏳ (issue #182) → test piece (issue #180) → Task issues → build
```
1. **Prep script** (issue #182): turn Ari's Wave 1 trace into a kitchen with one named group per object (steps in REFERENCE.md).
2. **Test piece** (issue #180): the Wave 1 kitchen plus the recipe box in React at `/kitchen-v2`, to check scaling (960 to 1680 px) and speed. Ari reviews it before anything is committed.
3. **Task issues**: one per line of the Build list below.
4. **Build**: React components, one Task issue at a time.

## Build notes from the plates
- The recipe log opens from the clipboard in the open cupboard; there are no "Recently" parts anywhere.
- Open views are built as drawn in Plate XI; the kitchen and the Library follow `REFERENCE.md`.
- Give the whiteboard marker its own fixed colour (it shared `--blue` with the box in the plates).
- Animate the glow with `fill-opacity`, not `opacity` (Chrome drops the blurred mask while `opacity` animates).
- The mark is eclair G. "Trial & Eclair" in full is a title on sign in and the front page (bigger on the front page). Where the small "TRIAL & ECLAIR" name appears in the app, it becomes the mark.

## Before Task issues: things that could disrupt the build
Raised 2026-11-16. Ari's answers (2026-11-16) are in each line. "Claude's pick" means Ari asked for a recommendation; it stands unless Ari says otherwise.
- [x] **Phone layout**: next after Plate XI (Ari: next, or after the brand work. Claude's pick: straight after Plate XI, before the mark, because it shapes how the kitchen is built and the brand work does not). Square it with the Recipe Box phone work (`docs/recipe-box/`)
- [x] **Keyboard and screen readers**: every kitchen object is a real button or link over the drawing, from the first component. The full accessibility pass stays on the Later list and must happen before the build is called done
- [x] **Web addresses** (confirmed by Ari 2026-11-17, as drawn in Plate XI): every open view, recipe, trial and cookbook gets its own address, and Back closes the open view and returns to the kitchen. Why: refresh keeps your place, links can be saved and shared, and the phone's Back button works. Cheap to do from the start, hard to add later. Written: `docs/decisions/005-web-addresses.md`
- [ ] **Prep script** (issue #182) for the Wave 1 drawing, adopted 2026-11-21 in place of the v17 drawing
- [ ] **Test piece** (issue #180): build the Wave 1 kitchen plus one open view in React to check scaling (960 to 1680 px) and speed. Ari reviews it BEFORE anything is committed. A first attempt on 2026-11-21 was built on the v10 kitchen by mistake and archived
- [x] **Evening**: the kitchen only. Open views always use the day look, so nothing in use is hard to read (Ari)
- [x] **Loading, error and offline states** (drawn in Plate XI section 05): Claude decides, in the plate style, and draws them in Plate XI (Ari). Start from: loading = the view opens at once with faint ruled lines where words will be; error = a small printed card "That didn't load. Try again"; offline = a thin printed strip under the find bar "Offline. Showing what was saved."
- [x] **"Paid plan" tag** (confirmed by Ari 2026-11-17, card as drawn in Plate XI section 05): no payments now. Clicking the tag opens a small card naming what the Developer plan adds, with one button "Switch to Developer" that upgrades a home cook at once, free. A guest sees "Sign up" first. Draw the card in Plate XI. Real payments stay on the Later list
- [x] **New data** (whiteboard backend, recipe log #161, starter references copy and hide, sample-data flag and removal): done during the build, each as its own Task issue, backend before the view that needs it. Nothing to do now

## 6. Build list (becomes Task issues)
Changes the app needs that came out of the plates. Each becomes one Task issue.
- Idea board: drop the 4 statuses (Researching, Testing, Ready to publish, Archived). An idea is a note; moving it to a trial archives it
- Starter references are kept when samples are removed. Signed-in cooks can edit and delete a starter like their own; guests can only hide one (Ari, 2026-11-14). Editing a starter makes the cook's own copy (Ari, 2026-11-16)
- Reference shelf scrolls sideways with round arrows; no kind filters
- Sign-up asks about sample data (on by default); remove all samples in one go from Account
- Recipe log (issue #161): lives on a clipboard inside the open wall cupboard (Plate XII), not the drawers
- Whiteboard: a list the cook writes (no automatic items, no pins, no recipe-card link); tick puts a line through until the next day; a small red x after a ticked item's name removes it (Ari, 2026-11-13)
- Library view: the book shelf opens one view at `/library` holding cookbooks and references (PRD §7, decision 005). Cookbooks: only developers make them; the developer sets the recipe order; home cooks read the sample
- Saved cookbooks (later phase, after the kitchen build): `SavedCookbook` model and endpoints, save and unsave on a published cookbook, saved ones on the Library shelf; a link to the live cookbook, gone if unpublished
- Kitchen home as drawn (port the Plate XII traced kitchen to React components): no fridge or Recently list; recipe log clipboard in the open wall cupboard; glow pointing only; rainbows and evening dusk follow the device clock; eclair easter egg (three eclairs on a rack, clicks take them, reload restores, nothing saved)
- Every open view as drawn
- Sign in and sign up as drawn; Account menu; front page; not-found page
- Auth review: change username and password from Settings (drawn in Plate X, Ari 2026-11-14), plus password reset and session rules

---

## Later list
Parked. Not drawn, not built until moved up.
- **Brand holds (Ari, 2026-11-17):** exact swatch sets and the custom wheel; evening glow E1/E2; home-screen name and "Trial & Eclair" round the icon's edge; body font. Safe to hold only if the build names every colour, gives the whiteboard marker its own colour, and writes pointing in one place. (Pointing movement is not held: it was dropped for good on 2026-11-20.)
- **Kitchen light, after the build (Ari, 2026-11-20, moved from Plate XII v16/v17):** rainbows from Ari's three references (`design/plate-xii/refs/v16-*.webp`: room light wash per time of day, fanned soft flecks, sparkles, sunbeam toggle, sheen on curved things, long beams with a window bloom); the other crystals (K1 teardrop, K3 octagon chain, K4 quartz point, K5 mobile, kept in `CRYSTALS` in `traced/add.cjs`); tuning the amber glow on real screens (B3 sticker and G1 green are the alternatives); a subtle wallpaper so the glow reads; the night bird and shooting star, the day moon and sun/clouds
- Accessibility pass on every view (keyboard, screen readers, contrast, reduced motion). Must happen before the build is called done. Includes the whiteboard's "recipe card" link, which shows only on hover: touch screens and keyboards need another way (tap or focus shows it)
- Public recipe (`/r`) and cookbook (`/c`) pages: fine for now, revisit
- Equipment spots and anniversary equipment (1 month, 6 months, 1 year, yearly)
- Upgrade to the paid plan page
- **Notebook: trial versioning display (Ari, 2026-11-20).** Multiple trials of the same recipe shown together — layered or stacked, each bake in a different colour. This is distinct from "compare two side by side": it's the core multi-version view for the notebook. Needs a visual design pass before the build (colours per bake, how layers overlap or stack, what shows at a glance vs. on tap). Don't build the notebook view without this decided
- Notebook Compare (two trials side by side)
- Cookbook "Use the newest version" of a recipe
- Cookbook Share (removed from the cover, Ari 2026-11-13)
- Cookbook editor customization (covers, colours, layout)
- Home cooks browse, save and read other developers' cookbooks
- Idea board filters
- Customising: kitchen colours and patterns, white marble notebook, plain wall instead of tile, seasonal flowers
- Recipe log and stains on cards (issue #161 and after)
- Phone photo hand-off by QR code
- Clickable things that open nothing still react a little
- Review all the starter and sample data (recipes, ideas, references, cookbook) as one pass (Ari, 2026-11-14)
- Account: theme switch and "show forks" left out of the drawn Account for now (Ari, 2026-11-14); the app has both today
- Whiteboard suggestions from recent activity (automatic items, wipe, pin). Dropped from Plate X as too fussy
- Phone kitchen small tweaks at a later review: the eclair's spot; the board sitting lower, with more room under the find bar (Ari, 2026-11-17)
- Workshop the recipe box fan (phone); build it as its own component so it can be swapped (Ari, 2026-11-17)
- Notebook shows the recipe somewhere (phone and wide kitchen), not only each trial's changes (Ari, 2026-11-17)
- Saving rules and options: when edits save (Save button, as today, or as you type), and whether unsaved typing is kept on the device until a save goes through. Decide before the Task issues for any editing view, since it shapes every form (Ari, 2026-11-17: come back to this)

