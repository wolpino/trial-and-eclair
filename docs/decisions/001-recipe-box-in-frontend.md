# 001: Recipe Box is the phone view of the existing front end, A–Z only

Date: 2026-10-15. Status: decided.

## Context

Recipe Box (`docs/recipe-box/`) was specced as a standalone Supabase app with categories, custom divider sets and sharing. This repo already has one Django API, one Vite app (`frontend/`) and a locked rule that the home-cook box is alphabetical only (`docs/PRD.md` §4). The existing `/recipe-box` page switches to a plain phone layout below 768px (`frontend/src/lib/usePhoneLayout.ts`). The gap list (`docs/recipe-box/gap-list.md`) flagged both of these as conflicts.

## Options

1. A separate Recipe Box app with its own build, served under its own path.
2. Recipe Box built inside `frontend/`, replacing the phone layout of `/recipe-box`.
3. Keep the current phone layout and drop the Recipe Box design.

For filing:

1. A–Z only, as `docs/PRD.md` already locks.
2. The spec's categories, custom dividers and several divider sets (R4 categories, R12).

## Decision

- **Option 2.** Recipe Box lives in `frontend/` and replaces the phone layout of `/recipe-box` (below 768px). Tablet and monitor keep the wooden-box view. One build, one login, one API client, same origin.
- **A–Z only.** Tabs are A–Z plus #. No category tabs, custom dividers, divider-set switcher or "File under…" picker. The prototype's Categories toggle is dropped.
- Tidy and Wild West looks stay in scope. They depend on a card's source type, not on categories.
- Home cooks get no revision history and no share-by-link (`docs/PRD.md` §2 and §4 stand).

## Consequences

- No second build, route prefix or SPA fallback change in `config/spa.py`.
- The spec's Supabase, Cloudflare, Zod-contract and monorepo sections no longer apply.
- R4 (categories), R12, R16 (revisions for home cooks), R23 and R25 (share by link, visibility) are out of scope for the box.
- The box needs a source-type field on `CollectionRecipe` for Wild West.

## Revisit when

- Home cooks ask for categories after using A–Z, or
- the free tier gains revisions or sharing.
