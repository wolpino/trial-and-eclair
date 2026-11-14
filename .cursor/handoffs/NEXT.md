# NEXT — 2026-11-13 (Plate X: five views drawn, settling them before cookbooks)

> **Start here: `docs/design/PLAN.md`.** It is the one list of what is left, the status of each Plate X view, and the rule for new ideas (they go on its Later list unless Ari says "this round"). All of Ari's Plate IX answers are in the `kitchen-layout` memory. The sections below are kept as history.

## Goal
The block layout is final (round 10). Draw the kitchen and every view in the plate style, sign the plates off, then the phone layout.

## Map
```
style ✅ → colours ✅ → kitchen layout ✅ (round 10) → plate drawing ⏳ (Plate X, an extra round, drawn one view at a time; Plate XI is the final) → phone layout → mark → brand sheet → Task issues → build
```

## Prompt for the next agent (Plate X, picks up 2026-11-13)
> Kitchen Plate X, settling the five views already drawn. Read `docs/design/PLAN.md` ("How we work", status table, Later list), the `kitchen-layout` memory (bottom entries: "Plate X review"), `design/plate-x/BRIEF.md`, and the top entry of `.cursor/session_log.mdc`. No app code changes.
>
> Plate X page: https://claude.ai/artifact/Bd3ft4VmtoKDgKRuLae6Lt (republish the same page: build with `cd design/plate-x && node build.cjs`, strip the html/head/body wrapper into `dist/kitchen-plate-x.html` as in earlier commits, then publish with `url` set to that link). `node build.cjs --skip NN` leaves out a section still being drawn.
>
> Work as the director: one subagent per section file, at most 2 at once, each briefed with BRIEF.md and only its view's changes. Check screenshots before republishing. Commit after each round (section file + PLAN.md status). The earlier subagents are gone; new ones start from the files.
>
> **Finish these five views before cookbooks.** Apply Ari's answers below, then put every still-open question for the five views to Ari in ONE message, in page order, each with its figure name.

### Ari's answers to apply (2026-11-13)
**Kitchen** (`01-kitchen.html`, `kitchen.js`)
- Concealed hinges: fine for now (no drawing change)
- ORIGINAL green, not the quieter one: it draws the eye to the recipe log. Drop the quiet-green figure
- Slim cabinet: done
- RECIPE LOG tape label moves from the drawer onto the cabinet DOOR. COOKBOOKS label moves left on its shelf edge; REFERENCES too only if it looks better
- The recipe log clipboard hangs on the INSIDE of the cabinet door, not the back wall. It needs something on it. Suggested: a log sheet headed "Recipe log" with three or four dated rows (date, recipe, a short note, e.g. "11/11 Croissants trial 4 · shatter good"), matching what issue #161 will store (date, notes, substitutions). Draw that and ask

**Trials notebook** (`06-notebook.html`)
- A weird thick black line runs along the top of the spread: fix it
- Tabs say "Trial" over and over in a small space. Try numbers only ("1 2 3 4") with the recipe name once (on Contents, or a small header over the tab stack), and ask whether it is clear
- The small captions under the arrows and on the corners are useful but look wrong (plain body font floating on the dimmed kitchen). Restyle them to fit the plate (e.g. small handwriting on a tag, or set into the page margin)
- Page numbers move to the centre bottom of each page
- "Publish" may be the wrong word ("Publish" also suggests the public /r pages). Ari floated finalize / make recipe card / create recipe card. Draw the stamp with two or three wordings; Claude's suggestion is "Make recipe card"
- Re-publishing: trial 5 REPLACES the trial 4 card. To keep both, the cook saves trial 5 as a different recipe. Draw a small dialog that opens from the stamp (or button) so the cook sees what will happen and chooses: replace the card, or save as a new recipe, or cancel. First-time version too (no card yet: "This makes a Croissants card in your recipe box")

