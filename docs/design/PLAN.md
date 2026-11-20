# What is left: kitchen design to build

Written 2026-11-13. This is the one list of everything left before the build. If something is not on it, it is not part of the plates.

## The rule for new ideas
- **A new idea goes on the Later list** at the bottom, unless Ari says "this round".
- Each round draws only what its section below lists. Nothing else.
- A round is done when every box in its section is ticked and Ari has answered its questions.
- When something moves (a Later item comes back, or something is dropped), edit this file in the same commit.

## The path
```
Plate X ✅ → Plate XI ✅ → phone layout ✅ → mark ✅ → brand sheet ✅ → Task issues → build
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
| 1 | Kitchen (day, evening, extra wide) | 01-kitchen + kitchen.js | done (Ari 11/13; three cats as drawn in v19) |
| 2 | Recipe box | 07-recipe-box | done (Ari 11/13; position tags under each arrow) |
| 3 | Whiteboard | 02-whiteboard | done (Ari 11/13) |
| 4 | Trials notebook | 06-notebook | done (Ari 11/13) |
| 5 | Idea board | 03-ideas | done (Ari 11/13) |
| 6 | Cookbooks | 04-cookbooks | done (Ari 11/13, v20) |
| 7 | References | 05-references | done (Ari 11/16) |
| 8 | Sign in and sign up | 09-start | done (Ari 11/16; card centred, nothing in front; headings A Ingredients + Method) |
| 9 | Account menu and settings | 11-account | done (Ari 11/16) |
| 10 | Front page and not-found | 12-front | done (Ari 11/16; not found = B, cookbook with a page ripped out) |

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
- [x] Five kinds: Cookbook, Blog, Chef / Baker, Article, Tool (draw Article)
- [x] Cards, newest first, a kind stamp on each
- [x] Starter references stay even after samples are removed

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
- [x] "Trial & Eclair" as the title (the one place it appears)
- [x] "Sign up" replaces "Start a kitchen"
- [x] Username, as the app does now
- [x] A few card styles, one that looks like a recipe card
- [x] Sample data on by default at sign-up
- [x] Guests land in the kitchen

### New views (never drawn)
- [x] Account menu and settings (incl. remove samples, sign out)
- [x] Signed-out front page
- [x] Not-found page

### No change in Plate X
- Public recipe and cookbook pages (section 08): on hold
- Jot list (section 10): carried as is

### Ari picks after Plate X
Floor · sink · Recently holder (Recently stays, Ari 2026-11-13) · what sits inside the recipe log cabinet · small whiteboard dot · empty "Next up" doodle · Edit/Delete spot · how to add a card · sign-in card style · anything the section questions raise.

---

### Details list (small changes, drawn together in Plate XI)
From 2026-11-13: small visual details (a colour, a spacing, a word, a size) go here instead of being redrawn at once. Structure (what is on screen, what a click does) is still decided view by view. The whole list is drawn in one go in Plate XI, and anything about feel on real screens (motion, sizes, touch) is checked again after the build is deployed.
- Cookbooks cover: the round next arrow sits higher (y 300) than the notebook and recipe box arrows (y 388); line them up
- Kitchen: the plant on the window sill, Ari unsure; maybe change it (Ari, 2026-11-13)
- Kitchen: review the window's depth (dimensionality) so it sits right in the wall (Ari, 2026-11-13)
- Idea board: the blue scroll bar should look more like a scroll bar and take the board's colours (Ari, 2026-11-13)
- Cookbooks shelf close-up: give it the brown trim border the full-screen kitchen has (Ari, 2026-11-13)

## 2. Plate XI (final)
Layout (Ari, 2026-11-16). One page, new artifact, sources in `design/plate-xi/` copied from `design/plate-x/`. No options anywhere: picks only.
- [x] The day kitchen in the middle. Around it, the zoomed-in view of each object (whiteboard, idea board, notebook, recipe box, cookbooks, references, recipe log cabinet), each joined to its object by a thin line
- [x] A row below for views with no kitchen object: front page, sign in, sign up, Account menu and Settings, not found
- [x] The evening kitchen as one extra image below (evening is the kitchen only)
- [x] Developer version drawn. No Developer / Home cook / Guest switch at the top (Claude's pick; Ari asked "what switch": it is the three-way toggle at the top of the Plate X page). A short strip shows only where home cook and guest differ
- [x] Loading, error and offline states, and the "paid plan" card (see "Before Task issues")
- [x] Every item on the Details list (sill: a jar of wooden spoons replaces the plant; window set in a recess)
- [x] Picks to apply: sign-in headings A (Ingredients + Method; drop crops B and C); not found B (cookbook with a page ripped out; drop A the index card); sign-in card centred with nothing in front; front page A; everything else as signed off in Plate X v24
- [ ] "TRIAL & ECLAIR" small name becomes the T&E mark where it appears in the app, once the mark exists (step 4); leave as is in Plate XI
- [x] Ari signed off (2026-11-17, version 2). Then this plate is the brand sheet reference. Drawn 2026-11-17: https://claude.ai/artifact/8eaxCBnwujNi1zg945oDBL (sources `design/plate-xi/`)

## 3. Phone layout
Phone Plate v1 (2026-11-17): https://claude.ai/artifact/8tvBLbfxEsEL48AzuMNeGy, sources `design/phone/`
- [x] Stacked phone kitchen, jot button bottom right (drawn: day, evening, find list, jot sheet)
- [x] Phone recipe card: any way you hold it, plus a button to keep it sideways (Ari, 2026-11-17; flexible, can revisit)
- [x] Recipe box: the drawer (Ari, 2026-11-17; decision 003 updated)
- [x] Add button: a plus named Quick add; on the kitchen it adds an idea, a Next up line, a recipe or a trial (Ari, 2026-11-17). Drawn in v4
- [x] Draw: Quick add sheet with four choices, Card View keep-sideways button (v4)
- [x] Phone notebook with the camera button (drawn)
- [x] Every other view and page on a phone (drawn)
- [x] "Recently" on a phone: one chip row at the top of the find list (Ari, 2026-11-17)
- [x] Ari signs off (2026-11-17, v4)

## 4. Mark
- Ari (2026-11-13): the mark is "T&E", and it appears in the app (where it sits is decided when drawing the mark). The full name "Trial & Eclair" is a title on sign in and the front page (Ari, 2026-11-14: bigger on the front page)
- [x] Pick a mark. **Ari (2026-11-17): eclair G** (plain eclair at the tape's angle, no letters) is the default mark. Mark Plate v2. Already dropped: the E of eclairs, the recipe-card mark, crops of the eclair, box and notebook
- Mark Plate v1 (2026-11-17): six T&E options A–F, Claude's pick D (one-stem monogram). https://claude.ai/artifact/5baLfL52D5X1pNYCdNgS6F (sources `design/mark/`)

## 5. Brand sheet
Brand Sheet v1 (2026-11-17): https://claude.ai/artifact/L3p52UdPaAsUBAa77J3gmi, sources `design/brand/` (eclair helper in `base/mark.js`)
- [x] Colours, fonts, line and halftone rules, the mark, kitchen reference from Plate XI (drawn v1; also small pieces and a contrast table)
- [x] v2 (Ari 11/17 notes): box colour options (cobalt, denim, faded denim, buttercup), which colour leads, what a cook can recolour (wheel vs swatches), six pointing options
- [x] Ari answered v2 (11/17): the box colour is the brand colour and stays fixed (a blue between cobalt and denim); cooks change cabinets, fridge, wall and backsplash from swatches plus a custom wheel (the original plan); pointing = soft glow + gentle movement, no jump; idea: TRIAL & ECLAIR in capitals round two sides of the box, & on the corner
- [x] v3 drawn: seven blues (02c), kitchen colour panel (02d), glow + movement G1–G4 with evening E1/E2 (04c), box wordmark W1–W3 and home label options (01b)
- [x] Ari (11/17, v4): box and brand blue = Blue 3 #3F5F9D (also the app icon ground). Lettered box dropped (Ari meant the name round the edge of the square icon). Everything else on hold: see the Later list
- [x] Brand sheet done for the build (v4, Ari 11/17: hold the rest, at least while building)
- Build note: the whiteboard marker and one tack share --blue with the box; give the marker its own fixed colour
- Build note: animate the glow with fill-opacity, not opacity (Chrome drops the blurred mask while opacity animates)
- [ ] Ari signs off

## 5b. Plate XII: kitchen straight on (from Ari's Kittl studies)
Ari made two Kittl kitchens (desktop 1: corner view, blue cabinets, sun; desktop 2: straight on, island with cubbies and log drawers). Kittl output is a flat AI image (gibberish text, baked colours), so it is a mood reference only, redrawn in plate shapes.
- [x] v1 (2026-11-19, https://claude.ai/artifact/JpRfR1F4DZCy9ctDCezeZj, `design/plate-xii/`): A = desktop 1 seen straight on; B = desktop 2 tidied; extra-wide stretch and a cabinet/wall recolour test
- [x] Ari (11/19): liked neither v1; sent two one-point Kittl "recipe board" studies and asked for more detail
- [x] v2 (2026-11-19, same URL): one-point redraw. A = Kittl A (wall cubby, window on the back wall); B = Kittl B (tall cupboard, two-tier shelf, whiteboard on the cork board, window in the right wall, counter returns). Drawing in `kitchen-xii2.js`; v1 kept at the bottom
- [x] v3 (2026-11-19, same URL): Ari's own vector trace of Kittl A (`traced/source.svg`) cleaned by `traced/clean.cjs`: shapes sorted into objects by position (paint order kept), box on Blue 3 shades, cabinets on --cab, wall on --wall, ~480 scribbles cleared, frame cropped (286 KB, ~90 KB gzipped). Buttons, glow (no movement: the ink is a few shared shapes), recolour, all working. Missing: fridge, log drawer labels, phone trace; fixed width
- [x] Ari (11/19): **traced direction picked.** Glow only (no lift). No fridge (it was an extra image); take the Recently list off. Cabinets stem green. Wants: cookbooks/references labels on the cubby's lower shelf edge; one wall cupboard open (top left or the next one) with a baking log on a clipboard inside the door; a version with box and mixer swapped; the eclair and small fixes
- [x] v4 (2026-11-19, same URL): ink split per object by masks (diff vs v3: only cleared marks and sub-pixel edges); stem green default; mixer marks cleared; shelf-edge labels; eclair on a plate; spoon jar on the sill; tomato-capped marker; cupboard open wide or cracked with a baking-log clipboard; B = box and mixer swapped (`traced/add.cjs`, `kitchen-swap.svg`)
- [x] **Decided (Ari, 2026-11-19, on v4):** cabinets stem green; cupboard open wide; the clipboard is the recipe log button (drawers plain); box and mixer stay where traced (B dropped). New pieces may be cleaner than the trace
- [x] v5 (2026-11-19, same URL): frame ends at the middle drawer's bottom, that height added on top (wall cupboards stretched, cubby gets a second book row); open cupboard with two shelves and a clipboard in true proportion; eclair pencil-length and plump; spoon jar twice the size; close-ups; shelf labels off; the book shelf is one button
- [x] Ari (on v5, 11/19): taller frame and cupboard approved; clipboard needs depth; spoon jar replaced by plants/flowers or a sun catcher; eclair redone in the trace's style, tried in other spots
- [x] v6 (2026-11-19, same URL): clipboard shadow and edge; eclairs E1–E5; spots P1 (by the box), P2 (two notebooks under the open one), P3 (eclair on closed notebooks); sills S1 basil, S2 flowers, S3 sun catcher with rainbows; picks switchable on the page, close-ups clickable
- [x] **Decided (Ari, on v6):** eclair E1 with a bite, at P1 (between the box and the notebook); window like her reference (basil, crystal mobile, rainbow beams) but keep four panes; composition notebooks wanted somewhere; open notebook needs something more; bring the reference box's details over
- [x] v7 (2026-11-19, same URL): bitten E1 at P1; bushy basil, four-crystal mobile, rainbow beams; frame sage or cream; composition books under the open notebook or in front of the whiteboard; notebook tabs, ribbon, photo, doodle; box wear, tab letters, optional RECIPES
- [x] **Decided (Ari, on v7):** window frame coloured, but not that sage; no basil (something that brings light; florals in the trace's style are OK); eclair is E1 whole, and clicking takes a bite, a second bite, then it is gone until the page reloads (as in an earlier version)
- [x] v8 (2026-11-19, same URL): frame in any colour (walnut default; oak, cabinet green, deep green, buttercup, tomato, Blue 3); sill L1 glass bottles, L2 lemons, L3 jar of flowers; eclair eaten in three clicks
- [x] **Window frame walnut** (Ari 2026-11-19); swatches removed, `--trim` #7A4E2D on #tk
- [x] **Decided (Ari, on v8):** composition books in front of the whiteboard; tabs on the open notebook, no taped photo; RECIPES on the box; a title on the clipboard sheet; an "Ideas" paper on the board; bottles in the style of her glass studies (window not teal); rainbows move with the time of day instead of a sun patch, none in the evening
- [x] v9 (2026-11-19, same URL): bottles B1–B4 from her studies redrawn in the trace's look; crystals as her hexagonal prisms; rainbows by time (morning, midday, afternoon, evening = dusk glass and a dim); books flat at the plates' angle; "Baking log", "Ideas", RECIPES; flour and pin can be taken away
- [x] **Decided (Ari, on v9):** B4 was a misclick: likes B1 (bigger) and B2 (with a second bottle); composition books should look like her reference picture (thick page block); eclairs cooling on a wire rack instead of a plate, still taken or eaten by clicks
- [x] v10 (2026-11-19, same URL): rack with three eclairs, one taken per click; B1 trio at .56; B2 decanter + amber bottle; compBook redrawn (back cover, page block, spine wrap, dense marble, double-bordered label)
- [x] **Decided (Ari, 2026-11-19, after v10):** the book shelf view is called **Library**; "Baking log" is wrong because not every recipe is baking (title still to pick: Claude's pick "Kitchen log"; others "Recipe log", "Log")
- [ ] **Next (new chat):** port Ari's vector traces into the kitchen like her glass studies: `design/plate-xii/refs/eclair-rack.svg` (eclairs on the cooling rack) and `refs/comp-journals.svg` (stacked composition journals), both 400 x 266 Kittl crops with a background card to strip. Ari also meant to send new bottle SVGs; they were not attached, ask for them
- [ ] Ari (still open from v10): B1 or B2 (pick B1, unless the new bottle SVGs replace both); one eclair taken per click or bites (pick taken); flour and pin; clipboard title; times of day

### Product changes from the plates (apply in one pass)
Changes to the product that come out of the drawings. Kept here as they come up and applied together to `docs/PRD.md`, the README and the Task issues when Plate XII is signed off (before Task issues), so the plan is edited once and stays consistent.
- [ ] **Library** (Ari 2026-11-19; name **Library** picked 11/19): the book shelf opens one view holding both the cook's cookbooks (their published collections) and references (research shelf). Touches PRD sections 2, 5 and 7, the Phase UI tables, Plate XI's two views and their web addresses (decision 005)
- [ ] **Saved cookbooks** (Ari 2026-11-19, later version): a cook can save other users' published cookbooks; they sit on the same shelf as their own cookbooks. Needs a saved-cookbook model and a phase in the PRD; the Library view leaves room for them
- [ ] **Recipe log on a clipboard** in the open wall cupboard, not the drawer stack
- [ ] **No fridge, no Recently list** (Plate XII v3)
- [ ] **Rainbows follow the cook's clock**: morning, midday, afternoon angles; evening has none, the window glass goes to dusk and the room dims
- [ ] **Eclair easter egg**: three eclairs cool on a rack in the kitchen; each click takes one, a reload puts them back; nothing saved
- If picked, this replaces the Plate XI kitchen drawing (views and phone follow), so settle it before the test piece

## Before Task issues: things that could disrupt the build
Raised 2026-11-16. Ari's answers (2026-11-16) are in each line. "Claude's pick" means Ari asked for a recommendation; it stands unless Ari says otherwise.
- [x] **Phone layout**: next after Plate XI (Ari: next, or after the brand work. Claude's pick: straight after Plate XI, before the mark, because it shapes how the kitchen is built and the brand work does not). Square it with the Recipe Box phone work (`docs/recipe-box/`)
- [x] **Keyboard and screen readers**: every kitchen object is a real button or link over the drawing, from the first component. The full accessibility pass stays on the Later list and must happen before the build is called done
- [x] **Web addresses** (confirmed by Ari 2026-11-17, as drawn in Plate XI): every open view, recipe, trial and cookbook gets its own address, and Back closes the open view and returns to the kitchen. Why: refresh keeps your place, links can be saved and shared, and the phone's Back button works. Cheap to do from the start, hard to add later. Written: `docs/decisions/005-web-addresses.md`
- [ ] **Test piece**: build the kitchen plus one open view in React to check scaling (960 to 1680 px) and speed. Ari reviews it BEFORE anything is committed
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
- Recipe log (issue #161): lives on a clipboard inside the double cabinet under the counter
- Whiteboard: a list the cook writes (no automatic items, no pins, no recipe-card link); tick puts a line through until the next day; a small red x after a ticked item's name removes it (Ari, 2026-11-13)
- Cookbooks: only developers make them; the developer sets the recipe order; home cooks read (save and browse later)
- Kitchen home as drawn (port Plate XI to React components)
- Every open view as drawn
- Sign in and sign up as drawn; Account menu; front page; not-found page
- Auth review: change username and password from Settings (drawn in Plate X, Ari 2026-11-14), plus password reset and session rules

---

## Later list
- **Brand holds (Ari, 2026-11-17):** exact swatch sets and the custom wheel; pointing movement G1–G4 (build uses G1 until then) and evening glow E1/E2; home-screen name and "Trial & Eclair" round the icon's edge; body font. Safe to hold only if the build names every colour (fridge and backsplash included), gives the whiteboard marker its own blue, and writes pointing in one place
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
- Review all the starter and sample data (recipes, ideas, references, cookbook) as one pass (Ari, 2026-11-14)
- Account: theme switch and "show forks" left out of the drawn Account for now (Ari, 2026-11-14); the app has both today
- Whiteboard suggestions from recent activity (automatic items, wipe, pin). Dropped from Plate X as too fussy
- Phone kitchen small tweaks at a later review: the eclair's spot; the board sitting lower, with more room under the find bar (Ari, 2026-11-17)
- Workshop the recipe box fan (phone); build it as its own component so it can be swapped (Ari, 2026-11-17)
- Notebook shows the recipe somewhere (phone and wide kitchen), not only each trial's changes (Ari, 2026-11-17)
- Saving rules and options: when edits save (Save button, as today, or as you type), and whether unsaved typing is kept on the device until a save goes through. Decide before the Task issues for any editing view, since it shapes every form (Ari, 2026-11-17: come back to this)

## Where things are
- Answers so far: memory `kitchen-layout`, and `.cursor/handoffs/NEXT.md`
- Plate sources: `design/plate-ix/` (Plate X copies or extends it)
- Plate IX: https://claude.ai/artifact/APtnqDfCTQb13uLgHnABtf
