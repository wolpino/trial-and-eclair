# Trial and Eclair — Product Requirements Document

**Version:** 1.1  
**Status:** Approved — MVP complete (Phases 0–2); **Phase 3 in progress**  
**Last updated:** June 2026

> **Doc maintenance:** At the end of each phase, update this file and [README.md](../README.md): phase status table, shipped scope, API/frontend notes, and open items.

---

## 1. Product vision

**Trial and Eclair** is a recipe **development and collection** app for mobile and desktop web. It is **not a blog**.

Users iterate on recipes with tracked versions, publish finished work, optionally attach a short story and photo, and organize recipes into shareable virtual cookbooks (developers) or a personal recipe box (home cooks). Viewers read published content without an account.

### Design principles

- **Usability first** — easy to edit, enjoyable to use; optional “notebook” customization (roadmap)
- **Mobile + desktop** — responsive; important views include recipe card and full-screen landscape on tablet
- **Not a blog** — stories attach to recipes; no scheduling, RSS, or comment threads
- **Iterative build** — ship in phases; no rush to production

### Explicit non-goals

- Blog platform (scheduling, categories, RSS, comments)
- Social network / following / recipe marketplace
- Admin dashboard for site moderation (cork board is the developer workspace)
- Usage caps on free tier (for now; hooks exist for later)
- Challenges and glossaries (roadmap)
- Voice control for hands-free development (roadmap)

---

## 2. Personas and tiers

Three personas. **Home Cook** and **Recipe Developer** are **separate roles** with different feature access — not UI modes on one account.

| | Home Cook (free) | Developer (paid) | Viewer |
|---|------------------|------------------|--------|
| **Price** | Free | Paid subscription (14-day free trial) | — |
| **Primary UI** | Recipe box (alphabetical) | Cork board + lab dashboard | Public pages |
| **Organization** | Recipe box only, A–Z | Ideas, cookbooks, version history | — |
| **Recipes** | Manual entry, import | Versioning, test sessions | Read only |
| **Publish** | No | Recipes + cookbooks + story/photo | — |
| **Fork others' recipes** | → recipe box | → development track | — |
| **Reference library** | Yes (account required) | Yes | — |

### Auth model

Two layers:

1. **Role** (`home_cook` | `developer`) — entity and route access
2. **Plan/tier** (free | paid) — feature gates (publish, versioning, cookbooks); no usage caps initially

**Upgrade:** Same account; recipe box recipes stay; user gains developer features without forced migration.

**Trial:** 14-day free developer trial. Stripe (or similar) before first paid signup in production. Schema: `trial_ends_at`, `subscription_status`.

---

## 3. User stories

### Recipe Developer (paid)

1. Log in and see a **cork board** of pinned ideas (in progress / research)
2. Save recipe ideas **without** creating a full recipe (title required, optional image)
3. Create a recipe from an idea or from scratch
4. **Save a new version** when adjusting ingredients (prior versions preserved)
5. Compare two versions side-by-side (ingredient diff + notes)
6. Publish a version; get a shareable link
7. Add optional **story and hero photo** on publish (not a blog post)
8. Group published recipes into a **cookbook** and share the cookbook link
9. Log private **journal entries** (chronological; snapshot at log time; edit/delete)
10. Record **test sessions** with notes and up to 5 photos per session

### Home Cook (free)

1. Log in and see **recipe box** sorted alphabetically
2. Add recipes manually, from URL, photo, or PDF
3. View recipes as **index-card** aesthetic in A–Z order
4. **Fork** a published recipe — editable copy, linked to original
5. Browse **reference library** (cookbooks owned, blogs, chefs, tools)
6. No categories, cookbooks, versioning, or publishing

### Viewer (no account)

1. Open a published recipe link without logging in
2. Read ingredients (left column layout), steps, story, and photo
3. Browse a published cookbook’s recipes
4. See fork lineage on public pages (unless author opts out)

---

## 4. Key product decisions (locked)

