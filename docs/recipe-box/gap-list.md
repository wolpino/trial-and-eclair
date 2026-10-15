# Recipe Box: gap list against the Django API

Written 2026-10-15. This compares `prd.md` and `spec.md` in this folder with the API on `main`. The spec's Supabase backend is replaced by `/api/v1/`. R-IDs come from `prd.md` §12. No code was changed.

Decided since: [001](../decisions/001-recipe-box-in-frontend.md) (Recipe Box replaces the phone view in `frontend/`; A–Z only; no revisions or share links for home cooks) and [002](../decisions/002-guest-mode.md) (guest mode). Rows they settle are marked **→ 001** or **→ 002**.

## 1. Spec needs the API already covers

| Spec need | What covers it | Files |
| --- | --- | --- |
| Box of recipes, A–Z (R1, R4 alphabetical) | `CollectionRecipe` + `RecipeBoxItem`, `GET/POST/PATCH/DELETE /recipe-box/`, ordered by title | `collection/models.py`, `collection/views.py`, `collection/urls.py` |
| Card content: title, times, ingredients, steps (R2, R3) | `CollectionRecipe.prep_minutes/cook_minutes`, `CollectionIngredientLine`, `RecipeStep.collection_recipe`; nested `/recipe-box/{id}/ingredient-lines/` and `/steps/` | `collection/models.py`, `development/models.py` (`RecipeStep`), `collection/serializers.py` |
| Owner-only access (R17-AC3, stands in for RLS) | Every box queryset filters `user=request.user`; `IsAuthenticated` on every view | `collection/views.py`, `config/settings.py` (`REST_FRAMEWORK`) |
| Accounts and login (R17, without the anonymous part) | Session auth: `register/`, `login/`, `logout/`, `me/` | `accounts/urls.py`, `accounts/views.py`, `accounts/serializers.py` |
| Same-origin hosting so cookies work | Django serves the API and the SPA (`spa_index`, WhiteNoise) | `config/urls.py`, `config/spa.py`, `config/settings.py` |
| URL import with SSRF guard (R7, R7-AC3) | `POST /imports/url/`, JSON-LD parse, private-IP and scheme blocking, robots.txt, shared cache `UrlRecipeImport` | `library/services.py`, `library/views.py`, `library/models.py` |
| Review before saving a URL import (R7-AC1) | `GET /imports/url/{id}/` gives a read-only preview, and nothing is saved until `POST .../save/` | `library/urls.py`, `library/views.py` |
| Keep the original (photo / page) | `SourceDocument` (file + `extracted_text`); `UrlRecipeImport.parsed_data` + `normalized_url`; FKs on `CollectionRecipe` | `library/models.py`, `collection/models.py` |
| Photo/scan import (R8) | `POST /imports/scan/`: server-side OCR (Tesseract / pdftotext), labeled-section parse | `library/views.py`, `library/scan.py`, `library/services.py` |
| Save someone's recipe to my box, with provenance (R24, first half) | `POST /public/recipes/{slug}/fork/` `save_to_box`; `RecipeFork` holds source version + user | `development/public_views.py`, `development/models.py`, `collection/models.py` (`fork_record`) |
| View a shared recipe without an account (R23, developer recipes only) | `GET /public/recipes/{slug}/`, PWA route `/r/:slug` | `development/public_views.py`, `development/urls.py` |
| Ingredient catalog for autocomplete (R21, server half) | `GET /ingredients/?search=` (icontains, 25 max), `POST /ingredients/`; `default_unit` | `catalog/views.py`, `catalog/models.py` |
| Unit list and the "as written" rule | `StandardUnit` enum + `custom_unit`; `User.measurement_preference` | `catalog/base.py`, `accounts/models.py` |
| Installable PWA shell (R22) | `vite-plugin-pwa` with a manifest and Workbox in the existing front end | `frontend/vite.config.ts` |

## 2. Spec needs missing from the API

