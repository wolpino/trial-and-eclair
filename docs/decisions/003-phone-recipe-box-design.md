# 003: Phone recipe box design

Date: 2026-10-16. Status: decided.

## Context

PR #52 shipped a working phone view of `/recipe-box` (below 768px, `frontend/src/components/recipe-box/phone/`). A screenshot review on 2026-10-16 found it far from the look prototype (published artifact https://claude.ai/artifact/UDqqk86ZP8ETNaVbNFKykq): a flat slate panel instead of wood, a 7×4 keypad of letters, a white card with a floating "Open recipe" button, page chrome above the box, and the bottom app bar covering the box front. Ingredient lines also read like database output ("0.75 cup Flour", "2 whole Eggs") because `frontend/src/lib/recipeFormat.ts` prints decimals, raw unit names and stored capitals.

This record settles the look and behaviour before the design pass. It keeps decision 001 (A–Z only) and 002 (guest mode).

## Options

Each item was a choice between the options below; the chosen one is in **Decision**.

- **Menu:** a ☰ on the box, or the bottom bar's More sheet; keep or hide the bottom bar; Add in the menu only, a "+" on the box front, or a floating "+".
- **Back/Forward on phones:** remove everywhere, or only on the box.
- **Fan:** wait for the later fan design in a claude.ai chat, or use the artifact's fan now (the recovered v7 turned out to have the same fan); dim the lid or not.
- **Dark mode:** follow the phone, light only, or a picker now; recipe box only or the whole app; cream or dark card paper.
- **Ingredient text:** ¾ or 3/4; lowercase names and plural units or as stored; show `raw_text` or always format; everywhere or phone only.
- **Card View portrait:** ask to rotate, one scrolling column, or a pinned ingredient band.
- **Flip:** flip pages of a long recipe, flip only to the back of the card, or no flip.
- **Not built yet:** Wild West looks, tab colours, the pull-out tray: v1, later or drop. Box label: fixed text, name, year joined, or name and year.

## Decision

