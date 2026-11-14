# What is left: kitchen design to build

Written 2026-11-13. This is the one list of everything left before the build. If something is not on it, it is not part of the plates.

## The rule for new ideas
- **A new idea goes on the Later list** at the bottom, unless Ari says "this round".
- Each round draws only what its section below lists. Nothing else.
- A round is done when every box in its section is ticked and Ari has answered its questions.
- When something moves (a Later item comes back, or something is dropped), edit this file in the same commit.

## The path
```
Plate X (extra round) → Plate XI (final) → phone layout → mark → brand sheet → Task issues → build
     ⏳ next                                                                            
```
1. **Plate X**: draw Ari's Plate IX notes and the three missing views. Options are still allowed here.
2. **Plate XI, the final**: no options. Ari's picks from Plate X, drawn once. The kitchen comes in day and evening; the open views are day only.
3. **Phone layout**: the stacked phone kitchen and phone views.
4. **Mark**: the logo.
5. **Brand sheet**: built from Plate XI and the mark.
6. **Task issues**: one per piece of the build, from the "Build list" below.
7. **Build**: React components, one Task issue at a time.

## How we work (Plate X onward)
One view at a time, reviewed as it lands, not all at the end.
1. One subagent draws one view (its own section file in `design/plate-x/`).
2. Claude checks its screenshots, then republishes the Plate X page (same link each time) with that section added.
3. Ari reviews only that section. Tweaks go back to the same subagent. The view is done when Ari says so.
4. While Ari reviews one view, the next one is drawing. At most 2 agents at once, to pace usage.
5. Commit after each view Ari approves, and update the status table below. Stopping mid-way loses nothing.
6. Settle the views already drawn before starting new ones (Ari, 2026-11-13: finish kitchen, whiteboard, ideas, notebook and recipe box before cookbooks).
7. When there are questions, list them all in chat at once, in page order, each with its figure name, so Ari can answer in one go.
8. The same questions go at the top of the Plate X page in `sections/00-questions.html`, each linking to its drawing (Ari, 2026-11-13: hard to find the mock-ups otherwise). Replace the list each round; answered questions come off it.

### Status
| # | View | Section file | Status |
|---|------|--------------|--------|
| 1 | Kitchen (day, evening, extra wide) | 01-kitchen + kitchen.js | done (Ari 11/13; cat drawings redrawn v19, one look left) |
| 2 | Recipe box | 07-recipe-box | done (Ari 11/13; position tag A or B to pick) |
| 3 | Whiteboard | 02-whiteboard | done (Ari 11/13) |
| 4 | Trials notebook | 06-notebook | done (Ari 11/13) |
| 5 | Idea board | 03-ideas | done (Ari 11/13) |
| 6 | Cookbooks | 04-cookbooks | waiting on Ari (answers drawn v19: spines to one side, roles, no Share, drag to reorder) |
| 7 | References | 05-references | not started |
| 8 | Sign in and sign up | 09-start | not started |
| 9 | Account menu and settings | 11-account | not started |
| 10 | Front page and not-found | 12-front | not started |

Statuses: not started → drawing → waiting on Ari → tweaking → done.

Plate X page: https://claude.ai/artifact/Bd3ft4VmtoKDgKRuLae6Lt

---

## 1. Plate X (extra round)
Every view gets a **developer** and a **home cook** version, plus **guest** where it differs. Day only, except the kitchen's evening crop.

### Kitchen
- [x] Cream fridge (settled)
- [x] Recently: magnets with a better paper (not torn) **and** the ticket rail, side by side
- [x] Shelf labels: tape, ALL-CAPS marker font
- [x] No sun patch
- [x] Floor, four ways: black and white checkerboard, plain boards, one flat colour, no floor
- [x] Window lower and larger
- [x] Sink in front of the window, two ways: sink cabinet below, and counter only
- [x] Normal view crops part of the window and the fridge hinges; extra wide (from 1680 px) shows both whole
- [x] A small bird passes the window by day, a shooting star by evening: now and then on its own, and on a window click
- [x] One evening kitchen
- [x] Fix: floor reads as diagonal stripes at the left and right edges
- [x] Fix: small whiteboard says "Blondies · trial 4"; trial 4 is Croissants

### Whiteboard
- [x] Empty "Next up" on a new kitchen: three doodles (question mark, little eclair, whisk or spoon)
- [x] ~~Wiping an automatic item~~ dropped: the board holds only what the cook writes (Later list)
- [x] Ticked item keeps a line through until the next day; clicking the tick again removes it at once
- [x] More than 6 items: the board scrolls
- [x] ~~Small whiteboard's dot~~ dropped with pins: plain tick boxes

### Idea board
- [x] No statuses. Plain tacks in the brand colours, notes in a loose grid, no filters
- [x] An idea is a short note. Moving it to a trial archives it and it leaves the board
- [x] An idea can hold one photo (Ari, 2026-11-13)

### Cookbooks
- [x] A sewn book, not a binder
- [x] Clicking the tier opens a close-up of the spines first, then a book
- [x] ~~Share button on the cover~~ removed for now (Later list, Ari 2026-11-13)
- [x] Developers make cookbooks; home cooks and guests read the sample (making one is the paid plan)
- [x] Editor over the kitchen (developer, drag to reorder); finished book with no kitchen behind
- [x] Developer, home cook and guest (sample book read-only, paid plan tag)

