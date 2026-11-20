---
name: kitchen-plate-style
description: >-
  Drawing rules for Trial & Eclair art: the printed cookbook plate look,
  colour tokens and what cooks can recolour, ink and layering, one-point
  perspective, pointing (glow), evening, and the Plate XII traced-kitchen
  tooling (clean.cjs ink masks, add.cjs options). Use when drawing or changing
  anything in design/ (kitchen, objects, marks, icons, phone views), or when
  building kitchen art or theme tokens in frontend/.
---

# Kitchen plate style

Settled by Ari from 2026-11-08 to 11-19 (Brand Sheet v4, Plate XI, Plate XII).
Don't reopen these unless Ari brings them up. Newer decisions are in the `kitchen-layout` memory and `docs/design/PLAN.md`.

## The look

- **Printed cookbook plate**: ink line plate, flat colour, paper grain. Halftone dots for sunlight and hatching for shadow, used lightly.
- **Colour sits under the ink line** for solid things, always in register. No off-register drift and no hover snap (dropped 11-11).
- **Draw back to front**: back wall, contents, then the front panel. Cards go inside the recipe box, never on top of it.
- Not busy. Ari dislikes badges, colour off register, and crowded drawings. Labels are off on the phone.

## Colours (`base/style.css` tokens)

| Token | Value | Use |
|---|---|---|
| `--blue` | `#3F5F9D` (Blue 3) | recipe box = brand colour = app icon ground. **Fixed**, never recoloured |
| `--wood` | `#9A6234` walnut | counter, shelves, window frame (Plate XII) |
| `--cab` | `#5E8C3A` stem green | cabinets (recolourable) |
| `--plaster` | `#EEF0DF` sage white | wall (recolourable) |
| `--paper` / `--card` | `#FBF4E4` / `#FFFBF2` | page and cards |
| `--ink` | `#1F1D1A` | lines and text |
| accents | orange `#E8742A`, amber `#F5A23A`, yellow `#F2C230`, cinnamon `#8A4F2A`, cork `#D9A868`, brass `#D4A94F` | |

- Make shades with `color-mix()` from the token (`--cab-hi`, `--cab-deep`, `--blue-back` ...), never as new hex values, so recolouring carries through.
- **Cooks recolour** the cabinets, wall and backsplash (and the fridge where there is one) from swatches in the scheme or a custom wheel. Text on a colour the cook picked uses an automatic ink-or-cream choice.
- **Orange fails AA as text on cream**: use orange for fills and `--orange-text` / ink for text.

## Type

Young Serif (`--font-display`) for titles, an Apple-first old-style stack (`--font-body`), Caveat (`--font-hand`) only for what the cook writes, and Archivo Narrow (`--font-label`) for tape labels in all-caps marker. Cookbook pages are typeset, not handwritten.

## Perspective

- **One-point perspective**: every receding edge runs to one vanishing point.
  - Plates VI–XI: `VPX 900, VPY 230` in `base/core.js`. `P(x, y, d)` moves a front point back by depth `d`.
  - Plate XII (traced, 868 × 489 units): `VP (434, 240)`, `F 900`. `proj(X, Y, Z)` in `traced/add.cjs`. The open cupboard door is hinged at x 132.7.
- New objects must use the plate's own VP. Check with construction lines when unsure.

## Pointing and motion

- **Glow only**: a soft warm glow on hover, focus or `.on` (`.hot .fx-glow`), plus gentle movement, no jump. The amber dots are out. Labels never move or hide.
- Respect `prefers-reduced-motion` (no transitions).
- Every clickable object becomes a real button or link over the art in the build.
- Eclair easter egg: whole on load, a bite per click, gone on the third, back on reload.

## Evening and light

- Evening = dark mode. It's the kitchen only: a warm multiply wash from the top edge, not too dark at the bottom. In Plate XII it's `.dusk` on `#tk` plus a dim layer.
- Plate XII window: rainbow beams from a crystal mobile follow the time of day (am / noon / pm / eve) and will follow the cook's clock in the app.

## Plate XII traced kitchen (`design/plate-xii/traced/`)

The kitchen is Ari's vector trace of a Kittl study (`source.svg`, 1365 unnamed paths). Don't redraw it; change it through the scripts.

- **`clean.cjs`** → `kitchen.svg` + `report.json`.
  - Sorts each shape into an object by its box (`OBJ`, first match wins, so put smaller things first).
  - Fixes stray shapes with `MOVE_TO` rules and deletes scribbles where the app will write (`SCRIB`).
  - Recolours the box to Blue 3 shades and the cabinets and wall to `--cab` / `--wall`.
  - The outlines are **not strokes**: they are a few huge dark underlay shapes. Each object takes the ink under its own shapes, grown by `INK_GROW`, through an SVG mask. The room keeps the rest, cut a bit smaller so the pieces overlap with no seam. Never split ink by subpaths.
- **`add.cjs`** holds the new pieces (eclair, sill glass, mobile and beams, composition books, clipboard, box wear and label, marker, open cupboard).
  - Options are `V("key-value", svg)` → `<g data-var="...">`, and `DEF` sets which ones show.
  - Pieces with `top: true` are drawn outside `#a-scene`, so close-ups show them over a clean scene.
  - When Ari picks, set `DEF` to the pick and delete the options that lost.
- Frame shades follow `--trim` through the `TRIM` table (walnut).
- New pieces may be cleaner than the trace, but they keep its palette, its ink colour `#0D0C0B`, and its VP.

## When drawing anything new

1. Use tokens, not hex, for anything a cook might recolour.
2. Keep the plate's VP and draw back to front.
3. Check it at real size, and at 32 and 16 px for marks and icons, on paper and on blue.
4. Screenshot day and evening before publishing.
