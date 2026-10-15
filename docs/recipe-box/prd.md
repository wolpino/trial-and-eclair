# Recipe Box: Product requirements

Companion files: `spec.md`, `agents.md`, `decisions.md`, `reference/`.

---

# Agent brief: read this first

If you are an AI agent building this app, this section tells you how to use the rest of the document, what is settled, and what “done” means. Repository: https://github.com/wolpino/recipe-box.git (default branch: main).

## How to use this document

- **Part 1** says what to build and why. Requirements have IDs (R1, R2…); an ID is the unit of work.
- **Part 2** says how it is built. **Part 3** says how agents split the work. **Part 4** has the files that go in the repo.
- **Precedence when sources disagree:** contracts in code (Zod schemas, SQL migrations) beat acceptance criteria (section 12.1), which beat Part 2, which beats Part 1 prose. If a contract and the document disagree, follow the contract and say so in your PR.
- **MUST** and **SHOULD** mean what they mean in RFCs. Anything not written here is not required; do not invent features.
- **Blocked by an open decision?** Use its default from the decision log, record the assumption in your PR description, and keep going. Stop and ask only for contract, security or row-level-security questions.

## Non-negotiables

1. Never lose the original: `raw` ingredient text and `Original` records are never overwritten.
2. A voice edit is never applied without a spoken or tapped confirmation.
3. Every gesture has a keyboard and button equivalent; Simple List mode loses no function.
4. Row-level security on every table, with a test.
5. Secrets and API keys live only in edge functions.
6. No recipe text, transcripts or audio in analytics or error reports.
7. Web-imported recipes are never published as copies; they share as a link to the source.
8. Tab and button tap targets are at least 48 px.

## Glossary

| Term | Meaning |
| --- | --- |
| Box | A person’s collection of recipes, drawn as a recipe box |
| Box View | Portrait home screen: card in the lid on top, divider tabs in front |
| Lid | The upper area of Box View showing the selected card |
| Card | One recipe, as drawn on an index card |
| Card View | Full-screen recipe card with front and back |
| Tab / divider | A labelled divider; tapping it lifts it and fans out the cards filed under it |
| Sort system | A set of tabs that organizes the same recipes one way: alphabetical, categories or custom |
| Fan | The spread of cards that opens behind a tab (also the later perspective view) |
| Tray | Up to about four cards pulled out of the box onto the counter |
| Tidy / Wild West | The two looks: uniform and clean, or each card looking like its source |
| Original | The photo, page snapshot or text a recipe came from, always kept |
| Review screen | Shows parsed result beside the original before anything is saved |
| Needs attention | A saved card that is incomplete or low-confidence |
| Revision | One recorded edit; provenance of a saved copy is its first revision |
| Simple List mode | Plain accessible list replacing the box visuals |
| Lane / contract PR | A parallel workstream with its own directories / a small PR changing shared schemas, tokens or migrations (Part 3) |

## Decision log

| ID | Decision | Status | Default if still unanswered |
| --- | --- | --- | --- |
| D1 | Web app first, installable, no app-store apps in v1 | Decided | n/a |
| D2 | Front-on Box View in v1; perspective Fan later | Decided | n/a |
| D3 | Vite + React single-page app, edge-rendered share pages | Proposed | Use it |
| D4 | Supabase backend, Cloudflare Pages hosting | Proposed | Use them |
| D5 | Anonymous sign-in from first launch | Proposed | Use it |
| D6 | Sharing: link and save-to-my-box first; feeds only after moderation tools | Proposed | Build link and save; feeds behind a flag, off |
| D7 | Cloud fallbacks (LLM, cloud OCR, server transcription) | Open | Build the interfaces, leave the providers disabled |
| D8 | Monetization | Open | No payments; everything free |
| D9 | Full social features (follow, comment) vs shared collections | Open | Neither until feeds are scheduled |
| D10 | Tablet-specific layout | Open | None; desktop shows a centered box |
| D11 | Product name and branding | Open | Use “Recipe Box” as a placeholder string in one constants file |

## Definition of done

A task is done only when all of these are true:

