# Plate XI — read this part first (it overrides the Plate X notes below where they differ)

Plate XI is the FINAL plate: picks only, no options, no A/B/C figures, no questions sections. Every Plate X view is signed off
(Plate X v24). Your job is to carry signed-off drawings over, apply the picks and Details list items you are given, and fit them
into the Plate XI page. Folder: `/Users/ari/codes/trial-and-eclair/design/plate-xi/` (a copy of plate-x; Plate X sources stay in
`../plate-x/sections/` — read them there, copy what you need into your own new file here).

## The page (already built by the director; do not edit these)
- `sections/01-kitchen.html` — the ring: the day kitchen in the middle and empty figures around it, filled BY YOUR SECTION:
  `ring-wb`, `ring-ideas`, `ring-nb`, `ring-box`, `ring-log`, `ring-cb`, `ring-ref`. Each ring figure holds exactly ONE drawing:
  what a single click on that object opens (developer). Open views use `openOver(...)` at the normal view (1200 × 760).
- `sections/02-row.html` — empty figures `row-front`, `row-signin`, `row-signup`, `row-account`, `row-settings`, `row-nf`.
- `03-evening.html`, `04-plans.html` — evening kitchen; the home cook / guest strip.
- `base/xi.js` — `XI_STRIP`: push one item per place where a home cook or guest sees something DIFFERENT
  (read the comment at the top of xi.js). Do not draw cook/guest figures in your own section; they go in the strip only.
  Keep it short: only real differences (e.g. a paid tag + read-only sample, a guest limit, a different menu).
- No Plan switch exists any more. `o.plan` is "dev". Never read a switch; strip items get `o.plan` set for them while drawing.

## Your own section(s)
- A new file per view, `sections/NN-name.html`, holding "More of <view>": the other signed-off states of that view
  (secondary figures from Plate X), each with an h3 and a short `.note`. Its `<section>` must have the id given in your task
  (e.g. `id="more-wb"`), label like `<span class="label">More · Whiteboard</span>`. Drop every option figure, every
  question list, every "A/B" label, and any note text that talks about options, questions or "changed since your notes".
  Notes describe the final design in plain present tense.
- The script in your file also fills your ring/row figure(s) by id (document.getElementById works across sections).
- Prefix every element id with your short name; wrap scripts in an IIFE; register drawing with PLATE.add.
- Build: `node build.cjs` (whole page) or `node build.cjs --only NN` for your file alone (the ring lives in 01, so to see your
  ring tile build the whole page). Screenshot: `node shot.cjs dist/index.html shots/<you> "#ring-wb" "#more-wb" …`.
  LOOK at every PNG and fix problems before reporting. Other agents are working in parallel on other files; if the whole-page
  build shows errors from a file that is not yours, ignore them and use `--only` builds plus your ring screenshot.
- Change only the files you are given. No git. No publishing. Use the sample data in the brief below.

---

# Plate X — shared brief for every agent

You are drawing ONE section of "Kitchen Plate X", a design mock-up page for Trial & Eclair (a recipe
development app; the signed-in home is one drawn kitchen whose objects are the navigation). This is a
design mock, not app code. The owner, Ari, reviews it as a web page.

## Plate X: what is different from Plate IX (read this first)
- Work goes ONE VIEW AT A TIME. Ari reviews your section on its own as soon as you report, and tweaks come back
  to you as follow-up messages. Keep your section tidy so small changes are easy.
- Your Plate IX section is in `../plate-ix/sections/` (same NN-name). Start from it: copy it into `sections/` and
  change it to match YOUR TASK. Do not copy its questions; write new ones.
- The scope for every view is the "1. Plate X" checklist in `/Users/ari/codes/trial-and-eclair/docs/design/PLAN.md`.
  Draw exactly your view's items there, nothing more.
- Every view: a Developer, a Home cook and a Guest version. The Plan switch sets `o.plan` to "dev", "cook" or "guest".
  Draw the guest version only where it differs; otherwise reuse the cook drawing and say so in a note.
- Where the plan says "two ways" or "four ways", draw each option side by side, small, labelled A, B, C, D.
- Build with `node build.cjs --only NN` (no `--frozen`): views now sit over the Plate X kitchen in `kitchen.js`.
- Settled since Plate IX: fridge cream; no sun patch; tape labels in ALL-CAPS marker; ideas have NO statuses (plain
  tacks; an idea moved to a trial is archived and leaves the board); cookbooks are sewn books, not binders; five
  reference kinds incl. Article; sign in says "Sign up", uses a username; "Trial & Eclair" appears as a title only
  on sign in.

