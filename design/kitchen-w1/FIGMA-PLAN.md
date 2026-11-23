# Wave 1 kitchen: Figma plan

The live plan for finishing the Wave 1 drawing in Figma. **Update this file after every step** (status, what changed, what Ari decided), and commit it with the step. REFERENCE.md stays the truth for looks and behaviour; this file is only the plan and its progress.

## Status

| Step | What | Status |
|---|---|---|
| 1 | Sort fragments into object layers | ✅ done (Figma agent; checked 2026-11-22 from export `trace 1(1).svg`) |
| 2 | Cut shared outlines, one per object | ✅ done (same check) |
| 3 | Finish the underlying artwork | 🔶 all 7 items drawn (2026-11-22); **Ari to review in Figma and export** |
| 4 | Separate controllable artwork (eclairs, bites, glass, crystals) | ⏳ |
| 5 | Sunbeams, plus evening under-cupboard light | ⏳ |
| 6 | Rainbows (wall only) | ⏳ |
| 7 | Golden hour overlay | ⏳ |
| 8 | Final checks and SVG export | ⏳ |

Who: Claude in Claude Code, through the Figma connector (`use_figma`), working in Ari's file: https://www.figma.com/design/rLs6mufI8lyTcrEvitPSMx/kitchen (file key `rLs6mufI8lyTcrEvitPSMx`). The Figma agent's original plan is replaced by this one.

## Rules for every step

- Stop for Ari's approval before each step and after it. Don't start the next step on your own.
- Canvas stays 868 × 485. Don't move or resize existing artwork unless the step says so.
- Keep layer names; new names have no em dashes (`glass`, `sunbeam-am`, `eclair 3 bite 1`).
- Flat vector shapes and transparency only: no images, blurs or filters.
- Ask when ownership, shape or meaning is unclear.

## Token-light workflow

The aim is that almost nothing big ever enters the chat: edits go out as small scripts, checks come back as a few numbers, and pictures are only looked at as small crops.