- Its acceptance criteria (section 12.1) pass as automated tests, and the tests were written first.
- `pnpm verify` is green: typecheck, lint, unit, component, integration, coverage gates (Part 2, section 8).
- Every touched screen has zero serious or critical axe violations and works keyboard-only.
- Reduce Motion is respected and text at 200% is not clipped.
- Performance budgets still pass (Part 2, section 6).
- Migrations are forward-only and tested; policy tests exist for any new table.
- No new dependency, contract, CI or RLS change slipped into a feature PR.
- The PR names the R-IDs it covers, lists assumptions made, and has a working preview URL.

# Part 1 — Product Requirements

## 1. Vision

A recipe app that feels like the physical recipe box on your counter. You open the lid, the card you’re using stands up in the lid, and the divider tabs sit in front of you. Browsing, filing, pulling a card out and cooking from it are all done by touching the box, not by digging through menus. Underneath the charm it is accessible, voice-capable, works offline, and gets a recipe in from any source in under a minute.

## 2. Goals and non-goals

**Goals**

- The box is the interface: navigation is built into the image.
- Any recipe in, any way: typed (with autocomplete), URL, photo/scan, shared link, voice. Recipes can also be shared and saved between people, with their history.
- Two personalities from the same data: **Tidy** (clean, uniform) and **Wild West** (a gloriously messy real box).
- Flexible filing: alphabetical, categories, custom, and several divider sets at once.
- Accessibility and flexibility first: voice edits with read-back confirmation, audio notes, scaling, hands-free cook mode.
- Iterable: ship a thin version fast, then update continuously.
- Fully tested (unit + e2e), monitored, and built on free or very cheap services wherever quality allows. Delivered as an installable mobile web app (no app-store fees) and designed to be built by AI agents working in parallel.

**Non-goals for v1:** meal planning calendar, grocery delivery, public browsable feeds (sharing by link comes first), nutrition analysis, recipe marketplace, tablet-specific layouts, native app-store apps (the web app installs to the home screen; stores can come later).

## 3. Design principles

1. **The box is the navigation.** Tap a tab to see what’s there, pull a card out, tap the card to cook.
2. **Never lose the original.** The photo, the URL snapshot, the handwriting are always kept next to the cleaned-up version.
3. **Nothing changes without confirmation.** Especially voice edits: propose, repeat back, confirm, apply.
4. **Every gesture has a non-gesture equivalent.** Charm must never block access.
5. **Fast in, easy to fix.** Import is allowed to be imperfect because review and edit are effortless.
6. **Ship thin slices.** Every milestone is usable.

## 4. Inspiration → design decisions

| Reference | What it gives us |
| --- | --- |
| Image 1: wooden box, card standing in the lid, tabs in front (Entrées / Soups & Salads / Sauces) | **Box View, v1 base layout.** Front-on view: selected card on top, tabs below. |
| Image 2: A–Z alphabetical dividers | **Alphabetical sort system**, including staggered tab rows for many tabs. |
| Image 3: yellow box packed with clippings, mixed paper, category tabs | **Wild West look.** Cards keep the look of where they came from. |
| Image 4: blue box, tabs fanned in perspective, card open in the lid | **Preferred aesthetic for later.** Target for the ‘Fan’ perspective view. |

**On adding dimension:** yes, there are cheap ways to do it without committing to a full perspective view.

- **v1:** direct front-on view (best for readability and tap accuracy) plus depth cues: layered shadows, staggered tab heights, light animation such as the card sliding into the lid (all of it disabled under Reduce Motion).
- **v2:** a true perspective ‘Fan’ like the blue box, rendered with Skia transforms.
- **Rule:** tab tap targets stay at least 48dp in every look. Perspective never wins over usability.

## 5. Core experience

### 5.1 Box View (portrait, home screen)

- **Top \~55% (the lid):** the selected card, readable at a glance: title, serves, times, ingredients, step preview.
- **Bottom \~45% (the box front):** divider tabs for the active sort system, with the front-most cards peeking behind them.
- Empty state: an empty box with a ‘Add your first recipe’ card in the lid.

### 5.2 Gesture and control map