**The box (already locked by Ari before this record)**
- Tabs: two staggered rows exactly as in the artifact. Front row A, C, E…; back row B, D… sitting between them. With N = letters + 2, each tab is 3/N wide. Prototype tab size. Only letters that have cards (plus `#`). One row when 12 or fewer letters.
- Wooden box: wood lid with hinge, card edges behind the tabs, box front with latch and engraved label.
- Ruled index card in the lid. Tapping anywhere on it opens Card View. No floating "Open recipe" button.
- No page header or Back/Forward on the phone box.
- `docs/recipe-box/prototype/box-view-prototype.html` is replaced with the v7 artifact version (#60, PR #61). v7's open question about the front/back split ("A > #") is settled by the line above: A, C, E… in front.

**Menu**
- The phone box gets the whole screen: the bottom app bar (Box / More / Account) is hidden there. Other phone pages keep it.
- A ☰ in a corner of the lid opens one menu, in sections, top to bottom:
  1. Account: the person's name, or "Guest · 3 of 5 cards" with **Sign up to keep your cards** and **Sign in**.
  2. Add recipe (type / URL / scan).
  3. View: Simple list on/off.
  4. Appearance: look and tab colour, shown only once those are built.
  5. Sign out, at the very bottom, signed-up people only.
- One menu for now; split a section out only when it grows.
- Add also has a small round floating **+** in the lower right, styled to match the wood. It shows only while the box is closed and you are browsing tabs, and hides while the fan or Card View is open, so it never covers a card.
- Simple list is PRD R6: a plain accessible list that replaces all the box visuals and loses no function.
- The sign-up card at the guest limit (002) stays.
- Back/Forward (`HistoryNav`) is removed on phones everywhere. Wide screens keep it.

**Fan**
- Use the artifact's fan now: a row of title-only cards rising just above the tabs, scrolling sideways. Tap a card to put it in the lid; tap the open tab again or press Escape to close. Dragging a finger along the tabs jumps between letters with a large letter bubble.
- No grey layer over the lid while a tab is open.
- This is the final fan: the latest prototype (v7, 2026-10-16, PR #61) has the same fan, and Ari confirmed it. Details: the open tab lifts 9px (A–Z 7px) and turns #fff7dc; chips are 124px wide, at least 52px tall, paper #fffaf0, title only in Georgia 600 13px; chips rise in over 0.32s, 40ms apart; the chosen card slides into the lid over 0.42s; an aria-live region announces "<tab>, N cards" and "<title> selected". Motion is off under `prefers-reduced-motion`.

**Dark mode**
- Follow the phone's setting (`prefers-color-scheme`) now. A Light / Dark / Match phone choice comes later in the menu's Appearance section.
- Phone recipe box only in this pass, using the prototype's dark wood tokens. The rest of the app (including the wide box) has no dark styles today and gets its own Task.
- Card paper stays cream with dark ink in dark mode.

**Ingredient text** (`frontend/src/lib/recipeFormat.ts`, used everywhere: phone box, wide box, notebook `RecipeViewer` and `SpreadContent`, public pages)
- Fractions as Unicode characters: ¼ ½ ¾ ⅓ ⅔ ⅛, mixed numbers as 1½. Other values round to the nearest common cooking fraction, so "0.333 cup" never shows. Screen readers get words ("one and a half").
- Ingredient names lowercase unless the person typed a capital on purpose ("Dijon mustard"). Units plural above 1 ("2 cups flour"); short units (tbsp, tsp, oz, g) don't change. The "whole" unit is never shown ("2 eggs").
- On box cards, `raw_text` is shown when present, so import notes like "1 cup butter, softened" survive. When someone edits a line, the editor saves the new line into `raw_text` as well, so it never shows an out-of-date line. Lines without `raw_text` use the formatter.

**Card View**
- Phone sideways: two columns, ingredients left and steps right, each scrolling on its own.
- Portrait: ingredients in a band pinned across the top that collapses to one line ("Ingredients (8) ▾"); steps scroll underneath.
- Long recipes scroll; they don't flip. "Turn over" flips to the back of the card: notes, source, and the original photo or scan.
- Keep the screen awake while Card View is open (Wake Lock API), on by default, released on leaving the card. A small ☀ shows it is on and turns it off. Where unsupported, nothing happens.
- Tap a step to mark "you are here"; tap an ingredient to tick it off. Neither is saved; both reset when you leave the card.
- Editing: Edit in the card's own small menu switches the same card into editable fields in the same layout, with Done / Cancel. It reuses the wide box's editor parts (`RecipeStepsEditor` etc.), so there is one editor.
- No servings scaler and no unit toggle in this pass. The unit toggle stays out per `docs/PRD.md` ("no unit conversion in v1").

**Later, each its own Task**
- Wild West looks, all five source styles from the prototype: typed, handwritten (script, blue ink), recipe card (red band), cookbook (small caps, page number), web (URL strip). `scan` uses typed. Tidy is the only look until then.
- Tidy tab colours: Cream (default), Sage, Sky, Rose, Butter, in the Appearance section. Same Task as Wild West.
- The pull-out tray (up to 4 cards). Needs its own phone design first.
- Servings scaler (needs confident parsing and flags for lines it can't parse, R2-AC3).

**Box label**
- Engraved "<name>'s Recipes · est. <year joined>", for example "Ari's Recipes · est. 2026". Name is `first_name`, else `username`; year is from `date_joined`. Guests see "Recipes · est. <year>".

## Consequences

- The phone box is a redesign of `frontend/src/components/recipe-box/phone/` (box, tabs, fan, menu, floating +, Card View), not a patch of #52.
- `AppLayout` needs a way for the phone box to hide the bottom bar, and `HistoryNav` is hidden below 768px.
- `recipeFormat.ts` changes how every screen shows ingredients, so its unit tests cover fractions, plurals, "whole" and capitals. The box line editor writes `raw_text`.
- Card View uses the Wake Lock API, so a browser without it simply doesn't keep the screen on.
- The prototype file in `docs/recipe-box/prototype/` becomes the artifact version and stays the look reference.

## Revisit when

- The Appearance section is built (dark mode picker, Wild West, tab colours).
- Testing on a real phone shows the staggered tabs are too small to tap (R1-AC4), or the pinned ingredient band takes too much of a short screen.
