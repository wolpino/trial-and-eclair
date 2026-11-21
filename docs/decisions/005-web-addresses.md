# 005: A web address for every view

Date: 2026-11-17. Status: decided. **Amended 2026-11-20:** the Library replaces the separate cookbooks and references addresses (table and redirects below). Ari confirmed the addresses and "Back returns to the kitchen" on Plate XI (2026-11-17). The finer rules below (next card replaces the address, names unique per cook, `-2`, old names kept, redirects) were Claude's picks, and Ari confirmed them too (2026-11-17).

## Context

In the kitchen home ([decision 004](004-kitchen-home.md)), every object opens a view over the dimmed kitchen. 004 already said "each view keeps its own URL" and that one "back to kitchen" control replaces the in-app Back/Forward arrows. It did not say what the addresses are, or what the browser's own Back button does.

Plate XI (signed off 2026-11-17, https://claude.ai/artifact/8eaxCBnwujNi1zg945oDBL) draws an address under every view. This record fixes those addresses before Task issues are written. Adding addresses after the views are built is hard: state that lives only in memory has to be pulled back out into the address.

Today's routes come from the old top-nav app: `/developer`, `/developer/lab/:recipeId`, `/developer/cookbooks/:cookbookId`, `/recipe-box/:recipeId`, `/references`, `/sample/...`, `/login`, `/register`, with UUIDs in the address. The public pages are `/r/:slug` and `/c/:slug`.

## Options

- **No addresses:** the kitchen is one page and open views live only in memory. Simple, but refresh loses your place, links can't be saved or shared, and the phone's Back button leaves the app.
- **Addresses only for things you'd share** (a recipe, a cookbook): fewer routes, but Back behaves differently from view to view.
- **Every open view, recipe, trial and cookbook has an address**, and Back closes the open view.

## Decision

Every open view, recipe, trial and cookbook has its own address.

| What | Address |
|---|---|
| Front page (signed out) | `/` |
| Sign in · Sign up | `/sign-in` · `/sign-up` |
| The kitchen (signed in home) | `/kitchen` |
| Whiteboard | `/whiteboard` |
| Idea board | `/ideas` |
| Trials notebook, at one trial | `/notebook/croissants/trial-4` |
| Recipe box, at one card | `/box/croissants` |
| Recipe log | `/log` |
| Library (cookbooks and references on one shelf) · one cookbook | `/library` · `/library/cookbooks/weekend-bakes` |
| Settings | `/settings` |
| Public recipe · public cookbook | `/r/<slug>` · `/c/<slug>` (unchanged) |
| Anything else | the not-found page |

- **Back.** Opening a view adds one history entry. The browser's or phone's Back closes the open view and returns to `/kitchen`. Moving inside a view (next card, next trial) replaces the address instead of adding entries, so one Back always gets you to the kitchen. Close and Esc do the same as Back.
- **Refresh and links.** Loading any address draws the kitchen with that view already open over it.
- **Readable names, not ids.** Recipes and cookbooks use a short name made from the title (`croissants`). A name only has to be unique inside one cook's kitchen, so two cooks can each have `croissants`. If a cook has two with the same title, the second gets `-2`. Renaming keeps the old name working. Trials use their number within the recipe (`trial-4`).
- **Same address for every plan.** A home cook or guest opening `/notebook/...` or `/ideas` gets the read-only sample with the paid plan tag, at the same address. Nothing moves between plans.
- **Menus have no address.** The Account menu, the jot list and small dialogs (remove sample data, the paid plan card) open over whatever address you are on.
- **Old addresses redirect.** `/developer` → `/kitchen`, `/developer/lab/...` → `/notebook/...`, `/developer/cookbooks/...` → `/library/cookbooks/...`, `/cookbooks` and `/references` → `/library`, `/cookbooks/...` → `/library/cookbooks/...`, `/recipe-box/...` → `/box/...`, `/sample/...` → the same view's address, `/login` → `/sign-in`, `/register` → `/sign-up`.

## Consequences

- The router is rebuilt around `/kitchen`, with each open view as a child route drawn over it. This goes in the kitchen home Task issue, not a separate one.
- The private name is a new field, unique per cook, separate from today's `slug` (which is unique across everyone and only set for public pages). Recipes and cookbooks need it, with a migration that fills it from titles. Its own Task issue, backend first.
- Old UUID addresses keep working through redirects, so saved links and bookmarks don't break.
- References open inside the Library and have no address of their own (as before). Saved cookbooks (later) are other cooks' published cookbooks and open at their public `/c/<slug>`, so they need no new address.
- The phone uses the same addresses. The phone layout (next, PLAN.md section 3) draws views at these addresses, and the phone recipe box ([decision 003](003-phone-recipe-box-design.md)) moves from `/recipe-box` to `/box`.
- README's route list and `docs/PRD.md` change when the router is built, not now.

## Revisit when

- People share links to views they expect others to open, such as an idea or a whiteboard. Only `/r/` and `/c/` are public today.
- Back closing the view feels wrong on a real phone, for example when people expect it to go to the previous card.
- A cook needs a named address for one idea or one reference. Today those open inside their board or shelf.