| Spec need | What's missing | Where it would go |
| --- | --- | --- |
| Servings and scaling (R1 lid shows "serves", R2-AC3, R14) | No `servings` field on any recipe model | `collection/models.py` |
| Raw ingredient text (non-negotiable 1, R3-AC2) | Lines have no `raw` or `text`. `quantity` is a required decimal, so "a pinch" or "salt to taste" can't be stored as written | `collection/models.py` (`CollectionIngredientLine`) |
| Needs attention (R3-AC4, R7-AC2) | No flag. URL import fails outright instead of making a card | `collection/models.py`, `library/services.py` |
| Categories, custom dividers, several sets (R4, R12) | **→ 001: out of scope.** A–Z only | n/a |
| Look and source style (R9) | No `look` or `sourceType`. Source can partly be inferred from `url_import` / `source_document` | `collection/models.py` |
| Revisions and undo for box cards (R3-AC3, R5-AC3, R16) | **→ 001: out of scope for home cooks.** Box cards are edited in place with no history. Versioning only exists on `DevelopmentRecipe` | `collection/models.py`, `development/models.py` |
| Offline sync (R5) | No `updated_since` filter, no soft delete (`deletedAt`), no conflict handling. The box list has no pagination (fine for caching, but breaks the DRF rule) | `collection/views.py`, `.cursor/rules/django.mdc` |
| Share any box card by link, and revoke it (R23, R25) | **→ 001: out of scope.** No `ShareLink` or `visibility`. Only published developer recipes have public links | `development/public_views.py`, `collection/models.py` |
| Upstream-update prompt (R24, second half) | `RecipeFork` records the source but nothing compares it with later versions | `development/models.py` |
| Audio notes (R11) | No model, no upload endpoint, no audio handling | n/a |
| Autocomplete ranked by my own history (R21-AC1) | `/ingredients/` is a global name search, with no per-user frequency | `catalog/views.py` |
| Per-user settings: look, motion, default sort set | `User` only has `measurement_preference` and `show_forks`. The `color_theme`/`font_preset` fields named in `docs/PRD.md` §5 are not in the model | `accounts/models.py`, `accounts/serializers.py` |
| Rate limits on import and save (spec §4, §7) | No DRF throttles configured. **→ 002** lists which | `config/settings.py` |
| Guest account and upgrade (→ 002) | No guest flag, guest-create or upgrade path | `accounts/models.py`, `accounts/views.py` |
| 5-card guest limit (→ 002) | No limit check on the card-creating endpoints | `collection/views.py`, `library/views.py`, `development/public_views.py` |
| Starter recipes on new accounts (→ 002) | Only the walkthrough seed exists, and it can't run on a public URL | `development/management/commands/load_recipe_seed.py` |
| Guest cleanup job (→ 002) | No command or schedule | `development/management/commands/`, `render.yaml` |
| Durable media for originals and photos | Media is on ephemeral Render disk; R2 is "not yet shipped" | `docs/PRD.md` §10, `README.md` (Staging) |

## 3. Conflicts between the spec and existing models or decisions

| Spec says | Repo says | Files |
| --- | --- | --- |
| Categories, custom tabs, several divider sets (R4, R12) | **→ 001: A–Z wins.** Locked: home cook box is "alphabetical only, no categories" | `docs/PRD.md` §4, §3 Home Cook #6 |
| Anonymous account on first launch, no form (D5, R17-AC1) | **→ 002: guest on first save, 5-card limit.** Today: register with username + password; every API call needs a session | `accounts/views.py`, `accounts/serializers.py` |
| A title-only card saves and is flagged Needs attention (R3-AC4) | A box card needs a title plus at least one ingredient or step; a title-only note is a developer idea. Enforced only in the UI | `docs/PRD.md` App. A, `frontend/src/pages/RecipeBoxPage.tsx` |
| Every edit is a revision; fork your own card (R16) | **→ 001: PRD wins.** Home cooks get "no versioning"; versions are a paid developer feature | `docs/PRD.md` §2, §4 |
| Any recipe can be shared by link or made public (R23, R25, R27) | **→ 001: PRD wins.** Publishing is developer-only; home cooks don't publish | `docs/PRD.md` §2, §4 |
| Unit conversion (R14, Card View toggle) | "Store as entered … no auto-conversion v1" | `docs/PRD.md` §4 |
| Ingredient line = `raw` + `text` + parsed fields, parse on the device | Line = FK to global `catalog.Ingredient` + decimal quantity. URL import writes each whole raw line (e.g. "2 cups flour") as a new catalog `Ingredient` with quantity 1, which fills the shared catalog with junk | `library/services.py` (`payload_from_parsed_data`), `development/services.py` (`_resolve_ingredient`) |
| Scan import: review screen before anything is saved | `POST /imports/scan/` saves a box card right away | `library/services.py` (`create_scan_import`) |
| OCR in the browser; server only as a capped fallback | OCR runs on the server (Tesseract on PATH) | `library/scan.py`, `README.md` |
| Recipe Box is a new, separate phone front end | **→ 001: it replaces the phone view in `frontend/`.** The existing front end already has a phone recipe box (title list → one full-screen card, Milestone 2) at `/recipe-box`, and the SPA catch-all serves a single `frontend/dist` | `docs/PRD.md` App. A, `config/spa.py`, `config/settings.py` (`FRONTEND_DIST`) |
| Supabase, Cloudflare Pages, edge share pages, Zod contracts, pnpm monorepo (D3, D4) | Django + DRF on Render; one Vite app; no edge rendering | `render.yaml`, `config/settings.py`, `frontend/package.json` |
| UUIDv7 IDs, soft deletes everywhere | `uuid4` primary keys, hard deletes | `collection/models.py`, `catalog/base.py` |
| Everything free (D8) | **→ 002: guests can see the paid tier as a locked preview.** Two roles and a paid developer tier; the box is the free tier | `accounts/models.py`, `docs/PRD.md` §2 |
| Tablet: centered box, no tablet layout (D10) | Tablet/monitor belongs to the notebook front end | `docs/recipe-box/README.md` |