**Recipe box** (`07-recipe-box.html`)
- Guest limit: DUSTY ROSE (#e3a9ae). Plum too dark. Drop the two-shade figure

**Whiteboard and idea board:** no new answers yet

### Still open after applying the above (ask Ari, all at once, in page order)
1. Kitchen: is the recipe log sheet (as drawn) the right content? Does the RECIPE LOG label read well on the door?
2. Whiteboard: is the small eraser plus the dashed pin ring on each automatic item clear, or too fussy?
3. Idea board: keep the Archived envelope, or no way to see archived ideas?
4. Idea board: words only, or can an idea hold one photo?
5. Idea board: when an idea leaves, do the notes after it close the gap (drawn), or stay put until next opened?
6. Notebook: Publish spot, A stamp beside the title or B button on the strip? And which wording?
7. Notebook: corners for trials and arrows for recipes, clear, or should one go? Numbers-only tabs clear?
8. Recipe box: show the notes box on every card even when empty, or only once a card has a note?
9. Recipe box: is "Make it mine" at the bottom of starter cards the right spot?
Plus any new question the subagents raise.

### After the five are settled
Mark them done in PLAN.md, then cookbooks (section 04) as the next view, per the status table.

## Prompt for the next agent (superseded 2026-11-13: follow docs/design/PLAN.md, "How we work")
> Kitchen plate drawing, second wave of Plate IX. Read `.cursor/handoffs/NEXT.md`, the `kitchen-layout`, `visual-direction`, `one-main-session` and `commit-each-round` memories, and the top entry of `.cursor/session_log.mdc` first. No app code changes.
>
> Work as before: you are the director. **Ask me a lot of questions first** (the lists under "Ask Ari first" below, in batches), record my answers in the `kitchen-layout` memory, then show me the plan before any subagent starts. One subagent per section file, each briefed by `design/plate-ix/BRIEF.md`.
>
> Your first question: **is this wave an extra round (Plate X) with a final Plate XI after it, or is it the final plate?**
>
> Plate IX is https://claude.ai/artifact/APtnqDfCTQb13uLgHnABtf. Sources are committed in `design/plate-ix/` (`dist/` and screenshots are ignored): `BRIEF.md`, `base/` (shared helpers), `kitchen.js`, `sections/NN-name.html` (one per view), `build.cjs` (`node build.cjs` → `dist/index.html`; `--only NN` builds one section), `shots/all.cjs` (Playwright screenshots). Publish the build output with the html/head wrapper stripped, as a new artifact.
>
> Draw from "Ari's Plate IX notes" below. The public pages (section 08) and equipment spots are on hold: do not redraw them.

## Ari's Plate IX notes (2026-11-12): what to draw
**Kitchen**
- Fridge: cream (settled). Recently: ticket rail (Ari's lean). Shelf labels: tape, in an ALL-CAPS marker font
- No sun patch: take it out
- Floor is not right yet. Show three: white and black checkerboard, a floor with no pattern, and no floor
- Window: lower and larger (too small when whole). Try a sink in front of it, as in the inspiration photos
- Normal view cuts off part of the window and the fridge hinges; an extra-wide view extends to show them whole
- A tiny bird flies past the window by day and a shooting star by evening, on its own or when the window is clicked

**Whiteboard**
- New kitchen: under "Next up", a question mark or a doodle, not "Nothing next up yet"
- The cook can wipe off an automatic item, and it stays away until something new happens on that recipe
- A ticked item keeps a line through it until the next day. Clicking the tick again is allowed (undo or remove: not worked out; fine for now)
- More than 6 items: the board scrolls
- The dot on the small whiteboard must not copy the large board's tacks. Try a magnet, or a mark drawn in marker

**Recipe box**
- The open box looks wrong with the short bottom: let the body run past the bottom of the screen
- Next and Back become arrows to the left and right of the card, inside the lid
- Edit and Delete sit by the title, or in the card's bottom right corner
- Full screen is an icon, not a word
- A full-screen card covers the whole screen, with a red X top right to close, and no search bar
- On a phone the recipe is meant to look like a landscape card; maybe only when full screen

**Sign in and sign up**
- Needs work. Drop "Start a kitchen". This is the one place for "Trial & Eclair" as a title
- The card reads as a plain index card. Show a few options, one with the card looking like a recipe card

**Every view**
- Each view gets a developer version and a home cook version, plus a guest version where it differs

**On hold**
- Public recipe and cookbook pages: fine for now, revisit later
- Equipment spots

## Wrap-up answers so far
1. **Done means:** day and evening plates of the final kitchen, the open views, sign in, and any views still missing (see "Ask Ari first")
2. Open choices before the build: not answered
3. **After the plates: the phone layout** (then the mark)
4. **Yes:** the final plate is the reference for the brand sheet, then Task issues
5. Equipment spots: on hold
6. **Design files:** `design/plate-ix/` sources are committed (about 300 KB); `design/kitchen-starter/` (20 MB PSD) stays local

## Ask Ari first
**The round**
- Extra round then a final, or is this the final?
- Evening versions of every open view, or only the kitchen?
- Which views are still missing? Not drawn yet: the Account menu and settings, the upgrade to the paid plan, the signed-out front page, a not-found page, the phone kitchen (comes after the plates)

**Kitchen**
- "No pattern" floor: plain boards, or one flat colour?
- Bird and shooting star: on their own every so often, only on a click, or both?
- Sink: does it sit on the counter under the window only, or change the cabinets below it too?
- Extra-wide view: from what width does it start showing the whole window and fridge?
- Ticket rail: is it the pick, or keep magnets beside it once more?

**Whiteboard**
- Clicking a tick a second time: un-tick, or remove the item at once?
- Which doodle for an empty "Next up"? (Offer three)

**Idea board** (the app has 4 statuses: Researching, Testing, Ready to publish, Archived; Plate IX drew 2)
- Draw all four as tack colours? Do archived ideas stay on the board?
- Grid or free placement; does each note say its status in words; what "Start a trial" carries over and whether the idea stays; filters

**Cookbooks** (explain again first: Plate IX drew each cookbook as a ringed binder on the cookbooks shelf; that was the agent's choice, kept from the current app. Ari has only decided: one drawn book per real cookbook, cookbooks tier above references, paid plan)
- Binder or sewn book; shelf first or straight into the last cookbook; where the share link lives; "Use the newest version" on a recipe

**References** (the app has 5 kinds: Cookbook, Blog, Chef / Baker, Article, Tool; Plate IX left out Article)
- Keep Article as a fifth kind, or fold it into Blog?
- Card first or link first; order by kind or newest; keep starter references

**Notebook**
- Tabs, Contents, or both; where Publish lives; Compare now or later; folded corners or arrows

**Recipe box**
- Edit and Delete: by the title, or bottom right? (Or draw both)
- Under a letter: arrows only, or a short list of titles as well
- Blank card to add, or an "Add a card" button too; ticks clear on close; photo on the front
- Phone: landscape card always, or only full screen?

**Sign in and sign up**
- What replaces "Start a kitchen"?
- Username (as the app does now) or email?
- Samples default; where guests land


## Known issues carried over
- The floor reads as diagonal stripes near the left and right edges
- The small whiteboard says "Blondies · trial 4" but the sample data gives trial 4 to Croissants
- Notebook pages are slightly smaller than Plate VIII (line pitch 28) to fit the tabs and control strip
- A few small comparison crops were not opened after their last change

## The layout now (final)
- **Plate IX kitchen (2026-11-12):** wide (300–1500); vintage fridge at the left edge holding "Recently"; one plain door beside it; small window on the right (sun patch by day, moon by night); taller quiet tile ON by default; checkerboard floor strip; tape shelf labels in the main kitchen. Changed by "Ari's Plate IX notes" above (no sun patch, cream fridge, lower window, floor still open)
- **Wall:** one board in the middle: whiteboard on the left ("next up", pinned plus automatic, marker font), cork ideas on the right. Drawn 25 px higher than round 9, above the recipe box and below the notebook's top. Wall above the board stays plain. No oven, no title or name. Plate IX direction: a vintage fridge at the left edge (holds "Recently") and a small window on the right for day/evening light; no pegboard
- **Counter, middle:** the Lab notebook on a cookbook stand on the whiteboard's side, tall enough to overlap the board's bottom edge. An eclair on a plate in the middle: whole on load, three clicks eat it (crumbs and cream left), back on reload. The recipe box on the cork's side. All three sit close together
- **Side rule:** the Lab is always on the whiteboard's side and the box on the cork's side. The Lab need not be right under the whiteboard
- **Under the counter:** two-tier open shelf (cookbooks above, references below), one drawn book per real one. It starts short with one book lying down per tier. Plate IX: one thinner cabinet on the left (beside the fridge), no towel; cabinets on the right
- **Width:** the whole kitchen scales with the window between a minimum (80%, at 960 px) and a maximum (140%, at 1680 px). Outside that range the middle (notebook, eclair, box) keeps its spacing; the cork grows and shows more ideas, the shelf widens a little, the two cabinets each side take the rest; no extra doors. No plate border
- **Clickable things:** colour sits inside the ink line; every object has a permanent label (no hover labels). Pointing: glow + label (amber halftone glow behind, the object's label turns yellow)
- **Top:** find-or-jot bar centred at the top, Account top right. Typing opens one list under the bar: jot destinations first (the cork as an idea, or the whiteboard's next up), then matching recipes and notebook entries. Phone: stacked layout, jot button bottom right
- **Recipe box closed:** a real recipe box with a flush hinged lid (seam, back hinges, brass hasp, corner caps) and "Recipes" in a brass label holder. Click opens it to fill most of the screen over the dimmed kitchen
- **Recipe box open:** the card rests on a ledge in the lid; the lid is empty until a card is picked. The box body is short, sized for three tab rows. The lid grows with the recipe from a minimum (round 9 height, about 45% of the screen) to a limit (about 55%), then the card scrolls. Later: a full-screen card view
- **Tabs:** A–I front, J–Q middle, R–Z back; R–Z lined up with A–I, J–Q centred in the gaps; nine R–Z tabs, no XYZ (drawn in round 10)
- **Roles:** one kitchen for everyone; nothing hidden, nothing moves on upgrade. Paid things (Lab, cork ideas, cookbooks tier) carry a "paid plan" label and open read-only with sample data for cooks and guests. Cooks get the box, whiteboard and references. Guests: decision 002 as it is (starter recipes, up to 5 cards of their own)
- **Depth:** dimensional, one-point perspective, one vanishing point at x 900, y 230 (Plate VIII "now"); kept
- **Notebook:** a composition book named TRIALS (cloth spine, black marble cover, cushion label) on a cookbook stand; opens to a two-page spread, ruled pages, no spiral. Phone photos go straight into an entry (camera button)
- **New kitchen:** starts with demo data; sign-up asks whether to include it, and it can be removed later in one go
- **Evening:** dark mode is a darker evening kitchen
- **Equipment:** anniversary equipment later (1 month, 6 months, 1 year, yearly; pick one of three). No pegboard at first

## Still open
- Everything under "Ask Ari first"
- Equipment spots (on hold)

## Links
| What | Link |
|---|---|
| Archive of every kitchen image so far | https://claude.ai/artifact/QxzHEPyWnygnsWcersdufW |
| Round 1 (window × cabinet sketches) | https://claude.ai/artifact/GWT1vd9Wzu1ijEU8VGF7yj |
| Round 2 (plain blocks) | https://claude.ai/artifact/PdWcZeZPWAaWNHQbBg8vdJ |
| Round 3 (box detail, shelf, anniversary) | https://claude.ai/artifact/Min9Q1tV5v65wJBiCvw3Hy |
| Round 4 (cook/developer, wide screen, skinny tabs) | https://claude.ai/artifact/6ZvH65AZSnzorgxsm5hosX |
| Round 5 (plate border, upgrade, middle, tabs, roles) | https://claude.ai/artifact/19GFsMLPyJcsY5oHsfFsnk |
| Round 6 (nothing moves, middle 3a–3c, tabs A, guest) | https://claude.ai/artifact/PDiK3NFTpkQQQnz53tTHyG |
| Round 7 (eclair or flowers, box resized, guests) | https://claude.ai/artifact/AjDeA1NzQZHXuJjYWAdjsb |
| Round 8 (three tab rows, lid limit, Lab over the board) | https://claude.ai/artifact/GyUR9LwAahWhZ5KYRYBm92 |
| Round 9 (board lowered, stepped tabs) — best base | https://claude.ai/artifact/NycqsZG7m8dMgeczemSfSU |
| Round 10 (whole settled layout, final tabs, lid min/limit) — FINAL | https://claude.ai/artifact/WkNKvfgetbz3QB4kQdWW8U |
| Plate II (final layout in the plate style) | https://claude.ai/artifact/Da1GrHKYarXotyj8HwpUpZ |
| Plate III (spacing, notebooks, pointing styles, grow-to-fill, questions) | https://claude.ai/artifact/VnwCp1aaWnJX2e3FWJ3ioa |
| Plate IV (covers, detail/depth, pointing, jot menu, evening, sizing) | https://claude.ai/artifact/BcqU8atxTQmnC45ywnzQa2 |
| Plate V (glow + label, evening lights, composition book, jot menus) | https://claude.ai/artifact/13AuDFvrJxoW5XbDYiVydr |
| Plate VI (one-point perspective, cork glow, evening from the top edge, page edges, Recently note) | https://claude.ai/artifact/PPHHNxUm3q1LiJvrpC9tnJ |
| Plate VII (window + pegboard or narrower, slim notebook, raised board, Recently options) | https://claude.ai/artifact/V35qBtVGy4KY3zrTVVUsrY |
| Plate VIII (narrower, recipe box lid, Recently on wall or fridge, eclair bites, angles, phone photos) | https://claude.ai/artifact/KGwgZJZ6XQMeRtQTdMr1mR |
| Plate IX (wide kitchen, every open view, public pages, getting started) — base for Plate X | https://claude.ai/artifact/APtnqDfCTQb13uLgHnABtf |
| Kitchen Plate (plate style reference) | https://claude.ai/artifact/3NHEb9cHQuachu9vBWvnuN |

## Rules to keep
- Plain blocks first; Ari wants to see layouts before any detail. Only the recipe box gets a closer drawing
- Plate style later: ink line, flat colour, halftone, hatching; colour under the line; brand colours from memory `visual-direction`
- Proof locally (Playwright from `frontend/node_modules`, screenshot once), then publish as an artifact
- No code changes until the layout and the mark are settled and Task issues exist

## Files to open first
- Memory: `kitchen-layout.md` and `visual-direction.md`
- `docs/PRD.md` section 2 (personas), `docs/decisions/002-guest-mode.md`, `docs/decisions/004-kitchen-home.md`
- `recipes/recipeboxdisplay.png` (lid with ledge), `recipes/recipeboxdisplay3.png` (preferred look), `recipes/orthisrecipebox.png` (A–Z tabs)
- `.cursor/session_log.mdc`, top entry
