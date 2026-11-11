# NEXT — 2026-11-11 (kitchen layout, round 10)

## Goal
Finish the kitchen-as-navigation layout with plain block sketches, then draw it in the plate style. The kitchen is the site's navigation, so every object either opens something or makes a small move.

## Map
```
style ✅ → colours ✅ → kitchen layout ⏳ (round 10: confirm, then plate style) → mark (parked) → brand sheet → Task issues → build
```

## Prompt for the next agent
> Kitchen layout, round 10. Read `.cursor/handoffs/NEXT.md` and the `kitchen-layout` memory first. The block layout is nearly settled (see "The layout now" below).
>
> 1. Draw one plain-block page that shows the whole settled layout in one place: the developer kitchen and the home cook kitchen at a normal width, plus one very wide screen. Then draw the open recipe box with the new tabs. Three rows: A–I in front, J–Q in the middle, R–Z at the back. R–Z sits straight behind A–I (same x positions), and the eight J–Q tabs are centred between them. Nine tabs for R–Z, no shared XYZ tab. Every tab stands on its own divider's top line. Show a short-recipe lid and a lid at the limit.
> 2. Ask Ari whether the layout is final. If yes, ask whether to start the plate-style drawing of the kitchen or go back to the mark.
>
> Start from the round 9 source (`Artifact` read, `path: index.html`): it has the block helpers, `scene()` with a movable board (`BY`), `labTall()`, the eclair `decor()` and the resizable `openBox()`. Proof locally with Playwright from `frontend/node_modules` (screenshot once), then publish. Plain blocks only; the recipe box is the one closer drawing. No code changes.

## The layout now
- **Wall:** one board in the middle: whiteboard on the left ("next up", pinned plus automatic, marker font), cork ideas on the right. Lowered to just above the recipe box, with a small gap (round 9 A). The wall above the board stays plain, which leaves room for anniversary equipment or a shelf later. No window, no oven, no title or name
- **Counter, middle:** the Lab notebook on a cookbook stand on the whiteboard's side, tall enough to overlap the board's bottom edge. A half-eaten eclair on a plate in the middle (seasonal flowers maybe later). The recipe box on the cork's side. All three sit close together
- **Side rule:** the Lab is always on the whiteboard's side and the box on the cork's side. The Lab need not be right under the whiteboard
- **Under the counter:** two-tier open shelf (cookbooks above, references below), one drawn book per real one, a cabinet each side. It starts short with one book lying down per tier, and the cabinets narrow as it fills
- **Width:** the normal "standing in the kitchen" view at every width. On very wide screens only the cabinets and counter keep going; everything else keeps its size and stays centred. No plate border
- **Top:** find-or-jot bar centred at the top, Account top right. Phone: stacked layout, jot button bottom right
- **Recipe box closed:** "Recipes" in a brass label holder. Click opens it to fill most of the screen over the dimmed kitchen
- **Recipe box open:** the card rests on a ledge in the lid; the lid is empty until a card is picked. The box body is short, sized for three tab rows. The lid grows with the recipe up to a limit (round 8, a bit over half the screen), then the card scrolls. Later: a full-screen card view
- **Tabs:** A–I front, J–Q middle, R–Z back; R–Z lined up with A–I, J–Q centred between (not drawn yet)
- **Roles:** one kitchen for everyone; nothing hidden, nothing moves on upgrade. Paid things (Lab, cork ideas, cookbooks tier) carry a "paid plan" label and open read-only with sample data for cooks and guests. Cooks get the box, whiteboard and references. Guests: decision 002 as it is (starter recipes, up to 5 cards of their own)
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
