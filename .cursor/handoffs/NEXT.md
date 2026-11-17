# NEXT — 2026-11-17 (Phone Plate SIGNED OFF; next: the mark)

> **Start here: `docs/design/PLAN.md`.** It is the one list of what is left, the status of each Plate X view, and the rule for new ideas (they go on its Later list unless Ari says "this round"). All of Ari's answers are in the `kitchen-layout` memory. The sections below are kept as history.

## Goal
The block layout is final (round 10). Draw the kitchen and every view in the plate style, sign the plates off, then the phone layout.

## Map
```
style ✅ → colours ✅ → kitchen layout ✅ (round 10) → plate drawing ✅ → phone layout ✅ → mark ⏳ → mark → brand sheet → Task issues → build
```

## Prompt for the next agent (Phone Plate, after Ari answers) — START HERE
> Phone Plate v1 is published: https://claude.ai/artifact/8tvBLbfxEsEL48AzuMNeGy. Sources in `design/phone/` (copied base from plate-xi plus `base/phone.js`, the phone frame helper; brief `design/phone/BRIEF.md`). Build: `cd design/phone && node build.cjs && tail -n +2 dist/index.html | sed '$d' > dist/phone-plate.html`, publish that file to the same URL.
>
> **Sections:** 00 questions (director), 01 kitchen (pk), 02 recipe box (pb), 03 notebook (pn), 04 other views (pv), 05 pages without an object (pp). One Sonnet subagent per file for tweaks.
>
> **v2 (Ari's 11/17 notes drawn):** no tape labels on board/notebook/box; Recently = one chip row at the top of the find list (Ari: seems right, but not too many options); Clear done on Next up (to-do, carries over); recipe log on a notebook page; no COOKBOOKS tape; Contents top left; sign in/up/front/not found on plain paper; not found shows inner stitches; "Your work is safe" cut (today the app saves only on Save); box menu in body font; + for new recipes; bigger "you are here"; Simple list drawn.
>
> **Questions to Ari (v2 page top):** retracting box 1 drawer / 2 tab strip / 3 handle; Card View B sideways (Ari leans this way) / A / both; Add wording; a new name for Jot (six); jot button icon A–F; Recently row few enough; keep unsaved typing on the phone (build task). Ari's 01 note "same with …" was cut off: ask what she meant. After her box pick, update decision 003 (her notes override parts of it).
>
> **Assumptions to confirm if Ari raises them:** phone kitchen fits one screen (board, counter, shelf; no fridge or window); tape labels added to whiteboard, idea board, notebook and box on the phone; cookbooks in one sideways-scrolling row; Card View keeps the box address `/box/croissants`; three invented older log entries; the notebook page combines the wide spread's entry with its sketch and bars.
>
> **v3 (Ari 11/17):** box = drawer (short wooden strip, + in the strip beside ▲ A–Z, no box label pulled out, short tabs on tap, fan as small index cards); add button is a plus everywhere; decision 003 updated. Ari: "same with" was nothing. Later list: notebook shows the recipe; saving rules (decide before editing Task issues).
>
> **Answered (Ari 11/17, after v3):** Card View follows how you hold it, with a keep-sideways button (flexible, revisit later); the add button is "Quick add" and on the kitchen adds an idea, a Next up line, a recipe or a trial; the fan still needs workshopping (Later list, not blocking).
>
> **v4 (drawn 11/17):** Quick add sheet (Idea, Next up, Recipe, Trial) and "Find or add…"; Card View `pb-cv-up`, `pb-cv-side`, `pb-cv-kept` with the Keep sideways pill. No open questions; page top asks for sign-off.
>
> **SIGNED OFF by Ari 2026-11-17 (v4).** Small phone tweaks (eclair spot, board lower under the find bar) wait for a later review (PLAN Later list).
>
> **Next:** then the mark (T&E), brand sheet, React test piece (Ari reviews before any commit), Task issues, build.

## Prompt for the next agent (after Plate XI sign-off) — done 2026-11-17 (phone plate drawn)
> Plate XI is SIGNED OFF (Ari, 2026-11-17, version 2): https://claude.ai/artifact/8eaxCBnwujNi1zg945oDBL. It is the brand sheet reference. Sources in `design/plate-xi/` (build: `cd design/plate-xi && node build.cjs`, then `tail -n +2 dist/index.html | sed '$d' > dist/kitchen-plate-xi.html`, publish that file to the same URL).
>
> **Confirmed by Ari (2026-11-17):** web addresses as drawn under each view (Back returns to `/kitchen`), and the paid plan card with a free "Switch to Developer" (section 05). Nothing waits on Ari.
>
> **Page layout:** `00-questions`, `01-kitchen` (ring: kitchen in the middle, views around, lines drawn by `base/xi.js`), `02-row` (front, sign in, sign up, Account, Settings, not found), `03-evening`, `04-plans` (home cook / guest strip, filled from `XI_STRIP`), `05-states`, `06-details`, then "More" sections 10–19, one per view. The director owns 00–04, 06 and `base/`; each "More" file fills its own ring or row figure.
>
> **Tweaks:** one subagent per file (cheaper model), brief it with `design/plate-xi/BRIEF.md` and only its file. Check screenshots, republish, commit.
>
> **Next:** the web addresses decision is written (`docs/decisions/005-web-addresses.md`); next is the phone layout (PLAN.md section 3), then the mark (T&E), brand sheet, the React test piece (Ari reviews before any commit), Task issues, build.

## Prompt for the next agent (Plate XI, the final plate) — done 2026-11-17
> Draw Kitchen Plate XI, the final plate. Everything is decided; do not re-ask settled questions. No app code changes.
>
> **Read, in this order:** `docs/design/PLAN.md` sections "2. Plate XI (final)" (the checklist IS the brief), "Before Task issues", "Details list", and the status table; then `design/plate-x/BRIEF.md`; then the bottom entries of the `kitchen-layout` memory only if something is unclear.
>
> **Do:**
> 1. Branch: stay on `docs/plate-x-cookbooks` (PR wolpino/trial-and-eclair#172) until merged, then branch from `staging-render`.
> 2. Copy `design/plate-x/` to `design/plate-xi/`. Plate X sections are signed off: reuse their drawing code, remove every option figure, apply the picks listed in PLAN.md.
> 3. Build ONE page: day kitchen in the middle, each object's zoomed-in view around it joined by a thin line; a row below for front page, sign in, sign up, Account, not found; the evening kitchen as one extra image below; a short strip for home cook and guest differences; loading, error and offline states; the "paid plan" card; the Details list.
> 4. Work as the director: one subagent per piece, at most 3 at once, each briefed with BRIEF.md and only its piece. Check screenshots yourself before publishing. To save usage, run subagents on a cheaper model.
> 5. Publish as a NEW artifact (Plate X stays at https://claude.ai/artifact/Bd3ft4VmtoKDgKRuLae6Lt, version 24). Build: `cd design/plate-xi && node build.cjs`, then `tail -n +2 dist/index.html | sed '$d' > dist/kitchen-plate-xi.html`.
> 6. Questions, if any, go at the top of the page in `sections/00-questions.html`, each linked to its drawing, and in chat in the same order.
> 7. After publishing: update the PLAN.md checklist, this file and `.cursor/session_log.mdc`, and commit. Do not push unless asked.
>
> **Two things for Ari to confirm when Plate XI is shown** (both drawn as Claude's pick): every view and recipe gets its own web address with Back returning to the kitchen; clicking a "paid plan" tag offers a free one-click switch to Developer (no payments).
>
> **After Plate XI is signed off:** phone layout, then the mark (T&E), brand sheet, the React test piece (Ari reviews before any commit), Task issues, build.

## Prompt for the next agent (Plate X, after Ari answers the v23 questions) — done 2026-11-16
> Kitchen Plate X, settling the last four views: references (05), sign in (09), account (11), front page and not found (12). Read `docs/design/PLAN.md` ("How we work", status table, Later and Details lists), the `kitchen-layout` memory (bottom entries), `design/plate-x/BRIEF.md`, and the top entry of `.cursor/session_log.mdc`. No app code changes. Branch `docs/plate-x-cookbooks` (PR wolpino/trial-and-eclair#172) until merged, then branch from `staging-render`.
>
> Plate X page: https://claude.ai/artifact/Bd3ft4VmtoKDgKRuLae6Lt (version 23). Republish: `cd design/plate-x && node build.cjs`, then `tail -n +2 dist/index.html | sed '$d' > dist/kitchen-plate-x.html`, publish with `url` set to that link.
>
> The open questions (5 in v23) are at the top of the page (`sections/00-questions.html`). Record Ari's answers in the memory, send tweaks to one subagent per section (up to 3 at once), check screenshots, republish, take answered questions off the list. When all four are signed off, Plate X is done: start Plate XI (final, picks only, plus the Details list).

## Prompt for the next agent (Plate X references, after Ari looks at version 20) — done 2026-11-13
> Kitchen Plate X, next view: references (section 05). Read `docs/design/PLAN.md` ("How we work", status table, "References" checklist, Details and Later lists), the `kitchen-layout` memory (bottom entries), `design/plate-x/BRIEF.md`, and the top entry of `.cursor/session_log.mdc`. No app code changes. Work on branch `docs/plate-x-cookbooks` (PR wolpino/trial-and-eclair#172) until it is merged, then branch from `staging-render`.
>
> Plate X page: https://claude.ai/artifact/Bd3ft4VmtoKDgKRuLae6Lt (version 19). Republish: `cd design/plate-x && node build.cjs`, strip the first line and the closing `</body></html>` from `dist/index.html` into `dist/kitchen-plate-x.html`, publish with `url` set to that link.
>
> Cats and recipe box tag A are settled (Ari, 2026-11-13, v20). First ask Ari for a look at the cookbook changes if not given yet. Then one new subagent draws `sections/05-references.html` from `design/plate-ix/sections/05-references.html`, briefed with BRIEF.md and the References items. Questions go at the top of the page in `sections/00-questions.html`, each linked to its figure, and in chat in the same order.

## Prompt for the next agent (Plate X, picks up after Ari answers the 2026-11-13 questions)
> Kitchen Plate X, settling the five views already drawn. Read `docs/design/PLAN.md` ("How we work", status table, Later list), the `kitchen-layout` memory (bottom entries: "Plate X review"), `design/plate-x/BRIEF.md`, and the top entry of `.cursor/session_log.mdc`. No app code changes.
>
> Plate X page: https://claude.ai/artifact/Bd3ft4VmtoKDgKRuLae6Lt (republish the same page: build with `cd design/plate-x && node build.cjs`, strip the html/head/body wrapper into `dist/kitchen-plate-x.html` as in earlier commits, then publish with `url` set to that link). `node build.cjs --skip NN` leaves out a section still being drawn.
>
> Work as the director: one subagent per section file, at most 2 at once, each briefed with BRIEF.md and only its view's changes. Check screenshots before republishing. Commit after each round (section file + PLAN.md status). The earlier subagents are gone; new ones start from the files.
>
> **Finish these five views before cookbooks.** Apply Ari's answers below, then put every still-open question for the five views to Ari in ONE message, in page order, each with its figure name.

### Applied and published 2026-11-13 (Plate X version 9)
- Kitchen: original green everywhere (quiet-green figure and `o.cab` removed), RECIPE LOG tape on the left door of the double cabinet, COOKBOOKS label moved left (REFERENCES left where it was), clipboard on the inside of the left door with a four-row log sheet (11/11 Croissants trial 4 · shatter good; 11/08 Blondies · less sugar; 11/05 Rough puff pastry · six folds; 11/02 Rhubarb galette · swapped spelt)
- Notebook: black band fixed (the cover sat above the pages), tabs are numbers with a "Croissants" tag taped above them, luggage tags on the recipe arrows, corner captions handwritten in the margin, page numbers centred, "Make recipe card" stamp plus a three-wording figure (A Make recipe card, B Create recipe card, C Finalize), first-time and replace dialogs
- Recipe box: guest limit dusty rose (#e3a9ae), two-shade figure dropped

### Questions put to Ari (2026-11-13, page order), answers pending
See the session log top entry; record answers in the `kitchen-layout` memory, tweak, then mark views done in PLAN.md.

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
