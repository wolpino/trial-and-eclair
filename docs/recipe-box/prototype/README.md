# Look prototype (Wave -1)

Throwaway: open `box-view-prototype.html` on a phone. Do not copy its code into `apps/`; extract tokens into `tokens.md`. Questions and exit criteria: `docs/agents.md` section 3. Record answers in `docs/decisions.md`.

## v7 (2026-10-16)

Copied from the published claude.ai artifact "Recipe Box · Box View prototype", version updated 2026-10-16. Changes from the previous copy:

- **A–Z stagger geometry.** Still switches on above 12 letters in use. Each tab is now 3/N wide with N = letters + 2 (was 2/N with N = letters + 1), so neighbours overlap more and the last tab still fits.
- **Which row is in front.** The 1st, 3rd, 5th… tabs (A, C, E… when every letter is in use) now sit in the low front row (top 24px, 30px tall, on top). The 2nd, 4th… tabs sit in the high back row (top 0, 38px tall, behind). Before, it was the other way round.
- **Decisions panel.** A "Decisions" button opens the design notes, "Box View: design decisions (from prototype v7)", inside the page.
- **Fan unchanged.** Tapping a tab still shows that tab's cards as a horizontally scrolling row of title-only chips that rise in with a 40ms stagger. The owner confirmed this is the current fan.

Decisions stated in the v7 notes (the in-page panel has the full text):

- The box image is the navigation: tap a tab to fan its cards out as chips, tap a chip to put the card in the lid. Chips show the title only. Escape closes an open tab.
- Two looks. Tidy: one typed card style, tab color picked from Cream (default), Sage, Sky, Rose, Butter. Wild West: card style follows the source type (typed, handwritten scan, recipe card scan, cookbook scan, web import).
- No tilt, rotation or random offsets anywhere.
- Category tabs size to their labels and wrap to a second row; text never runs over a neighbour.
- A–Z shows only letters in use plus `#`; empty letters become slivers when there is room. Scrubbing along the tabs shows a large letter bubble.
- Open question: whether the owner wanted a different front/back split for the stagger ("A > #").
- A–Z tabs are under 48px; scrub and the stagger are the mitigation. Re-check against R1-AC4 on a real phone.
- Later: landscape with letters along the bottom, perspective/depth, per-card style override, per-tab colors, a background behind the tabs that looks like the reference photos.
