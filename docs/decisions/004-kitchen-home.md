# 004: The kitchen scene home

Date: 2026-10-19. Status: decided.

## Context

Today the signed-in app opens on a top nav that leads to separate pictures: the notebook, the cork board, the cookbooks and references, and the wooden recipe box. The PRD listed "Kitchen illustration as the signed-in home" as later, and said the phone has no kitchen picture.

The Design Bash (groups G3 and G4; Q5–Q10, Q12–Q15 and Q17–Q21 decided) settled what the home should be: one kitchen scene that holds every object. The Design Bash doc lives in Claude Docs, not this repo. This record is the one source for the build issues. The reference image is the Lovable prototype's `kitchen-board-hero.jpg`.

Still open and not settled here: Q3, Q4, Q16 (location or time zone for the light), B1, L1 and G5.

## Options

Each item was a choice between the options below; the chosen one is in **Decision**.

- **Home:** keep the top nav, or replace it with one kitchen picture. Wait for photographs, or ship a simple drawing first.
- **Board:** cork only, or cork plus a whiteboard or to-do list.
- **Leaving an object:** go to a separate page, or open each view over the kitchen. Keep Back/Forward, or one "back to kitchen" control.
- **Locked objects:** hide them, or open them read-only with sample data.
- **Phone:** the wide kitchen scaled down, a simpler tall kitchen, or ask people to rotate.
- **Light:** fixed, or moving with the clock; drawn light first, photos later.

## Decision

**The home**
- The signed-in home is one picture of a sunlit kitchen. It replaces the top nav.
- A simple drawing stands in until photographs replace it. The reference image is the Lovable prototype's `kitchen-board-hero.jpg`.
- The account menu floats in the top-right corner.

**Objects**
- A shelf across the top: references and chosen cookbooks.
- The cork board in the centre of the wall. Cork only: no whiteboard and no to-do list.
- The Lab notebook standing on the counter, leaning on the board's left corner.
- The recipe box on the counter.
- A working clock on the wall.
- Decoration: a mug, lemons, plants.
- The timer comes later through "Add tool".

**You never leave the kitchen**
- Every focused view (board, notebook, box, shelf items) opens full-screen over a faded kitchen.
- One "back to kitchen" control replaces the Back/Forward arrows everywhere.
- Each view keeps its own URL, so links and reloads still land on it.

**Locked objects**
- Objects a person's tier can't use open read-only with sample data, so home cooks can see what the developer tools do. The sample data ships like the starter recipes (`load_starter_recipes`), safe on any URL.

**Phone**
- A simpler kitchen. Upright it is a tall crop: shelf, then board, then counter, with the recipe box in the biggest spot.
- Tapping an object takes over the screen. The box opens the phone Recipe Box ([decision 003](003-phone-recipe-box-design.md)).
- No rotate prompt.

**Sunlight**
- Warm light from a window moves with the device clock.
- Later, four or five tripod photos (morning, midday, golden hour, evening, night with a lamp) crossfade by the clock.
- Location or time zone is left for later (Q16).

**Reduced motion** (`prefers-reduced-motion`)
- The light keeps shifting.
- Zoom and view transitions fade briefly or switch instantly.

**Overlap with decision 003**
- 003 removed Back/Forward (`HistoryNav`) on the phone box and kept it on wide screens. 004 replaces Back/Forward everywhere, wide screens included, with "back to kitchen".
- 003's phone box layout stands: it is what the box object opens on a phone.

## Consequences

- The top nav goes away. The signed-in route becomes the kitchen scene, and the existing views (notebook, cork board, cookbooks, references, recipe box) become full-screen overlays on it with their current URLs.
- `HistoryNav` is removed on wide screens too, once "back to kitchen" exists.
- Locked objects need read-only sample data, loaded by a command that is safe on shared URLs, like `load_starter_recipes`.
- The light is drawn by the device clock in the browser; no server or location data is needed for v1.
- Photographs, the timer ("Add tool") and the location-aware light are each their own Task.

## Revisit when

- Photographs are ready to replace the drawing.
- Q16 (location or time zone) is decided.
- Testing on a real phone shows the tall crop makes objects too small to tap.
- People say they miss Back/Forward.
