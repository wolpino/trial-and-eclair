# NEXT — 2026-11-19 (Plate XII v10 published; Ari sent vector traces of the rack and journals; next chat ports them)

> **Start here: `docs/design/PLAN.md`.** It is the one list of what is left, the status of each Plate X view, and the rule for new ideas (they go on its Later list unless Ari says "this round"). All of Ari's answers are in the `kitchen-layout` memory. The sections below are kept as history.

## Goal
The block layout is final (round 10). Draw the kitchen and every view in the plate style, sign the plates off, then the phone layout.

## Map
```
style ✅ → colours ✅ → kitchen layout ✅ (round 10) → plate drawing ✅ → phone layout ✅ → mark ✅ → brand sheet ✅ → Task issues ⏳ → build
```

## Prompt for the next agent (Plate XII v11: port Ari's rack and journal vectors) — START HERE
> Plate XII v10: https://claude.ai/artifact/JpRfR1F4DZCy9ctDCezeZj (the live page is v10). Load the `plate-round` and `kitchen-plate-style` skills. Build: `cd design/plate-xii && node traced/clean.cjs && node build.cjs && tail -n +2 dist/index.html | sed '$d' > dist/plate-xii.html`; read the live artifact before the first publish of a new session, then publish to the same URL.
>
> **Ari's answers after v10 (11/19):** the shelf view is **Library**. "Baking log" is wrong because not every recipe is baking: change `LOG_TITLE` in `traced/add.cjs` and offer a few (Claude's pick "Kitchen log"; also "Recipe log", "Log").
>
> **New this round:** Ari made vector traces in Kittl, now in `design/plate-xii/refs/`:
> - `eclair-rack.svg`: eclairs on a cooling rack (400 x 266, ~650 paths)
> - `comp-journals.svg`: the stacked composition journals (400 x 266, ~1000 paths)
>
> Both have a dark `#1E1E1E` rect and a `#FAF6EE` rounded card behind the art. Port them the way her glass studies went in: strip the card and background (and any background shapes that are just paper), keep her shapes, recolour only if they clash, scale and place them. The rack replaces `rack(n)` at the box/notebook spot (still three states taken by clicks: group each eclair's paths so one can be hidden per click). The journals replace `stackFront()` in front of the whiteboard. A small cleaner like `clean.cjs` may help (sort paths by position into eclair 1/2/3, rack, shadow). Check her trace's halftone/texture against the kitchen's flat look; keep it if it reads, say so if not.
>
> **Bottles:** Ari said she sent new bottle SVGs, but only the two files above were attached. Ask for them; until then B1 (trio at .56) and B2 (decanter + amber) stay.
>
> **Still open (page top):** B1 or B2; taken vs bites; flour and pin keep or remove; clipboard title; times of day. Product list in PLAN.md (Library, saved cookbooks, clipboard log, rainbows by clock, eclair easter egg, no fridge/Recently) goes into the PRD in one pass at sign-off.

## Prompt for the next agent (Plate XII, after Ari answers v10) — superseded by the v11 prompt above
> Plate XII v10: https://claude.ai/artifact/JpRfR1F4DZCy9ctDCezeZj. Build as before. Options in `add.cjs` (DEF): sill 1–2 (SILL_FIT scales), sun am/noon/pm/eve, tidy 0/1; `ecl-0..3` = eclairs taken from the rack by clicks (rack(n)). Fixed: compBook books in front of the whiteboard, tabs/ribbon/doodle, RECIPES, "Baking log", "Ideas", walnut frame, crystals.
>
> **Questions (page top):** B1 (pick) or B2; one taken per click (pick) or bites; books close enough or Ari makes a vector; flour and pin; clipboard title (pick Baking log); times of day; Library name (pick Library).
>
> **After answers:** set DEF, drop the losing bottle and the tidy toggle; keep the time-of-day control. If Ari sends a notebook vector, port it like her glass studies (her units, scaled, restyled). Then phone crop and size; product list into the PRD at sign-off.

## Prompt for the next agent (Plate XII, after Ari answers v9) — done (v10)
> Plate XII v9: https://claude.ai/artifact/JpRfR1F4DZCy9ctDCezeZj. Build as before. Options left in `add.cjs` (DEF): sill 1–4 (Ari's glass studies, restyled), sun am/noon/pm/eve (eve = `.dusk` on #tk + dim layer), tidy 0/1 (`.tidy` hides flour and pin, patch fills behind). Eclair `ecl-0..3` by clicks. Fixed: books in front of the whiteboard (flatQuad), tabs/ribbon/doodle, RECIPES, "Baking log" (LOG_TITLE), "Ideas", walnut frame.
>
> **Questions (page top):** bottles (pick B1), flour and pin, clipboard title (pick Baking log), the four times of day, Library name (pick Library).
>
> **After answers:** set DEF to the picks, drop losing bottle options and the tidy toggle; keep the time-of-day control (it is a feature: rainbows follow the clock). Then phone crop and size; product list into the PRD at sign-off.

## Prompt for the next agent (Plate XII, after Ari answers v8) — done (v9)
> Plate XII v8: https://claude.ai/artifact/JpRfR1F4DZCy9ctDCezeZj. Build as before. Options in `add.cjs` (DEF = picks): nb, nbx, box, sill (L1–L3), ecl 0–3 (driven by clicks, not a choice). Window frame colour: `.trim-on` + `--trim` on #tk (walnut default), shades in `TRIM`.
>
> **Decided:** window frame walnut (`--trim:#7A4E2D` on #tk, swatches removed).
>
> **Questions (page top):** sill (pick L1 bottles), books spot (pick under), notebook extras enough, RECIPES (pick no), Library name (pick Library).
>
> **After answers:** set DEF and the default `--trim` to the picks, remove losing options and their buttons. Then evening, phone crop, size; product list into the PRD at sign-off.

## Prompt for the next agent (Plate XII, after Ari answers v7) — done (v8)
> Plate XII v7: https://claude.ai/artifact/JpRfR1F4DZCy9ctDCezeZj. Build as before. `add.cjs` options (`<g data-var>`, DEF = Claude's picks): nb n1/n2/0, nbx 1/0, box 1/2/3; sage window frame via `.trim-sage` on #tk (colours in `TRIM`). Fixed: E1 bitten at P1, basil + crystal mobile + rainbow beams.
>
> **Questions (page top):** composition books under the open notebook (pick) or in front of the whiteboard; sage frame (pick); RECIPES on the box (pick no, Ari dropped box lettering before); notebook extras enough; Library name (pick Library).
>
> **After answers:** set DEF to the picks, remove the losing options and page buttons. Then evening, phone crop, size. Product list in PLAN.md goes into the PRD in one pass at sign-off.

## Prompt for the next agent (Plate XII, after Ari answers v6) — done (v7)
> Plate XII v6: https://claude.ai/artifact/JpRfR1F4DZCy9ctDCezeZj. Build as below; `clean.cjs` also writes `traced/closeups.html` (build puts it at `<!--CLOSEUPS-->`). In `add.cjs`, options are `<g data-var>` groups (DEF = shown first): eclair ECL 1–5 × SPOT p1/p2/p3, the notebook stacks (p2 under the open notebook via a mask, p3 in front of the whiteboard), SILL 1–3. Page buttons and close-ups switch them.
>
> **Questions (page top):** eclair (pick E1), spot (pick P2), sill (pick S3), Library name (pick Library).
>
> **After answers:** set DEF to the picks and delete the other options (code and page buttons), keep the close-ups only if Ari wants them. Then evening, phone crop, size. Product list in PLAN.md (Library, saved cookbooks, clipboard log, no fridge/Recently) goes into the PRD in one pass at sign-off.

## Prompt for the next agent (Plate XII, after Ari answers v5) — done (v6)
> Plate XII v5: https://claude.ai/artifact/JpRfR1F4DZCy9ctDCezeZj. Same sources and build as below, minus the swap (removed). New in `clean.cjs`: TOP 44 (frame ends at the middle drawer's bottom, viewBox `6 -39 856 479`), `extend()` builds the added top from the scene itself (cupboard band stretched, cubby row moved up and flipped). `add.cjs`: marker, eclair, spoon jar, open cupboard (125 degrees, two shelves) and clipboard. Page close-ups reuse `#a-all`.
>
> **Decided (Ari 11/19):** stem green; cupboard open wide; clipboard = recipe log button; box and mixer stay; new pieces may be cleaner than the trace.
>
> **Questions (page top):** one Library view for cookbooks + references, its name (pick Library), no shelf labels; taller frame OK; close-ups OK.
>
> **Product changes:** keep adding to PLAN.md "Product changes from the plates"; apply them to PRD, README and Task issues in one pass when Plate XII is signed off.

## Prompt for the next agent (Plate XII, after Ari answers v4) — done (v5)
> Plate XII v4: https://claude.ai/artifact/JpRfR1F4DZCy9ctDCezeZj. Sources `design/plate-xii/traced/`: `source.svg` (never edit), `clean.cjs` (sorts paths into objects; MOVE_TO reclass rules; splits the dark underlay "ink" per object with SVG masks, INK_GROW 6, room cut-out grown 3 so pieces overlap; SWAP moves box +488 / mixer -490; writes `kitchen.svg` and `kitchen-swap.svg`; `--plain` = split only, for diffing), `add.cjs` (new pieces in the trace's style: shelf labels, eclair, spoon jar, marker, cupboard open/ajar + clipboard, swap patches), `view.cjs out.png [cab] [wall] [svg] [open|ajar|closed]`. Build: `cd design/plate-xii && node traced/clean.cjs && node build.cjs && tail -n +2 dist/index.html | sed '$d' > dist/plate-xii.html`, publish to the same URL (read the live version first if this session hasn't).
>
> **Questions (page top), Claude's picks:** cupboard open wide (pick) or cracked; clipboard = recipe log button, drawers plain (pick yes); A box left (pick) or B swapped; labels/eclair/jar/marker as drawn (pick keep).
>
> **After answers:** drop the unpicked cupboard state and layout, record picks in PLAN.md 5b and the kitchen-layout memory. Then: evening (tint layer), phone crop, wider screens, and size (masks add ~300 KB per kitchen; could drop masks for objects that never move). Then Task issues (PLAN step 6).

## Prompt for the next agent (Plate XII v4: iterate the traced kitchen) — done 2026-11-19 (v4 published)
> Plate XII: https://claude.ai/artifact/JpRfR1F4DZCy9ctDCezeZj (v3). Ari picked the **traced kitchen** direction (section 00b). Sources `design/plate-xii/traced/`: `source.svg` (Ari's trace of Kittl A, never edit), `clean.cjs` (OBJ boxes sort paths into objects by position, paint order kept; SCRIB boxes clear writing per object; blues -> var(--blue)/var(--cab) shades; first path = wall -> var(--wall); writes `kitchen.svg` + `report.json`), `view.cjs out.png [cab] [wall]` to check a render. Page section `sections/005-traced.html` lays hit rects (same viewBox `6 5 856 479`) over the art; hover/focus adds `.lit` (drop-shadow glow). Build: `cd design/plate-xii && node traced/clean.cjs && node build.cjs && tail -n +2 dist/index.html | sed '$d' > dist/plate-xii.html`, publish to the same URL.
>
> **Ari's answers (11/19):**
> - Objects don't need to lift; glow only is fine.
> - No fridge: it was always an extra image. Ari wants the Recently list taken off, so nothing needs the fridge back.
> - Cabinets default **stem green** (#5e8c3a).
> - Labels "cookbooks" and "references" on the **outer (front) edge of the cubby's lower shelf**, the board below the books, each under its half.
> - One wall cupboard **open** (the top-left one, or the one to its right): door swung fully open or cracked open a little, a **baking log on a clipboard** hanging on the inside of the door. Ask Ari or draw both open amounts. Likely the clipboard becomes the recipe log button (the drawer stack then plain); confirm with Ari.
> - A **version with the recipe box and mixer swapped**.
> - Add the **eclair** (mark G style, on a plate, in the trace's look) and the other small changes: clear the leftover marks beside the mixer head, spoon jar on the window sill, the whiteboard marker in its own colour.
>
> **Order:** 1) **split the ink first**: the outlines live in two huge paths (#0D0C0B 868x472 and #272625 868x486, paths 2 and 1069 in report "big"). Split them into subpaths (each `M ... Z`), give each subpath to the object whose box holds it, keep paint order. Must look identical (diff a render before and after). This makes objects self-contained, so they can move (needed for the swap) and recolour cleanly. 2) cabinets stem green by default. 3) clear mixer marks. 4) shelf-edge labels. 5) box/mixer swap as a second version (both shown). 6) eclair, spoon jar, marker. 7) open cupboard with clipboard (new drawing in the trace's style: thick dark wobbly outline, trace's own colours, flat two-tone shading; the door's inside face in perspective, dark interior with a shelf or two, clipboard with blank ruled sheet). Big new pieces may look a little cleaner than the trace; if it shows, Ari can make the piece in Kittl and trace it, and the script splices it in.
>
> Put the questions at the page top, linked to the drawings (Ari's rule). Commit and log after the round.

## Prompt for the next agent (Plate XII, after Ari answers) — superseded by v4 prompt
> Plate XII v1: https://claude.ai/artifact/JpRfR1F4DZCy9ctDCezeZj. Sources `design/plate-xii/` (base/core.js and mark.js copied from brand; drawing in `kitchen-xii.js`, `XII.A()` / `XII.B()`, scene 1800 x 860, normal view crops x 200..1600). Build: `cd design/plate-xii && node build.cjs && tail -n +2 dist/index.html | sed '$d' > dist/plate-xii.html`, publish to the same URL. Shots: `node shot.cjs dist/index.html shots/vN "#xa-fig"`.
>
> **Why:** Ari's Kittl kitchens (desktop 1 corner view, desktop 2 straight on) are AI raster images: gibberish text, baked colours, no separate objects. Used as mood only. Straight on makes the kitchen stretch (wider = more wall) and keeps buttons as rectangles.
>
> **Questions (page top):** A, B or mix (pick A + B's eclair plate and magnets); keep the island with cookbook cubbies and recipe log drawers (pick keep); first cabinet colour steel blue or stem green (pick green); spiral open or composition standing (pick composition).
>
> **v2 (11/19):** Ari liked neither v1 and sent Kittl "recipe board one point options" (A balanced, B wide suite). Redrawn in true one-point perspective in `kitchen-xii2.js` (`XII2.A()`/`XII2.B()`; S(x,y,d) puts a room point on screen, L(d,…) draws a flat group at depth d; eye at 900,330). More detail: panelled doors, brass pulls, book spines, food photos, full Buttercup, checked floor through the kneehole. Questions: A/B (pick B); cookbooks/references (pick B's two shelves); whiteboard on the board (pick yes); tall cupboard = fridge (pick yes); cabinet colour. v1 sections renamed 08/09 with their own ids.
>
> **v3 (11/19):** Ari asked to make her vector trace work. `design/plate-xii/traced/`: `source.svg` (Ari's trace), `clean.cjs` (OBJ boxes sort paths into objects; SCRIB boxes clear writing per object; blues -> var(--blue)/var(--cab) shades; first path = wall -> var(--wall)), `view.cjs out.png [cab] [wall]` renders it. Section `005-traced.html` lays hit rects (same viewBox) over it; hover/focus adds `.lit` (drop-shadow glow) to that object's groups. Build injects `traced/kitchen.svg` at `<!--TRACED-->`. Open: traced (v3) or plate (v2)?
>
> **Next:** draw Ari's pick properly (evening, phone layout, Plate XI extras), then Task issues (PLAN step 6). Plate XI's kitchen is replaced only if Ari picks.

## Prompt for the next agent (Brand Sheet, after Ari answers) — done (v4)
> Brand Sheet v1: https://claude.ai/artifact/L3p52UdPaAsUBAa77J3gmi. Sources `design/brand/` (base copied from mark; the eclair helper MK2 now lives in `base/mark.js`; kitchen.js is Plate XI's). Sections: 00 questions, 01 mark (sizes, icon, title lockup, rules), 02 colours (tokens, shades, contrast table computed on the page), 03 fonts, 04 line/colour/halftone/hatching, 05 small pieces, 06 kitchen reference (day, evening, construction lines). Build: `cd design/brand && node build.cjs && tail -n +2 dist/index.html | sed '$d' > dist/brand-sheet.html`, publish to the same URL.
>
> **Questions to Ari (page top):** (1) "T&E" only as the home screen label? Claude's pick yes. (2) App icon ground: Prussian (pick) or paper; tab stays paper. (3) Body font: keep Iowan/Palatino/Georgia stack (pick) or load a web font.
>
> **v2 (Ari 11/17):** asked what the valance was (the Prussian scalloped band over the window, 11/08 Kitchen Plate, gone since Plate IX), whether cobalt is too dark (denim? buttercup, her first Cuisinart stand mixer), whether green should lead, doubts about the colour wheel, wants other pointing options than the amber dots. Drawn: 02b colour options (A box colour, B lead colour as icons, C1 cabinets swatches, C2 box swatches, C3 what a wheel lets through) and 04b pointing P1–P6. Questions 1–6 at the page top. Claude's picks: denim box; lead colour = box colour; drop the wheel, box-only swatches; P5 lift + faint P2 halo; T&E home label only; keep body font.
>
> **v3 (Ari 11/17 answers):** box colour = brand colour, fixed, somewhere cobalt→denim; cooks recolour cabinets, fridge, wall, backsplash (swatches + custom wheel); soft glow + gentle movement; asked about TRIAL & ECLAIR round two sides of the box with & on the corner. Drawn: 02c seven blues, 02d interactive colour panel (fridge and tile swapped by string replace of #f6efd9/#f4f5ea), 04c G1–G4 loops day+evening and E1/E2, 01b W1–W3 + home label. Claude's picks: Blue 3 #3F5F9D; G1 + E2; W3 on sign in/front/loading; home label "Trial & Eclair".
>
> **v4 (Ari 11/17):** Blue 3 #3F5F9D is the box and brand colour (sheet and icon updated, --blue in base/style.css). Lettered box dropped; Ari meant "Trial & Eclair" round the edge of the square icon (on hold). Ari wants as much as possible on hold while building: holds are in PLAN.md "Later list" with the three build rules that keep them safe.
>
> **Branch:** `docs/plate-x-cookbooks` is pushed and clean (2026-11-17). Open a PR into `staging-render` when Ari asks.
>
> **Next:** Task issues (PLAN step 6), starting with the test piece (kitchen + one open view, Ari reviews before commit). Carry the three build rules into the relevant issues.

## Prompt for the next agent (Mark Plate, after Ari answers) — done 2026-11-17 (eclair G picked)
> Mark Plate v1: https://claude.ai/artifact/5baLfL52D5X1pNYCdNgS6F. Sources `design/mark/` (base copied from phone; sections 00 questions, 01 options A–F, 02 in place). Build: `cd design/mark && node build.cjs && tail -n +2 dist/index.html | sed '$d' > dist/mark-plate.html`, publish to the same URL. One Sonnet subagent per section for tweaks.
>
> **Options:** A letterpress serif, B marker on tape, C round stamp (no ring words), D one-stem monogram, E brass label plate, F index-card tab. Claude's pick D (holds at 16 px and as an app icon); runner-up B. Both drawn in place: wide kitchen top left, phone top bar, PWA icon, favicon.
>
> **Questions to Ari (page top):** which mark (A–F or none yet); where it sits; ink only or one colour.
>
> **v2 (Ari 11/17):** B liked but not yellow, not sold on tape, revisiting T&E, wants the mark from the kitchen (eclair/notebook). Drawn: B on white/black and cobalt with white or dandelion letters, padded vs tight small sizes (01); eclair G plain at the tape angle, H with T&E, I monogram with eclair stem (02); in place (03); v1 kept as 08/09. Claude's picks: cobalt + white padded; G; eclair as icon, T&E as text. Eclair redrawn (kitchen.js helper is private). In-place phones wrap to two rows (fine).
>
> **PICKED (Ari 11/17): default to eclair G.** Recorded in PLAN.md step 4.
>
> **Next:** brand sheet (PLAN step 5): colours, fonts, line and halftone rules, the mark (G), kitchen reference from Plate XI. Open: whether T&E text stays anywhere, B's tape colour (only if T&E text is used).
>
> **After the pick (old note):** record it in PLAN.md "4. Mark" and the kitchen-layout memory, then the brand sheet (PLAN step 5).

## Prompt for the next agent (Phone Plate, after Ari answers) — done 2026-11-17 (signed off v4)
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