| Action | Gesture | Non-gesture equivalent |
| --- | --- | --- |
| See what’s in a section | Tap a tab: it lifts and the cards behind it fan up | Tab is a button; opens a list of that section |
| Pick a recipe | Tap a card in the fan | List item, activatable by screen reader |
| Pull a card out | Drag card up out of the box onto the counter tray - or double click | ‘Pull out’ action on the card |
| Open full card | Tap the card in the lid, or pull it fully out | ‘Open recipe’ button |
| Flip card (front/back) | Tap flip corner or swipe horizontally in Card View | Front/Back segmented control |
| File a card | Drag it onto a tab | ‘File under…’ picker |
| Swap divider set | Swipe the tab row sideways, or tap the divider-set switcher | Switcher menu |
| Add recipe | Tap the blank card at the front, or the + on the box | Same |

### 5.3 Card View (full recipe card)

- Landscape-friendly, also works portrait. Front: ingredients and steps. Back: notes, audio notes, history, original (photo / source URL).
- Tools: servings scaler, unit toggle (metric/US), edit, voice edit, cook mode.

### 5.4 Pulling out multiple cards

Up to about four cards can sit on a ‘counter tray’ above the box. Tap one to bring it forward. Good for planning a dinner (main, side, dessert). Swipe between them in Card View.

## 6. Sort systems (dividers)

A **sort system** is a set of divider tabs that organizes the same recipes in a different way. A recipe is stored once and appears in every system.

- **Alphabetical:** one letter per tab, A–Z plus #. On narrow screens, two staggered rows (like Image 2) or a scrub strip.
- **Categories:** Breakfast, Entrées, Soups & Salads, Sauces, Desserts, Drinks and so on. Fully editable, reorderable, renameable.
- **Custom:** anything: ‘Holidays’, ‘Weeknight’, ‘Mom’s’, ‘Tried & true’.
- **Multiple at once:** keep several divider sets and swap between them, like swapping an index. Default set is the one used when filing.
- **Wild West (no system):** one big unsorted pile, newest on top, plus search. A deliberately mess-friendly mode.
- **Behavior:** empty tabs dim (or hide, by setting). Filing is by drag onto a tab or a ‘File under…’ picker. A recipe can sit in several categories via tags.

## 7. Looks: Tidy vs Wild West

One data model, two renderers. The look is a setting per box and can be overridden per recipe.

|  | **Tidy** | **Wild West** |
| --- | --- | --- |
| Cards | One template, one typeface, all aligned | Each card looks like its source |
| Typed recipe | Standard card | Lined index card, typed font |
| Photo of handwriting | Cleaned structured card; photo on back | Lined card in a handwriting font (scan of a handwritten card) |
| Web import | Standard card + source link | Clean web page style with the source site shown (blog / web import) |
| Magazine / book scan | Standard card | Book page style (cookbook scan); printed recipe-card scans get a printed index-card style |
| Tabs | Matching, evenly spaced | Same tabs and spacing, in the box's tab color; a custom category may use a handwriting font, default categories use the typed font |
| Offsets | None | None. Cards and tabs stay straight and aligned in both looks |

**Rule:** Wild West is about flexibility, not randomness. Each card takes the style of its source (typed, handwritten card, recipe-card scan, cookbook scan, blog or web import), and tabs look the way the person set them up. Nothing is tilted or randomly placed, and every look must stay readable. For now a card's style is set by its source type; letting people change it per card comes later, because Tidy is the alternative. Tidy offers a few color options for the tabs; per-tab colors come later. Tabs size to their labels, overlap when crowded, and wrap to a second row if needed. A–Z tabs run edge to edge with each letter centered on its tab, and stagger into two rows when there are many. Tapping any Wild West card opens the same clean Card View, and structured text is always available.

## 8. Adding recipes

| Method | Flow | Notes |
| --- | --- | --- |
| Manual | Blank card: title, ingredients, steps | Fast entry, paste-friendly, ingredient lines parsed into amount/unit/item, with autocomplete suggestions |
| URL | Paste a link or share from the browser | Parse structured recipe data, fall back to smart extraction; keep link and snapshot |
| Scan / photo | Camera or gallery, multiple pages | In-browser OCR, with a cloud fallback for handwriting, then parse; original image kept |
| Voice dictation | ‘Add recipe’, speak it | Same review loop as voice edit |
| Share sheet | Android: share from any app to the installed web app. iOS: paste the link or use a Shortcut | Text, URL, or image |

Every path ends in a **Review screen** (see the original side by side with the parsed result, fix anything) and then files into the box. Anything uncertain is flagged and can be saved as a **Needs attention** card rather than blocking.

### 8.1 Manual entry: autocomplete and suggestions

