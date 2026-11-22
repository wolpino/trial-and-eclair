# Wave 1 kitchen: Figma plan

The live plan for finishing the Wave 1 drawing in Figma. **Update this file after every step** (status, what changed, what Ari decided), and commit it with the step. REFERENCE.md stays the truth for looks and behaviour; this file is only the plan and its progress.

## Status

| Step | What | Status |
|---|---|---|
| 1 | Sort fragments into object layers | ✅ done (Figma agent; checked 2026-11-22 from export `trace 1(1).svg`) |
| 2 | Cut shared outlines, one per object | ✅ done (same check) |
| 3 | Finish the underlying artwork | 🔶 approved 2026-11-22; items 1–2 done, **Ari to look in Figma before items 3–7** |
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

**2. Rack: done, waiting for Ari's look.**
- The dense dark-brown wire mesh (`1:790`, now `rack wires`) is restyled as thin light wires: `#d7cab4` at 60%, 0.4 px. That gives a light rack with wires everywhere, under the eclairs too.
- Each eclair group has a new soft shadow at its back (`eclair 1 shadow`, …): a flat copy of the eclair's outline shape in `#55311d` at 32%, moved 3 px down-left. Taking an eclair takes its shadow, and the empty rack shows only wires.

**3. Labels: done, waiting for Ari's look.**
- The rough traced lettering was replaced with real text layers, each named `label <word>` and placed where the old lettering was in its group. The backup page keeps the old lettering.
- Fonts are v17's: Caveat Bold for the handwritten labels (Kitchen log, Ideas, Next up, Trial, the jars) and Archivo Narrow Bold for THE LIBRARY and RECIPES. Each label keeps its Wave 1 ink colour, angle and width; the letter spacing was fitted to the old width.
- Jars (in `jar labels`): Flour, Sugar, Cocoa (cut off by the door) on the top shelf; Oats, Pecans, Salt on the bottom. The small jar has no label.
- Nothing outside the label areas changed (pixel diff 0).
- The swoosh underlines under "Ideas" and "Next up" were part of the traced lettering and went with it; v17 has none. **Ask Ari** whether to draw them back as clean strokes.
- Text stays editable for now; step 8 turns it into outlines.

**4–7: not started.**

## Steps 4–8 (revised 2026-11-22)

**4. Separate controllable artwork**
- `eclair 1`, `eclair 2`, `eclair 3`, each with its own shadow. Clicks take eclair 1, then eclair 2, then bite eclair 3 twice, then it's gone (REFERENCE.md).
- `eclair 3 bite 1`, `eclair 3 bite 2`: same spot, bigger bites, each with its shadow, hidden by default; only one eclair 3 state shows at a time.
- Gather the 4 window glass pieces into one `glass` layer, ready for one-colour recolouring (dusk blue).
- `crystal` parent with one sublayer per crystal (`crystal 1`–`crystal 4`, top to bottom) and the hook and thread separate. The whole mobile sways; each crystal spins.
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

- 2026-11-22 (later): step 3 approved. Figma access confirmed (`whoami`: Full seat, Pro team). Items 1 (defects) and 2 (rack) done in Figma; see "Step 3 progress". Stopped for Ari to look before items 3–7.
- 2026-11-22 (later): object shadows moved off the counter into box, journals, mixer, rack (Ari said yes). Normal view unchanged.
- 2026-11-22 (later): item 3 labels re-lettered as text (Caveat Bold, Archivo Narrow Bold). Underlines question open.
- 2026-11-22: steps 1–3 base checked from `trace 1(1).svg` (same picture as the export before, now with ids). Ari's step 3 change list and answers recorded. Waiting for approval and the Figma link.
