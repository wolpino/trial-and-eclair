# NEXT — 2026-11-12 (kitchen plate drawing, Plate IX next)

## Goal
The block layout is final (round 10). Draw the kitchen in the plate style, then use the drawing to help pick the mark.

## Map
```
style ✅ → colours ✅ → kitchen layout ✅ (round 10) → plate drawing ⏳ (Plate IX next; then wrap up) → mark → brand sheet → Task issues → build
```

## Prompt for the next agent
> Kitchen plate drawing, Plate IX. Read `.cursor/handoffs/NEXT.md`, the `kitchen-layout`, `visual-direction` and `commit-each-round` memories, and the top entry of `.cursor/session_log.mdc` first. Read all of Ari's Plate VIII notes below before changing anything. No code changes.
>
> Start from the Plate VIII source: `Artifact` read of https://claude.ai/artifact/KGwgZJZ6XQMeRtQTdMr1mR with `path: index.html`. Publish Plate IX as a new artifact. Keep everything Ari didn't mention as it is in Plate VIII.
>
> **Ari's Plate VIII notes, and what to draw:**
> 1. **Perspective:** keep Plate VIII's "now" setting: vanishing point x 900, y 230; `P(x, y, d)` = d/(d+500); counter depth 80; board 25 px higher. Drop the angles strip.
> 2. **Eclair:** decided. Whole on load, three clicks to eat, back on reload. Keep the click behaviour; drop the bite strip and the three "when does it come back" options.
> 3. **Width:** Ari asked whether the fridge and window belong in the earlier, wider kitchen (viewBox 300–1500) instead of the narrow one, because "everything is too close together". Recommended: yes. Draw Plate IX wide, with the middle (board, notebook, eclair, box, shelf) where it was in the wide kitchen and the fridge and window using the extra width. Show the narrow version once, small, to compare.
> 4. **Fridge on the left,** with more detail so it doesn't look like a plain box. A vintage, 1950s-style fridge: rounded top corners, a chrome lever handle, a chrome trim strip and a small badge plate (no real brand name or logo; Ari mentioned Frigidaire only as the look). Also visible hinges, a door gasket line and a grille at the foot. Cream or soft mint enamel. Keep the rule that its side shows only above the counter and points at the vanishing point.
> 5. **Left cabinets:** one thinner cabinet between the fridge and the shelf (one door, not two), and **no towel**.
> 6. **Window back, on the right,** so the light can change between day and evening (sun patch by day, dark sky and moon by night). Ari likes the small window. They asked whether it would look odd running past the right edge like the fridge does on the left. Draw both: the window fully inside the view, and the window cut by the right edge (cut on a mullion so it looks deliberate). Same perspective rule: the reveal shows the inner walls facing the eye, and the sill shows its top.
> 7. **Recently:** the list is better, but the tape is wrong. Fix the tape: a short strip across the top edge, half on the paper and half on the fridge, slightly see-through, with torn ends, sitting flat on the surface rather than floating above the torn edge. Then bring back the holding options on the fridge door: magnets (one or two), ticket rail, clothesline, slate and index card. Each name stays a link (yellow + underline on point).
> 8. **Shelf labels:** Ari is unsure about the brass "Cookbooks" / "References" holders. Show a masking-tape label written by hand on the front edge of each shelf board, next to the brass holders.
> 9. **Tile:** the quiet tile backsplash, a little taller (from the counter up toward the board). Check with Ari whether that means tile is now on by default.
> 10. **Floor:** try a checkerboard strip of floor along the bottom, below the cabinets' kick board. Below eye level, so its lines run to the vanishing point and its rows get shallower toward the back. Show with and without. Ari wasn't sure it would work.
> 11. **Recipe box:** better. Keep it as is.
>
> Proof locally with Playwright from `frontend/node_modules` (screenshot once, crop to check details), then publish. Then record Ari's answers in the `kitchen-layout` memory, update this file and the session log, and commit on the docs branch. Bring the wrap-up questions below to Ari with the plate.

## Questions to wrap up the plates (for Ari)
1. **What counts as done for the plate drawing?** For example: one day and one evening plate of the final kitchen, plus the open box and open notebook, signed off. After that, changes happen in the build.
2. **Which open choices must be settled before the build, and which can wait?** Still open: Recently holder, shelf labels (brass or tape), tile on or off, floor strip, window cut or whole, paid-plan tags, colours.
3. **After the plates:** the mark next (Ari hoped the drawing would help), or the phone layout?
4. **Brand sheet:** should the final plate become the reference for the brand sheet (colours, ink line, halftone, fonts), then Task issues for the build?
5. **Equipment spots:** do anniversary pieces go on the counter ends, the fridge top, the window sill, or a shelf above the board?
6. **`design/kitchen-starter/` (20 MB):** commit it, or keep it local?

## The layout now (final)
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
| Plate VIII (narrower, recipe box lid, Recently on wall or fridge, eclair bites, angles, phone photos) — base for Plate IX | https://claude.ai/artifact/KGwgZJZ6XQMeRtQTdMr1mR |
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