### References
- [ ] Five kinds: Cookbook, Blog, Chef / Baker, Article, Tool (draw Article)
- [ ] Cards, newest first, a kind stamp on each
- [ ] Starter references stay even after samples are removed

### Trials notebook
- [x] Tabs and a Contents page
- [x] ~~Publish is a stamp on the entry~~ now an "Add to recipe box" button on the strip (Ari, 2026-11-13)
- [x] Page turns: folded corners for trials; plain round arrows for recipes, no labels, same as the recipe box (Ari, 2026-11-13)
- [x] Compare taken out (Later list)

### Recipe box
- [x] Open box body runs past the bottom of the screen
- [x] Next and Back are arrows left and right of the card, inside the lid
- [x] Edit and Delete, two ways: by the title, and bottom right of the card
- [x] Full screen is an icon
- [x] Full-screen card covers the whole screen, red X top right, no search bar
- [x] Clicking a letter tab shows a short list of its titles
- [x] Adding a card, two ways: a blank card at the back, and an "Add a card" button
- [x] Ingredient ticks clear when the card closes
- [x] Photo on the card front

### Sign in and sign up
- [ ] "Trial & Eclair" as the title (the one place it appears)
- [ ] "Sign up" replaces "Start a kitchen"
- [ ] Username, as the app does now
- [ ] A few card styles, one that looks like a recipe card
- [ ] Sample data on by default at sign-up
- [ ] Guests land in the kitchen

### New views (never drawn)
- [ ] Account menu and settings (incl. remove samples, sign out)
- [ ] Signed-out front page
- [ ] Not-found page

### No change in Plate X
- Public recipe and cookbook pages (section 08): on hold
- Jot list (section 10): carried as is

### Ari picks after Plate X
Recipe box position tag (A under each arrow, B one above the lid) · cabinet cats' final look · Floor · sink · Recently holder (Recently stays, Ari 2026-11-13) · what sits inside the recipe log cabinet · small whiteboard dot · empty "Next up" doodle · Edit/Delete spot · how to add a card · sign-in card style · anything the section questions raise.

---

### Details list (small changes, drawn together in Plate XI)
From 2026-11-13: small visual details (a colour, a spacing, a word, a size) go here instead of being redrawn at once. Structure (what is on screen, what a click does) is still decided view by view. The whole list is drawn in one go in Plate XI, and anything about feel on real screens (motion, sizes, touch) is checked again after the build is deployed.
- Cookbooks cover: the round next arrow sits higher (y 300) than the notebook and recipe box arrows (y 388); line them up
- Kitchen: the plant on the window sill, Ari unsure; maybe change it (Ari, 2026-11-13)
- Kitchen: review the window's depth (dimensionality) so it sits right in the wall (Ari, 2026-11-13)
- Idea board: the blue scroll bar should look more like a scroll bar and take the board's colours (Ari, 2026-11-13)
- Cookbooks shelf close-up: give it the brown trim border the full-screen kitchen has (Ari, 2026-11-13)

## 2. Plate XI (final)
- [ ] Day kitchen and evening kitchen with every pick
- [ ] Every open view, final, developer and home cook (and guest where it differs)
- [ ] Sign in, Account, front page, not-found
- [ ] Ari signs off. Then this plate is the brand sheet reference

## 3. Phone layout
- [ ] Stacked phone kitchen, jot button bottom right
- [ ] Phone recipe card: landscape always, or only full screen (decide here)
- [ ] Phone notebook with the camera button (Plate VIII)

## 4. Mark
- [ ] Pick a mark. Already dropped: the E of eclairs, the recipe-card mark, crops of the eclair, box and notebook

## 5. Brand sheet
- [ ] Colours, fonts, line and halftone rules, the mark, kitchen reference from Plate XI

## 6. Build list (becomes Task issues)
Changes the app needs that came out of the plates. Each becomes one Task issue.
- Idea board: drop the 4 statuses (Researching, Testing, Ready to publish, Archived). An idea is a note; moving it to a trial archives it
- Starter references are kept when samples are removed
- Sign-up asks about sample data (on by default); remove all samples in one go from Account
- Recipe log (issue #161): lives on a clipboard inside the double cabinet under the counter
- Whiteboard: a list the cook writes (no automatic items, no pins, no recipe-card link); tick puts a line through until the next day; a small red x after a ticked item's name removes it (Ari, 2026-11-13)
- Cookbooks: only developers make them; the developer sets the recipe order; home cooks read (save and browse later)
- Kitchen home as drawn (port Plate XI to React components)
- Every open view as drawn
- Sign in and sign up as drawn; Account menu; front page; not-found page

---

## Later list
Parked. Not drawn, not built until moved up.
- Accessibility pass on every view (keyboard, screen readers, contrast, reduced motion). Must happen before the build is called done. Includes the whiteboard's "recipe card" link, which shows only on hover: touch screens and keyboards need another way (tap or focus shows it)
- Public recipe (`/r`) and cookbook (`/c`) pages: fine for now, revisit
- Equipment spots and anniversary equipment (1 month, 6 months, 1 year, yearly)
- Upgrade to the paid plan page
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
- Whiteboard suggestions from recent activity (automatic items, wipe, pin). Dropped from Plate X as too fussy

## Where things are
- Answers so far: memory `kitchen-layout`, and `.cursor/handoffs/NEXT.md`
- Plate sources: `design/plate-ix/` (Plate X copies or extends it)
- Plate IX: https://claude.ai/artifact/APtnqDfCTQb13uLgHnABtf
