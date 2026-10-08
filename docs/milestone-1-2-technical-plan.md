# Milestones 1 and 2 — technical plan

**Status:** Ready to build  
**Product source:** [PRD.md](PRD.md) version 1.5  
**Out of scope here:** kitchen illustration, cookbook re-release, `User.updated_at`, Playwright, a second Render service, schema changes, Stripe, R2.

The API and the existing interiors stay. These two milestones change how you enter, how you move, and how two screens behave on a phone.

## Locked choices

- Login and signup are one recipe card. No persona on the card. Auth calls stay `POST /api/v1/auth/login/` and register.
- Signed-in home is `/recipe-box` for both roles. Developers still have the lab, the cork board, and cookbooks.
- The website header in [`frontend/src/components/AppLayout.tsx`](../frontend/src/components/AppLayout.tsx) goes away. Places live in a frame control: text labels, same CSS tokens, bottom of the screen under 768px, a slim row above the page on wider screens. It is part of the app frame, not a second masthead.
- Phone places: Recipe box, and for a developer also Lab. Board, cookbooks, and references stay in that same control on wide screens. On a phone they can sit in an overflow so the bar stays short: Box and Lab visible, the rest behind “More”.
- A title with no ingredients and no steps is an idea (`POST /api/v1/ideas/`). Do not use the box for that.
- A home-cook add, in the UI, sends a title and then at least one ingredient line or one step before the flow counts as done. The create API stays title-first ([`CollectionRecipeCreateSerializer`](../collection/serializers.py)). No migration.
- Phone lab: one of ingredients or steps is visible. A control turns the page. Wide screens keep the two-column spread in [`DeveloperRecipePage.tsx`](../frontend/src/pages/DeveloperRecipePage.tsx).
- Phone box: the list is the screen, or the open card is the screen. Not both. Wide screens keep [`RecipeBoxFrame`](../frontend/src/components/recipe-box/RecipeBoxFrame.tsx).
- Public `/r/:slug` and `/c/:slug` stay reading pages. No place switcher.
- Colors and type come from existing tokens. No new palette, no Tailwind, no component library.

## Milestone 1 — one frame

### Recipe card auth

Replace the plain forms in [`LoginPage.tsx`](../frontend/src/pages/LoginPage.tsx) and [`RegisterPage.tsx`](../frontend/src/pages/RegisterPage.tsx) with one presentational card. Fields, errors, and submit stay as they are. Labels stay visible. Targets at least 44px. The card fills a phone width and sits centered on a wide screen. Register stays a second mode of the same card (a link on the card), not a different metaphor.

Guest `/` renders that card instead of the link list in [`HomePage.tsx`](../frontend/src/pages/HomePage.tsx). Keep the signed-in branch of `HomePage` from being the landing page: [`defaultRouteForUser`](../frontend/src/auth/access.ts) returns `/recipe-box` for every authenticated user, including developers. Deep links in `location.state.from` still win.

### Frame

Add `frontend/src/components/FrameNav.tsx` and use it from `AppLayout` only when `user` is set.

| Label | Route | Who |
|-------|--------|-----|
| Box | `/recipe-box` | any account |
| Lab | `/developer/lab` | `hasDeveloperAccess` |
| Board | `/developer` | developer, wide or “More” |
| Cookbooks | `/developer/cookbooks` | developer, wide or “More” |
| Shelf | `/references` | any account, wide or “More” |

Account controls that are in the header today (theme, font, `show_forks`, username, log out) move into one disclosure on the frame labeled Account. They call the same `ThemeProvider` and `updateProfile` paths.

`HistoryNav` stays, visually inside the frame, not in a bar above it.

Remove `.app-header` link wrapping. Public routes render the outlet with the brand only, no place list.

### Done when

- A logged-out visit to `/` shows the card. Login and register both work and land on `/recipe-box`.
- A developer opens Lab, Board, and Cookbooks from the frame. A home cook does not see those three.
- `/r/some-slug` has no place switcher.
- `npm run build` passes. Existing pytest still passes. No API diff.

## Milestone 2 — phone box and one notebook page

Do this after Milestone 1, on the same branch or the next, without rewriting the editors.

### Box

In [`RecipeBoxPage.tsx`](../frontend/src/pages/RecipeBoxPage.tsx), under `max-width: 768px`:

- No `recipeId`: render the A–Z title list and the import panel. Hide the lid, the perspective well, and the open card. Tapping a title goes to `/recipe-box/:id`.
- With `recipeId`: render [`RecipeBoxCard`](../frontend/src/components/recipe-box/RecipeBoxCard.tsx) full screen and a back control to `/recipe-box`. Hide the index.

At `min-width: 768px`, keep the current frame, lid, and index.

[`RecipeImportPanel`](../frontend/src/components/RecipeImportPanel.tsx) is on the phone list, above the fold: URL preview, then photo or PDF. `destination="box"`. The file input already accepts images. Do not add a capture-library dependency.

Home-cook add (role `home_cook`): the add form collects a title and either one ingredient name or one step. Submit calls create, then `createBoxIngredientLine` or `createBoxStep`. If the second call fails, navigate to the new card and show the error so the title is not lost. Developers adding a box card may still create with a title only; title-only ideas stay on the board.

### Notebook

In `DeveloperRecipePage`, under `max-width: 768px`:

- Local state `phonePage: "ingredients" | "steps"`, default ingredients.
- Render `SpreadIngredients` or `SpreadSteps`, not both.
- A page control with those two labels, 44px, sits on the page.
- Version flip, compare, publish, and journal stay reachable from one control on that page (the existing margin tools can collapse into it). They must not appear as a third stacked column beside a single page.
- Save and save-new-version stay on the visible page.

At `min-width: 768px`, render both columns as today. Do not change version, publish, or test-session APIs.

### Done when

- At 390px wide: box list, then a card that fills the screen, then back to the list. Import URL and file controls are on the list.
- Home-cook add cannot finish with only a title.
- At 390px, a lab recipe shows ingredients or steps, and the other page opens with one control. At 1100px, both columns show.
- Public recipe at 390px still reads as one column.
- `npm run build` passes. Pytest passes.

## Verify

No browser automation is in this repo. Check the widths above in the browser (or device mode) against a locally seeded database (`load_recipe_seed` on localhost only). Do not load that seed on Render.

## After these two

Milestone 3 is seed fixtures and a short Playwright pass. Milestone 4 is a showable staging login and durable media. Production is a second Render service on `main` with its own database and `ENVIRONMENT=production`. None of that starts inside Milestone 1 or 2.

## Prompt for the next agent

```
Build Milestones 1 and 2 in docs/milestone-1-2-technical-plan.md. Read that file and the 2.0 notes in docs/PRD.md (version 1.5) before editing. Do not reopen product decisions.

Milestone 1: recipe-card login/register, guest / is that card, every account lands on /recipe-box, replace the AppLayout header with FrameNav (text, in the frame, Account disclosure for theme and logout). Public /r and /c get no place switcher.

Milestone 2: under 768px the recipe box is a title list OR a full-screen card, with URL and photo/PDF import on the list. Home-cook add must include a title and one ingredient or one step (create, then line or step; API stays title-first). The lab notebook shows one page at a time on the phone and both columns on a wide screen.

Do not add a kitchen illustration, schema changes, Tailwind, Playwright, Stripe, R2, or a second Render service. Use existing CSS tokens. Run npm run build and the existing pytest suite. Do not load the walkthrough seed on a public URL.
```
