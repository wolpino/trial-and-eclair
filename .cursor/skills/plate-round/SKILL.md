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
per plate. Each round is: **read → ask → draw → build → check → publish → ask → record → commit.**
No app code in a design round.

## How we work (Ari, 2026-11-20, to keep usage down)

- **Ask before drawing.** For anything with a real visual choice, put the options to Ari in chat and wait for a text answer. Plain fixes with no trade-off need no question.
- **No subagents.** Make the edits in the main session. Subagents are only for something really large.
- **Confirm before a bigger run** (build, screenshots, publish). A short or unclear message may have been sent early, so don't treat it as a go-ahead.
- **No pointing movement.** Objects never rise, lift or press. Pointing is a glow or an outline only (memory `no-pointing-movement`).
- **One round per chat.** After a round is published, Ari reviews it in **notes mode** (below), then starts a fresh chat from NEXT.md. A long chat makes every message cost more.

## Notes mode (between rounds)

When Ari says she'll send notes ("collect notes", "I'll dump my comments"):

- Reply to each note in a line or two: what you understood, and any history that bears on it (e.g. "you turned that down in Plate IX"). Ask only when a note really needs it. **Don't draw or build.**
- Notes that are lasting preferences ("remind me I don't like…") go into memory right away.
- When she says **"done"**:
  1. Copy every picture she attached into `design/<plate>/refs/` with a descriptive name (`vN-what-it-shows.webp`). The next chat can't see this chat's images.
  2. In PLAN.md, add "vN notes from Ari" under the plate: each note, the references, and the questions still open from the last round.
  3. Add the notes, with the date, to the `kitchen-layout` memory.
  4. Write a new START HERE prompt in NEXT.md that points at those notes and the refs, and says what to ask Ari first.
  5. Save the last round's screenshots if they're missing, add a session log entry, and commit.
  6. Tell her to start a fresh chat with "Read .cursor/handoffs/NEXT.md and follow the top prompt."

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

- Only draw options Ari asked to see, or that she agreed to in chat first.
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

- End with the questions. Don't start the next version until Ari answers. Her answers usually come as notes mode in the same chat, and the next version gets a fresh chat.
- A plate is done when Ari says so ("signed off"). Then write the sign-off into PLAN.md, the memory and Do not redo, and apply the product change list.
