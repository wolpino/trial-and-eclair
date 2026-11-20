---
name: plate-round
description: >-
  How to run one design round on a Trial & Eclair plate page (Kitchen Plates,
  Phone Plate, Mark Plate, Brand Sheet, Plate XII and later): pick up from the
  handoff, draw options as linked figures, ask questions at the page top,
  build, screenshot, republish to the same artifact URL, record Ari's answers,
  and commit. Use when Ari gives notes on a plate, says "next version", "v10",
  "draw options for", answers plate questions, or starts a new plate.
---

# Plate round

Design work lives in `design/<plate>/` and is published as one artifact page
per plate. Each round is: **read → draw → build → check → publish → ask → record → commit.**
No app code in a design round.

## 1. Read before drawing

1. `.cursor/handoffs/NEXT.md`: the section marked **START HERE** is the brief for this round.
2. `.cursor/session_log.mdc`, top 3 entries: honor **Do not redo** (signed-off plates and views get tweaks only, never a redraw).
3. `docs/design/PLAN.md`: "The rule for new ideas", the current plate's section, "Product changes from the plates", the Later list.
4. The `kitchen-layout` memory, for Ari's decisions so far.
5. For drawing rules (colours, ink, perspective, traced SVG), load the `kitchen-plate-style` skill.

Ari's notes in chat are the scope. A new idea of yours goes on the PLAN.md Later list unless Ari says "this round".

## 2. Plate folder layout

New plates are copied from the previous plate, not started from scratch:

```
design/<plate>/
  BRIEF.md            what this plate is for (optional for small plates)
  base/               core.js, style.css, header.html, mark.js, <plate>.css
  kitchen-*.js        drawing code
  sections/00-questions.html, 01-*.html, ...   one file per section, joined in name order
  build.cjs           base + sections -> dist/index.html
  shot.cjs            Playwright screenshots (2x), prints console errors
  shots/vN/           screenshots for each version
  dist/               built page (published file)
```

## 3. Draw

- Draw choices as **named options** (A/B/C, E1–E5, L1–L3, P1–P3) so Ari can answer with a letter. Put your pick first and say why in one line.
- Option toggles go in page controls, and close-ups go next to the full view (see Plate XII `traced/closeups.html`).
- Change only what the notes asked for. Keep a signed-off thing exactly as it was.
- Earlier versions Ari wants to keep stay lower on the page "for reference". Don't delete them unasked.

## 4. Questions at the page top

Rewrite `sections/00-questions.html` every round:

- List only the open questions, in page order. Each one links to its figure (`<a href="#fig-id">`). Ari can't find figures by name on a long page.
- After each question: `<span class="pick">Claude's pick: X.</span>` and one line of why.
- Below it, a "Decided (Ari, MM/DD): ..." note that lists what is settled, so nobody asks again.
- Label it with the version: `00 · Questions (vN)`.

In chat, ask the same questions in the same order with the same names, all at once.

## 5. Build, check, publish

```bash
cd design/<plate>
node build.cjs                                   # any traced/*.cjs steps first, if the plate has them
tail -n +2 dist/index.html | sed '$d' > dist/<plate>.html
node shot.cjs dist/index.html shots/vN "#sec-id" "#fig-id"
```

- Look at the screenshots yourself before publishing. Check for console errors, overlaps, text over art, and that the options toggle.
- Publish `dist/<plate>.html` with the Artifact tool to the plate's **existing URL**. One plate keeps one link; the link is in NEXT.md and the session log. A new plate gets a new artifact.
- Watch the page size (masks and traced SVGs make it bigger). Say so if it goes well over ~1.5 MB.

## 6. Record Ari's answers

When Ari answers (this round or the next):

- `kitchen-layout` memory: the decisions, with the date.
- `docs/design/PLAN.md`: tick the plate section. Product changes (new views, renamed things, features like the click-to-eat eclair) go on **"Product changes from the plates"**, not into the PRD. The PRD, README and Task issues are updated in one pass at sign-off.
- `00-questions.html`: answered questions move into the "Decided" note.
- When something is signed off, add it to **Do not redo**.

## 7. Hand off and commit, every round

1. `.cursor/handoffs/NEXT.md`: retitle the header (`# NEXT — date (Plate X vN published: ...; waiting on Ari)`). Add a new **START HERE** prompt at the top with the URL, how to build, the options still in the code, the questions and their picks, and what to do after the answers. Mark the old prompt "— done (vN)".
2. A session log entry using the `session-log` skill (Intent, Summary, Decisions, Open threads, Do not redo, Resume with).
3. Commit on the current docs branch: `design: Plate XII vN, <what changed>`, including `shots/vN/`. Push or open a PR only when Ari asks.

## Ending the round

- End with the questions. Don't start the next version until Ari answers.
- A plate is done when Ari says so ("signed off"). Then write the sign-off into PLAN.md, the memory and Do not redo, and apply the product change list.
