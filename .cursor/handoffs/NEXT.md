# NEXT — 2026-11-11 (kitchen plate drawing, round 1 → 2)

## Goal
The block layout is final (round 10). Draw the kitchen in the plate style, then use the drawing to help pick the mark.

## Map
```
style ✅ → colours ✅ → kitchen layout ✅ (round 10) → plate drawing ⏳ (Plate VI next) → mark → brand sheet → Task issues → build
```

## Prompt for the next agent
> Kitchen plate drawing, Plate VI. Read `.cursor/handoffs/NEXT.md`, the `kitchen-layout`, `visual-direction` and `commit-each-round` memories, and the top entry of `.cursor/session_log.mdc` first. The block layout is final; don't change it. No code changes.
>
> Start from the Plate V source: `Artifact` read of https://claude.ai/artifact/13AuDFvrJxoW5XbDYiVydr with `path: index.html`. Publish Plate VI as a new artifact. Keep everything Ari didn't mention as it is in Plate V. Apply these answers:
>
> 1. **Glow + label on the idea board.** The glow barely shows on the cork, because cork is close to the glow's colours. Make it read there too, for example a cooler or lighter wash behind the cork, a glow that spills past the board's frame onto the wall, or a stronger label change on the "Ideas" card. Show all six objects while pointing again so Ari can check each one.
> 2. **Evening (dark mode):** brighter than Plate V. The light comes from the top of the page itself, a warm wash falling from the top edge. No drawn pendant or board light.
> 3. **Notebook, dimensional:** the top face of the page block is white, with lines running the long way (along the book's width). The right-side page edge has lines running the long way too (vertical, along the height), not short ticks across it. Everything else on the notebook is close; keep the cloth spine, marbling and cushion label.
> 4. **Depth: dimensional is the choice.** Make the perspective consistent. Plate V mixed two systems: the box and notebook use an oblique offset to the upper right, while the shelf's inner walls use one-point perspective. Pick one rule and apply it to every object: the box, the notebook and its stand, the shelf (inner walls and shelf board), the counter's top surface, the board frame, the cabinet door panels and the plate. Either (a) one-point perspective with a single vanishing point at the centre (x 900, about eye level above the counter), so objects left of centre show their right side and objects right of centre show their left side, and tops show because everything sits below eye level; or (b) a single oblique angle and depth used everywhere, including the shelf. Explain which you chose and check every receding edge against it. Ari said there is a right and a wrong way to make it look dimensional.
> 5. **Open notebook:** much better. Keep it as is (pages only, grey stitches, margins by the spine, corner dates, handwritten page numbers).
> 6. **Jotting:** option B, one list under the bar (jot destinations first, then matching recipes and notebook entries). Drop option A.
> 7. **The notepad sheet on the cabinet:** held up with tape, not a magnet. Probably titled "Recently". Each name links to its page (a recipe card or a notebook entry), so show a link state on point (underline or the same yellow).
> 8. Keep the backsplash off unless Ari asks. The name (Lab, Trials or Trial notes) and the cover (black or white marble) are still open; keep the switches.
>
> Proof locally with Playwright from `frontend/node_modules` (screenshot once, crop to check details), then publish. Then record Ari's answers in the `kitchen-layout` memory, update this file and the session log, and commit on the docs branch (every round). Ask Ari what's next: more plate rounds, the phone layout, or the mark.

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
- **Depth:** dimensional, with one consistent perspective rule
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