Typing is always allowed; suggestions only save effort.

- **Ingredient lines:** as you type, a dropdown suggests ingredients, ranked by your own history first, then a bundled list of common ingredients (so it works offline). Picking one fills the item and offers its usual units.
- **Amounts and units:** quick chips for ¼ ½ ¾ and a unit picker. A live preview shows how the line was understood (“1½ cups · all-purpose flour”), so a misread is visible before saving.
- **Titles, tags and categories:** autocomplete from what is already in the box, so you don’t end up with both “Dessert” and “Desserts”.
- **Recent and repeated:** recently used ingredients appear first; “copy from another recipe” reuses a block such as a pie crust.
- **Accessible by design:** a standard combobox (works with screen readers, keyboard and voice dictation). Suggestions are never auto-accepted; Enter keeps exactly what you typed.

## 9. Accessibility and voice

### 9.1 Voice edits with read-back

The user can say things like ‘change the flour to two cups’, ‘double the recipe’, ‘swap butter for olive oil’, ‘remove the walnuts’, ‘add a step: rest for ten minutes’.

1. App listens and shows the transcript.
2. App parses it into a proposed change and **speaks it back**: ‘Change flour from one and a half cups to two cups. Is that correct?’
3. User says yes, no, or a correction (‘no, two and a half’). The app also shows Yes / No buttons.
4. On yes, the change is applied and recorded in history with Undo. On no, nothing changes.

Ambiguity (‘the sugar’ when there are two) triggers a clarifying question, never a guess.

### 9.2 Audio notes

Record a note on any card (‘Grandma said to use less salt’). Notes are attached to the card, can be played back from the card’s back, and are optionally transcribed on-device so they’re searchable. Audio notes can optionally be tied to a specific ingredient or step.

### 9.3 Cook mode

Screen stays awake, large text, one step at a time, big next/back targets, voice commands (‘next’, ‘repeat’, ‘how much butter?’), optional read-aloud of steps, scaling that updates all amounts.

### 9.4 Accessibility requirements

- WCAG 2.2 AA minimum; AAA contrast option.
- Full VoiceOver and TalkBack support with a logical reading order; tabs, cards and gestures all have labels and actions.
- Dynamic type / font scaling to at least 200% without clipped content.
- Reduce Motion, high contrast, and a **Simple List mode** that replaces the box visuals with a plain accessible list.
- One-handed use: primary actions reachable in the bottom half.
- Never rely on color alone; touch targets at least 48dp.

## 10. Iterability

- **Recipe history:** every edit is a revision. Compare, restore, or fork (‘My version of Grandma’s pie’).
- **Product iteration:** over-the-air updates for UI and logic fixes, feature flags for gradual rollout, short release trains.
- **Easy correction everywhere:** parsed content is always a suggestion until the user accepts it.

## 11. Sharing, saving and feeds

Recipes can move between people, and every hop is written into the recipe’s history. It ships in three steps so the riskiest one comes last.

1. **Share by link (P1).** Any recipe can make a link that anyone with it can open, no account needed. The recipient sees the card in the Tidy look.
2. **Save to my box (P1).** Saving puts a copy in the recipient’s box (under a “Shared with me” tab) with its provenance in the history, for example “From Dana’s box, shared Oct 14”. Edits to the copy never change the original. If the author updates theirs, the saver sees “Dana updated this recipe” and can review the changes and pull them in, or ignore them.
3. **Browsable feeds (P2).** Public recipes appear in feeds: Following, New, and by category, with search. Authors choose per recipe: Private (default), Link only, or Public. A report button, rate limits and a takedown process must exist before feeds go live.

**Rules**

- The chain of who passed it on (“Grandma → Dana → you”) is visible in the history of every copy.
- Recipes imported from a website share as a link back to the source plus your own notes, not as a copy of the publisher’s text. Typed and handwritten family recipes can be shared.
- Audio notes and private notes stay private unless the sharer includes them.
- v1 feed ranking is simple (newest, most saved). No engagement tricks.
- Open question: full social features (follow, comment) or a lighter “shared collections” model first?

