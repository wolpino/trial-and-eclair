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

### Status
| # | View | Section file | Status |
|---|------|--------------|--------|
| 1 | Kitchen (day, evening, extra wide) | 01-kitchen + kitchen.js | waiting on Ari |
| 2 | Recipe box | 07-recipe-box | waiting on Ari |
| 3 | Whiteboard | 02-whiteboard | waiting on Ari |
| 4 | Trials notebook | 06-notebook | tweaking |
| 5 | Idea board | 03-ideas | waiting on Ari |
| 6 | Cookbooks | 04-cookbooks | not started |
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
- [ ] Cream fridge (settled)
- [ ] Recently: magnets with a better paper (not torn) **and** the ticket rail, side by side
- [ ] Shelf labels: tape, ALL-CAPS marker font
- [ ] No sun patch
- [ ] Floor, four ways: black and white checkerboard, plain boards, one flat colour, no floor
- [ ] Window lower and larger
- [ ] Sink in front of the window, two ways: sink cabinet below, and counter only
- [ ] Normal view crops part of the window and the fridge hinges; extra wide (from 1680 px) shows both whole
- [ ] A small bird passes the window by day, a shooting star by evening: now and then on its own, and on a window click
- [ ] One evening kitchen
- [ ] Fix: floor reads as diagonal stripes at the left and right edges
- [ ] Fix: small whiteboard says "Blondies · trial 4"; trial 4 is Croissants

### Whiteboard
- [ ] Empty "Next up" on a new kitchen: three doodles (question mark, little eclair, whisk or spoon)
- [ ] Wiping an automatic item (it stays away until something new happens on that recipe)
- [ ] Ticked item keeps a line through until the next day; clicking the tick again removes it at once
- [ ] More than 6 items: the board scrolls
- [ ] Small whiteboard's dot, two ways: a magnet, and a marker mark

### Idea board
- [ ] No statuses. Plain tacks in the brand colours, notes in a loose grid, no filters
- [ ] An idea is a short note. Moving it to a trial archives it and it leaves the board

### Cookbooks
- [ ] A sewn book, not a binder
- [ ] Clicking the tier opens a close-up of the spines first, then a book
- [ ] Share button on the cover

### References
- [ ] Five kinds: Cookbook, Blog, Chef / Baker, Article, Tool (draw Article)
- [ ] Cards, newest first, a kind stamp on each
- [ ] Starter references stay even after samples are removed

### Trials notebook
- [ ] Tabs and a Contents page
- [ ] Publish is a stamp on the entry
- [ ] Page turns: folded corners and arrows
- [ ] Compare taken out (Later list)

### Recipe box
- [ ] Open box body runs past the bottom of the screen
- [ ] Next and Back are arrows left and right of the card, inside the lid
- [ ] Edit and Delete, two ways: by the title, and bottom right of the card
- [ ] Full screen is an icon
- [ ] Full-screen card covers the whole screen, red X top right, no search bar
- [ ] Clicking a letter tab shows a short list of its titles
- [ ] Adding a card, two ways: a blank card at the back, and an "Add a card" button
- [ ] Ingredient ticks clear when the card closes
- [ ] Photo on the card front

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
Floor · sink · Recently holder · small whiteboard dot · empty "Next up" doodle · Edit/Delete spot · how to add a card · sign-in card style · anything the section questions raise.

---

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
- Whiteboard: pinned plus automatic items, wipe, tick with line until the next day, re-tick removes
- Kitchen home as drawn (port Plate XI to React components)
- Every open view as drawn
- Sign in and sign up as drawn; Account menu; front page; not-found page

---

## Later list
Parked. Not drawn, not built until moved up.
- Public recipe (`/r`) and cookbook (`/c`) pages: fine for now, revisit
- Equipment spots and anniversary equipment (1 month, 6 months, 1 year, yearly)
- Upgrade to the paid plan page
- Notebook Compare (two trials side by side)
- Cookbook "Use the newest version" of a recipe
- Idea board filters
- Customising: kitchen colours and patterns, white marble notebook, plain wall instead of tile, seasonal flowers
- Recipe log and stains on cards (issue #161 and after)
- Phone photo hand-off by QR code
- Clickable things that open nothing still react a little

## Where things are
- Answers so far: memory `kitchen-layout`, and `.cursor/handoffs/NEXT.md`
- Plate sources: `design/plate-ix/` (Plate X copies or extends it)
- Plate IX: https://claude.ai/artifact/APtnqDfCTQb13uLgHnABtf
