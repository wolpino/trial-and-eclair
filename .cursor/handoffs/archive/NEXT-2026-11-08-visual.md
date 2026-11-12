# NEXT — 2026-11-08 (visual redesign)

## Goal
Give the kitchen a bright, sunlit cookbook-plate look and a cohesive brand, then build it through Task issues.

## Map
```
style ✅ → colours ✅ → mark ⏳ → brand sheet update → Task issues → build
                                      recipe log #161 (separate track, draft)
```

## Done
| Item | Result |
|---|---|
| Style | Printed cookbook plate: ink line, flat colour, halftone, hatching |
| Layering rules | Colour sits under the line for solid things; only loose things drift. Draw back to front, so cards stay inside the box |
| Kitchen colours | Box deep cobalt #2F4E9A, walnut #9A6234, sage white wall #EEF0DF, stem green cabinets #5E8C3A, Prussian #24406E scallop valance, no tile, light off |
| Plate details | Printer's marks on; hover snaps colour into register |
| Kitchen behaviour | Customisable (brand swatches plus a colour wheel, patterns, flowers). The sill is seasonal by default and stays pinned once picked. One more drawn item per 5 real ones |
| Parked | Light that follows the clock (`useSunlight` stays in the code) |
| Dropped | The E made of eclairs (every version), the recipe-card mark, the measuring cup |
| Recipe log | Task issue #161, labelled draft. Stains are a later issue that reads `made_count` |

## Next options
1. **Mark:** pick a new direction from the round one, two and three eclairs on the plate page. Options to try: eclair as the "&", a stamp or seal, a wordmark-only lockup, or Ari's own idea
2. **Brand sheet update:** fold the picks, layering rules, round tacks, mixed tab colours and the mark into the brand sheet
3. **Draft visual Task issues:** theme tokens and fonts; kitchen plate SVG (with marks and hover); customise settings; fill-up rule and seasonal sill; marks and icons; stains (after #161)
4. **#161:** review the draft, remove the label, and build it in its own session
5. **Other track:** the PR clean-up handoff is in `archive/NEXT-2026-11-08-pr-cleanup.md`. Its phases 5–8 are still open, including local sync

## Files to open first
- Kitchen Plate (current mockup): https://claude.ai/artifact/3NHEb9cHQuachu9vBWvnuN
- Brand tuning board: https://claude.ai/artifact/TUHh5zwujKsDQ6Hy6YATCQ
- Brand sheet v1 (partly outdated): https://claude.ai/artifact/K8X63SdpkmtbUUqoard9w4
- Plan: `~/.claude/plans/i-know-i-did-cheerful-candy.md`
- `.cursor/handoffs/session-log-draft-2026-11-08-visual.md`: the session log entry, not yet in the repo
- https://github.com/wolpino/trial-and-eclair/issues/161

## Don'ts
- Don't build visuals before the mark and brand sheet are settled and the Task issues exist
- Don't edit tracked files on this detached HEAD (`71d75a9`). Sync to `staging-render` first, then add the session log through a docs PR
- Orange is for fills; ink is for text (orange on cream fails AA). Colours a cook picks need an automatic ink-or-cream text choice
- Don't merge `staging-render` into `main` unless the owner asks