| Decision | Resolution |
|----------|------------|
| Data model | Content-type split + normalized ingredient catalog |
| Home cook organization | Recipe box only, alphabetical — no categories |
| Publishing | Developer-only; public on publish; can unpublish |
| Cookbook snapshots | Recipe frozen at add time; unpublishing recipe does not remove from published cookbook |
| Forking | Both tiers; editable copy with permanent link to original |
| Fork visibility | Lineage on public pages; author can hide via `show_forks` |
| Story | Recipe-attached only on published version |
| Reference library | Both tiers; account required; UI Phase 5+ |
| Recipe journal | Private; editable; deletable; not shareable |
| Public recipe layout | Ingredients in left column ([kraut-kopf style](http://www.kraut-kopf.de/recipe/shepherds-pie/?lang=en)) |
| Ingredients | Global canonical + per-user aliases |
| Units | Standard enum + custom units for developers |
| Measurements | Store as entered; user display preference (metric / imperial / original); no auto-conversion v1 |
| Images | 1 per idea (title required); 5 per test session; 1 hero on publish |
| URL import | Read-only shared cache by URL; fork to edit; source attribution |
| Scan import | Photo/PDF → OCR → editable draft (user-owned) |
| Equipment / substitutions | Per ingredient line + optional version-level equipment notes (Phase 4–5) |
| Free tier limits | None for now |
| Payment pricing | TBD before first paid developer signup (~Phase 3) |

---

## 5. Data model

### Architecture choice

**Option C — Content-type split** with **normalized ingredients** (not JSONB-only).

```
ingredients (catalog)          ideas (developer)
ingredient_aliases             development_recipes ──< recipe_versions
                               version_ingredient_lines ──> ingredients
                               recipe_steps, test_sessions
                               cookbooks ──< cookbook_recipes (snapshot versions)
                               journal_entries, recipe_forks

collection_recipes (home cook) recipe_box_items (alphabetical)
references, reference_links    url_recipe_imports, source_documents
users (role + plan tier)
```

### Core entities

| Entity | Purpose |
|--------|---------|
| `User` | Role, subscription, trial, measurement preference, `show_forks` |
| `Ingredient` / `IngredientAlias` | Global catalog + per-user names and default substitutions |
| `Idea` | Cork board item; title required; 1 image; category tag; status |
| `DevelopmentRecipe` | Recipe identity; slug; current + published version pointers |
| `RecipeVersion` | Immutable snapshot; story, hero image, equipment notes |
| `VersionIngredientLine` | Quantity, unit or custom_unit, prep/substitution notes |
| `TestSession` / `TestSessionPhoto` | Bake log; up to 5 photos |
| `JournalEntry` | Private dev timeline with optional version snapshot |
| `Cookbook` / `CookbookRecipe` | Published collection; frozen snapshot per entry |
| `RecipeFork` | Lineage when forking published recipes |
| `CollectionRecipe` / `RecipeBoxItem` | Home cook single-version recipes; A–Z box |
| `Reference` / `ReferenceLink` | Research shelf |
| `UrlRecipeImport` | Deduped read-only URL cache |
| `SourceDocument` | Photo/PDF import provenance |

Legacy C# models in `recipes/c# modeling/` informed naming and relationships.

---

## 6. Import and safety

### URL import

1. User submits URL → server fetches (rate-limited, sanitized)
2. Parse → store in `url_recipe_imports` (deduped by normalized URL)
3. User sees read-only view + “Save to box” / “Rework”
4. Same URL = same cached recipe for all users

**Safety:** User-initiated only; strip unsafe HTML; always show attribution; never publish URL import directly — must fork first; respect robots.txt.

### Scan import

Photo/PDF → OCR → editable draft owned by user. No shared cache.

### Forking

| Action | Who | Result |
|--------|-----|--------|
| Save to box | Home cook | `collection_recipe` in recipe box |
| Rework | Developer | `development_recipe` + v1 with full versioning |

Original never modified. UI: “Based on [Title] by [Author]”.

---

## 7. Reference library

Personal **research shelf** — not recipes, not cookbooks, not a blog reader.

Examples: cookbooks you own, blogs you follow, pastry chefs, articles/tools (Kitchn Baking School, etc.).

- **Access:** Home cook and developer (account required)
- **UI:** Phase 5+ (schema and seed data in Phase 0)
- **Optional links** to ideas or recipe versions (“inspired by…”)

---

## 8. AI (roadmap)

Architecture supports an **agent context layer** — structured data queried via tools, not raw HTML:

- Ingredient ratios across versions
- Test session outcomes
- Reference citations
- Pattern matching across published corpus

Phase 5+: Python sidecar with tools like `get_version_diff`, `scale_recipe`, `suggest_substitution`.

---

## 9. Tech stack

| Layer | Choice |
|-------|--------|
| Backend | Django REST + Python |
| Frontend | React / TypeScript PWA |
| Database | Postgres (SQLite local dev) |
| Media | S3 / Cloudflare R2 (local `media/` in dev) |
| Auth | Session cookies + role permissions; Stripe later |
| Jobs | Celery or Django-Q for URL fetch + OCR (Phase 4+) |

---

## 10. Phased roadmap

| Phase | Scope | Status |
|-------|--------|--------|
| **0** | Full schema, seed export, README | **Complete** |
| **1** | Developer API: auth, ideas, recipes, versions, ingredient lines | **Complete** |
| **2** | Publish + public viewer + React PWA shell | **Complete** |
| **3** | Version diff, cookbooks, home cook tier, journal, reference UI, trial/subscription | **In progress** |
| **4** | URL/scan import, equipment notes, fork buttons on public pages | Planned |
| **5** | PWA offline depth, AI tools, challenges/glossaries | Planned |

**MVP (first shippable product):** Phases 0 + 1 + 2 — **complete**. A developer can iterate, publish, and share; a viewer can read published recipes at `/r/{slug}`. Home cook tier and cookbooks are Phase 3+.

### Shipped per phase

**Phase 1 — Developer API**

- Session auth: register, login, logout, `me` (role, trial, subscription fields)
- Ideas CRUD (developer-only, owner-scoped)
- Development recipes: create → v1, edit current version, `save-new-version`, ingredient lines
- Writes locked to `current_version` only

**Phase 2 — Publish + viewer**

- `POST /api/v1/recipes/{id}/publish/` — optional `version_id`, `slug`, `story`, `hero_image`
- `POST /api/v1/recipes/{id}/unpublish/` — hides public page; keeps `published_version` for cookbook snapshots
- `GET /api/v1/public/recipes/{slug}/` — no auth; ingredients, steps, story, hero, fork lineage
- React PWA (`frontend/`): Vite + React Router, public page at `/r/:slug`, ingredients-left layout
- Fork lineage on public pages respects author `show_forks`

**Phase 3 — in progress**

- `GET /api/v1/recipes/{id}/compare-versions/?left=&right=` — ingredient + field diff between two versions
- `GET/POST/PATCH/DELETE /api/v1/journal/` — private journal entries; filter by `?recipe=`
- Cookbooks API + `GET /api/v1/public/cookbooks/{slug}/`; PWA `/c/:slug` — frozen `snapshot_version` per entry
- Home cook recipe box: `/api/v1/recipe-box/` — `CollectionRecipe` + A–Z `RecipeBoxItem`; any authenticated user
- Reference library: `/api/v1/references/` + `/links/` to ideas or recipe versions (developer)
- **Remaining:** trial/subscription enforcement hooks, developer UI

**Not yet shipped:** developer UI (cork board, lab), version diff UI, cookbooks, home cook recipe box, journal UI, test sessions UI, reference library UI, fork buttons on public pages, R2 media in production.

---

## 11. Seed data mapping

| Source | Maps to |
|--------|---------|
| WIPWIP tabs | `ideas` + category tags |
| Post ideas sheet | `ideas` + story candidates |
| Cookbooks / Blogs / Chefs tabs | `references` |
| `recipedump.md` | Dev recipe + versions + test sessions |
| `.docx` recipes | Dev or collection recipe after extraction |
| Restaurant/story notes | Stories on published versions |

Export command: `python manage.py export_recipe_seed` → `seed/data/`

---

## 12. Open items

| Item | When to decide |
|------|----------------|
| Payment pricing | Before first paid developer signup (~Phase 3) |
| Home cook photo limit | Phase 3 (likely 1) |
| Free tier usage caps | When needed; schema supports plan gates |
| Voice control | Roadmap |

---

## Appendix: Cork board scope

The cork board **is** the developer workspace:

- Pinned ideas (title + 1 image)
- Quick capture
- Status: researching / testing / ready to publish
- Filter by category tag (WIPWIP taxonomy)
- Links to active recipes and recent test sessions

No separate admin dashboard required for v1.
