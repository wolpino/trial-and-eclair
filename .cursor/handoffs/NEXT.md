# NEXT — 2026-11-12 (Plate IX published; waiting on Ari, then Plate X = final)

## Goal
The block layout is final (round 10). Draw the kitchen in the plate style, then use the drawing to help pick the mark.

## Map
```
style ✅ → colours ✅ → kitchen layout ✅ (round 10) → plate drawing ⏳ (Plate IX published; Plate X = final day + evening, then wrap up) → mark → brand sheet → Task issues → build
```

## Prompt for the next agent
> Kitchen plate drawing, Plate X (the last plate). Read `.cursor/handoffs/NEXT.md`, the `kitchen-layout`, `visual-direction` and `commit-each-round` memories, and the top entry of `.cursor/session_log.mdc` first. No app code changes.
>
> Plate IX is https://claude.ai/artifact/APtnqDfCTQb13uLgHnABtf. Its sources are local in `design/plate-ix/` (untracked): `BRIEF.md` (rules every section follows), `base/` (shared helpers, frozen Plate VIII kitchen), `kitchen.js` (Plate IX kitchen), `sections/NN-name.html` (one file per view), `build.cjs` (`node build.cjs` joins them into `dist/index.html`; `--only NN` builds one section), `shot.cjs` and `shots/all.cjs` (Playwright screenshots). Edit a section file, rebuild, proof, then publish `dist/kitchen-plate-ix.html` (the build output with the html/head wrapper stripped; see the session log) as a new artifact for Plate X.
>
> **Wait for Ari's Plate IX answers first.** Each section on the page ends with up to 4 questions (36 in all), and the wrap-up questions below are still open. Record the answers in the `kitchen-layout` memory, then draw Plate X:
> 1. The final kitchen with Ari's picks only (fridge colour, Recently holder, window whole or cut, floor, tape or brass). Drop the comparison crops.
> 2. Final day and evening plates of the kitchen.
> 3. Each open view updated from Ari's answers; evening versions of the open views if Ari wants them.
> 4. Known issues from Plate IX to fix or confirm: the floor reads as diagonal stripes near the left and right edges; the sun patch is faint on the tile; the fridge hinges fall outside the main view; the idea board draws 2 statuses (the model has 4); references draws 4 kinds (the app has 5); sign-in uses username (as the app does); the open recipe box's action pills float beside the lid; the small whiteboard says "Blondies · trial 4" but the sample data gives trial 4 to Croissants.
>
> Subagents worked well for Plate IX (one per section, each owning one file, briefed by `BRIEF.md`). Ari uses one main session that hands tasks to subagents.

## Questions to wrap up the plates (for Ari)
1. **What counts as done for the plate drawing?** For example: one day and one evening plate of the final kitchen, plus the open box and open notebook, signed off. After that, changes happen in the build.
2. **Which open choices must be settled before the build, and which can wait?** Still open: fridge colour, Recently holder, shelf labels (brass or tape), floor strip, window cut or whole, paid-plan tags, colours, plus the per-view questions on Plate IX. (Tile is settled: on by default.)
3. **After the plates:** the mark next (Ari hoped the drawing would help), or the phone layout?
4. **Brand sheet:** should the final plate become the reference for the brand sheet (colours, ink line, halftone, fonts), then Task issues for the build?
5. **Equipment spots:** do anniversary pieces go on the counter ends, the fridge top, the window sill, or a shelf above the board?
6. **`design/kitchen-starter/` (20 MB) and `design/plate-ix/` (plate sources, small without `dist/` and `shots/`):** commit them, or keep them local?

## The layout now (final)
- **Plate IX kitchen (2026-11-12):** wide (300–1500); vintage fridge at the left edge holding "Recently"; one plain door beside it; small window on the right (sun patch by day, moon by night); taller quiet tile ON by default; checkerboard floor strip; tape shelf labels in the main kitchen. Open choices are on the Plate IX page
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
- Equipment spots: follow the visible edges, or a fixed distance from the middle
- Whether `design/kitchen-starter/` (20 MB PSD) gets committed (still local)

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
