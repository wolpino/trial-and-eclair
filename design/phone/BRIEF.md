# Phone Plate — brief for every agent

You are drawing ONE section of the "Phone Plate" for Trial & Eclair (a recipe development app; the signed-in home is
one drawn kitchen whose objects are the navigation). Design mock only, not app code. The owner, Ari, reviews it as a
web page. The wide kitchen and every wide view are SIGNED OFF in Plate XI (`../plate-xi/`). Your job: the same
design fitted to a phone. Keep the signed-off look (ink line, flat colour, halftone hatching, hand font, tape labels,
cream fridge, composition-book notebook, wooden recipe box). Do not invent new features.

## Folder: /Users/ari/codes/trial-and-eclair/design/phone/
- `base/phone.js` — READ IT. `phone(inner, label, opt)` draws one phone (390 × 844 upright, or `{land:true}` 844 × 390)
  and clips your drawing to the screen. Safe area y 54–810, side gutter 16. `phTop(title)` is the top bar of a view
  that takes over the screen ("‹ Kitchen" back + title). `phJot()` is the yellow jot button bottom right.
  `phAddr("/whiteboard")` gives the web address line to put under a figure. Page CSS classes: `.phones` (a grid of
  upright phones), `.land` (a grid of sideways ones). Do not edit phone.js.
- `base/core.js`, `kitchen.js`, `base/frame.js` — the Plate XI drawing helpers and kitchen. Every function is a global
  (reg, line, poly, hatch, T, arrow, block, P, hot, paidTag, tapeLabel, notebook, compCover, closedBox, eclair, fridge,
  scene, svg, opts…). Reuse them: draw kitchen objects with them inside `<g transform="translate(..) scale(..)">` rather
  than redrawing. Do not edit them.
- `../plate-xi/sections/NN-*.html` — the signed-off wide views. Your view's wide drawing is there: carry its content,
  data and wording over; change only the layout for the phone.
- `base/example-section.html` shows the section pattern (ignore its openOver; you use `phone()`).

## Phone rules (decided; do not re-ask)
- Upright phone. Tapping a kitchen object takes over the whole screen (decision 004). No rotate prompt.
- Back: "‹ Kitchen" top left and the phone's own Back both return to the kitchen; moving inside a view (next card,
  next trial) does not add Back steps (decision 005). Put the web address under each figure with `phAddr`.
- The find-or-jot bar sits at the top of the KITCHEN only. The jot button (yellow, bottom right) shows on the kitchen
  and on views where it covers nothing.
- The recipe box view has no header and its own small "+" (decision 003: `/Users/ari/codes/trial-and-eclair/docs/decisions/003-phone-recipe-box-design.md`).
- Open views use the day look. Evening is the kitchen only.
- Paid things (notebook, cork ideas, cookbooks) keep the "paid plan" tag for home cooks; draw for a developer unless told.
- Tap targets at least 44 × 44. Body text at least 15 px; nothing under 13 px. No text running off its paper.

## Your section
- Create only the file(s) named in your task: `sections/NN-name.html`, with `<section id="…">` and
  `<span class="label">NN · Name</span>`, figures in `<div class="phones">` (or `.land`), each figure with an h3 above,
  a `phAddr` under it, and a short `.note` in plain present tense.
- Where your task says "two ways", draw A and B side by side and add `<ol class="qs">` with ONE short question.
  Give each option figure an id so the director can link to it.
- Prefix every id with your short name; wrap the script in an IIFE; register drawing with `PLATE.add(function(){…})`.
- Keep the file under about 30 KB. Build repeated things with loops.
- Build: `node build.cjs --only NN` → `dist/NN.html`. Screenshot: `node shot.cjs dist/NN.html shots/NN "#fig-id" …`.
  LOOK at every PNG (Read tool) and fix overlaps, clipped text, tiny text, floating objects, console errors.
- No git. No publishing. Don't touch other files. Report: what you drew, each figure id, and anything you assumed.