**Once per session**
1. Ari gives the Figma file link (file key + the kitchen frame's node id).
2. Claude loads the `figma-use` skill once and starts one Figma session (`create_session`).
3. One small script lists only the 18 object layers with their node ids and bounding boxes (about 1 KB back). This is saved to `scratchpad` so it is not asked for again.

**Layer ids** (stable; the drawing is the group `1:2`, the scene `1:5`): wall `1:6`, counter `1:16`, cabinets `1:71`, cupboard `1:179`, library `1:361`, clipboard `1:552`, ideas `1:589`, whiteboard `1:732`, rack `1:789`, notebook `1:821`, journals `1:877`, box `1:984`, mixer `1:1071`, eclair 1–3 `1:1134` `1:1152` `1:1169`, window `1:1182`, crystal `1:1297`.

**Per step**
1. **Make a rollback point.** The connector can't save a named version (`saveVersionHistoryAsync` is not supported), so the script copies the drawing to its own page, `backup before step N`. Ari can also save a named version by hand (⌥⌘S).
2. **One edit script per object** (`use_figma`): it makes the change and returns a short JSON summary (what was added, removed, renamed, and the object's new box). No node dumps.
3. **Look at that object only**: `get_screenshot` of that one node, saved to disk with curl (not embedded in the chat), then Claude views a small crop. Skip the picture for purely structural changes (renames, regrouping).
4. **Repeat** for the next object.
5. **Whole-scene check at the end of the step**: one full-frame screenshot saved to disk, pixel-diffed locally against the last approved export. Claude only looks at the diff picture if something changed outside the step's objects.
6. **Update this file** (status, notes, decisions) and commit.
7. **Ari reviews in Figma itself**, then exports the SVG with "Include id attribute" on and drops it in `~/Downloads`. Claude checks it locally with a script (layer tree, positions, hidden-object views). Only the result numbers and one or two crops come into the chat.

**Bringing back v17 parts** (the v17 drawing lines up with Wave 1): a local script cuts the paths out of `design/plate-xii/traced/kitchen.svg`, moves them to Wave 1 coordinates and recolours them; the snippet is pasted with `figma.createNodeFromSvg`. Keep snippets small (one object per call).

**Checks that worked (2026-11-22):** hide one layer, screenshot the whole drawing at 1×, pixel-diff locally against the starting picture. "Changed pixels: 0" proves a clean-up didn't change the normal view. Take the screenshot in its own call after the edit returns; when it runs alongside the edit it can show the old state.

**Size check:** before each step, confirm `1:2` is 868 × 484.5 at 0, 0. To undo a stretch, use `rescale` then `resize`, then put line widths and font sizes back (rescale scales them; a drag doesn't), and diff.

**Connector quirks:** `figma.flatten()` or `union()` on clones sometimes drops the result at the drawing's top-left corner; always return the new box and move it back if it's wrong. A boolean result takes the fill of a helper rectangle, so set its fill again.

**Never use** (each costs tens of thousands of tokens): `get_design_context`, `get_metadata` on the whole frame, exporting SVG through the connector, or embedding full-size screenshots.

## Step 3: Ari's change list (2026-11-22)

1. **Defects from the step 3 check**
   - The counter-brown patch in `wall` under the window (`counter and cabinets … / wall`): make it wall colour.
   - Fill the counter under the box, notebook and mixer (it currently stops at their outlines).
   - Delete the outline slivers left on the wall (box left edge, mixer right edge, library right edge, window frame top).
   - Rename `existing wall fill — hidden surfaces pending` to `wall fill`.
2. **Rack**: too dark under the eclairs. Go back to the lighter 2026-11-21 rack with its soft shadow; under the eclairs add thin, light wires in the same style. Show full and empty.
3. **Labels**: re-letter cleanly in v17's italic style, on Wave 1's label colours.
   - Jars, by v17's order: top shelf Flour, Sugar, (small jar unlabelled), Cocoa (cut off by the door); bottom shelf Oats, Pecans, Salt.
   - "Trial".
   - Also "Kitchen log", "Ideas", "Next up", "RECIPES", "THE LIBRARY".
4. **More detail**
   - Open notebook page: bring back v17's eclair doodle, arrow and written lines.
   - Cork-board photos: v17 has no more detail than now, so add details by hand from the reference pictures (chocolate chips, macaron fillings, cream-puff layers). If they don't look right, Ari re-traces the four photos.
5. **Bottles**: bring back v17's cut-glass decanter and amber bottle (cork, handle), with dark-colour outlines instead of v17's black. Keep the Wave 1 blue bottle.
6. **Open cupboard door**: the darker green block over the door's right half and the green bump above the clipboard aren't the sunbeam. Make the door one green with a thin shadow at the hinge edge; remove the bump. No nail and string.
   - Move the clipboard up so it sits inside the door (so the door could close). Small job if the door is complete behind it; if not, fill that spot with door green.
7. **Notebook**: bring back v17's spiral in place of the thick black middle; thin the outer edges to match other objects.

Checkpoint: Ari reviews in Figma and exports; Claude checks the export; Ari approves before step 4.

### Step 3 progress (2026-11-22)

Rollback: page `backup before step 3` in the Figma file holds the drawing as it was.

**1. Defects: done.** The normal view is unchanged (pixel diff against the starting picture: 4 pixels at the box's left edge).
- `1:9` (the brown patch, only seen when the window is hidden) is now wall colour, renamed `wall patch under window`. The grey under the window sill that stays is the window's own shading (`1:1183`, in `window`). It hides with the window, and step 5 deals with it.
- New `counter top fill` (`#c4905e`, full width, y 338–394) just above the counter base, so the counter is whole under every object.
- `existing wall fill …` renamed `wall fill`.
- Slivers. The four shared-outline paths were checked one by one by hiding each and diffing:
  - window frame top (`1:14`) drew nothing visible, so it's deleted.
  - mixer right edge (`1:10`): trimmed to the mixer's area minus the sunbeam, and moved to the back of `mixer`.
  - box left edge and lid (`1:67`, `1:12`): the box parts moved to the back of `box`; the counter back-edge parts stayed where they were.
  - The library right edge needed no separate fix: with every object hidden, no sliver is left there.
- Also: the notebook's red ribbon (`1:37`, `1:38`) moved from `counter` to `notebook`.
- **Object shadows moved into their objects** (Ari: yes, 2026-11-22). Each sits at the back of its group: `box shadow` (with the box's highlight patches and the far-left piece of the back edge), `journals shadow`, `mixer shadow`, `rack shadow`. The ribbon's outline was cut out of the counter's front edge line into `notebook`. The notebook leaves no shadow of its own on the counter. The normal view is unchanged (pixel diff 0).
- With every object hidden, the counter keeps only its own colours. That includes the light patch from the journals across to the window (`counter light …`), which may be sun on the counter (step 5). The front edge line has a 24 px gap where the ribbon crosses it, the same as before.

**2. Rack: done (Ari approved after the wire colour change).**
- The dense dark-brown wire mesh (`1:790`, now `rack wires`) is restyled as thin wires, 0.4 px. They now use the colour of the rack's outer edge and legs (`#ae8f75`, full opacity), as Ari asked on 2026-11-22; a first try with light `#d7cab4` was too pale. `1:32` is the edge and legs, renamed from the wrong `rack shadow` to `rack edge and legs`.
- Each eclair group has a new soft shadow at its back (`eclair 1 shadow`, …): a flat copy of the eclair's outline shape in `#55311d` at 32%, moved 3 px down-left. Taking an eclair takes its shadow, and the empty rack shows only wires.

**3. Labels: done (Ari: fine).**
- The rough traced lettering was replaced with real text layers, each named `label <word>` and placed where the old lettering was in its group. The backup page keeps the old lettering.
- Fonts are v17's: Caveat Bold for the handwritten labels (Kitchen log, Ideas, Next up, Trial, the jars) and Archivo Narrow Bold for THE LIBRARY and RECIPES. Each label keeps its Wave 1 ink colour, angle and width; the letter spacing was fitted to the old width.
- Jars (in `jar labels`): Flour, Sugar, Cocoa (cut off by the door) on the top shelf; Oats, Pecans, Salt on the bottom. The small jar has no label.
- Nothing outside the label areas changed (pixel diff 0).
- The swoosh underlines under "Ideas" and "Next up" went with the traced lettering. Ari asked for them back, so they're redrawn as clean curved strokes in each label's ink, with round ends: `underline Ideas` 1.4 px, `underline Next up` 1.6 px.
- Text stays editable for now; step 8 turns it into outlines.

**5. Bottles: done (redrawn from Ari's original window design, not v17).** Ari 2026-11-22: blue bottle under the lowest crystal, amber bottle to its right.
- Three groups in `window`: `bottle green` (fluted decanter with faceted stopper and collar, x 717–746), `bottle blue` (ball stopper, x 795.5–810.5, centred under crystal 4), `bottle amber` (square bottle with cork, x 812–838). Each has dark-colour outlines (`#23402a`, `#1c2a55`, `#5a3712`), flat fills, lit streaks, a soft glow and a flat shadow on the sill. Flat shapes only.
- The old bottles were cut into the window drawing, so removing them left holes. `window patch behind bottles and mobile` fills them with flat rectangles in the exact colours of the glass, rail and sill around them, read row by row from the picture. It also fills the crossbar gap behind the mobile, and adds glass strips where old crystal pieces used to paint over the window post.
- The coloured light on the sill from Ari's picture belongs with step 6.

**Crystal mobile: redrawn too (Ari asked, 2026-11-22).** The `crystal` group keeps its id (`1:1297`) and now has the step 4 structure:
- `hook and threads`: hook, hoop and threads
- `crystal 1` (top, under the hoop), `crystal 2` (left), `crystal 3` (right) and `crystal 4` (bottom, centre, x ≈ 803). Each is a double-pointed hexagonal crystal with two shaded faces, a sparkle line and an outline.
- The layout follows the original: threads from the hook to the hoop, the top crystal hanging from the hoop's centre, the bottom crystal hanging below it, and the side crystals hanging from the hoop's sides.

Nothing outside the window changed (pixel diff 0).

Rollback for items 4, 6, 7: page `backup before step 3 items 4-7` (drawing copy `48:3`). Size check before starting: `1:2` was 868 × 484.5 at 0, 0.

**4. More detail: done.**
- Notebook page (`page writing` in `notebook`, under the pencil): v17's eclair doodle (capsule outline with a wavy glaze), an arrow, a short note and two written lines, as thin round-ended strokes in `#9a8f84` / `#beac92`. The rough scribbles (`1:860`–`1:867`) are deleted; the backup page keeps them.
- Cork-board photos (`photo details` at the top of `ideas`, one sub-group per photo): chocolate chips on the cookies; a cream filling along the lower rim of each macaron; a piped cream layer and sugar dots on the cream puff; sugar flecks and cream between the choux on the fourth photo. Drawn by hand: v17 had no more detail. If they don't look right, Ari re-traces the photos.

**6. Open cupboard door: done.**
- The darker block over the door's right half (`1:326`, `1:332`) is door green now, renamed `door right half` and `door hinge edge`. New `door hinge shadow`: a thin strip in `#53783d` (x 125.6–129.2) at the hinge edge.
- Both green bumps are deleted: `1:327` (in `cupboard`) and `1:554` (in `clipboard`, above the clip).
- The door wasn't complete behind the clipboard (a hole showed the dark underlay), so `door behind clipboard` fills it with door green.
- `clipboard` moved up 10 px (y 22.3 → 12.3) and now sits inside the door.

**7. Notebook: done, except the bottom edge.**
- `spiral` (in `notebook`, above the old gutter shapes): a page-coloured band over the thick black gutter, a thin dark crease, 11 coils in `#2b2622` with a light shine. The old gutter shapes stay underneath.
- `cover edge thinning`: the left cover was about 6 px of black. The page now covers its inner part (`page over left cover`), and below the corner the page-stack grey does the same (`page edges over left cover`). About 1.75 px of black is left, measured from a 4× picture.
- The bottom cover edge is still thick (3–5 px). A first try with page-stack grey came out as a stepped strip and was removed. **Open for Ari:** thin it, and how.

Whole-scene pixel diff against the backup copy: changes only in the door and clipboard, the photos and the notebook (0 pixels elsewhere).

**Fixes after Ari's look (2026-11-22).** Notebook: fine as it is (bottom edge stays).
- Door: the panel's inner outline stopped where the old hole began, so a seam showed under the clipboard. `door behind clipboard` now covers the seam, and `door panel outline behind clipboard` (`#3d4f2e`, 0.9 px) carries the panel line on to a right-hand edge at x 119.5 that mirrors the left side.
- Window, measured with the mobile hidden:
  - `glass upper right clean` (x 794.05–849.4, y 86.35–164.2) covers the old crystal-thread staircase of glass patches and a sliver of frame art in the upper-right pane.
  - `glass lower right fix` covers the brown drip under the crossbar, right of the centre post.
  - `glass lower left edge fix` lines up the lower-left pane's left edge above the green bottle with the rest of the pane.
  - `frame gap fill top` closes a hairline gap in the top frame.
- Whole-scene diff: changes only in the door and window.
- Rack: the wires `#ae8f75` had almost the same lightness as the counter `#c4905e` (149 against 154), and the eclairs had no dark outline (v17 had one), so the rack read as too light overall; the shadows weren't the problem. Ari chose both fixes: `rack wires` are now `#86634a` at 0.45 px, and each eclair group has an `eclair N outline` at the top: a copy of its `pastry — continuous trace` shape with no fill and a 0.9 px `#2e1a0e` stroke. The outline goes with its eclair. Then Ari said yes to the edge and legs too: `rack edge and legs` (`1:32`) is now `#86634a`, the same as the wires. Diff: only the rack changed.

**Books, eclairs and rack pass (2026-11-22).** The decision: Claude does a first pass, then Ari adds what's left.
- Library and journals: no clear defects found at 3–4×. The green "fragment" is the green book's rounded spine, and the yellow "tab" is a spine label. Taste questions for Ari: the dark lumpy spine marks (v17 has them too), the faint spine bands (v17's are clearer), and no titles on the spines.
- Eclairs: the eclair art had holes (where the old dark underlay used to show) and slits, so the first outline curled into the glaze. Each eclair now has:
  - `eclair N base`: a closed silhouette in glaze `#55311d`, at the back of the group, which fills the holes.
  - `eclair N outline`: the same silhouette with a 0.9 px `#2e1a0e` stroke, on top.
  - `eclair N shadow`: rebuilt from the same silhouette, 3 px down-left, at 32% as before.

  Each silhouette is a smoothed convex hull of the eclair's own parts, measured from an 8× render.
- Pieces that weren't eclair:
  - `1:1149`–`1:1151` (in `eclair 1`) and `1:1166`, `1:1168` (in `eclair 2`) were rack or counter bits on the back rail and the mesh. All are deleted.
  - 18 small leftover patches in `rack` (`1:792`–`1:799`, `1:811`–`1:820`), from the old eclair bottoms, sat above the wires and blotted out the mesh along the front and at the right end. They're deleted too.
- `rack handle` (`1:791`) is now `#86634a` instead of cream, like the edge.
- Whole-scene diff: changes only in the rack area (x 696–831).
- Taste notes: eclair 1 has a tan streak across its glaze (original art); the light patches under the front rail are the counter's, and they're kept.

**Books (2026-11-22).** A full redraw was tried first, and Ari didn't like it. It was undone: the `books (redrawn)` group and its patches were deleted, and the three removed pieces were restored from the page `backup before books pass` (the scene matched the earlier picture exactly). Then only the spots Ari circled were fixed, on the traced art:
- Dark "title" marks in odd places, deleted: `1:369`, `1:370` (yellow, top shelf), `1:398` (green, top shelf), `1:471` (green, bottom shelf), `1:481`, `1:482` (yellow, bottom shelf), `1:500`, `1:501` (end book, bottom right).
- Pale patches and smudges, deleted: `1:484` (cream book, bottom shelf), `1:491` (orange book tick), `1:403` and `1:404` (top-shelf loop), `1:533`.
- The leaning tan book's cream cap (`1:529`) is now tan.
- The end book's ragged top (bottom right) is covered by `end book top`, a fill that follows the spine's own edges straight up to a flat top. `end book top outline` (0.9 px ink) runs the whole height of the book on those edges, so there's no step where it meets the old outline. Its top is square to the spine: it slopes down to the right like the green book's top beside it (Ari: the first top was at the wrong angle). The old cap piece `79:2` is deleted.
- Marks Ari likes (the round light spot on the top-shelf tan book, the plate on the bottom-shelf yellow book) are copied onto a few books in tints that suit them: `spot on red book`, `spot on green book`, `plate on green book`, `plate on red book`. Not every book. The two plates are scaled down (78% and 72%) and centred on their spines, so they don't run onto the cover or the next book.
- The books' own horizontal bands are unchanged (they vary).
- Grouping: the traced pieces are grouped by book, `book 1 brown` to `book 28 tan`, numbered by shelf from left to right. 43 shapes stay at library level: the dark underlay, the shelves, the posts, the plaque, the shadow, and shapes that span several books. A few groups were reordered so the stacking matches; the grouping diff is 0 pixels.
- Whole-scene diff against before the books work: changes only in the library.


## Steps 4–8 (revised 2026-11-22)

**4. Separate controllable artwork**
- `eclair 1`, `eclair 2`, `eclair 3`, each with its own shadow. Clicks take eclair 1, then eclair 2, then bite eclair 3 twice, then it's gone (REFERENCE.md).
- `eclair 3 bite 1`, `eclair 3 bite 2`: same spot, bigger bites, each with its shadow, hidden by default; only one eclair 3 state shows at a time.
- Gather the 4 window glass pieces into one `glass` layer, ready for one-colour recolouring (dusk blue). Include the glass-coloured rectangles in `window patch behind bottles and mobile`.
- `crystal` sublayers: done in step 3 (`hook and threads`, `crystal 1`–`crystal 4`). The whole mobile sways; each crystal spins.
- Labels are done in step 3.
- Checkpoint: normal, both bites, empty rack.

**5. Sunbeams and evening light**
- Remove the beam from the mixer's background without leaving a hole.
- `sunbeam-am`, `sunbeam-noon`, `sunbeam-pm` inside `wall`, one or two flat light shapes each, above the wall fill and behind every object.
- `evening light`: warm light under the wall cupboards (REFERENCE.md evening), one flat shape, hidden by default.
- Checkpoint: each beam alone, and the evening light.

**6. Rainbows: wall only** (Ari 2026-11-22)
- `rainbows-am`, `rainbows-noon`, `rainbows-pm` inside `wall`, above the beams, behind every object; matching each beam. Flat see-through colour bands and a few flecks, no blur.
- Nothing on objects, so the whole set can swing with the mobile.
- Checkpoint: each beam with its rainbows, and rainbows off.

**7. Golden hour, from 4 pm local time** (Ari 2026-11-22)
- `golden hour`: one separate, see-through warm overlay that can be switched on and off, no filters; outlines and rainbows stay readable.
- Code shows it from 4 pm until evening starts. No object-by-object relighting unless Ari asks.
- Checkpoint: golden hour with and without rainbows; off restores the normal palette.

**8. Final checks and export**: as in the Figma agent's plan (sizes, independent toggles, empty rack, one `glass`, crystal sublayers, labels outlined, exact names, no leftovers), exported with ids on. Claude lists the real exported ids. Then `source.svg` / `source.png` are replaced and #182 (prep script) picks up from there.

## Log

- 2026-11-22 (later): journal label is now `label Trials`, "TRIALS" in Archivo Narrow Bold 8.4 (the caps face of THE LIBRARY and RECIPES), letter spacing fitted to the label, in ink `#2b2420`. The label plate is lighter for the sunbeam: `1:884` is `#f1e7d0` and its rim `1:880` is `#cdc3b3`. Only the journal changed. Ari also reported a missing horizontal line under the cabinet shelves. She meant the open cupboard: the top compartment has a dark ceiling (`#613e25`) that meets the back wall in a 1 px ink line, and the two shelves had neither. Added `top shelf underside and back line` and `lower shelf underside and back line` (in `cupboard`): the dark underside runs from each shelf's lower edge back to where the shelf meets the back wall, set by the vanishing point (447, 187) with the back wall at 0.95 depth (y 45.6→52.7 and 92.1→96.8). Each ends in a 1 px `#2d1a0e` line parallel to the top one, and its left end meets the inner side wall at the perspective angle. Only the cupboard interior changed.

- 2026-11-22 (later): Ari's notes: clipboard outline, mixer bowl, full check.
  - **Clipboard:** `clipboard outline` (`93:2`, 0.9 px ink, traced from the board shape `1:555`) now goes all the way round; before, only the right side had a dark edge.
  - **Door:** the line running past the clipboard's lower-right corner was `door panel outline behind clipboard` (`57:2`). It and `door behind clipboard` (`54:2`) had slipped 5 px left and 2 px up of where they were placed. Both are moved back; the door's right panel line now shows just right of the clipboard, mirroring the left one.
  - **Mixer:** the red stripe on the bowl's left side (`1:1094`, `#d56339`) is now the bowl's edge grey `#726b5e`, renamed `bowl left edge shade`.
  - **Rack:** `rack edge and legs` ran on as a thin line along the counter to x 868. That tail, a counter-light edge, showed once the rack was darkened. It's split off: the rack edge (`95:10`) ends at x 822.6, and the tail is `counter light edge line` (`95:14`, in `counter`, back to the original pale `#ae8f75`).
  - **Full check:** a whole-scene comparison with the picture from after the window fixes shows no other unintended movement.
  - **Vanishing point:** about (447, 187), measured from the cupboard's inner wall and the library's inner side wall. These fit it: the cupboard interior, the open door's bottom edge, the library, the whiteboard (left side face), the window trim and sill, the journals, the rack and eclairs, the counter and the cabinets. The notebook is turned on the counter, so it doesn't have to follow it.
  - **Off-perspective:** the recipe box shows its left side but should show its right. Ari: leave the box as drawn. The cork board's side thickness is drawn on its left but should be on its right (minor); no decision yet.

- 2026-11-22 (later): end book top squared to its spine. **Move found and fixed:** the drawing `1:2` had moved to (−3, −42), and the `library` group had moved a further (+13.6, −2), probably by a drag in Figma. Put back: `1:2` at 0, 0 (`clip0_79_2` mask at 0, 0, scene `1:5` at 0, −2, as before), and `library` at x 405.4, y 0 in frame coordinates. The pixel diff against the last good picture shows only the end book top (plus a few antialiasing pixels). Note: `1:2` is a group clipped by the mask `1:3`, so the frame comes from the mask, not from the cupboard.

- 2026-11-22 (later): plates fitted inside their spines; end book top redrawn along the spine edges.

- 2026-11-22 (later): books redraw undone (Ari didn't like it); circled marks, patches and tops fixed on the traced art; a few liked marks copied; traced pieces grouped by book (0-pixel change).

- 2026-11-22 (later): books first pass (no clear defects; taste list for Ari); eclairs rebuilt with base fill, outline and shadow from closed silhouettes; stray pieces and old patches removed so the rack mesh is whole; handle in rack colour.

- 2026-11-22 (later): rack edge and legs in the wire colour (Ari: yes). Books pass next: Claude does a first pass, then Ari adds what's left.

- 2026-11-22 (later): rack wires darkened to `#86634a`, eclair outlines added (Ari: both). Waiting on Ari's look and her notes for the books pass.

- 2026-11-22 (later): Ari's look: door outline gap under the clipboard fixed; window glass fixed (upper-right staircase, drip by the crystal, left edge above the green bottle, top frame gap). Rack diagnosed as too light overall; books pass raised.

- 2026-11-22 (later): step 3 items 4, 6, 7 done in Figma (notebook page writing, photo details, door one green with hinge shadow, clipboard up 10 px, notebook spiral, left cover edge thinned). The notebook's bottom edge is left for Ari. Backup page `backup before step 3 items 4-7`.

- 2026-11-22 (later): step 3 approved. Figma access confirmed (`whoami`: Full seat, Pro team). Items 1 (defects) and 2 (rack) done in Figma; see "Step 3 progress". Stopped for Ari to look before items 3–7.
- 2026-11-22 (later): object shadows moved off the counter into box, journals, mixer, rack (Ari said yes). Normal view unchanged.
- 2026-11-22 (later): item 3 labels re-lettered as text (Caveat Bold, Archivo Narrow Bold); underlines redrawn. Ari shared the original window design (green fluted decanter, square amber bottle with cork, small blue bottle) and asked what another pass at the bottles would take.
- 2026-11-22 (later): item 5 bottles redrawn from Ari's original (blue under the lowest crystal, amber to its right); crystal mobile redrawn with step 4 sublayers. Nothing outside the window changed.
- 2026-11-22 (later): rack wires set to the edge colour `#ae8f75`. **Size change found and fixed:** the drawing group `1:2` had been stretched to 1101 × 665 (×1.27 wide, ×1.37 tall) and moved, probably by a drag in Figma. Ari said to scale it back. Claude restored it to 868 × 484.5 at x 0, y 0, then multiplied line widths, font sizes and letter spacing back by 1101/868, because `rescale` had shrunk them. A pixel diff against the last good picture shows changes only in the rack wires (the intended recolour).
- 2026-11-22: steps 1–3 base checked from `trace 1(1).svg` (same picture as the export before, now with ids). Ari's step 3 change list and answers recorded. Waiting for approval and the Figma link.
