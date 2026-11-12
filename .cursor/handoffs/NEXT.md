# NEXT — 2026-11-11 (kitchen plate drawing, round 1 → 2)

## Goal
The block layout is final (round 10). Draw the kitchen in the plate style, then use the drawing to help pick the mark.

## Map
```
style ✅ → colours ✅ → kitchen layout ✅ (round 10) → plate drawing ⏳ (Plate VI out, waiting on Ari) → mark → brand sheet → Task issues → build
```

## Prompt for the next agent
> Kitchen plate drawing, after Plate VI. Read `.cursor/handoffs/NEXT.md`, the `kitchen-layout`, `visual-direction` and `commit-each-round` memories, and the top entry of `.cursor/session_log.mdc` first. The block layout is final; don't change it. No code changes.
>
> Plate VI is published: https://claude.ai/artifact/PPHHNxUm3q1LiJvrpC9tnJ (source: `Artifact` read with `path: index.html`). It answered the Plate V notes:
> - **Depth:** one-point perspective. One vanishing point at x 900, y 200 (eye level, middle of the board), with depth from `P(x, y, d)` = move toward the vanishing point by d/(d+500). Depths used: board insets 10, door panels 9, notebook 48, stand 52–56, box 66–70, shelf 50, books 40, counter 130, plate 128 across. A construction-line plate shows every receding edge.
> - **Glow:** a blurred halo that follows the outline and spills about 45 px past it (the cork's halo is clipped at the divider), the cork turns paler, and "Ideas" turns yellow with an orange underline.
> - **Evening:** one gradient multiplied over the kitchen, warm at the top edge and dusk at the bottom. No lamps, and the ink stays black.
> - **Notebook:** white page edges. Lines on top run along the width, lines on the right side run down the height. Cloth spine, marbling and cushion label are kept.
> - **Jot B only.** The **"Recently"** note is taped on, and each name shows yellow with an underline on point.
>
> Apply Ari's answers to Plate VI (perspective right?, glow on the cork, evening, page edges, name Lab/Trials/Trial notes, cover black/white). If Ari picks the next step instead: more plate rounds, the phone layout (stacked, jot button bottom right), or the mark. Publish each round as a new artifact, proof locally with Playwright from `frontend/node_modules` first, then record the answers in the `kitchen-layout` memory, this file and the session log, and commit on the docs branch.

## The layout now (final)
- **Wall:** one board in the middle: whiteboard on the left ("next up", pinned plus automatic, marker font), cork ideas on the right. Lowered to just above the recipe box, with a small gap (round 9 A). The wall above the board stays plain, which leaves room for anniversary equipment or a shelf later. No window, no oven, no title or name
- **Counter, middle:** the Lab notebook on a cookbook stand on the whiteboard's side, tall enough to overlap the board's bottom edge. A half-eaten eclair on a plate in the middle (seasonal flowers maybe later). The recipe box on the cork's side. All three sit close together
- **Side rule:** the Lab is always on the whiteboard's side and the box on the cork's side. The Lab need not be right under the whiteboard
- **Under the counter:** two-tier open shelf (cookbooks above, references below), one drawn book per real one, a cabinet each side. It starts short with one book lying down per tier, and the cabinets narrow as it fills
- **Width:** the whole kitchen scales with the window between a minimum (80%, at 960 px) and a maximum (140%, at 1680 px). Outside that range the middle (notebook, eclair, box) keeps its spacing; the cork grows and shows more ideas, the shelf widens a little, the two cabinets each side take the rest; no extra doors. No plate border
- **Clickable things:** colour sits inside the ink line; every object has a permanent label (no hover labels). Pointing: glow + label (amber halftone glow behind, the object's label turns yellow)
- **Top:** find-or-jot bar centred at the top, Account top right. Typing opens one list under the bar: jot destinations first (the cork as an idea, or the whiteboard's next up), then matching recipes and notebook entries. Phone: stacked layout, jot button bottom right
- **Recipe box closed:** "Recipes" in a brass label holder. Click opens it to fill most of the screen over the dimmed kitchen
- **Recipe box open:** the card rests on a ledge in the lid; the lid is empty until a card is picked. The box body is short, sized for three tab rows. The lid grows with the recipe from a minimum (round 9 height, about 45% of the screen) to a limit (about 55%), then the card scrolls. Later: a full-screen card view
- **Tabs:** A–I front, J–Q middle, R–Z back; R–Z lined up with A–I, J–Q centred in the gaps; nine R–Z tabs, no XYZ (drawn in round 10)
- **Roles:** one kitchen for everyone; nothing hidden, nothing moves on upgrade. Paid things (Lab, cork ideas, cookbooks tier) carry a "paid plan" label and open read-only with sample data for cooks and guests. Cooks get the box, whiteboard and references. Guests: decision 002 as it is (starter recipes, up to 5 cards of their own)
- **Depth:** dimensional, one-point perspective, one vanishing point at the centre of the board (Plate VI)
- **Notebook:** a composition book (cloth spine, marbled cover, cushion label) on a cookbook stand; opens to a two-page spread, ruled pages, no spiral or tape
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