## 12. Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| R1 | Box View with lid card and divider tabs (front-on) | P0 |
| R2 | Card View with full recipe, flip to back | P0 |
| R3 | Manual add / edit recipe | P0 |
| R4 | Alphabetical and category sort systems; tap tab to browse | P0 |
| R5 | Cloud-backed storage with an offline cache: saved recipes work without signal | P0 |
| R6 | Screen reader support and Simple List mode | P0 |
| R7 | URL import with review screen | P0 |
| R8 | Photo/scan import with in-browser OCR and review | P1 |
| R9 | Tidy / Wild West looks | P1 |
| R10 | Voice edit with read-back confirmation | P1 |
| R11 | Audio notes | P1 |
| R12 | Custom divider sets, multiple sets, swap | P1 |
| R13 | Pull-out tray (multiple cards) | P1 |
| R14 | Servings scaling and unit conversion | P1 |
| R15 | Cook mode with voice commands | P1 |
| R16 | Revision history, undo, fork | P1 |
| R17 | Account (anonymous start, upgrade later), backup and sync across devices | P0 |
| R18 | Perspective ‘Fan’ view (blue box) | P2 |
| R19 | Share a recipe card (image / link / export) | P2 |
| R20 | Share-target import (Android) and paste-link import (iOS) | P1 |
| R21 | Ingredient, title and tag autocomplete, working offline | P0 |
| R22 | Installable web app: manifest, offline cache for saved recipes, update prompt | P0 |
| R23 | Share a recipe by link; recipient can view it without an account | P1 |
| R24 | Save a shared recipe to my box with provenance in its history; review upstream updates | P1 |
| R25 | Per-recipe visibility: Private, Link only, Public | P1 |
| R26 | Report, rate limits and takedown tools (required before R27) | P1 |
| R27 | Browsable feeds: following, new, categories, search | P2 |

### 12.1 Acceptance criteria for the P0 requirements

Each row is one automated test. “E2E” means a Playwright journey from section 8 of Part 2.

| ID | Given / When / Then | Proven by |
| --- | --- | --- |
| R1-AC1 | Given a box with 3 or more recipes, when the home screen opens, then the lid shows the selected card (title, serves, times, ingredients, step preview) and the front shows divider tabs | E2E 2 |
| R1-AC2 | Given Box View, when a tab is tapped, then it lifts and its cards fan up within 100 ms, and tapping a card puts it in the lid | E2E 2, performance test |
| R1-AC3 | Given an empty box, when the app opens, then the lid shows an “Add your first recipe” card | E2E 1 |
| R1-AC4 | Given any viewport from 360×640 up to desktop, then tab targets are at least 48 px and nothing scrolls sideways | E2E viewport matrix |
| R2-AC1 | Given a card in the lid, when it is tapped, then Card View opens with all ingredients and steps | E2E 2 |
| R2-AC2 | Given Card View, when Flip is used (tap or the Front/Back control), then the back shows notes, history and the original | Component test, E2E 2 |
| R2-AC3 | Given servings changed from 4 to 8, then every confidently parsed ingredient doubles and unparsed lines are flagged, not changed | Unit test on scaling |
| R3-AC1 | Given the blank card, when a title, one ingredient and one step are entered and saved, then the recipe appears in the box under the default sort system | E2E 1 |
| R3-AC2 | Given the line “1 1/2 cups flour” is typed, then `raw` equals the typed text and the parse is amount 1.5, unit cups, item flour | Unit test on `parseIngredient` |
| R3-AC3 | Given a saved recipe is edited, then a Revision is written and Undo restores the previous text | Integration test |
| R3-AC4 | Given a recipe with only a title, when saved, then it saves and is marked Needs attention | Component test |
| R4-AC1 | Given recipes titled “Apple pie”, “Bread” and “7-layer bars”, when the alphabetical system is shown, then they sit under tabs A, B and # | Unit test on filing rules |
| R4-AC2 | Given the Categories system, when a card is dropped on a tab or “File under…” is used, then it appears under that tab, with the same result either way | E2E 3 |
| R4-AC3 | Given two sort systems, when the person swaps between them, then every recipe appears in both and filing in one does not remove it from the other | Integration test |
| R4-AC4 | Given a tab with no cards, then it is dimmed (or hidden, per setting) | Component test |
| R5-AC1 | Given recipes were loaded online, when the browser goes offline, then the box, Card View, search and autocomplete still work | E2E 11 |
| R5-AC2 | Given an edit made offline, when the connection returns, then it syncs in order and shows in a second browser session | E2E 11 |
| R5-AC3 | Given two sessions edit the same field, then the newer edit wins and the older is kept as a Revision | Integration test |
| R6-AC1 | Given a screen reader, when moving through Box View, then tabs, cards and actions are reachable in logical order with labels and no gesture needed | E2E 10, manual script |
| R6-AC2 | Given Simple List mode is on, then journeys 1 to 3 complete using the keyboard only | E2E 10 |
| R6-AC3 | Given text at 200%, then no content is clipped; given Reduce Motion, then animations become crossfades | E2E 10 |
| R6-AC4 | Given any screen, then axe reports zero serious or critical violations | Playwright with axe |
| R7-AC1 | Given a page with schema.org Recipe data, when its URL is imported, then the Review screen shows title, ingredients and steps beside the saved original, and nothing is saved until the person confirms | E2E 4, fixture corpus |
| R7-AC2 | Given a page without structured data, when extraction fails, then a Needs attention card is created with the link kept | Fixture corpus |
| R7-AC3 | Given a private-network address or a non-http(s) URL, then the import function rejects it | Edge function test |
| R7-AC4 | Given no connection, when a URL is submitted, then it is queued and a “waiting for connection” card is shown | E2E 11 |
| R17-AC1 | Given first launch, then an anonymous account is created with no form and a saved recipe is stored on the server | Integration test |
| R17-AC2 | Given an anonymous account, when the person signs in with email, then all existing recipes remain | Integration test |
| R17-AC3 | Given person A’s private recipe, then person B cannot read or write it | Row-level security test |
| R21-AC1 | Given the ingredient field, when “flo” is typed, then suggestions including “flour” appear within 50 ms, with the person’s own history ranked first | Unit and component test |
| R21-AC2 | Given suggestions are showing, when Enter is pressed without choosing one, then exactly the typed text is kept | Component test |
| R21-AC3 | Given no connection, then suggestions still appear | E2E 11 |
| R21-AC4 | Given a screen reader, then the number of results is announced and arrow keys move through them | Component test with role queries |
| R22-AC1 | Given the deployed app, then the web manifest is valid and the app can be installed on Android Chrome and added to the iOS home screen | Lighthouse check, manual smoke |
| R22-AC2 | Given a new release, then an “update available” prompt appears and accepting it loads the new version without losing queued edits | E2E 12 |