## Files (all under /Users/ari/codes/trial-and-eclair/design/plate-x/)
- `base/core.js` — drawing helpers: reg, line, poly, hatch, T (text), arrow, rand, P/block/recess/face/clipTo
  (one-point perspective), hot (glow + label on point), brassLabel, paidTag, grain, PLATE registry. READ IT. Do not edit.
- `base/frame.js` — STAGE, openFrame, openOver(inner, label), pill(). READ IT. Do not edit.
- `base/kitchen-viii.js` — frozen Plate VIII kitchen (scene, notebook, compCover, closedBox, eclair, lk links,
  tapeLabel, `o` options, opts(), mainVP(), svg()). Read what you need. Do not edit.
- `base/views-viii.js` — Plate VIII's open notebook, phone and jot list. Reference for how an open view was drawn.
- `base/style.css` — page CSS (classes: label, note, pair, trio, six, qs, ans, fx, seg). Do not edit.
- `base/example-section.html` — THE PATTERN for your file. Copy its shape.
- `sections/NN-name.html` — YOUR file. The only file you create or change (agent 1 also owns `kitchen.js`).
- Build yours: `node build.cjs --only NN --frozen` → `dist/NN.html` (agent 1: no `--frozen`).
- Screenshot: `node shot.cjs dist/NN.html shots/NN "#your-figure-id" …` (2x PNGs; it prints console errors).

## Rules
1. Change only your own file(s). No git commands. Do not publish artifacts. Do not touch the app (`frontend/`, Python).
2. All code runs in one page with other sections: wrap your script in an IIFE, prefix every element id with
   your short name, and never redefine a global from base/.
3. Register drawing with `PLATE.add(function () { … })` and write into your figures there (it re-runs when the
   Plan switch changes; read `o.plan`, "dev" or "cook").
4. Open views: draw inside STAGE (x 452–1348, y 76–722 of the 300–1500 × 0–760 view) with
   `openOver(yourSvgString, label)`. The find bar and Close come from the frame. Don't redraw them.
5. Size: keep your section file under about 30 KB. Build repeated things with loops.
6. Proof it: build, screenshot each figure, LOOK at the PNGs (Read tool), and fix what's wrong: overlapping or
   clipped text, text running off its paper, things floating with nothing holding them, console errors.
   Zoom by screenshotting a single figure. Repeat until clean. Two or three passes is normal.

## The plate style (keep it consistent)
- Printed cookbook plate: black ink line (var(--ink)), flat colour, hatching for shadow (hatch()), halftone only for
  glow/sun. Colour always sits exactly inside its ink line. No gradients, no drop-shadow filters, no emoji.
- Colours: only the CSS variables in style.css (--blue cobalt, --wood walnut, --plaster sage white, --cab stem green,
  --orange, --amber, --yellow, --stem, --cork, --brass, --card, --page, --custard, --ink, --ink-soft). Orange is for
  fills; text is ink (or --orange-text).
- Fonts: handwriting = var(--font-hand) (anything written by the cook: notes, cards, whiteboard). UI words (buttons,
  small captions) = var(--font-body). Printed labels = var(--font-label). Headings on the web page = h3.
- Real things: paper is taped, pinned or clipped to something; tape lies flat, half on the paper and half on the
  surface, slightly see-through; nothing floats. Labels are always visible (never hover-only).
- Clickable things: pointing shows the glow + yellow label (hot()). Links in handwriting: lk() (yellow + underline).
- Each object opens straight into its tool, ready to use, with no second click.
- Depth: if you draw anything in depth, use P()/block()/recess() so edges run to the one vanishing point
  (x 900, y 230). Flat paper lying on the screen (cards, pages, sheets) needs no perspective.
- Day only for open views. Only the kitchen agent draws evening.
- No real brand names or logos.

## People and plans
- Developer (paid): everything. Home cook (free): recipe box, whiteboard, references. The notebook, idea board and
  cookbooks are paid: a home cook (and a guest) can open them read-only with sample data and a "paid plan" label.
  Nothing is hidden and nothing moves between plans.
- Sample data to reuse so views agree: recipes Blondies, Croissants (trial 4, 11/11/26), Rhubarb galette, Rough puff
  pastry, Brown butter cookies; ideas "Miso caramel", "Cardamom knots", "Yuzu curd tart"; cookbook "Weekend Bakes";
  references: a cookbook she owns, a blog, a pastry chef, a tool. Dates like 11/11/26. Cook's name: none shown.

## Words on the page
- Each figure gets an h3 and/or a `.note` with a bold lead-in. Plain, short sentences. Say what it shows and how it
  is used. No jargon, no "leverage", no long dashes.
- End your section with `<ol class="qs">`: at most 4 short questions Ari must answer about your view.

## Your report back (your final message)
- What you drew (one line per figure id).
- The screenshot paths you checked.
- Anything you are unsure about or could not make look right.
Keep it short. Do not paste code.