## 13. Roadmap (thin slices)

- **M0 — Walking skeleton (about 2 weeks):** web app shell (installable), CI with a preview URL per PR, Box View with fake data, one tab, one card, Sentry wired, first Playwright e2e test.
- **M1 — Usable box (MVP):** R1–R6 plus accounts and ingredient autocomplete. Add, edit, file, browse. Testers open a preview link on their phones.
- **M2 — Get recipes in:** URL import, photo import, review screen, paste/share-target import.
- **M3 — Personality and flexibility:** Tidy/Wild West, custom dividers, pull-out tray, scaling, share by link and save to my box.
- **M4 — Voice and accessibility depth:** voice edit, audio notes, cook mode.
- **M5 — Community and polish:** browsable feeds with reporting and moderation, history UI, perspective Fan exploration.

## 14. Success metrics

- Time to first recipe saved: under 2 minutes for a new user.
- Import success without manual edits: 70%+ for URLs, 50%+ for photos (target, tracked on a fixture set).
- Voice edit accepted on first read-back: 80%+.
- Crash-free sessions: 99.5%+.
- Week-4 retention and recipes per active user (opt-in analytics).
- Accessibility: zero blocker issues in each release’s VoiceOver/TalkBack pass.

## 15. Risks and open questions

- **Rendering the box well and accessibly:** mitigated by Simple List mode and keeping v1 front-on.
- **OCR on handwriting is unreliable:** review screen plus keeping the original; cloud fallback behind a cost cap.
- **Recipe sites block or change markup:** structured-data first, fixture suite catches regressions.
- **Copyright:** the app is for personal collections; imports keep the source link and attribution. Public feeds carry only recipes the author wrote or owns; web imports are shared as a link back to the source, not a copy of the publisher’s text.
- **Open:** Name and branding? Is a tablet layout needed early? Should Wild West tabs allow user-drawn handwriting? Monetization (free + optional paid sync/backup, or one-time purchase)?
